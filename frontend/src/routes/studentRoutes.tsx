import { Route } from 'react-router-dom';
import StudentList from '@/pages/students/StudentList';
import AddStudent from '@/pages/students/AddStudent';
import EditStudent from '@/pages/students/EditStudent';
import StudentDetails from '@/pages/students/StudentDetails';
import BulkChangeClassLevel from '@/pages/students/BulkChangeClassLevel';

export const studentRoutes = (
  <>
    <Route path="students" element={<StudentList />} />
    <Route path="students/add" element={<AddStudent />} />
    <Route path="students/:id" element={<StudentDetails />} />
    <Route path="students/:id/edit" element={<EditStudent />} />
    <Route path="students/bulk-change-class" element={<BulkChangeClassLevel />} />
  </>
);
