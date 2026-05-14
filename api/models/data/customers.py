from django.db import models
from django.db.models import Sum
from api.models.data.base import BaseModel

class Customer(BaseModel):
    """Customer model for contracts and transactions"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return self.name
    
    def get_currency_totals(self, currency):
        """Calculate totals for a specific currency"""
        from api.models.data.projects import ProjectPayment
        
        budget = self.projects.filter(currency=currency).aggregate(total=Sum('budget'))['total'] or 0
        paid = ProjectPayment.objects.filter(project__customer=self, currency=currency).aggregate(total=Sum('amount'))['total'] or 0
        remaining = budget - paid
        
        return {
            'budget': float(budget),
            'paid': float(paid),
            'remaining': float(remaining)
        }
    
    @property
    def total_budget(self):
        """Calculate total budget from all projects"""
        return self.projects.aggregate(total=Sum('budget'))['total'] or 0
    
    @property
    def total_paid(self):
        """Calculate total paid amount from all project payments"""
        from api.models.data.projects import ProjectPayment
        return ProjectPayment.objects.filter(project__customer=self).aggregate(total=Sum('amount'))['total'] or 0
    
    @property
    def total_remaining(self):
        """Calculate remaining amount"""
        return self.total_budget - self.total_paid