from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from decimal import Decimal
from datetime import timedelta
import random

from account.models import User
from api.models.data.employee import Employee
from api.models.data.customers import Customer
from api.models.data.advance import Advance
from api.models.data.expenses import ExpenseCategory, Expense
from api.models.data.payroll import Payroll
from api.models.data.projects import Project, ProjectPayment
from api.models.data.activity_log import ActivityLog
from api.models.data.permissions import Permission, UserPermission

fake = Faker()

class Command(BaseCommand):
    help = 'Insert 500 sample records for each model'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data insertion...'))
        
        self.clear_existing_data()
        
        users = self.create_users(500)
        employees = self.create_employees(500)
        customers = self.create_customers(500)
        expense_categories = self.create_expense_categories(50)
        expenses = self.create_expenses(500, expense_categories, users)
        advances = self.create_advances(500, employees)
        payrolls = self.create_payrolls(500, employees)
        projects = self.create_projects(500, customers)
        project_payments = self.create_project_payments(500, projects)
        permissions = self.create_permissions(50)
        user_permissions = self.create_user_permissions(500, users, permissions)
        activity_logs = self.create_activity_logs(500, users)
        
        self.stdout.write(self.style.SUCCESS(f'''
Data insertion completed!
- Users: {len(users)}
- Employees: {len(employees)}
- Customers: {len(customers)}
- Expense Categories: {len(expense_categories)}
- Expenses: {len(expenses)}
- Advances: {len(advances)}
- Payrolls: {len(payrolls)}
- Projects: {len(projects)}
- Project Payments: {len(project_payments)}
- Permissions: {len(permissions)}
- User Permissions: {len(user_permissions)}
- Activity Logs: {len(activity_logs)}
'''))

    def create_users(self, count):
        users = []
        roles = ['admin', 'staff', 'employee', 'customer']
        
        for i in range(count):
            email = f"user{i+1}@example.com"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': f"user{i+1}",
                    'first_name': fake.first_name(),
                    'last_name': fake.last_name(),
                    'role': random.choice(roles),
                    'is_active': random.choice([True, True, True, False]),
                    'address': fake.address(),
                    'phone': fake.phone_number()
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                users.append(user)
        
        self.stdout.write(f"Created {len(users)} users")
        return users

    def create_employees(self, count):
        employees = []
        positions = ['Manager', 'Supervisor', 'Engineer', 'Analyst', 'Developer', 'Designer', 'Coordinator', 'Specialist', 'Technician', 'Consultant']
        currencies = ['USD', 'AFN']
        
        for i in range(count):
            employee = Employee.objects.create(
                full_name=fake.name(),
                phone=fake.phone_number(),
                address=fake.address(),
                position=random.choice(positions),
                salary=Decimal(str(random.randint(500, 5000))),
                currency=random.choice(currencies),
                is_active=random.choice([True, True, True, False])
            )
            employees.append(employee)
        
        self.stdout.write(f"Created {len(employees)} employees")
        return employees

    def create_customers(self, count):
        customers = []
        
        for i in range(count):
            customer = Customer.objects.create(
                name=fake.company(),
                phone=fake.phone_number(),
                email=fake.company_email(),
                address=fake.address(),
                status=random.choice(['active', 'active', 'active', 'inactive'])
            )
            customers.append(customer)
        
        self.stdout.write(f"Created {len(customers)} customers")
        return customers

    def create_expense_categories(self, count):
        categories = []
        base_names = ['Office Supplies', 'Travel', 'Marketing', 'Utilities', 'Rent', 'Insurance', 'Maintenance', 'Training', 'Equipment', 'Software']
        
        for i in range(count):
            category = ExpenseCategory.objects.create(
                name=f"{random.choice(base_names)} {i+1}",
                description=fake.text(max_nb_chars=100)
            )
            categories.append(category)
        
        self.stdout.write(f"Created {len(categories)} expense categories")
        return categories

    def create_expenses(self, count, categories, users):
        expenses = []
        currencies = ['USD', 'AFN']
        
        for i in range(count):
            expense = Expense.objects.create(
                category=random.choice(categories),
                amount=Decimal(str(random.randint(50, 10000))),
                currency=random.choice(currencies),
                expense_date=fake.date_time_between(start_date='-2y', end_date='now', tzinfo=timezone.get_current_timezone()),
                description=fake.text(max_nb_chars=200),
                user=random.choice(users) if users else None
            )
            expenses.append(expense)
        
        self.stdout.write(f"Created {len(expenses)} expenses")
        return expenses

    def create_advances(self, count, employees):
        advances = []
        months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
        currencies = ['USD', 'AFN']
        
        for i in range(count):
            employee = random.choice(employees)
            advance = Advance.objects.create(
                employee=employee,
                amount=Decimal(str(random.randint(100, 2000))),
                currency=random.choice(currencies),
                reason=fake.text(max_nb_chars=100),
                year=random.choice([2023, 2024]),
                month=random.choice(months),
                payment_date=fake.date_time_between(start_date='-1y', end_date='now', tzinfo=timezone.get_current_timezone())
            )
            advances.append(advance)
        
        self.stdout.write(f"Created {len(advances)} advances")
        return advances

    def create_payrolls(self, count, employees):
        payrolls = []
        months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
        currencies = ['USD', 'AFN']
        
        for i in range(count):
            employee = random.choice(employees)
            payroll = Payroll.objects.create(
                employee=employee,
                month=random.choice(months),
                year=random.choice([2023, 2024]),
                salary=Decimal(str(random.randint(500, 5000))),
                currency=random.choice(currencies),
                payment_date=fake.date_time_between(start_date='-1y', end_date='now', tzinfo=timezone.get_current_timezone())
            )
            payrolls.append(payroll)
        
        self.stdout.write(f"Created {len(payrolls)} payrolls")
        return payrolls

    def create_projects(self, count, customers):
        projects = []
        statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold']
        currencies = ['USD', 'AFN']
        
        for i in range(count):
            budget = Decimal(str(random.randint(5000, 100000)))
            paid = Decimal(str(random.randint(0, int(budget))))
            
            project = Project.objects.create(
                title=f"{fake.catch_phrase()} Project {i+1}",
                description=fake.text(max_nb_chars=300),
                customer=random.choice(customers),
                status=random.choice(statuses),
                budget=budget,
                paid_amount=paid,
                currency=random.choice(currencies),
                start_date=fake.date_between(start_date='-2y', end_date='today'),
                end_date=fake.date_between(start_date='today', end_date='+1y')
            )
            projects.append(project)
        
        self.stdout.write(f"Created {len(projects)} projects")
        return projects

    def create_project_payments(self, count, projects):
        payments = []
        currencies = ['USD', 'AFN']
        methods = ['cash', 'bank_transfer', 'check', 'credit_card']
        
        for i in range(count):
            payment = ProjectPayment.objects.create(
                project=random.choice(projects),
                amount=Decimal(str(random.randint(500, 20000))),
                currency=random.choice(currencies),
                payment_date=fake.date_between(start_date='-1y', end_date='today'),
                payment_method=random.choice(methods),
                reference_number=f"REF-{fake.random_int(min=10000, max=99999)}",
                notes=fake.text(max_nb_chars=150)
            )
            payments.append(payment)
        
        self.stdout.write(f"Created {len(payments)} project payments")
        return payments

    def create_permissions(self, count):
        permissions = []
        modules = ['users', 'employees', 'customers', 'projects', 'expenses', 'payroll', 'reports', 'settings']
        actions = ['view', 'add', 'edit', 'delete', 'export']
        
        for i in range(count):
            module = random.choice(modules)
            action = random.choice(actions)
            codename = f"{action}_{module}_{i}"
            
            permission = Permission.objects.create(
                name=f"{action.title()} {module.title()}",
                codename=codename,
                module=module,
                description=fake.text(max_nb_chars=100)
            )
            permissions.append(permission)
        
        self.stdout.write(f"Created {len(permissions)} permissions")
        return permissions

    def create_user_permissions(self, count, users, permissions):
        user_permissions = []
        
        for i in range(count):
            user_perm, created = UserPermission.objects.get_or_create(
                user=random.choice(users),
                permission=random.choice(permissions),
                defaults={'granted': random.choice([True, True, True, False])}
            )
            if created:
                user_permissions.append(user_perm)
        
        self.stdout.write(f"Created {len(user_permissions)} user permissions")
        return user_permissions

    def create_activity_logs(self, count, users):
        logs = []
        actions = ['create', 'update', 'delete', 'view', 'export', 'login', 'logout']
        models = ['Employee', 'Customer', 'Project', 'Expense', 'Payroll', 'Advance', 'User']
        
        for i in range(count):
            log = ActivityLog.objects.create(
                user=random.choice(users),
                action=random.choice(actions),
                model_name=random.choice(models),
                object_id=random.randint(1, 500),
                description=fake.text(max_nb_chars=150),
                ip_address=fake.ipv4(),
                user_agent=fake.user_agent()
            )
            logs.append(log)
        
        self.stdout.write(f"Created {len(logs)} activity logs")
        return logs
    
    def clear_existing_data(self):
        self.stdout.write('Clearing existing data...')
        
        ActivityLog.objects.all().delete()
        UserPermission.objects.all().delete()
        Permission.objects.all().delete()
        ProjectPayment.objects.all().delete()
        Project.objects.all().delete()
        Payroll.objects.all().delete()
        Advance.objects.all().delete()
        Expense.objects.all().delete()
        ExpenseCategory.objects.all().delete()
        Customer.objects.all().delete()
        Employee.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        
        self.stdout.write('Existing data cleared')
