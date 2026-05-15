from rest_framework import serializers
from api.models.data.student import Student, StudentCategory
from api.serializers.data.base import DataRootSerializer


class StudentCategorySerializer(DataRootSerializer):
    class Meta:
        model = StudentCategory
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']


class StudentSerializer(DataRootSerializer):
    category_details = serializers.SerializerMethodField(read_only=True)
    financial_summary = serializers.SerializerMethodField(read_only=True)
    phone = serializers.CharField(source='parent_phone', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'full_name', 'father_name', 'grandfather_name', 'date_of_birth', 
            'gender', 'tazkira_number', 'permanent_address', 'current_address', 
            'province', 'district', 'area', 'parent_phone', 'student_phone', 
            'alternative_phone', 'email', 'registration_number', 'registration_date', 
            'category', 'status', 'transportation', 'photo', 'tazkira_copy', 
            'parent_tazkira_copy', 'previous_result_card', 'payment_receipt',
            'age', 'category_details', 'financial_summary', 'phone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['age', 'category_details', 'financial_summary', 'phone']
    
    def get_category_details(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'description': obj.category.description
            }
        return None
    
    def get_financial_summary(self, obj):
        summary = obj.get_financial_summary()
        return {
            'total_payments': float(summary.get('total_payments', 0)),
            'remaining_balance': float(summary.get('remaining_balance', 0)),
            'registration_number': summary.get('registration_number'),
            'status': summary.get('status')
        }
    
    def validate(self, attrs):
        # Validate registration number uniqueness
        registration_number = attrs.get('registration_number')
        instance = self.instance
        
        if registration_number:
            query = Student.objects.filter(registration_number=registration_number)
            if instance:
                query = query.exclude(id=instance.id)
            if query.exists():
                raise serializers.ValidationError({
                    'registration_number': 'This registration number already exists'
                })
        
        # Validate tazkira number uniqueness
        tazkira_number = attrs.get('tazkira_number')
        if tazkira_number:
            query = Student.objects.filter(tazkira_number=tazkira_number)
            if instance:
                query = query.exclude(id=instance.id)
            if query.exists():
                raise serializers.ValidationError({
                    'tazkira_number': 'This Tazkira number already exists'
                })
        
        return attrs
