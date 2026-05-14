from rest_framework import serializers
from api.models.data.expenses import Expense, ExpenseCategory
from api.serializers.data.base import DataRootSerializer

class ExpenseCategorySerializer(DataRootSerializer):
    class Meta:
        model = ExpenseCategory
        fields = "__all__"

class ExpenseSerializer(DataRootSerializer):
    category_details = serializers.SerializerMethodField()

    user_details = serializers.SerializerMethodField()
    currency_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = "__all__"
    
    def get_category_details(self, obj):
        if obj.category:
            return {
                "id": obj.category.id,
                "name": obj.category.name
            }
        return None
    

    
    def get_user_details(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "fullname": f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip(),
                "username": obj.user.username,
                "email": obj.user.email
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