import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObject from '@/api/useFetchObject';
import { 
  ArrowLeft, 
  Edit, 
  Printer, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Bus,
  IdCard,
  GraduationCap,
  DollarSign,
  ExternalLink,
  Eye,
  Download
} from 'lucide-react';

interface Student {
  id: number;
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
  photo?: string;
  tazkira_copy?: string;
  parent_tazkira_copy?: string;
  previous_result_card?: string;
  payment_receipt?: string;
  age?: number;
  financial_summary?: {
    total_payments: number;
    remaining_balance: number;
    registration_number: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

const StudentDetails = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: student, isLoading } = useFetchObject<Student>({
    queryKey: ['student', id],
    endpoint: `students/${id}/`,
  });

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      graduated: 'bg-blue-100 text-blue-800 border-blue-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      transferred: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      male: t('students.gender.male'),
      female: t('students.gender.female'),
      other: t('students.gender.other'),
    };
    return labels[gender] || gender;
  };

  const getTransportationLabel = (transportation: string) => {
    const labels: Record<string, string> = {
      school_bus: t('students.transportationOptions.school_bus'),
      private_vehicle: t('students.transportationOptions.private_vehicle'),
      walking: t('students.transportationOptions.walking'),
      public_transport: t('students.transportationOptions.public_transport'),
    };
    return labels[transportation] || transportation;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AFN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-muted-foreground">
          {t('students.noStudentsFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl print:py-0">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t('students.studentDetails')}</h1>
            <p className="text-sm text-muted-foreground">{student.registration_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            {t('common.print', 'Print')}
          </Button>
          <Button onClick={() => navigate(`/students/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-primary pb-4">
        <h1 className="text-2xl font-bold text-primary">Noor Ul-Falah</h1>
        <p className="text-sm text-muted-foreground">Management Information System</p>
        <h2 className="text-lg font-semibold mt-4">Student Registration Form</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photo & Quick Info */}
        <div className="space-y-6">
          {/* Photo Card */}
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {student.photo ? (
                <img 
                  src={student.photo} 
                  alt={student.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-24 w-24 text-muted-foreground/50" />
              )}
            </div>
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold">{student.full_name}</h3>
              <p className="text-sm text-muted-foreground">{student.registration_number}</p>
              <Badge className={`mt-2 ${getStatusColor(student.status)}`}>
                {t(`students.statusOptions.${student.status}`, student.status)}
              </Badge>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('students.financialSummary', 'Financial Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t('students.totalPayments', 'Total Payments')}
                </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(student.financial_summary?.total_payments || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t('students.remainingBalance', 'Remaining Balance')}
                </span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(student.financial_summary?.remaining_balance || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('students.studentInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sectionFieldGrid">
                <InfoRow 
                  label={t('students.fullName')} 
                  value={student.full_name} 
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.fatherName')} 
                  value={student.father_name} 
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.grandfatherName')} 
                  value={student.grandfather_name} 
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.dateOfBirth')} 
                  value={formatDate(student.date_of_birth)} 
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />
                {student.age && (
                  <InfoRow 
                    label={t('students.age', 'Age')} 
                    value={`${student.age} years`} 
                    icon={<Calendar className="h-3.5 w-3.5" />}
                  />
                )}
                <InfoRow 
                  label={t('students.gender')} 
                  value={getGenderLabel(student.gender)} 
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.tazkiraNumber')} 
                  value={student.tazkira_number} 
                  icon={<IdCard className="h-3.5 w-3.5" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('students.addressInformation', 'Address Information')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sectionFieldGrid">
                <div className="md:col-span-2">
                  <InfoRow 
                    label={t('students.permanentAddress')} 
                    value={student.permanent_address} 
                    icon={<MapPin className="h-3.5 w-3.5" />}
                  />
                </div>
                <div className="md:col-span-2">
                  <InfoRow 
                    label={t('students.currentAddress')} 
                    value={student.current_address} 
                    icon={<MapPin className="h-3.5 w-3.5" />}
                  />
                </div>
                <InfoRow 
                  label={t('students.province')} 
                  value={student.province} 
                  icon={<MapPin className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.district')} 
                  value={student.district} 
                  icon={<MapPin className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.area')} 
                  value={student.area} 
                  icon={<MapPin className="h-3.5 w-3.5" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('students.contactInformation', 'Contact Information')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sectionFieldGrid">
                <InfoRow 
                  label={t('students.parentPhone')} 
                  value={student.parent_phone} 
                  icon={<Phone className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.studentPhone')} 
                  value={student.student_phone} 
                  icon={<Phone className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.alternativePhone')} 
                  value={student.alternative_phone} 
                  icon={<Phone className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.email')} 
                  value={student.email} 
                  icon={<Mail className="h-3.5 w-3.5" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Registration Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {t('students.registrationInformation', 'Registration Information')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sectionFieldGrid">
                <InfoRow 
                  label={t('students.registrationNumber')} 
                  value={student.registration_number} 
                  icon={<IdCard className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.registrationDate')} 
                  value={formatDate(student.registration_date)} 
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.status')} 
                  value={
                    <Badge className={getStatusColor(student.status)}>
                      {t(`students.statusOptions.${student.status}`, student.status)}
                    </Badge>
                  }
                  icon={<GraduationCap className="h-3.5 w-3.5" />}
                />
                <InfoRow 
                  label={t('students.transportation')} 
                  value={getTransportationLabel(student.transportation)} 
                  icon={<Bus className="h-3.5 w-3.5" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('students.documents', 'Documents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sectionFieldGrid">
                <DocumentRow 
                  label={t('students.tazkiraCopy')} 
                  url={student.tazkira_copy} 
                  viewText={t('common.view', 'View')}
                  notUploadedText={t('common.notUploaded', 'Not Uploaded')}
                  downloadText={t('common.download', 'Download')}
                  previewText={t('common.preview', 'Preview')}
                />
                <DocumentRow 
                  label={t('students.parentTazkiraCopy')} 
                  url={student.parent_tazkira_copy} 
                  viewText={t('common.view', 'View')}
                  notUploadedText={t('common.notUploaded', 'Not Uploaded')}
                  downloadText={t('common.download', 'Download')}
                  previewText={t('common.preview', 'Preview')}
                />
                <DocumentRow 
                  label={t('students.previousResultCard')} 
                  url={student.previous_result_card} 
                  viewText={t('common.view', 'View')}
                  notUploadedText={t('common.notUploaded', 'Not Uploaded')}
                  downloadText={t('common.download', 'Download')}
                  previewText={t('common.preview', 'Preview')}
                />
                <DocumentRow 
                  label={t('students.paymentReceipt')} 
                  url={student.payment_receipt} 
                  viewText={t('common.view', 'View')}
                  notUploadedText={t('common.notUploaded', 'Not Uploaded')}
                  downloadText={t('common.download', 'Download')}
                  previewText={t('common.preview', 'Preview')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>Generated on: {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p className="mt-1">Noor Ul-Falah Management Information System</p>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value?: string | React.ReactNode; 
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col space-y-1">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-sm font-medium pl-5">
      {value || <span className="text-muted-foreground">N/A</span>}
    </div>
  </div>
);

const DocumentRow = ({ 
  label, 
  url,
  viewText,
  notUploadedText,
  downloadText,
  previewText,
}: { 
  label: string; 
  url?: string;
  viewText: string;
  notUploadedText: string;
  downloadText: string;
  previewText: string;
}) => {
  if (!url) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{notUploadedText}</span>
      </div>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff?)$/i.test(url);

  if (isImage) {
    return (
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 shrink-0">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <button
          type="button"
          onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}
          className="block h-20 w-20 flex-shrink-0 rounded-lg border bg-background overflow-hidden cursor-pointer group"
        >
          <img
            src={url}
            alt={label}
            className="h-full w-full object-cover group-hover:opacity-80 transition-opacity"
          />
        </button>
      </div>
    );
  }

  const docType = url.split('.').pop()?.toLowerCase() || 'pdf';

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}
          className="h-8 gap-1"
        >
          <Eye className="h-3.5 w-3.5" />
          {previewText}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          asChild
          className="h-8 gap-1"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            {viewText}
          </a>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          asChild
          className="h-8 gap-1"
        >
          <a href={url} download>
            <Download className="h-3.5 w-3.5" />
            {downloadText}
          </a>
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {label}
            </DialogTitle>
            <DialogDescription>
              {t('students.documentsPreview', 'Document preview')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 border rounded-lg overflow-hidden bg-muted/30">
            <iframe
              src={`${previewUrl || ''}#toolbar=0&navpanes=0&scrollbar=1`}
              title={label}
              className="w-full h-[65vh]"
              style={{ border: 'none' }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.open(previewUrl!, '_blank')}
              className="gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {viewText}
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => previewUrl && window.open(previewUrl, '_blank')}
              className="gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              {downloadText}
            </Button>
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              {t('common.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetails;
