from rest_framework import serializers
from api.models.data.advance import Advance
from api.serializers.data.base import DataRootSerializer

class AdvanceSerializer(DataRootSerializer):
    employee_details = serializers.SerializerMethodField()
    currency_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Advance
        fields = "__all__"
    
    def get_employee_details(self, obj):
        if obj.employee:
            return {
                "id": obj.employee.id,
                "full_name": obj.employee.full_name,
                "position": obj.employee.position,
                "salary": obj.employee.salary
            }
        return None
    
    def get_currency_details(self, obj):
        from api.models.data.choices import CURRENCY_CHOICES
        if obj.currency:
            currency_name = dict(CURRENCY_CHOICES).get(obj.currency, obj.currency)
            return {
                "code": obj.currency,
                "name": currency_name
            }
        return None
    
    def create(self, validated_data):
        if 'currency' not in validated_data or not validated_data['currency']:
            employee = validated_data.get('employee')
            if employee and employee.currency:
                validated_data['currency'] = employee.currency
        return super().create(validated_data)