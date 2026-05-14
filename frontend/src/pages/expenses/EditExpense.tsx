import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import useUpdate from '@/api/useUpdate';
import useFetchObjects from '@/api/useFetchObjects';

const EditExpense = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    currency: '',
    description: '',
    user: '',
    receipt: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: expense } = useFetchObjects({
    queryKey: ['expense', id],
    endpoint: `expenses/${id}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['expenses'],
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category?.toString() || '',
        amount: expense.amount?.toString() || '',
        expense_date: expense.expense_date ? expense.expense_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        currency: expense.currency?.toString() || '',
        description: expense.description || '',
        user: expense.user?.toString() || '',
        receipt: null
      });
    }
  }, [expense]);

  useEffect(() => {
    if (isSuccess) {
      navigate('/expenses');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = t('validation.required');
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = t('validation.positive');
    if (!formData.expense_date) newErrors.expense_date = t('validation.required');
    if (!formData.currency) newErrors.currency = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id) return;

    const submitData = new FormData();
    submitData.append('category', formData.category);
    submitData.append('amount', formData.amount);
    submitData.append('expense_date', formData.expense_date);
    submitData.append('currency', formData.currency);
    if (formData.description?.trim()) {
      submitData.append('description', formData.description.trim());
    }
    if (formData.user) {
      submitData.append('user', formData.user);
    }
    if (formData.receipt) {
      submitData.append('receipt', formData.receipt);
    }

    handleUpdate(id, submitData);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/expenses')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t('expenses.editExpense')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">{t('expenses.category')} *</Label>
                <Autocomplete
                  endpoint="expense-categories" getOptionLabel={(c) => c.name} getOptionValue={(c) => c.id.toString()}
                  value={formData.category}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, category: value }));
                    if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                  }}
                  placeholder={t('expenses.selectCategory')}
                />
                {errors.category && <p className="text-base text-destructive mt-1text-xs">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="amount">{t('expenses.amount')} *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, amount: e.target.value }));
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  placeholder={t('expenses.enterAmount')}
                />
                {errors.amount && <p className="text-base text-destructive mt-1text-xs">{errors.amount}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">{t('expenses.currency')} *</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Currency</option>
                  <option value="AFN">AFN - Afghan Afghani</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
                {errors.currency && <p className="text-base text-destructive mt-1text-xs">{errors.currency}</p>}
              </div>

              <div>
                <Label htmlFor="expense_date">{t('expenses.expenseDate')} *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, expense_date: e.target.value }));
                    if (errors.expense_date) setErrors(prev => ({ ...prev, expense_date: '' }));
                  }}
                />
                {errors.expense_date && <p className="text-base text-destructive mt-1text-xs">{errors.expense_date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user">{t('expenses.user')}</Label>
                <Autocomplete
                  endpoint="users" getOptionLabel={(u) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username} getOptionValue={(u) => u.id.toString()}
                  value={formData.user}
                  onChange={(value) => setFormData(prev => ({ ...prev, user: value }))}
                  placeholder={t('expenses.selectUser')}
                  disabled={!user?.is_staff}
                />
              </div>

              <div>
                <Label htmlFor="receipt">{t('expenses.receipt')}</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFormData(prev => ({ ...prev, receipt: e.target.files?.[0] || null }))}
                />
                {expense?.receipt && (
                  <p className="text-base text-muted-foreground mt-1text-xs">
                    Current: <a href={expense.receipt} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Receipt</a>
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t('expenses.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('expenses.enterDescription')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/expenses')} disabled={loading}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('common.updating') : t('common.update')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditExpense;
