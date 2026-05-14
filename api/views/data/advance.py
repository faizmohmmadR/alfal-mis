from api.models.data.advance import Advance
from api.serializers.data.advance import AdvanceSerializer
from api.views.data.base import DataRootViewSet

class AdvanceViewSet(DataRootViewSet):
    queryset = Advance.objects.all().order_by("-id")
    serializer_class = AdvanceSerializer
    filterset_fields = ["employee", "year", "month"]
    search_fields = ["employee__user__first_name", "employee__user__last_name", "reason"]