from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from api.models.data.student import Student, StudentCategory
from api.serializers.data.student import StudentSerializer, StudentCategorySerializer
from api.views.data.base import DataRootViewSet
from decimal import Decimal


class StudentCategoryViewSet(DataRootViewSet):
    queryset = StudentCategory.objects.all().order_by('name')
    serializer_class = StudentCategorySerializer
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']


class StudentViewSet(DataRootViewSet):
    queryset = Student.objects.all().order_by('-registration_date')
    serializer_class = StudentSerializer
    filterset_fields = ['status', 'category', 'gender']
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
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def financial_summary(self, request, pk=None):
        """Get student financial summary"""
        student = self.get_object()
        
        total_payments = student.payments.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        return Response({
            'total_payments': float(total_payments),
            'remaining_balance': float(student.get_remaining_balance()),
            'registration_number': student.registration_number,
            'status': student.status
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get student statistics"""
        total_students = Student.objects.count()
        active_students = Student.objects.filter(status='active').count()
        inactive_students = Student.objects.filter(status='inactive').count()
        graduated_students = Student.objects.filter(status='graduated').count()
        
        # Students by category
        students_by_category = StudentCategory.objects.annotate(
            count=Count('students')
        ).values('name', 'count')
        
        # Students by status
        students_by_status = Student.objects.values('status').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'inactive_students': inactive_students,
            'graduated_students': graduated_students,
            'students_by_category': list(students_by_category),
            'students_by_status': list(students_by_status)
        })
