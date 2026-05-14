import { BaseEntity, Company } from './common';

export interface Customer extends BaseEntity {
  name: string;
  phone?: string;
  address?: string;
  company: string;
  company_details?: Company;
  finance?: {
    [currency: string]: {
      total_debit: number;
      total_credit: number;
      balance: number;
    };
    overall: {
      currency: string;
      total_debit: number;
      total_credit: number;
      balance: number;
    };
  };
}

export interface CustomerFormData {
  name: string;
  phone?: string;
  address?: string;
}