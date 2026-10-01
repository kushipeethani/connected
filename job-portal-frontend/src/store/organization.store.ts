import { create } from 'zustand';
import { 
  Organization, 
  OrgUser, 
  JobPosting, 
  CandidateApplication, 
  TokenTransaction, 
  OrganisationProfile 
} from '../types/organization.types';

interface OrganizationStore {
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
}

export const useOrganizationStore = create<OrganizationStore>((set) => ({
  currentOrg: null,
  setCurrentOrg: (currentOrg) => set({ currentOrg }),
}));

// Mock Organisation Info
export const MOCK_ORG: OrganisationProfile = {
  id: 'org_acme_corp',
  name: 'ABC Recruitment Pvt Ltd',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
  domain: 'abctech.io',
  industry: 'Enterprise Technology',
  size: '100 - 250 Employees',
  totalTokensBalance: 1000,
  allocatedTokensTotal: 0,
  usedTokensTotal: 0,
  subscriptionPlan: 'PRO_ENTERPRISE',
};

export const INITIAL_MEMBERS: OrgUser[] = [];
export const INITIAL_JOBS: JobPosting[] = [];
export const INITIAL_CANDIDATES: CandidateApplication[] = [
  {
    id: 'cand_101',
    candidateName: 'Aarav Sharma',
    candidateEmail: 'aarav.sharma@example.com',
    candidatePhone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    jobId: '',
    jobTitle: 'Senior Python & FastAPI Engineer',
    matchScore: 95,
    appliedDate: '2026-09-29',
    stage: 'APPLIED',
    resumeUrl: 'https://clyptus-resumes-s3.bucket/aarav_sharma_resume.pdf',
    aiSummary: 'High proficiency in FastAPI, PostgreSQL, Docker, and Python microservices architecture.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis'],
    experienceYears: 4,
    expectedSalary: '₹12 LPA',
  },
  {
    id: 'cand_102',
    candidateName: 'Ananya Patel',
    candidateEmail: 'ananya.patel@example.com',
    candidatePhone: '+91 98123 55441',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    jobId: '',
    jobTitle: 'Full Stack React & Node.js Specialist',
    matchScore: 91,
    appliedDate: '2026-09-29',
    stage: 'APPLIED',
    resumeUrl: 'https://clyptus-resumes-s3.bucket/ananya_patel_resume.pdf',
    aiSummary: 'Expert in React 18, TypeScript, Vite, Node.js REST APIs, and modern UI design.',
    skills: ['React', 'TypeScript', 'Vite', 'Node.js', 'Tailwind CSS'],
    experienceYears: 3,
    expectedSalary: '₹10 LPA',
  },
  {
    id: 'cand_103',
    candidateName: 'Vikramaditya Rao',
    candidateEmail: 'vikram.rao@example.com',
    candidatePhone: '+91 97788 66554',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    jobId: '',
    jobTitle: 'Backend Python & Cloud Engineer',
    matchScore: 89,
    appliedDate: '2026-09-29',
    stage: 'APPLIED',
    resumeUrl: 'https://clyptus-resumes-s3.bucket/vikram_rao_resume.pdf',
    aiSummary: '5+ years building scalable cloud backends, AWS ECS deployment pipelines, and DB tuning.',
    skills: ['Python', 'Django', 'FastAPI', 'AWS', 'PostgreSQL', 'Redis'],
    experienceYears: 5,
    expectedSalary: '₹18 LPA',
  }
];
export const INITIAL_TRANSACTIONS: TokenTransaction[] = [];
