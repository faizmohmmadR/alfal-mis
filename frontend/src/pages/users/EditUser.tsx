import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ArrowLeft, Users, Eye, EyeOff } from 'lucide-react';
import useUpdate from '@/api/useUpdate';
import useFetchObjects from '@/api/useFetchObjects';

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;

  is_active: boolean;
  is_buyer: boolean;
  is_seller: boolean;
  is_finance: boolean;
}

interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;

  is_active: boolean;
  password?: string;
  confirmPassword?: string;
}

const EditUser = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isAdmin = currentUser?.is_admin || currentUser?.is_staff;
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'staff',

    is_active: true,
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: user, isLoading: userLoading } = useFetchObjects<User>({
    queryKey: ['user', id],
    endpoint: `users/${id}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate<UserFormData>({
    queryKey: ['users'],
    endpoint: 'users',
  });



  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role || 'staff',

        is_active: user.is_active,
        password: '',
        confirmPassword: '',
      });
      setErrors({});
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      navigate('/users');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) newErrors.username = t('user.usernameRequired');
    if (!formData.email.trim()) newErrors.email = t('user.emailRequired');
    if (!formData.first_name.trim()) newErrors.first_name = t('user.firstNameRequired');
    if (!formData.last_name.trim()) newErrors.last_name = t('user.lastNameRequired');
    
    // Password validation (only if password is provided)
    if (formData.password && formData.password.trim()) {
      if (formData.password.length < 6) newErrors.password = t('user.passwordMinLength');
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('user.passwordsDoNotMatch');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('user.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm() || !user) return;
    const submitData = { ...formData };

    // Remove password fields if empty
    if (!submitData.password?.trim()) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }
    handleUpdate(user.id, submitData);
  };

  if (userLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <ReloadIcon className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-base font-boldtext-sm">{t('user.editUser')}</h1>
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
              {errors.username && <p className="text-base text-destructivetext-xs">{errors.username}</p>}
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
              {errors.first_name && <p className="text-base text-destructivetext-xs">{errors.first_name}</p>}
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
              {errors.last_name && <p className="text-base text-destructivetext-xs">{errors.last_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('user.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder={t('user.enterPhone')}
              />
            </div>
            {isAdmin && (
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
            )}
          </div>

          {isAdmin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">{t('user.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }));
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder={t('user.enterNewPassword')}
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
                <Label htmlFor="confirmPassword">{t('user.confirmNewPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword || ''}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder={t('user.confirmNewPassword')}
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
          )}

          {isAdmin && (
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
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/users')} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <ReloadIcon className="animate-spin mr-2" />
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

export default EditUser;