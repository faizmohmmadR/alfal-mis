import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import ActivityLogList from '../activity-logs/ActivityLogList';

export const Settings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title', 'System Settings')}</CardTitle>
          <CardDescription>
            {t('settings.description', 'Manage system configuration and activity logs')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLogList />
        </CardContent>
      </Card>
    </div>
  );
};