import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft } from 'lucide-react';
import useAdd from '@/api/useAdd';

interface TenantFormData {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  tazkira_number: string;
  description: string;
}

const defaultForm: TenantFormData = {
  full_name: '',
  phone: '',
  email: '',
  address: '',
  tazkira_number: '',
  description: ''
};

const AddTenant = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TenantFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<TenantFormData>({
    queryKey: ['tenants'],
    endpoint: 'tenants/',
  });

  useEffect(() => {
    if (isSuccess) {
      navigate('/tenants');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = t('shop-rental.validation.fullName');
    if (!formData.phone.trim()) newErrors.phone = t('shop-rental.validation.phone');
    if (!formData.tazkira_number.trim()) newErrors.tazkira_number = t('shop-rental.validation.tazkiraNumber');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-bold">{t('shop-rental.addTenant')}</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t("shop-rental.fullName")} *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }));
                  if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: "" }));
                }}
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("shop-rental.phone")} *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, phone: e.target.value }));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("shop-rental.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tazkira_number">{t("shop-rental.tazkiraNumber")} *</Label>
              <Input
                id="tazkira_number"
                value={formData.tazkira_number}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, tazkira_number: e.target.value }));
                  if (errors.tazkira_number) setErrors((prev) => ({ ...prev, tazkira_number: "" }));
                }}
              />
              {errors.tazkira_number && <p className="text-xs text-destructive">{errors.tazkira_number}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("shop-rental.address")}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("shop-rental.description")}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/tenants')} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <><RotateCw className="animate-spin mr-2" />{t('common.adding')}</>
              ) : t('common.add')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTenant;
