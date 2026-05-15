import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable, { TableColumn, TableAction, FilterOption } from '@/components/ui/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';

export const AccountCategoryList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: categoriesData, isLoading } = useFetchObjects<{
    results: any[];
    count: number;
    next: string | null;
    previous: string | null;
  }>({
    queryKey: ['account-categories', currentPage.toString(), pageSize.toString(), searchTerm, typeFilter],
    endpoint: 'account-categories',
    params: {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      ...(typeFilter !== 'all' && { account_type: typeFilter })
    }
  });

  const { handleDelete, ConfirmDialog } = useDelete({
    queryKey: ['account-categories'],
    endpoint: 'account-categories'
  });

  const categories = categoriesData?.results || [];
  const totalItems = categoriesData?.count || 0;

  const handleEdit = (category: any) => {
    navigate(`/categories/${category.id}/edit`);
  };

  const handleDetails = (category: any) => {
    navigate(`/categories/${category.id}`);
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      liability: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      income: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      expense: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return (
      <Badge variant={colors[type as keyof typeof colors] ? 'default' : 'secondary'}>
        {t(`accounting.${type}`) || type}
      </Badge>
    );
  };

  const columns: TableColumn[] = [
    {
      key: 'code',
      title: t('accounting.accountCategoryCode'),
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-semibold text-xs">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'name',
      title: t('accounting.accountCategoryName'),
      render: (value) => <span className="text-xs">{value || 'N/A'}</span>
    },
    {
      key: 'account_type',
      title: t('accounting.accountCategoryType'),
      render: (value) => getTypeBadge(value || '')
    }
  ];

  const rowActions: TableAction[] = [
    {
      key: 'view',
      label: t('accounting.viewDetails'),
      icon: <Eye className="h-4 w-4" />,
      onClick: handleDetails,
      tooltip: t('accounting.viewDetails')
    },
    {
      key: 'edit',
      label: t('accounting.edit'),
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      tooltip: t('accounting.editAccountCategory')
    },
    {
      key: 'delete',
      label: t('accounting.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (record) => handleDelete(record.id, record.name || 'Category'),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      tooltip: t('accounting.deleteAccountCategory')
    }
  ];

  const filters: FilterOption[] = [
    {
      key: 'type',
      label: t('accounting.accountCategoryType'),
      placeholder: t('accounting.filterByType'),
      width: 'sm:w-40',
      options: [
        { value: 'asset', label: t('accounting.asset') },
        { value: 'liability', label: t('accounting.liability') },
        { value: 'equity', label: t('accounting.equity') },
        { value: 'income', label: t('accounting.income') },
        { value: 'expense', label: t('accounting.expense') }
      ]
    }
  ];

  const filterValues = {
    type: typeFilter
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'type') {
      setTypeFilter(value);
      setCurrentPage(1);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setTypeFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={categories}
        columns={columns}
        loading={isLoading}
        title={t('accounting.accountCategories')}
        subtitle={t('accounting.chartOfAccounts')}
        icon={<Tag className="h-5 w-5" />}
        headerActions={
          <Button onClick={() => navigate('/categories/add')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('accounting.addAccountCategory')}
          </Button>
        }
        searchable
        searchPlaceholder={t('accounting.searchAccounts')}
        searchValue={searchTerm}
        onSearch={handleSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showClearFilters={true}
        clearFiltersLabel={t('accounting.clearFilters')}
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
        emptyIcon={<Tag className="h-8 w-8 text-muted-foreground" />}
        emptyTitle={t('accounting.noCategoriesFound')}
        emptyDescription={searchTerm ? t('accounting.tryAdjustingSearch') : t('accounting.addFirstCategory')}
        loadingText={t('accounting.loadingAccounts')}
        maxHeight="75vh"
        stickyHeader={true}
      />

      <ConfirmDialog />
    </div>
  );
};

export default AccountCategoryList;
