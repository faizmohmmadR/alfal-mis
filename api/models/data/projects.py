from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from .base import BaseModel
from .customers import Customer
from .choices import CURRENCY_CHOICES, DEFAULT_CURRENCY

User = get_user_model()

class Project(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('on_hold', 'On Hold'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='projects')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    contract_date = models.DateField(default=timezone.now)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.customer.name}"
    
    @property
    def remaining_amount(self):
        return self.budget - self.paid_amount
    
    @property
    def payment_percentage(self):
        if self.budget > 0:
            return (self.paid_amount / self.budget) * 100
        return 0

class ProjectPayment(BaseModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=50, default='cash')
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-payment_date']
    
    def __str__(self):
        currency_display = dict(CURRENCY_CHOICES).get(self.currency, self.currency)
        return f"{self.project.title} - {self.amount} {currency_display}"