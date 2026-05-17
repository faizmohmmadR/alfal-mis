from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from api.models.data.student import Student, ClassLevel
from api.serializers.data.student import StudentSerializer, ClassLevelSerializer
from api.views.data.base import DataRootViewSet
from decimal import Decimal
from rest_framework import status as drf_status


class ClassLevelViewSet(DataRootViewSet):
    queryset = ClassLevel.objects.all().order_by('level')
    serializer_class = ClassLevelSerializer
    filterset_fields = ['is_active']
    search_fields = ['name', 'level']


class StudentViewSet(DataRootViewSet):
    queryset = Student.objects.all().order_by('-registration_date')
    serializer_class = StudentSerializer
    filterset_fields = ['status', 'gender', 'payment_cycle', 'class_level']
    search_fields = [
        'full_name', 'father_name', 'grandfather_name',
        'registration_number', 'tazkira_number', 'phone'
    ]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # Filter by class_level
        class_level = self.request.query_params.get('class_level')
        if class_level:
            queryset = queryset.filter(class_level_id=class_level)

        # Filter by payment_cycle
        payment_cycle = self.request.query_params.get('payment_cycle')
        if payment_cycle:
            queryset = queryset.filter(payment_cycle=payment_cycle)

        return queryset

    @action(detail=True, methods=['get'])
    def financial_summary(self, request, pk=None):
        """Get student financial summary"""
        student = self.get_object()

        total_payments = student.payments.filter(
            payment_status='completed'
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        return Response({
            'total_payments': float(total_payments),
            'remaining_balance': float(student.get_remaining_balance()),
            'payment_cycle': student.payment_cycle,
            'monthly_fee': float(student.monthly_fee),
            'yearly_fee': float(student.yearly_fee),
            'currency': student.currency,
            'registration_number': student.registration_number,
            'status': student.status,
            'class_level': student.class_level.name if student.class_level else None,
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get student statistics"""
        total_students = Student.objects.count()
        active_students = Student.objects.filter(status='active').count()
        inactive_students = Student.objects.filter(status='inactive').count()
        graduated_students = Student.objects.filter(status='graduated').count()

        # Students by status
        students_by_status = Student.objects.values('status').annotate(
            count=Count('id')
        )

        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'inactive_students': inactive_students,
            'graduated_students': graduated_students,
            'students_by_status': list(students_by_status)
        })

    @action(detail=False, methods=['post'])
    def bulk_change_class(self, request):
        """Bulk update class_level for multiple students"""
        student_ids = request.data.get('student_ids', [])
        class_level_id = request.data.get('class_level')

        if not student_ids or not isinstance(student_ids, list) or len(student_ids) == 0:
            return Response(
                {'error': 'student_ids must be a non-empty list'},
                status=drf_status.HTTP_400_BAD_REQUEST
            )

        if not class_level_id:
            return Response(
                {'error': 'class_level is required'},
                status=drf_status.HTTP_400_BAD_REQUEST
            )

        # Validate class level exists
        try:
            class_level = ClassLevel.objects.get(id=class_level_id)
        except ClassLevel.DoesNotExist:
            return Response(
                {'error': 'Class level not found'},
                status=drf_status.HTTP_404_NOT_FOUND
            )

        # Fetch and update students
        students = Student.objects.filter(id__in=student_ids)
        updated_count = students.update(class_level_id=class_level_id)

        # Return updated students
        updated_students = Student.objects.filter(id__in=student_ids)
        serializer = StudentSerializer(updated_students, many=True)

        return Response({
            'updated_count': updated_count,
            'class_level': ClassLevelSerializer(class_level).data,
            'students': serializer.data,
        })
