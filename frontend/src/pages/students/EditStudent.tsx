import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft } from 'lucide-react';
import useUpdate from '@/api/useUpdate';
import useFetchObject from '@/api/useFetchObject';

interface StudentFormData {
  full_name: string;
  father_name: string;
  grandfather_name?: string;
  date_of_birth: string;
  gender: string;
  tazkira_number: string;
  permanent_address: string;
  current_address: string;
  province: string;
  district: string;
  area: string;
  parent_phone: string;
  student_phone?: string;
  alternative_phone?: string;
  email?: string;
  registration_number: string;
  registration_date: string;
  category?: string;
  status: string;
  transportation: string;
}

const EditStudent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentFormData>({
    full_name: '',
    father_name: '',
    grandfather_name: '',
    date_of_birth: new Date().toISOString().split('T')[0],
    gender: 'male',
    tazkira_number: '',
    permanent_address: '',
    current_address: '',
    province: '',
    district: '',
    area: '',
    parent_phone: '',
    student_phone: '',
    alternative_phone: '',
    email: '',
    registration_number: '',
    registration_date: new Date().toISOString().split('T')[0],
    category: '',
    status: 'active',
    transportation: 'school_bus',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const studentId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['student', studentId],
    endpoint: `students/${studentId}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['students'],
  });

  useEffect(() => {
    if (data) {
      setFormData({
        full_name: data.full_name || '',
        father_name: data.father_name || '',
        grandfather_name: data.grandfather_name || '',
        date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : new Date().toISOString().split('T')[0],
        gender: data.gender || 'male',
        tazkira_number: data.tazkira_number || '',
        permanent_address: data.permanent_address || '',
        current_address: data.current_address || '',
        province: data.province || '',
        district: data.district || '',
        area: data.area || '',
        parent_phone: data.parent_phone || '',
        student_phone: data.student_phone || '',
        alternative_phone: data.alternative_phone || '',
        email: data.email || '',
        registration_number: data.registration_number || '',
        registration_date: data.registration_date ? data.registration_date.slice(0, 10) : new Date().toISOString().split('T')[0],
        category: data.category || '',
        status: data.status || 'active',
        transportation: data.transportation || 'school_bus',
      });
    }
  }, [data]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = t('students.validation.fullName');
    if (!formData.father_name.trim()) newErrors.father_name = t('students.validation.fatherName');
    if (!formData.tazkira_number.trim()) newErrors.tazkira_number = t('students.validation.tazkiraNumber');
    if (!formData.registration_number.trim()) newErrors.registration_number = t('students.validation.registrationNumber');
    if (!formData.registration_date) newErrors.registration_date = t('students.validation.registrationDate');
    if (!formData.parent_phone.trim()) newErrors.parent_phone = t('students.validation.phone');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    handleUpdate(studentId, formData);
  };

  if (fetching) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold">{t('students.editStudent')}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("students.fullName")} *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, full_name: e.target.value }));
                    if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: "" }));
                  }}
                  placeholder={t("students.fullName")}
                />
                {errors.full_name && <p className="text-base text-destructive text-xs">{errors.full_name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="father_name">{t("students.fatherName")} *</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, father_name: e.target.value }));
                    if (errors.father_name) setErrors((prev) => ({ ...prev, father_name: "" }));
                  }}
                  placeholder={t("students.fatherName")}
                />
                {errors.father_name && <p className="text-base text-destructive text-xs">{errors.father_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grandfather_name">{t("students.grandfatherName")}</Label>
                <Input
                  id="grandfather_name"
                  value={formData.grandfather_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, grandfather_name: e.target.value }))}
                  placeholder={t("students.grandfatherName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">{t("students.dateOfBirth")} *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">{t("students.gender")} *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("students.selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("students.gender.male")}</SelectItem>
                    <SelectItem value="female">{t("students.gender.female")}</SelectItem>
                    <SelectItem value="other">{t("students.gender.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tazkira_number">{t("students.tazkiraNumber")} *</Label>
                <Input
                  id="tazkira_number"
                  value={formData.tazkira_number}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, tazkira_number: e.target.value }));
                    if (errors.tazkira_number) setErrors((prev) => ({ ...prev, tazkira_number: "" }));
                  }}
                  placeholder={t("students.tazkiraNumber")}
                />
                {errors.tazkira_number && <p className="text-base text-destructive text-xs">{errors.tazkira_number}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permanent_address">{t("students.permanentAddress")} *</Label>
              <Input
                id="permanent_address"
                value={formData.permanent_address}
                onChange={(e) => setFormData((prev) => ({ ...prev, permanent_address: e.target.value }))}
                placeholder={t("students.permanentAddress")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_address">{t("students.currentAddress")} *</Label>
              <Input
                id="current_address"
                value={formData.current_address}
                onChange={(e) => setFormData((prev) => ({ ...prev, current_address: e.target.value }))}
                placeholder={t("students.currentAddress")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">{t("students.province")} *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                  placeholder={t("students.province")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">{t("students.district")} *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                  placeholder={t("students.district")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">{t("students.area")} *</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                  placeholder={t("students.area")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_phone">{t("students.parentPhone")} *</Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, parent_phone: e.target.value }));
                    if (errors.parent_phone) setErrors((prev) => ({ ...prev, parent_phone: "" }));
                  }}
                  placeholder={t("students.parentPhone")}
                />
                {errors.parent_phone && <p className="text-base text-destructive text-xs">{errors.parent_phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_phone">{t("students.studentPhone")}</Label>
                <Input
                  id="student_phone"
                  value={formData.student_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, student_phone: e.target.value }))}
                  placeholder={t("students.studentPhone")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alternative_phone">{t("students.alternativePhone")}</Label>
                <Input
                  id="alternative_phone"
                  value={formData.alternative_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, alternative_phone: e.target.value }))}
                  placeholder={t("students.alternativePhone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("students.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder={t("students.email")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_number">{t("students.registrationNumber")} *</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, registration_number: e.target.value }));
                    if (errors.registration_number) setErrors((prev) => ({ ...prev, registration_number: "" }));
                  }}
                  placeholder={t("students.registrationNumber")}
                />
                {errors.registration_number && <p className="text-base text-destructive text-xs">{errors.registration_number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_date">{t("students.registrationDate")} *</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, registration_date: e.target.value }));
                    if (errors.registration_date) setErrors((prev) => ({ ...prev, registration_date: "" }));
                  }}
                />
                {errors.registration_date && <p className="text-base text-destructive text-xs">{errors.registration_date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t("students.category")}</Label>
                <Autocomplete
                  endpoint="student-categories"
                  value={formData.category}
                  onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  placeholder={t("students.selectCategory")}
                  getOptionLabel={(c) => c.name}
                  getOptionValue={(c) => c.id.toString()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t("students.status")} *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("students.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("students.status.active")}</SelectItem>
                    <SelectItem value="inactive">{t("students.status.inactive")}</SelectItem>
                    <SelectItem value="graduated">{t("students.status.graduated")}</SelectItem>
                    <SelectItem value="suspended">{t("students.status.suspended")}</SelectItem>
                    <SelectItem value="transferred">{t("students.status.transferred")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportation">{t("students.transportation")} *</Label>
              <Select
                value={formData.transportation}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, transportation: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("students.selectTransportation")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school_bus">{t("students.transportationOptions.school_bus")}</SelectItem>
                  <SelectItem value="private_vehicle">{t("students.transportationOptions.private_vehicle")}</SelectItem>
                  <SelectItem value="walking">{t("students.transportationOptions.walking")}</SelectItem>
                  <SelectItem value="public_transport">{t("students.transportationOptions.public_transport")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/students')} disabled={loading}>
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

export default EditStudent;
