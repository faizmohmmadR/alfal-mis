from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q
from datetime import datetime, timedelta
from api.models.data.projects import ProjectPayment, Project
from api.models.data.expenses import Expense
from api.models.data.payroll import Payroll
from api.models.data.advance import Advance


class FinancialReportView(APIView):
    """
    Financial report endpoint that returns income, expenses, and profit by currency
    Supports filtering by period (daily, weekly, monthly, yearly, custom) and customer
    """
    
    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        customer_id = request.query_params.get('customer', None)
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        
        # Calculate date range based on period
        payment_filter = self._get_payment_date_filter(period, start_date, end_date)
        expense_filter = self._get_expense_date_filter(period, start_date, end_date)
        project_date_filter = self._get_project_date_filter(period, start_date, end_date)
        
        # Project budgets (income) - filter by start_date
        project_query = Project.objects.filter(**project_date_filter)
        if customer_id:
            project_query = project_query.filter(customer_id=customer_id)
        
        budget_afn = project_query.filter(currency='AFN').aggregate(total=Sum('budget'))['total'] or 0
        budget_usd = project_query.filter(currency='USD').aggregate(total=Sum('budget'))['total'] or 0
        
        # Paid amounts from payments
        payment_query = ProjectPayment.objects.filter(**payment_filter)
        if customer_id:
            payment_query = payment_query.filter(project__customer_id=customer_id)
        
        paid_afn = payment_query.filter(currency='AFN').aggregate(total=Sum('amount'))['total'] or 0
        paid_usd = payment_query.filter(currency='USD').aggregate(total=Sum('amount'))['total'] or 0
        
        # Remaining amounts
        remaining_afn = float(budget_afn) - float(paid_afn)
        remaining_usd = float(budget_usd) - float(paid_usd)
        
        # Expenses (expense_date is DateField)
        expense_query = Expense.objects.filter(**expense_filter)
        expense_afn = expense_query.filter(currency='AFN').aggregate(total=Sum('amount'))['total'] or 0
        expense_usd = expense_query.filter(currency='USD').aggregate(total=Sum('amount'))['total'] or 0
        
        # Expense breakdown by category
        expense_by_category = []
        category_data = expense_query.values('category__name', 'currency').annotate(total=Sum('amount'))
        for item in category_data:
            expense_by_category.append({
                'category': item['category__name'],
                'currency': item['currency'],
                'amount': float(item['total'])
            })
        
        # Payroll expenses (payment_date is DateField)
        payroll_query = Payroll.objects.filter(**payment_filter)
        payroll_afn = payroll_query.filter(currency='AFN').aggregate(total=Sum('salary'))['total'] or 0
        payroll_usd = payroll_query.filter(currency='USD').aggregate(total=Sum('salary'))['total'] or 0
        
        # Advance expenses (payment_date is DateField)
        advance_query = Advance.objects.filter(**payment_filter)
        advance_afn = advance_query.filter(currency='AFN').aggregate(total=Sum('amount'))['total'] or 0
        advance_usd = advance_query.filter(currency='USD').aggregate(total=Sum('amount'))['total'] or 0
        
        # Total expenses (including payroll and advances)
        total_expense_afn = float(expense_afn) + float(payroll_afn) + float(advance_afn)
        total_expense_usd = float(expense_usd) + float(payroll_usd) + float(advance_usd)
        
        # Profit calculation (budget - expenses)
        profit_afn = float(budget_afn) - total_expense_afn
        profit_usd = float(budget_usd) - total_expense_usd
        
        return Response({
            'period': period,
            'date_range': {
                'start': payment_filter.get('payment_date__gte') or project_date_filter.get('contract_date__gte'),
                'end': payment_filter.get('payment_date__lte') or project_date_filter.get('contract_date__lte')
            },
            'income': {
                'total': {
                    'AFN': float(budget_afn),
                    'USD': float(budget_usd)
                },
                'paid': {
                    'AFN': float(paid_afn),
                    'USD': float(paid_usd)
                },
                'remaining': {
                    'AFN': remaining_afn,
                    'USD': remaining_usd
                }
            },
            'expenses': {
                'total': {
                    'AFN': total_expense_afn,
                    'USD': total_expense_usd
                },
                'breakdown': {
                    'general_expenses': {
                        'AFN': float(expense_afn),
                        'USD': float(expense_usd)
                    },
                    'payroll': {
                        'AFN': float(payroll_afn),
                        'USD': float(payroll_usd)
                    },
                    'advances': {
                        'AFN': float(advance_afn),
                        'USD': float(advance_usd)
                    }
                },
                'by_category': expense_by_category
            },
            'profit': {
                'AFN': profit_afn,
                'USD': profit_usd
            }
        }, status=status.HTTP_200_OK)
    
    def _get_payment_date_filter(self, period, start_date=None, end_date=None):
        """Calculate date filter for payment_date field"""
        today = datetime.now().date()
        
        if period == 'custom' and start_date and end_date:
            return {
                'payment_date__gte': datetime.strptime(start_date, '%Y-%m-%d').date(),
                'payment_date__lte': datetime.strptime(end_date, '%Y-%m-%d').date()
            }
        elif period == 'daily':
            return {'payment_date': today}
        elif period == 'weekly':
            week_start = today - timedelta(days=today.weekday())
            return {'payment_date__gte': week_start, 'payment_date__lte': today}
        elif period == 'monthly':
            month_start = today.replace(day=1)
            return {'payment_date__gte': month_start, 'payment_date__lte': today}
        elif period == 'yearly':
            year_start = today.replace(month=1, day=1)
            return {'payment_date__gte': year_start, 'payment_date__lte': today}
        else:
            return {}
    
    def _get_expense_date_filter(self, period, start_date=None, end_date=None):
        """Calculate date filter for expense_date field"""
        today = datetime.now().date()
        
        if period == 'custom' and start_date and end_date:
            return {
                'expense_date__gte': datetime.strptime(start_date, '%Y-%m-%d').date(),
                'expense_date__lte': datetime.strptime(end_date, '%Y-%m-%d').date()
            }
        elif period == 'daily':
            return {'expense_date': today}
        elif period == 'weekly':
            week_start = today - timedelta(days=today.weekday())
            return {'expense_date__gte': week_start, 'expense_date__lte': today}
        elif period == 'monthly':
            month_start = today.replace(day=1)
            return {'expense_date__gte': month_start, 'expense_date__lte': today}
        elif period == 'yearly':
            year_start = today.replace(month=1, day=1)
            return {'expense_date__gte': year_start, 'expense_date__lte': today}
        else:
            return {}
    
    def _get_project_date_filter(self, period, start_date=None, end_date=None):
        """Calculate date filter based on period for Project (contract_date field)"""
        today = datetime.now().date()
        
        if period == 'custom' and start_date and end_date:
            return {
                'contract_date__gte': datetime.strptime(start_date, '%Y-%m-%d').date(),
                'contract_date__lte': datetime.strptime(end_date, '%Y-%m-%d').date()
            }
        elif period == 'daily':
            return {'contract_date': today}
        elif period == 'weekly':
            week_start = today - timedelta(days=today.weekday())
            return {
                'contract_date__gte': week_start,
                'contract_date__lte': today
            }
        elif period == 'monthly':
            month_start = today.replace(day=1)
            return {
                'contract_date__gte': month_start,
                'contract_date__lte': today
            }
        elif period == 'yearly':
            year_start = today.replace(month=1, day=1)
            return {
                'contract_date__gte': year_start,
                'contract_date__lte': today
            }
        else:
            return {}
