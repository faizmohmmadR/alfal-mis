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
    
    def perform_create(self, serializer):
        """Create expense and record journal entry"""
        from api.services.accounting_service import AccountingService
        expense = serializer.save(user=self.request.user)
        
        # Record journal entry for expense
        try:
            AccountingService.record_expense(
                amount=expense.amount,
                date=expense.expense_date,
                description=expense.description or expense.category.name,
                expense_category=expense.category.name,
                reference=f"EXPENSE-{expense.id}"
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create journal entry for expense {expense.id}: {e}")
    
    def perform_update(self, serializer):
        """Update expense"""
        # Note: Journal entries are not updated automatically to maintain audit trail
        serializer.save()