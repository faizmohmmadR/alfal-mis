import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import { User, Phone, MapPin, DollarSign, Calendar, Briefcase, ArrowLeft, Users } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';

const EmployeeDetails = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employee, isLoading } = useFetchObjects<any>({
    queryKey: ['employee', id],
    endpoint: `employees/${id}`,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <ReloadIcon className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto py-6">
        <p>Employee not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-base font-boldtext-sm">{t('employees.employeeDetails')}</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Header with Employee Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100text-sm">
                  {employee.full_name || 'Unknown Employee'}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400text-xs">{employee.position || 'No Position'}</p>
              </div>
            </div>
            <Badge variant={employee.is_active ? 'default' : 'secondary'} className="text-base px-3 py-1">
              {employee.is_active ? t('employees.active') : t('employees.inactive')}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.dateJoined')}</p>
                <p className="font-semibold text-smtext-xs">
                  {employee.created_at ? new Date(employee.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.salary')}</p>
                <p className="font-bold text-base text-base text-green-600text-xs">
                  {Number(employee.salary || 0).toFixed(2)} {employee.currency_details?.code || employee.currency || ''}
                </p>
              </div>
            </div>
            
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.phone')}</p>
                  <p className="font-medium text-blue-600text-xs">{employee.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employee Information */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {t('employees.employeeDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.fullName')}</p>
                    <p className="font-semibold text-smtext-xs">{employee.full_name || 'N/A'}</p>
                  </div>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.phone')}</p>
                      <p className="font-mediumtext-xs">{employee.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {employee.position && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.position')}</p>
                      <p className="font-mediumtext-xs">{employee.position}</p>
                    </div>
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.address')}</p>
                      <p className="font-mediumtext-xs">{employee.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {t('employees.financialSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.salary')}</p>
                  <p className="font-bold text-base text-base text-green-600text-xs">
                    {Number(employee.salary || 0).toFixed(2)} {employee.currency_details?.code || employee.currency || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-base text-gray-600 dark:text-gray-400text-xs">{t('employees.currency')}</p>
                  <p className="font-mediumtext-xs">{employee.currency_details?.name || employee.currency || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetails;
