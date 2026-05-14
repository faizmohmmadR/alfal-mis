import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  className
}) => {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-primary/20 bg-primary-light/50',
    success: 'border-success/20 bg-success-light/50',
    warning: 'border-warning/20 bg-warning-light/50',
    destructive: 'border-destructive/20 bg-destructive-light/50'
  };

  return (
    <Card className={cn('stats-card', variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-base font-bold text-foreground mb-1">
          {value}
        </div>
        
        {(description || trend) && (
          <div className="flex items-center gap-2 text-base text-muted-foreground">
            {trend && (
              <span className={cn(
                'font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};