import { Route } from 'react-router-dom';
import ActivityLogList from '@/pages/activity-logs/ActivityLogList';

export const activityLogRoutes = (
  <>
    <Route path="/activity-logs" element={<ActivityLogList />} />
  </>
);
