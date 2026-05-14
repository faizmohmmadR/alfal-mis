from rest_framework import serializers
from api.models.data.employee import Employee
from api.serializers.data.base import DataRootSerializer

class EmployeeSerializer(DataRootSerializer):
    currency_details = serializers.SerializerMethodField(read_only=True)
    financial_summary = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'full_name', 'phone', 'address', 'position', 'salary', 'currency', 
                  'is_active', 'created_at', 'updated_at', 'currency_details', 'financial_summary']
    
    def get_currency_details(self, obj):
        from api.models.data.choices import CURRENCY_CHOICES
        if obj.currency:
            currency_name = dict(CURRENCY_CHOICES).get(obj.currency, obj.currency)
            return {
                "code": obj.currency,
                "name": currency_name
            }
        return None
    
    def get_financial_summary(self, obj):
        summary = obj.get_financial_summary()
        return {
            'total_salary_paid': float(summary.get('total_salary_paid', 0)),
            'total_advances_paid': float(summary.get('total_advances_paid', 0)),
            'monthly_salary': float(summary.get('monthly_salary', 0)),
            'currency': summary.get('currency')
        }
    
    def validate(self, attrs):
        return attrs
    
    def create(self, validated_data):
        employee = Employee.objects.create(**validated_data)
        return employee
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance