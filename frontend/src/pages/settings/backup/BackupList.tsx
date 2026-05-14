import { useState } from 'react';
import { Download, Trash2, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable, { TableColumn, TableAction } from '@/components/ui/data-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import useFetchObjects from '@/api/useFetchObjects';
import api from '@/lib/axios';

interface Backup {
  filename: string;
  size: number;
  created_at: string;
}

export const BackupList = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [restoreDialog, setRestoreDialog] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading, refetch } = useFetchObjects<{ backups: Backup[] }>({
    queryKey: ['backups'],
    endpoint: 'backups/',
  });

  const backups = data?.backups || [];

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      await api.post('/backups/create/');
      toast({ title: t('common.success'), description: t('common.backups.createSuccess') });
      refetch();
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.response?.data?.error || t('common.backups.createError'), variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (backup: Backup) => {
    try {
      const response = await api.get(`/backups/download/${backup.filename}/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: t('common.success'), description: t('common.backups.downloadSuccess') });
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.response?.data?.error || t('common.backups.downloadError'), variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return;
    try {
      await api.delete('/backups/delete/', { data: { backup_file: deleteDialog } });
      toast({ title: t('common.success'), description: t('common.backups.deleteSuccess') });
      refetch();
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.response?.data?.error || t('common.backups.deleteError'), variant: 'destructive' });
    } finally {
      setDeleteDialog(null);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreDialog) return;
    try {
      await api.post('/backups/restore/', { backup_file: restoreDialog });
      toast({ title: t('common.success'), description: t('common.backups.restoreSuccess') });
      refetch();
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.response?.data?.error || t('common.backups.restoreError'), variant: 'destructive' });
    } finally {
      setRestoreDialog(null);
    }
  };

  const columns: TableColumn[] = [
    {
      key: 'filename',
      title: t('common.backups.filename'),
      render: (value) => <span className="font-medium text-primarytext-xs">{value}</span>
    },
    {
      key: 'size',
      title: t('common.backups.size'),
      render: (value) => formatSize(value)
    },
    {
      key: 'created_at',
      title: t('common.backups.createdAt'),
      render: (value) => value
    }
  ];

  const rowActions: TableAction[] = [
    {
      key: 'download',
      label: t('common.backups.download'),
      icon: <Download className="h-4 w-4" />,
      onClick: handleDownload,
      tooltip: t('common.backups.downloadTooltip')
    },
    {
      key: 'restore',
      label: t('common.backups.restore'),
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: (backup) => setRestoreDialog(backup.filename),
      tooltip: t('common.backups.restoreTooltip')
    },
    {
      key: 'delete',
      label: t('common.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (backup) => setDeleteDialog(backup.filename),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      tooltip: t('common.backups.deleteTooltip')
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={backups}
        columns={columns}
        loading={isLoading}
        title={t('common.backups.title')}
        subtitle={t('common.backups.subtitle')}
        icon={<Database className="h-5 w-5" />}
        headerActions={
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh')}
            </Button>
            <Button onClick={handleCreateBackup} disabled={isCreating}>
              <Database className="h-4 w-4 mr-2" />
              {isCreating ? t('common.backups.creating') : t('common.backups.createBackup')}
            </Button>
          </div>
        }
        rowActions={rowActions}
        emptyIcon={<Database className="h-8 w-8 text-muted-foreground" />}
        emptyTitle={t('common.backups.noBackups')}
        emptyDescription={t('common.backups.createFirstBackup')}
        loadingText={t('common.backups.loading')}
        maxHeight="75vh"
        stickyHeader={true}
      />

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.backups.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.backups.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!restoreDialog} onOpenChange={() => setRestoreDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.backups.restoreTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.backups.restoreConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm}>{t('backups.restore')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
