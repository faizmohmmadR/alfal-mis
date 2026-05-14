export interface ActivityLog {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  user_role: string;
  company: number | null;
  company_name: string | null;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'payment';
  model_name: string;
  object_id: number | null;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  changes: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogStats {
  total_activities: number;
  by_action: Array<{ action: string; count: number }>;
  by_user: Array<{ 
    user__username: string; 
    user__first_name: string; 
    user__last_name: string; 
    user__role: string;
    count: number 
  }>;
  by_model: Array<{ model_name: string; count: number }>;
}
