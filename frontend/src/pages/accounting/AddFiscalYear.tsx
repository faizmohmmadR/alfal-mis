import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft } from 'lucide-react';
import useAdd from '@/api/useAdd';

interface FiscalYearFormData {
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

const defaultForm: FiscalYearFormData = {
  name: '',
  start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
  end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
  is_closed: false,
};

const AddFiscalYear = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FiscalYearFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<FiscalYearFormData>({
    queryKey: ['fiscal-years'],
    endpoint: 'fiscal-years/',
  });

  const handleSuccess = () => {
    if (isSuccess) {
      navigate('/fiscal-years');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    if (!formData.start_date) newErrors.start_date = t('validation.required');
    if (!formData.end_date) newErrors.end_date = t('validation.required');
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.dateRange = t('accounting.startDateMustBeBeforeEndDate');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleAdd(formData);
    handleSuccess();
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fiscal-years')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-boldtext-sm">{t('accounting.addFiscalYear')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("accounting.fiscalYearName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder={t("accounting.fiscalYearNamePlaceholder")}
              />
              {errors.name && <p className="text-base text-destructive text-xs">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">{t("accounting.fiscalYearStartDate")} *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, start_date: e.target.value }));
                    if (errors.start_date) setErrors((prev) => ({ ...prev, start_date: "" }));
                  }}
                />
                {errors.start_date && <p className="text-base text-destructive text-xs">{errors.start_date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">{t("accounting.fiscalYearEndDate")} *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, end_date: e.target.value }));
                    if (errors.end_date) setErrors((prev) => ({ ...prev, end_date: "" }));
                  }}
                />
                {errors.end_date && <p className="text-base text-destructive text-xs">{errors.end_date}</p>}
              </div>
            </div>

            {errors.dateRange && (
              <div className="p-4 bg-red-100 text-red-800 rounded-md">
                {errors.dateRange}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="is_closed">{t("accounting.isClosed")}</Label>
              <select
                id="is_closed"
                value={formData.is_closed.toString()}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_closed: e.target.value === "true" }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="false">{t("accounting.open")}</option>
                <option value="true">{t("accounting.closed")}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/fiscal-years')} disabled={loading}>
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

export default AddFiscalYear;
