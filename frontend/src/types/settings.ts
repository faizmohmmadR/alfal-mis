import { BaseEntity, Company } from './common';

export interface Unit extends BaseEntity {
  company?: string;
  company_details?: Company;
  name: string;
  description?: string;
}

export interface Currency extends BaseEntity {
  company?: string;
  company_details?: Company;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

export interface ExchangeRate extends BaseEntity {
  company?: string;
  company_details?: Company;
  from_currency: number;
  to_currency: number;
  from_currency_details?: Currency;
  to_currency_details?: Currency;
  rate: number;
  date: string;
  is_active: boolean;
}

export interface UnitFormData {
  name: string;
  description?: string;
}

export interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

export interface ExchangeRateFormData {
  from_currency: string;
  to_currency: string;
  rate: number;
  date: string;
  is_active: boolean;
}