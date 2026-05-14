import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useLanguage } from '@/contexts/LanguageContext';
import useAdd from '@/api/useAdd';

interface ProjectFormData {
  title: string;
  description?: string;
  customer: string;
  status: string;
  budget: string;
  paid_amount: string;
  currency: string;
  contract_date: string;
  start_date?: string;
  end_date?: string;
}

const AddProject = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    customer: '',
    status: 'pending',
    budget: '',
    paid_amount: '0',
    currency: 'AFN',
    contract_date: new Date().toISOString().slice(0, 10),
    start_date: '',
    end_date: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<ProjectFormData>({
    queryKey: ['projects'],
    endpoint: 'projects/',
  });

  const currencyOptions = [
    { id: 'AFN', code: 'AFN', name: 'Afghan Afghani' },
    { id: 'USD', code: 'USD', name: 'US Dollar' }
  ];

  const statusOptions = [
    { value: 'pending', label: t('projects.pending') },
    { value: 'in_progress', label: t('projects.inProgress') },
    { value: 'on_hold', label: t('projects.onHold') },
    { value: 'completed', label: t('projects.completed') },
    { value: 'cancelled', label: t('projects.cancelled') }
  ];

  useEffect(() => {
    if (isSuccess) {
      navigate('/projects');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = t('projects.titleRequired');
    if (!formData.customer) newErrors.customer = t('projects.customerRequired');
    if (!formData.budget || parseFloat(formData.budget) <= 0) newErrors.budget = t('projects.budgetRequired');
    if (!formData.currency) newErrors.currency = t('projects.currencyRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    handleAdd({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('projects.addProject')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">{t('projects.projectTitle')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  placeholder={t('projects.enterTitle')}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="customer">{t('projects.customer')} *</Label>
                <Autocomplete
                  endpoint="customers"
                  value={formData.customer}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, customer: value }));
                    if (errors.customer) setErrors(prev => ({ ...prev, customer: '' }));
                  }}
                  placeholder={t('projects.selectCustomer')}
                  getOptionLabel={(c) => c.name}
                  getOptionValue={(c) => c.id.toString()}
                />
                {errors.customer && <p className="text-xs text-destructive mt-1">{errors.customer}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t('projects.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('projects.enterDescription')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">{t('projects.status')}</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="currency">{t('projects.currency')} *</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, currency: e.target.value }));
                    if (errors.currency) setErrors(prev => ({ ...prev, currency: '' }));
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {errors.currency && <p className="text-xs text-destructive mt-1">{errors.currency}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">{t('projects.budget')} *</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, budget: e.target.value }));
                    if (errors.budget) setErrors(prev => ({ ...prev, budget: '' }));
                  }}
                  placeholder={t('projects.enterBudget')}
                />
                {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget}</p>}
              </div>

              <div>
                <Label htmlFor="paid_amount">{t('projects.paidAmount')}</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  step="0.01"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_date">{t('projects.contractDate')} *</Label>
                <Input
                  id="contract_date"
                  type="date"
                  value={formData.contract_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="start_date">{t('projects.startDate')}</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="end_date">{t('projects.endDate')}</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/projects')} disabled={loading}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? t('common.adding') : t('common.add')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProject;