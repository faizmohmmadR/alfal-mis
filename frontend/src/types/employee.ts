export interface Employee {
  id: string;
  employee_id?: string; // For ZKTeco device integration
  user_details?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  company_details?: {
    id: string;
    name: string;
    code?: string;
  };
  position?: string;
  date_joined?: string;
  is_active: boolean;
  address?: string;
  salary: number;
  currency?: string;
  currency_details?: {
    id: string;
    name: string;
    code: string;
    symbol?: string;
  };
  notes?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFormData {
  // User fields
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  // Employee fields
  position?: string;
  is_active: boolean;
  address?: string;
  salary: number;
  currency?: string;
  notes?: string;
  confirmPassword: string;
  contract_start_date?: string;
  contract_end_date?: string;
}