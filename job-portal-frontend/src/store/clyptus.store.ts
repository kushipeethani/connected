import { 
  AdminUser, 
  RecruiterUser, 
  OrganizationCreditAccount, 
  CreditTransaction, 
  Job, 
  Candidate, 
  Application, 
  Interview, 
  Offer,
  Invitation,
  OnboardingStep,
  AuditLog,
  ShortlistedCandidate,
  UserStatus,
  RolePermissionRow
} from '../types/clyptus.types';

// Clear legacy dummy data from localStorage once on load
if (typeof window !== 'undefined') {
  try {
    const currentVer = localStorage.getItem('clyptus_fresh_start_v2');
    if (!currentVer) {
      localStorage.clear();
      localStorage.setItem('clyptus_fresh_start_v2', 'true');
    }
  } catch (e) {}
}

export const INITIAL_CREDIT_ACCOUNT: OrganizationCreditAccount = {
  organizationId: 'org_abc_tech',
  organizationName: 'ABC Recruitment Pvt Ltd',
  balance: 1000,
  totalAllocated: 0,
  totalConsumed: 0,
};

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'adm_1',
    organizationId: 'org_abc_tech',
    name: 'Marcus Vance',
    email: 'marcus.v@abctech.com',
    password: 'Admin@2026',
    phone: '+91 98765 12345',
    role: 'Organization Primary Admin',
    department: 'Talent Operations',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    status: 'ACTIVE',
    permissions: ['RECRUITER_MANAGEMENT', 'JOB_MANAGEMENT', 'CANDIDATE_MANAGEMENT', 'APPLICATION_MANAGEMENT', 'REPORTS', 'USER_MANAGEMENT'],
    createdAt: '2026-09-01',
  },

  {
    id: 'adm_3',
    organizationId: 'org_abc_tech',
    name: 'Marcus Vance',
    email: 'orgadmin@abctech.com',
    password: 'Admin@2026',
    phone: '+91 98765 12345',
    role: 'Organization Primary Admin',
    department: 'Talent Operations',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    status: 'ACTIVE',
    permissions: ['RECRUITER_MANAGEMENT', 'JOB_MANAGEMENT', 'CANDIDATE_MANAGEMENT', 'APPLICATION_MANAGEMENT', 'REPORTS', 'USER_MANAGEMENT'],
    createdAt: '2026-09-01',
  }
];

export const INITIAL_RECRUITERS: RecruiterUser[] = [];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv_101',
    organizationId: 'org_abc_tech',
    name: 'Devon Miles',
    email: 'devon.miles@abctech.com',
    role: 'ORG_ADMIN',
    invitedBy: 'Super Admin (Sarah Jenkins)',
    status: 'PENDING',
    sentAt: '2026-09-30 09:30 AM',
    expiresAt: '2026-10-07 09:30 AM',
    expirationDays: 7,
  },
  {
    id: 'inv_102',
    organizationId: 'org_abc_tech',
    name: 'Priya Sundaram',
    email: 'priya.s@abctech.com',
    role: 'RECRUITER',
    invitedBy: 'Super Admin (Sarah Jenkins)',
    status: 'ACCEPTED',
    sentAt: '2026-09-28 02:15 PM',
    expiresAt: '2026-10-05 02:15 PM',
    expirationDays: 7,
  },
  {
    id: 'inv_103',
    organizationId: 'org_abc_tech',
    name: 'Rohan Verma',
    email: 'rohan.v@abctech.com',
    role: 'RECRUITER',
    invitedBy: 'Super Admin (Sarah Jenkins)',
    status: 'EXPIRED',
    sentAt: '2026-09-20 11:00 AM',
    expiresAt: '2026-09-27 11:00 AM',
    expirationDays: 7,
  }
];

export const INITIAL_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'onb_1',
    stepNumber: 1,
    title: 'Organization Identity & Domain Setup',
    description: 'Verify corporate domain (abctech.io) and configure branding logo & legal details.',
    category: 'PROFILE',
    status: 'COMPLETED',
    completedAt: '2026-09-28 10:00 AM',
    completedBy: 'Super Admin',
  },
  {
    id: 'onb_2',
    stepNumber: 2,
    title: 'Credit Pool & Wallet Initialization',
    description: '1,000 baseline search and download credits initialized in the organizational ledger.',
    category: 'FINANCE',
    status: 'COMPLETED',
    completedAt: '2026-09-28 10:05 AM',
    completedBy: 'Super Admin',
  },
  {
    id: 'onb_3',
    stepNumber: 3,
    title: 'Invite Organization Admins & Core Recruiters',
    description: 'Send onboarding invitations with secure expiry policies to admins and recruiters.',
    category: 'PEOPLE',
    status: 'IN_PROGRESS',
  },
  {
    id: 'onb_4',
    stepNumber: 4,
    title: 'Recruiter Quota & Permission Verification',
    description: 'Configure initial zero-credit quotas and designate primary organization admin.',
    category: 'SECURITY',
    status: 'PENDING',
  },
  {
    id: 'onb_5',
    stepNumber: 5,
    title: 'Live Portal Handover & Verification',
    description: 'Authorize recruiters to access candidate search and ATS management workflows.',
    category: 'VERIFICATION',
    status: 'PENDING',
  },
];

export const updateRecruiterDetails = (
  recruiterId: string,
  updates: { name?: string; email?: string; phone?: string; recruiterRole?: string; status?: UserStatus },
  actorName: string = 'Admin'
): RecruiterUser[] => {
  const recruiters = getStoreRecruiters();
  const updated = recruiters.map((rec) => {
    if (rec.id === recruiterId) {
      const newRec = { ...rec, ...updates };
      logAction(
        actorName,
        'ORGANIZATION_ADMIN',
        updates.status && updates.status !== rec.status ? `RECRUITER_STATUS_${updates.status}` : 'RECRUITER_UPDATED',
        'RecruiterUser',
        rec.id,
        'USER',
        `Updated recruiter ${rec.name} (${rec.id}). Status: ${newRec.status}, Role: ${newRec.recruiterRole || 'Tech Recruiter'}, Phone: ${newRec.phone || 'N/A'}.`
      );
      return newRec;
    }
    return rec;
  });

  saveStoreRecruiters(updated);
  return updated;
};

export const INITIAL_TRANSACTIONS: CreditTransaction[] = [];

export const INITIAL_JOBS: Job[] = [];

export const INITIAL_CANDIDATES: Candidate[] = [];

export const INITIAL_APPLICATIONS: Application[] = [];
export const INITIAL_INTERVIEWS: Interview[] = [];
export const INITIAL_OFFERS: Offer[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Helper functions for Reactive Store Sync across Portals

export const getStoreAdmins = (): AdminUser[] => {
  try {
    const data = localStorage.getItem('clyptus_admins');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_ADMINS;
};

export const saveStoreAdmins = (admins: AdminUser[]): void => {
  try {
    localStorage.setItem('clyptus_admins', JSON.stringify(admins));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'ADMINS' } }));
  } catch (err) {}
};

export const getStoreRecruiters = (): RecruiterUser[] => {
  try {
    const data = localStorage.getItem('clyptus_recruiters');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_RECRUITERS;
};

export const getStoreCreditAccount = (): OrganizationCreditAccount => {
  try {
    const data = localStorage.getItem('clyptus_credit_account');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_CREDIT_ACCOUNT;
};

export const saveStoreCreditAccount = (account: OrganizationCreditAccount): void => {
  try {
    localStorage.setItem('clyptus_credit_account', JSON.stringify(account));
    localStorage.setItem('clyptus_org_total_tokens', JSON.stringify(account.balance));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'CREDIT_ACCOUNT' } }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {}
};

export const saveStoreRecruiters = (recruiters: RecruiterUser[]): void => {
  try {
    localStorage.setItem('clyptus_recruiters', JSON.stringify(recruiters));
    localStorage.setItem('clyptus_org_recruiters', JSON.stringify(recruiters));
    const allocations = recruiters.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.recruiterRole || 'HR Recruiter',
      allocatedTokens: r.allocatedCredits || 0,
      usedTokens: r.totalCreditsUsed || 0,
      lastAllocatedDate: r.createdAt || new Date().toISOString().split('T')[0],
      status: ((r.remainingBalance !== undefined ? r.remainingBalance : (r.allocatedCredits || 0) - (r.totalCreditsUsed || 0)) <= 25) ? 'Low Balance' : 'Active',
    }));
    localStorage.setItem('clyptus_org_allocations', JSON.stringify(allocations));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'RECRUITERS' } }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {}
};

export const allocateCreditsToRecruiter = (recruiterId: string, additionalCredits: number, allocatorName: string = 'Super Admin'): RecruiterUser[] => {
  if (additionalCredits === 0) return getStoreRecruiters();

  const recruiters = getStoreRecruiters();
  const targetRec = recruiters.find(r => r.id === recruiterId || r.email.toLowerCase() === recruiterId.toLowerCase());
  if (!targetRec) return recruiters;

  const currentAcc = getStoreCreditAccount();
  const currentAllocated = targetRec.allocatedCredits || 0;
  const currentBalance = targetRec.remainingBalance !== undefined 
    ? Math.max(0, targetRec.remainingBalance) 
    : Math.max(0, currentAllocated - (targetRec.totalCreditsUsed || 0));

  let effectiveAddition = 0;
  if (additionalCredits > 0) {
    effectiveAddition = Math.min(additionalCredits, Math.max(0, currentAcc.balance));
  } else {
    // Reclaim: cannot reclaim more than recruiter's current available balance
    const requestedReclaim = Math.abs(additionalCredits);
    const actualReclaimed = Math.min(requestedReclaim, currentBalance);
    effectiveAddition = -actualReclaimed;
  }

  if (effectiveAddition === 0) return recruiters;

  const updated = recruiters.map((rec) => {
    if (rec.id === targetRec.id) {
      const newAllocated = Math.max(0, (rec.allocatedCredits || 0) + effectiveAddition);
      const newBalance = Math.max(0, currentBalance + effectiveAddition);
      
      logAction(
        allocatorName,
        allocatorName.includes('Super') ? 'SUPER_ADMIN' : 'ORGANIZATION_ADMIN',
        effectiveAddition > 0 ? 'TOKEN_ALLOCATION' : 'TOKEN_RECLAIM',
        'CreditWallet',
        rec.id,
        'TOKEN',
        `${effectiveAddition > 0 ? 'Allocated +' : 'Reclaimed '}${Math.abs(effectiveAddition)} credits ${effectiveAddition > 0 ? 'to' : 'from'} recruiter ${rec.name} (${rec.email}). New balance: ${newBalance} credits.`
      );

      return {
        ...rec,
        allocatedCredits: newAllocated,
        remainingBalance: newBalance,
      };
    }
    return rec;
  });

  saveStoreRecruiters(updated);

  const updatedAcc: OrganizationCreditAccount = {
    ...currentAcc,
    balance: Math.max(0, currentAcc.balance - effectiveAddition),
    totalAllocated: Math.max(0, currentAcc.totalAllocated + effectiveAddition),
  };
  saveStoreCreditAccount(updatedAcc);

  // Sync allocations list for Billing.tsx & CreditReports.tsx
  try {
    const savedAllocations = localStorage.getItem('clyptus_org_allocations');
    if (savedAllocations) {
      const allocationsList = JSON.parse(savedAllocations);
      const updatedAllocations = allocationsList.map((a: any) => {
        if (a.id === targetRec.id || a.email.toLowerCase() === targetRec.email.toLowerCase()) {
          const newAllocatedTokens = Math.max(0, (a.allocatedTokens || 0) + effectiveAddition);
          const newUsed = a.usedTokens || 0;
          return {
            ...a,
            allocatedTokens: newAllocatedTokens,
            status: (newAllocatedTokens - newUsed <= 25) ? 'Low Balance' : 'Active',
          };
        }
        return a;
      });
      localStorage.setItem('clyptus_org_allocations', JSON.stringify(updatedAllocations));
    }
  } catch (err) {}

  // Add transaction record
  const currentTransactions = getStoreCreditTransactions();
  const txId = `tx_${Date.now()}`;
  const newTx: CreditTransaction = {
    id: txId,
    organizationId: 'org_abc_tech',
    recruiterId: targetRec.id,
    recruiterName: targetRec.name,
    action: effectiveAddition > 0 ? 'CREDIT_ALLOCATION' : 'CREDIT_RECLAIM',
    credits: Math.abs(effectiveAddition),
    balanceBefore: currentAcc.balance,
    balanceAfter: updatedAcc.balance,
    timestamp: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
  };
  saveStoreCreditTransactions([newTx, ...currentTransactions]);

  return updated;
};

export const setSingleAdminRecruiter = (recruiterId: string, actorName: string = 'Super Admin'): RecruiterUser[] => {
  const recruiters = getStoreRecruiters();
  const updated = recruiters.map((rec) => ({
    ...rec,
    isAdmin: rec.id === recruiterId,
  }));
  saveStoreRecruiters(updated);

  const targetRec = updated.find(r => r.id === recruiterId);
  if (targetRec) {
    try {
      localStorage.setItem('clyptus_active_admin', JSON.stringify({
        id: targetRec.id,
        name: targetRec.name,
        email: targetRec.email,
        avatar: targetRec.avatar,
        role: 'ORGANIZATION_ADMIN',
        status: targetRec.status,
        isAdmin: true
      }));

      const admins = getStoreAdmins();
      if (!admins.some(a => a.email.toLowerCase() === targetRec.email.toLowerCase())) {
        const newAdminEntry: AdminUser = {
          id: targetRec.id,
          organizationId: targetRec.organizationId || 'org_abc_tech',
          name: targetRec.name,
          email: targetRec.email,
          password: targetRec.password || 'Admin@2026',
          avatar: targetRec.avatar,
          status: 'ACTIVE',
          permissions: ['RECRUITER_MANAGEMENT', 'JOB_MANAGEMENT', 'CANDIDATE_MANAGEMENT', 'APPLICATION_MANAGEMENT', 'REPORTS', 'USER_MANAGEMENT'],
          createdAt: targetRec.createdAt || new Date().toISOString().split('T')[0],
        };
        saveStoreAdmins([...admins, newAdminEntry]);
      }
    } catch (e) {}
  }

  logAction(
    actorName,
    'SUPER_ADMIN',
    'ADMIN_DESIGNATED',
    'RecruiterUser',
    recruiterId,
    'USER',
    `Designated recruiter ${targetRec?.name || recruiterId} as the sole Organization Admin.`
  );

  return updated;
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionRow[] = [
  { id: 'p1', label: 'View organisation jobs', superAdmin: true, admin: true, recruiter: true },
  { id: 'p2', label: 'Create and edit assigned jobs', superAdmin: true, admin: true, recruiter: true },
  { id: 'p3', label: 'View and manage candidates', superAdmin: true, admin: true, recruiter: true },
  { id: 'p4', label: 'Schedule interviews and manage offers', superAdmin: true, admin: true, recruiter: true },
  { id: 'p5', label: 'View organisation analytics', superAdmin: true, admin: true, recruiter: false },
  { id: 'p6', label: 'Manage team member access', superAdmin: true, admin: true, recruiter: false },
  { id: 'p7', label: 'Allocate tokens to recruiters', superAdmin: true, admin: true, recruiter: false },
  { id: 'p8', label: 'Search candidate profiles', superAdmin: true, admin: true, recruiter: true },
  { id: 'p9', label: 'Shortlist candidates', superAdmin: true, admin: true, recruiter: true },
  { id: 'p10', label: 'Create and send offers', superAdmin: true, admin: true, recruiter: true },
];

export const getStoreRolePermissions = (): RolePermissionRow[] => {
  try {
    const data = localStorage.getItem('clyptus_role_permissions');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return DEFAULT_ROLE_PERMISSIONS;
};

export const saveStoreRolePermissions = (permissions: RolePermissionRow[]): void => {
  try {
    localStorage.setItem('clyptus_role_permissions', JSON.stringify(permissions));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'ROLE_PERMISSIONS' } }));
  } catch (err) {}
};

export const hasRolePermission = (role: 'superAdmin' | 'admin' | 'recruiter', permId: string): boolean => {
  const perms = getStoreRolePermissions();
  const perm = perms.find((p) => p.id === permId);
  if (!perm) return true;
  return !!perm[role];
};

export const checkCurrentRolePermission = (pathname: string, permId: string): boolean => {
  let role: 'superAdmin' | 'admin' | 'recruiter' = 'recruiter';
  if (pathname.includes('/organization-super-admin')) {
    role = 'superAdmin';
  } else if (pathname.includes('/admin')) {
    role = 'admin';
  } else if (pathname.includes('/recruiter')) {
    role = 'recruiter';
  }
  return hasRolePermission(role, permId);
};

export const getStoreAuditLogs = (): AuditLog[] => {
  try {
    const data = localStorage.getItem('clyptus_audit_logs');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_AUDIT_LOGS;
};

export const getStoreCreditTransactions = (): CreditTransaction[] => {
  try {
    const data = localStorage.getItem('clyptus_credit_transactions');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_TRANSACTIONS;
};

export const saveStoreCreditTransactions = (transactions: CreditTransaction[]): void => {
  try {
    localStorage.setItem('clyptus_credit_transactions', JSON.stringify(transactions));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'CREDIT_TRANSACTIONS' } }));
  } catch (err) {}
};

export const getStoreApplications = (): Application[] => {
  try {
    const data = localStorage.getItem('clyptus_applications');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_APPLICATIONS;
};

export const getStoreInterviews = (): Interview[] => {
  try {
    const data = localStorage.getItem('clyptus_interviews');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_INTERVIEWS;
};

export const getStoreOffers = (): Offer[] => {
  try {
    const data = localStorage.getItem('clyptus_offers');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_OFFERS;
};

export const getStoreJobs = (): Job[] => {
  try {
    const data = localStorage.getItem('clyptus_jobs');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_JOBS;
};

export const INITIAL_SHORTLISTED_CANDIDATES: ShortlistedCandidate[] = [];

export const getStoreShortlistedCandidates = (): ShortlistedCandidate[] => {
  try {
    const data = localStorage.getItem('clyptus_shortlisted_candidates');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_SHORTLISTED_CANDIDATES;
};

export const toggleShortlistCandidate = (
  recruiterId: string,
  recruiterName: string,
  candidate: { id: string; name: string; email: string; title: string; location?: string; experience?: string; skills?: string[] }
): { isShortlisted: boolean; updated: ShortlistedCandidate[] } => {
  const current = getStoreShortlistedCandidates();
  const existingIndex = current.findIndex(
    (item) => item.candidateId === candidate.id && (item.recruiterId === recruiterId || item.recruiterId === 'rec_1')
  );

  let updated: ShortlistedCandidate[];
  let isShortlisted = false;

  if (existingIndex > -1) {
    updated = current.filter((_, idx) => idx !== existingIndex);
    isShortlisted = false;
  } else {
    const newItem: ShortlistedCandidate = {
      id: `short_${Date.now()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      title: candidate.title,
      recruiterId: recruiterId,
      recruiterName: recruiterName,
      shortlistedAt: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      location: candidate.location || 'Remote',
      experience: candidate.experience || '3+ Years',
      skills: candidate.skills || []
    };
    updated = [newItem, ...current];
    isShortlisted = true;
  }

  try {
    localStorage.setItem('clyptus_shortlisted_candidates', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'SHORTLISTED' } }));
  } catch (err) {}

  return { isShortlisted, updated };
};

export const addAuditLog = (log: Omit<AuditLog, 'id' | 'organizationId' | 'timestamp' | 'ip' | 'userId'> & { id?: string; userId?: string; timestamp?: string; ip?: string }): AuditLog => {
  const currentLogs = getStoreAuditLogs();
  const newLog: AuditLog = {
    id: log.id || `audit_${Date.now()}`,
    organizationId: 'org_abc_tech',
    userId: log.userId || 'usr_sys',
    userName: log.userName,
    role: log.role,
    action: log.action,
    resource: log.resource,
    resourceId: log.resourceId,
    dimension: log.dimension || 'ACTION',
    details: log.details || '',
    timestamp: log.timestamp || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    ip: log.ip || '192.168.1.100',
  };

  const updatedLogs = [newLog, ...currentLogs];
  try {
    localStorage.setItem('clyptus_audit_logs', JSON.stringify(updatedLogs));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'AUDIT_LOGS' } }));
  } catch (err) {}

  return newLog;
};

export const logAction = (
  userName: string,
  role: 'SUPER_ADMIN' | 'ORGANIZATION_ADMIN' | 'RECRUITER' | string,
  action: string,
  resource: string,
  resourceId: string,
  dimension: AuditLog['dimension'],
  details: string
): AuditLog => {
  return addAuditLog({
    userName,
    role,
    action,
    resource,
    resourceId,
    dimension,
    details,
  });
};



export const consumeCreditsFromRecruiter = (
  recruiterId: string, 
  actionType: 'PROFILE_VIEW' | 'RESUME_DOWNLOAD', 
  referenceId: string
): { success: boolean; message?: string; recruiter?: RecruiterUser } => {
  const recruiters = getStoreRecruiters();
  let recIndex = recruiters.findIndex(r => r.id === recruiterId || r.email.toLowerCase() === recruiterId.toLowerCase());
  
  if (recIndex === -1 && recruiters.length > 0) {
    recIndex = 0;
  }

  if (recIndex === -1) {
    return { success: false, message: 'No active recruiter account found.' };
  }

  const rec = recruiters[recIndex];
  const currentAllocated = rec.allocatedCredits || 0;
  const currentUsed = rec.totalCreditsUsed || 0;
  const currentBalance = rec.remainingBalance !== undefined ? Math.max(0, rec.remainingBalance) : Math.max(0, currentAllocated - currentUsed);

  if (currentBalance < 1) {
    return { 
      success: false, 
      message: 'Insufficient recruiter credits! Available credits cannot be negative. Contact Organization Super Admin to top up credits.' 
    };
  }

  const newBalance = Math.max(0, currentBalance - 1);
  const newTotalUsed = currentUsed + 1;
  const newProfileViews = actionType === 'PROFILE_VIEW' ? (rec.profileViewsCount || 0) + 1 : (rec.profileViewsCount || 0);
  const newResumeDownloads = actionType === 'RESUME_DOWNLOAD' ? (rec.resumeDownloadsCount || 0) + 1 : (rec.resumeDownloadsCount || 0);

  const updatedRecruiter: RecruiterUser = {
    ...rec,
    remainingBalance: newBalance,
    totalCreditsUsed: newTotalUsed,
    profileViewsCount: newProfileViews,
    resumeDownloadsCount: newResumeDownloads,
  };

  recruiters[recIndex] = updatedRecruiter;
  saveStoreRecruiters(recruiters);

  // Update Org Credit Account consumed stats
  const orgAccount = getStoreCreditAccount();
  const updatedOrgAccount: OrganizationCreditAccount = {
    ...orgAccount,
    totalConsumed: (orgAccount.totalConsumed || 0) + 1,
  };
  saveStoreCreditAccount(updatedOrgAccount);

  // Log transaction
  const transactions = getStoreCreditTransactions();
  const newTx: CreditTransaction = {
    id: `tx_${Date.now()}`,
    organizationId: 'org_abc_tech',
    recruiterId: rec.id,
    recruiterName: rec.name,
    action: actionType,
    credits: -1,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    referenceType: actionType === 'RESUME_DOWNLOAD' ? 'RESUME' : 'CANDIDATE',
    referenceId: referenceId,
    timestamp: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
  };
  saveStoreCreditTransactions([newTx, ...transactions]);

  // Log Audit Event
  logAction(
    rec.name,
    'RECRUITER',
    actionType,
    actionType === 'RESUME_DOWNLOAD' ? 'ResumeFile' : 'CandidateProfile',
    referenceId,
    'TOKEN',
    `${actionType === 'RESUME_DOWNLOAD' ? 'Downloaded candidate resume' : 'Viewed candidate profile'} (${referenceId}). Consumed 1 credit. Remaining quota: ${newBalance} credits.`
  );

  return { success: true, recruiter: updatedRecruiter };
};

export const saveStoreJobs = (jobs: Job[]) => {
  localStorage.setItem('clyptus_jobs', JSON.stringify(jobs));
  window.dispatchEvent(new CustomEvent('clyptus_store_updated'));
};

export const createJobInStore = (
  jobData: Omit<Job, 'id' | 'createdAt' | 'applicationsCount' | 'shortlistedCount'>,
  actorName: string = 'Recruiter'
): Job[] => {
  const jobs = getStoreJobs();
  const newJob: Job = {
    ...jobData,
    id: `job_${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    applicationsCount: 0,
    shortlistedCount: 0,
  };

  const updated = [newJob, ...jobs];
  saveStoreJobs(updated);

  logAction(
    actorName,
    'USER',
    'JOB_CREATED',
    'JobPosting',
    newJob.id,
    'JOB',
    `Created new job posting "${newJob.title}" assigned to recruiter ${newJob.recruiterName} (${newJob.recruiterId}).`
  );

  return updated;
};

export const updateJobInStore = (
  jobId: string,
  updates: Partial<Job>,
  actorName: string = 'User'
): Job[] => {
  const jobs = getStoreJobs();
  const updated = jobs.map((j) => {
    if (j.id === jobId) {
      const updatedJob = { ...j, ...updates };
      
      let actionType = 'JOB_UPDATED';
      if (updates.status && updates.status !== j.status) {
        actionType = `JOB_STATUS_${updates.status}`;
      } else if (updates.recruiterId && updates.recruiterId !== j.recruiterId) {
        actionType = 'JOB_REASSIGNED';
      }

      logAction(
        actorName,
        'USER',
        actionType,
        'JobPosting',
        jobId,
        'JOB',
        `Updated job "${updatedJob.title}" (${jobId}). Status: ${updatedJob.status}, Assigned Recruiter: ${updatedJob.recruiterName}.`
      );

      return updatedJob;
    }
    return j;
  });

  saveStoreJobs(updated);
  return updated;
};

// Invitations & Onboarding Store Management

export const getStoreInvitations = (): Invitation[] => {
  try {
    const data = localStorage.getItem('clyptus_invitations');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_INVITATIONS;
};

export const saveStoreInvitations = (invitations: Invitation[]): void => {
  try {
    localStorage.setItem('clyptus_invitations', JSON.stringify(invitations));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'INVITATIONS' } }));
  } catch (err) {}
};

export const createInvitation = (
  email: string,
  role: 'ORG_ADMIN' | 'RECRUITER',
  name?: string,
  expirationDays: number = 7,
  actorName: string = 'Super Admin'
): Invitation => {
  const invitations = getStoreInvitations();
  const now = new Date();
  const expiry = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

  const newInv: Invitation = {
    id: `inv_${Date.now()}`,
    organizationId: 'org_abc_tech',
    name: name || email.split('@')[0],
    email: email.trim(),
    role: role,
    invitedBy: `${actorName} (Sarah Jenkins)`,
    status: 'PENDING',
    sentAt: now.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    expiresAt: expiry.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    expirationDays: expirationDays,
  };

  const updated = [newInv, ...invitations];
  saveStoreInvitations(updated);

  logAction(
    actorName,
    'SUPER_ADMIN',
    'INVITATION_SENT',
    'Invitation',
    newInv.id,
    'USER',
    `Sent invitation to ${newInv.email} as ${newInv.role}. Expiration policy: ${expirationDays} days.`
  );

  return newInv;
};

export const resendInvitation = (invitationId: string, actorName: string = 'Super Admin'): Invitation[] => {
  const invitations = getStoreInvitations();
  const now = new Date();

  const updated = invitations.map((inv) => {
    if (inv.id === invitationId) {
      const days = inv.expirationDays || 7;
      const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const resendInv: Invitation = {
        ...inv,
        status: 'PENDING',
        sentAt: now.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        expiresAt: expiry.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      };

      logAction(
        actorName,
        'SUPER_ADMIN',
        'INVITATION_RESENT',
        'Invitation',
        inv.id,
        'USER',
        `Resent invitation to ${inv.email} (${inv.role}). New expiry: ${resendInv.expiresAt}.`
      );

      return resendInv;
    }
    return inv;
  });

  saveStoreInvitations(updated);
  return updated;
};

export const cancelInvitation = (invitationId: string, actorName: string = 'Super Admin'): Invitation[] => {
  const invitations = getStoreInvitations();
  const updated = invitations.map((inv) => {
    if (inv.id === invitationId) {
      const cancelled: Invitation = {
        ...inv,
        status: 'CANCELLED',
      };

      logAction(
        actorName,
        'SUPER_ADMIN',
        'INVITATION_CANCELLED',
        'Invitation',
        inv.id,
        'USER',
        `Cancelled invitation for ${inv.email} (${inv.role}).`
      );

      return cancelled;
    }
    return inv;
  });

  saveStoreInvitations(updated);
  return updated;
};

export const getStoreOnboardingProgress = (): OnboardingStep[] => {
  try {
    const data = localStorage.getItem('clyptus_onboarding_steps');
    if (data) return JSON.parse(data);
  } catch (err) {}
  return INITIAL_ONBOARDING_STEPS;
};

export const saveStoreOnboardingProgress = (steps: OnboardingStep[]): void => {
  try {
    localStorage.setItem('clyptus_onboarding_steps', JSON.stringify(steps));
    window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'ONBOARDING' } }));
  } catch (err) {}
};

export const completeOnboardingStep = (stepId: string, actorName: string = 'Super Admin'): OnboardingStep[] => {
  const steps = getStoreOnboardingProgress();
  const updated = steps.map((s) => {
    if (s.id === stepId) {
      const completed: OnboardingStep = {
        ...s,
        status: 'COMPLETED',
        completedAt: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        completedBy: actorName,
      };

      logAction(
        actorName,
        'SUPER_ADMIN',
        'ONBOARDING_STEP_COMPLETED',
        'OnboardingStep',
        stepId,
        'ACTION',
        `Completed organization onboarding step #${s.stepNumber}: ${s.title}.`
      );

      return completed;
    }
    return s;
  });

  saveStoreOnboardingProgress(updated);
  return updated;
};
