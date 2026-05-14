import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Autocomplete } from '@/components/ui/autocomplete';
import DataTable, { TableColumn, TableAction } from '@/components/ui/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';
import { formatNumber } from '@/lib/formatNumber';

export const ProjectPaymentList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: paymentsData, isLoading } = useFetchObjects<{
    results: any[];
    count: number;
  }>({
    queryKey: ['project-payments', currentPage.toString(), pageSize.toString(), searchTerm, projectFilter, methodFilter],
    endpoint: 'project-payments/',
    params: {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      ...(projectFilter && { project: projectFilter }),
      ...(methodFilter && { payment_method: methodFilter })
    }
  });

  const { handleDelete, ConfirmDialog } = useDelete({
    queryKey: ['project-payments'],
    endpoint: 'project-payments'
  });

  const payments = paymentsData?.results || [];
  const totalItems = paymentsData?.count || 0;

  const paymentColumns: TableColumn[] = [
    {
      key: 'project_details',
      title: t('projects.project'),
      render: (value) => (
        <Badge variant="outline">{value?.title || 'N/A'}</Badge>
      )
    },
    {
      key: 'amount',
      title: t('projects.amount'),
      render: (value, record) => (
        <span className="font-medium text-primary">
          {formatNumber(value)} {record.project_details?.currency_display}
        </span>
      )
    },
    {
      key: 'payment_date',
      title: t('projects.paymentDate'),
      render: (value) => (
        <div>{new Date(value).toLocaleDateString()}</div>
      )
    },
    {
      key: 'payment_method',
      title: t('projects.paymentMethod'),
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'reference_number',
      title: t('projects.referenceNumber'),
      render: (value) => (
        <span className="text-sm">{value || '-'}</span>
      )
    }
  ];

  const paymentRowActions: TableAction[] = [
    {
      key: 'edit',
      label: t('common.edit'),
      icon: <Edit className="h-4 w-4" />,
      onClick: (record) => navigate(`/project-payments/${record.id}/edit`),
      tooltip: t('common.edit')
    },
    {
      key: 'delete',
      label: t('common.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (record) => handleDelete(record.id, `Payment ${formatNumber(record.amount)}`),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      tooltip: t('common.delete')
    }
  ];

  const paymentCustomFilters = [
    {
      key: 'project',
      label: t('projects.project'),
      component: (
        <Autocomplete
          endpoint="projects"
          value={projectFilter}
          onChange={(value) => {
            setProjectFilter(value);
            setCurrentPage(1);
          }}
          placeholder={t('projects.selectProject')}
          getOptionLabel={(p) => p.title}
          getOptionValue={(p) => p.id.toString()}
        />
      )
    },
    {
      key: 'method',
      label: t('projects.paymentMethod'),
      component: (
        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 w-full p-1.5 border rounded-md text-xs"
        >
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Check</option>
          <option value="credit_card">Credit Card</option>
        </select>
      )
    }
  ];

  const handleClearFilters = () => {
    setProjectFilter('');
    setMethodFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = projectFilter || methodFilter || searchTerm;

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={payments}
        columns={paymentColumns}
        loading={isLoading}
        title={t('projects.projectPayments')}
        subtitle={t('projects.managePayments')}
        icon={<DollarSign className="h-5 w-5" />}
        headerActions={
          <Button onClick={() => navigate('/project-payments/add')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('projects.addPayment')}
          </Button>
        }
        searchable
        searchPlaceholder={t('projects.searchPayments')}
        searchValue={searchTerm}
        onSearch={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        customFilters={paymentCustomFilters}
        showClearFilters={hasActiveFilters}
        clearFiltersLabel={t('common.clearFilters')}
        onClearFilters={handleClearFilters}
        rowActions={paymentRowActions}
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
        emptyIcon={<DollarSign className="h-8 w-8 text-muted-foreground" />}
        emptyTitle={t('projects.noPaymentsFound')}
        emptyDescription={searchTerm ? t('projects.tryAdjustingSearch') : t('projects.addFirstPayment')}
        loadingText={t('projects.loadingPayments')}
        maxHeight="75vh"
        stickyHeader={true}
      />

      <ConfirmDialog />
    </div>
  );
};

export default ProjectPaymentList;