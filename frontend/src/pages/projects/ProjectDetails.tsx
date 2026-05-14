import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import { formatNumber } from '@/lib/formatNumber';

const ProjectDetails = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: project, isLoading } = useFetchObjects({
    queryKey: ['project', id],
    endpoint: `projects/${id}/`,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-64">Project not found</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.back')}
      </Button>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-2">{t('projects.projectDetails')}</h1>
            <p className="text-blue-100">{project.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <FileText className="h-16 w-16 opacity-50" />
            <Button
              variant="secondary"
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('projects.projectInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('projects.projectTitle')}</p>
              <p className="font-medium">{project.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('projects.customer')}</p>
              <Badge variant="outline" className="mt-1">
                {project.customer_details?.name || 'N/A'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('projects.status')}</p>
              <Badge className={getStatusColor(project.status)}>
                {t(`projects.${project.status}`)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('projects.currency')}</p>
              <Badge variant="secondary" className="mt-1">
                {project.currency_details?.display || 'N/A'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('projects.contractDate')}</p>
              <p className="font-medium">
                {new Date(project.contract_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {project.start_date && (
              <div>
                <p className="text-xs text-muted-foreground">{t('projects.startDate')}</p>
                <p className="font-medium">
                  {new Date(project.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
            {project.end_date && (
              <div>
                <p className="text-xs text-muted-foreground">{t('projects.endDate')}</p>
                <p className="font-medium">
                  {new Date(project.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('projects.financialInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t('projects.budget')}</p>
                <p className="font-medium text-lg text-primary">
                  {formatNumber(project.budget)} {project.currency_details?.display}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('projects.paidAmount')}</p>
                <p className="font-medium text-lg text-green-600">
                  {formatNumber(project.paid_amount)} {project.currency_details?.display}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('projects.remainingAmount')}</p>
                <p className="font-medium text-lg text-orange-600">
                  {formatNumber(project.remaining_amount)} {project.currency_details?.display}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('projects.paymentProgress')}</span>
                <span className="font-medium">{project.payment_percentage?.toFixed(1)}%</span>
              </div>
              <Progress value={project.payment_percentage} className="h-3" />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => navigate(`/project-payments/add?project=${project.id}`)}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                {t('projects.addPayment')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {project.description && (
          <Card>
            <CardHeader>
              <CardTitle>{t('projects.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;