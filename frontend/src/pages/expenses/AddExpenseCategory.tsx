import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ArrowLeft, Tag } from 'lucide-react';
import useAdd from '@/api/useAdd';

interface CategoryFormData {
  name: string;
  description?: string;
}

const defaultForm: CategoryFormData = {
  name: '',
  description: '',
};

const AddExpenseCategory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleAdd, loading, isSuccess } = useAdd<CategoryFormData>({
    queryKey: ['expense-categories'],
    endpoint: 'expense-categories/',
  });

  useEffect(() => {
    if (isSuccess) {
      navigate('/expense-categories');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    handleAdd({
      ...formData,
      name: formData.name.trim(),
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/expense-categories')} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          <h1 className="text-base md:text-base font-boldtext-sm">{t('expenses.categories.addCategory')}</h1>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('expenses.categories.name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder={t('expenses.categories.enterName')}
            />
            {errors.name && <p className="text-base text-destructivetext-xs">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">{t('expenses.description')}</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t('expenses.enterDescription')}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/expense-categories')} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpenseCategory;