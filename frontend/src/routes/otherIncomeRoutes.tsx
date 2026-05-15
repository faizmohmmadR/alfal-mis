import { Route } from 'react-router-dom';
import OtherIncomeList from '@/pages/other-income/OtherIncomeList';
import AddOtherIncome from '@/pages/other-income/AddOtherIncome';
import EditOtherIncome from '@/pages/other-income/EditOtherIncome';
import IncomeCategoryList from '@/pages/other-income/IncomeCategoryList';
import AddIncomeCategory from '@/pages/other-income/AddIncomeCategory';
import EditIncomeCategory from '@/pages/other-income/EditIncomeCategory';

export const otherIncomeRoutes = (
  <>
    {/* Other Incomes */}
    <Route path="other-incomes" element={<OtherIncomeList />} />
    <Route path="other-incomes/add" element={<AddOtherIncome />} />
    <Route path="other-incomes/:id/edit" element={<EditOtherIncome />} />
    
    {/* Income Categories */}
    <Route path="income-categories" element={<IncomeCategoryList />} />
    <Route path="income-categories/add" element={<AddIncomeCategory />} />
    <Route path="income-categories/:id/edit" element={<EditIncomeCategory />} />
  </>
);
