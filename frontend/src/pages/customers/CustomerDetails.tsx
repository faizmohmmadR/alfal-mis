import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';

const CustomerDetails = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: customer, isLoading } = useFetchObjects<any>({
    queryKey: ['customers', id],
    endpoint: `customers/${id}`,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('customers.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/customers')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold">{t('customers.customerDetails')}</h1>
        </div>
        <Button onClick={() => navigate(`/customers/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          {t('common.edit')}
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{customer.name}</CardTitle>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                  {customer.status === 'active' ? t('customers.active') : t('customers.inactive')}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('customers.phone')}</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('customers.email')}</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3 md:col-span-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('customers.address')}</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AFN Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t('customers.financialSummary')} - AFN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('customers.totalBudget')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(customer.afn_totals?.budget || 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('customers.totalPaid')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {(customer.afn_totals?.paid || 0).toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('customers.totalRemaining')}</p>
                <p className={`text-2xl font-bold ${(customer.afn_totals?.remaining || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(customer.afn_totals?.remaining || 0).toFixed(2)}
                </p>
              </div>
              <Wallet className={`h-8 w-8 ${(customer.afn_totals?.remaining || 0) > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        {/* USD Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t('customers.financialSummary')} - USD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('customers.totalBudget')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(customer.usd_totals?.budget || 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('customers.totalPaid')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {(customer.usd_totals?.paid || 0).toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('customers.totalRemaining')}</p>
                <p className={`text-2xl font-bold ${(customer.usd_totals?.remaining || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(customer.usd_totals?.remaining || 0).toFixed(2)}
                </p>
              </div>
              <Wallet className={`h-8 w-8 ${(customer.usd_totals?.remaining || 0) > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { CustomerDetails };
export default CustomerDetails;
