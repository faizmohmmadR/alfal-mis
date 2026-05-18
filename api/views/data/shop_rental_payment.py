from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from api.models.data.shop_rental_payment import ShopRentalPayment
from api.models.data.shop_rental import ShopRental
from api.serializers.data.shop_rental_payment import ShopRentalPaymentSerializer
from api.views.data.base import DataRootViewSet
from decimal import Decimal


class ShopRentalPaymentViewSet(DataRootViewSet):
    queryset = ShopRentalPayment.objects.select_related(
        'rental__shop',
        'rental__tenant',
        'transaction'
    ).all().order_by('-payment_date')
    serializer_class = ShopRentalPaymentSerializer
    filterset_fields = ['rental', 'payment_status', 'payment_date']
    search_fields = ['reference_number', 'description']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by rental
        rental = self.request.query_params.get('rental')
        if rental:
            queryset = queryset.filter(rental_id=rental)

        # Filter by status
        status = self.request.query_params.get('payment_status')
        if status:
            queryset = queryset.filter(payment_status=status)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)

        return queryset

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Get daily rental payment summary"""
        date = request.query_params.get('date', timezone.now().date().isoformat())

        summary = ShopRentalPayment.objects.filter(
            payment_date=date
        ).aggregate(
            total_amount=Sum('amount'),
            count=Count('id')
        )

        return Response({
            'date': date,
            'total_amount': float(summary['total_amount'] or 0),
            'payment_count': summary['count'] or 0
        })

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly rental payment summary"""
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month')

        queryset = ShopRentalPayment.objects.filter(payment_date__year=year)

        if month:
            queryset = queryset.filter(payment_date__month=month)

        summary = queryset.aggregate(
            total_amount=Sum('amount'),
            count=Count('id')
        )

        return Response({
            'year': year,
            'month': month,
            'total_amount': float(summary['total_amount'] or 0),
            'payment_count': summary['count'] or 0
        })

    @action(detail=False, methods=['get'])
    def by_rental(self, request):
        """Get rental payments grouped by rental"""
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month')

        queryset = ShopRentalPayment.objects.filter(payment_date__year=year)

        if month:
            queryset = queryset.filter(payment_date__month=month)

        payments_by_rental = queryset.values(
            'rental__shop__shop_number',
            'rental__shop__name',
            'rental__tenant__full_name'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        )

        return Response({
            'year': year,
            'month': month,
            'payments_by_rental': list(payments_by_rental)
        })

    @action(detail=False, methods=['get'])
    def rental_financial_info(self, request):
        """Get financial info for a specific rental (monthly rent, payments, remaining)"""
        rental_id = request.query_params.get('rental_id')
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        if not rental_id:
            return Response({'error': 'rental_id is required'}, status=400)

        try:
            rental = ShopRental.objects.select_related('shop', 'tenant').get(id=rental_id)
        except ShopRental.DoesNotExist:
            return Response({'error': 'Rental not found'}, status=404)

        # Get payments for the specified month
        monthly_payments = ShopRentalPayment.objects.filter(
            rental_id=rental_id,
            period_month=str(month).zfill(2),
            period_year=str(year),
            payment_status='completed'
        ).aggregate(total_paid=Sum('amount'))['total_paid'] or Decimal('0')

        # Get all payments for this rental
        all_payments = ShopRentalPayment.objects.filter(
            rental_id=rental_id,
            payment_status='completed'
        ).aggregate(total_paid=Sum('amount'))['total_paid'] or Decimal('0')

        monthly_rent = rental.monthly_rent
        remaining = monthly_rent - monthly_payments
        is_overdue = remaining > 0 and timezone.now().date() > rental.end_date

        return Response({
            'rental_id': rental.id,
            'shop': {
                'id': rental.shop.id,
                'shop_number': rental.shop.shop_number,
                'name': rental.shop.name,
            },
            'tenant': {
                'id': rental.tenant.id,
                'full_name': rental.tenant.full_name,
            },
            'currency': rental.currency,
            'monthly_rent': float(monthly_rent),
            'period': {
                'month': int(month),
                'year': int(year)
            },
            'current_month': {
                'total_paid': float(monthly_payments),
                'remaining': float(remaining),
                'is_paid': monthly_payments >= monthly_rent,
                'payment_percentage': float((monthly_payments / monthly_rent * 100) if monthly_rent > 0 else 0)
            },
            'total_paid_all_time': float(all_payments),
            'rental_period': {
                'start_date': rental.start_date.isoformat(),
                'end_date': rental.end_date.isoformat(),
                'is_active': rental.is_active,
                'is_expired': rental.is_expired
            },
            'is_overdue': is_overdue
        })

    @action(detail=False, methods=['get'])
    def tenant_financial_summary(self, request):
        """Get financial summary for all rentals of a tenant"""
        tenant_id = request.query_params.get('tenant_id')
        year = request.query_params.get('year', timezone.now().year)

        if not tenant_id:
            return Response({'error': 'tenant_id is required'}, status=400)

        rentals = ShopRental.objects.filter(
            tenant_id=tenant_id,
            rental_status='active'
        ).select_related('shop', 'tenant')

        summary = []
        for rental in rentals:
            monthly_payments = ShopRentalPayment.objects.filter(
                rental_id=rental.id,
                period_year=str(year),
                payment_status='completed'
            ).values('period_month').annotate(total=Sum('amount'))

            total_paid_year = sum(p['total'] for p in monthly_payments)

            summary.append({
                'rental_id': rental.id,
                'shop': {
                    'shop_number': rental.shop.shop_number,
                    'name': rental.shop.name,
                },
                'currency': rental.currency,
                'monthly_rent': float(rental.monthly_rent),
                'year': int(year),
                'total_paid_year': float(total_paid_year),
                'payments_by_month': [
                    {
                        'month': p['period_month'],
                        'amount': float(p['total'])
                    } for p in monthly_payments
                ]
            })

        return Response({
            'tenant_id': tenant_id,
            'rentals_summary': summary
        })
