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

interface CategoryFormData {
  name: string;
  category_type: string;
  description: string;
  is_active: boolean;
}

const EditIncomeCategory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    category_type: 'other',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['income-category', categoryId],
    endpoint: `income-categories/${categoryId}/`,
  });

  const { handleUpdate, loading } = useUpdate({ queryKey: ['income-categories'] });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        category_type: data.category_type || 'other',
        description: data.description || '',
        is_active: data.is_active ?? true
      });
    }
  }, [data]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('other-income.validation.name');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleUpdate(categoryId, formData);
    navigate('/income-categories');
  };

  if (fetching) return <div className="container mx-auto py-6 text-center">{t('common.loading')}</div>;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/income-categories')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-bold">{t('other-income.editCategory')}</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("other-income.categoryName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_type">{t("other-income.categoryType")}</Label>
              <Select value={formData.category_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, category_type: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Label htmlFor="description">{t("other-income.description")}</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/income-categories')} disabled={loading}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <><RotateCw className="animate-spin mr-2" />{t('common.updating')}</> : t('common.update')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditIncomeCategory;
