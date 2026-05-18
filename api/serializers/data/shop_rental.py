from rest_framework import serializers
from api.models.data.shop_rental import Shop, Tenant, ShopRental
from api.serializers.data.base import DataRootSerializer


class ShopSerializer(DataRootSerializer):
    class Meta:
        model = Shop
        fields = [
            'id', 'shop_number', 'name', 'location', 'area', 'monthly_rent', 
            'currency', 'status', 'description', 'created_at', 'updated_at'
        ]


class TenantSerializer(DataRootSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'full_name', 'phone', 'email', 'address', 'tazkira_number', 'description', 'created_at', 'updated_at']


class ShopRentalSerializer(DataRootSerializer):
    shop_details = serializers.SerializerMethodField()
    tenant_details = serializers.SerializerMethodField()
    currency_details = serializers.SerializerMethodField()
    # Include nested shop and tenant for autocomplete getOptionLabel compatibility
    shop = serializers.SerializerMethodField()
    tenant = serializers.SerializerMethodField()
    
    class Meta:
        model = ShopRental
        fields = [
            'id', 'shop', 'tenant', 'start_date', 'end_date', 'monthly_rent', 
            'currency', 'rental_status', 'security_deposit', 'description',
            'shop_details', 'tenant_details', 'currency_details', 'is_active', 'is_expired',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['is_active', 'is_expired', 'currency_details']
    
    def get_shop(self, obj):
        if obj.shop:
            return {
                'id': obj.shop.id,
                'shop_number': obj.shop.shop_number,
                'name': obj.shop.name
            }
        return None
    
    def get_tenant(self, obj):
        if obj.tenant:
            return {
                'id': obj.tenant.id,
                'full_name': obj.tenant.full_name
            }
        return None
    
    def get_shop_details(self, obj):
        if obj.shop:
            return {
                'id': obj.shop.id,
                'shop_number': obj.shop.shop_number,
                'name': obj.shop.name,
                'location': obj.shop.location,
                'monthly_rent': float(obj.shop.monthly_rent)
            }
        return None
    
    def get_tenant_details(self, obj):
        if obj.tenant:
            return {
                'id': obj.tenant.id,
                'full_name': obj.tenant.full_name,
                'phone': obj.tenant.phone,
                'email': obj.tenant.email
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
        # Validate date range
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date'
            })
        
        return attrs
