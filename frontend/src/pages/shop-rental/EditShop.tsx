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

interface ShopFormData {
  shop_number: string;
  name: string;
  location: string;
  area: string;
  monthly_rent: string;
  currency: string;
  status: string;
  description?: string;
}

const EditShop = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ShopFormData>({
    shop_number: '',
    name: '',
    location: '',
    area: '',
    monthly_rent: '',
    currency: 'AFN',
    status: 'available',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shopId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['shop', shopId],
    endpoint: `shops/${shopId}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['shops'],
  });

  useEffect(() => {
    if (data) {
      setFormData({
        shop_number: data.shop_number || '',
        name: data.name || '',
        location: data.location || '',
        area: data.area?.toString() || '',
        monthly_rent: data.monthly_rent?.toString() || '',
        currency: data.currency?.toString() || 'AFN',
        status: data.status || 'available',
        description: data.description || '',
      });
    }
  }, [data]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.shop_number.trim()) newErrors.shop_number = t('shop-rental.validation.shopNumber');
    if (!formData.name.trim()) newErrors.name = t('shop-rental.validation.name');
    if (!formData.location.trim()) newErrors.location = t('shop-rental.validation.location');
    if (!formData.monthly_rent || parseFloat(formData.monthly_rent) <= 0) newErrors.monthly_rent = t('shop-rental.validation.monthlyRent');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleUpdate(shopId, formData);
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/shops')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold">{t('shop-rental.editShop')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop_number">{t("shop-rental.shopNumber")} *</Label>
                <Input
                  id="shop_number"
                  value={formData.shop_number}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, shop_number: e.target.value }));
                    if (errors.shop_number) setErrors((prev) => ({ ...prev, shop_number: "" }));
                  }}
                  placeholder={t("shop-rental.shopNumber")}
                />
                {errors.shop_number && <p className="text-base text-destructive text-xs">{errors.shop_number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("shop-rental.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder={t("shop-rental.name")}
                />
                {errors.name && <p className="text-base text-destructive text-xs">{errors.name}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("shop-rental.location")} *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, location: e.target.value }));
                  if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
                }}
                placeholder={t("shop-rental.location")}
              />
              {errors.location && <p className="text-base text-destructive text-xs">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">{t("shop-rental.area")}</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.01"
                  value={formData.area}
                  onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                  placeholder={t("shop-rental.area")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">{t("shop-rental.monthlyRent")} *</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  step="0.01"
                  value={formData.monthly_rent}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, monthly_rent: e.target.value }));
                    if (errors.monthly_rent) setErrors((prev) => ({ ...prev, monthly_rent: "" }));
                  }}
                  placeholder={t("shop-rental.monthlyRent")}
                />
                {errors.monthly_rent && <p className="text-base text-destructive text-xs">{errors.monthly_rent}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">{t("shop-rental.currency")} *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AFN">{t("shop-rental.afn")}</SelectItem>
                    <SelectItem value="USD">{t("shop-rental.usd")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t("shop-rental.status")} *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("shop-rental.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{t("shop-rental.status.available")}</SelectItem>
                    <SelectItem value="rented">{t("shop-rental.status.rented")}</SelectItem>
                    <SelectItem value="maintenance">{t("shop-rental.status.maintenance")}</SelectItem>
                    <SelectItem value="reserved">{t("shop-rental.status.reserved")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("shop-rental.description")}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("shop-rental.description")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/shops')} disabled={loading}>
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

export default EditShop;
