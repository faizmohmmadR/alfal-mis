from api.models.data.payroll import Payroll
from api.serializers.data.payroll import PayrollSerializer
from api.views.data.base import DataRootViewSet

class PayrollViewSet(DataRootViewSet):
    queryset = Payroll.objects.all().order_by("-id")
    serializer_class = PayrollSerializer
    filterset_fields = ["employee", "year", "month"]
    search_fields = ["employee__user__first_name", "employee__user__last_name"]
    
    def perform_create(self, serializer):
        """Create payroll and record journal entry"""
        from api.services.accounting_service import AccountingService
        payroll = serializer.save()
        
        # Record journal entry for payroll
        try:
            AccountingService.record_payroll(
                employee_name=payroll.employee.full_name,
                amount=payroll.salary,
                date=payroll.payment_date,
                reference=f"PAYROLL-{payroll.id}"
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create journal entry for payroll {payroll.id}: {e}")