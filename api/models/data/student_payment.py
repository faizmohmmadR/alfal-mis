from django.db import models
from django.utils import timezone
from api.models.data.base import BaseModel
from api.models.data.student import Student
from api.models.data.choices import CURRENCY_CHOICES, DEFAULT_CURRENCY


class PaymentCategory(models.Model):
    """Categories for student payments"""
    CATEGORY_TYPES = [
        ('registration', 'Registration Fee'),
        ('monthly', 'Monthly Fee'),
        ('multi_month', 'Multi-Month Package'),
        ('transport', 'Transportation Fee'),
        ('other', 'Other Fee'),
    ]
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='other')
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.amount} {self.currency}"


class StudentPayment(BaseModel):
    """Student payment tracking"""
    PAYMENT_STATUSES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    category = models.ForeignKey(
        PaymentCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    payment_date = models.DateField(default=timezone.now)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUSES, default='pending')
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Receipt
    receipt = models.FileField(upload_to='student_payments/receipts/', blank=True, null=True)
    
    class Meta:
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['student', 'payment_date']),
            models.Index(fields=['payment_status']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.amount} ({self.payment_status})"
    
    def save(self, *args, **kwargs):
        if not self.reference_number:
            # Generate reference number
            prefix = 'PAY'
            count = StudentPayment.objects.filter(
                payment_date__year=timezone.now().year
            ).count() + 1
            self.reference_number = f"{prefix}-{timezone.now().year}-{count:06d}"
        super().save(*args, **kwargs)
    
    @property
    def is_overdue(self):
        """Check if payment is overdue"""
        if self.payment_status == 'pending':
            # Check if payment is overdue based on due date logic
            # This would be implemented based on your specific requirements
            return False
        return False
