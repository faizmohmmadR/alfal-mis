import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Calendar, Settings } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export const AccountingLayout = () => {
  return (
    <Sidebar>
      <div className="space-y-1">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Accounting
        </h3>
        
        <Link
          to="/accounting/accounts"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Accounts
        </Link>
        
        <Link
          to="/accounting/categories"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Categories
        </Link>
        
        <Link
          to="/accounting/transactions"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <FileText className="h-4 w-4" />
          Transactions
        </Link>
        
        <Link
          to="/accounting/fiscal-years"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <Calendar className="h-4 w-4" />
          Fiscal Years
        </Link>
        
        <h3 className="px-3 mt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Reports
        </h3>
        
        <Link
          to="/accounting/reports/trial-balance"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <FileText className="h-4 w-4" />
          Trial Balance
        </Link>
        
        <Link
          to="/accounting/reports/income-statement"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <FileText className="h-4 w-4" />
          Income Statement
        </Link>
        
        <Link
          to="/accounting/reports/balance-sheet"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <FileText className="h-4 w-4" />
          Balance Sheet
        </Link>
      </div>
    </Sidebar>
  );
};
