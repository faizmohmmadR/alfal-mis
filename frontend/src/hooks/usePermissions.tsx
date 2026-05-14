import { usePermissions as usePermissionContext } from '@/contexts/PermissionContext';

export const usePermissions = () => {
  return usePermissionContext();
};