from rest_framework import serializers
from api.models.data.customers import Customer
from api.serializers.data.base import DataRootSerializer

class CustomerSerializer(DataRootSerializer):
    total_budget = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    total_remaining = serializers.ReadOnlyField()
    afn_totals = serializers.SerializerMethodField()
    usd_totals = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email', 'address', 'status', 'total_budget', 'total_paid', 'total_remaining', 'afn_totals', 'usd_totals', 'created_at', 'updated_at']
    
    def get_afn_totals(self, obj):
        return obj.get_currency_totals('AFN')
    
    def get_usd_totals(self, obj):
        return obj.get_currency_totals('USD')