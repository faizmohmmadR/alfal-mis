from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from api.models.data.shop_rental import Shop, Tenant, ShopRental
from api.serializers.data.shop_rental import ShopSerializer, TenantSerializer, ShopRentalSerializer
from api.views.data.base import DataRootViewSet
from decimal import Decimal


class ShopViewSet(DataRootViewSet):
    queryset = Shop.objects.all().order_by('shop_number')
    serializer_class = ShopSerializer
    filterset_fields = ['status']
    search_fields = ['shop_number', 'name', 'location']
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get shop statistics"""
        total_shops = Shop.objects.count()
        available_shops = Shop.objects.filter(status='available').count()
        rented_shops = Shop.objects.filter(status='rented').count()
        
        # Total monthly rent
        total_monthly_rent = Shop.objects.aggregate(
            total=Sum('monthly_rent')
        )['total'] or Decimal('0.00')
        
        return Response({
            'total_shops': total_shops,
            'available_shops': available_shops,
            'rented_shops': rented_shops,
            'total_monthly_rent': float(total_monthly_rent)
        })


class TenantViewSet(DataRootViewSet):
    queryset = Tenant.objects.all().order_by('full_name')
    serializer_class = TenantSerializer
    search_fields = ['full_name', 'phone', 'email', 'tazkira_number']


class ShopRentalViewSet(DataRootViewSet):
    queryset = ShopRental.objects.all().order_by('-start_date')
    serializer_class = ShopRentalSerializer
    filterset_fields = ['shop', 'tenant', 'rental_status']
    search_fields = [
        'shop__shop_number', 'shop__name', 
        'tenant__full_name', 'tenant__phone'
    ]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by shop
        shop = self.request.query_params.get('shop')
        if shop:
            queryset = queryset.filter(shop_id=shop)
        
        # Filter by tenant
        tenant = self.request.query_params.get('tenant')
        if tenant:
            queryset = queryset.filter(tenant_id=tenant)
        
        # Filter by status
        status = self.request.query_params.get('rental_status')
        if status:
            queryset = queryset.filter(rental_status=status)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def active_rentals(self, request):
        """Get active rentals"""
        today = timezone.now().date()
        
        active_rentals = ShopRental.objects.filter(
            rental_status='active',
            start_date__lte=today,
            end_date__gte=today
        )
        
        serializer = self.get_serializer(active_rentals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_rentals(self, request):
        """Get rentals expiring soon (within 30 days)"""
        today = timezone.now().date()
        thirty_days_later = today.replace(day=today.day + 30)
        
        expiring_rentals = ShopRental.objects.filter(
            rental_status='active',
            end_date__gte=today,
            end_date__lte=thirty_days_later
        )
        
        serializer = self.get_serializer(expiring_rentals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_income(self, request):
        """Get monthly rental income"""
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month')
        
        queryset = ShopRental.objects.filter(
            start_date__year=year,
            rental_status='active'
        )
        
        if month:
            queryset = queryset.filter(start_date__month=month)
        
        total_income = queryset.aggregate(
            total=Sum('monthly_rent')
        )['total'] or Decimal('0.00')
        
        return Response({
            'year': year,
            'month': month,
            'total_monthly_income': float(total_income),
            'active_rentals_count': queryset.count()
        })
