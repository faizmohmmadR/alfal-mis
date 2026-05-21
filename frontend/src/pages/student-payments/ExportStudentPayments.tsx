import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Loader2, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/axios';

interface ClassLevel {
  id: number;
  name: string;
  level: string;
}

export const ExportStudentPayments = () => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClassLevels = async () => {
      try {
        const response = await api.get('class-levels');
        setClassLevels(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch class levels:', error);
      }
    };
    fetchClassLevels();
  }, []);

  const toggleClassSelection = (classId: number) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleExport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });

      selectedClasses.forEach(id => {
        params.append('class_levels', id.toString());
      });

      const response = await api.get(`student-payments/export_excel/?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'student_payments.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t('student-payments.exportPayments', 'Export Student Payments')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('student-payments.exportDescription', 'Export student payments with monthly breakdown to Excel')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('student-payments.startDate', 'Start Date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : t('common.selectDate', 'Select date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>{t('student-payments.endDate', 'End Date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : t('common.selectDate', 'Select date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('student-payments.selectClassLevels', 'Select Class Levels (Optional - Multi-select creates separate tabs)')}</Label>
            <div className="flex flex-wrap gap-2">
              {classLevels.map((cls) => (
                <Button key={cls.id} variant={selectedClasses.includes(cls.id) ? 'default' : 'outline'} size="sm" onClick={() => toggleClassSelection(cls.id)}>
                  {cls.name}
                </Button>
              ))}
            </div>
            {selectedClasses.length > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('student-payments.multiTabInfo', 'Multiple classes selected - each class will have its own tab in Excel')}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExport} disabled={!startDate || !endDate || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.exporting', 'Exporting...')}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {t('student-payments.exportToExcel', 'Export to Excel')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportStudentPayments;
