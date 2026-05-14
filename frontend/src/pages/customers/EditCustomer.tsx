import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { ReloadIcon } from "@radix-ui/react-icons";

import useUpdate from "@/api/useUpdate";
import useFetchObjects from '@/api/useFetchObjects';
interface CustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
}

const defaultForm: CustomerFormData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  status: "active",
};

export const EditCustomer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CustomerFormData>(defaultForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customer, isLoading } = useFetchObjects<any>({
    queryKey: ['customers', id],
    endpoint: `customers/${id}`,
    enabled: !!id,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ["customers"],
    showSuccessToast: true,
    showErrorToast: true,
    invalidateQueries: true,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        status: customer.status || "active",
      });
    }
  }, [customer]);

  useEffect(() => {
    if (isSuccess) {
      navigate('/customers');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = t("customers.nameRequired");
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id) return;
    
    handleUpdate(id, formData);
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setErrors({});
  };

  const handleChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foregroundtext-xs">{t("customers.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/customers')} className="bg-muted">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.cancel")}
        </Button>
        <h1 className="text-base font-boldtext-sm">{t("customers.editCustomer")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("customers.customerDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t("customers.name")} <span className="text-destructivetext-xs">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder={t("customers.namePlaceholder")}
                  />
                  {errors.name && <p className="text-base text-destructivetext-xs">{errors.name}</p>}
                </div>
                <div>
                  <Label>{t("customers.phone")}</Label>
                  <Input
                    value={formData.phone || ""}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder={t("customers.phonePlaceholder")}
                  />
                </div>
                <div>
                  <Label>{t("customers.email")}</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder={t("customers.emailPlaceholder")}
                  />
                </div>
                <div>
                  <Label>{t("customers.status")}</Label>
                  <Select value={formData.status || "active"} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("customers.active")}</SelectItem>
                      <SelectItem value="inactive">{t("customers.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label>{t("customers.address")}</Label>
                  <Textarea
                    value={formData.address || ""}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder={t("customers.addressPlaceholder")}
                    rows={3}
                  />
                </div>
              </div>
              

            </CardContent>
          </Card>
          
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/customers')} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <ReloadIcon className="animate-spin mr-2" />
                {t("common.updating")}
              </>
            ) : (
              t("common.update")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EditCustomer;
