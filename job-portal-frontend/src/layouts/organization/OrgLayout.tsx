import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { OrgHeader } from './OrgHeader';
import { OrgSidebar } from './OrgSidebar';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { getStoreAdmins, getStoreRecruiters } from '../../store/clyptus.store';
import { OrgSettingsModal } from '../../components/organization/OrgSettingsModal';

export const OrgLayout: React.FC = () => {
  useWebSocket();
  const { isSettingsOpen, setSettingsOpen } = useUiStore();
  const navigate = useNavigate();

  // Listen for real-time suspension & admin designation change events across tabs/windows
  useEffect(() => {
    const checkAdminAuthorization = () => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.email) {
        const cleanEmail = currentUser.email.toLowerCase();

        // 1. Check if admin account was suspended by Super Admin
        const admin = getStoreAdmins().find((a) => a.email.toLowerCase() === cleanEmail);
        if (admin && (admin.status === 'SUSPENDED' || admin.status === 'INACTIVE')) {
          useAuthStore.getState().logout();
          navigate('/auth/login?reason=suspended', { replace: true });
          return;
        }

        // 2. Check if recruiter account was suspended
        const recruiter = getStoreRecruiters().find((r) => r.email.toLowerCase() === cleanEmail);
        if (recruiter && (recruiter.status === 'SUSPENDED' || recruiter.status === 'INACTIVE')) {
          useAuthStore.getState().logout();
          navigate('/auth/login?reason=suspended', { replace: true });
          return;
        }

        // 3. Check if designated primary admin was changed to another account
        const activeAdminData = localStorage.getItem('clyptus_active_admin');
        if (activeAdminData) {
          try {
            const activeAdmin = JSON.parse(activeAdminData);
            if (activeAdmin?.email && activeAdmin.email.toLowerCase() !== cleanEmail) {
              useAuthStore.getState().logout();
              navigate('/auth/login?reason=admin_changed', { replace: true });
              return;
            }
          } catch (e) {}
        }

        // 4. Check if recruiter's admin privilege was revoked
        if (recruiter && recruiter.isAdmin === false) {
          const hasAnotherActiveAdmin = getStoreRecruiters().some(r => r.isAdmin === true);
          if (hasAnotherActiveAdmin) {
            useAuthStore.getState().logout();
            navigate('/auth/login?reason=admin_changed', { replace: true });
            return;
          }
        }
      }
    };

    checkAdminAuthorization();

    window.addEventListener('clyptus_store_updated', checkAdminAuthorization);
    window.addEventListener('storage', checkAdminAuthorization);

    return () => {
      window.removeEventListener('clyptus_store_updated', checkAdminAuthorization);
      window.removeEventListener('storage', checkAdminAuthorization);
    };
  }, [navigate]);

  return (
    <div className="h-screen bg-[#F5F5F5] flex flex-col font-sans overflow-hidden">
      <OrgHeader />
      <div className="flex flex-1 w-full overflow-hidden">
        <OrgSidebar />
        <main className="flex-1 p-6 min-w-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {isSettingsOpen && (
        <OrgSettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
};
