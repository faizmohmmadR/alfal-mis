from rest_framework import serializers
from api.models.data.shop_rental_payment import ShopRentalPayment
from api.serializers.data.base import DataRootSerializer


class ShopRentalPaymentSerializer(DataRootSerializer):
    rental_details = serializers.SerializerMethodField()
    currency_details = serializers.SerializerMethodField()
    transaction_details = serializers.SerializerMethodField()

    class Meta:
        model = ShopRentalPayment
        fields = [
            'id', 'rental', 'amount', 'currency', 'payment_date',
            'payment_status', 'period_month', 'period_year',
            'reference_number', 'description', 'receipt', 'transaction',
            'rental_details', 'currency_details', 'transaction_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['reference_number', 'currency_details', 'transaction_details']

    def get_rental_details(self, obj):
        if obj.rental:
            return {
                'id': obj.rental.id,
                'shop_number': obj.rental.shop.shop_number if obj.rental.shop else None,
                'shop_name': obj.rental.shop.name if obj.rental.shop else None,
                'tenant_name': obj.rental.tenant.full_name if obj.rental.tenant else None,
                'monthly_rent': float(obj.rental.monthly_rent),
                'currency': obj.rental.currency,
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

    def get_transaction_details(self, obj):
        if obj.transaction:
            return {
                'id': obj.transaction.id,
                'number': obj.transaction.number,
                'is_balanced': obj.transaction.is_balanced()
            }
        return None

    def validate(self, attrs):
        amount = attrs.get('amount')
        if amount and amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Payment amount must be greater than zero'
            })
        
        # Auto-set currency from rental if not provided
        rental = attrs.get('rental')
        if rental and not attrs.get('currency'):
            attrs['currency'] = rental.currency
        
        return attrs

    def create(self, validated_data):
        # Auto-set currency from rental
        rental = validated_data.get('rental')
        if rental and not validated_data.get('currency'):
            validated_data['currency'] = rental.currency
        
        # Ensure period_month is zero-padded
        period_month = validated_data.get('period_month')
        if period_month:
            validated_data['period_month'] = str(period_month).zfill(2)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Ensure period_month is zero-padded
        period_month = validated_data.get('period_month')
        if period_month:
            validated_data['period_month'] = str(period_month).zfill(2)
        
        return super().update(instance, validated_data)
