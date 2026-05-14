import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Autocomplete } from '@/components/ui/autocomplete';
import DataTable, { TableColumn, TableAction, FilterOption } from '@/components/ui/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';

export const Customers = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: customersData, isLoading } = useFetchObjects<{
    results: any[];
    count: number;
    next: string | null;
    previous: string | null;
  }>({
    queryKey: ['customers', currentPage.toString(), pageSize.toString(), searchTerm],
    endpoint: 'customers',
    params: {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm
    }
  });



  const { handleDelete, ConfirmDialog } = useDelete({
    queryKey: ['customers'],
    endpoint: 'customers'
  });

  const customers = customersData?.results || [];
  const totalItems = customersData?.count || 0;

  const handleEdit = (customer: any) => {
    navigate(`/customers/${customer.id}/edit`);
  };

  const handleDetails = (customer: any) => {
    navigate(`/customers/${customer.id}`);
  };

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: t('customers.name'),
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'phone',
      title: t('customers.phone'),
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 text-muted-foreground" />
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'address',
      title: t('customers.address'),
      render: (value) => (
        <div className="flex items-center gap-1 max-w-xs">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="truncatetext-xs">{value || t('customers.notAvailable')}</span>
        </div>
      )
    },
    {
      key: 'email',
      title: t('customers.email'),
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span className="truncate max-w-xstext-xs">{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'afn_totals',
      title: 'AFN',
      render: (value, record) => (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            Budget: <span className="font-medium text-foreground">{(record.afn_totals?.budget || 0).toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Paid: <span className="font-medium text-green-600">{(record.afn_totals?.paid || 0).toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Remaining: <span className={`font-medium ${(record.afn_totals?.remaining || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>{(record.afn_totals?.remaining || 0).toFixed(2)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'usd_totals',
      title: 'USD',
      render: (value, record) => (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            Budget: <span className="font-medium text-foreground">{(record.usd_totals?.budget || 0).toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Paid: <span className="font-medium text-green-600">{(record.usd_totals?.paid || 0).toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Remaining: <span className={`font-medium ${(record.usd_totals?.remaining || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>{(record.usd_totals?.remaining || 0).toFixed(2)}</span>
          </div>
        </div>
      )
    }
  ];

  const rowActions: TableAction[] = [
    {
      key: 'view',
      label: t('customers.viewDetails'),
      icon: <Eye className="h-4 w-4" />,
      onClick: handleDetails,
      tooltip: t('customers.viewDetails')
    },
    {
      key: 'edit',
      label: t('common.edit'),
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      tooltip: t('customers.editCustomerAction')
    },
    {
      key: 'delete',
      label: t('common.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (record) => handleDelete(record.id, record.name),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      tooltip: t('customers.deleteCustomer')
    }
  ];



  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={customers}
        columns={columns}
        loading={isLoading}
        title={t('customers.title')}
        subtitle={t('customers.manageCustomers')}
        icon={<Users className="h-5 w-5" />}
        headerActions={
          <Button onClick={() => navigate('/customers/add')}>
            <Plus className="mr-2 h-4 w-4" />
            {t("customers.addCustomer")}
          </Button>
        }
        searchable
        searchPlaceholder={t("common.search")}
        searchValue={searchTerm}
        onSearch={handleSearch}

        showClearFilters={true}
        clearFiltersLabel={t("common.clearFilters")}
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
        emptyTitle={t("common.noData")}
        emptyDescription={searchTerm ? t("common.noSearchResults") : t("customers.addFirstCustomer")}
        loadingText={t("common.loading")}
        maxHeight="75vh"
        stickyHeader={true}
      />

      <ConfirmDialog />
    </div>
  );
};