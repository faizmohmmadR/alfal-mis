import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft, Wallet, Hash, FolderTree, DollarSign } from 'lucide-react';
import useAdd from '@/api/useAdd';

interface AccountFormData {
  name: string;
  code: string;
  category: string;
  parent?: string;
  is_active: boolean;
  is_detail: boolean;
  currency: string;
}

const AddAccount = () => {
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

  const { handleAdd, loading, isSuccess } = useAdd<AccountFormData>({
    queryKey: ['accounts'],
    endpoint: 'accounts/',
  });

  useEffect(() => {
    if (isSuccess) navigate('/accounts');
  }, [isSuccess, navigate]);

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
    handleAdd(formData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts')} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('accounting.addAccount')}</h1>
            <p className="text-sm text-muted-foreground">{t('accounting.manageAccounts', 'Manage Accounts')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            {t('accounting.accountDetails', 'Account Details')}
          </CardTitle>
          <CardDescription>{t('accounting.accountDetailsDesc', 'Create a new account')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold flex items-center gap-2"><Wallet className="h-4 w-4" />{t("accounting.accountName")} <span className="text-destructive">*</span></Label>
              <Input id="name" value={formData.name} onChange={(e) => { setFormData((prev) => ({ ...prev, name: e.target.value })); if (errors.name) setErrors((prev) => ({ ...prev, name: "" })); }} placeholder={t("accounting.accountNamePlaceholder")} className="h-10" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="font-semibold flex items-center gap-2"><Hash className="h-4 w-4" />{t("accounting.accountCode")} <span className="text-destructive">*</span></Label>
              <Input id="code" value={formData.code} onChange={(e) => { setFormData((prev) => ({ ...prev, code: e.target.value })); if (errors.code) setErrors((prev) => ({ ...prev, code: "" })); }} placeholder={t("accounting.accountCodePlaceholder")} className="h-10" />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold flex items-center gap-2"><FolderTree className="h-4 w-4" />{t("accounting.accountCategory")} <span className="text-destructive">*</span></Label>
              <Select value={formData.category} onValueChange={(value) => { setFormData((prev) => ({ ...prev, category: value })); if (errors.category) setErrors((prev) => ({ ...prev, category: "" })); }}>
                <SelectTrigger className="h-10"><SelectValue placeholder={t("accounting.accountCategoryPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("accounting.asset")}</SelectItem>
                  <SelectItem value="2">{t("accounting.liability")}</SelectItem>
                  <SelectItem value="3">{t("accounting.equity")}</SelectItem>
                  <SelectItem value="4">{t("accounting.income")}</SelectItem>
                  <SelectItem value="5">{t("accounting.expense")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent" className="font-semibold">{t("accounting.parentAccount")}</Label>
              <Select value={formData.parent || '__none__'} onValueChange={(value) => setFormData((prev) => ({ ...prev, parent: value === '__none__' ? undefined : value }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder={t("accounting.parentAccountPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("common.none")}</SelectItem>
                  <SelectItem value="1">{t("accounting.currentAssets")}</SelectItem>
                  <SelectItem value="2">{t("accounting.fixedAssets")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency" className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" />{t("accounting.currency")} <span className="text-destructive">*</span></Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AFN">{t("accounting.afn")}</SelectItem>
                  <SelectItem value="USD">{t("accounting.usd")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active" className="font-semibold">{t("accounting.isActive")}</Label>
              <Select value={formData.is_active.toString()} onValueChange={(value) => setFormData((prev) => ({ ...prev, is_active: value === "true" }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t("accounting.yes")}</SelectItem>
                  <SelectItem value="false">{t("accounting.no")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_detail" className="font-semibold">{t("accounting.isDetail")}</Label>
              <Select value={formData.is_detail.toString()} onValueChange={(value) => setFormData((prev) => ({ ...prev, is_detail: value === "true" }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t("accounting.yes")}</SelectItem>
                  <SelectItem value="false">{t("accounting.no")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/accounts')} disabled={loading} className="h-10 px-6">{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading} className="h-10 px-6">
              {loading ? <><RotateCw className="animate-spin mr-2" />{t('common.adding')}</> : t('common.add')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAccount;
