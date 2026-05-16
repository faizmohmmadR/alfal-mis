import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Autocomplete } from '@/components/ui/autocomplete';
import DataTable, { TableColumn, TableAction } from '@/components/ui/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';

export const StudentList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: studentsData, isLoading } = useFetchObjects<{
    results: { id: number | string; registration_number?: string; full_name?: string; father_name?: string; category_details?: { name?: string }; status?: string; phone?: string }[];
    count: number;
  }>({
    queryKey: ['students', currentPage.toString(), pageSize.toString(), searchTerm, statusFilter, categoryFilter],
    endpoint: 'students/',
    params: {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      ...(statusFilter && { status: statusFilter }),
      ...(categoryFilter && { category: categoryFilter })
    }
  });

  const { handleDelete, ConfirmDialog } = useDelete({
    queryKey: ['students'],
    endpoint: 'students'
  });

  const students = studentsData?.results || [];
  const totalItems = studentsData?.count || 0;

  const handleEdit = (student: { id: number | string }) => {
    navigate(`/students/${student.id}/edit`);
  };

  const handleDetails = (student: { id: number | string }) => {
    navigate(`/students/${student.id}`);
  };
  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      graduated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      transferred: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return (
      <Badge variant={colors[status as keyof typeof colors] ? 'default' : 'secondary'}>
        {t(`students.status.${status}`) || status}
      </Badge>
    );
  };

  const columns: TableColumn[] = [
    {
      key: 'registration_number',
      title: t('students.registrationNumber'),
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
           <span className="font-semibold text-xs">{value || t('common.notAvailable')}</span>
        </div>
      )
    },
    {
      key: 'full_name',
      title: t('students.fullName'),
      render: (value) => <span className="text-xs">{value || t('common.notAvailable')}</span>
    },
    {
      key: 'father_name',
      title: t('students.fatherName'),
      render: (value) => <span className="text-xs">{value || t('common.notAvailable')}</span>
    },
    {
      key: 'category_details',
      title: t('students.category'),
      render: (value) => <span className="text-xs">{value?.name || t('common.notAvailable')}</span>
    },
    {
      key: 'status',
      title: t('students.status'),
      render: (value) => getStatusBadge(value || 'inactive')
    },
    {
      key: 'phone',
      title: t('students.phone'),
      render: (value) => <span className="text-xs">{value || t('common.notAvailable')}</span>
    }
  ];

  const rowActions: TableAction[] = [
    {
      key: 'view',
      label: t('students.viewDetails'),
      icon: <Eye className="h-4 w-4" />,
      onClick: handleDetails,
      tooltip: t('students.viewDetails')
    },
    {
      key: 'edit',
      label: t('students.edit'),
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      tooltip: t('students.editStudent')
    },
    {
      key: 'delete',
      label: t('students.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (record) => handleDelete(record.id, record.full_name || t('students.student')),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      tooltip: t('students.deleteStudent')
    }
  ];

  const customFilters = [
    {
      key: 'status',
      label: t('students.status'),
      component: (
        <Autocomplete
          endpoint="student-statuses"
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          placeholder={t('students.selectStatus')}
          getOptionLabel={(s) => s.name}
          getOptionValue={(s) => s.value}
        />
      )
    },
    {
      key: 'category',
      label: t('students.category'),
      component: (
        <Autocomplete
          endpoint="student-categories"
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
          placeholder={t('students.selectCategory')}
          getOptionLabel={(c) => c.name}
          getOptionValue={(c) => c.id.toString()}
        />
      )
    }
  ];

  const handleClearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter || categoryFilter || searchTerm;

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={students}
        columns={columns}
        loading={isLoading}
        title={t('students.students')}
        subtitle={t('students.manageStudents')}
        icon={<User className="h-5 w-5" />}
        headerActions={
          <Button onClick={() => navigate('/students/add')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('students.addStudent')}
          </Button>
        }
        searchable
        searchPlaceholder={t('students.searchStudents')}
        searchValue={searchTerm}
        onSearch={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        customFilters={customFilters}
        showClearFilters={hasActiveFilters}
        clearFiltersLabel={t('students.clearFilters')}
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
        emptyIcon={<User className="h-8 w-8 text-muted-foreground" />}
        emptyTitle={t('students.noStudentsFound')}
        emptyDescription={searchTerm ? t('students.tryAdjustingSearch') : t('students.addFirstStudent')}
        loadingText={t('students.loadingStudents')}
        maxHeight="75vh"
        stickyHeader={true}
      />

      <ConfirmDialog />
    </div>
  );
};

export default StudentList;
