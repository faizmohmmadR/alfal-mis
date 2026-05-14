import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Advance } from '@/types/advance';
import useFetchObjects from '@/api/useFetchObjects';
import { useAuth } from '@/contexts/AuthContext';
import AddAdvance from './AddAdvance';
import EditAdvance from './EditAdvance';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import useDelete from '@/api/useDelete';

const PAGE_SIZE = 10;

const AdvanceList: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getUser } = useAuth();
  const user = getUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<Advance | null>(null);
  const [deletingAdvance, setDeletingAdvance] = useState<Advance | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: advancesData,
    isLoading: advancesLoading,
    refetch,
  } = useFetchObjects<{ count: number; results: Advance[] }>({
    queryKey: ['advance'],
    endpoint: `advance/?page=${page}&page_size=${PAGE_SIZE}`,
    token: user?.token,
  });

  const advances = advancesData?.results || [];
  const totalCount = advancesData?.count || 0;

  const { handleDelete: deleteAdvance } = useDelete({
    queryKey: ['advance'],
    token: user?.token,
  });

  const columns = [
    {
      key: 'employee' as keyof Advance,
      header: t('advance.employee'),
    },
    {
      key: 'amount' as keyof Advance,
      header: t('advance.amount'),
      render: (value: number) => {
        const num = typeof value === 'number' ? value : parseFloat(value) || 0;
        return `$${num.toFixed(2)}`;
      },
    },
    {
      key: 'date' as keyof Advance,
      header: t('advance.paymentDate'),
    },
    {
      key: 'reason' as keyof Advance,
      header: t('advance.reason'),
      render: (value: string | null) => value || '-',
    },
    {
      key: 'status' as keyof Advance,
      header: t('common.status'),
      render: (value: string) => (
        <Badge variant={value === 'approved' ? 'default' : value === 'rejected' ? 'destructive' : 'secondary'}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'repayment_date' as keyof Advance,
      header: t('advance.repaymentDate'),
      render: (value: string | null) => value || '-',
    },
  ];

  const handleAdd = () => {
    setEditingAdvance(null);
    setIsFormOpen(true);
  };

  const handleEdit = (advance: Advance) => {
    setEditingAdvance(advance);
  };

  const handleDeleteClick = (advance: Advance) => {
    setDeletingAdvance(advance);
  };

  const confirmDelete = async () => {
    if (!deletingAdvance) return;

    try {
      await deleteAdvance(deletingAdvance.id);
      toast({
        title: t('common.success'),
        description: t('advance.deleteSuccess'),
      });
      refetch();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('advance.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setDeletingAdvance(null);
    }
  };

  return (
    <div className="space-y-4">
      <DataTable
        data={advances}
        columns={columns}
        title={t('advance.title')}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        loading={advancesLoading}
        itemsPerPage={PAGE_SIZE}
      />

      <AddAdvance
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          refetch();
        }}
      />

      {editingAdvance && (
        <EditAdvance
          advance={editingAdvance}
          isOpen={!!editingAdvance}
          onClose={() => setEditingAdvance(null)}
          onSuccess={refetch}
        />
      )}

      <AlertDialog
        open={!!deletingAdvance}
        onOpenChange={(open) => !open && setDeletingAdvance(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('advance.deleteConfirm') + ` ${deletingAdvance?.employee}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdvanceList;