import { Route } from 'react-router-dom';
import AdvanceList from '@/pages/advance/AdvanceList';
import AddAdvance from '@/pages/advance/AddAdvance';
import EditAdvance from '@/pages/advance/EditAdvance';
import AdvanceDetails from '@/pages/advance/AdvanceDetails';

export const advanceRoutes = (
  <>
    <Route path="advance" element={<AdvanceList />} />
    <Route path="advance/add" element={<AddAdvance />} />
    <Route path="advance/:id" element={<AdvanceDetails />} />
    <Route path="advance/:id/edit" element={<EditAdvance />} />
  </>
);