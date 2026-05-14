export interface Project {
  id: number;
  title: string;
  description?: string;
  customer: number;
  customer_details: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  budget: number;
  paid_amount: number;
  remaining_amount: number;
  payment_percentage: number;
  currency: string;
  currency_details: {
    code: string;
    display: string;
  };
  start_date?: string;
  end_date?: string;
  created_by: number;
  created_by_details: {
    id: number;
    fullname: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProjectPayment {
  id: number;
  project: number;
  project_details: {
    id: number;
    title: string;
    currency: string;
    currency_display: string;
  };
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_by: number;
  created_by_details: {
    id: number;
    fullname: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  title: string;
  description?: string;
  customer: number;
  status: string;
  budget: number;
  currency: string;
  start_date?: string;
  end_date?: string;
}

export interface ProjectPaymentFormData {
  project: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}