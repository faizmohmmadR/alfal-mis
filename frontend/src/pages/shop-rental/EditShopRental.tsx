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
import useUpdate from '@/api/useUpdate';
import useFetchObject from '@/api/useFetchObject';

interface ShopRentalFormData {
  shop: string;
  tenant: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  currency: string;
  rental_status: string;
  security_deposit: string;
  description: string;
}

const EditShopRental = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ShopRentalFormData>({
    shop: '',
    tenant: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    currency: 'AFN',
    rental_status: 'active',
    security_deposit: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rentalId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['shop-rental', rentalId],
    endpoint: `shop-rentals/${rentalId}/`,
  });

  const { handleUpdate, loading } = useUpdate({ queryKey: ['shop-rentals'] });

  useEffect(() => {
    if (data) {
      setFormData({
        shop: data.shop?.toString() || '',
        tenant: data.tenant?.toString() || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        monthly_rent: data.monthly_rent?.toString() || '',
        currency: data.currency || 'AFN',
        rental_status: data.rental_status || 'active',
        security_deposit: data.security_deposit?.toString() || '',
        description: data.description || ''
      });
    }
  }, [data]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.shop) newErrors.shop = t('shop-rental.validation.shop');
    if (!formData.tenant) newErrors.tenant = t('shop-rental.validation.tenant');
    if (!formData.start_date) newErrors.start_date = t('shop-rental.validation.startDate');
    if (!formData.end_date) newErrors.end_date = t('shop-rental.validation.endDate');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleUpdate(rentalId, formData);
    navigate('/shop-rentals');
  };

  if (fetching) return <div className="container mx-auto py-6 text-center">{t('common.loading')}</div>;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/shop-rentals')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-bold">{t('shop-rental.editRental')}</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop">{t("shop-rental.shop")} *</Label>
              <Autocomplete
                endpoint="shops"
                value={formData.shop}
                onChange={(value) => { setFormData((prev) => ({ ...prev, shop: value })); if (errors.shop) setErrors((prev) => ({ ...prev, shop: "" })); }}
                placeholder={t("shop-rental.selectShop")}
                getOptionLabel={(s) => s.name}
                getOptionValue={(s) => s.id.toString()}
              />
              {errors.shop && <p className="text-xs text-destructive">{errors.shop}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant">{t("shop-rental.tenant")} *</Label>
              <Autocomplete
                endpoint="tenants"
                value={formData.tenant}
                onChange={(value) => { setFormData((prev) => ({ ...prev, tenant: value })); if (errors.tenant) setErrors((prev) => ({ ...prev, tenant: "" })); }}
                placeholder={t("shop-rental.selectTenant")}
                getOptionLabel={(t) => t.full_name}
                getOptionValue={(t) => t.id.toString()}
              />
              {errors.tenant && <p className="text-xs text-destructive">{errors.tenant}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t("shop-rental.startDate")} *</Label>
              <Input id="start_date" type="date" value={formData.start_date}
                onChange={(e) => { setFormData((prev) => ({ ...prev, start_date: e.target.value })); if (errors.start_date) setErrors((prev) => ({ ...prev, start_date: "" })); }} />
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">{t("shop-rental.endDate")} *</Label>
              <Input id="end_date" type="date" value={formData.end_date}
                onChange={(e) => { setFormData((prev) => ({ ...prev, end_date: e.target.value })); if (errors.end_date) setErrors((prev) => ({ ...prev, end_date: "" })); }} />
              {errors.end_date && <p className="text-xs text-destructive">{errors.end_date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_rent">{t("shop-rental.monthlyRent")}</Label>
              <Input id="monthly_rent" type="number" step="0.01" value={formData.monthly_rent}
                onChange={(e) => setFormData((prev) => ({ ...prev, monthly_rent: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("shop-rental.currency")}</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AFN">{t("shop-rental.afn")}</SelectItem>
                  <SelectItem value="USD">{t("shop-rental.usd")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rental_status">{t("shop-rental.rentalStatus")}</Label>
              <Select value={formData.rental_status} onValueChange={(value) => setFormData((prev) => ({ ...prev, rental_status: value }))}>
                <SelectTrigger><SelectValue placeholder={t("shop-rental.selectRentalStatus")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("shop-rental.rentalStatusOptions.active")}</SelectItem>
                  <SelectItem value="expired">{t("shop-rental.rentalStatusOptions.expired")}</SelectItem>
                  <SelectItem value="cancelled">{t("shop-rental.rentalStatusOptions.cancelled")}</SelectItem>
                  <SelectItem value="renewed">{t("shop-rental.rentalStatusOptions.renewed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security_deposit">{t("shop-rental.securityDeposit")}</Label>
              <Input id="security_deposit" type="number" step="0.01" value={formData.security_deposit}
                onChange={(e) => setFormData((prev) => ({ ...prev, security_deposit: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("shop-rental.description")}</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/shop-rentals')} disabled={loading}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <><RotateCw className="animate-spin mr-2" />{t('common.updating')}</> : t('common.update')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditShopRental;
