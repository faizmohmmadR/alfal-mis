from django.db import models
from django.utils import timezone
from api.models.data.base import BaseModel
from api.models.data.choices import CURRENCY_CHOICES, DEFAULT_CURRENCY


class IncomeCategory(models.Model):
    """Categories for other income"""
    CATEGORY_TYPES = [
        ('service', 'Service Income'),
        ('miscellaneous', 'Miscellaneous'),
        ('business', 'Business Income'),
        ('investment', 'Investment Income'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='other')
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class OtherIncome(BaseModel):
    """Other income tracking"""
    income_category = models.ForeignKey(
        IncomeCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='incomes'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    income_date = models.DateField(default=timezone.now)
    source = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Receipt
    receipt = models.FileField(upload_to='other_income/receipts/', blank=True, null=True)
    
    class Meta:
        ordering = ['-income_date']
        indexes = [
            models.Index(fields=['income_date']),
            models.Index(fields=['income_category']),
        ]
    
    def __str__(self):
        return f"{self.amount} - {self.income_date}"
