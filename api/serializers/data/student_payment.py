from rest_framework import serializers
from api.models.data.student_payment import StudentPayment, PaymentCategory
from api.serializers.data.base import DataRootSerializer


class PaymentCategorySerializer(DataRootSerializer):
    class Meta:
        model = PaymentCategory
        fields = ['id', 'name', 'category_type', 'description', 'amount', 'currency', 'is_active', 'created_at', 'updated_at']


class StudentPaymentSerializer(DataRootSerializer):
    student_details = serializers.SerializerMethodField()
    category_details = serializers.SerializerMethodField()
    currency_details = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentPayment
        fields = [
            'id', 'student', 'category', 'amount', 'currency', 'payment_date', 
            'payment_status', 'reference_number', 'description', 'receipt',
            'student_details', 'category_details', 'currency_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['reference_number', 'currency_details']
    
    def get_student_details(self, obj):
        if obj.student:
            return {
                'id': obj.student.id,
                'full_name': obj.student.full_name,
                'registration_number': obj.student.registration_number,
                'phone': obj.student.student_phone
            }
        return None
    
    def get_category_details(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'category_type': obj.category.category_type,
                'amount': float(obj.category.amount)
            }
        return None
    
    def get_currency_details(self, obj):
        from api.models.data.choices import CURRENCY_CHOICES
        if obj.currency:
            currency_name = dict(CURRENCY_CHOICES).get(obj.currency, obj.currency)
            return {
                'code': obj.currency,
                'name': currency_name
            }
        return None
    
    def validate(self, attrs):
        # Validate payment amount
        amount = attrs.get('amount')
        if amount and amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Payment amount must be greater than zero'
            })
        
        return attrs
