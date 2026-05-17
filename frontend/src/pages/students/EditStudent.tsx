import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCw, ArrowLeft, Upload, X, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
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
  status: string;
  transportation: string;
  class_level: string;
  payment_cycle: string;
  monthly_fee: string;
  yearly_fee: string;
  currency: string;
  photo?: File | null;
  tazkira_copy?: File | null;
  parent_tazkira_copy?: File | null;
  previous_result_card?: File | null;
  payment_receipt?: File | null;
}

interface ExistingFiles {
  photo?: string;
  tazkira_copy?: string;
  parent_tazkira_copy?: string;
  previous_result_card?: string;
  payment_receipt?: string;
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
    status: 'active',
    transportation: 'school_bus',
    class_level: '',
    payment_cycle: 'monthly',
    monthly_fee: '0',
    yearly_fee: '0',
    currency: 'AFN',
    photo: null,
    tazkira_copy: null,
    parent_tazkira_copy: null,
    previous_result_card: null,
    payment_receipt: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<{
    photo?: string;
    tazkira_copy?: string;
    parent_tazkira_copy?: string;
    previous_result_card?: string;
    payment_receipt?: string;
  }>({});
  const [existingFiles, setExistingFiles] = useState<ExistingFiles>({});

  const photoRef = useRef<HTMLInputElement>(null);
  const tazkiraCopyRef = useRef<HTMLInputElement>(null);
  const parentTazkiraCopyRef = useRef<HTMLInputElement>(null);
  const previousResultCardRef = useRef<HTMLInputElement>(null);
  const paymentReceiptRef = useRef<HTMLInputElement>(null);

  const studentId = window.location.pathname.split('/').pop();
  const { data, loading: fetching } = useFetchObject({
    queryKey: ['student', studentId],
    endpoint: `students/${studentId}/`,
  });

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['students'],
  });

  useEffect(() => {
    if (isSuccess) {
      navigate('/students');
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (isSuccess) {
      navigate('/students');
    }
  }, [isSuccess, navigate]);

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
        status: data.status || 'active',
        transportation: data.transportation || 'school_bus',
        class_level: data.class_level ? String(data.class_level) : '',
        payment_cycle: data.payment_cycle || 'monthly',
        monthly_fee: data.monthly_fee ? String(data.monthly_fee) : '0',
        yearly_fee: data.yearly_fee ? String(data.yearly_fee) : '0',
        currency: data.currency || 'AFN',
        photo: null,
        tazkira_copy: null,
        parent_tazkira_copy: null,
        previous_result_card: null,
        payment_receipt: null,
      });

      // Set existing file URLs
      setExistingFiles({
        photo: data.photo || undefined,
        tazkira_copy: data.tazkira_copy || undefined,
        parent_tazkira_copy: data.parent_tazkira_copy || undefined,
        previous_result_card: data.previous_result_card || undefined,
        payment_receipt: data.payment_receipt || undefined,
      });
    }
  }, [data]);

  const handleFileChange = (field: keyof typeof previews, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
      // Clear existing file when new file is selected
      setExistingFiles((prev) => ({ ...prev, [field]: undefined }));
    } else {
      setPreviews((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const clearFile = (field: keyof typeof previews, ref: React.RefObject<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: undefined }));
    setExistingFiles((prev) => ({ ...prev, [field]: undefined }));
    if (ref.current) ref.current.value = '';
  };

  const FilePreview = ({ 
    preview, 
    existingUrl,
    fieldName, 
    onClear, 
    ref 
  }: { 
    preview?: string;
    existingUrl?: string;
    fieldName: string; 
    onClear: () => void;
    ref: React.RefObject<HTMLInputElement>;
  }) => {
    const displayUrl = preview || existingUrl;
    if (!displayUrl) return null;
    
    const isImage = displayUrl.startsWith('data:image') || 
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(displayUrl);
    
    return (
      <div className="mt-2 relative inline-block group">
        {isImage ? (
          <img 
            src={displayUrl} 
            alt={fieldName} 
            className="h-20 w-20 object-cover rounded-lg border"
          />
        ) : (
          <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-lg border">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <button
          type="button"
          onClick={onClear}
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
        >
          <X className="h-3 w-3" />
        </button>
        {existingUrl && !preview && (
          <a
            href={existingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  };

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
    
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        submitData.append(key, value as string | Blob);
      }
    });
    
    handleUpdate(studentId, submitData);
  };

  if (fetching) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  const FileUploadField = React.forwardRef<HTMLInputElement, { 
    label: string; 
    field: keyof typeof previews; 
    accept?: string;
  }>(({ label, field, accept = "image/*,.pdf" }, forwardedRef) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <input
          ref={forwardedRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => forwardedRef.current?.click()}
          className="h-9"
        >
          <Upload className="h-4 w-4 mr-2" />
          {t('common.upload', 'Upload')}
        </Button>
        {(previews[field] || existingFiles[field]) && (
          <FilePreview 
            preview={previews[field]}
            existingUrl={existingFiles[field]}
            fieldName={label} 
            onClear={() => clearFile(field, forwardedRef as React.RefObject<HTMLInputElement>)}
            ref={forwardedRef as React.RefObject<HTMLInputElement>}
          />
        )}
      </div>
    </div>
  ));

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
          {/* Photo Upload at top */}
          <div className="flex justify-center">
            <div className="text-center">
              <div 
                className="h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                onClick={() => photoRef.current?.click()}
              >
                {(previews.photo || existingFiles.photo) ? (
                  <img 
                    src={previews.photo || existingFiles.photo} 
                    alt={t('students.photo')} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">{t('students.photo')}</span>
                  </div>
                )}
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
              />
              {(previews.photo || existingFiles.photo) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFile('photo', photoRef)}
                  className="mt-2 h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {t('common.remove')}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Personal Information */}
            <h3 className="section-header">{t('students.studentInformation')}</h3>
            
            <div className="sectionFieldGrid">
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
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
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
                {errors.father_name && <p className="text-xs text-destructive">{errors.father_name}</p>}
              </div>
            </div>

            <div className="sectionFieldGrid">
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

            <div className="sectionFieldGrid">
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
                {errors.tazkira_number && <p className="text-xs text-destructive">{errors.tazkira_number}</p>}
              </div>
            </div>

            {/* Address Information */}
            <h3 className="section-header--bottom">{t('students.addressInformation', 'Address Information')}</h3>

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

            <div className="sectionFieldGrid--three">
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

            {/* Contact Information */}
            <h3 className="section-header--bottom">{t('students.contactInformation', 'Contact Information')}</h3>

            <div className="sectionFieldGrid">
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
                {errors.parent_phone && <p className="text-xs text-destructive">{errors.parent_phone}</p>}
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

            <div className="sectionFieldGrid">
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

            {/* Registration Information */}
            <h3 className="section-header--bottom">{t('students.registrationInformation', 'Registration Information')}</h3>

            <div className="sectionFieldGrid">
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
                {errors.registration_number && <p className="text-xs text-destructive">{errors.registration_number}</p>}
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
                {errors.registration_date && <p className="text-xs text-destructive">{errors.registration_date}</p>}
              </div>
            </div>

            <div className="sectionFieldGrid">
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
                    <SelectItem value="active">{t("students.statusOptions.active")}</SelectItem>
                    <SelectItem value="inactive">{t("students.statusOptions.inactive")}</SelectItem>
                    <SelectItem value="graduated">{t("students.statusOptions.graduated")}</SelectItem>
                    <SelectItem value="suspended">{t("students.statusOptions.suspended")}</SelectItem>
                    <SelectItem value="transferred">{t("students.statusOptions.transferred")}</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Class & Fee Information */}
            <h3 className="section-header--bottom">{t('students.classFeeInformation', 'Class & Fee Information')}</h3>

            <div className="sectionFieldGrid">
              <div className="space-y-2">
                <Label htmlFor="class_level">{t("students.classLevel")} *</Label>
                <Select
                  value={formData.class_level}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, class_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("students.selectClassLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((lv) => (
                      <SelectItem key={lv} value={lv}>{t('students.classLevelShort', 'Class')} {lv}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_cycle">{t("students.paymentCycle")} *</Label>
                <Select
                  value={formData.payment_cycle}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_cycle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("students.selectPaymentCycle")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("students.paymentCycleOptions.monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("students.paymentCycleOptions.yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="sectionFieldGrid">
              <div className="space-y-2">
                <Label htmlFor="monthly_fee">{t("students.monthlyFee")}</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  step="0.01"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, monthly_fee: e.target.value }))}
                  placeholder={t("students.enterMonthlyFee")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly_fee">{t("students.yearlyFee")}</Label>
                <Input
                  id="yearly_fee"
                  type="number"
                  step="0.01"
                  value={formData.yearly_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, yearly_fee: e.target.value }))}
                  placeholder={t("students.enterYearlyFee")}
                />
              </div>
            </div>

            <div className="sectionFieldGrid">
              <div className="space-y-2">
                <Label htmlFor="fee_currency">{t("students.feeCurrency")}</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AFN">{t("student-payments.afn")}</SelectItem>
                    <SelectItem value="USD">{t("student-payments.usd")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Documents */}
            <h3 className="section-header--bottom">{t('students.documents', 'Documents')}</h3>

            <div className="sectionFieldGrid">
              <FileUploadField 
                label={t("students.tazkiraCopy")} 
                field="tazkira_copy" 
                ref={tazkiraCopyRef}
              />
              <FileUploadField 
                label={t("students.parentTazkiraCopy")} 
                field="parent_tazkira_copy" 
                ref={parentTazkiraCopyRef}
              />
            </div>

            <div className="sectionFieldGrid">
              <FileUploadField 
                label={t("students.previousResultCard")} 
                field="previous_result_card" 
                ref={previousResultCardRef}
              />
              <FileUploadField 
                label={t("students.paymentReceipt")} 
                field="payment_receipt" 
                ref={paymentReceiptRef}
              />
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
