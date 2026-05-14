import { Route } from 'react-router-dom';
import PayrollList from '@/pages/payroll/PayrollList';
import AddPayroll from '@/pages/payroll/AddPayroll';
import EditPayroll from '@/pages/payroll/EditPayroll';
import PayrollDetails from '@/pages/payroll/PayrollDetails';

export const payrollRoutes = (
  <>
    <Route path="payroll" element={<PayrollList />} />
    <Route path="payroll/add" element={<AddPayroll />} />
    <Route path="payroll/:id" element={<PayrollDetails />} />
    <Route path="payroll/:id/edit" element={<EditPayroll />} />
  </>
);