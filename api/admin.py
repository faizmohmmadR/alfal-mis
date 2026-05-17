from django.contrib import admin
from api.models.data.expenses import Expense, ExpenseCategory
from api.models.data.employee import Employee
from api.models.data.payroll import Payroll
from api.models.data.advance import Advance
from api.models.data.activity_log import ActivityLog
from api.models.data.student import Student, ClassLevel
from api.models.data.student_payment import StudentPayment


@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ['level', 'name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'level']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'full_name', 'class_level', 'payment_cycle', 'monthly_fee', 'yearly_fee', 'status']
    list_filter = ['status', 'class_level', 'payment_cycle']
    search_fields = ['full_name', 'father_name', 'registration_number', 'tazkira_number']
    readonly_fields = ['created_at', 'updated_at', 'registration_date']


@admin.register(StudentPayment)
class StudentPaymentAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'student', 'amount', 'payment_cycle', 'payment_status', 'payment_date']
    list_filter = ['payment_status', 'payment_cycle', 'payment_date']
    search_fields = ['reference_number', 'student__full_name', 'description']
    readonly_fields = ['reference_number', 'created_at', 'updated_at']


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
