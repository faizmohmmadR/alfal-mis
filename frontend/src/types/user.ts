export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_picture?: string | null;
  company?: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  is_buyer: boolean;
  is_seller: boolean;
  is_finance: boolean;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  company?: string;
  is_active: boolean;
  is_buyer: boolean;
  is_seller: boolean;
  is_finance: boolean;
}

export interface UserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}