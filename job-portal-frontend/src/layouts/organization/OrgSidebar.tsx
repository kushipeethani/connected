import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import {
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Gift,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  UserCheck,
  Users,
  ChevronDown,
  ChevronRight,
  Layers,
  Zap,
  ShieldAlert,
} from 'lucide-react';

import { usePermissions } from '../../hooks/usePermissions';

export const OrgSidebar: React.FC = () => {
  const { user, organizationId } = useAuthStore();
  const { isSidebarOpen } = useUiStore();
  const perms = usePermissions();

  // Collapsible Dropdown States
  const [isOperationsOpen, setIsOperationsOpen] = useState(true);
  const [isTokensAnalyticsOpen, setIsTokensAnalyticsOpen] = useState(true);

  const base = `/org/${organizationId}`;

  const operationsNav = [
    { label: 'Dashboard', path: `${base}/dashboard`, icon: LayoutDashboard, perm: true },
    { label: 'Recruiters', path: `${base}/members`, icon: Users, perm: perms.canManageTeam },
    { label: 'Jobs Overview', path: `${base}/jobs`, icon: Briefcase, perm: perms.canViewJobs },
    { label: 'Candidates', path: `${base}/candidates`, icon: UserCheck, perm: perms.canManageCandidates },
    { label: 'Applications & ATS', path: `${base}/applications`, icon: FileText, perm: perms.canManageCandidates },
    { label: 'Interviews', path: `${base}/interviews`, icon: Calendar, perm: perms.canManageInterviews },
    { label: 'Offers', path: `${base}/offers`, icon: Gift, perm: perms.canCreateOffers || perms.canManageInterviews },
  ].filter((item) => item.perm);

  const tokensAnalyticsNav = [
    { label: 'Token Allocation', path: `${base}/billing`, icon: CreditCard, perm: perms.canAllocateTokens },
    { label: 'Recruitment Analytics', path: `${base}/analytics`, icon: LineChart, perm: perms.canViewAnalytics },
    { label: 'Audit Logs', path: `${base}/audit`, icon: ShieldCheck, perm: true },
  ].filter((item) => item.perm);

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full shrink-0 select-none overflow-hidden">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">

        {/* 1. OPERATIONS Dropdown Section */}
        <div>
          <button
            type="button"
            onClick={() => setIsOperationsOpen(!isOperationsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold text-gray-500 hover:text-gray-900 uppercase tracking-wider rounded-xl hover:bg-gray-100/70 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>OPERATIONS</span>
            </div>
            {isOperationsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {isOperationsOpen && (
            <div className="space-y-1 mt-1 pl-1">
              {operationsNav.map((item) => (
                <NavLink
                  key={item.label}
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
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 2. TOKENS & ANALYTICS Dropdown Section */}
        <div>
          <button
            type="button"
            onClick={() => setIsTokensAnalyticsOpen(!isTokensAnalyticsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold text-gray-500 hover:text-gray-900 uppercase tracking-wider rounded-xl hover:bg-gray-100/70 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-[#F97316]" />
              <span>TOKENS & ANALYTICS</span>
            </div>
            {isTokensAnalyticsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {isTokensAnalyticsOpen && (
            <div className="space-y-1 mt-1 pl-1">
              {tokensAnalyticsNav.map((item) => (
                <NavLink
                  key={item.label}
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
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 px-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 shrink-0 bg-white">
        <span>Organization Admin</span>
        <span className="font-semibold text-gray-400">v3.0 Spec</span>
      </div>
    </aside>
  );
};
