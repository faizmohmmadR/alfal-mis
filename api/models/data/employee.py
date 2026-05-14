from django.db import models
from api.models.data.base import BaseModel
from api.models.data.choices import CURRENCY_CHOICES, DEFAULT_CURRENCY


class Employee(BaseModel):
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.position or 'No Position'}"
    
    def get_total_salary_paid(self):
        """Calculate total salary paid to employee"""
        from api.models.data.payroll import Payroll
        total = Payroll.objects.filter(employee=self).aggregate(
            total=models.Sum('salary')
        )['total'] or 0
        return total
    
    def get_total_advances_paid(self):
        """Calculate total advances paid to employee"""
        from api.models.data.advance import Advance
        total = Advance.objects.filter(employee=self).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        return total
    
    def get_financial_summary(self):
        """Get complete financial summary for employee"""
        return {
            'total_salary_paid': self.get_total_salary_paid(),
            'total_advances_paid': self.get_total_advances_paid(),
            'monthly_salary': self.salary,
            'currency': self.currency
        }