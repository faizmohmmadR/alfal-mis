from rest_framework import serializers
from api.models.data.projects import Project, ProjectPayment
from api.serializers.data.base import DataRootSerializer
from api.models.data.choices import CURRENCY_CHOICES

class ProjectSerializer(DataRootSerializer):
    customer_details = serializers.SerializerMethodField()
    currency_details = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    payment_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'
    
    def get_customer_details(self, obj):
        if obj.customer:
            return {
                'id': obj.customer.id,
                'name': obj.customer.name,
                'phone': obj.customer.phone,
                'email': obj.customer.email
            }
        return None
    
    def get_currency_details(self, obj):
        if obj.currency:
            currency_display = dict(CURRENCY_CHOICES).get(obj.currency, obj.currency)
            return {
                'code': obj.currency,
                'display': currency_display
            }
        return None
    
    def get_remaining_amount(self, obj):
        return obj.remaining_amount
    
    def get_payment_percentage(self, obj):
        return obj.payment_percentage

class ProjectDetailSerializer(ProjectSerializer):
    pass

class ProjectPaymentSerializer(DataRootSerializer):
    project_details = serializers.SerializerMethodField()
    currency_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectPayment
        fields = '__all__'
    
    def get_project_details(self, obj):
        if obj.project:
            return {
                'id': obj.project.id,
                'title': obj.project.title,
                'budget': obj.project.budget,
                'paid_amount': obj.project.paid_amount,
                'remaining_amount': obj.project.remaining_amount,
                'currency': obj.project.currency,
                'currency_display': dict(CURRENCY_CHOICES).get(obj.project.currency, obj.project.currency)
            }
        return None
    
    def get_currency_details(self, obj):
        if obj.currency:
            return {
                'code': obj.currency,
                'display': dict(CURRENCY_CHOICES).get(obj.currency, obj.currency)
            }
        return None
    
    def create(self, validated_data):
        payment = super().create(validated_data)
        self._update_project_paid_amount(payment.project)
        return payment
    
    def update(self, instance, validated_data):
        payment = super().update(instance, validated_data)
        self._update_project_paid_amount(payment.project)
        return payment
    
    def _update_project_paid_amount(self, project):
        from django.db.models import Sum
        total_paid = ProjectPayment.objects.filter(project=project).aggregate(Sum('amount'))['amount__sum'] or 0
        project.paid_amount = total_paid
        project.save()