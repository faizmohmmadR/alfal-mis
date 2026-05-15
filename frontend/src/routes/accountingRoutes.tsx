import { Route } from 'react-router-dom';
import AccountList from '@/pages/accounting/AccountList';
import AddAccount from '@/pages/accounting/AddAccount';
import EditAccount from '@/pages/accounting/EditAccount';
import AccountDetails from '@/pages/accounting/AccountDetails';
import AccountCategoryList from '@/pages/accounting/AccountCategoryList';
import AddAccountCategory from '@/pages/accounting/AddAccountCategory';
import EditAccountCategory from '@/pages/accounting/EditAccountCategory';
import AccountCategoryDetails from '@/pages/accounting/AccountCategoryDetails';
import TransactionList from '@/pages/accounting/TransactionList';
import AddTransaction from '@/pages/accounting/AddTransaction';
import EditTransaction from '@/pages/accounting/EditTransaction';
import TransactionDetails from '@/pages/accounting/TransactionDetails';
import FiscalYearList from '@/pages/accounting/FiscalYearList';
import AddFiscalYear from '@/pages/accounting/AddFiscalYear';
import EditFiscalYear from '@/pages/accounting/EditFiscalYear';
import FiscalYearDetails from '@/pages/accounting/FiscalYearDetails';
import JournalEntryList from '@/pages/accounting/JournalEntryList';

export const accountingRoutes = (
  <>
    <Route path="accounts" element={<AccountList />} />
    <Route path="accounts/add" element={<AddAccount />} />
    <Route path="accounts/:id" element={<AccountDetails />} />
    <Route path="accounts/:id/edit" element={<EditAccount />} />
    
    <Route path="categories" element={<AccountCategoryList />} />
    <Route path="categories/add" element={<AddAccountCategory />} />
    <Route path="categories/:id" element={<AccountCategoryDetails />} />
    <Route path="categories/:id/edit" element={<EditAccountCategory />} />
    
    <Route path="transactions" element={<TransactionList />} />
    <Route path="transactions/add" element={<AddTransaction />} />
    <Route path="transactions/:id" element={<TransactionDetails />} />
    <Route path="transactions/:id/edit" element={<EditTransaction />} />
    
    <Route path="fiscal-years" element={<FiscalYearList />} />
    <Route path="fiscal-years/add" element={<AddFiscalYear />} />
    <Route path="fiscal-years/:id" element={<FiscalYearDetails />} />
    <Route path="fiscal-years/:id/edit" element={<EditFiscalYear />} />
    
    <Route path="journal-entries" element={<JournalEntryList />} />
  </>
);