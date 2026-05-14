from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from api.models.data.employee import Employee
from api.serializers.data.employee import EmployeeSerializer
from api.views.data.base import DataRootViewSet
from decimal import Decimal
from datetime import datetime
from calendar import month_name

class EmployeeViewSet(DataRootViewSet):
    queryset = Employee.objects.all().order_by("-id")
    serializer_class = EmployeeSerializer
    filterset_fields = ["is_active"]
    search_fields = ["full_name", "phone", "position"]
    
    def list(self, request, *args, **kwargs):
        """Override list to add financial summary with month/year from query params"""
        # Get month and year from query params, default to current
        now = datetime.now()
        month = request.query_params.get('month', month_name[now.month].lower())
        year = int(request.query_params.get('year', now.year))
        
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            
            # Add financial summary for each employee
            for item in data:
                employee = Employee.objects.get(id=item['id'])
                
                total_salary_paid = employee.payrolls.filter(
                    month=month, year=year
                ).aggregate(total=Sum('salary'))['total'] or Decimal('0.00')
                
                total_advances_paid = employee.advances.filter(
                    month=month, year=year
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
                
                monthly_salary = employee.salary or Decimal('0.00')
                remaining_amount = monthly_salary - total_salary_paid - total_advances_paid
                
                item['financial_summary'] = {
                    'total_salary_paid': float(total_salary_paid),
                    'total_advances_paid': float(total_advances_paid),
                    'monthly_salary': float(monthly_salary),
                    'remaining_amount': float(remaining_amount),
                    'currency': employee.currency
                }
            
            return self.get_paginated_response(data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def financial_summary(self, request, pk=None):
        """Get employee financial summary for a specific month and year"""
        employee = self.get_object()
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        # Calculate total advances for the period
        advances_filter = {'employee': employee}
        if month:
            advances_filter['month'] = month
        if year:
            advances_filter['year'] = int(year)
        
        total_advances = employee.advances.filter(**advances_filter).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Calculate total payrolls for the period
        payrolls_filter = {'employee': employee}
        if month:
            payrolls_filter['month'] = month
        if year:
            payrolls_filter['year'] = int(year)
        
        total_payrolls = employee.payrolls.filter(**payrolls_filter).aggregate(
            total=Sum('salary')
        )['total'] or Decimal('0.00')
        
        # Calculate totals
        monthly_salary = employee.salary or Decimal('0.00')
        total_paid = total_advances + total_payrolls
        remaining_amount = monthly_salary - total_paid
        
        return Response({
            'total_salary': float(monthly_salary),
            'advanced_paid': float(total_advances),
            'payroll_paid': float(total_payrolls),
            'overall_paid': float(total_paid),
            'remaining_amount': float(remaining_amount),
            'currency': {
                'code': employee.currency or 'USD',
            },
            'month': month,
            'year': year
        })