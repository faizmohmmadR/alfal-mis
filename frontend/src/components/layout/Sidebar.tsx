import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGuard } from '@/components/ui/permission-guard';
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Warehouse, 
  Users, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  ClipboardList, 
  UserCheck, 
  Wallet, 
  Calendar, 
  Receipt, 
  BarChart3, 
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
  DollarSign,
  UsersIcon,
  Tag,
  FileText,
  Search,
  X,
  Activity,
  Minimize2,
  Crown,
  Database,
  BookOpen,
  Store
} from 'lucide-react';

const navigationItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/', section: 'main' },

  { key: 'customers', icon: Users, path: '/customers', permission: 'view_customers', section: 'contacts' },
  { key: 'users', icon: UserCheck, path: '/users', permission: 'view_users', section: 'contacts' },
  { 
    key: 'projects', 
    icon: FileText, 
    path: '/projects',
    isExpandable: true,
    section: 'business',
    subItems: [
      { key: 'projectsList', icon: FileText, path: '/projects' },
      { key: 'projectPayments', icon: DollarSign, path: '/project-payments' }
    ]
  },
  { 
    key: 'hr', 
    icon: UsersIcon, 
    path: '/employees',
    isExpandable: true,
    section: 'hr',
    subItems: [
      { key: 'employees', icon: UserCheck, path: '/employees' },
      { key: 'payroll', icon: Wallet, path: '/payroll' },
      { key: 'advance', icon: DollarSign, path: '/advance' }
    ]
  },
  { 
    key: 'expenses', 
    icon: Receipt, 
    path: '/expenses',
    isExpandable: true,
    section: 'finance',
    subItems: [
      { key: 'expensesList', icon: Receipt, path: '/expenses' },
      { key: 'expenseCategories', icon: Tag, path: '/expense-categories' }
    ]
  },
  { 
    key: 'accounting', 
    icon: BookOpen, 
    path: '/accounts',
    isExpandable: true,
    section: 'finance',
    subItems: [
      { key: 'accounts', icon: BookOpen, path: '/accounts' },
      { key: 'accountCategories', icon: Tag, path: '/categories' },
      { key: 'transactions', icon: FileText, path: '/transactions' },
      { key: 'fiscalYears', icon: Calendar, path: '/fiscal-years' },
      { key: 'journalEntries', icon: FileText, path: '/journal-entries' }
    ]
  },
  { 
    key: 'students', 
    icon: BookOpen, 
    path: '/students',
    isExpandable: true,
    section: 'education',
    subItems: [
      { key: 'studentsList', icon: BookOpen, path: '/students' },
      { key: 'studentPayments', icon: DollarSign, path: '/student-payments' }
    ]
  },
  { 
    key: 'shopRental', 
    icon: Store, 
    path: '/shops',
    isExpandable: true,
    section: 'business',
    subItems: [
      { key: 'shopsList', icon: Store, path: '/shops' },
      { key: 'tenantsList', icon: Users, path: '/tenants' },
      { key: 'shopRentalList', icon: Receipt, path: '/shop-rentals' }
    ]
  },
  { 
    key: 'otherIncome', 
    icon: TrendingUp, 
    path: '/other-incomes',
    isExpandable: true,
    section: 'finance',
    subItems: [
      { key: 'otherIncomeList', icon: TrendingUp, path: '/other-incomes' },
      { key: 'incomeCategoryList', icon: Tag, path: '/income-categories' }
    ]
  },

  { 
    key: 'settings', 
    icon: Settings, 
    path: '/settings',
    isExpandable: true,
    section: 'system',
    subItems: [
      { key: 'activityLogs', icon: Activity, path: '/activity-logs' },
      { key: 'backups', icon: Database, path: '/backups' }
    ]
  }
];

const sections = {
  main: 'Main',
  contacts: 'Contacts',
  business: 'Business',
  education: 'Education',
  hr: 'Human Resources',
  finance: 'Finance',
  system: 'System'
};

export const Sidebar: React.FC = () => {
  const { t, direction } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const isCustomer = user?.role === 'customer';
  const canViewProfile = true;

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    const currentPath = location.pathname;
    const sectionsToExpand: string[] = [];
    
    if (isProjectsRoute(currentPath)) sectionsToExpand.push('projects');
    if (isHRRoute(currentPath)) sectionsToExpand.push('hr');
    if (isExpensesRoute(currentPath)) sectionsToExpand.push('expenses');
    if (isAccountingRoute(currentPath)) sectionsToExpand.push('accounting');
    if (isStudentsRoute(currentPath)) sectionsToExpand.push('students');
    if (isShopRentalRoute(currentPath)) sectionsToExpand.push('shopRental');
    if (isOtherIncomeRoute(currentPath)) sectionsToExpand.push('otherIncome');
    if (isSettingsRoute(currentPath)) sectionsToExpand.push('settings');

    
    setExpandedSections(prev => {
      const newExpanded = [...new Set([...prev, ...sectionsToExpand])];
      return newExpanded;
    });
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeElement = navRef.current?.querySelector('.bg-primary, .bg-primary\\/20');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const collapseAll = () => {
    setExpandedSections([]);
  };

  const isProjectsRoute = (path: string) => {
    const projectRoutes = ['/projects', '/project-payments'];
    return projectRoutes.some(route => path.startsWith(route));
  };

  const isHRRoute = (path: string) => {
    const hrRoutes = ['/employees', '/payroll', '/advance'];
    return hrRoutes.some(route => path.startsWith(route));
  };

  const isExpensesRoute = (path: string) => {
    const expenseRoutes = ['/expenses', '/expense-categories'];
    return expenseRoutes.some(route => path.startsWith(route));
  };

  const isAccountingRoute = (path: string) => {
    const accountingRoutes = ['/accounts', '/categories', '/transactions', '/fiscal-years', '/journal-entries'];
    return accountingRoutes.some(route => path.startsWith(route));
  };

  const isStudentsRoute = (path: string) => {
    const studentRoutes = ['/students', '/student-payments'];
    return studentRoutes.some(route => path.startsWith(route));
  };

  const isShopRentalRoute = (path: string) => {
    const shopRentalRoutes = ['/shops', '/tenants', '/shop-rentals'];
    return shopRentalRoutes.some(route => path.startsWith(route));
  };

  const isOtherIncomeRoute = (path: string) => {
    const otherIncomeRoutes = ['/other-incomes', '/income-categories'];
    return otherIncomeRoutes.some(route => path.startsWith(route));
  };

  const isSettingsRoute = (path: string) => {
    return path.startsWith('/settings') || path.startsWith('/activity-logs') || path.startsWith('/backups');
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    const section = item.section || 'main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

  return (
    <div className={cn(
      "h-full bg-sidebar border-sidebar-border flex flex-col shadow-xl",
      direction === 'rtl' ? 'border-l' : 'border-r'
    )}>
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg">
            <img 
              src="/logo.jpeg" 
              alt="Khadim Popal MIS" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className={direction === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
            <h1 className="text-base font-bold text-sidebar-foreground leading-tight">
              {t('core.app.companyName', 'Khadim Popal MIS')}
            </h1>
            <p className="text-xs text-sidebar-foreground/70">
              {t('core.app.subtitle', 'Management Information System')}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar & Controls */}
      <div className="p-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className={cn(
              "absolute top-1/2 -translate-y-1/2 text-sidebar-foreground/50",
              direction === 'rtl' ? 'right-2' : 'left-2'
            )} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('core.navigation.search', 'Search...')}
              className={cn(
                "w-full py-1.5 text-sm bg-sidebar-accent border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-sidebar-foreground placeholder:text-sidebar-foreground/50",
                direction === 'rtl' ? 'pr-7 pl-7' : 'pl-7 pr-7'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-sidebar-foreground/50 hover:text-sidebar-foreground",
                  direction === 'rtl' ? 'left-2' : 'right-2'
                )}
              >
                <X size={12} />
              </button>
            )}
          </div>
          {expandedSections.length > 0 && (
            <button
              onClick={collapseAll}
              className="p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
              title={t('core.navigation.collapseAll', 'Collapse All')}
            >
              <Minimize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 p-2 space-y-3 overflow-y-auto custom-scrollbar">

        {/* Grouped Navigation */}
        {Object.entries(groupedItems).map(([sectionKey, items]) => {
          const visibleItems = items.filter(item => {
            if (isCustomer && ['dashboard', 'users', 'hr', 'expenses', 'settings'].includes(item.key)) {
              return false;
            }

            const itemLabel = t(`core.navigation.${item.key}`, item.key).toLowerCase();
            const matchesSearch = itemLabel.includes(searchQuery.toLowerCase());
            const hasMatchingSubItem = item.subItems?.some(sub => 
              t(`core.navigation.${sub.key}`, sub.key).toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchesSearch || hasMatchingSubItem;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={sectionKey}>
              {sectionKey !== 'main' && !isCustomer && (
                <div className={cn(
                  "px-2 mb-0.5 pb-0.5",
                  direction === 'rtl' ? 'text-right' : 'text-left'
                )}>
                  <h3 className="text-[8px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    {t(`core.sections.${sectionKey}`, sections[sectionKey as keyof typeof sections])}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const hasActiveSubItem = item.subItems?.some(sub => location.pathname === sub.path);
                  const isActive = !item.isExpandable && location.pathname === item.path;
                  const isExpanded = expandedSections.includes(item.key);
                  const itemLabel = t(`core.navigation.${item.key}`, item.key);
                  const isHighlighted = searchQuery && itemLabel.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  const navigationItem = (
                    <div key={item.key}>
                      {item.isExpandable ? (
                        <button
                          onClick={() => toggleSection(item.key)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                            isHighlighted && "ring-1 ring-primary/50 bg-primary/5"
                          )}
                        >
                          <Icon size={18} />
                          <span className={cn("flex-1", direction === 'rtl' ? 'text-right' : 'text-left')}>{itemLabel}</span>
                          <ChevronDown size={14} className={cn(
                            "transition-transform duration-200",
                            isExpanded ? "rotate-180" : ""
                          )} />
                        </button>
                      ) : (
                        <NavLink
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                            isHighlighted && !isActive && "ring-1 ring-primary/50 bg-primary/5"
                          )}
                        >
                          <Icon size={18} />
                          <span className={cn("flex-1", direction === 'rtl' ? 'text-right' : 'text-left')}>{itemLabel}</span>
                        </NavLink>
                      )}
                      
                      {item.subItems && isExpanded && (
                        <div className={cn(
                          "mt-1 space-y-1",
                          direction === 'rtl' ? 'pr-7' : 'pl-7'
                        )}>
                          {item.subItems.filter(subItem => {
                            if (!searchQuery) return true;
                            return t(`core.navigation.${subItem.key}`, subItem.key).toLowerCase().includes(searchQuery.toLowerCase());
                          }).map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname === subItem.path;
                            const subLabel = t(`core.navigation.${subItem.key}`, subItem.key);
                            const isSubHighlighted = searchQuery && subLabel.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <NavLink
                                key={subItem.key}
                                to={subItem.path}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-200",
                                  isSubActive 
                                    ? "bg-primary/20 text-primary" 
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                  isSubHighlighted && !isSubActive && "ring-1 ring-primary/50 bg-primary/5"
                                )}
                              >
                                <SubIcon size={16} />
                                <span className={cn("flex-1", direction === 'rtl' ? 'text-right' : 'text-left')}>{subLabel}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                  
                  return item.permission ? (
                    <PermissionGuard key={item.key} permission={item.permission}>
                      {navigationItem}
                    </PermissionGuard>
                  ) : navigationItem;
                })}
              </div>
            </div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <div className={cn(
          "text-[9px] text-sidebar-foreground/50",
          direction === 'rtl' ? 'text-right' : 'text-center'
        )}>
          {t('core.app.version', 'Version')} 1.0.0
        </div>
      </div>
    </div>
  );
};
