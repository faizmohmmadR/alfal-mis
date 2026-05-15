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

  const transactionId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['transaction', transactionId],
    endpoint: `transactions/${transactionId}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['transactions'],
  });

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

  const calculateTotalDebit = () => {
    return formData.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  };

  const calculateTotalCredit = () => {
    return formData.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  };

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
    handleUpdate(transactionId, formData);
  };

  const handleEntryChange = (index: number, field: keyof JournalEntryFormData, value: any) => {
    const newEntries = [...formData.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setFormData({ ...formData, entries: newEntries });
  };

  const addEntry = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { account: '', debit: 0, credit: 0, description: '' }],
    });
  };

  const removeEntry = (index: number) => {
    if (formData.entries.length > 2) {
      const newEntries = formData.entries.filter((_, i) => i !== index);
      setFormData({ ...formData, entries: newEntries });
    }
  };

  if (fetching) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/transactions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-boldtext-sm">{t('accounting.editTransaction')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{t("accounting.transactionDate")} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
                {errors.date && <p className="text-base text-destructive text-xs">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_type">{t("accounting.transactionType")} *</Label>
                <Select
                  value={formData.transaction_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, transaction_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("accounting.transactionTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">{t("accounting.journal")}</SelectItem>
                    <SelectItem value="student_payment">{t("accounting.studentPayment")}</SelectItem>
                    <SelectItem value="expense">{t("accounting.expense")}</SelectItem>
                    <SelectItem value="payroll">{t("accounting.payroll")}</SelectItem>
                    <SelectItem value="advance">{t("accounting.advance")}</SelectItem>
                    <SelectItem value="rental_income">{t("accounting.rentalIncome")}</SelectItem>
                    <SelectItem value="other_income">{t("accounting.otherIncome")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.transaction_type && <p className="text-base text-destructive text-xs">{errors.transaction_type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("accounting.description")}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("accounting.descriptionPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">{t("accounting.transactionReference")}</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
                placeholder={t("accounting.transactionReferencePlaceholder")}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">{t("accounting.entries")}</Label>
                <Button variant="outline" size="sm" onClick={addEntry}>
                  + {t("accounting.addEntry")}
                </Button>
              </div>

              <div className="space-y-2">
                {formData.entries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-4 border rounded-md">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor={`entry-account-${index}`}>{t("accounting.account")}</Label>
                      <Input
                        id={`entry-account-${index}`}
                        value={entry.account}
                        onChange={(e) => handleEntryChange(index, 'account', e.target.value)}
                        placeholder={t("accounting.accountPlaceholder")}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`entry-debit-${index}`}>{t("accounting.debit")}</Label>
                      <Input
                        id={`entry-debit-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.debit}
                        onChange={(e) => handleEntryChange(index, 'debit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`entry-credit-${index}`}>{t("accounting.credit")}</Label>
                      <Input
                        id={`entry-credit-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.credit}
                        onChange={(e) => handleEntryChange(index, 'credit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-4 space-y-2">
                      <Label htmlFor={`entry-description-${index}`}>{t("accounting.description")}</Label>
                      <Input
                        id={`entry-description-${index}`}
                        value={entry.description}
                        onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                        placeholder={t("accounting.descriptionPlaceholder")}
                      />
                    </div>
                    {formData.entries.length > 2 && (
                      <div className="col-span-1 flex items-end">
                        <Button variant="ghost" size="sm" onClick={() => removeEntry(index)}>
                          ×
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

              {errors.balance && (
                <div className="p-4 bg-red-100 text-red-800 rounded-md">
                  {errors.balance}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/transactions')} disabled={loading}>
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

export default EditTransaction;
