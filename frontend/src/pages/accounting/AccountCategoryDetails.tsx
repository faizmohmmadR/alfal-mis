import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import useFetchObject from '@/api/useFetchObject';

const AccountCategoryDetails = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, loading, refetch } = useFetchObject({
    queryKey: ['account-category', id],
    endpoint: `account-categories/${id}/`,
  });

  const category = data as any;

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  const handleRefresh = () => {
    refetch();
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      liability: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      income: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      expense: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return (
      <Badge variant={colors[type as keyof typeof colors] ? 'default' : 'secondary'}>
        {t(`accounting.${type}`) || type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">{t('accounting.categoryNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/categories')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('accounting.accountCategoryDetails')}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{category.name}</CardTitle>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('common.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-75">{t('accounting.accountCategoryCode')}</p>
                <p className="text-lg font-bold">{category.code}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">{t('accounting.accountCategoryType')}</p>
                <p className="text-lg font-bold">{getTypeBadge(category.account_type || '')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-75">{t('accounting.accountCategoryDescription')}</p>
                <p className="text-lg font-bold">{category.description || '-'}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">{t('accounting.created')}</p>
                <p className="text-lg font-bold">{category.created_at}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">{t('accounting.updated')}</p>
                <p className="text-lg font-bold">{category.updated_at}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountCategoryDetails;
