import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarSection {
  title: string;
  items: {
    path: string;
    icon: string;
    label: string;
  }[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    ]
  },
  {
    title: "Inventory",
    items: [
      { path: '/products', icon: 'inventory_2', label: 'Products' },
      { path: '/categories', icon: 'category', label: 'Categories' },
    ]
  },
  {
    title: "Sales & Customers",
    items: [
      { path: '/customers', icon: 'people', label: 'Customers' },
      { path: '/invoices', icon: 'receipt', label: 'Invoices' },
      { path: '/payments', icon: 'payment', label: 'Payments' },
      { path: '/payment-modes', icon: 'credit_card', label: 'Payment Modes' },
    ]
  },
  {
    title: "Purchasing",
    items: [
      { path: '/vendors', icon: 'business', label: 'Vendors' },
      { path: '/purchase-orders', icon: 'assignment', label: 'Purchase Orders' },
    ]
  },
  {
    title: "Expenses",
    items: [
      { path: '/expenses', icon: 'receipt_long', label: 'Expenses' },
    ]
  },
  {
    title: "Operations",
    items: [
      { path: '/branches', icon: 'store', label: 'Branches' },
      { path: '/devices', icon: 'devices', label: 'Devices' },
      { path: '/staff', icon: 'people', label: 'Staff' },
      { path: '/kra-audit', icon: 'history', label: 'KRA Audit' },
      { path: '/kra-verification', icon: 'verified', label: 'KRA Verification' },
      //{ path: '/fuel-transactions', icon: 'local_gas_station', label: 'Fuel Transactions' },
    ]
  },
  {
    title: "Reports",
    items: [
      //{ path: '/reports/sales', icon: 'analytics', label: 'Sales Reports' },
      { path: '/reports/inventory', icon: 'assessment', label: 'Stock Reports' },
      //{ path: '/reports/financial', icon: 'account_balance', label: 'Financial Reports' },
    ]
  }
];

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isMobile,
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Filter sections and items based on user context
  const getFilteredSections = () => {
    return sidebarSections.map(section => {
      if (section.title === "Operations") {
        // Show KRA features only for Kenyan merchants (country-based, not subscription-based)
        const filteredItems = section.items.filter(item => {
          if (item.path === '/kra-audit' || item.path === '/kra-verification') {
            return user?.merchant?.country === 'KE';
          }
          return true;
        });
        return { ...section, items: filteredItems };
      }
      return section;
    });
  };

  const filteredSections = getFilteredSections();

  // If mobile sidebar is closed, don't render anything
  if (isMobile && !isOpen) return null;

  return (
    <aside className={cn(
      "sidebar flex-shrink-0 h-screen z-30 transition-all duration-300 border-r",
      isMobile ? "fixed inset-y-0 left-0 z-50 shadow-lg transform transition-transform duration-200 w-64" : "",
      isMobile && !isOpen && "-translate-x-full",
      !isMobile && collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="h-16 flex items-center justify-between border-b px-4">
          {(!collapsed || isMobile) ? (
            <div className="flex items-center">
              <img src="/logo.png" alt="Farmbook Admin" className="w-100 h-10 mr-2" />

            </div>
          ) : (
            <div className="flex justify-center w-full">
              <img src="/images/logo.png" alt="Farmbook Admin" className="w-10 h-10" />
            </div>
          )}

          {/* Close button for mobile */}
          {isMobile && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-primary/10">
              <span className="material-icons">close</span>
            </button>
          )}

          {/* Collapse toggle for desktop */}
          {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-full hover:bg-primary/10"
            >
              <span className="material-icons text-muted-foreground">
                {collapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {filteredSections.map((section, index) => (
            <div key={index} className={cn("mb-4", index > 0 && "mt-4")}>
              {(!collapsed || isMobile) && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </h3>
              )}
              {index > 0 && collapsed && !isMobile && (
                <Separator className="my-2 mx-auto w-8" />
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    {!collapsed || isMobile ? (
                      <Link
                        to={item.path}
                        className={cn(
                          "sidebar-item flex items-center px-3.5 py-1.5 text-sm hover:bg-primary/10 rounded-md",
                          isActive(item.path) && "bg-primary/10 font-medium"
                        )}
                        onClick={isMobile ? onClose : undefined}
                      >
                        <span className="material-icons mr-2.5 text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "sidebar-item flex justify-center items-center h-10 w-10 mx-auto hover:bg-primary/10 rounded-md",
                              isActive(item.path) && "bg-primary/10"
                            )}
                          >
                            <span className="material-icons text-base">{item.icon}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile and Logout */}
        <div className={cn(
          "border-t mt-auto",
          collapsed && !isMobile ? "p-2" : "p-4"
        )}>
          {(!collapsed || isMobile) ? (
            <div className="flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded text-xs font-medium bg-primary text-white hover:bg-primary/90"
              >
                <span className="material-icons text-sm">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-primary text-white hover:bg-primary/90"
                  >
                    <span className="material-icons text-sm">logout</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Logout
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}