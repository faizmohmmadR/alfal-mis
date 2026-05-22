import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft, Tag, FileText } from 'lucide-react';
import useAdd from '@/api/useAdd';

interface CategoryFormData {
  name: string;
  category_type: string;
  description: string;
  is_active: boolean;
}

const AddIncomeCategory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    category_type: 'other',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<CategoryFormData>({
    queryKey: ['income-categories'],
    endpoint: 'income-categories/',
  });

  useEffect(() => {
    if (isSuccess) navigate('/income-categories');
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('other-income.validation.name');
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/income-categories')} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('other-income.addCategory')}</h1>
            <p className="text-sm text-muted-foreground">{t('other-income.manageCategories', 'Manage Income Categories')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {t('other-income.categoryDetails', 'Category Details')}
          </CardTitle>
          <CardDescription>{t('other-income.categoryDetailsDesc', 'Create a new income category')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">{t("other-income.categoryName")} <span className="text-destructive">*</span></Label>
              <Input id="name" value={formData.name} onChange={(e) => { setFormData((prev) => ({ ...prev, name: e.target.value })); if (errors.name) setErrors((prev) => ({ ...prev, name: "" })); }} placeholder={t("other-income.categoryName")} className="h-10" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_type" className="font-semibold">{t("other-income.categoryType")}</Label>
              <Select value={formData.category_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, category_type: value }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">{t("other-income.categoryTypes.service")}</SelectItem>
                  <SelectItem value="miscellaneous">{t("other-income.categoryTypes.miscellaneous")}</SelectItem>
                  <SelectItem value="business">{t("other-income.categoryTypes.business")}</SelectItem>
                  <SelectItem value="investment">{t("other-income.categoryTypes.investment")}</SelectItem>
                  <SelectItem value="other">{t("other-income.categoryTypes.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />{t("other-income.description")}</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder={t("other-income.description")} className="h-10" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/income-categories')} disabled={loading} className="h-10 px-6">{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading} className="h-10 px-6">
              {loading ? <><RotateCw className="animate-spin mr-2" />{t('common.adding')}</> : t('common.add')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddIncomeCategory;
