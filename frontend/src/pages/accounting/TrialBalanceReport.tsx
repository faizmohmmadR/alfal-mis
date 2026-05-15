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

const TrialBalanceReport = () => {
  const { t } = useLanguage();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, loading, refetch } = useFetchObject({
    queryKey: ['trial-balance', asOfDate],
    endpoint: `transactions/trial_balance/?as_of_date=${asOfDate}`,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    console.log('Exporting trial balance to Excel');
  };

  const trialBalance = data as any;
  const accounts = trialBalance?.accounts || [];
  const totalDebit = trialBalance?.total_debit || 0;
  const totalCredit = trialBalance?.total_credit || 0;
  const isBalanced = trialBalance?.is_balanced || false;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('accounting.trialBalance')}</h1>
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
            <CardTitle>{t('accounting.trialBalance')}</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="as-of-date">{t('accounting.reportDate')}</Label>
              <Input
                id="as-of-date"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : (
            <>
              <div className={`mb-4 p-4 rounded-md ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <span className="font-bold">{t('accounting.balanceSheetBalanced')}</span>
                  ) : (
                    <span className="font-bold">{t('accounting.balanceSheetNotBalanced')}</span>
                  )}
                </div>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialBalanceReport;
