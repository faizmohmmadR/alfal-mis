import { Route } from 'react-router-dom';
import ExpenseList from '@/pages/expenses/ExpenseList';
import AddExpense from '@/pages/expenses/AddExpense';
import EditExpense from '@/pages/expenses/EditExpense';
import ExpenseDetails from '@/pages/expenses/ExpenseDetails';
import ExpenseCategoryList from '@/pages/expenses/ExpenseCategoryList';
import AddExpenseCategory from '@/pages/expenses/AddExpenseCategory';
import EditExpenseCategory from '@/pages/expenses/EditExpenseCategory';

export const expenseRoutes = (
  <>
    <Route path="expenses" element={<ExpenseList />} />
    <Route path="expenses/add" element={<AddExpense />} />
    <Route path="expenses/:id" element={<ExpenseDetails />} />
    <Route path="expenses/:id/edit" element={<EditExpense />} />
    <Route path="expense-categories" element={<ExpenseCategoryList />} />
    <Route path="expense-categories/add" element={<AddExpenseCategory />} />
    <Route path="expense-categories/:id/edit" element={<EditExpenseCategory />} />
  </>
);
