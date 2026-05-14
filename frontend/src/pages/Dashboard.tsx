import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  BarChart3, Wallet
} from 'lucide-react';
import { formatNumber } from '@/lib/formatNumber';
import useFetchObjects from '@/api/useFetchObjects';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export const Dashboard = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getParams = () => {
    const filters: any = { period: period || 'monthly' };
    if (period === 'custom') {
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
    }
    return filters;
  };

  const { data: report, isLoading } = useFetchObjects<any>({
    queryKey: ['financial-report', period, startDate, endDate],
    endpoint: 'reports/financial',
    params: getParams()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <h3 className="text-lg font-semibold">{t('reports.loadingReport')}</h3>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{t('reports.noData')}</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  const incomeAFN = report.income?.total?.AFN || 0;
  const incomeUSD = report.income?.total?.USD || 0;
  const paidAFN = report.income?.paid?.AFN || 0;
  const paidUSD = report.income?.paid?.USD || 0;
  const remainingAFN = report.income?.remaining?.AFN || 0;
  const remainingUSD = report.income?.remaining?.USD || 0;
  const expenseAFN = report.expenses?.total?.AFN || 0;
  const expenseUSD = report.expenses?.total?.USD || 0;
  const profitAFN = report.profit?.AFN || 0;
  const profitUSD = report.profit?.USD || 0;

  // Chart data
  const currencyComparisonData = [
    { name: 'AFN', income: incomeAFN, paid: paidAFN, remaining: remainingAFN, expense: expenseAFN, profit: profitAFN },
    { name: 'USD', income: incomeUSD, paid: paidUSD, remaining: remainingUSD, expense: expenseUSD, profit: profitUSD }
  ];

  const financialOverviewData = [
    { name: t('reports.totalBudget'), AFN: incomeAFN, USD: incomeUSD },
    { name: t('reports.paidAmount'), AFN: paidAFN, USD: paidUSD },
    { name: t('reports.remainingAmount'), AFN: remainingAFN, USD: remainingUSD },
    { name: t('reports.expenses'), AFN: expenseAFN, USD: expenseUSD },
    { name: t('reports.profit'), AFN: profitAFN, USD: profitUSD }
  ];

  const expenseByCategory = (report.expenses?.by_category || []).map((item: any, idx: number) => ({
    name: item.category,
    value: item.amount,
    currency: item.currency,
    color: COLORS[idx % COLORS.length]
  }));

  const expenseBreakdown = [
    { name: t('reports.generalExpenses'), AFN: report.expenses?.breakdown?.general_expenses?.AFN || 0, USD: report.expenses?.breakdown?.general_expenses?.USD || 0 },
    { name: t('reports.payroll'), AFN: report.expenses?.breakdown?.payroll?.AFN || 0, USD: report.expenses?.breakdown?.payroll?.USD || 0 },
    { name: t('reports.advances'), AFN: report.expenses?.breakdown?.advances?.AFN || 0, USD: report.expenses?.breakdown?.advances?.USD || 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-full mx-auto p-6 space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <div>
              <h1 className="text-2xl font-bold">{t('reports.financialDashboard')}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <BarChart3 className="h-4 w-4" />
                {t('reports.comprehensiveFinancialOverview')}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {/* Period Tabs */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <Tabs value={period} onValueChange={setPeriod} className="flex-1">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="daily">{t('reports.today')}</TabsTrigger>
                  <TabsTrigger value="weekly">{t('reports.thisWeek')}</TabsTrigger>
                  <TabsTrigger value="monthly">{t('reports.thisMonth')}</TabsTrigger>
                  <TabsTrigger value="yearly">{t('reports.thisYear')}</TabsTrigger>
                  <TabsTrigger value="custom">{t('reports.customRange')}</TabsTrigger>
                </TabsList>
              </Tabs>

              {period === 'custom' && (
                <div className="flex gap-3 w-full lg:w-auto">
                  <div className="flex-1 lg:w-40">
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder={t('reports.startDate')}
                      className="h-10"
                    />
                  </div>
                  <div className="flex-1 lg:w-40">
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder={t('reports.endDate')}
                      className="h-10"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Budget Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('reports.totalBudget')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">AFN</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {formatNumber(incomeAFN)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">USD</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {formatNumber(incomeUSD)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Paid Amount Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-700 flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                {t('reports.paidAmount')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">AFN</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {formatNumber(paidAFN)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">USD</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {formatNumber(paidUSD)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Remaining Amount Card */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-amber-700 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t('reports.remainingAmount')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-900">AFN</span>
                </div>
                <span className="text-xl font-bold text-amber-600">
                  {formatNumber(remainingAFN)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-900">USD</span>
                </div>
                <span className="text-xl font-bold text-amber-600">
                  {formatNumber(remainingUSD)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5" />
                {t('reports.totalExpenses')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-900">AFN</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {formatNumber(expenseAFN)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-900">USD</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {formatNumber(expenseUSD)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Card - Full Width */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-purple-700 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('reports.profit')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${profitAFN >= 0 ? 'bg-purple-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  <Wallet className={`h-6 w-6 ${profitAFN >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
                  <span className={`font-medium text-lg ${profitAFN >= 0 ? 'text-purple-900' : 'text-red-900'}`}>AFN</span>
                </div>
                <span className={`text-2xl font-bold ${profitAFN >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatNumber(profitAFN)}
                </span>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-lg ${profitUSD >= 0 ? 'bg-purple-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  <DollarSign className={`h-6 w-6 ${profitUSD >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
                  <span className={`font-medium text-lg ${profitUSD >= 0 ? 'text-purple-900' : 'text-red-900'}`}>USD</span>
                </div>
                <span className={`text-2xl font-bold ${profitUSD >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatNumber(profitUSD)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Details - All in One Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('reports.expenseDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expense Breakdown by Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('reports.expenseBreakdown')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* General Expenses */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                  <h4 className="font-semibold text-orange-900 mb-3 text-sm">{t('reports.generalExpenses')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-xs text-gray-600">AFN</span>
                      <span className="text-sm font-bold text-orange-600">{formatNumber(report.expenses?.breakdown?.general_expenses?.AFN || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-xs text-gray-600">USD</span>
                      <span className="text-sm font-bold text-orange-600">{formatNumber(report.expenses?.breakdown?.general_expenses?.USD || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Payroll */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-3 text-sm">{t('reports.payroll')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-xs text-gray-600">AFN</span>
                      <span className="text-sm font-bold text-purple-600">{formatNumber(report.expenses?.breakdown?.payroll?.AFN || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-xs text-gray-600">USD</span>
                      <span className="text-sm font-bold text-purple-600">{formatNumber(report.expenses?.breakdown?.payroll?.USD || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Advances */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-amber-50 to-amber-100">
                  <h4 className="font-semibold text-amber-900 mb-3 text-sm">{t('reports.advances')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-xs text-gray-600">AFN</span>
                      <span className="text-sm font-bold text-amber-600">{formatNumber(report.expenses?.breakdown?.advances?.AFN || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-xs text-gray-600">USD</span>
                      <span className="text-sm font-bold text-amber-600">{formatNumber(report.expenses?.breakdown?.advances?.USD || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense by Category */}
            {expenseByCategory.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('reports.expenseByCategory')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {expenseByCategory.map((item, index) => {
                    const total = expenseByCategory.reduce((sum, i) => sum + i.value, 0);
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-sm text-gray-900">{item.name}</span>
                          <span className="text-xs font-medium text-gray-500 ml-auto">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div 
                            className="h-1.5 rounded-full transition-all" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: item.color 
                            }}
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold" style={{ color: item.color }}>
                            {formatNumber(item.value)} {item.currency}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Row 1 - Currency Comparison & Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t('reports.byCurrency')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dir="ltr">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currencyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Bar dataKey="income" fill="#3b82f6" name={t('reports.totalBudget')} />
                    <Bar dataKey="paid" fill="#10b981" name={t('reports.paidAmount')} />
                    <Bar dataKey="remaining" fill="#f59e0b" name={t('reports.remainingAmount')} />
                    <Bar dataKey="expense" fill="#ef4444" name={t('reports.expenses')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t('reports.financialOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dir="ltr">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Bar dataKey="AFN" fill="#f59e0b" name="AFN" />
                    <Bar dataKey="USD" fill="#8b5cf6" name="USD" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Row 2 - Expense Breakdown & Expense by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t('reports.expenseBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dir="ltr">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Bar dataKey="AFN" fill="#f59e0b" />
                    <Bar dataKey="USD" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {expenseByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t('reports.expenseByCategory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div dir="ltr">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${formatNumber(entry.value)} ${entry.currency}`}
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};
