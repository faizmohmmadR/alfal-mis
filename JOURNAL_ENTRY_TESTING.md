# Journal Entry Testing Guide

## Overview
This document explains how to test the automatic journal entry creation system.

## Prerequisites
1. Django environment set up
2. Database migrations run
3. Chart of Accounts initialized

## Setup Steps

### 1. Initialize Chart of Accounts
Run the following command to create accounts for both AFN and USD currencies:

```bash
python manage.py init_chart_of_accounts
```

This will create:
- Asset accounts (Cash, Bank, Receivables, etc.)
- Liability accounts (Payables, Loans, etc.)
- Equity accounts (Capital, Retained Earnings)
- Income accounts (Student Fees, Rental, Other Income)
- Expense accounts (Salaries, Utilities, etc.)

### 2. Run Tests
Execute the test script to verify journal entry creation:

```bash
python test_journal_entries.py
```

This will test:
- Student Payment journal entries
- Expense journal entries
- Payroll journal entries
- Advance journal entries
- Other Income journal entries
- Shop Rental Payment journal entries

## How It Works

### Automatic Journal Entry Creation
When you create a financial record, the system automatically creates journal entries through Django signals:

1. **Student Payment** - Creates entry when `payment_status='completed'`
2. **Expense** - Creates entry immediately on creation
3. **Payroll** - Creates entry immediately on creation
4. **Advance** - Creates entry immediately on creation
5. **Other Income** - Creates entry immediately on creation
6. **Shop Rental Payment** - Creates entry immediately on creation

### Journal Entry Structure
Each transaction follows double-entry bookkeeping:
- **Debit** = Asset increase or Expense
- **Credit** = Liability/Equity increase or Income

Example for Student Payment (AFN):
```
Debit: Cash (1000_AFN)        1000 AFN
Credit: Student Fees (4000_AFN) 1000 AFN
```

Example for Expense (AFN):
```
Debit: Office Supplies (5400_AFN)  500 AFN
Credit: Cash (1000_AFN)            500 AFN
```

Example for Payroll (AFN):
```
Debit: Salaries (5000_AFN)    15000 AFN
Credit: Cash (1000_AFN)       15000 AFN
```

## Testing Results

The test script will show:
- ✓ PASSED - Journal entry was created correctly
- ✗ FAILED - Journal entry was not created

## Troubleshooting

### No Journal Entries Created
1. Check if signals are loaded in `api/apps.py`
2. Verify `post_save` signal handlers in `api/signals/__init__.py`
3. Check Django logs for errors

### Account Not Found
1. Run `python manage.py init_chart_of_accounts`
2. Verify accounts exist in database
3. Check account codes match expected format

### Currency Issues
The system supports both AFN and USD. Make sure:
1. Records have correct currency set
2. Accounts exist for that currency (e.g., `1000_AFN`, `1000_USD`)

## Manual Testing

You can also test manually through the Django shell:

```bash
python manage.py shell
```

```python
from api.models.data.student_payment import StudentPayment
from api.models.data.accounting import Transaction

# Create a payment
payment = StudentPayment.objects.create(
    student_id=1,
    amount=1000,
    currency='AFN',
    payment_date='2026-01-15',
    payment_status='completed'
)

# Check if journal entry was created
transactions = Transaction.objects.filter(reference=payment.reference_number)
print(f"Transactions found: {transactions.count()}")
```

## Files Involved

### Models
- `api/models/data/student_payment.py`
- `api/models/data/expenses.py`
- `api/models/data/payroll.py`
- `api/models/data/advance.py`
- `api/models/data/other_income.py`
- `api/models/data/shop_rental_payment.py`

### Services
- `api/services/accounting_service.py`

### Signals
- `api/signals/__init__.py`

### Management Commands
- `api/management/commands/init_chart_of_accounts.py`

### Tests
- `test_journal_entries.py`
