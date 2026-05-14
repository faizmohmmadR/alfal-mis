export interface Payroll {
  id: number;
  company: number;
  employee: number;
  month: string;
  year: number;
  basic_salary: number;
  bunus: number;
  overtime: number;
  deductions: number;
  net_salary: number;
  curency: number;
  payment_date: string;
}