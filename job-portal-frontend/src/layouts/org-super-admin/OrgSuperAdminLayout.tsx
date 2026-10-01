import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { OrgSuperAdminHeader } from './OrgSuperAdminHeader';
import { OrgSuperAdminSidebar } from './OrgSuperAdminSidebar';
import { getStoreCreditAccount } from '../../store/clyptus.store';
import { OrganizationCreditAccount } from '../../types/clyptus.types';
import { CheckCircle2 } from 'lucide-react';

export const OrgSuperAdminLayout: React.FC = () => {
  const [creditAccount, setCreditAccount] = useState<OrganizationCreditAccount>(getStoreCreditAccount());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCreditAccount = () => {
    setCreditAccount(getStoreCreditAccount());
  };

  useEffect(() => {
    fetchCreditAccount();

    const handleSync = () => {
      setCreditAccount(getStoreCreditAccount());
    };
    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="h-screen bg-[#F5F5F5] flex flex-col font-sans overflow-hidden">
      <OrgSuperAdminHeader creditBalance={creditAccount.balance} />

      <div className="flex flex-1 w-full overflow-hidden">
        <OrgSuperAdminSidebar />
        <main className="flex-1 p-6 min-w-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet context={{ creditAccount, setCreditAccount, fetchCreditAccount, showToast }} />
          </div>
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
