import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'dateRange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: any;
}

interface AdvancedFilterProps {
  fields: FilterField[];
  onApplyFilters: (filters: FilterValue) => void;
  onClearFilters: () => void;
  currentFilters: FilterValue;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  fields,
  onApplyFilters,
  onClearFilters,
  currentFilters
}) => {
  const { t, direction } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterValue>(currentFilters);

  const updateFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
    setIsOpen(false);
  };

  const activeFiltersCount = Object.keys(currentFilters).filter(key => 
    currentFilters[key] !== undefined && currentFilters[key] !== ''
  ).length;

  const renderFilterField = (field: FilterField) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder || field.label}
            value={localFilters[field.key] || ''}
            onChange={(e) => updateFilter(field.key, e.target.value)}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select
            value={localFilters[field.key] || ''}
            onValueChange={(value) => updateFilter(field.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localFilters[field.key] && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters[field.key] ? (
                  format(new Date(localFilters[field.key]), "PPP")
                ) : (
                  <span>{field.placeholder || `Pick ${field.label}`}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters[field.key] ? new Date(localFilters[field.key]) : undefined}
                onSelect={(date) => updateFilter(field.key, date?.toISOString().split('T')[0])}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-base text-muted-foreground">From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters[`${field.key}_from`] && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters[`${field.key}_from`] ? (
                      format(new Date(localFilters[`${field.key}_from`]), "MMM dd")
                    ) : (
                      <span>From</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters[`${field.key}_from`] ? new Date(localFilters[`${field.key}_from`]) : undefined}
                    onSelect={(date) => updateFilter(`${field.key}_from`, date?.toISOString().split('T')[0])}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-base text-muted-foreground">To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters[`${field.key}_to`] && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters[`${field.key}_to`] ? (
                      format(new Date(localFilters[`${field.key}_to`]), "MMM dd")
                    ) : (
                      <span>To</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters[`${field.key}_to`] ? new Date(localFilters[`${field.key}_to`]) : undefined}
                    onSelect={(date) => updateFilter(`${field.key}_to`, date?.toISOString().split('T')[0])}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter size={16} />
          {t('common.filter')}
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-base flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className={cn("w-full sm:max-w-md", direction === 'rtl' && "left-0 right-auto")}>
        <SheetHeader>
          <SheetTitle>{t('common.advancedFilter')}</SheetTitle>
          <SheetDescription>
            {t('common.filterDescription')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {renderFilterField(field)}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={handleApply} className="w-full">
            {t('common.applyFilters')}
          </Button>
          <Button variant="outline" onClick={handleClear} className="w-full">
            {t('common.clearFilters')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};