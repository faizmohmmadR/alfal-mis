from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from api.models.data.student_payment import StudentPayment
from api.models.data.student import Student
from api.serializers.data.student_payment import StudentPaymentSerializer
from api.views.data.base import DataRootViewSet
from decimal import Decimal


class StudentPaymentViewSet(DataRootViewSet):
    queryset = StudentPayment.objects.all().order_by('-payment_date')
    serializer_class = StudentPaymentSerializer
    filterset_fields = ['student', 'payment_status', 'payment_date']
    search_fields = [
        'student__full_name', 'student__registration_number',
        'reference_number', 'description'
    ]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by student
        student = self.request.query_params.get('student')
        if student:
            queryset = queryset.filter(student_id=student)

        # Filter by payment_cycle
        payment_cycle = self.request.query_params.get('payment_cycle')
        if payment_cycle:
            queryset = queryset.filter(payment_cycle=payment_cycle)

        # Filter by status
        status = self.request.query_params.get('payment_status')
        if status:
            queryset = queryset.filter(payment_status=status)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        """Create student payment - journal entry created automatically by signal"""
        serializer.save()

    def perform_update(self, serializer):
        """Update student payment"""
        # Note: Journal entries are not updated automatically to maintain audit trail
        serializer.save()

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Get daily payment summary"""
        date = request.query_params.get('date', timezone.now().date().isoformat())

        summary = StudentPayment.objects.filter(
            payment_date=date
        ).aggregate(
            total_amount=Sum('amount'),
            count=Count('id')
        )

        return Response({
            'date': date,
            'total_amount': float(summary['total_amount'] or 0),
            'payment_count': summary['count'] or 0
        })

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly payment summary"""
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month')

        queryset = StudentPayment.objects.filter(payment_date__year=year)

        if month:
            queryset = queryset.filter(payment_date__month=month)

        summary = queryset.aggregate(
            total_amount=Sum('amount'),
            count=Count('id')
        )

        return Response({
            'year': year,
            'month': month,
            'total_amount': float(summary['total_amount'] or 0),
            'payment_count': summary['count'] or 0
        })

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Mark payment as completed"""
        payment = self.get_object()
        payment.payment_status = 'completed'
        payment.save()

        return Response({
            'message': 'Payment marked as completed',
            'payment_status': payment.payment_status
        })

    @action(detail=True, methods=['post'])
    def mark_as_refunded(self, request, pk=None):
        """Mark payment as refunded"""
        payment = self.get_object()
        payment.payment_status = 'refunded'
        payment.save()

        return Response({
            'message': 'Payment marked as refunded',
            'payment_status': payment.payment_status
        })

    @action(detail=False, methods=['get'])
    def financial_info(self, request):
        """Get financial info for a student based on month/year"""
        student_id = request.query_params.get('student')
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        
        if not student_id:
            return Response({'error': 'student parameter is required'}, status=400)
        
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404)
        
        # Ensure month is zero-padded for consistent querying
        month_str = str(month).zfill(2)
        year_str = str(year)
        
        # Get payments for the specified month - check both padded and non-padded formats
        monthly_payments = StudentPayment.objects.filter(
            student=student,
            period_year=year_str,
            payment_status='completed',
            payment_cycle='monthly'
        ).filter(
            Q(period_month=month_str) | Q(period_month=str(month))
        ).aggregate(total_paid=Sum('amount'))['total_paid'] or Decimal('0')
        
        # Calculate yearly payments if payment cycle is yearly
        yearly_payments = StudentPayment.objects.filter(
            student=student,
            period_year=year_str,
            payment_status='completed',
            payment_cycle='yearly'
        ).aggregate(total_paid=Sum('amount'))['total_paid'] or Decimal('0')
        
        # Determine fee and payments based on payment cycle
        if student.payment_cycle == 'yearly':
            total_fee = student.yearly_fee
            paid_amount = yearly_payments
        else:
            total_fee = student.monthly_fee
            paid_amount = monthly_payments
        
        remaining = total_fee - paid_amount
        
        return Response({
            'student_id': student.id,
            'student_name': student.full_name,
            'currency': student.currency,
            'payment_cycle': student.payment_cycle,
            'monthly_fee': float(student.monthly_fee),
            'yearly_fee': float(student.yearly_fee),
            'period': {
                'month': int(month),
                'year': int(year)
            },
            'total_amount': float(total_fee),
            'paid_amount': float(paid_amount),
            'remaining_amount': float(remaining),
            'is_paid': paid_amount >= total_fee,
            'payment_percentage': float((paid_amount / total_fee * 100) if total_fee > 0 else 0)
        })
