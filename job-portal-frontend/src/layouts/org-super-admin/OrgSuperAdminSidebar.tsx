import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUiStore } from '../../store/ui.store';
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  Settings,
  ShieldAlert,
  BarChart3,
  CreditCard,
  ChevronDown,
  ChevronRight,
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';

import { usePermissions } from '../../hooks/usePermissions';

export const OrgSuperAdminSidebar: React.FC = () => {
  const location = useLocation();
  const { isSidebarOpen } = useUiStore();
  const perms = usePermissions();

  const navSections = [
    {
      title: 'GOVERNANCE & PEOPLE',
      icon: Layers,
      iconColor: 'text-[#0052CC]',
      items: [
        { label: 'Dashboard', path: '/organization-super-admin/dashboard', icon: LayoutDashboard, perm: true },
        { label: 'Invitations', path: '/organization-super-admin/invitations', icon: UserPlus, perm: perms.canManageTeam },
        { label: 'Recruiters', path: '/organization-super-admin/recruiters', icon: Users, perm: perms.canManageTeam },
        { label: 'Roles & Permissions', path: '/organization-super-admin/roles', icon: ShieldCheck, perm: true },
      ].filter((item) => item.perm)
    },
    {
      title: 'TOKEN & BILLING',
      icon: Zap,
      iconColor: 'text-[#F97316]',
      items: [
        { label: 'Credits Allocation', path: '/organization-super-admin/tokens', icon: Coins, perm: perms.canAllocateTokens },
        { label: 'Billing & Token Purchases', path: '/organization-super-admin/billing', icon: CreditCard, perm: true },
        { label: 'Recruitment Analytics', path: '/organization-super-admin/analytics', icon: BarChart3, perm: perms.canViewAnalytics },
        { label: 'Audit Logs', path: '/organization-super-admin/audit', icon: ShieldAlert, perm: true },
        { label: 'Organization Settings', path: '/organization-super-admin/settings', icon: Settings, perm: true },
      ].filter((item) => item.perm)
    }
  ];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'GOVERNANCE & PEOPLE': true,
    'TOKEN & BILLING': true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full shrink-0 select-none overflow-hidden">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">

        {navSections.map((section, idx) => {
          const isOpen = !!openSections[section.title];
          const SectionIcon = section.icon;
          const hasActiveChild = section.items.some((item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

          return (
            <div key={idx} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer select-none ${
                  hasActiveChild
                    ? 'text-[#0052CC] bg-blue-50/60 font-black'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SectionIcon className={`w-3.5 h-3.5 ${section.iconColor}`} />
                  <span>{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <nav className="mt-1 space-y-1 pl-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                            isActive
                              ? 'bg-[#EBF3FF] text-[#0052CC] font-bold shadow-xs'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4 text-[#0052CC]" />
                          <span>{item.label}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 px-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 shrink-0 bg-white">
        <span>Org Super Admin</span>
        <span className="font-semibold text-gray-400">v3.0 Spec</span>
      </div>
    </aside>
  );
};
