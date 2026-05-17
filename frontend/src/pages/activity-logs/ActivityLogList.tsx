import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Autocomplete } from '@/components/ui/autocomplete';
import DataTable, { TableColumn } from '@/components/ui/data-table';
import { ActivityLog } from '@/types/activity-log';
import useFetchObjects from '@/api/useFetchObjects';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ActivityLogList = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const { data: logsData, isLoading } = useFetchObjects<{
    results: ActivityLog[];
    count: number;
  }>({
    queryKey: ['activity-logs', currentPage.toString(), pageSize.toString(), searchTerm, actionFilter, modelFilter, userFilter],
    endpoint: 'activity-logs',
    params: {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      ...(actionFilter && { action: actionFilter }),
      ...(modelFilter && { model_name: modelFilter }),
      ...(userFilter && { user: userFilter })
    },
  });

  const logs = logsData?.results || [];
  const totalItems = logsData?.count || 0;

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-500',
      update: 'bg-blue-500',
      delete: 'bg-red-500',
      login: 'bg-purple-500',
      logout: 'bg-gray-500',
      view: 'bg-cyan-500',
      export: 'bg-orange-500',
      payment: 'bg-yellow-500',
    };
    return colors[action] || 'bg-gray-500';
  };

  const columns: TableColumn[] = [
    {
      key: 'created_at',
      title: t('activityLogs.dateTime'),
      render: (value) => (
        <div>
          <div>{format(new Date(value), 'MMM dd, yyyy')}</div>
          <div className="text-base text-muted-foreground">{format(new Date(value), 'HH:mm:ss')}</div>
        </div>
      )
    },
    {
      key: 'user_name',
      title: t('activityLogs.user'),
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-base text-muted-foreground">{record.user_email}</div>
        </div>
      )
    },
    {
      key: 'user_role',
      title: t('activityLogs.role'),
      render: (value) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'action',
      title: t('activityLogs.action'),
      render: (value) => (
        <Badge className={getActionColor(value)}>
          {t(`activityLogs.actions.${value}`) || value}
        </Badge>
      )
    },
    {
      key: 'model_name',
      title: t('activityLogs.model'),
      render: (value) => (
        <span className="font-mono text-smtext-xs">{value}</span>
      )
    },
    {
      key: 'description',
      title: t('activityLogs.description'),
      render: (value) => (
        <div className="max-w-md truncate" title={value}>{value}</div>
      )
    },
    {
      key: 'ip_address',
      title: t('activityLogs.ipAddress'),
      render: (value) => (
        <span className="text-base text-muted-foregroundtext-xs">{value || '-'}</span>
      )
    }
  ];

  const modelOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'StudentPayment', label: 'Student Payment' },
    { value: 'Employee', label: 'Employee' },
    { value: 'Payroll', label: 'Payroll' },
    { value: 'Advance', label: 'Advance' },
    { value: 'Shop', label: 'Shop' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'ShopRental', label: 'Shop Rental' },
    { value: 'Expense', label: 'Expense' },
    { value: 'ExpenseCategory', label: 'Expense Category' },
    { value: 'OtherIncome', label: 'Other Income' },
    { value: 'IncomeCategory', label: 'Income Category' },
    { value: 'User', label: 'User' },
    { value: 'Account', label: 'Account' },
    { value: 'JournalEntry', label: 'Journal Entry' },
    { value: 'Transaction', label: 'Transaction' },
  ];

  const customFilters = [
    {
      key: 'action',
      label: t('activityLogs.action'),
      component: (
        <Autocomplete
          options={[
            { value: 'create', label: t('activityLogs.actions.create') },
            { value: 'update', label: t('activityLogs.actions.update') },
            { value: 'delete', label: t('activityLogs.actions.delete') },
            { value: 'login', label: t('activityLogs.actions.login') },
            { value: 'logout', label: t('activityLogs.actions.logout') },
            { value: 'view', label: t('activityLogs.actions.view') },
            { value: 'export', label: t('activityLogs.actions.export') },
            { value: 'payment', label: t('activityLogs.actions.payment') },
          ]}
          value={actionFilter}
          onChange={(value) => {
            setActionFilter(value as string);
            setCurrentPage(1);
          }}
          placeholder={t('activityLogs.filterByAction')}
          getOptionLabel={(o) => o.label}
          getOptionValue={(o) => o.value}
        />
      )
    },
    {
      key: 'model',
      label: t('activityLogs.model'),
      component: (
        <Autocomplete
          options={modelOptions}
          value={modelFilter}
          onChange={(value) => {
            setModelFilter(value as string);
            setCurrentPage(1);
          }}
          placeholder={t('activityLogs.filterByModel')}
          getOptionLabel={(o) => o.label}
          getOptionValue={(o) => o.value}
        />
      )
    },
    {
      key: 'user',
      label: t('activityLogs.user'),
      component: (
        <Autocomplete
          endpoint="users"
          getOptionLabel={(u) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username}
          getOptionValue={(u) => u.id.toString()}
          value={userFilter}
          onChange={(value) => {
            setUserFilter(value as string);
            setCurrentPage(1);
          }}
          placeholder={t('activityLogs.filterByUser')}
        />
      )
    }
  ];

  const handleClearFilters = () => {
    setActionFilter('');
    setModelFilter('');
    setUserFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = actionFilter || modelFilter || userFilter || searchTerm;

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={logs}
        columns={columns}
        loading={isLoading}
        title={t('activityLogs.title')}
        subtitle={t('activityLogs.subtitle')}
        icon={<Activity className="h-5 w-5" />}
        searchable
        searchPlaceholder={t('common.search')}
        searchValue={searchTerm}
        onSearch={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        customFilters={customFilters}
        showClearFilters={hasActiveFilters}
        clearFiltersLabel={t('common.clearFilters')}
        onClearFilters={handleClearFilters}
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
        emptyIcon={<Activity className="h-8 w-8 text-muted-foreground" />}
        emptyTitle={t('activityLogs.noLogsFound')}
        emptyDescription={searchTerm ? t('common.noSearchResults') : t('activityLogs.noActivitiesLogged')}
        loadingText={t('activityLogs.loadingLogs')}
        maxHeight="75vh"
        stickyHeader={true}
      />
    </div>
  );
};

export default ActivityLogList;
