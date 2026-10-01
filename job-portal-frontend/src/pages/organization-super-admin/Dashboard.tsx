import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Coins, 
  ShieldCheck, 
  ChevronRight,
  CreditCard,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { OrganizationCreditAccount } from '../../types/clyptus.types';
import { 
  getStoreCreditAccount, 
  getStoreRecruiters
} from '../../store/clyptus.store';

interface ContextType {
  creditAccount: OrganizationCreditAccount;
  fetchCreditAccount?: () => void;
}

export const OrgSuperAdminDashboard: React.FC = () => {
  const context = useOutletContext<ContextType>();
  const navigate = useNavigate();

  const [liveAccount, setLiveAccount] = useState<OrganizationCreditAccount>(getStoreCreditAccount());
  const [recruitersCount, setRecruitersCount] = useState<number>(getStoreRecruiters().length);

  const fetchDashboardData = () => {
    setLiveAccount(getStoreCreditAccount());
    setRecruitersCount(getStoreRecruiters().length);
  };

  useEffect(() => {
    fetchDashboardData();
    const handleSync = () => fetchDashboardData();
    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Organization Governance Dashboard</h2>
          <p className="text-xs text-slate-500">Live operational overview, credit accounting balances, and team management</p>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Recruiters</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{recruitersCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Managed credentials & single designated admin</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Available Org Credits</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{liveAccount.balance.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Non-negative pool balance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Credits Consumed</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{liveAccount.totalConsumed}</div>
          <div className="text-[11px] text-brand-blue-600 font-semibold mt-1">Profile views & resume downloads</div>
        </div>

      </div>

      {/* Quick Governance Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Governance Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Direct shortcuts to recruiter accounts, permissions matrix, and credit ledger</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/organization-super-admin/recruiters')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-brand-blue-300 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue-600 flex items-center justify-center font-black">
                <Users className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue-600 transition-colors" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 mt-3">Recruiter Directory</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Configure individual credentials and assign admin authority</p>
          </button>

          <button
            onClick={() => navigate('/organization-super-admin/roles')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-brand-blue-300 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue-600 flex items-center justify-center font-black">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue-600 transition-colors" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 mt-3">Roles & Permissions</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage access control matrix across organization roles</p>
          </button>

          <button
            onClick={() => navigate('/organization-super-admin/tokens')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-brand-blue-300 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue-600 flex items-center justify-center font-black">
                <Coins className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue-600 transition-colors" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 mt-3">Credit Allocation & Ledger</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Allocate search credits to specific recruiters with immutable ledger</p>
          </button>
        </div>
      </div>

    </div>
  );
};
