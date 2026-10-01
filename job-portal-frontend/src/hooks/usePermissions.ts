import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { getStoreRolePermissions, getStoreRecruiters } from '../store/clyptus.store';

export type UserRoleKey = 'superAdmin' | 'admin' | 'recruiter';

export const getCurrentUserRole = (pathname: string): UserRoleKey => {
  if (pathname.includes('/organization-super-admin')) {
    return 'superAdmin';
  }
  
  const user = useAuthStore.getState().user;
  if (user?.role === 'ORG_SUPER_ADMIN') {
    return 'superAdmin';
  }
  if (user?.role === 'ORG_ADMIN') {
    return 'admin';
  }
  
  if (user?.email) {
    const recruiters = getStoreRecruiters();
    const rec = recruiters.find(r => r.email.toLowerCase() === user.email.toLowerCase());
    if (rec?.isAdmin) {
      return 'admin';
    }
    if (rec) {
      return 'recruiter';
    }
  }
  
  return 'admin';
};

export const usePermissions = () => {
  const location = useLocation();

  const getPermMap = () => {
    const role = getCurrentUserRole(location.pathname);
    const storePerms = getStoreRolePermissions();
    const map: Record<string, boolean> = {};
    storePerms.forEach((p) => {
      map[p.id] = !!p[role];
    });
    return map;
  };

  const [permissions, setPermissions] = useState<Record<string, boolean>>(getPermMap);

  useEffect(() => {
    const updatePerms = () => {
      setPermissions(getPermMap());
    };

    updatePerms();

    window.addEventListener('clyptus_store_updated', updatePerms);
    window.addEventListener('storage', updatePerms);
    return () => {
      window.removeEventListener('clyptus_store_updated', updatePerms);
      window.removeEventListener('storage', updatePerms);
    };
  }, [location.pathname]);

  return {
    permissions,
    hasPermission: (permId: string): boolean => permissions[permId] ?? true,
    canViewJobs: permissions['p1'] ?? true,
    canCreateJobs: permissions['p2'] ?? true,
    canManageCandidates: permissions['p3'] ?? true,
    canManageInterviews: permissions['p4'] ?? true,
    canViewAnalytics: permissions['p5'] ?? true,
    canManageTeam: permissions['p6'] ?? true,
    canAllocateTokens: permissions['p7'] ?? true,
    canSearchCandidates: permissions['p8'] ?? true,
    canShortlistCandidates: permissions['p9'] ?? true,
    canCreateOffers: permissions['p10'] ?? true,
  };
};
