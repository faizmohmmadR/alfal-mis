import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft } from 'lucide-react';
import useAdd from '@/api/useAdd';

interface OtherIncomeFormData {
  income_category: string;
  amount: string;
  currency: string;
  income_date: string;
  source: string;
  description?: string;
}

const defaultForm: OtherIncomeFormData = {
  income_category: '',
  amount: '',
  currency: 'AFN',
  income_date: new Date().toISOString().split('T')[0],
  source: '',
  description: '',
};

const AddOtherIncome = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OtherIncomeFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<OtherIncomeFormData>({
    queryKey: ['other-incomes'],
    endpoint: 'other-incomes/',
  });

  // Navigate on success
  useEffect(() => {
    if (isSuccess) {
      navigate('/other-incomes');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.income_category) newErrors.income_category = t('other-income.validation.category');
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = t('other-income.validation.amount');
    if (!formData.income_date) newErrors.income_date = t('other-income.validation.incomeDate');
    if (!formData.source.trim()) newErrors.source = t('other-income.validation.source');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleAdd(formData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/other-incomes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold">{t('other-income.addIncome')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income_category">{t("other-income.category")} *</Label>
                <Autocomplete
                  endpoint="income-categories"
                  value={formData.income_category}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, income_category: value }));
                    if (errors.income_category) setErrors((prev) => ({ ...prev, income_category: "" }));
                  }}
                  placeholder={t("other-income.selectCategory")}
                  getOptionLabel={(c) => c.name}
                  getOptionValue={(c) => c.id.toString()}
                />
                {errors.income_category && <p className="text-base text-destructive text-xs">{errors.income_category}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t("other-income.amount")} *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, amount: e.target.value }));
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: "" }));
                  }}
                  placeholder={t("other-income.enterAmount")}
                />
                {errors.amount && <p className="text-base text-destructive text-xs">{errors.amount}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">{t("other-income.currency")} *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AFN">{t("other-income.afn")}</SelectItem>
                    <SelectItem value="USD">{t("other-income.usd")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income_date">{t("other-income.incomeDate")} *</Label>
                <Input
                  id="income_date"
                  type="date"
                  value={formData.income_date}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, income_date: e.target.value }));
                    if (errors.income_date) setErrors((prev) => ({ ...prev, income_date: "" }));
                  }}
                />
                {errors.income_date && <p className="text-base text-destructive text-xs">{errors.income_date}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">{t("other-income.source")} *</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, source: e.target.value }));
                  if (errors.source) setErrors((prev) => ({ ...prev, source: "" }));
                }}
                placeholder={t("other-income.enterSource")}
              />
              {errors.source && <p className="text-base text-destructive text-xs">{errors.source}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("other-income.description")}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("other-income.enterDescription")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/other-incomes')} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <RotateCw className="animate-spin mr-2" />
                  {t('common.adding')}
                </>
              ) : (
                t('common.add')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddOtherIncome;
