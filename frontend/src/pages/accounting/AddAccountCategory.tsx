import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft, FolderTree, Hash, Tag, FileText } from 'lucide-react';
import useAdd from '@/api/useAdd';

interface AccountCategoryFormData {
  name: string;
  code: string;
  account_type: string;
  description?: string;
}

const AddAccountCategory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AccountCategoryFormData>({
    name: '',
    code: '',
    account_type: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<AccountCategoryFormData>({
    queryKey: ['account-categories'],
    endpoint: 'account-categories/',
  });

  useEffect(() => {
    if (isSuccess) navigate('/categories');
  }, [isSuccess, navigate]);

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
    handleAdd(formData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/categories')} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('accounting.addAccountCategory')}</h1>
            <p className="text-sm text-muted-foreground">{t('accounting.manageCategories', 'Manage Account Categories')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            {t('accounting.categoryDetails', 'Category Details')}
          </CardTitle>
          <CardDescription>{t('accounting.categoryDetailsDesc', 'Create a new account category')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold flex items-center gap-2"><Tag className="h-4 w-4" />{t("accounting.accountCategoryName")} <span className="text-destructive">*</span></Label>
              <Input id="name" value={formData.name} onChange={(e) => { setFormData((prev) => ({ ...prev, name: e.target.value })); if (errors.name) setErrors((prev) => ({ ...prev, name: "" })); }} placeholder={t("accounting.accountCategoryNamePlaceholder")} className="h-10" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="font-semibold flex items-center gap-2"><Hash className="h-4 w-4" />{t("accounting.accountCategoryCode")} <span className="text-destructive">*</span></Label>
              <Input id="code" value={formData.code} onChange={(e) => { setFormData((prev) => ({ ...prev, code: e.target.value })); if (errors.code) setErrors((prev) => ({ ...prev, code: "" })); }} placeholder={t("accounting.accountCategoryCodePlaceholder")} className="h-10" />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type" className="font-semibold">{t("accounting.accountCategoryType")} <span className="text-destructive">*</span></Label>
            <Select value={formData.account_type} onValueChange={(value) => { setFormData((prev) => ({ ...prev, account_type: value })); if (errors.account_type) setErrors((prev) => ({ ...prev, account_type: "" })); }}>
              <SelectTrigger className="h-10"><SelectValue placeholder={t("accounting.accountCategoryTypePlaceholder")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">{t("accounting.asset")}</SelectItem>
                <SelectItem value="liability">{t("accounting.liability")}</SelectItem>
                <SelectItem value="equity">{t("accounting.equity")}</SelectItem>
                <SelectItem value="income">{t("accounting.income")}</SelectItem>
                <SelectItem value="expense">{t("accounting.expense")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.account_type && <p className="text-xs text-destructive">{errors.account_type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />{t("accounting.accountCategoryDescription")}</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder={t("accounting.accountCategoryDescriptionPlaceholder")} className="min-h-[100px]" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/categories')} disabled={loading} className="h-10 px-6">{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading} className="h-10 px-6">
              {loading ? <><RotateCw className="animate-spin mr-2" />{t('common.adding')}</> : t('common.add')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAccountCategory;
