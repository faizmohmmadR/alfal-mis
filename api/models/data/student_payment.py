from django.db import models
from django.utils import timezone
from api.models.data.base import BaseModel
from api.models.data.student import Student
from api.models.data.choices import CURRENCY_CHOICES, DEFAULT_CURRENCY


class StudentPayment(BaseModel):
    """Student payment tracking"""
    PAYMENT_STATUSES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)
    payment_date = models.DateField(default=timezone.now)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUSES, default='pending')
    payment_cycle = models.CharField(
        max_length=10,
        choices=PAYMENT_CYCLE_CHOICES,
        default='monthly',
        help_text='Whether this payment is monthly or yearly'
    )
    # Payment period
    period_year = models.CharField(max_length=4, blank=True, null=True, help_text='Year this payment covers, e.g. 2026')
    period_month = models.CharField(max_length=2, blank=True, null=True, help_text='Month number (1-12) this payment covers')
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Receipt
    receipt = models.FileField(upload_to='student_payments/receipts/', blank=True, null=True)

    class Meta:
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['student', 'payment_date']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['payment_cycle']),
            models.Index(fields=['period_year', 'period_month']),
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
        # Auto-populate payment_cycle from student if not set
        if self.student_id and not self.payment_cycle:
            self.payment_cycle = self.student.payment_cycle
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if payment is overdue"""
        if self.payment_status == 'pending':
            return False
        return False
