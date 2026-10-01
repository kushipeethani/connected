import { User } from './user.types';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  tokenWallet?: {
    balance: number;
  };
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  recruiterType?: string;
  status: string;
  user: User;
  tokenAllocation?: {
    allocated: number;
    used: number;
    remaining: number;
  };
}

export type OrgRole = 
  | 'ORG_SUPER_ADMIN' 
  | 'ORG_ADMIN' 
  | 'HR_RECRUITER' 
  | 'HIRING_MANAGER' 
  | 'TECH_RECRUITER';

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: OrgRole;
  title: string;
  allocatedTokens: number;
  usedTokens: number;
  activeJobsCount: number;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  status: 'PUBLISHED' | 'DRAFT' | 'PAUSED' | 'CLOSED';
  tokensCost: number;
  recruiterId: string;
  recruiterName: string;
  applicantsCount: number;
  shortlistedCount: number;
  createdAt: string;
  description: string;
  skillsRequired: string[];
}

export type ApplicationStage = 
  | 'APPLIED' 
  | 'SCREENING' 
  | 'SHORTLISTED' 
  | 'INTERVIEW_SCHEDULED' 
  | 'OFFER_EXTENDED' 
  | 'HIRED' 
  | 'REJECTED';

export interface CandidateApplication {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  avatar: string;
  jobId: string;
  jobTitle: string;
  matchScore: number;
  appliedDate: string;
  stage: ApplicationStage;
  resumeUrl: string;
  aiSummary: string;
  skills: string[];
  experienceYears: number;
  expectedSalary: string;
  recruiterNotes?: string;
  interviewDate?: string;
}

export interface TokenTransaction {
  id: string;
  type: 'PURCHASE' | 'ALLOCATION' | 'CONSUMPTION_JOB_POST' | 'CONSUMPTION_RESUME_PARSER' | 'REFUND';
  amount: number;
  allocatedTo?: string;
  performedBy: string;
  description: string;
  timestamp: string;
}

export interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  priceUSD: number;
  popular?: boolean;
  features: string[];
}

export interface OrganisationProfile {
  id: string;
  name: string;
  logo: string;
  domain: string;
  industry: string;
  size: string;
  totalTokensBalance: number;
  allocatedTokensTotal: number;
  usedTokensTotal: number;
  subscriptionPlan: 'PRO_ENTERPRISE' | 'GROWTH' | 'STARTER';
}
