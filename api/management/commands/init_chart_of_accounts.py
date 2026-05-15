from django.core.management.base import BaseCommand
from django.db import transaction
from api.models.data.accounting import AccountCategory, Account, FiscalYear
from datetime import date


class Command(BaseCommand):
    help = 'Initialize the Chart of Accounts with standard accounts'
    
    def handle(self, *args, **options):
        self.stdout.info('Initializing Chart of Accounts...')
        
        with transaction.atomic():
            # Create Account Categories
            categories = self._create_categories()
            
            # Create Chart of Accounts
            self._create_accounts(categories)
            
            # Create current fiscal year
            self._create_fiscal_year()
        
        self.stdout.info(
            self.style.SUCCESS('Chart of Accounts initialized successfully')
        )
    
    def _create_categories(self):
        """Create account categories"""
        categories_data = [
            {'name': 'Assets', 'code': '1', 'account_type': 'asset', 'description': 'Asset accounts'},
            {'name': 'Liabilities', 'code': '2', 'account_type': 'liability', 'description': 'Liability accounts'},
            {'name': 'Equity', 'code': '3', 'account_type': 'equity', 'description': 'Equity accounts'},
            {'name': 'Income', 'code': '4', 'account_type': 'income', 'description': 'Income/Revenue accounts'},
            {'name': 'Expenses', 'code': '5', 'account_type': 'expense', 'description': 'Expense accounts'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = AccountCategory.objects.get_or_create(
                code=cat_data['code'],
                defaults=cat_data
            )
            categories[cat_data['code']] = category
            if created:
                self.stdout.info(f'Created category: {category.name}')
        
        return categories
    
    def _create_accounts(self, categories):
        """Create standard chart of accounts"""
        accounts_data = [
            # Assets (1xxx)
            {'name': 'Cash', 'code': '1000', 'category': categories['1'], 'is_detail': True},
            {'name': 'Bank Accounts', 'code': '1100', 'category': categories['1'], 'is_detail': True},
            {'name': 'Accounts Receivable', 'code': '1200', 'category': categories['1'], 'is_detail': True},
            {'name': 'Employee Advances', 'code': '1210', 'category': categories['1'], 'is_detail': True},
            {'name': 'Inventory', 'code': '1300', 'category': categories['1'], 'is_detail': True},
            {'name': 'Prepaid Expenses', 'code': '1400', 'category': categories['1'], 'is_detail': True},
            {'name': 'Fixed Assets', 'code': '1500', 'category': categories['1'], 'is_detail': True},
            
            # Liabilities (2xxx)
            {'name': 'Accounts Payable', 'code': '2000', 'category': categories['2'], 'is_detail': True},
            {'name': 'Accrued Expenses', 'code': '2100', 'category': categories['2'], 'is_detail': True},
            {'name': 'Short-term Loans', 'code': '2200', 'category': categories['2'], 'is_detail': True},
            {'name': 'Long-term Loans', 'code': '2300', 'category': categories['2'], 'is_detail': True},
            {'name': 'Customer Deposits', 'code': '2400', 'category': categories['2'], 'is_detail': True},
            
            # Equity (3xxx)
            {'name': 'Owner\'s Capital', 'code': '3000', 'category': categories['3'], 'is_detail': True},
            {'name': 'Retained Earnings', 'code': '3100', 'category': categories['3'], 'is_detail': True},
            {'name': 'Current Year Earnings', 'code': '3200', 'category': categories['3'], 'is_detail': True},
            
            # Income (4xxx)
            {'name': 'Student Fees Revenue', 'code': '4000', 'category': categories['4'], 'is_detail': True},
            {'name': 'Rental Income', 'code': '4100', 'category': categories['4'], 'is_detail': True},
            {'name': 'Project Revenue', 'code': '4200', 'category': categories['4'], 'is_detail': True},
            {'name': 'Other Income', 'code': '4300', 'category': categories['4'], 'is_detail': True},
            {'name': 'Service Income', 'code': '4400', 'category': categories['4'], 'is_detail': True},
            {'name': 'Donations', 'code': '4500', 'category': categories['4'], 'is_detail': True},
            {'name': 'Discounts Given', 'code': '4900', 'category': categories['4'], 'is_detail': True},
            
            # Expenses (5xxx)
            {'name': 'Salaries and Wages', 'code': '5000', 'category': categories['5'], 'is_detail': True},
            {'name': 'Employee Benefits', 'code': '5100', 'category': categories['5'], 'is_detail': True},
            {'name': 'Rent Expense', 'code': '5200', 'category': categories['5'], 'is_detail': True},
            {'name': 'Utilities', 'code': '5300', 'category': categories['5'], 'is_detail': True},
            {'name': 'Office Supplies', 'code': '5400', 'category': categories['5'], 'is_detail': True},
            {'name': 'Transportation', 'code': '5500', 'category': categories['5'], 'is_detail': True},
            {'name': 'Maintenance and Repairs', 'code': '5600', 'category': categories['5'], 'is_detail': True},
            {'name': 'Insurance', 'code': '5700', 'category': categories['5'], 'is_detail': True},
            {'name': 'Professional Fees', 'code': '5800', 'category': categories['5'], 'is_detail': True},
            {'name': 'Miscellaneous Expenses', 'code': '5900', 'category': categories['5'], 'is_detail': True},
        ]
        
        created_count = 0
        for acc_data in accounts_data:
            account, created = Account.objects.get_or_create(
                code=acc_data['code'],
                defaults=acc_data
            )
            if created:
                created_count += 1
                self.stdout.info(f'Created account: {account.code} - {account.name}')
        
        self.stdout.info(f'Created {created_count} accounts')
    
    def _create_fiscal_year(self):
        """Create current fiscal year"""
        current_year = date.today().year
        
        fiscal_year, created = FiscalYear.objects.get_or_create(
            name=f'FY {current_year}',
            defaults={
                'start_date': date(current_year, 1, 1),
                'end_date': date(current_year, 12, 31),
                'is_closed': False
            }
        )
        
        if created:
            self.stdout.info(f'Created fiscal year: {fiscal_year.name}')
        else:
            self.stdout.info(f'Fiscal year already exists: {fiscal_year.name}')
