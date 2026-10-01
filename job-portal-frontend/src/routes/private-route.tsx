import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { getStoreAdmins, getStoreRecruiters } from '../store/clyptus.store';

export const PrivateRoute: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if current user account is suspended by Organization Super Admin
  if (user.email) {
    const cleanEmail = user.email.toLowerCase();
    
    const admin = getStoreAdmins().find((a) => a.email.toLowerCase() === cleanEmail);
    if (admin && (admin.status === 'SUSPENDED' || admin.status === 'INACTIVE')) {
      useAuthStore.getState().logout();
      return <Navigate to="/auth/login?reason=suspended" replace />;
    }

    const recruiter = getStoreRecruiters().find((r) => r.email.toLowerCase() === cleanEmail);
    if (recruiter && (recruiter.status === 'SUSPENDED' || recruiter.status === 'INACTIVE')) {
      useAuthStore.getState().logout();
      return <Navigate to="/auth/login?reason=suspended" replace />;
    }
  }

  return <Outlet />;
};
