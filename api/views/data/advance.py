from api.models.data.advance import Advance
from api.serializers.data.advance import AdvanceSerializer
from api.views.data.base import DataRootViewSet

class AdvanceViewSet(DataRootViewSet):
    queryset = Advance.objects.all().order_by("-id")
    serializer_class = AdvanceSerializer
    filterset_fields = ["employee", "year", "month"]
    search_fields = ["employee__user__first_name", "employee__user__last_name", "reason"]
    
    def perform_create(self, serializer):
        """Create advance and record journal entry"""
        from api.services.accounting_service import AccountingService
        advance = serializer.save()
        
        # Record journal entry for advance
        try:
            AccountingService.record_advance(
                employee_name=advance.employee.full_name,
                amount=advance.amount,
                date=advance.payment_date,
                reference=f"ADVANCE-{advance.id}"
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create journal entry for advance {advance.id}: {e}")