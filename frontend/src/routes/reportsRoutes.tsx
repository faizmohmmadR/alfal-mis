import { Route } from 'react-router-dom';
import ComprehensiveReports from '@/pages/reports/ComprehensiveReports';

export const reportsRoutes = (
  <>
    <Route path="reports" element={<ComprehensiveReports />} />
  </>
);