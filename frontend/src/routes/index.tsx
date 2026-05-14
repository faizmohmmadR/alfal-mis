import { Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/settings/Settings';
import { Profile } from '@/pages/profile/Profile';
import { BackupList } from '@/pages/settings/backup/BackupList';
import NotFound from '@/pages/NotFound';

// Import only required route modules
import { customerRoutes } from './customerRoutes';
import { projectRoutes } from './projectRoutes';
import { employeeRoutes } from './employeeRoutes';
import { payrollRoutes } from './payrollRoutes';
import { expenseRoutes } from './expenseRoutes';
import { advanceRoutes } from './advanceRoutes';
import { userRoutes } from './userRoutes';
import { settingsRoutes } from './settingsRoutes';
import { activityLogRoutes } from './activityLogRoutes';

export const appRoutes = (
  <>
    {/* Dashboard */}
    <Route index element={<Dashboard />} />
    
    {/* Customer Management */}
    {customerRoutes}
    
    {/* Project Management */}
    {projectRoutes}
    
    {/* Financial Management */}
    {expenseRoutes}
    
    {/* Human Resources */}
    {employeeRoutes}
    {payrollRoutes}
    {advanceRoutes}
    
    {/* User Management */}
    {userRoutes}
    
    {/* Activity Logs */}
    {activityLogRoutes}
    
    {/* Settings */}
    <Route path="settings" element={<Settings />} />
    <Route path="backups" element={<BackupList />} />
    {settingsRoutes}
    
    {/* Other Routes */}
    <Route path="profile" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
  </>
);