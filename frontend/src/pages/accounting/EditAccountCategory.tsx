import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft } from 'lucide-react';
import useUpdate from '@/api/useUpdate';
import useFetchObject from '@/api/useFetchObject';

interface AccountCategoryFormData {
  name: string;
  code: string;
  account_type: string;
  description?: string;
}

const EditAccountCategory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AccountCategoryFormData>({
    name: '',
    code: '',
    account_type: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['account-category', categoryId],
    endpoint: `account-categories/${categoryId}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['account-categories'],
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        code: data.code || '',
        account_type: data.account_type || '',
        description: data.description || '',
      });
    }
  }, [data]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    if (!formData.code.trim()) newErrors.code = t('validation.required');
    if (!formData.account_type) newErrors.account_type = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleUpdate(categoryId, formData);
  };

  if (fetching) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/categories')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-boldtext-sm">{t('accounting.editAccountCategory')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("accounting.accountCategoryName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder={t("accounting.accountCategoryNamePlaceholder")}
                />
                {errors.name && <p className="text-base text-destructive text-xs">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t("accounting.accountCategoryCode")} *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }));
                    if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
                  }}
                  placeholder={t("accounting.accountCategoryCodePlaceholder")}
                />
                {errors.code && <p className="text-base text-destructive text-xs">{errors.code}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_type">{t("accounting.accountCategoryType")} *</Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, account_type: value }));
                  if (errors.account_type) setErrors((prev) => ({ ...prev, account_type: "" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("accounting.accountCategoryTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">{t("accounting.asset")}</SelectItem>
                  <SelectItem value="liability">{t("accounting.liability")}</SelectItem>
                  <SelectItem value="equity">{t("accounting.equity")}</SelectItem>
                  <SelectItem value="income">{t("accounting.income")}</SelectItem>
                  <SelectItem value="expense">{t("accounting.expense")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.account_type && <p className="text-base text-destructive text-xs">{errors.account_type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("accounting.accountCategoryDescription")}</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder={t("accounting.accountCategoryDescriptionPlaceholder")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/categories')} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <RotateCw className="animate-spin mr-2" />
                  {t('common.updating')}
                </>
              ) : (
                t('common.update')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAccountCategory;
