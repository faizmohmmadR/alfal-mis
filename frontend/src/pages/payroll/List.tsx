import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdvancedFilter, FilterField, FilterValue } from '@/components/ui/advanced-filter';
import { PayrollForm } from '@/components/forms/PayrollForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/formatNumber';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  position: string;
  basicSalary: number;
}

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  position: string;
  month: string;
  year: number;
  basicSalary: number;
  bonus: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: 'pending' | 'paid' | 'cancelled';
}

export const Payroll: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: '1',
      employeeName: 'Ahmad Khan',
      employeeId: 'EMP001',
      position: 'Sales Manager',
      month: 'January',
      year: 2024,
      basicSalary: 1500.00,
      bonus: 200.00,
      overtime: 150.00,
      deductions: 100.00,
      netSalary: 1750.00,
      paymentDate: '2024-01-31',
      status: 'paid'
    },
    {
      id: '2',
      employeeName: 'Sara Ahmed',
      employeeId: 'EMP002',
      position: 'Accountant',
      month: 'January',
      year: 2024,
      basicSalary: 1200.00,
      bonus: 100.00,
      overtime: 0.00,
      deductions: 80.00,
      netSalary: 1220.00,
      paymentDate: '2024-01-31',
      status: 'paid'
    },
    {
      id: '3',
      employeeName: 'Ali Hassan',
      employeeId: 'EMP003',
      position: 'Warehouse Supervisor',
      month: 'February',
      year: 2024,
      basicSalary: 1000.00,
      bonus: 0.00,
      overtime: 120.00,
      deductions: 50.00,
      netSalary: 1070.00,
      paymentDate: '2024-02-29',
      status: 'pending'
    },
    {
      id: '4',
      employeeName: 'Fatima Noor',
      employeeId: 'EMP004',
      position: 'Sales Representative',
      month: 'February',
      year: 2024,
      basicSalary: 800.00,
      bonus: 150.00,
      overtime: 80.00,
      deductions: 40.00,
      netSalary: 990.00,
      paymentDate: '2024-02-29',
      status: 'pending'
    }
  ]);

  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Ahmad Khan', employeeId: 'EMP001', position: 'Sales Manager', basicSalary: 1500 },
    { id: '2', name: 'Sara Ahmed', employeeId: 'EMP002', position: 'Accountant', basicSalary: 1200 },
    { id: '3', name: 'Ali Hassan', employeeId: 'EMP003', position: 'Warehouse Supervisor', basicSalary: 1000 },
    { id: '4', name: 'Fatima Noor', employeeId: 'EMP004', position: 'Sales Representative', basicSalary: 800 },
  ]);

  const [filters, setFilters] = useState<FilterValue>({});
  const [payrollFormOpen, setPayrollFormOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState<PayrollRecord | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: t('payroll.status'),
      type: 'select',
      options: [
        { value: 'pending', label: t('common.pending') },
        { value: 'paid', label: t('common.paid') },
        { value: 'cancelled', label: t('common.cancelled') }
      ]
    },
    {
      key: 'month',
      label: t('payroll.month'),
      type: 'select',
      options: months.map(month => ({ value: month, label: month }))
    },
    {
      key: 'year',
      label: t('payroll.year'),
      type: 'select',
      options: [
        { value: '2024', label: '2024' },
        { value: '2023', label: '2023' },
        { value: '2022', label: '2022' }
      ]
    },
    {
      key: 'employeeName',
      label: t('payroll.employee'),
      type: 'text',
      placeholder: t('payroll.searchByEmployee')
    },
    {
      key: 'paymentDate',
      label: t('payroll.paymentDate'),
      type: 'dateRange'
    }
  ];

  const applyFilters = (data: PayrollRecord[]) => {
    return data.filter(item => {
      if (filters.status && filters.status !== item.status) return false;
      if (filters.month && filters.month !== item.month) return false;
      if (filters.year && parseInt(filters.year) !== item.year) return false;
      if (filters.employeeName && !item.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())) return false;
      if (filters.paymentDate_from && new Date(item.paymentDate) < new Date(filters.paymentDate_from)) return false;
      if (filters.paymentDate_to && new Date(item.paymentDate) > new Date(filters.paymentDate_to)) return false;
      return true;
    });
  };

  const filteredPayrollRecords = applyFilters(payrollRecords);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const columns = [
    {
      key: 'employeeName' as keyof PayrollRecord,
      header: t('payroll.employee'),
      render: (value: string, item: PayrollRecord) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-base text-muted-foreground">{item.employeeId} - {item.position}</div>
        </div>
      )
    },
    {
      key: 'month' as keyof PayrollRecord,
      header: t('payroll.period'),
      render: (value: string, item: PayrollRecord) => (
        <Badge variant="outline">
          {value} {item.year}
        </Badge>
      )
    },
    {
      key: 'basicSalary' as keyof PayrollRecord,
      header: t('payroll.basicSalary'),
      render: (value: number) => (
        <span className="font-mediumtext-xs">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'bonus' as keyof PayrollRecord,
      header: t('payroll.bonus'),
      render: (value: number) => (
        <span className={`font-medium ${value > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'overtime' as keyof PayrollRecord,
      header: t('payroll.overtime'),
      render: (value: number) => (
        <span className={`font-medium ${value > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'deductions' as keyof PayrollRecord,
      header: t('payroll.deductions'),
      render: (value: number) => (
        <span className={`font-medium ${value > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
          -{formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'netSalary' as keyof PayrollRecord,
      header: t('payroll.netSalary'),
      render: (value: number) => (
        <span className="font-semibold text-base text-base">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'status' as keyof PayrollRecord,
      header: t('common.status'),
      render: (value: string) => (
        <Badge variant={getStatusVariant(value)} className="capitalize">
          {value}
        </Badge>
      )
    }
  ];

  const handleAdd = () => {
    setEditingPayroll(null);
    setPayrollFormOpen(true);
  };

  const handleEdit = (record: PayrollRecord) => {
    setEditingPayroll(record);
    setPayrollFormOpen(true);
  };

  const handleDelete = (record: PayrollRecord) => {
    setPayrollToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleSavePayroll = (payrollData: PayrollRecord) => {
    if (editingPayroll) {
      setPayrollRecords(prev => prev.map(p => p.id === editingPayroll.id ? { ...payrollData, id: editingPayroll.id } : p));
      toast({
        title: t('payroll.updateSuccess'),
      });
    } else {
      setPayrollRecords(prev => [...prev, { ...payrollData, id: Date.now().toString() }]);
      toast({
        title: t('payroll.addSuccess'),
      });
    }
    setPayrollFormOpen(false);
    setEditingPayroll(null);
  };

  const confirmDelete = () => {
    if (payrollToDelete) {
      setPayrollRecords(prev => prev.filter(p => p.id !== payrollToDelete.id));
      toast({
        title: t('payroll.deleteSuccess'),
      });
      setDeleteDialogOpen(false);
      setPayrollToDelete(null);
    }
  };

  return (
    <>
      <DataTable
        data={filteredPayrollRecords}
        columns={columns}
        title={t('payroll.title')}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable
        filterable
        customFilter={
          <AdvancedFilter
            fields={filterFields}
            onApplyFilters={setFilters}
            onClearFilters={() => setFilters({})}
            currentFilters={filters}
          />
        }
      />

      <PayrollForm
        isOpen={payrollFormOpen}
        onClose={() => {
          setPayrollFormOpen(false);
          setEditingPayroll(null);
        }}
        onSave={handleSavePayroll}
        editingPayroll={editingPayroll}
        employees={employees}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('payroll.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};