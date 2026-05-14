from django.urls import path, include
from rest_framework import routers
from api.views.data.base import DataRootViewSet

# ====================== HR MANAGEMENT ======================
from api.views.data.employee import EmployeeViewSet
from api.views.data.payroll import PayrollViewSet
from api.views.data.advance import AdvanceViewSet

# ====================== PEOPLE & ORGANIZATIONS ======================
from api.views.data.customers import CustomerViewSet

# ====================== PROJECTS ======================
from api.views.data.projects import ProjectViewSet, ProjectPaymentViewSet

# ====================== EXPENSES ======================
from api.views.data.expenses import ExpenseViewSet, ExpenseCategoryViewSet

# ====================== PERMISSIONS ======================
from api.views.data.permissions import PermissionViewSet, UserPermissionViewSet

# ====================== ACTIVITY LOGS ======================
from api.views.data.activity_log import ActivityLogViewSet

# ====================== REPORTS ======================
from api.views.reports import FinancialReportView


# Create a router and register your viewsets with it
class OptionalSlashRouter(routers.DefaultRouter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trailing_slash = '/?'

router = OptionalSlashRouter()

# ====================== REGISTER ALL VIEWSETS ======================

# HR Management
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'payrolls', PayrollViewSet, basename='payroll')
router.register(r'advances', AdvanceViewSet, basename='advance')

# People & Organizations
router.register(r'customers', CustomerViewSet, basename='customer')

# Projects
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-payments', ProjectPaymentViewSet, basename='project-payment')

# Expenses
router.register(r'expense-categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'expenses', ExpenseViewSet, basename='expense')

# Permissions
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'users/(?P<user_id>[^/.]+)/permissions', UserPermissionViewSet, basename='user-permission')

# Activity Logs
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')


urlpatterns = [
    path("", include(router.urls)),
    path("reports/financial/", FinancialReportView.as_view(), name='financial-report'),
]