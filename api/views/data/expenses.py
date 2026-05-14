from api.models.data.expenses import Expense, ExpenseCategory
from api.serializers.data.expenses import ExpenseSerializer, ExpenseCategorySerializer
from api.views.data.base import DataRootViewSet

class ExpenseCategoryViewSet(DataRootViewSet):
    queryset = ExpenseCategory.objects.all().order_by("-id")
    serializer_class = ExpenseCategorySerializer
    filterset_fields = []
    search_fields = ["name"]

class ExpenseViewSet(DataRootViewSet):
    queryset = Expense.objects.all().order_by("-id")
    serializer_class = ExpenseSerializer
    filterset_fields = ["category", "user"]
    search_fields = ["description", "receipt"]