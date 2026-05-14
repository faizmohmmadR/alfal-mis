import { Route } from 'react-router-dom';
import { UserList } from '@/pages/users/UserList';
import AddUser from '@/pages/users/AddUser';
import EditUser from '@/pages/users/EditUser';
import { UserDetails } from '@/pages/users/UserDetails';
import { UserPermissions } from '@/pages/users/UserPermissions';

export const userRoutes = (
  <>
    <Route path="users" element={<UserList />} />
    <Route path="users/add" element={<AddUser />} />
    <Route path="users/:id" element={<UserDetails />} />
    <Route path="users/:id/edit" element={<EditUser />} />
    <Route path="users/:id/permissions" element={<UserPermissions />} />
  </>
);