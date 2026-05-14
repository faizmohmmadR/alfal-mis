from api.models.data.payroll import Payroll
from api.serializers.data.payroll import PayrollSerializer
from api.views.data.base import DataRootViewSet

class PayrollViewSet(DataRootViewSet):
    queryset = Payroll.objects.all().order_by("-id")
    serializer_class = PayrollSerializer
    filterset_fields = ["employee", "year", "month"]
    search_fields = ["employee__user__first_name", "employee__user__last_name"]