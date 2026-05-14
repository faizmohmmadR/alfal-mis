from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.http import HttpResponse
from decimal import Decimal
from api.models.data.customers import Customer
from api.serializers.data.customers import CustomerSerializer
from api.views.data.base import DataRootViewSet

class CustomerViewSet(DataRootViewSet):
    queryset = Customer.objects.all().order_by('-id')
    serializer_class = CustomerSerializer
    filterset_fields = []
    search_fields = ['name', 'phone', 'email']