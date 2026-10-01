export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export type AdminPermission = 
  | 'RECRUITER_MANAGEMENT' 
  | 'JOB_MANAGEMENT' 
  | 'CANDIDATE_MANAGEMENT' 
  | 'APPLICATION_MANAGEMENT' 
  | 'REPORTS' 
  | 'USER_MANAGEMENT';

export interface RolePermissionRow {
  id: string;
  label: string;
  superAdmin: boolean;
  admin: boolean;
  recruiter: boolean;
  disabled?: boolean;
  adminOnlyNote?: string;
}

export interface AdminUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
  department?: string;
  avatar: string;
  status: UserStatus;
  permissions: AdminPermission[];
  createdAt: string;
}

export interface RecruiterUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  recruiterRole?: string;
  avatar: string;
  status: UserStatus;
  isAdmin?: boolean;
  activeJobsCount: number;
  profileViewsCount: number;
  resumeDownloadsCount: number;
  totalCreditsUsed: number;
  allocatedCredits?: number;
  remainingBalance?: number;
  assignedJobs?: Array<{ id: string; title: string; department: string; status: string }>;
  createdAt: string;
}

export interface OrganizationCreditAccount {
  organizationId: string;
  organizationName: string;
  balance: number;
  totalAllocated: number;
  totalConsumed: number;
}

export interface CreditTransaction {
  id: string;
  organizationId: string;
  recruiterId: string;
  recruiterName: string;
  action: 'CREDIT_ALLOCATION' | 'CREDIT_RECLAIM' | 'PROFILE_VIEW' | 'RESUME_DOWNLOAD' | 'JOB_POSTING' | 'AI_PARSER';
  credits: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: 'CANDIDATE' | 'RESUME' | 'JOB' | 'ADMIN';
  referenceId?: string;
  timestamp: string;
}

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'WORK_FROM_OFFICE';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';

export interface Job {
  id: string;
  organizationId: string;
  recruiterId: string;
  recruiterName: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  salary: string;
  workMode: WorkMode;
  jobType: JobType;
  status: JobStatus;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  openings: number;
  deadline: string;
  createdAt: string;
  applicationsCount: number;
  shortlistedCount: number;
}

export type ApplicationStatus = 
  | 'APPLIED' 
  | 'APPLICATION_VIEWED' 
  | 'SHORTLISTED' 
  | 'RECRUITER_CONTACTED' 
  | 'INTERVIEW_SCHEDULED' 
  | 'OFFER_EXTENDED'
  | 'SELECTED' 
  | 'REJECTED';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experienceYears: number;
  skills: string[];
  education: string;
  expectedSalary: string;
  avatar: string;
  resumeUrl: string;
  profileUnlockedByRecruiters: string[];
  resumeDownloadedByRecruiters: string[];
}

export interface Application {
  id: string;
  organizationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  appliedDate: string;
  status: ApplicationStatus;
  matchScore: number;
  coverLetter?: string;
}

export type InterviewStatus = 'SCHEDULED' | 'CONFIRMED' | 'RESCHEDULED' | 'PENDING_FEEDBACK' | 'COMPLETED' | 'CANCELLED';

export interface Interview {
  id: string;
  organizationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  recruiterId: string;
  recruiterName: string;
  interviewerName?: string;
  interviewerRole?: string;
  interviewType: 'TECHNICAL_ROUND_1' | 'SYSTEM_DESIGN' | 'HR_CULTURE_FIT' | 'FINAL_ROUND';
  date: string;
  time: string;
  meetingLink: string;
  notes: string;
  feedbackNotes?: string;
  feedbackRating?: number;
  feedbackStatus?: 'PENDING' | 'SUBMITTED' | 'APPROVED';
  status: InterviewStatus;
}

export type OfferStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN';

export interface Offer {
  id: string;
  organizationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  annualCTC: string;
  joiningDate: string;
  status: OfferStatus;
  createdBy: string;
  createdAt: string;
  history?: { id?: string; action?: string; actor?: string; timestamp?: string; note?: string }[];
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export interface Invitation {
  id: string;
  organizationId: string;
  name?: string;
  email: string;
  role: 'ORG_ADMIN' | 'RECRUITER';
  invitedBy: string;
  status: InvitationStatus;
  sentAt: string;
  expiresAt: string;
  expirationDays?: number;
}

export interface OnboardingStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  category: 'PROFILE' | 'FINANCE' | 'PEOPLE' | 'SECURITY' | 'VERIFICATION';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  completedAt?: string;
  completedBy?: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  resource: string;
  resourceId: string;
  dimension?: 'USER' | 'ROLE' | 'ACTION' | 'RESOURCE' | 'JOB' | 'CANDIDATE' | 'APPLICATION' | 'PAYMENT' | 'TOKEN' | 'SECURITY' | 'ATS' | 'OFFER' | 'INTERVIEW' | 'PERMISSION' | 'PRIVILEGED';
  details?: string;
  timestamp: string;
  ip: string;
}

export interface ShortlistedCandidate {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  title: string;
  recruiterId: string;
  recruiterName: string;
  shortlistedAt: string;
  location?: string;
  experience?: string;
  skills?: string[];
}
