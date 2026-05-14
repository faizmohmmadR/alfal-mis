export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Company extends BaseEntity {
  name: string;
  code: string;
  description?: string;
}

export interface Currency extends BaseEntity {
  name: string;
  code: string;
  symbol: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  details?: Record<string, string[]>;
}