from django.db import models
from django.utils import timezone
from api.models.data.base import BaseModel
from api.models.data.choices import CURRENCY_CHOICES, DEFAULT_CURRENCY


class ClassLevel(models.Model):
    """Class levels for students from 1 to 12"""

    CLASS_CHOICES = [
        ('1', 'Class 1'),
        ('2', 'Class 2'),
        ('3', 'Class 3'),
        ('4', 'Class 4'),
        ('5', 'Class 5'),
        ('6', 'Class 6'),
        ('7', 'Class 7'),
        ('8', 'Class 8'),
        ('9', 'Class 9'),
        ('10', 'Class 10'),
        ('11', 'Class 11'),
        ('12', 'Class 12'),
    ]

    level = models.CharField(max_length=2, choices=CLASS_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['level']

    def __str__(self):
        return self.name


class Student(BaseModel):
    """Student registration model"""
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('graduated', 'Graduated'),
        ('suspended', 'Suspended'),
        ('transferred', 'Transferred'),
    ]

    TRANSPORTATION_CHOICES = [
        ('school_bus', 'School Bus'),
        ('private_vehicle', 'Private Vehicle'),
        ('walking', 'Walking'),
        ('public_transport', 'Public Transport'),
    ]

    PAYMENT_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    # Personal Information
    full_name = models.CharField(max_length=200)
    father_name = models.CharField(max_length=200)
    grandfather_name = models.CharField(max_length=200, blank=True, null=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='male')
    tazkira_number = models.CharField(max_length=50, unique=True)

    # Address Information
    permanent_address = models.TextField()
    current_address = models.TextField()
    province = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    area = models.CharField(max_length=100)

    # Contact Information
    parent_phone = models.CharField(max_length=20)
    student_phone = models.CharField(max_length=20, blank=True, null=True)
    alternative_phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    # Registration Information
    registration_number = models.CharField(max_length=50, unique=True)
    registration_date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Class & Fee Information
    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        help_text='Class level the student is enrolled in'
    )
    payment_cycle = models.CharField(
        max_length=10,
        choices=PAYMENT_CYCLE_CHOICES,
        default='monthly',
        help_text='Payment frequency: monthly or yearly'
    )
    monthly_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    yearly_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=DEFAULT_CURRENCY)

    # Transportation
    transportation = models.CharField(
        max_length=20,
        choices=TRANSPORTATION_CHOICES,
        default='school_bus'
    )

    # Photo
    photo = models.ImageField(upload_to='students/photos/', blank=True, null=True)

    # Documents
    tazkira_copy = models.FileField(upload_to='students/tazkira/', blank=True, null=True)
    parent_tazkira_copy = models.FileField(upload_to='students/parent_tazkira/', blank=True, null=True)
    previous_result_card = models.FileField(upload_to='students/results/', blank=True, null=True)
    payment_receipt = models.FileField(upload_to='students/receipts/', blank=True, null=True)

    class Meta:
        ordering = ['-registration_date']
        indexes = [
            models.Index(fields=['registration_number']),
            models.Index(fields=['tazkira_number']),
            models.Index(fields=['status']),
            models.Index(fields=['class_level']),
            models.Index(fields=['payment_cycle']),
        ]

    def __str__(self):
        return f"{self.registration_number} - {self.full_name}"

    @property
    def age(self):
        """Calculate student age"""
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None

    @property
    def effective_fee(self):
        """Get the effective fee based on payment cycle"""
        if self.payment_cycle == 'yearly':
            return self.yearly_fee
        return self.monthly_fee

    def get_total_paid_for_period(self, start_date, end_date):
        """Calculate total payments made within a date range"""
        from api.models.data.student_payment import StudentPayment
        total = StudentPayment.objects.filter(
            student=self,
            payment_status='completed',
            payment_date__gte=start_date,
            payment_date__lte=end_date
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        return total

    def get_total_paid_monthly(self):
        """Calculate total completed monthly-cycle payments"""
        from api.models.data.student_payment import StudentPayment
        total = StudentPayment.objects.filter(
            student=self,
            payment_status='completed',
            payment_cycle='monthly'
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        return total

    def get_total_paid_yearly(self):
        """Calculate total completed yearly-cycle payments"""
        from api.models.data.student_payment import StudentPayment
        total = StudentPayment.objects.filter(
            student=self,
            payment_status='completed',
            payment_cycle='yearly'
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        return total

    def get_total_payments(self):
        """Calculate total completed payments made by student"""
        from api.models.data.student_payment import StudentPayment
        total = StudentPayment.objects.filter(
            student=self,
            payment_status='completed'
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        return total

    def get_remaining_balance(self):
        """Calculate remaining balance based on payment cycle

        For monthly: monthly_fee * 12 minus total completed monthly-cycle payments.
        For yearly: yearly_fee minus total completed yearly-cycle payments.
        """
        from api.models.data.student_payment import StudentPayment
        if self.payment_cycle == 'yearly':
            paid = self.get_total_paid_yearly()
            return max(self.yearly_fee - paid, 0)
        # monthly
        paid = self.get_total_paid_monthly()
        expected = float(self.monthly_fee) * 12
        return max(expected - paid, 0)

    def get_financial_summary(self):
        """Get complete financial summary for student"""
        return {
            'total_payments': float(self.get_total_payments()),
            'remaining_balance': float(self.get_remaining_balance()),
            'payment_cycle': self.payment_cycle,
            'monthly_fee': float(self.monthly_fee),
            'yearly_fee': float(self.yearly_fee),
            'currency': self.currency,
            'registration_number': self.registration_number,
            'status': self.status,
            'class_level': self.class_level.name if self.class_level else None,
        }
