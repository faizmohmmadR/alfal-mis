import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Autocomplete } from '@/components/ui/autocomplete';
import DataTable, { TableColumn, TableAction } from '@/components/ui/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';
import { formatNumber } from '@/lib/formatNumber';

export const ProjectList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: projectsData, isLoading } = useFetchObjects<{
    results: any[];
    count: number;
  }>({
    queryKey: ['projects', currentPage.toString(), pageSize.toString(), searchTerm, statusFilter, customerFilter],
    endpoint: 'projects/',
    params: {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      ...(statusFilter && { status: statusFilter }),
      ...(customerFilter && { customer: customerFilter })
    }
  });

  const { handleDelete, ConfirmDialog } = useDelete({
    queryKey: ['projects'],
    endpoint: 'projects'
  });

  const projects = projectsData?.results || [];
  const totalItems = projectsData?.count || 0;

  const handleDetails = (project: any) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (project: any) => {
    navigate(`/projects/${project.id}/edit`);
  };

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

  const projectColumns: TableColumn[] = [
    {
      key: 'title',
      title: t('projects.projectTitle'),
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'contract_date',
      title: t('projects.contractDate'),
      render: (value) => (
        <span>{new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      )
    },
    {
      key: 'customer_details',
      title: t('projects.customer'),
      render: (value) => (
        <Badge variant="outline">{value?.name || 'N/A'}</Badge>
      )
    },
    {
      key: 'status',
      title: t('projects.status'),
      render: (value) => (
        <Badge className={getStatusColor(value)}>
          {t(`projects.${value}`)}
        </Badge>
      )
    },
    {
      key: 'budget',
      title: t('projects.budget'),
      render: (value, record) => (
        <span className="font-medium text-primary">
          {formatNumber(value)} {record.currency}
        </span>
      )
    },
    {
      key: 'payment_percentage',
      title: t('projects.paymentPercentage'),
      render: (value) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{value?.toFixed(1)}%</span>
          </div>
          <Progress value={value} className="h-2" />
        </div>
      )
    },
    {
      key: 'remaining_amount',
      title: t('projects.remainingAmount'),
      render: (value, record) => (
        <span className="font-medium text-orange-600">
          {formatNumber(value)} {record.currency}
        </span>
      )
    }
  ];

  const projectRowActions: TableAction[] = [
    {
      key: 'view',
      label: t('projects.projectDetails'),
      icon: <Eye className="h-4 w-4" />,
      onClick: handleDetails,
      tooltip: t('projects.projectDetails')
    },
    {
      key: 'edit',
      label: t('projects.editProject'),
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      tooltip: t('projects.editProject')
    },
    {
      key: 'payment',
      label: t('projects.addPayment'),
      icon: <DollarSign className="h-4 w-4" />,
      onClick: (record) => navigate(`/project-payments/add?project=${record.id}`),
      tooltip: t('projects.addPayment')
    },
    {
      key: 'delete',
      label: t('common.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (record) => handleDelete(record.id, record.title),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      tooltip: t('common.delete')
    }
  ];

  const projectCustomFilters = [
    {
      key: 'status',
      label: t('projects.status'),
      component: (
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 w-full p-1.5 border rounded-md text-xs"
        >
          <option value="">{t('projects.allStatuses')}</option>
          <option value="pending">{t('projects.pending')}</option>
          <option value="in_progress">{t('projects.inProgress')}</option>
          <option value="completed">{t('projects.completed')}</option>
          <option value="on_hold">{t('projects.onHold')}</option>
          <option value="cancelled">{t('projects.cancelled')}</option>
        </select>
      )
    },
    {
      key: 'customer',
      label: t('projects.customer'),
      component: (
        <Autocomplete
          endpoint="customers"
          value={customerFilter}
          onChange={(value) => {
            setCustomerFilter(value);
            setCurrentPage(1);
          }}
          placeholder={t('projects.selectCustomer')}
          getOptionLabel={(c) => c.name}
          getOptionValue={(c) => c.id.toString()}
        />
      )
    }
  ];

  const handleClearFilters = () => {
    setStatusFilter('');
    setCustomerFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter || customerFilter || searchTerm;

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={projects}
        columns={projectColumns}
        loading={isLoading}
        title={t('projects.title')}
        subtitle={t('projects.manageProjects')}
        icon={<FileText className="h-5 w-5" />}
        headerActions={
          <Button onClick={() => navigate('/projects/add')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('projects.addProject')}
          </Button>
        }
        searchable
        searchPlaceholder={t('projects.searchProjects')}
        searchValue={searchTerm}
        onSearch={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        customFilters={projectCustomFilters}
        showClearFilters={hasActiveFilters}
        clearFiltersLabel={t('common.clearFilters')}
        onClearFilters={handleClearFilters}
        rowActions={projectRowActions}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalItems,
          onPageChange: setCurrentPage,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          }
        }}
        emptyIcon={<FileText className="h-8 w-8 text-muted-foreground" />}
        emptyTitle={t('projects.noProjectsFound')}
        emptyDescription={searchTerm ? t('projects.tryAdjustingSearch') : t('projects.addFirstProject')}
        loadingText={t('projects.loadingProjects')}
        maxHeight="75vh"
        stickyHeader={true}
      />

      <ConfirmDialog />
    </div>
  );
};

export default ProjectList;