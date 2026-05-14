from django.utils import timezone
from django.db import models
from api.models.data.base import BaseModel
from api.models.data.choices import CURRENCY_CHOICES, DEFAULT_CURRENCY
from django.contrib.auth import get_user_model

User = get_user_model()

class ExpenseCategory(BaseModel):
    """Category model for organizing expenses"""
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.name    
    
    
    
class Expense(BaseModel):
    """Expense model for tracking company expenses"""
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField(default=timezone.now)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    receipt = models.FileField(upload_to='expenses/receipts/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    

    def __str__(self):
        currency_info = f" {dict(CURRENCY_CHOICES).get(self.currency, self.currency)}" if self.currency else ""
        return f"{self.category.name} - {self.amount}{currency_info} ({self.expense_date})"
    

