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

const BalanceSheetReport = () => {
  const { t } = useLanguage();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, loading, refetch } = useFetchObject({
    queryKey: ['balance-sheet', asOfDate],
    endpoint: `transactions/balance_sheet/?as_of_date=${asOfDate}`,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    console.log('Exporting balance sheet to Excel');
  };

  const balanceSheet = data as any;
  const assets = balanceSheet?.assets || [];
  const liabilities = balanceSheet?.liabilities || [];
  const equity = balanceSheet?.equity || [];
  const totalAssets = balanceSheet?.total_assets || 0;
  const totalLiabilities = balanceSheet?.total_liabilities || 0;
  const totalEquity = balanceSheet?.total_equity || 0;
  const totalLiabilitiesAndEquity = balanceSheet?.total_liabilities_and_equity || 0;
  const isBalanced = balanceSheet?.is_balanced || false;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('accounting.balanceSheet')}</h1>
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
            <CardTitle>{t('accounting.balanceSheet')}</CardTitle>
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
              <div className={`mb-6 p-6 rounded-md ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm opacity-75">{t('accounting.totalAssets')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalAssets)}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">{t('accounting.totalLiabilities')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalLiabilities)}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">{t('accounting.totalEquity')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalEquity)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('accounting.assets')}</CardTitle>
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
                          {assets.map((item: any) => (
                            <TableRow key={item.code}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{formatNumber(item.amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-muted">
                            <TableCell>{t('accounting.totalAssets')}</TableCell>
                            <TableCell className="text-right">{formatNumber(totalAssets)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('accounting.liabilities')}</CardTitle>
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
                            {liabilities.map((item: any) => (
                              <TableRow key={item.code}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{formatNumber(item.amount)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold bg-muted">
                              <TableCell>{t('accounting.totalLiabilities')}</TableCell>
                              <TableCell className="text-right">{formatNumber(totalLiabilities)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('accounting.equity')}</CardTitle>
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
                            {equity.map((item: any) => (
                              <TableRow key={item.code}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{formatNumber(item.amount)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold bg-muted">
                              <TableCell>{t('accounting.totalEquity')}</TableCell>
                              <TableCell className="text-right">{formatNumber(totalEquity)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-md bg-muted">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{t('accounting.totalLiabilitiesAndEquity')}</span>
                  <span className="font-bold">{formatNumber(totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheetReport;
