import React, { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionContext';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  module?: string;
  action?: 'view' | 'add' | 'edit' | 'delete';
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  module,
  action,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canView, canAdd, canEdit, canDelete } = usePermissions();

  let hasAccess = false;

  if (module && action) {
    switch (action) {
      case 'view':
        hasAccess = canView(module);
        break;
      case 'add':
        hasAccess = canAdd(module);
        break;
      case 'edit':
        hasAccess = canEdit(module);
        break;
      case 'delete':
        hasAccess = canDelete(module);
        break;
    }
  } else if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};