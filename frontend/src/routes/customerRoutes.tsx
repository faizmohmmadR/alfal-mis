import { Route } from 'react-router-dom';
import { Customers } from '@/pages/customers/CustomerList';
import AddCustomer from '@/pages/customers/AddCustomer';
import EditCustomer from '@/pages/customers/EditCustomer';
import CustomerDetails from '@/pages/customers/CustomerDetails';

export const customerRoutes = (
  <>
    <Route path="customers" element={<Customers />} />
    <Route path="customers/add" element={<AddCustomer />} />
    <Route path="customers/:id" element={<CustomerDetails />} />
    <Route path="customers/:id/edit" element={<EditCustomer />} />
  </>
);