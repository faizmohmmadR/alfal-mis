import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Autocomplete } from '@/components/ui/autocomplete';
import DataTable, { TableColumn, TableAction, FilterOption } from '@/components/ui/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';



export const EmployeeList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Get current month and year
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.toLocaleString('default', { month: 'long' }).toLowerCase());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: employeesData, isLoading } = useFetchObjects<{
    results: any[];
    count: number;
    next: string | null;
    previous: string | null;
  }>({
    queryKey: ['employees', currentPage.toString(), pageSize.toString(), searchTerm, statusFilter, selectedMonth, selectedYear.toString()],
    endpoint: 'employees',
    params: {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      month: selectedMonth,
      year: selectedYear,
      ...(statusFilter !== 'all' && { is_active: statusFilter })
    }
  });



  const { handleDelete, ConfirmDialog } = useDelete({
    queryKey: ['employees'],
    endpoint: 'employees'
  });

  const employees = employeesData?.results || [];
  const totalItems = employeesData?.count || 0;

  const handleEdit = (employee: any) => {
    navigate(`/employees/${employee.id}/edit`);
  };

  const handleDetails = (employee: any) => {
    navigate(`/employees/${employee.id}`);
  };

  const columns: TableColumn[] = [
    {
      key: 'full_name',
      title: t('employees.name'),
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-semibold text-xs">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'phone',
      title: t('employees.phone'),
      render: (value) => <span className="text-xs">{value || 'N/A'}</span>
    },
    {
      key: 'position',
      title: t('employees.position'),
      render: (value) => <span className="text-xs">{value || 'N/A'}</span>
    },
    {
      key: 'salary',
      title: t('employees.salary'),
      render: (value, record) => (
        <span className="font-bold text-xs text-green-600">
          {Number(value || 0).toFixed(2)} {record.currency_details?.code || record.currency || ''}
        </span>
      )
    },
    {
      key: 'financial_summary',
      title: 'Paid Salary',
      render: (value, record) => (
        <span className="font-semibold text-xs text-green-600">
          {Number(value?.total_salary_paid || 0).toFixed(2)} {record.currency_details?.code || record.currency || ''}
        </span>
      )
    },
    {
      key: 'financial_summary',
      title: 'Advances',
      render: (value, record) => (
        <span className="font-semibold text-xs text-orange-600">
          {Number(value?.total_advances_paid || 0).toFixed(2)} {record.currency_details?.code || record.currency || ''}
        </span>
      )
    },
    {
      key: 'financial_summary',
      title: 'Remaining',
      render: (value, record) => (
        <span className={`font-semibold text-xs ${Number(value?.remaining_amount || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {Number(value?.remaining_amount || 0).toFixed(2)} {record.currency_details?.code || record.currency || ''}
        </span>
      )
    },
    {
      key: 'is_active',
      title: t('employees.status'),
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? t('employees.active') : t('employees.inactive')}
        </Badge>
      )
    }
  ];

  const rowActions: TableAction[] = [
    {
      key: 'view',
      label: t('employees.viewDetails'),
      icon: <Eye className="h-4 w-4" />,
      onClick: handleDetails,
      tooltip: t('employees.viewDetails')
    },
    {
      key: 'edit',
      label: t('employees.edit'),
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      tooltip: t('employees.editEmployee')
    },
    {
      key: 'delete',
      label: t('employees.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (record) => handleDelete(record.id, record.full_name || 'Employee'),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      tooltip: t('employees.deleteEmployee')
    }
  ];

  const filters: FilterOption[] = [
    {
      key: 'month',
      label: 'Month',
      placeholder: 'Select Month',
      width: 'sm:w-40',
      options: [
        { value: 'january', label: 'January' },
        { value: 'february', label: 'February' },
        { value: 'march', label: 'March' },
        { value: 'april', label: 'April' },
        { value: 'may', label: 'May' },
        { value: 'june', label: 'June' },
        { value: 'july', label: 'July' },
        { value: 'august', label: 'August' },
        { value: 'september', label: 'September' },
        { value: 'october', label: 'October' },
        { value: 'november', label: 'November' },
        { value: 'december', label: 'December' }
      ]
    },
    {
      key: 'year',
      label: 'Year',
      placeholder: 'Select Year',
      width: 'sm:w-32',
      options: Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
      })
    },
    {
      key: 'status',
      label: t('employees.status'),
      placeholder: t('employees.filterByStatus'),
      width: 'sm:w-40',
      options: [
        { value: 'true', label: t('employees.active') },
        { value: 'false', label: t('employees.inactive') }
      ]
    }
  ];

  const filterValues = {
    month: selectedMonth,
    year: selectedYear.toString(),
    status: statusFilter
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setStatusFilter(value);
      setCurrentPage(1);
    } else if (key === 'month') {
      setSelectedMonth(value);
      setCurrentPage(1);
    } else if (key === 'year') {
      setSelectedYear(parseInt(value));
      setCurrentPage(1);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    const now = new Date();
    setSelectedMonth(now.toLocaleString('default', { month: 'long' }).toLowerCase());
    setSelectedYear(now.getFullYear());
    setStatusFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={employees}
        columns={columns}
        loading={isLoading}
        title={t('employees.title')}
        subtitle={t('employees.manageEmployeeRecords')}
        icon={<Users className="h-5 w-5" />}
        headerActions={
          <Button onClick={() => navigate('/employees/add')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('employees.addEmployee')}
          </Button>
        }
        searchable
        searchPlaceholder={t('employees.searchEmployees')}
        searchValue={searchTerm}
        onSearch={handleSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showClearFilters={true}
        clearFiltersLabel={t('employees.clearFilters')}
        onClearFilters={handleClearFilters}
        rowActions={rowActions}
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
        emptyIcon={<Users className="h-8 w-8 text-muted-foreground" />}
        emptyTitle={t('employees.noEmployeesFound')}
        emptyDescription={searchTerm ? t('employees.tryAdjustingSearch') : t('employees.addFirstEmployee')}
        loadingText={t('employees.loadingEmployees')}
        maxHeight="75vh"
        stickyHeader={true}
      />

      <ConfirmDialog />
    </div>
  );
};

export default EmployeeList;