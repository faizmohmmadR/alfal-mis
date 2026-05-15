from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from api.models.data.student_payment import StudentPayment, PaymentCategory
from api.serializers.data.student_payment import StudentPaymentSerializer, PaymentCategorySerializer
from api.views.data.base import DataRootViewSet
from decimal import Decimal


class PaymentCategoryViewSet(DataRootViewSet):
    queryset = PaymentCategory.objects.all().order_by('name')
    serializer_class = PaymentCategorySerializer
    filterset_fields = ['category_type', 'is_active']
    search_fields = ['name', 'description']


class StudentPaymentViewSet(DataRootViewSet):
    queryset = StudentPayment.objects.all().order_by('-payment_date')
    serializer_class = StudentPaymentSerializer
    filterset_fields = ['student', 'category', 'payment_status', 'payment_date']
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
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
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
