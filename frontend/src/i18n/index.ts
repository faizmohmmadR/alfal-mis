import { coreEn } from "./languages/core/en";
import { corePs } from "./languages/core/ps";
import { coreFa } from "./languages/core/fa";
import { commonFa } from "./languages/common/fa";
import { commonEn } from "./languages/common/en";
import { commonPs } from "./languages/common/ps";

import { customersEn } from "./languages/customer/en";
import { customerPs } from "./languages/customer/ps";
import { customerFa } from "./languages/customer/fa";
import { projectsEn } from "./languages/projects/en";
import { projectsPs } from "./languages/projects/ps";
import { projectsFa } from "./languages/projects/fa";
import { employeeEn } from "./languages/employees/en";
import { employeePs } from "./languages/employees/ps";
import { employeeFa } from "./languages/employees/fa";

import { payrollEn } from "./languages/payroll/en";
import { payrollFa } from "./languages/payroll/fa";
import { payrollPs } from "./languages/payroll/ps";
import { expensesEn } from "./languages/expenses/en";
import { expensesFa } from "./languages/expenses/fa";
import { expensesPs } from "./languages/expenses/ps";

import { settingsEn } from "./languages/settings/en";
import { settingsPs } from "./languages/settings/ps";
import { settingsFa } from "./languages/settings/fa";

import { userEn } from "./languages/user/en";
import { userPs } from "./languages/user/ps";
import { userFa } from "./languages/user/fa";

import { advanceEn } from "./languages/advance/en";
import { advancePs } from "./languages/advance/ps";
import { advanceFa } from "./languages/advance/fa";

import { apiEn } from "./languages/api/en";
import { apiFa } from "./languages/api/fa";
import { apiPs } from "./languages/api/ps";
import { activityLogsEn } from "./languages/activityLogs/en";
import { activityLogsFa } from "./languages/activityLogs/fa";
import { activityLogsPs } from "./languages/activityLogs/ps";

import { reportsEn } from "./languages/reports/en";
import { reportsFa } from "./languages/reports/fa";
import { reportsPs } from "./languages/reports/ps";


export type Language = "en" | "ps" | "fa";

// Base translation interface
export interface CoreTranslations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    // ... other common translations
  };
  // ... other core translations
}

export interface CustomerTranslations {
  customer: {
    title: string;
    name: string;
    phone: string;
    // ... other customer-specific translations
  };
}

// Combined translation type
export type Translations = CoreTranslations & {
  [module: string]: any; // Allow module-specific translations
};

// Build language objects from module imports
const en = {
  common: commonEn,
  customers: customersEn,
  projects: projectsEn,
  settings: settingsEn,
  expenses: expensesEn,
  advance: advanceEn,
  payroll: payrollEn,
  core: coreEn,
  employees: employeeEn,
  user: userEn,
  api: apiEn,
  activityLogs: activityLogsEn,
  reports: reportsEn,
};

const fa = {
  common: commonFa,
  customers: customerFa,
  projects: projectsFa,
  settings: settingsFa,
  expenses: expensesFa,
  advance: advanceFa,
  payroll: payrollFa,
  core: coreFa,
  employees: employeeFa,
  user: userFa,
  api: apiFa,
  activityLogs: activityLogsFa,
  reports: reportsFa,
};

const ps = {
  common: commonPs,
  customers: customerPs,
  projects: projectsPs,
  settings: settingsPs,
  expenses: expensesPs,
  advance: advancePs,
  payroll: payrollPs,
  core: corePs,
  employees: employeePs,
  user: userPs,
  api: apiPs,
  activityLogs: activityLogsPs,
  reports: reportsPs,
};

export const languages = {
  en,
  fa,
  ps,
};

export const languageNames = {
  en: "English",
  ps: "پښتو",
  fa: "دری",
};

export const defaultLanguage: Language = "en";
export const LANGUAGE_STORAGE_KEY = "erp-language";

export const getCurrentLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (stored as Language) || defaultLanguage;
  }
  return defaultLanguage;
};

export const saveLanguage = (language: Language): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
};

export const getTranslations = (language: Language): Translations => {
  return languages[language] || languages[defaultLanguage];
};

export const getLanguageDirection = (language: Language): "ltr" | "rtl" => {
  return language === "ps" || language === "fa" ? "rtl" : "ltr";
};

// Helper type for module translations
export type ModuleTranslations<T> = {
  [key in Language]: T;
};
