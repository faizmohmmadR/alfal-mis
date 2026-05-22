import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft, Tag } from 'lucide-react';
import useUpdate from '@/api/useUpdate';
import useFetchObject from '@/api/useFetchObject';

interface CategoryFormData {
  name: string;
  description?: string;
}

const EditExpenseCategory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading: fetching } = useFetchObject({
    queryKey: ['expense-category', id],
    endpoint: `expense-categories/${id}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({ queryKey: ['expense-categories'] });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) navigate('/expense-categories');
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm() || !id) return;
    handleUpdate(id, { ...formData, name: formData.name.trim() });
  };

  if (fetching) return <div className="container mx-auto py-6 text-center">{t('common.loading')}</div>;

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/expense-categories')} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('expenses.categories.editCategory')}</h1>
            <p className="text-sm text-muted-foreground">{t('expenses.categories.manageCategories', 'Manage expense categories')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {t('expenses.categories.categoryDetails', 'Category Details')}
          </CardTitle>
          <CardDescription>{t('expenses.categories.editCategoryDesc', 'Update expense category information')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">{t('expenses.categories.name')} <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder={t('expenses.categories.enterName')}
              className="h-10"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">{t('expenses.description')}</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t('expenses.enterDescription')}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/expense-categories')} disabled={loading} className="h-10 px-6">{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading} className="h-10 px-6">
              {loading ? <><RotateCw className="animate-spin mr-2" />{t('common.updating')}</> : t('common.update')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditExpenseCategory;
