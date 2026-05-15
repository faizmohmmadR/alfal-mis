from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from api.models.data.accounting import Account, JournalEntry, Transaction


class AccountingService:
    """Service layer for accounting operations - ensures double-entry integrity"""
    
    @staticmethod
    @transaction.atomic
    def create_journal_entry(date, description, lines, transaction_type='journal', reference=None):
        """
        Create a balanced journal entry.
        
        Args:
            date: Transaction date
            description: Transaction description
            lines: List of dicts with 'account_id', 'debit', 'credit'
            transaction_type: Type of transaction
            reference: Optional reference number
        
        Returns:
            Transaction object
        """
        # Validate balance
        total_debit = sum(Decimal(str(line.get('debit', 0))) for line in lines)
        total_credit = sum(Decimal(str(line.get('credit', 0))) for line in lines)
        
        if abs(total_debit - total_credit) > Decimal('0.01'):
            raise ValueError(f"Transaction not balanced. Debit: {total_debit}, Credit: {total_credit}")
        
        # Create transaction
        txn = Transaction.objects.create(
            date=date,
            description=description,
            transaction_type=transaction_type,
            reference=reference
        )
        
        # Create journal entries
        for line in lines:
            account = Account.objects.get(id=line['account_id'])
            JournalEntry.objects.create(
                date=date,
                account=account,
                debit=Decimal(str(line.get('debit', 0))),
                credit=Decimal(str(line.get('credit', 0))),
                description=description,
                reference=reference,
                transaction=txn
            )
        
        return txn
    
    @staticmethod
    @transaction.atomic
    def record_student_payment(student_id, amount, date, description, reference=None):
        """Record a student payment as a journal entry"""
        cash_account = Account.objects.filter(code='1000').first()
        revenue_account = Account.objects.filter(code='4000').first()
        
        if not cash_account or not revenue_account:
            raise ValueError("Default accounts not configured. Please set up Chart of Accounts.")
        
        return AccountingService.create_journal_entry(
            date=date,
            description=f"Student Payment - {description}",
            lines=[
                {'account_id': cash_account.id, 'debit': amount, 'credit': 0},
                {'account_id': revenue_account.id, 'debit': 0, 'credit': amount}
            ],
            transaction_type='student_payment',
            reference=reference
        )
    
    @staticmethod
    @transaction.atomic
    def record_expense(amount, date, description, expense_category, reference=None):
        """Record an expense as a journal entry"""
        cash_account = Account.objects.filter(code='1000').first()
        expense_account = Account.objects.filter(
            category__account_type='expense',
            code__startswith='5'
        ).first()
        
        if not cash_account or not expense_account:
            raise ValueError("Default accounts not configured. Please set up Chart of Accounts.")
        
        return AccountingService.create_journal_entry(
            date=date,
            description=f"Expense - {expense_category}: {description}",
            lines=[
                {'account_id': expense_account.id, 'debit': amount, 'credit': 0},
                {'account_id': cash_account.id, 'debit': 0, 'credit': amount}
            ],
            transaction_type='expense',
            reference=reference
        )
    
    @staticmethod
    @transaction.atomic
    def record_payroll(employee_name, amount, date, reference=None):
        """Record payroll payment"""
        cash_account = Account.objects.filter(code='1000').first()
        salary_account = Account.objects.filter(code='5000').first()
        
        if not cash_account or not salary_account:
            raise ValueError("Default accounts not configured. Please set up Chart of Accounts.")
        
        return AccountingService.create_journal_entry(
            date=date,
            description=f"Salary Payment - {employee_name}",
            lines=[
                {'account_id': salary_account.id, 'debit': amount, 'credit': 0},
                {'account_id': cash_account.id, 'debit': 0, 'credit': amount}
            ],
            transaction_type='payroll',
            reference=reference
        )
    
    @staticmethod
    @transaction.atomic
    def record_advance(employee_name, amount, date, reference=None):
        """Record advance payment"""
        cash_account = Account.objects.filter(code='1000').first()
        advance_account = Account.objects.filter(code='1200').first()
        
        if not cash_account or not advance_account:
            raise ValueError("Default accounts not configured. Please set up Chart of Accounts.")
        
        return AccountingService.create_journal_entry(
            date=date,
            description=f"Advance Payment - {employee_name}",
            lines=[
                {'account_id': advance_account.id, 'debit': amount, 'credit': 0},
                {'account_id': cash_account.id, 'debit': 0, 'credit': amount}
            ],
            transaction_type='advance',
            reference=reference
        )
    
    @staticmethod
    @transaction.atomic
    def record_rental_income(tenant_name, amount, date, reference=None):
        """Record rental income"""
        cash_account = Account.objects.filter(code='1000').first()
        rental_income_account = Account.objects.filter(code='4100').first()
        
        if not cash_account or not rental_income_account:
            raise ValueError("Default accounts not configured. Please set up Chart of Accounts.")
        
        return AccountingService.create_journal_entry(
            date=date,
            description=f"Rental Income - {tenant_name}",
            lines=[
                {'account_id': cash_account.id, 'debit': amount, 'credit': 0},
                {'account_id': rental_income_account.id, 'debit': 0, 'credit': amount}
            ],
            transaction_type='rental_income',
            reference=reference
        )
    
    @staticmethod
    def get_trial_balance(as_of_date=None):
        """Generate trial balance report"""
        accounts = Account.objects.filter(is_active=True, is_detail=True)
        
        trial_balance = []
        total_debit = Decimal('0')
        total_credit = Decimal('0')
        
        for account in accounts:
            balance = account.get_balance()
            if balance != 0:
                debit = balance if balance > 0 and account.category.account_type in ['asset', 'expense'] else 0
                credit = abs(balance) if balance < 0 and account.category.account_type in ['asset', 'expense'] else (balance if balance > 0 and account.category.account_type in ['liability', 'equity', 'income'] else 0)
                
                trial_balance.append({
                    'code': account.code,
                    'name': account.name,
                    'type': account.category.get_account_type_display(),
                    'debit': float(debit),
                    'credit': float(credit)
                })
                
                total_debit += debit
                total_credit += credit
        
        return {
            'date': as_of_date or timezone.now().date(),
            'accounts': trial_balance,
            'total_debit': float(total_debit),
            'total_credit': float(total_credit),
            'is_balanced': abs(total_debit - total_credit) < Decimal('0.01')
        }
    
    @staticmethod
    def get_income_statement(start_date, end_date):
        """Generate income statement (Profit & Loss)"""
        income_accounts = Account.objects.filter(
            category__account_type='income',
            is_active=True
        )
        expense_accounts = Account.objects.filter(
            category__account_type='expense',
            is_active=True
        )
        
        total_income = Decimal('0')
        income_items = []
        for account in income_accounts:
            balance = account.get_balance()
            if balance != 0:
                income_items.append({
                    'code': account.code,
                    'name': account.name,
                    'amount': float(balance)
                })
                total_income += balance
        
        total_expenses = Decimal('0')
        expense_items = []
        for account in expense_accounts:
            balance = account.get_balance()
            if balance != 0:
                expense_items.append({
                    'code': account.code,
                    'name': account.name,
                    'amount': float(balance)
                })
                total_expenses += balance
        
        net_income = total_income - total_expenses
        
        return {
            'start_date': start_date,
            'end_date': end_date,
            'income': income_items,
            'total_income': float(total_income),
            'expenses': expense_items,
            'total_expenses': float(total_expenses),
            'net_income': float(net_income),
            'is_profit': net_income > 0
        }
    
    @staticmethod
    def get_balance_sheet(as_of_date=None):
        """Generate balance sheet"""
        asset_accounts = Account.objects.filter(
            category__account_type='asset',
            is_active=True
        )
        liability_accounts = Account.objects.filter(
            category__account_type='liability',
            is_active=True
        )
        equity_accounts = Account.objects.filter(
            category__account_type='equity',
            is_active=True
        )
        
        total_assets = Decimal('0')
        assets = []
        for account in asset_accounts:
            balance = account.get_balance()
            if balance != 0:
                assets.append({
                    'code': account.code,
                    'name': account.name,
                    'amount': float(balance)
                })
                total_assets += balance
        
        total_liabilities = Decimal('0')
        liabilities = []
        for account in liability_accounts:
            balance = account.get_balance()
            if balance != 0:
                liabilities.append({
                    'code': account.code,
                    'name': account.name,
                    'amount': float(balance)
                })
                total_liabilities += balance
        
        total_equity = Decimal('0')
        equity = []
        for account in equity_accounts:
            balance = account.get_balance()
            if balance != 0:
                equity.append({
                    'code': account.code,
                    'name': account.name,
                    'amount': float(balance)
                })
                total_equity += balance
        
        return {
            'date': as_of_date or timezone.now().date(),
            'assets': assets,
            'total_assets': float(total_assets),
            'liabilities': liabilities,
            'total_liabilities': float(total_liabilities),
            'equity': equity,
            'total_equity': float(total_equity),
            'total_liabilities_and_equity': float(total_liabilities + total_equity),
            'is_balanced': abs(total_assets - (total_liabilities + total_equity)) < Decimal('0.01')
        }
