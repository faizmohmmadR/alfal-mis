import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Save, Shield, Users, Building, Package, ShoppingCart, FileText, DollarSign, Clock, TrendingUp, Settings, Lock, Eye, Plus, Edit, Trash2, Search, Grid, List } from 'lucide-react';
import useFetchObjects from '@/api/useFetchObjects';
import useAdd from '@/api/useAdd';

interface Permission {
  id: string;
  name: string;
  codename: string;
  module: string;
  description: string;
  granted: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export const UserPermissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'granted' | 'denied'>('all');

  const { data: user, isLoading: userLoading } = useFetchObjects<User>({
    queryKey: ['user', id || ''],
    endpoint: `users/${id}`,
    enabled: !!id,
  });

  const { data: permissionsData, isLoading: permissionsLoading, refetch } = useFetchObjects<Permission[]>({
    queryKey: ['user-permissions', id || ''],
    endpoint: `users/${id}/permissions/user-permissions`,
    enabled: !!id,
  });

  const { handleAdd, loading: saving, isSuccess } = useAdd<{ permissions: Array<{ permission_id: string; granted: string }> }>({
    queryKey: 'user-permissions',
    endpoint: `users/${id}/permissions/bulk-update`,
    customSuccessMessage: t('user.permissionsUpdatedSuccess'),
    customErrorMessage: t('user.failedToSavePermissions'),
    showSuccessToast: true,
    showErrorToast: true,
  });

  useEffect(() => {
    if (permissionsData) {
      setPermissions(permissionsData);
    }
  }, [permissionsData]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const handlePermissionChange = (permissionId: string, granted: boolean) => {
    setPermissions(prev =>
      prev.map(perm =>
        perm.id === permissionId ? { ...perm, granted } : perm
      )
    );
  };

  const handleModuleAllChange = (module: string, granted: boolean) => {
    setPermissions(prev =>
      prev.map(perm =>
        perm.module === module ? { ...perm, granted } : perm
      )
    );
  };

  const isModuleAllSelected = (modulePermissions: Permission[]) => {
    return modulePermissions.length > 0 && modulePermissions.every(perm => perm.granted);
  };

  const isModulePartiallySelected = (modulePermissions: Permission[]) => {
    return modulePermissions.some(perm => perm.granted) && !modulePermissions.every(perm => perm.granted);
  };

  const handleSave = () => {
    const permissionsPayload = permissions.map(perm => ({
      permission_id: perm.id,
      granted: perm.granted.toString()
    }));

    handleAdd({ permissions: permissionsPayload });
  };

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      const matchesSearch = searchTerm === '' || 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.codename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.module.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'granted' && permission.granted) ||
        (filterStatus === 'denied' && !permission.granted);
      
      return matchesSearch && matchesFilter;
    });
  }, [permissions, searchTerm, filterStatus]);

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getModuleIcon = (module: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      companies: <Building className="w-5 h-5" />,
      users: <Users className="w-5 h-5" />,
      products: <Package className="w-5 h-5" />,
      categories: <FileText className="w-5 h-5" />,
      units: <FileText className="w-5 h-5" />,
      stock: <Package className="w-5 h-5" />,
      customers: <Users className="w-5 h-5" />,
      vendors: <Building className="w-5 h-5" />,
      sales: <ShoppingCart className="w-5 h-5" />,
      purchases: <ShoppingCart className="w-5 h-5" />,
      orders: <FileText className="w-5 h-5" />,
      returns: <FileText className="w-5 h-5" />,
      payments: <DollarSign className="w-5 h-5" />,
      employees: <Users className="w-5 h-5" />,
      attendance: <Clock className="w-5 h-5" />,
      payroll: <DollarSign className="w-5 h-5" />,
      advances: <DollarSign className="w-5 h-5" />,
      loans: <DollarSign className="w-5 h-5" />,
      expenses: <DollarSign className="w-5 h-5" />,
      currencies: <DollarSign className="w-5 h-5" />,
      reports: <TrendingUp className="w-5 h-5" />,
      dashboard: <TrendingUp className="w-5 h-5" />,
      settings: <Settings className="w-5 h-5" />,
      permissions: <Lock className="w-5 h-5" />
    };
    return iconMap[module] || <Shield className="w-5 h-5" />;
  };

  const getPermissionIcon = (codename: string) => {
    if (codename.includes('view')) return <Eye className="w-4 h-4" />;
    if (codename.includes('add')) return <Plus className="w-4 h-4" />;
    if (codename.includes('edit')) return <Edit className="w-4 h-4" />;
    if (codename.includes('delete')) return <Trash2 className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getModuleColor = (module: string) => {
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-800',
      'bg-green-50 border-green-200 text-green-800',
      'bg-purple-50 border-purple-200 text-purple-800',
      'bg-orange-50 border-orange-200 text-orange-800',
      'bg-pink-50 border-pink-200 text-pink-800',
      'bg-indigo-50 border-indigo-200 text-indigo-800',
      'bg-teal-50 border-teal-200 text-teal-800',
      'bg-red-50 border-red-200 text-red-800'
    ];
    const index = module.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const loading = userLoading || permissionsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 mx-auto"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-mediumtext-xs">{t('user.loadingPermissions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Top Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/users')}
                className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-200"
              >
                <ArrowLeft size={18} />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Shield className="text-white" size={16} />
                  </div>
                  <h1 className="text-base sm:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparenttext-sm">
                    {t('user.userPermissions')}
                  </h1>
                </div>
                {user && (
                  <p className="text-base text-gray-600 dark:text-gray-400 ml-11 truncatetext-xs">
                    {user.first_name} {user.last_name} <span className="text-gray-400 dark:text-gray-500text-xs">•</span> {user.username}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-shrink-0">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 px-4 sm:px-6 py-2.5"
              >
                <Save size={16} className="mr-2" />
                <span className="hidden sm:inlinetext-xs">{saving ? t('user.saving') : t('user.saveChanges')}</span>
                <span className="sm:hiddentext-xs">{saving ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>
          
          {/* Search and Controls Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search permissions, modules, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-11 bg-white/90 dark:bg-gray-800/90 border-gray-200/60 dark:border-gray-600/60 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg p-1 border border-gray-200/50 dark:border-gray-600/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className={`px-2 sm:px-3 py-1.5 text-base font-medium transition-all duration-200 ${filterStatus === 'all' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus('granted')}
                  className={`px-2 sm:px-3 py-1.5 text-base font-medium transition-all duration-200 ${filterStatus === 'granted' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span className="hidden sm:inlinetext-xs">Granted</span>
                  <span className="sm:hiddentext-xs">✓</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus('denied')}
                  className={`px-2 sm:px-3 py-1.5 text-base font-medium transition-all duration-200 ${filterStatus === 'denied' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span className="hidden sm:inlinetext-xs">Denied</span>
                  <span className="sm:hiddentext-xs">✗</span>
                </Button>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 rounded-lg p-1 border border-gray-200/50 dark:border-gray-600/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <List size={16} />
                </Button>
              </div>
              
              {/* Results Counter */}
              <div className="hidden sm:flex items-center px-3 py-2 bg-gray-100/80 dark:bg-gray-700/80 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">
                  {filteredPermissions.length} of {permissions.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          {Object.keys(groupedPermissions).length === 0 && (searchTerm || filterStatus !== 'all') && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Search size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3text-sm">
                No permissions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-autotext-xs">
                Try adjusting your search terms or filters to find what you're looking for
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="text-base"
                >
                  Clear search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className="text-base"
                >
                  Show all
                </Button>
              </div>
            </div>
          )}
          {Object.entries(groupedPermissions).map(([module, modulePermissions], index) => (
            <div 
              key={module} 
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Module Header */}
              <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${getModuleColor(module)} bg-gradient-to-br`}>
                      {getModuleIcon(module)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white capitalize text-base">
                        {module}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base text-gray-500 dark:text-gray-400text-xs">
                          {modulePermissions.length} permissions
                        </span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-base text-green-600 dark:text-green-400text-xs">
                          {modulePermissions.filter(p => p.granted).length} active
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 rounded-lg px-4 py-2 shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                    <Checkbox
                      id={`all-${module}`}
                      checked={isModuleAllSelected(modulePermissions)}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isModulePartiallySelected(modulePermissions);
                        }
                      }}
                      onCheckedChange={(checked) =>
                        handleModuleAllChange(module, checked as boolean)
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                      htmlFor={`all-${module}`}
                      className="text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                    >
                      {t('user.selectAll')}
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Permissions Grid/List */}
              <div className="p-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulePermissions.map((permission, permIndex) => (
                      <label
                        key={permission.id}
                        htmlFor={permission.id}
                        className={`group flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                          permission.granted
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700'
                            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300 hover:shadow-md dark:from-gray-700/30 dark:to-gray-800/30 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                        style={{ animationDelay: `${(index * 100) + (permIndex * 50)}ms` }}
                      >
                        <Checkbox
                          id={permission.id}
                          checked={permission.granted}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(permission.id, checked as boolean)
                          }
                          className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              permission.granted 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400' 
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                            }`}>
                              {getPermissionIcon(permission.codename)}
                            </div>
                            <span className="text-base font-semibold text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colorstext-xs">
                              {permission.name}
                            </span>
                          </div>
                          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            {permission.description}
                          </p>
                          <div className="mt-2">
                            <code className="text-base bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-mono border border-gray-200/50 dark:border-gray-600/50">
                              {permission.codename}
                            </code>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {modulePermissions.map((permission, permIndex) => (
                      <label
                        key={permission.id}
                        htmlFor={permission.id}
                        className={`group flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          permission.granted
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                            : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-700/30 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                        style={{ animationDelay: `${(index * 100) + (permIndex * 30)}ms` }}
                      >
                        <Checkbox
                          id={permission.id}
                          checked={permission.granted}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(permission.id, checked as boolean)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          permission.granted 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400' 
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                        }`}>
                          {getPermissionIcon(permission.codename)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colorstext-xs">
                              {permission.name}
                            </span>
                            <code className="text-base bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-mono">
                              {permission.codename}
                            </code>
                          </div>
                          <p className="text-base text-gray-600 dark:text-gray-400 mt-1text-xs">
                            {permission.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {permissions.length === 0 && !loading && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Shield size={36} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3text-sm">
              {t('user.noPermissionsFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-autotext-xs">
              {t('user.noPermissionsAvailable')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};