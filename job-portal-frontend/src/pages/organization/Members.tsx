import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organisationApi } from '../../services/api/organisation.api';
import { tokensApi } from '../../services/api/tokens.api';
import { useAuthStore } from '../../store/auth.store';
import { 
  getStoreRecruiters, 
  saveStoreRecruiters, 
  allocateCreditsToRecruiter 
} from '../../store/clyptus.store';
import { RecruiterUser } from '../../types/clyptus.types';
import {
  Activity,
  CheckCircle,
  Coins,
  Edit2,
  Eye,
  FileText,
  Filter,
  Info,
  Mail,
  MoreVertical,
  PauseCircle,
  Phone,
  Plus,
  PlayCircle,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  X,
  Zap,
} from 'lucide-react';

interface Recruiter {
  id: string;
  userId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  department?: string;
  role: string;
  recruiterType: 'HR_RECRUITER' | 'HIRING_MANAGER';
  status: 'ACTIVE' | 'SUSPENDED';
  tokenBalance: number;
  assignedJobsCount: number;
  assignedJobs: Array<{ id: string; title: string; department: string; status: string }>;
  workloadScore: number; // 0-100%
  joinDate: string;
  activities: Array<{ id: string; action: string; timestamp: string; details: string }>;
}

import { addAuditLog } from './Audit';

import { usePermissions } from '../../hooks/usePermissions';

export const Members: React.FC = () => {
  const { organizationId, user } = useAuthStore();
  const queryClient = useQueryClient();
  const perms = usePermissions();
  const canManageTeam = perms.canManageTeam;
  const canCreateJobs = perms.canCreateJobs;

  const isSuperAdmin = user?.role === 'ORG_SUPER_ADMIN';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profileModalRecruiter, setProfileModalRecruiter] = useState<Recruiter | null>(null);
  const [editModalRecruiter, setEditModalRecruiter] = useState<Recruiter | null>(null);
  const [activityModalRecruiter, setActivityModalRecruiter] = useState<Recruiter | null>(null);
  const [allocateModalRecruiter, setAllocateModalRecruiter] = useState<Recruiter | null>(null);
  const [deleteTransferRecruiter, setDeleteTransferRecruiter] = useState<Recruiter | null>(null);
  const [successorRecruiterId, setSuccessorRecruiterId] = useState<string>('');

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Talent Acquisition',
    recruiterType: 'HR_RECRUITER' as 'HR_RECRUITER' | 'HIRING_MANAGER',
  });

  const [allocateAmount, setAllocateAmount] = useState('25');

  React.useEffect(() => {
    if (isAddModalOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        department: 'Talent Acquisition',
        recruiterType: 'HR_RECRUITER',
      });
    }
  }, [isAddModalOpen]);

  // Available organisation jobs (loaded dynamically from Jobs section)
  const defaultAvailableJobs: any[] = [];

  const [availableJobsList, setAvailableJobsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('clyptus_org_jobs');
      return saved ? JSON.parse(saved) : defaultAvailableJobs;
    } catch (e) {
      return defaultAvailableJobs;
    }
  });

  // Mock initial recruiters list if API data is loading or empty
  const defaultRecruiters: Recruiter[] = [];

  // Load recruiter list dynamically from shared clyptus store
  const loadRecruitersFromStore = (): Recruiter[] => {
    try {
      const storeRecruiters = getStoreRecruiters();
      return storeRecruiters.map((r) => ({
        id: r.id,
        userId: r.id,
        name: r.name,
        email: r.email,
        password: r.password || 'Recruiter@123',
        phone: r.phone || '',
        department: r.recruiterRole || 'Talent Acquisition',
        role: r.isAdmin ? 'ORGANIZATION_ADMIN' : 'RECRUITER',
        recruiterType: 'HR_RECRUITER',
        status: (r.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE') as 'ACTIVE' | 'SUSPENDED',
        tokenBalance: r.remainingBalance !== undefined ? r.remainingBalance : (r.allocatedCredits || 0) - (r.totalCreditsUsed || 0),
        assignedJobsCount: r.activeJobsCount || 0,
        assignedJobs: [],
        workloadScore: 40,
        joinDate: r.createdAt || new Date().toISOString().split('T')[0],
        activities: [
          { id: `act-${r.id}`, action: 'Account Active', timestamp: 'Active', details: `Recruiter active with ${r.remainingBalance || 0} tokens` }
        ],
      }));
    } catch (e) {
      return [];
    }
  };

  const [recruiterList, setRecruiterList] = useState<Recruiter[]>(() => loadRecruitersFromStore());

  React.useEffect(() => {
    const handleSync = () => {
      setRecruiterList(loadRecruitersFromStore());
      try {
        const savedJobs = localStorage.getItem('clyptus_org_jobs');
        if (savedJobs) setAvailableJobsList(JSON.parse(savedJobs));
      } catch (e) {}
    };

    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filtered recruiters
  const filteredRecruiters = recruiterList.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dynamic live calculation of assigned jobs for any recruiter
  const getRecruiterAssignedJobs = (r: Recruiter) => {
    const matchedFromJobs = availableJobsList.filter((j: any) => {
      const idMatch = j.assignedRecruiterId && (j.assignedRecruiterId === r.id || j.assignedRecruiterId === r.email || j.assignedRecruiterId === r.userId);
      const nameMatch = j.assignedRecruiterName && j.assignedRecruiterName.toLowerCase() === r.name.toLowerCase();
      return idMatch || nameMatch;
    });

    const combinedMap = new Map();
    matchedFromJobs.forEach((j: any) =>
      combinedMap.set(j.id, { id: j.id, title: j.title, department: j.department, status: j.status || 'PUBLISHED' })
    );

    if (r.assignedJobs && Array.isArray(r.assignedJobs)) {
      r.assignedJobs.forEach((j: any) => {
        if (!combinedMap.has(j.id)) combinedMap.set(j.id, j);
      });
    }

    return Array.from(combinedMap.values());
  };

  // Actions
  const handleAddRecruiter = (e: React.FormEvent) => {
    e.preventDefault();
    const initialTkn = 0;
    const newRecruiterUser: RecruiterUser = {
      id: `rec_${Date.now()}`,
      organizationId: 'org_abc_tech',
      name: formData.name,
      email: formData.email,
      password: formData.password || 'Recruiter@123',
      phone: formData.phone || '',
      recruiterRole: formData.recruiterType === 'HIRING_MANAGER' ? 'Hiring Manager' : 'HR Recruiter',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0052CC&color=fff`,
      status: 'ACTIVE',
      activeJobsCount: 0,
      profileViewsCount: 0,
      resumeDownloadsCount: 0,
      totalCreditsUsed: 0,
      allocatedCredits: initialTkn,
      remainingBalance: initialTkn,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const currentStoreRecruiters = getStoreRecruiters();
    const updatedStore = [newRecruiterUser, ...currentStoreRecruiters.filter(r => r.email.toLowerCase() !== formData.email.toLowerCase())];
    
    saveStoreRecruiters(updatedStore);

    addAuditLog('RECRUITER_ACTION', 'Recruiter Added', `Added new recruiter ${formData.name} (${formData.email}) with login credentials`, { name: formData.name, email: formData.email });
    
    setRecruiterList(loadRecruitersFromStore());
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      department: 'Talent Acquisition',
      recruiterType: 'HR_RECRUITER',
    });
  };

  const handleUpdateRecruiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalRecruiter) return;

    const targetOldRec = recruiterList.find((r) => r.id === editModalRecruiter.id);

    const currentStore = getStoreRecruiters();
    const updatedStore = currentStore.map((r) => {
      if (r.id === editModalRecruiter.id || r.email.toLowerCase() === editModalRecruiter.email.toLowerCase()) {
        return {
          ...r,
          name: editModalRecruiter.name,
          email: editModalRecruiter.email,
          password: editModalRecruiter.password || r.password || 'Recruiter@123',
          phone: editModalRecruiter.phone || r.phone,
          recruiterRole: editModalRecruiter.department || r.recruiterRole,
        };
      }
      return r;
    });

    saveStoreRecruiters(updatedStore);

    // Sync updated recruiter name to assigned jobs in clyptus_org_jobs
    try {
      const savedJobsStr = localStorage.getItem('clyptus_org_jobs') || localStorage.getItem('clyptus_jobs');
      if (savedJobsStr) {
        const jobsArr = JSON.parse(savedJobsStr);
        const updatedJobs = jobsArr.map((j: any) => {
          const isMatch = (j.assignedRecruiterId && (j.assignedRecruiterId === editModalRecruiter.id || j.assignedRecruiterId === editModalRecruiter.email)) ||
            (targetOldRec && j.assignedRecruiterName?.toLowerCase() === targetOldRec.name.toLowerCase());
          if (isMatch) {
            return { ...j, assignedRecruiterName: editModalRecruiter.name };
          }
          return j;
        });
        localStorage.setItem('clyptus_org_jobs', JSON.stringify(updatedJobs));
        localStorage.setItem('clyptus_jobs', JSON.stringify(updatedJobs));
      }
    } catch (e) {}

    addAuditLog('RECRUITER_ACTION', 'Recruiter Information Updated', `Updated profile and contact information for ${editModalRecruiter.name}`, { id: editModalRecruiter.id, name: editModalRecruiter.name });
    
    setRecruiterList(loadRecruitersFromStore());
    setEditModalRecruiter(null);
  };

  const handleToggleSuspend = (id: string) => {
    const targetRec = recruiterList.find((r) => r.id === id);
    if (!targetRec) return;

    const newStatus: 'ACTIVE' | 'SUSPENDED' = targetRec.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const currentStore = getStoreRecruiters();
    const updatedStore = currentStore.map((r) => {
      if (r.id === id || r.email.toLowerCase() === targetRec.email.toLowerCase()) {
        return {
          ...r,
          status: newStatus,
        };
      }
      return r;
    });

    saveStoreRecruiters(updatedStore);

    addAuditLog('RECRUITER_ACTION', `Recruiter Account ${newStatus === 'SUSPENDED' ? 'Suspended' : 'Reactivated'}`, `Changed recruiter account status of ${targetRec.name} to ${newStatus}`, { recruiterId: targetRec.id, recruiterName: targetRec.name, newStatus });
    
    setRecruiterList(loadRecruitersFromStore());
  };

  const handleInitiateRemove = (r: Recruiter) => {
    setDeleteTransferRecruiter(r);
    const others = recruiterList.filter((item) => item.id !== r.id);
    if (others.length > 0) {
      setSuccessorRecruiterId(others[0].id);
    } else {
      setSuccessorRecruiterId('');
    }
  };

  const handleConfirmRemoveWithTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTransferRecruiter) return;

    const currentStore = getStoreRecruiters();
    const successorRec = currentStore.find((r) => r.id === successorRecruiterId);
    const assignedJobs = getRecruiterAssignedJobs(deleteTransferRecruiter);
    const tokenAmountToTransfer = deleteTransferRecruiter.tokenBalance || 0;

    // 1. Reassign assigned jobs to successor
    try {
      const savedJobsStr = localStorage.getItem('clyptus_org_jobs') || localStorage.getItem('clyptus_jobs');
      if (savedJobsStr) {
        const jobsArr = JSON.parse(savedJobsStr);
        const updatedJobs = jobsArr.map((j: any) => {
          const isMatch = (j.assignedRecruiterId && (j.assignedRecruiterId === deleteTransferRecruiter.id || j.assignedRecruiterId === deleteTransferRecruiter.email)) ||
            j.assignedRecruiterName?.toLowerCase() === deleteTransferRecruiter.name.toLowerCase();
          if (isMatch) {
            return {
              ...j,
              assignedRecruiterId: successorRec ? successorRec.id : undefined,
              assignedRecruiterName: successorRec ? successorRec.name : 'Unassigned',
            };
          }
          return j;
        });
        localStorage.setItem('clyptus_org_jobs', JSON.stringify(updatedJobs));
        localStorage.setItem('clyptus_jobs', JSON.stringify(updatedJobs));
      }
    } catch (err) {}

    // 2. Transfer credit balance to successor
    let updatedStore = currentStore.map((r) => {
      if (successorRec && (r.id === successorRec.id || r.email.toLowerCase() === successorRec.email.toLowerCase())) {
        const currentAlloc = r.allocatedCredits || 0;
        const currentRem = r.remainingBalance !== undefined ? r.remainingBalance : currentAlloc;
        return {
          ...r,
          allocatedCredits: currentAlloc + tokenAmountToTransfer,
          remainingBalance: currentRem + tokenAmountToTransfer,
        };
      }
      return r;
    });

    // Remove deleted recruiter
    updatedStore = updatedStore.filter((r) => r.id !== deleteTransferRecruiter.id && r.email.toLowerCase() !== deleteTransferRecruiter.email.toLowerCase());

    saveStoreRecruiters(updatedStore);

    const successorInfoText = successorRec ? `Reassigned ${assignedJobs.length} jobs and ${tokenAmountToTransfer} credits to ${successorRec.name}` : `Returned ${tokenAmountToTransfer} credits to pool`;
    addAuditLog(
      'RECRUITER_ACTION',
      'Recruiter Removed & History Transferred',
      `Deleted recruiter ${deleteTransferRecruiter.name} (${deleteTransferRecruiter.email}). ${successorInfoText}.`,
      { id: deleteTransferRecruiter.id, name: deleteTransferRecruiter.name, successor: successorRec?.name }
    );

    setRecruiterList(loadRecruitersFromStore());
    setDeleteTransferRecruiter(null);
  };

  const handleAllocateTokensSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateModalRecruiter) return;
    const amount = Number(allocateAmount);

    setRecruiterList((prevList) =>
      prevList.map((r) => {
        if (r.id === allocateModalRecruiter.id) {
          return {
            ...r,
            tokenBalance: r.tokenBalance + amount,
          };
        }
        return r;
      })
    );

    // 1. Sync allocations list for Billing.tsx
    try {
      const savedAllocations = localStorage.getItem('clyptus_org_allocations');
      const allocations = savedAllocations ? JSON.parse(savedAllocations) : [];
      const updatedAllocations = allocations.map((a: any) => {
        if (a.id === allocateModalRecruiter.id || a.email === allocateModalRecruiter.email) {
          return { ...a, allocatedTokens: (a.allocatedTokens || 0) + amount };
        }
        return a;
      });
      localStorage.setItem('clyptus_org_allocations', JSON.stringify(updatedAllocations));
    } catch (e) {}

    // 2. Add Audit Log to Audit.tsx
    addAuditLog('TOKEN_ALLOCATION', 'Token Quota Allocated', `Allocated +${amount} hiring tokens to recruiter ${allocateModalRecruiter.name}`, { recipient: allocateModalRecruiter.name, amount });

    // 3. Add to Consumption Audit Logs for Billing.tsx
    try {
      const savedLogs = localStorage.getItem('clyptus_org_consumption_logs');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: `tx-${Date.now()}`,
        recruiterName: allocateModalRecruiter.name,
        action: `Quota Allocation (+${amount} Tokens)`,
        tokensSpent: -amount,
        targetRef: 'Org Admin Distribution',
        timestamp: 'Just now',
      };
      localStorage.setItem('clyptus_org_consumption_logs', JSON.stringify([newLog, ...logs]));
    } catch (e) {}

    window.dispatchEvent(new Event('storage'));
    setAllocateModalRecruiter(null);
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-[#0B192C]">Recruiter Governance Center</h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-[#0052CC] font-bold text-[10px] rounded-md border border-blue-100">
              ORG ADMIN ACCESS
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Manage recruiter profiles, update access status, monitor workload & view audit activities.
          </p>
        </div>

        {canManageTeam && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#0052CC] text-white text-xs font-bold rounded-xl hover:bg-[#0043A8] transition shadow-md flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Recruiter</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by recruiter name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC] font-medium"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-1.5 text-gray-500 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl outline-none font-bold bg-gray-50 text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Recruiters List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredRecruiters.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 font-medium">
            No recruiters match your search filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 pl-6">RECRUITER</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">WORKLOAD & JOBS</th>
                  <th className="p-4">CREDIT BAL.</th>
                  <th className="p-4 pr-6 text-right">ORG ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredRecruiters.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition">
                    {/* Name & Email */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 leading-tight">{r.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{r.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                        <span>{r.status}</span>
                      </span>
                    </td>

                    {/* Workload Progress & Assigned Jobs */}
                    {(() => {
                      const liveJobs = getRecruiterAssignedJobs(r);
                      const count = liveJobs.length;
                      const score = Math.min(100, count * 25);
                      return (
                        <td className="p-4 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-gray-700">{count} Openings</span>
                            <span className="text-gray-400">{score}% Load</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score > 75
                                  ? 'bg-rose-500'
                                  : score > 40
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </td>
                      );
                    })()}

                    {/* Token Balance */}
                    <td className="p-4">
                      <span className="font-extrabold text-[#0052CC] text-xs">
                        {r.tokenBalance} credits
                      </span>
                    </td>

                    {/* Actions dropdown/buttons */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* View Profile */}
                        <button
                          onClick={() => setProfileModalRecruiter(r)}
                          title="View Profile"
                          className="p-1.5 text-gray-500 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Info */}
                        {canManageTeam && (
                          <button
                            onClick={() => setEditModalRecruiter(r)}
                            title="Update Information"
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}



                        {/* View Activities */}
                        <button
                          onClick={() => setActivityModalRecruiter(r)}
                          title="View Recruiter Activities"
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Activity className="w-4 h-4" />
                        </button>

                        {/* Suspend / Reactivate */}
                        {canManageTeam && (
                          <button
                            onClick={() => handleToggleSuspend(r.id)}
                            title={r.status === 'ACTIVE' ? 'Suspend Recruiter' : 'Reactivate Recruiter'}
                            className={`p-1.5 rounded-lg transition ${
                              r.status === 'ACTIVE'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {r.status === 'ACTIVE' ? (
                              <PauseCircle className="w-4 h-4" />
                            ) : (
                              <PlayCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Remove */}
                        {canManageTeam && (
                          <button
                            onClick={() => handleInitiateRemove(r)}
                            title="Remove Recruiter & Transfer Data"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. ADD RECRUITER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0052CC] flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Add New Recruiter</h3>
                <p className="text-xs text-gray-500">Create recruiter account & allocate privileges</p>
              </div>
            </div>

            <form onSubmit={handleAddRecruiter} autoComplete="off" className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  autoComplete="off"
                  name="org_recruiter_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC] font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address (Mail ID) *</label>
                <input
                  type="email"
                  autoComplete="new-password"
                  name="org_recruiter_email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah.c@company.com"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC] font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assign Login Password *</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  name="org_recruiter_password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Set account password..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC] font-medium bg-blue-50/30 text-gray-900 font-mono"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">This password will be assigned to the recruiter for logging into their account.</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  autoComplete="off"
                  name="org_recruiter_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Mobile phone number"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0052CC] text-white font-bold rounded-xl hover:bg-[#0043A8] shadow-md"
                >
                  Add Recruiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. VIEW PROFILE MODAL */}
      {profileModalRecruiter && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative text-xs">
            <button
              onClick={() => setProfileModalRecruiter(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#0052CC] text-white flex items-center justify-center font-black text-xl shadow-md">
                {profileModalRecruiter.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-900">{profileModalRecruiter.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{profileModalRecruiter.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Assigned Login Credentials Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#0052CC] uppercase tracking-wider">Assigned Recruiter Login Credentials</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-[#0052CC] font-extrabold text-[9px] rounded-full uppercase">
                    Recruiter Login Info
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#0052CC] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Mail ID</p>
                      <p className="font-bold text-gray-900 truncate" title={profileModalRecruiter.email}>
                        {profileModalRecruiter.email}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#0052CC] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Assigned Password</p>
                      <p className="font-extrabold text-[#0052CC] font-mono text-xs">
                        {profileModalRecruiter.password || 'Recruiter@123'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Phone</span>
                  <p className="font-bold text-gray-900 mt-0.5">{profileModalRecruiter.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                  <p className="font-bold text-gray-900 mt-0.5">{profileModalRecruiter.status}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Token Quota</span>
                  <p className="font-bold text-[#0052CC] mt-0.5">{profileModalRecruiter.tokenBalance} credits</p>
                </div>
              </div>

              {(() => {
                const modalJobs = getRecruiterAssignedJobs(profileModalRecruiter);
                return (
                  <div>
                    <h4 className="font-extrabold text-gray-900 mb-2">Assigned Job Openings ({modalJobs.length})</h4>
                    {modalJobs.length === 0 ? (
                      <p className="text-gray-400 text-xs italic">No jobs assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {modalJobs.map((j: any) => (
                          <div key={j.id} className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-900">{j.title}</p>
                              <span className="text-[10px] text-gray-400">{j.department}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              {j.status || 'ACTIVE'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-5 border-t border-gray-100 mt-6">
              <button
                onClick={() => setProfileModalRecruiter(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. UPDATE RECRUITER INFORMATION MODAL */}
      {editModalRecruiter && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative text-xs">
            <button
              onClick={() => setEditModalRecruiter(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-gray-900 mb-4">Update Recruiter Information</h3>

            <form onSubmit={handleUpdateRecruiter} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editModalRecruiter.name}
                  onChange={(e) => setEditModalRecruiter({ ...editModalRecruiter, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editModalRecruiter.email}
                  onChange={(e) => setEditModalRecruiter({ ...editModalRecruiter, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Password</label>
                <input
                  type="text"
                  value={editModalRecruiter.password || ''}
                  onChange={(e) => setEditModalRecruiter({ ...editModalRecruiter, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none font-mono font-bold text-[#0052CC]"
                  placeholder="Enter login password"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editModalRecruiter.phone || ''}
                  onChange={(e) => setEditModalRecruiter({ ...editModalRecruiter, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalRecruiter(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0052CC] text-white font-bold rounded-xl hover:bg-[#0043A8] shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* 5. VIEW RECRUITER ACTIVITIES MODAL */}
      {activityModalRecruiter && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative text-xs">
            <button
              onClick={() => setActivityModalRecruiter(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Recruiter Activity Audit Log</h3>
                <p className="text-xs text-gray-500">Live activity trail for {activityModalRecruiter.name}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activityModalRecruiter.activities.map((act) => (
                <div key={act.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-gray-900">{act.action}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{act.details}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-5 border-t border-gray-100 mt-5">
              <button
                onClick={() => setActivityModalRecruiter(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REASSIGN WORKLOAD & TRANSFER DATA BEFORE DELETION MODAL */}
      {deleteTransferRecruiter && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative text-xs animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setDeleteTransferRecruiter(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Reassign Data & Remove Recruiter</h3>
                <p className="text-xs text-gray-500">Target Account: {deleteTransferRecruiter.name}</p>
              </div>
            </div>

            {/* Direct Deletion Warning Card */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1 mb-4">
              <p className="font-extrabold text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                No Direct Deleting Permitted
              </p>
              <p className="text-[11px] leading-relaxed font-medium">
                To prevent data loss, all assigned job requisitions, candidate interactions, and remaining credit balance must be reassigned to another active recruiter before deletion.
              </p>
            </div>

            <form onSubmit={handleConfirmRemoveWithTransfer} className="space-y-4">
              {/* Summary of Data to Transfer */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-600">Assigned Job Openings:</span>
                  <span className="font-extrabold text-gray-900">
                    {getRecruiterAssignedJobs(deleteTransferRecruiter).length} Jobs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-600">Remaining Credit Balance:</span>
                  <span className="font-extrabold text-[#0052CC]">
                    {deleteTransferRecruiter.tokenBalance} Credits
                  </span>
                </div>
              </div>

              {/* Successor Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Select Successor Recruiter / Admin *
                </label>
                {recruiterList.filter((r) => r.id !== deleteTransferRecruiter.id).length > 0 ? (
                  <select
                    value={successorRecruiterId}
                    onChange={(e) => setSuccessorRecruiterId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-bold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  >
                    {recruiterList
                      .filter((r) => r.id !== deleteTransferRecruiter.id)
                      .map((rec) => (
                        <option key={rec.id} value={rec.id}>
                          {rec.name} ({rec.email})
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold text-xs">
                    No other active recruiters available. Assigned jobs will be marked as Unassigned and credits returned to Org Master Wallet.
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeleteTransferRecruiter(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition shadow-md cursor-pointer"
                >
                  Transfer History & Delete Recruiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

