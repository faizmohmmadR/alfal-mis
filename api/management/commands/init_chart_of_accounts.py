from django.core.management.base import BaseCommand
from django.db import transaction
from api.models.data.accounting import AccountCategory, Account, FiscalYear
from api.models.data.choices import CURRENCY_CHOICES
from datetime import date


class Command(BaseCommand):
    help = 'Initialize the Chart of Accounts with standard accounts for AFN and USD currencies'
    
    def handle(self, *args, **options):
        self.stdout.write('Initializing Chart of Accounts for AFN and USD...')
        
        with transaction.atomic():
            # Create Account Categories
            categories = self._create_categories()
            
            # Create Chart of Accounts for AFN
            self._create_accounts(categories, 'AFN')
            
            # Create Chart of Accounts for USD
            self._create_accounts(categories, 'USD')
            
            # Create current fiscal year
            self._create_fiscal_year()
        
        self.stdout.write(
            self.style.SUCCESS('Chart of Accounts initialized successfully for AFN and USD')
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
                self.stdout.write(f'Created category: {category.name}')
        
        return categories
    
    def _create_accounts(self, categories, currency):
        """Create standard chart of accounts for specific currency"""
        currency_name = dict(CURRENCY_CHOICES).get(currency, currency)
        self.stdout.write(f'\nCreating accounts for {currency} ({currency_name})...')
        
        accounts_data = [
            # Assets (1xxx)
            {'name': f'Cash - {currency}', 'code': f'1000_{currency}', 'category': categories['1'], 'is_detail': True},
            {'name': f'Bank Accounts - {currency}', 'code': f'1100_{currency}', 'category': categories['1'], 'is_detail': True},
            {'name': f'Accounts Receivable - {currency}', 'code': f'1200_{currency}', 'category': categories['1'], 'is_detail': True},
            {'name': f'Employee Advances - {currency}', 'code': f'1210_{currency}', 'category': categories['1'], 'is_detail': True},
            {'name': f'Inventory - {currency}', 'code': f'1300_{currency}', 'category': categories['1'], 'is_detail': True},
            {'name': f'Prepaid Expenses - {currency}', 'code': f'1400_{currency}', 'category': categories['1'], 'is_detail': True},
            {'name': f'Fixed Assets - {currency}', 'code': f'1500_{currency}', 'category': categories['1'], 'is_detail': True},
            
            # Liabilities (2xxx)
            {'name': f'Accounts Payable - {currency}', 'code': f'2000_{currency}', 'category': categories['2'], 'is_detail': True},
            {'name': f'Accrued Expenses - {currency}', 'code': f'2100_{currency}', 'category': categories['2'], 'is_detail': True},
            {'name': f'Short-term Loans - {currency}', 'code': f'2200_{currency}', 'category': categories['2'], 'is_detail': True},
            {'name': f'Long-term Loans - {currency}', 'code': f'2300_{currency}', 'category': categories['2'], 'is_detail': True},
            {'name': f'Customer Deposits - {currency}', 'code': f'2400_{currency}', 'category': categories['2'], 'is_detail': True},
            
            # Equity (3xxx)
            {'name': f"Owner's Capital - {currency}", 'code': f'3000_{currency}', 'category': categories['3'], 'is_detail': True},
            {'name': f'Retained Earnings - {currency}', 'code': f'3100_{currency}', 'category': categories['3'], 'is_detail': True},
            {'name': f'Current Year Earnings - {currency}', 'code': f'3200_{currency}', 'category': categories['3'], 'is_detail': True},
            
            # Income (4xxx)
            {'name': f'Student Fees Revenue - {currency}', 'code': f'4000_{currency}', 'category': categories['4'], 'is_detail': True},
            {'name': f'Rental Income - {currency}', 'code': f'4100_{currency}', 'category': categories['4'], 'is_detail': True},
            {'name': f'Other Income - {currency}', 'code': f'4300_{currency}', 'category': categories['4'], 'is_detail': True},
            {'name': f'Service Income - {currency}', 'code': f'4400_{currency}', 'category': categories['4'], 'is_detail': True},
            {'name': f'Donations - {currency}', 'code': f'4500_{currency}', 'category': categories['4'], 'is_detail': True},
            {'name': f'Discounts Given - {currency}', 'code': f'4900_{currency}', 'category': categories['4'], 'is_detail': True},
            
            # Expenses (5xxx)
            {'name': f'Salaries and Wages - {currency}', 'code': f'5000_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Employee Benefits - {currency}', 'code': f'5100_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Rent Expense - {currency}', 'code': f'5200_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Utilities - {currency}', 'code': f'5300_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Office Supplies - {currency}', 'code': f'5400_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Transportation - {currency}', 'code': f'5500_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Maintenance and Repairs - {currency}', 'code': f'5600_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Insurance - {currency}', 'code': f'5700_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Professional Fees - {currency}', 'code': f'5800_{currency}', 'category': categories['5'], 'is_detail': True},
            {'name': f'Miscellaneous Expenses - {currency}', 'code': f'5900_{currency}', 'category': categories['5'], 'is_detail': True},
        ]
        
        created_count = 0
        for acc_data in accounts_data:
            account, created = Account.objects.get_or_create(
                code=acc_data['code'],
                defaults=acc_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {account.code} - {account.name}')
        
        self.stdout.write(f'Created {created_count} accounts for {currency}')
    
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
            self.stdout.write(f'Created fiscal year: {fiscal_year.name}')
        else:
            self.stdout.write(f'Fiscal year already exists: {fiscal_year.name}')
