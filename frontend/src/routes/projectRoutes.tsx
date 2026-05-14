import { Route } from 'react-router-dom';
import ProjectList from '@/pages/projects/ProjectList';
import AddProject from '@/pages/projects/AddProject';
import EditProject from '@/pages/projects/EditProject';
import ProjectDetails from '@/pages/projects/ProjectDetails';
import ProjectPaymentList from '@/pages/projects/ProjectPaymentList';
import AddProjectPayment from '@/pages/projects/AddProjectPayment';
import EditProjectPayment from '@/pages/projects/EditProjectPayment';

export const projectRoutes = (
  <>
    <Route path="projects" element={<ProjectList />} />
    <Route path="projects/add" element={<AddProject />} />
    <Route path="projects/:id" element={<ProjectDetails />} />
    <Route path="projects/:id/edit" element={<EditProject />} />
    <Route path="project-payments" element={<ProjectPaymentList />} />
    <Route path="project-payments/add" element={<AddProjectPayment />} />
    <Route path="project-payments/:id/edit" element={<EditProjectPayment />} />
  </>
);