import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft, User, Phone, Mail, MapPin, FileText, CreditCard } from 'lucide-react';
import useUpdate from '@/api/useUpdate';
import useFetchObject from '@/api/useFetchObject';

interface TenantFormData {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  tazkira_number: string;
  description: string;
}

const EditTenant = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TenantFormData>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    tazkira_number: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { id } = useParams();
  const { data, isLoading: fetching } = useFetchObject({
    queryKey: ['tenant', id],
    endpoint: `tenants/${id}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({ queryKey: ['tenants'] });

  useEffect(() => {
    if (data) {
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        tazkira_number: data.tazkira_number || '',
        description: data.description || ''
      });
    }
  }, [data]);

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
    handleUpdate(id, formData);
  };

  if (fetching) return <div className="container mx-auto py-6 text-center">{t('common.loading')}</div>;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('shop-rental.editTenant')}</h1>
            <p className="text-sm text-muted-foreground">{t('shop-rental.manageTenants', 'Manage Tenants')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t('shop-rental.tenantDetails', 'Tenant Details')}
          </CardTitle>
          <CardDescription>{t('shop-rental.tenantDetailsDesc', 'Update tenant information')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="font-semibold flex items-center gap-2"><User className="h-4 w-4" />{t("shop-rental.fullName")} <span className="text-destructive">*</span></Label>
              <Input id="full_name" value={formData.full_name} onChange={(e) => { setFormData((prev) => ({ ...prev, full_name: e.target.value })); if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: "" })); }} placeholder={t("shop-rental.fullName")} className="h-10" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold flex items-center gap-2"><Phone className="h-4 w-4" />{t("shop-rental.phone")} <span className="text-destructive">*</span></Label>
              <Input id="phone" value={formData.phone} onChange={(e) => { setFormData((prev) => ({ ...prev, phone: e.target.value })); if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" })); }} placeholder={t("shop-rental.phone")} className="h-10" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4" />{t("shop-rental.email")}</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder={t("shop-rental.email")} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tazkira_number" className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" />{t("shop-rental.tazkiraNumber")} <span className="text-destructive">*</span></Label>
              <Input id="tazkira_number" value={formData.tazkira_number} onChange={(e) => { setFormData((prev) => ({ ...prev, tazkira_number: e.target.value })); if (errors.tazkira_number) setErrors((prev) => ({ ...prev, tazkira_number: "" })); }} placeholder={t("shop-rental.tazkiraNumber")} className="h-10" />
              {errors.tazkira_number && <p className="text-xs text-destructive">{errors.tazkira_number}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" />{t("shop-rental.address")}</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} placeholder={t("shop-rental.address")} className="h-10" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />{t("shop-rental.description")}</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder={t("shop-rental.description")} className="h-10" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/tenants')} disabled={loading} className="h-10 px-6">{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading} className="h-10 px-6">
              {loading ? (<><RotateCw className="animate-spin mr-2" />{t('common.updating')}</>) : (t('common.update'))}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTenant;
