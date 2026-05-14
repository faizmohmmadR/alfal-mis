import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ArrowLeft, DollarSign, User } from 'lucide-react';
import useAdd from '@/api/useAdd';
import useFetchObjects from '@/api/useFetchObjects';
import { Employee } from '@/types/advance';
import { Currency } from '@/types/common';

interface PayrollFormData {
  employee: string;
  month: string;
  year: number;
  salary: number;
  currency: string;
  payment_date: string;
}

interface EmployeeFinancialSummary {
  total_salary: number;
  advanced_paid: number;
  payroll_paid: number;
  overall_paid: number;
  remaining_amount: number;
  currency?: { id: string; code: string; symbol?: string; };
}

const AddPayroll = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PayrollFormData>({
    employee: '',
    month: new Date().toLocaleString('default', { month: 'long' }).toLowerCase(),
    year: new Date().getFullYear(),
    salary: 0,
    currency: '',
    payment_date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [financialSummary, setFinancialSummary] = useState<EmployeeFinancialSummary | null>(null);

  const { handleAdd, loading, isSuccess } = useAdd<PayrollFormData>({
    queryKey: 'payrolls',
    customSuccessMessage: t('payroll.addSuccess'),
  });

  const months = [
    { value: 'january', label: t('advance.months.january') },
    { value: 'february', label: t('advance.months.february') },
    { value: 'march', label: t('advance.months.march') },
    { value: 'april', label: t('advance.months.april') },
    { value: 'may', label: t('advance.months.may') },
    { value: 'june', label: t('advance.months.june') },
    { value: 'july', label: t('advance.months.july') },
    { value: 'august', label: t('advance.months.august') },
    { value: 'september', label: t('advance.months.september') },
    { value: 'october', label: t('advance.months.october') },
    { value: 'november', label: t('advance.months.november') },
    { value: 'december', label: t('advance.months.december') },
  ];

  useEffect(() => {
    if (formData.employee && formData.month && formData.year) {
      fetchEmployeeFinancialSummary();
    }
  }, [formData.employee, formData.month, formData.year]);

  useEffect(() => {
    if (isSuccess) {
      navigate('/payroll');
    }
  }, [isSuccess, navigate]);

  const fetchEmployeeFinancialSummary = async () => {
    if (!formData.employee || !formData.month || !formData.year) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/employees/${formData.employee}/financial_summary/?month=${formData.month}&year=${formData.year}`,
        {
          headers: {
            'Authorization': `Token ${user?.token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setFinancialSummary(data);
        setFormData(prev => ({
          ...prev,
          salary: data.remaining_amount || 0,
          currency: data.currency?.code || prev.currency,
        }));
      } else {
        setFinancialSummary({
          salary: 0,
          totalAdvances: 0,
          totalPayrolls: 0,
          remainingAmount: 0,
        });
      }
    } catch (error) {
      setFinancialSummary({
        salary: 0,
        totalAdvances: 0,
        totalPayrolls: 0,
        remainingAmount: 0,
      });
    }
  };



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.employee) newErrors.employee = t('payroll.validation.employee');
    if (!formData.month) newErrors.month = t('payroll.validation.month');
    if (!formData.year || formData.year < 2000) newErrors.year = 'Year must be 2000 or later';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Salary must be greater than 0';
    if (!formData.currency) newErrors.currency = t('payroll.validation.currency');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const payload = {
      employee: formData.employee,
      month: formData.month,
      year: formData.year,
      salary: formData.salary || 0,
      currency: formData.currency,
      payment_date: formData.payment_date,
    };
    
    handleAdd(payload);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/payroll')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-base font-boldtext-sm">{t('payroll.addPayroll')}</h1>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>{t('payroll.employee')} *</Label>
                <Autocomplete
                  endpoint="employees" getOptionLabel={(employee) => `${employee.full_name}${employee.position ? ` (${employee.position})` : ''}`} getOptionValue={(employee) => employee.id.toString()}
                  value={formData.employee}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, employee: value?.toString() || '' }));
                    if (errors.employee) setErrors((prev) => ({ ...prev, employee: '' }));
                  }}
                  placeholder={t('payroll.selectEmployee')}
                />
                {errors.employee && <p className="text-base text-destructivetext-xs">{errors.employee}</p>}
              </div>
              <div>
                <Label>{t('payroll.month')} *</Label>
                <Select value={formData.month} onValueChange={val => {
                  setFormData(prev => ({ ...prev, month: val }));
                  if (errors.month) setErrors(prev => ({ ...prev, month: '' }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('payroll.selectMonth')} />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.month && <p className="text-base text-destructivetext-xs">{errors.month}</p>}
              </div>
              <div>
                <Label>{t('payroll.year')} *</Label>
                <Input 
                  type="number"
                  value={formData.year || ''} 
                  onChange={e => {
                    setFormData(prev => ({ ...prev, year: e.target.value === '' ? new Date().getFullYear() : parseInt(e.target.value) }));
                    if (errors.year) setErrors(prev => ({ ...prev, year: '' }));
                  }}
                  placeholder={t('payroll.enterYear')} 
                />
                {errors.year && <p className="text-base text-destructivetext-xs">{errors.year}</p>}
              </div>
            </div>

            {financialSummary && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Total Salary</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {financialSummary.currency?.code || ''} {Number(financialSummary.total_salary || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Advanced Paid</div>
                      <div className="text-sm font-semibold text-orange-600">
                        {financialSummary.currency?.code || ''} {Number(financialSummary.advanced_paid || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Payroll Paid</div>
                      <div className="text-sm font-semibold text-green-600">
                        {financialSummary.currency?.code || ''} {Number(financialSummary.payroll_paid || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Overall Paid</div>
                      <div className="text-sm font-semibold text-red-600">
                        {financialSummary.currency?.code || ''} {Number(financialSummary.overall_paid || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Remaining</div>
                      <div className="text-sm font-semibold text-purple-600">
                        {financialSummary.currency?.code || ''} {Number(financialSummary.remaining_amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('payroll.salary')} *</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.salary || ''} 
                  onChange={e => {
                    setFormData(prev => ({ ...prev, salary: e.target.value === '' ? 0 : parseFloat(e.target.value) }));
                    if (errors.salary) setErrors(prev => ({ ...prev, salary: '' }));
                  }}
                  placeholder={`Max: ${(financialSummary?.remaining_amount || 0).toFixed(2)}`}
                  className="bg-blue-50 border-blue-200"
                />
                <p className="text-base text-gray-500 mt-1">Remaining amount: {financialSummary?.currency?.symbol || ''}{(financialSummary?.remaining_amount || 0).toFixed(2)} {financialSummary?.currency?.code || ''}</p>
                {errors.salary && <p className="text-base text-destructivetext-xs">{errors.salary}</p>}
              </div>
              <div>
                <Label>{t('payroll.currency')} *</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  disabled
                >
                  <option value="">Select Currency</option>
                  <option value="AFN">AFN - Afghan Afghani</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
                {errors.currency && <p className="text-base text-destructivetext-xs">{errors.currency}</p>}
              </div>
              <div>
                <Label>{t('payroll.paymentDate')}</Label>
                <Input 
                  type="date"
                  value={formData.payment_date} 
                  onChange={e => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
            </div>



            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/payroll')} disabled={loading}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <ReloadIcon className="animate-spin mr-2" />
                    {t('common.adding')}
                  </>
                ) : (
                  t('common.add')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPayroll;
