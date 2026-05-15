import { Route } from 'react-router-dom';
import StudentList from '@/pages/students/StudentList';
import AddStudent from '@/pages/students/AddStudent';
import EditStudent from '@/pages/students/EditStudent';

export const studentRoutes = (
  <>
    <Route path="students" element={<StudentList />} />
    <Route path="students/add" element={<AddStudent />} />
    <Route path="students/:id/edit" element={<EditStudent />} />
  </>
);
