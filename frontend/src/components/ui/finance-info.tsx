import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FinanceInfoProps {
  data: {
    afn_totals?: {
      purchase_total?: number;
      payments_total?: number;
      remaining_amount?: number;
    };
    currency_totals?: Array<{
      currency: {
        code: string;
        symbol: string;
      };
      purchase_total: number;
      payments_total: number;
      remaining_amount: number;
    }>;
  } | null;
  type: 'vendor' | 'customer';
  entityName?: string;
}

export const FinanceInfo = ({ data, type, entityName }: FinanceInfoProps) => {
  const { t } = useLanguage();

  if (!data?.currency_totals && !data?.afn_totals) {
    return null;
  }

  const isVendor = type === 'vendor';
  const currencies = data.currency_totals || [];
  
  // Add AFN totals if available
  const allCurrencies = [...currencies];
  if (data.afn_totals && !currencies.find(c => c.currency.code === 'AFN')) {
    const purchaseOrContractTotal = isVendor ? 
      (data.afn_totals.purchase_total || 0) : 
      (data.afn_totals.contract_total || 0);
    
    allCurrencies.push({
      currency: { code: 'AFN', symbol: '؋' },
      purchase_total: purchaseOrContractTotal,
      contract_total: purchaseOrContractTotal,
      payments_total: data.afn_totals.payments_total || 0,
      remaining_amount: data.afn_totals.remaining_amount || 0
    });
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {entityName ? `${entityName} - ${t('common.financeInfo')}` : t('common.financeInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* AFN Totals */}
          {data.afn_totals && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center mb-3">
                <Badge className="bg-blue-600 text-white font-medium">
                  AFN ؋ - {t('common.total')}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span className="text-base text-muted-foreground">
                      {isVendor ? t('vendors.purchaseTotal') : t('customers.contractTotal')}
                    </span>
                  </div>
                  <div className="font-bold text-blue-600">
                    {Number(isVendor ? (data.afn_totals.purchase_total || 0) : (data.afn_totals.contract_total || 0)).toFixed(0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-base text-muted-foreground">
                      {isVendor ? t('vendors.paymentsTotal') : t('customers.paymentsTotal')}
                    </span>
                  </div>
                  <div className="font-bold text-green-600">
                    {Number(data.afn_totals.payments_total || 0).toFixed(0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-base text-muted-foreground">
                      {isVendor ? t('vendors.remainingAmount') : t('customers.remainingAmount')}
                    </span>
                  </div>
                  <Badge 
                    variant={(data.afn_totals.remaining_amount || 0) > 0 ? 'destructive' : 'default'} 
                    className="font-bold"
                  >
                    {Number(data.afn_totals.remaining_amount || 0).toFixed(0)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Currency Breakdown */}
          {currencies.length > 0 && (
            <div>
              <h4 className="text-base font-medium mb-2 text-muted-foregroundtext-sm">{t('common.currencyBreakdown')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currencies.map((currencyData) => (
                  <div key={currencyData.currency.code} className="border rounded-lg p-3">
                    <div className="text-center mb-2">
                      <Badge variant="outline" className="font-medium">
                        {currencyData.currency.code} {currencyData.currency.symbol}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-blue-600" />
                          <span className="text-base text-muted-foreground">
                            {isVendor ? t('vendors.purchaseTotal') : t('customers.contractTotal')}
                          </span>
                        </div>
                        <span className="font-semibold text-base text-blue-600 text-smtext-xs">
                          {Number(isVendor ? currencyData.purchase_total : currencyData.contract_total).toFixed(0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-green-600" />
                          <span className="text-base text-muted-foreground">
                            {isVendor ? t('vendors.paymentsTotal') : t('customers.paymentsTotal')}
                          </span>
                        </div>
                        <span className="font-semibold text-base text-green-600 text-smtext-xs">
                          {Number(currencyData.payments_total).toFixed(0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">
                          {isVendor ? t('vendors.remainingAmount') : t('customers.remainingAmount')}
                        </span>
                        <Badge 
                          variant={currencyData.remaining_amount > 0 ? 'destructive' : 'default'} 
                          className="text-base"
                        >
                          {Number(currencyData.remaining_amount).toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};