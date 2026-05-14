from django.core.management.base import BaseCommand
from api.models.data.permissions import Permission


class Command(BaseCommand):
    help = 'Create default permissions for the system'

    def handle(self, *args, **options):
        permissions = [
            # User management permissions
            {'name': 'View Users', 'codename': 'view_users', 'module': 'users', 'description': 'Can view user accounts'},
            {'name': 'Add Users', 'codename': 'add_users', 'module': 'users', 'description': 'Can create new users'},
            {'name': 'Edit Users', 'codename': 'edit_users', 'module': 'users', 'description': 'Can edit user accounts'},
            {'name': 'Delete Users', 'codename': 'delete_users', 'module': 'users', 'description': 'Can delete user accounts'},
            
            # Unit permissions
            {'name': 'View Units', 'codename': 'view_units', 'module': 'units', 'description': 'Can view measurement units'},
            {'name': 'Add Units', 'codename': 'add_units', 'module': 'units', 'description': 'Can create new units'},
            {'name': 'Edit Units', 'codename': 'edit_units', 'module': 'units', 'description': 'Can edit existing units'},
            {'name': 'Delete Units', 'codename': 'delete_units', 'module': 'units', 'description': 'Can delete units'},
            
            # Customer permissions
            {'name': 'View Customers', 'codename': 'view_customers', 'module': 'customers', 'description': 'Can view customers'},
            {'name': 'Add Customers', 'codename': 'add_customers', 'module': 'customers', 'description': 'Can create new customers'},
            {'name': 'Edit Customers', 'codename': 'edit_customers', 'module': 'customers', 'description': 'Can edit customer information'},
            {'name': 'Delete Customers', 'codename': 'delete_customers', 'module': 'customers', 'description': 'Can delete customers'},
            
            # Project permissions
            {'name': 'View Projects', 'codename': 'view_projects', 'module': 'projects', 'description': 'Can view projects'},
            {'name': 'Add Projects', 'codename': 'add_projects', 'module': 'projects', 'description': 'Can create new projects'},
            {'name': 'Edit Projects', 'codename': 'edit_projects', 'module': 'projects', 'description': 'Can edit project information'},
            {'name': 'Delete Projects', 'codename': 'delete_projects', 'module': 'projects', 'description': 'Can delete projects'},
            {'name': 'View Project Payments', 'codename': 'view_project_payments', 'module': 'projects', 'description': 'Can view project payments'},
            {'name': 'Add Project Payments', 'codename': 'add_project_payments', 'module': 'projects', 'description': 'Can add project payments'},
            {'name': 'Edit Project Payments', 'codename': 'edit_project_payments', 'module': 'projects', 'description': 'Can edit project payments'},
            {'name': 'Delete Project Payments', 'codename': 'delete_project_payments', 'module': 'projects', 'description': 'Can delete project payments'},
            
            # Employee permissions
            {'name': 'View Employees', 'codename': 'view_employees', 'module': 'employees', 'description': 'Can view employee records'},
            {'name': 'Add Employees', 'codename': 'add_employees', 'module': 'employees', 'description': 'Can create new employees'},
            {'name': 'Edit Employees', 'codename': 'edit_employees', 'module': 'employees', 'description': 'Can edit employee information'},
            {'name': 'Delete Employees', 'codename': 'delete_employees', 'module': 'employees', 'description': 'Can delete employees'},
            
            # Payroll permissions
            {'name': 'View Payroll', 'codename': 'view_payroll', 'module': 'payroll', 'description': 'Can view payroll records'},
            {'name': 'Add Payroll', 'codename': 'add_payroll', 'module': 'payroll', 'description': 'Can create payroll records'},
            {'name': 'Edit Payroll', 'codename': 'edit_payroll', 'module': 'payroll', 'description': 'Can edit payroll records'},
            {'name': 'Delete Payroll', 'codename': 'delete_payroll', 'module': 'payroll', 'description': 'Can delete payroll records'},
            {'name': 'Process Payroll', 'codename': 'process_payroll', 'module': 'payroll', 'description': 'Can process payroll'},
            
            # Advance permissions
            {'name': 'View Advances', 'codename': 'view_advances', 'module': 'advances', 'description': 'Can view advance payments'},
            {'name': 'Add Advances', 'codename': 'add_advances', 'module': 'advances', 'description': 'Can create advance payments'},
            {'name': 'Edit Advances', 'codename': 'edit_advances', 'module': 'advances', 'description': 'Can edit advance payments'},
            {'name': 'Delete Advances', 'codename': 'delete_advances', 'module': 'advances', 'description': 'Can delete advance payments'},
            {'name': 'Approve Advances', 'codename': 'approve_advances', 'module': 'advances', 'description': 'Can approve advance requests'},
            
            # Expense Category permissions
            {'name': 'View Expense Categories', 'codename': 'view_expense_categories', 'module': 'expenses', 'description': 'Can view expense categories'},
            {'name': 'Add Expense Categories', 'codename': 'add_expense_categories', 'module': 'expenses', 'description': 'Can create expense categories'},
            {'name': 'Edit Expense Categories', 'codename': 'edit_expense_categories', 'module': 'expenses', 'description': 'Can edit expense categories'},
            {'name': 'Delete Expense Categories', 'codename': 'delete_expense_categories', 'module': 'expenses', 'description': 'Can delete expense categories'},
            
            # Expense permissions
            {'name': 'View Expenses', 'codename': 'view_expenses', 'module': 'expenses', 'description': 'Can view expense records'},
            {'name': 'Add Expenses', 'codename': 'add_expenses', 'module': 'expenses', 'description': 'Can create expense records'},
            {'name': 'Edit Expenses', 'codename': 'edit_expenses', 'module': 'expenses', 'description': 'Can edit expense records'},
            {'name': 'Delete Expenses', 'codename': 'delete_expenses', 'module': 'expenses', 'description': 'Can delete expense records'},
            
            # Reports permissions
            {'name': 'View Reports', 'codename': 'view_reports', 'module': 'reports', 'description': 'Can view financial reports'},
            {'name': 'Export Reports', 'codename': 'export_reports', 'module': 'reports', 'description': 'Can export reports to Excel/PDF'},
            {'name': 'View Financial Dashboard', 'codename': 'view_financial_dashboard', 'module': 'reports', 'description': 'Can view financial dashboard'},
            
            # Activity Log permissions
            {'name': 'View Activity Logs', 'codename': 'view_activity_logs', 'module': 'logs', 'description': 'Can view system activity logs'},
            {'name': 'Delete Activity Logs', 'codename': 'delete_activity_logs', 'module': 'logs', 'description': 'Can delete activity logs'},
            
            # Currency permissions
            {'name': 'View Currencies', 'codename': 'view_currencies', 'module': 'currencies', 'description': 'Can view currency settings'},
            {'name': 'Add Currencies', 'codename': 'add_currencies', 'module': 'currencies', 'description': 'Can create new currencies'},
            {'name': 'Edit Currencies', 'codename': 'edit_currencies', 'module': 'currencies', 'description': 'Can edit currency settings'},
            {'name': 'Delete Currencies', 'codename': 'delete_currencies', 'module': 'currencies', 'description': 'Can delete currencies'},
            
            # Dashboard permissions
            {'name': 'View Dashboard', 'codename': 'view_dashboard', 'module': 'dashboard', 'description': 'Can view main dashboard'},
            
            # Settings permissions
            {'name': 'View Settings', 'codename': 'view_settings', 'module': 'settings', 'description': 'Can view system settings'},
            {'name': 'Edit Settings', 'codename': 'edit_settings', 'module': 'settings', 'description': 'Can modify system settings'},
            {'name': 'System Configuration', 'codename': 'system_config', 'module': 'settings', 'description': 'Can configure system settings'},
            {'name': 'Backup System', 'codename': 'backup_system', 'module': 'settings', 'description': 'Can create system backups'},
            
            # Permission management
            {'name': 'View Permissions', 'codename': 'view_permissions', 'module': 'permissions', 'description': 'Can view user permissions'},
            {'name': 'Edit Permissions', 'codename': 'edit_permissions', 'module': 'permissions', 'description': 'Can modify user permissions'},
            
            # User password management
            {'name': 'Change User Passwords', 'codename': 'change_user_passwords', 'module': 'users', 'description': 'Can change other users passwords (admin only)'},
        ]

        created_count = 0
        for perm_data in permissions:
            permission, created = Permission.objects.get_or_create(
                codename=perm_data['codename'],
                defaults=perm_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created permission: {permission.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} permissions')
        )