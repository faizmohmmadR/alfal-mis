import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BarChart3, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { formatNumber } from '@/lib/formatNumber';
import useFetchObjects from '@/api/useFetchObjects';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#3b82f6', '#eab308'];

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
    endpoint: 'reports/financial/',
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

  // Extract data
  const incomeAFN = report.income?.total?.AFN || 0;
  const incomeUSD = report.income?.total?.USD || 0;
  const studentIncomeAFN = report.income?.student_payments?.AFN || 0;
  const studentIncomeUSD = report.income?.student_payments?.USD || 0;
  const rentalIncomeAFN = report.income?.rental_income?.AFN || 0;
  const rentalIncomeUSD = report.income?.rental_income?.USD || 0;
  const otherIncomeAFN = report.income?.other_income?.AFN || 0;
  const otherIncomeUSD = report.income?.other_income?.USD || 0;
  const expenseAFN = report.expenses?.total?.AFN || 0;
  const expenseUSD = report.expenses?.total?.USD || 0;
  const profitAFN = report.profit?.AFN || 0;
  const profitUSD = report.profit?.USD || 0;

  // Expense breakdown data
  const generalExpensesAFN = report.expenses?.breakdown?.general_expenses?.AFN || 0;
  const generalExpensesUSD = report.expenses?.breakdown?.general_expenses?.USD || 0;
  const payrollAFN = report.expenses?.breakdown?.payroll?.AFN || 0;
  const payrollUSD = report.expenses?.breakdown?.payroll?.USD || 0;
  const advancesAFN = report.expenses?.breakdown?.advances?.AFN || 0;
  const advancesUSD = report.expenses?.breakdown?.advances?.USD || 0;

  // Debug: Log the report data
  console.log('Dashboard Report Data:', report);
  console.log('Income:', { incomeAFN, incomeUSD, studentIncomeAFN, studentIncomeUSD, rentalIncomeAFN, rentalIncomeUSD, otherIncomeAFN, otherIncomeUSD });
  console.log('Expenses:', { expenseAFN, expenseUSD, profitAFN, profitUSD });
  console.log('Expense Breakdown:', { generalExpensesAFN, generalExpensesUSD, payrollAFN, payrollUSD, advancesAFN, advancesUSD });

  // Chart data
  const currencyComparisonData = [
    { name: 'AFN', income: incomeAFN, expense: expenseAFN, profit: profitAFN },
    { name: 'USD', income: incomeUSD, expense: expenseUSD, profit: profitUSD }
  ];

  const incomeBreakdownData = [
    { name: t('reports.studentPaymentsIncome'), value: studentIncomeAFN + studentIncomeUSD, AFN: studentIncomeAFN, USD: studentIncomeUSD },
    { name: t('reports.rentalIncome'), value: rentalIncomeAFN + rentalIncomeUSD, AFN: rentalIncomeAFN, USD: rentalIncomeUSD },
    { name: t('reports.otherIncome'), value: otherIncomeAFN + otherIncomeUSD, AFN: otherIncomeAFN, USD: otherIncomeUSD }
  ].filter(item => item.value > 0);

  const expenseBreakdown = [
    { name: t('reports.generalExpenses'), AFN: generalExpensesAFN, USD: generalExpensesUSD },
    { name: t('reports.payroll'), AFN: payrollAFN, USD: payrollUSD },
    { name: t('reports.advances'), AFN: advancesAFN, USD: advancesUSD }
  ].filter(item => item.AFN > 0 || item.USD > 0);

  // Aggregate expense by category - combine AFN and USD for same category
  const expenseByCategoryRaw = (report.expenses?.by_category || []).reduce((acc: any[], item: any) => {
    const existing = acc.find(e => e.name === item.category);
    if (existing) {
      if (item.currency === 'AFN') existing.AFN = Number(item.amount) || 0;
      else existing.USD = Number(item.amount) || 0;
      existing.value = (existing.AFN || 0) + (existing.USD || 0);
    } else {
      acc.push({
        name: item.category,
        AFN: item.currency === 'AFN' ? (Number(item.amount) || 0) : 0,
        USD: item.currency === 'USD' ? (Number(item.amount) || 0) : 0,
        value: Number(item.amount) || 0
      });
    }
    return acc;
  }, []);

  // Filter to only show categories with non-zero values
  const expenseByCategory = expenseByCategoryRaw.filter(item => item.value > 0);

  console.log('Expense By Category:', expenseByCategory);

  const financialOverviewData = [
    { name: t('reports.studentPaymentsIncome'), AFN: studentIncomeAFN, USD: studentIncomeUSD },
    { name: t('reports.rentalIncome'), AFN: rentalIncomeAFN, USD: rentalIncomeUSD },
    { name: t('reports.otherIncome'), AFN: otherIncomeAFN, USD: otherIncomeUSD },
    { name: t('reports.expenses'), AFN: expenseAFN, USD: expenseUSD },
    { name: t('reports.profit'), AFN: profitAFN, USD: profitUSD }
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

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Income */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalIncome')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(incomeAFN)} AFN</div>
              <p className="text-xs text-muted-foreground">{formatNumber(incomeUSD)} USD</p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.expenses')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(expenseAFN)} AFN</div>
              <p className="text-xs text-muted-foreground">{formatNumber(expenseUSD)} USD</p>
            </CardContent>
          </Card>

          {/* Profit */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.profit')}</CardTitle>
              {profitAFN >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitAFN >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatNumber(profitAFN)} AFN
              </div>
              <p className="text-xs text-muted-foreground">{formatNumber(profitUSD)} USD</p>
            </CardContent>
          </Card>

          {/* Income Breakdown Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.incomeBreakdown')}</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Student: </span>
                  <span className="font-medium">{formatNumber(studentIncomeAFN)} AFN</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Rental: </span>
                  <span className="font-medium">{formatNumber(rentalIncomeAFN)} AFN</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Other: </span>
                  <span className="font-medium">{formatNumber(otherIncomeAFN)} AFN</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Income vs Expenses vs Profit by Currency - Bar Chart */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-center text-lg font-semibold">{t('reports.byCurrency')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dir="ltr">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currencyComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis 
                      tickFormatter={(value) => formatNumber(value)} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      }}
                      formatter={(value) => formatNumber(Number(value))}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Bar dataKey="income" fill="#10b981" name={t('reports.totalIncome')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" name={t('reports.expenses')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#8b5cf6" name={t('reports.profit')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Financial Overview - Line Chart */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-center text-lg font-semibold">{t('reports.financialOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dir="ltr">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialOverviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatNumber(value)} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      }}
                      formatter={(value) => formatNumber(Number(value))}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="AFN" 
                      stroke="#f59e0b" 
                      name="AFN" 
                      strokeWidth={3} 
                      dot={{ r: 6, strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="USD" 
                      stroke="#8b5cf6" 
                      name="USD" 
                      strokeWidth={3} 
                      dot={{ r: 6, strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Income Breakdown - Donut Chart */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-center text-lg font-semibold">{t('reports.incomeBreakdown') || 'Income Breakdown'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dir="ltr">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={incomeBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {incomeBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      }}
                      formatter={(value) => formatNumber(Number(value))}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ fontSize: '13px' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4. Expense Breakdown by Type - Bar Chart */}
          {expenseBreakdown.length > 0 && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">{t('reports.expenseBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div dir="ltr">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expenseBreakdown} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => formatNumber(value)} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <YAxis dataKey="name" axisLine={false} tickLine={false} width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                        }}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                      <Legend wrapperStyle={{ fontSize: '14px' }} />
                      <Bar dataKey="AFN" fill="#f59e0b" name="AFN" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="USD" fill="#8b5cf6" name="USD" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5. Expense by Category - Radar Chart */}
          {expenseByCategory.length > 0 && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">{t('reports.expenseByCategory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div dir="ltr">
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={expenseByCategory}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                      <Radar
                        name="Expenses"
                        dataKey="value"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="#ef4444"
                        fillOpacity={0.6}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                        }}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                      <Legend />
                    </RadarChart>
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
