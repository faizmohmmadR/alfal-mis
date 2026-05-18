#!/usr/bin/env python
"""
Test script to verify automatic journal entry creation
Run this script to test that journal entries are created when records are created
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from api.models.data.student import Student, ClassLevel
from api.models.data.student_payment import StudentPayment
from api.models.data.expenses import Expense, ExpenseCategory
from api.models.data.payroll import Payroll
from api.models.data.employee import Employee
from api.models.data.advance import Advance
from api.models.data.other_income import OtherIncome, IncomeCategory
from api.models.data.shop_rental import Shop, Tenant, ShopRental
from api.models.data.shop_rental_payment import ShopRentalPayment
from api.models.data.accounting import Transaction, Account


def print_section(title):
    """Print section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def test_student_payment():
    """Test student payment journal entry creation"""
    print_section("TEST 1: Student Payment Journal Entry")
    
    # Get or create a test student
    student, created = Student.objects.get_or_create(
        registration_number='TEST-001',
        defaults={
            'full_name': 'Test Student',
            'father_name': 'Test Father',
            'tazkira_number': 'TEST123',
            'date_of_birth': timezone.now().date().replace(year=2010, month=1, day=1),
            'permanent_address': 'Test Address',
            'current_address': 'Test Address',
            'province': 'Kabul',
            'district': 'Kabul',
            'area': 'Kabul',
            'parent_phone': '0780000000',
            'registration_date': timezone.now().date(),
            'status': 'active',
            'monthly_fee': Decimal('1000'),
            'yearly_fee': Decimal('12000'),
            'currency': 'AFN',
            'payment_cycle': 'monthly',
        }
    )
    
    if created:
        print(f"✓ Created test student: {student.full_name}")
    
    # Get accounts
    cash_account = Account.objects.filter(code='1000_AFN').first()
    revenue_account = Account.objects.filter(code='4000_AFN').first()
    
    if not cash_account or not revenue_account:
        print("✗ Error: Accounts not found. Run init_chart_of_accounts first.")
        return False
    
    # Create student payment
    payment = StudentPayment.objects.create(
        student=student,
        amount=Decimal('1000'),
        currency='AFN',
        payment_date=timezone.now().date(),
        payment_status='completed',
        payment_cycle='monthly',
        description='Test monthly fee payment'
    )
    
    print(f"✓ Created student payment: {payment.reference_number} - {payment.amount} {payment.currency}")
    
    # Check if journal entry was created
    transactions = Transaction.objects.filter(
        transaction_type='student_payment',
        reference=payment.reference_number
    )
    
    if transactions.exists():
        print(f"✓ Journal entry created for student payment")
        for txn in transactions:
            print(f"  Transaction: {txn.number}")
            print(f"  Entries: {txn.entries.count()}")
            for entry in txn.entries.all():
                print(f"    - {entry.account.code}: Dr {entry.debit}, Cr {entry.credit}")
        return True
    else:
        print("✗ No journal entry found for student payment")
        return False


def test_expense():
    """Test expense journal entry creation"""
    print_section("TEST 2: Expense Journal Entry")
    
    # Get or create expense category
    category, created = ExpenseCategory.objects.get_or_create(
        name='Office Supplies',
        defaults={'description': 'Office supplies and stationery'}
    )
    
    if created:
        print(f"✓ Created expense category: {category.name}")
    
    # Get accounts
    cash_account = Account.objects.filter(code='1000_AFN').first()
    expense_account = Account.objects.filter(code__startswith='5400').first()
    
    if not cash_account or not expense_account:
        print("✗ Error: Accounts not found. Run init_chart_of_accounts first.")
        return False
    
    # Create expense
    expense = Expense.objects.create(
        category=category,
        amount=Decimal('500'),
        currency='AFN',
        expense_date=timezone.now().date(),
        description='Test office supplies purchase',
        user=None
    )
    
    print(f"✓ Created expense: {expense.category.name} - {expense.amount} {expense.currency}")
    
    # Check if journal entry was created
    transactions = Transaction.objects.filter(
        transaction_type='expense',
        reference=f"EXPENSE-{expense.id}"
    )
    
    if transactions.exists():
        print(f"✓ Journal entry created for expense")
        for txn in transactions:
            print(f"  Transaction: {txn.number}")
            print(f"  Entries: {txn.entries.count()}")
            for entry in txn.entries.all():
                print(f"    - {entry.account.code}: Dr {entry.debit}, Cr {entry.credit}")
        return True
    else:
        print("✗ No journal entry found for expense")
        return False


def test_payroll():
    """Test payroll journal entry creation"""
    print_section("TEST 3: Payroll Journal Entry")
    
    # Get or create employee
    employee, created = Employee.objects.get_or_create(
        full_name='Test Employee',
        defaults={
            'phone': '0780000001',
            'position': 'Teacher',
            'salary': Decimal('15000'),
            'currency': 'AFN',
            'is_active': True
        }
    )
    
    if created:
        print(f"✓ Created employee: {employee.full_name}")
    
    # Get accounts
    cash_account = Account.objects.filter(code='1000_AFN').first()
    salary_account = Account.objects.filter(code='5000_AFN').first()
    
    if not cash_account or not salary_account:
        print("✗ Error: Accounts not found. Run init_chart_of_accounts first.")
        return False
    
    # Create payroll
    payroll = Payroll.objects.create(
        employee=employee,
        month='January',
        year=timezone.now().year,
        salary=Decimal('15000'),
        currency='AFN',
        payment_date=timezone.now().date()
    )
    
    print(f"✓ Created payroll: {payroll.employee.full_name} - {payroll.salary} {payroll.currency}")
    
    # Check if journal entry was created
    transactions = Transaction.objects.filter(
        transaction_type='payroll',
        reference=f"PAYROLL-{payroll.id}"
    )
    
    if transactions.exists():
        print(f"✓ Journal entry created for payroll")
        for txn in transactions:
            print(f"  Transaction: {txn.number}")
            print(f"  Entries: {txn.entries.count()}")
            for entry in txn.entries.all():
                print(f"    - {entry.account.code}: Dr {entry.debit}, Cr {entry.credit}")
        return True
    else:
        print("✗ No journal entry found for payroll")
        return False


def test_advance():
    """Test advance journal entry creation"""
    print_section("TEST 4: Advance Journal Entry")
    
    # Get or create employee
    employee, created = Employee.objects.get_or_create(
        full_name='Test Employee 2',
        defaults={
            'phone': '0780000002',
            'position': 'Assistant',
            'salary': Decimal('10000'),
            'currency': 'AFN',
            'is_active': True
        }
    )
    
    if created:
        print(f"✓ Created employee: {employee.full_name}")
    
    # Get accounts
    cash_account = Account.objects.filter(code='1000_AFN').first()
    advance_account = Account.objects.filter(code='1210_AFN').first()
    
    if not cash_account or not advance_account:
        print("✗ Error: Accounts not found. Run init_chart_of_accounts first.")
        return False
    
    # Create advance
    advance = Advance.objects.create(
        employee=employee,
        amount=Decimal('5000'),
        currency='AFN',
        reason='Test advance payment',
        year=timezone.now().year,
        month='January',
        payment_date=timezone.now().date()
    )
    
    print(f"✓ Created advance: {advance.employee.full_name} - {advance.amount} {advance.currency}")
    
    # Check if journal entry was created
    transactions = Transaction.objects.filter(
        transaction_type='advance',
        reference=f"ADVANCE-{advance.id}"
    )
    
    if transactions.exists():
        print(f"✓ Journal entry created for advance")
        for txn in transactions:
            print(f"  Transaction: {txn.number}")
            print(f"  Entries: {txn.entries.count()}")
            for entry in txn.entries.all():
                print(f"    - {entry.account.code}: Dr {entry.debit}, Cr {entry.credit}")
        return True
    else:
        print("✗ No journal entry found for advance")
        return False


def test_other_income():
    """Test other income journal entry creation"""
    print_section("TEST 5: Other Income Journal Entry")
    
    # Get or create income category
    category, created = IncomeCategory.objects.get_or_create(
        name='Donations',
        defaults={
            'category_type': 'miscellaneous',
            'description': 'Donation income'
        }
    )
    
    if created:
        print(f"✓ Created income category: {category.name}")
    
    # Get accounts
    cash_account = Account.objects.filter(code='1000_AFN').first()
    income_account = Account.objects.filter(code='4300_AFN').first()
    
    if not cash_account or not income_account:
        print("✗ Error: Accounts not found. Run init_chart_of_accounts first.")
        return False
    
    # Create other income
    income = OtherIncome.objects.create(
        income_category=category,
        amount=Decimal('2000'),
        currency='AFN',
        income_date=timezone.now().date(),
        source='Test Donation',
        description='Test donation income'
    )
    
    print(f"✓ Created other income: {income.income_category.name} - {income.amount} {income.currency}")
    
    # Check if journal entry was created
    transactions = Transaction.objects.filter(
        transaction_type='other_income',
        reference=f"INCOME-{income.id}"
    )
    
    if transactions.exists():
        print(f"✓ Journal entry created for other income")
        for txn in transactions:
            print(f"  Transaction: {txn.number}")
            print(f"  Entries: {txn.entries.count()}")
            for entry in txn.entries.all():
                print(f"    - {entry.account.code}: Dr {entry.debit}, Cr {entry.credit}")
        return True
    else:
        print("✗ No journal entry found for other income")
        return False


def test_shop_rental_payment():
    """Test shop rental payment journal entry creation"""
    print_section("TEST 6: Shop Rental Payment Journal Entry")
    
    # Get or create shop
    shop, created = Shop.objects.get_or_create(
        shop_number='SHOP-001',
        defaults={
            'name': 'Test Shop',
            'location': 'Test Location',
            'area': Decimal('100'),
            'monthly_rent': Decimal('5000'),
            'currency': 'AFN',
            'status': 'rented'
        }
    )
    
    if created:
        print(f"✓ Created shop: {shop.shop_number}")
    
    # Get or create tenant
    tenant, created = Tenant.objects.get_or_create(
        tazkira_number='TENANT123',
        defaults={
            'full_name': 'Test Tenant',
            'phone': '0780000003',
            'address': 'Test Address'
        }
    )
    
    if created:
        print(f"✓ Created tenant: {tenant.full_name}")
    
    # Get or create shop rental
    rental, created = ShopRental.objects.get_or_create(
        shop=shop,
        tenant=tenant,
        start_date=timezone.now().date(),
        end_date=timezone.now().date().replace(year=timezone.now().year + 1),
        defaults={
            'monthly_rent': Decimal('5000'),
            'currency': 'AFN',
            'rental_status': 'active',
            'security_deposit': Decimal('10000')
        }
    )
    
    if created:
        print(f"✓ Created shop rental: {rental.shop.shop_number} - {rental.tenant.full_name}")
    
    # Get accounts
    cash_account = Account.objects.filter(code='1000_AFN').first()
    rental_income_account = Account.objects.filter(code='4100_AFN').first()
    
    if not cash_account or not rental_income_account:
        print("✗ Error: Accounts not found. Run init_chart_of_accounts first.")
        return False
    
    # Create shop rental payment
    payment = ShopRentalPayment.objects.create(
        rental=rental,
        amount=Decimal('5000'),
        currency='AFN',
        payment_date=timezone.now().date(),
        payment_status='completed',
        description='Test monthly rent payment'
    )
    
    print(f"✓ Created shop rental payment: {payment.reference_number} - {payment.amount} {payment.currency}")
    
    # Check if journal entry was created
    transactions = Transaction.objects.filter(
        transaction_type='rental_income',
        reference=payment.reference_number
    )
    
    if transactions.exists():
        print(f"✓ Journal entry created for shop rental payment")
        for txn in transactions:
            print(f"  Transaction: {txn.number}")
            print(f"  Entries: {txn.entries.count()}")
            for entry in txn.entries.all():
                print(f"    - {entry.account.code}: Dr {entry.debit}, Cr {entry.credit}")
        return True
    else:
        print("✗ No journal entry found for shop rental payment")
        return False


def main():
    """Run all tests"""
    print_section("JOURNAL ENTRY CREATION TEST")
    print("Testing automatic journal entry creation for various financial records")
    
    results = []
    
    try:
        results.append(("Student Payment", test_student_payment()))
        results.append(("Expense", test_expense()))
        results.append(("Payroll", test_payroll()))
        results.append(("Advance", test_advance()))
        results.append(("Other Income", test_other_income()))
        results.append(("Shop Rental Payment", test_shop_rental_payment()))
    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        import traceback
        traceback.print_exc()
    
    # Print summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"  {name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! Journal entries are being created automatically.")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed. Please check the errors above.")
        return 1


if __name__ == '__main__':
    exit(main())
