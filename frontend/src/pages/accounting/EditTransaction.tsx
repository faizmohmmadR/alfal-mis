import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft, Calendar, FileText, Hash, Plus, X } from 'lucide-react';
import useUpdate from '@/api/useUpdate';
import useFetchObject from '@/api/useFetchObject';
import { formatNumber } from '@/lib/formatNumber';

interface JournalEntryFormData {
  account: string;
  debit: number;
  credit: number;
  description?: string;
}

interface TransactionFormData {
  date: string;
  description?: string;
  transaction_type: string;
  reference?: string;
  entries: JournalEntryFormData[];
}

const EditTransaction = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    transaction_type: 'journal',
    reference: '',
    entries: [
      { account: '', debit: 0, credit: 0, description: '' },
      { account: '', debit: 0, credit: 0, description: '' },
    ],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading: fetching } = useFetchObject({
    queryKey: ['transaction', id],
    endpoint: `transactions/${id}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({ queryKey: ['transactions'] });

  useEffect(() => {
    if (data) {
      setFormData({
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        transaction_type: data.transaction_type || 'journal',
        reference: data.reference || '',
        entries: data.entries?.map((entry: any) => ({
          account: entry.account,
          debit: entry.debit || 0,
          credit: entry.credit || 0,
          description: entry.description || '',
        })) || [
          { account: '', debit: 0, credit: 0, description: '' },
          { account: '', debit: 0, credit: 0, description: '' },
        ],
      });
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) navigate('/transactions');
  }, [isSuccess, navigate]);

  const calculateTotalDebit = () => formData.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const calculateTotalCredit = () => formData.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = calculateTotalDebit() === calculateTotalCredit();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = t('validation.required');
    if (!formData.transaction_type) newErrors.transaction_type = t('validation.required');
    if (!isBalanced) newErrors.balance = t('accounting.transactionNotBalanced');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleUpdate(id, formData);
  };

  const handleEntryChange = (index: number, field: keyof JournalEntryFormData, value: any) => {
    const newEntries = [...formData.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setFormData({ ...formData, entries: newEntries });
  };

  const addEntry = () => {
    setFormData({ ...formData, entries: [...formData.entries, { account: '', debit: 0, credit: 0, description: '' }] });
  };

  const removeEntry = (index: number) => {
    if (formData.entries.length > 2) {
      setFormData({ ...formData, entries: formData.entries.filter((_, i) => i !== index) });
    }
  };

  if (fetching) return <div className="container mx-auto py-6 text-center">{t('common.loading')}</div>;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/transactions')} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('accounting.editTransaction')}</h1>
            <p className="text-sm text-muted-foreground">{t('accounting.manageTransactions', 'Manage Transactions')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('accounting.transactionDetails', 'Transaction Details')}
          </CardTitle>
          <CardDescription>{t('accounting.transactionDetailsDescEdit', 'Update transaction information')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" />{t("accounting.transactionDate")} <span className="text-destructive">*</span></Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} className="h-10" />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_type" className="font-semibold">{t("accounting.transactionType")} <span className="text-destructive">*</span></Label>
              <Select value={formData.transaction_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, transaction_type: value }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder={t("accounting.transactionTypePlaceholder")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal">{t("accounting.journal")}</SelectItem>
                  <SelectItem value="student_payment">{t("accounting.studentPayment")}</SelectItem>
                  <SelectItem value="expense">{t("accounting.expense")}</SelectItem>
                  <SelectItem value="payroll">{t("accounting.payroll")}</SelectItem>
                  <SelectItem value="advance">{t("accounting.advance")}</SelectItem>
                  <SelectItem value="rental_income">{t("accounting.rentalIncome")}</SelectItem>
                  <SelectItem value="other_income">{t("accounting.other_income")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.transaction_type && <p className="text-xs text-destructive">{errors.transaction_type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />{t("accounting.description")}</Label>
              <Input id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder={t("accounting.descriptionPlaceholder")} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference" className="font-semibold flex items-center gap-2"><Hash className="h-4 w-4" />{t("accounting.transactionReference")}</Label>
              <Input id="reference" value={formData.reference} onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))} placeholder={t("accounting.transactionReferencePlaceholder")} className="h-10" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">{t("accounting.entries")}</Label>
              <Button variant="outline" size="sm" onClick={addEntry} className="gap-1">
                <Plus className="h-4 w-4" /> {t("accounting.addEntry")}
              </Button>
            </div>

            <div className="space-y-2">
              {formData.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-4 border rounded-md items-end">
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor={`entry-account-${index}`} className="text-xs">{t("accounting.account")}</Label>
                    <Autocomplete
                      value={entry.account}
                      onChange={(value) => handleEntryChange(index, 'account', value || '')}
                      endpoint="accounts/"
                      labelKey="name"
                      valueKey="id"
                      placeholder={t("accounting.accountPlaceholder")}
                      searchPlaceholder={t("accounting.searchAccounts")}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`entry-debit-${index}`} className="text-xs">{t("accounting.debit")}</Label>
                    <Input id={`entry-debit-${index}`} type="number" min="0" step="0.01" value={entry.debit} onChange={(e) => handleEntryChange(index, 'debit', parseFloat(e.target.value) || 0)} className="h-10" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`entry-credit-${index}`} className="text-xs">{t("accounting.credit")}</Label>
                    <Input id={`entry-credit-${index}`} type="number" min="0" step="0.01" value={entry.credit} onChange={(e) => handleEntryChange(index, 'credit', parseFloat(e.target.value) || 0)} className="h-10" />
                  </div>
                  <div className="col-span-4 space-y-2">
                    <Label htmlFor={`entry-description-${index}`} className="text-xs">{t("accounting.description")}</Label>
                    <Input id={`entry-description-${index}`} value={entry.description} onChange={(e) => handleEntryChange(index, 'description', e.target.value)} placeholder={t("accounting.descriptionPlaceholder")} className="h-10" />
                  </div>
                  {formData.entries.length > 2 && (
                    <div className="col-span-1">
                      <Button variant="ghost" size="sm" onClick={() => removeEntry(index)} className="text-red-600 h-10">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 p-4 bg-muted rounded-md">
              <div className="text-right">
                <p className="text-sm opacity-75">{t("accounting.totalDebit")}</p>
                <p className="text-xl font-bold">{formatNumber(calculateTotalDebit())}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">{t("accounting.totalCredit")}</p>
                <p className="text-xl font-bold">{formatNumber(calculateTotalCredit())}</p>
              </div>
            </div>

            {errors.balance && <div className="p-4 bg-red-100 text-red-800 rounded-md text-sm">{errors.balance}</div>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/transactions')} disabled={loading} className="h-10 px-6">{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading} className="h-10 px-6">
              {loading ? <><RotateCw className="animate-spin mr-2" />{t('common.updating')}</> : t('common.update')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTransaction;
