import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useLanguage } from '@/contexts/LanguageContext';
import useAdd from '@/api/useAdd';

interface PaymentFormData {
  project: string;
  amount: string;
  currency: string;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

const AddProjectPayment = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [formData, setFormData] = useState<PaymentFormData>({
    project: projectId || '',
    amount: '',
    currency: 'AFN',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const { handleAdd, loading, isSuccess } = useAdd<PaymentFormData>({
    queryKey: ['project-payments'],
    endpoint: 'project-payments/',
  });

  const currencyOptions = [
    { id: 'AFN', code: 'AFN', name: 'Afghan Afghani' },
    { id: 'USD', code: 'USD', name: 'US Dollar' }
  ];

  const paymentMethods = [
    { value: 'cash', label: t('projects.cash') },
    { value: 'bank_transfer', label: t('projects.bankTransfer') },
    { value: 'check', label: t('projects.check') },
    { value: 'credit_card', label: t('projects.creditCard') }
  ];

  useEffect(() => {
    if (isSuccess) {
      navigate('/project-payments');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.project) newErrors.project = t('projects.projectRequired');
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = t('projects.amountRequired');
    if (!formData.payment_date) newErrors.payment_date = t('projects.paymentDateRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    handleAdd({
      ...formData,
      reference_number: formData.reference_number?.trim() || '',
      notes: formData.notes?.trim() || '',
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/project-payments')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('projects.addPayment')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">{t('projects.project')} *</Label>
                <Autocomplete
                  endpoint="projects"
                  value={formData.project}
                  onChange={(value, option) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      project: value,
                      currency: option?.currency || 'AFN'
                    }));
                    setSelectedProject(option);
                    if (errors.project) setErrors(prev => ({ ...prev, project: '' }));
                  }}
                  placeholder={t('projects.selectProject')}
                  getOptionLabel={(p) => p.title}
                  getOptionValue={(p) => p.id.toString()}
                />
                {errors.project && <p className="text-xs text-destructive mt-1">{errors.project}</p>}
              </div>

              <div>
                <Label htmlFor="payment_date">{t('projects.paymentDate')} *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, payment_date: e.target.value }));
                    if (errors.payment_date) setErrors(prev => ({ ...prev, payment_date: '' }));
                  }}
                />
                {errors.payment_date && <p className="text-xs text-destructive mt-1">{errors.payment_date}</p>}
              </div>
            </div>

            {selectedProject && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-sm mb-3 text-blue-800">{t('projects.projectFinanceInfo')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-gray-600 font-medium">{t('projects.totalBudget')}:</span>
                    <span className="font-bold text-green-600">{selectedProject.budget} {selectedProject.currency}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-gray-600 font-medium">{t('projects.totalPaid')}:</span>
                    <span className="font-bold text-blue-600">{selectedProject.paid_amount} {selectedProject.currency}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-gray-600 font-medium">{t('projects.totalRemaining')}:</span>
                    <span className="font-bold text-orange-600">{selectedProject.remaining_amount} {selectedProject.currency}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">{t('projects.amount')} *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, amount: e.target.value }));
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  placeholder={t('projects.enterAmount')}
                />
                {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
              </div>

              <div>
                <Label htmlFor="currency">{t('projects.currency')} *</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  disabled
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_method">{t('projects.paymentMethod')}</Label>
                <select
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="reference_number">{t('projects.referenceNumber')}</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder={t('projects.enterReference')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">{t('projects.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('projects.enterNotes')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/project-payments')} disabled={loading}>
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

export default AddProjectPayment;