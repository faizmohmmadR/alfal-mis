import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { RefreshCw, FileSpreadsheet, File } from 'lucide-react';
import useFetchObject from '@/api/useFetchObject';
import { formatNumber } from '@/lib/formatNumber';

type ReportType = 'summary' | 'financial' | 'student_payments' | 'payroll' | 'rental' | 'trial_balance' | 'income_statement' | 'balance_sheet';

const ComprehensiveReports = () => {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, loading, refetch } = useFetchObject({
    queryKey: ['comprehensive-report', reportType, period, startDate, endDate],
    endpoint: `reports/comprehensive/?type=${reportType}&period=${period}${startDate ? `&start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`,
  });

  const handleRefresh = () => refetch();

  const handleExport = (format: 'pdf' | 'excel') => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const params = new URLSearchParams({
      type: reportType,
      period: period,
      export: format,
    });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    window.open(`${baseUrl}/reports/comprehensive/?${params.toString()}`, '_blank');
  };

  const report = data as any;

  const renderSummaryReport = () => {
    if (!report) return null;
    const { income, expenses, profit } = report;
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('reports.income')}</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reports.category')}</TableHead>
                  <TableHead className="text-right">AFN</TableHead>
                  <TableHead className="text-right">USD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{t('reports.projectIncome')}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.project?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.project?.USD || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.studentPayments')}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.student?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.student?.USD || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.rentalIncome')}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.rental?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.rental?.USD || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.otherIncome')}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.other?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.other?.USD || 0)}</TableCell>
                </TableRow>
                <TableRow className="font-bold bg-muted">
                  <TableCell>{t('reports.totalIncome')}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.total?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(income?.total?.USD || 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('reports.expenses')}</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reports.category')}</TableHead>
                  <TableHead className="text-right">AFN</TableHead>
                  <TableHead className="text-right">USD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{t('reports.generalExpenses')}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.general?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.general?.USD || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.payroll')}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.payroll?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.payroll?.USD || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.advances')}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.advances?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.advances?.USD || 0)}</TableCell>
                </TableRow>
                <TableRow className="font-bold bg-muted">
                  <TableCell>{t('reports.totalExpenses')}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.total?.AFN || 0)}</TableCell>
                  <TableCell className="text-right">{formatNumber(expenses?.total?.USD || 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className={`p-4 rounded-md ${(profit?.AFN || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="flex justify-between items-center">
            <span className="font-bold">{(profit?.AFN || 0) >= 0 ? t('reports.netProfit') : t('reports.netLoss')}</span>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatNumber(profit?.AFN || 0)} AFN</div>
              <div className="text-lg">{formatNumber(profit?.USD || 0)} USD</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrialBalance = () => {
    if (!report) return null;
    const accounts = report.accounts || [];
    const totalDebit = report.total_debit || 0;
    const totalCredit = report.total_credit || 0;
    const isBalanced = report.is_balanced;
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-md ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className="font-bold">{isBalanced ? t('accounting.balanceSheetBalanced') : t('accounting.balanceSheetNotBalanced')}</span>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('accounting.accountCode')}</TableHead>
                <TableHead>{t('accounting.accountName')}</TableHead>
                <TableHead className="text-right">{t('accounting.debit')}</TableHead>
                <TableHead className="text-right">{t('accounting.credit')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account: any) => (
                <TableRow key={account.code}>
                  <TableCell className="font-medium">{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell className="text-right">{formatNumber(account.debit)}</TableCell>
                  <TableCell className="text-right">{formatNumber(account.credit)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted">
                <TableCell colSpan={2}>{t('accounting.total')}</TableCell>
                <TableCell className="text-right">{formatNumber(totalDebit)}</TableCell>
                <TableCell className="text-right">{formatNumber(totalCredit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="text-center py-8">{t('common.loading')}</div>;
    if (reportType === 'trial_balance') return renderTrialBalance();
    return renderSummaryReport();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('reports.comprehensiveReports')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <File className="mr-2 h-4 w-4" />PDF
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="w-40"><SelectValue placeholder={t('reports.reportType')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">{t('reports.summary')}</SelectItem>
                <SelectItem value="trial_balance">{t('accounting.trialBalance')}</SelectItem>
                <SelectItem value="income_statement">{t('reports.incomeStatement')}</SelectItem>
                <SelectItem value="balance_sheet">{t('reports.balanceSheet')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32"><SelectValue placeholder={t('reports.period')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t('reports.daily')}</SelectItem>
                <SelectItem value="weekly">{t('reports.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('reports.monthly')}</SelectItem>
                <SelectItem value="yearly">{t('reports.yearly')}</SelectItem>
                <SelectItem value="custom">{t('reports.custom')}</SelectItem>
              </SelectContent>
            </Select>
            {period === 'custom' && (
              <>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-36" />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-36" />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReports;