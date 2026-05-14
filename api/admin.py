from django.contrib import admin
from api.models.data.customers import Customer
from api.models.data.projects import Project, ProjectPayment
from api.models.data.expenses import Expense, ExpenseCategory
from api.models.data.employee import Employee
from api.models.data.payroll import Payroll
from api.models.data.advance import Advance
from api.models.data.activity_log import ActivityLog

# Register all models with default admin configuration
admin.site.register(Customer)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'customer', 'status', 'budget', 'paid_amount', 'remaining_amount', 'created_at']
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['title', 'customer__name', 'description']
    readonly_fields = ['paid_amount', 'created_at', 'updated_at']

@admin.register(ProjectPayment)
class ProjectPaymentAdmin(admin.ModelAdmin):
    list_display = ['project', 'amount', 'payment_date', 'payment_method']
    list_filter = ['payment_method', 'payment_date']
    search_fields = ['project__title', 'reference_number']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'get_currency_info', 'expense_date', 'get_user_info']
    list_filter = ['category', 'currency', 'expense_date']
    search_fields = ['category__name', 'description', 'user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_currency_info(self, obj):
        return obj.currency if obj.currency else "-"
    get_currency_info.short_description = 'Currency'
    
    def get_user_info(self, obj):
        if obj.user:
            full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full_name if full_name else obj.user.username
        return "-"
    get_user_info.short_description = 'User'

@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    list_filter = []
    search_fields = ['name', 'description']

admin.site.register(Employee)
admin.site.register(Payroll)
admin.site.register(Advance)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'object_id', 'created_at']
    list_filter = ['action', 'model_name', 'created_at']
    search_fields = ['description', 'user__username', 'user__email']
    readonly_fields = ['user', 'action', 'model_name', 'object_id', 'description', 'ip_address', 'user_agent', 'changes', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False