import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ArrowLeft, Users, Eye, EyeOff } from 'lucide-react';
import useAdd from '@/api/useAdd';
import useFetchObjects from '@/api/useFetchObjects';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
}

const defaultForm: UserFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'staff',
  is_active: true,
};

const AddUser = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { handleAdd, loading, isSuccess } = useAdd<UserFormData>({
    queryKey: ['users'],
    endpoint: 'users/',
  });



  useEffect(() => {
    if (isSuccess) {
      navigate('/users');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) newErrors.username = t('user.usernameRequired');
    if (!formData.email.trim()) newErrors.email = t('user.emailRequired');
    if (!formData.password.trim()) newErrors.password = t('user.passwordRequired');
    if (formData.password.length < 6) newErrors.password = t('user.passwordMinLength');
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = t('user.confirmPasswordRequired');
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('user.passwordsDoNotMatch');
    if (!formData.first_name.trim()) newErrors.first_name = t('user.firstNameRequired');
    if (!formData.last_name.trim()) newErrors.last_name = t('user.lastNameRequired');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('user.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const submitData = { ...formData };
    // Remove confirmPassword as it's not needed for the API
    delete submitData.confirmPassword;
    handleAdd(submitData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-base font-boldtext-sm">{t('user.addUser')}</h1>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">{t('user.username')} *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, username: e.target.value }));
                  if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                }}
                placeholder={t('user.enterUsername')}
              />
              {errors.username && <p className="text-base text-destructivetext-xs">{t('user.usernameRequired')}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('user.email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder={t('user.enterEmail')}
              />
              {errors.email && <p className="text-base text-destructivetext-xs">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first_name">{t('user.firstName')} *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, first_name: e.target.value }));
                  if (errors.first_name) setErrors((prev) => ({ ...prev, first_name: '' }));
                }}
                placeholder={t('user.enterFirstName')}
              />
              {errors.first_name && <p className="text-base text-destructivetext-xs">{t('user.firstNameRequired')}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">{t('user.lastName')} *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, last_name: e.target.value }));
                  if (errors.last_name) setErrors((prev) => ({ ...prev, last_name: '' }));
                }}
                placeholder={t('user.enterLastName')}
              />
              {errors.last_name && <p className="text-base text-destructivetext-xs">{t('user.lastNameRequired')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">{t('user.password')} *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, password: e.target.value }));
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder={t('user.enterPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.password && <p className="text-base text-destructivetext-xs">{errors.password}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">{t('user.confirmPassword')} *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder={t('user.confirmPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-base text-destructivetext-xs">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">{t('user.phone')}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder={t('user.enterPhone')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">{t('user.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('user.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('user.roles.admin')}</SelectItem>
                  <SelectItem value="staff">{t('user.roles.staff')}</SelectItem>
                  <SelectItem value="employee">{t('user.roles.employee')}</SelectItem>
                  <SelectItem value="customer">{t('user.roles.customer')}</SelectItem>
                  <SelectItem value="vendor">{t('user.roles.vendor')}</SelectItem>

                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData((prev) => ({ ...prev, is_active: checked as boolean }))
              }
            />
            <Label htmlFor="is_active">{t('user.isActive')}</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/users')} disabled={loading}>
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

export default AddUser;