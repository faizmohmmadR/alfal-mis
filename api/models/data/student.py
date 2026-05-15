from django.db import models
from django.utils import timezone
from api.models.data.base import BaseModel
from api.models.data.choices import CURRENCY_CHOICES, DEFAULT_CURRENCY


class StudentCategory(models.Model):
    """Category for organizing students (e.g., Regular, Special, Scholarship)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
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
    category = models.ForeignKey(
        StudentCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='students'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
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
    
    def get_total_payments(self):
        """Calculate total payments made by student"""
        from api.models.data.student_payment import StudentPayment
        total = StudentPayment.objects.filter(student=self).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        return total
    
    def get_remaining_balance(self):
        """Calculate remaining balance for student"""
        # Get total registration fees
        from api.models.data.student_payment import StudentPayment
        total_paid = self.get_total_payments()
        
        # Calculate total fees based on registration
        # This would be calculated based on the specific payment plan
        return 0  # Placeholder - implement based on your fee structure
    
    def get_financial_summary(self):
        """Get complete financial summary for student"""
        return {
            'total_payments': float(self.get_total_payments()),
            'remaining_balance': float(self.get_remaining_balance()),
            'registration_number': self.registration_number,
            'status': self.status
        }
