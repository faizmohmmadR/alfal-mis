import React, { useState } from 'react';
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

interface StudentPaymentFormData {
  student: string;
  category: string;
  amount: string;
  currency: string;
  payment_date: string;
  payment_status: string;
  reference_number?: string;
  description?: string;
}

const defaultForm: StudentPaymentFormData = {
  student: '',
  category: '',
  amount: '',
  currency: 'AFN',
  payment_date: new Date().toISOString().split('T')[0],
  payment_status: 'pending',
  reference_number: '',
  description: '',
};

const AddStudentPayment = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentPaymentFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<StudentPaymentFormData>({
    queryKey: ['student-payments'],
    endpoint: 'student-payments/',
  });

  const handleSuccess = () => {
    if (isSuccess) {
      navigate('/student-payments');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.student) newErrors.student = t('student-payments.validation.student');
    if (!formData.category) newErrors.category = t('student-payments.validation.category');
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = t('student-payments.validation.amount');
    if (!formData.payment_date) newErrors.payment_date = t('student-payments.validation.paymentDate');
    if (!formData.payment_status) newErrors.payment_status = t('student-payments.validation.paymentStatus');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/student-payments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold">{t('student-payments.addPayment')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">{t("student-payments.student")} *</Label>
                <Autocomplete
                  endpoint="students"
                  value={formData.student}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, student: value }));
                    if (errors.student) setErrors((prev) => ({ ...prev, student: "" }));
                  }}
                  placeholder={t("student-payments.selectStudent")}
                  getOptionLabel={(s) => s.full_name}
                  getOptionValue={(s) => s.id.toString()}
                />
                {errors.student && <p className="text-base text-destructive text-xs">{errors.student}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("student-payments.category")} *</Label>
                <Autocomplete
                  endpoint="payment-categories"
                  value={formData.category}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, category: value }));
                    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  placeholder={t("student-payments.selectCategory")}
                  getOptionLabel={(c) => c.name}
                  getOptionValue={(c) => c.id.toString()}
                />
                {errors.category && <p className="text-base text-destructive text-xs">{errors.category}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t("student-payments.amount")} *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, amount: e.target.value }));
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: "" }));
                  }}
                  placeholder={t("student-payments.enterAmount")}
                />
                {errors.amount && <p className="text-base text-destructive text-xs">{errors.amount}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t("student-payments.currency")} *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AFN">{t("student-payments.afn")}</SelectItem>
                    <SelectItem value="USD">{t("student-payments.usd")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date">{t("student-payments.paymentDate")} *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, payment_date: e.target.value }));
                    if (errors.payment_date) setErrors((prev) => ({ ...prev, payment_date: "" }));
                  }}
                />
                {errors.payment_date && <p className="text-base text-destructive text-xs">{errors.payment_date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">{t("student-payments.paymentStatus")} *</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, payment_status: value }));
                    if (errors.payment_status) setErrors((prev) => ({ ...prev, payment_status: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("student-payments.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("student-payments.status.pending")}</SelectItem>
                    <SelectItem value="completed">{t("student-payments.status.completed")}</SelectItem>
                    <SelectItem value="cancelled">{t("student-payments.status.cancelled")}</SelectItem>
                    <SelectItem value="refunded">{t("student-payments.status.refunded")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_status && <p className="text-base text-destructive text-xs">{errors.payment_status}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("student-payments.description")}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("student-payments.enterDescription")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/student-payments')} disabled={loading}>
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

export default AddStudentPayment;
