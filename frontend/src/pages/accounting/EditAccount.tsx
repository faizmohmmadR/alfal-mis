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

interface AccountFormData {
  name: string;
  code: string;
  category: string;
  parent?: string;
  is_active: boolean;
  is_detail: boolean;
  currency: string;
}

const EditAccount = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    code: '',
    category: '',
    parent: undefined,
    is_active: true,
    is_detail: true,
    currency: 'AFN',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const accountId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['account', accountId],
    endpoint: `accounts/${accountId}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['accounts'],
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        code: data.code || '',
        category: data.category || '',
        parent: data.parent || undefined,
        is_active: data.is_active ?? true,
        is_detail: data.is_detail ?? true,
        currency: data.currency || 'AFN',
      });
    }
  }, [data]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    if (!formData.code.trim()) newErrors.code = t('validation.required');
    if (!formData.category) newErrors.category = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleUpdate(accountId, formData);
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-boldtext-sm">{t('accounting.editAccount')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("accounting.accountName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder={t("accounting.accountNamePlaceholder")}
                />
                {errors.name && <p className="text-base text-destructive text-xs">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t("accounting.accountCode")} *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }));
                    if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
                  }}
                  placeholder={t("accounting.accountCodePlaceholder")}
                />
                {errors.code && <p className="text-base text-destructive text-xs">{errors.code}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t("accounting.accountCategory")} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, category: value }));
                    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("accounting.accountCategoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("accounting.asset")}</SelectItem>
                    <SelectItem value="2">{t("accounting.liability")}</SelectItem>
                    <SelectItem value="3">{t("accounting.equity")}</SelectItem>
                    <SelectItem value="4">{t("accounting.income")}</SelectItem>
                    <SelectItem value="5">{t("accounting.expense")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-base text-destructive text-xs">{errors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent">{t("accounting.parentAccount")}</Label>
                <Select
                  value={formData.parent || ''}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, parent: value || undefined }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("accounting.parentAccountPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t("common.none")}</SelectItem>
                    <SelectItem value="1">{t("accounting.currentAssets")}</SelectItem>
                    <SelectItem value="2">{t("accounting.fixedAssets")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">{t("accounting.currency")} *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, currency: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AFN">AFN - Afghan Afghani</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">{t("accounting.isActive")}</Label>
                <Select
                  value={formData.is_active.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, is_active: value === "true" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("accounting.yes")}</SelectItem>
                    <SelectItem value="false">{t("accounting.no")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_detail">{t("accounting.isDetail")}</Label>
                <Select
                  value={formData.is_detail.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, is_detail: value === "true" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("accounting.yes")}</SelectItem>
                    <SelectItem value="false">{t("accounting.no")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/accounts')} disabled={loading}>
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

export default EditAccount;
