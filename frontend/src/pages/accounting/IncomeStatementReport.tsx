import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { RefreshCw, Download } from 'lucide-react';
import useFetchObject from '@/api/useFetchObject';
import { formatNumber } from '@/lib/formatNumber';

const IncomeStatementReport = () => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, loading, refetch } = useFetchObject({
    queryKey: ['income-statement', startDate, endDate],
    endpoint: `transactions/income_statement/?start_date=${startDate}&end_date=${endDate}`,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    console.log('Exporting income statement to Excel');
  };

  const incomeStatement = data as any;
  const incomeItems = incomeStatement?.income || [];
  const expenseItems = incomeStatement?.expenses || [];
  const totalIncome = incomeStatement?.total_income || 0;
  const totalExpenses = incomeStatement?.total_expenses || 0;
  const netIncome = incomeStatement?.net_income || 0;
  const isProfit = incomeStatement?.is_profit || false;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('accounting.incomeStatement')}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>{t('accounting.incomeStatement')}</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="start-date">{t('accounting.startDate')}</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Label htmlFor="end-date">{t('accounting.endDate')}</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : (
            <>
              <div className={`mb-6 p-6 rounded-md ${isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-75">{t('accounting.totalIncome')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">{t('accounting.totalExpenses')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalExpenses)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm opacity-75">{t('accounting.netIncome')}</p>
                    <p className={`text-3xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {formatNumber(netIncome)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('accounting.income')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('accounting.accountName')}</TableHead>
                            <TableHead className="text-right">{t('accounting.amount')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incomeItems.map((item: any) => (
                            <TableRow key={item.code}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{formatNumber(item.amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-muted">
                            <TableCell>{t('accounting.totalIncome')}</TableCell>
                            <TableCell className="text-right">{formatNumber(totalIncome)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('accounting.expenses')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('accounting.accountName')}</TableHead>
                            <TableHead className="text-right">{t('accounting.amount')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenseItems.map((item: any) => (
                            <TableRow key={item.code}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{formatNumber(item.amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-muted">
                            <TableCell>{t('accounting.totalExpenses')}</TableCell>
                            <TableCell className="text-right">{formatNumber(totalExpenses)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeStatementReport;
