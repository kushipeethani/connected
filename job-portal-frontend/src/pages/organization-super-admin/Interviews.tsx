import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  UserCheck, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter, 
  Edit3, 
  Trash2, 
  Star, 
  X, 
  Users, 
  Briefcase,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Interview, InterviewStatus } from '../../types/clyptus.types';
import { INITIAL_INTERVIEWS, INITIAL_JOBS, getStoreInterviews, logAction } from '../../store/clyptus.store';

interface ContextType {
  showToast: (msg: string) => void;
}

export const OrgSuperAdminInterviews: React.FC = () => {
  const { showToast } = useOutletContext<ContextType>();
  const [interviews, setInterviews] = useState<Interview[]>(() => getStoreInterviews());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [recruiterFilter, setRecruiterFilter] = useState<string>('ALL');

  const saveInterviews = (updated: Interview[]) => {
    setInterviews(updated);
    try {
      localStorage.setItem('clyptus_interviews', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'INTERVIEWS' } }));
    } catch (e) {}
  };

  useEffect(() => {
    const handleSync = () => setInterviews(getStoreInterviews());
    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [rescheduleInterview, setRescheduleInterview] = useState<Interview | null>(null);
  const [assignModalInterview, setAssignModalInterview] = useState<Interview | null>(null);
  const [feedbackModalInterview, setFeedbackModalInterview] = useState<Interview | null>(null);

  // Schedule New Interview Form State
  const [scheduleForm, setScheduleForm] = useState({
    candidateName: '',
    jobTitle: 'Senior Python & FastAPI Engineer',
    recruiterName: 'Elena Rostova',
    interviewerName: 'Marcus Vance',
    interviewerRole: 'Lead Architect',
    interviewType: 'TECHNICAL_ROUND_1' as const,
    date: '2026-10-02',
    time: '03:00 PM IST',
    meetingLink: 'https://meet.clyptus.io/int-new',
    notes: 'Focus on system design & API scale',
  });

  // Reschedule Form State
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: '',
    meetingLink: '',
    notes: ''
  });

  // Assign Interviewer Form State
  const [assignForm, setAssignForm] = useState({
    interviewerName: '',
    interviewerRole: 'Senior Engineering Leader'
  });

  // Filtered List
  const filteredInterviews = interviews.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (recruiterFilter !== 'ALL' && item.recruiterName !== recruiterFilter) return false;
    return true;
  });

  // Stats Counters
  const totalCount = interviews.length;
  const upcomingCount = interviews.filter((i) => i.status === 'SCHEDULED' || i.status === 'CONFIRMED' || i.status === 'RESCHEDULED').length;
  const pendingFeedbackCount = interviews.filter((i) => i.status === 'PENDING_FEEDBACK').length;
  const completedCount = interviews.filter((i) => i.status === 'COMPLETED').length;
  const cancelledCount = interviews.filter((i) => i.status === 'CANCELLED').length;

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInt: Interview = {
      id: `int_${Date.now()}`,
      organizationId: 'org_abc_tech',
      jobId: 'job_201',
      jobTitle: scheduleForm.jobTitle,
      candidateId: `cand_${Date.now()}`,
      candidateName: scheduleForm.candidateName,
      recruiterId: 'rec_1',
      recruiterName: scheduleForm.recruiterName,
      interviewerName: scheduleForm.interviewerName,
      interviewerRole: scheduleForm.interviewerRole,
      interviewType: scheduleForm.interviewType,
      date: scheduleForm.date,
      time: scheduleForm.time,
      meetingLink: scheduleForm.meetingLink,
      notes: scheduleForm.notes,
      status: 'SCHEDULED'
    };

    const updated = [newInt, ...interviews];
    saveInterviews(updated);

    logAction(
      'Sarah Jenkins (Super Admin)',
      'SUPER_ADMIN',
      'INTERVIEW_SCHEDULED',
      'InterviewSlot',
      newInt.id,
      'INTERVIEW',
      `Scheduled ${scheduleForm.interviewType} interview for candidate ${scheduleForm.candidateName} on ${scheduleForm.date} at ${scheduleForm.time}.`
    );

    setIsScheduleModalOpen(false);
    showToast(`Scheduled interview for ${scheduleForm.candidateName}!`);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleInterview) return;

    const updated = interviews.map((i) =>
      i.id === rescheduleInterview.id
        ? {
            ...i,
            date: rescheduleForm.date,
            time: rescheduleForm.time,
            meetingLink: rescheduleForm.meetingLink || i.meetingLink,
            notes: rescheduleForm.notes || i.notes,
            status: 'RESCHEDULED' as InterviewStatus
          }
        : i
    );
    saveInterviews(updated);

    logAction(
      'Sarah Jenkins (Super Admin)',
      'SUPER_ADMIN',
      'INTERVIEW_RESCHEDULED',
      'InterviewSlot',
      rescheduleInterview.id,
      'INTERVIEW',
      `Rescheduled interview for candidate ${rescheduleInterview.candidateName} to ${rescheduleForm.date} at ${rescheduleForm.time}.`
    );

    showToast(`Rescheduled interview for ${rescheduleInterview.candidateName}!`);
    setRescheduleInterview(null);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalInterview) return;

    const updated = interviews.map((i) =>
      i.id === assignModalInterview.id
        ? {
            ...i,
            interviewerName: assignForm.interviewerName,
            interviewerRole: assignForm.interviewerRole
          }
        : i
    );
    saveInterviews(updated);

    logAction(
      'Sarah Jenkins (Super Admin)',
      'SUPER_ADMIN',
      'INTERVIEWER_ASSIGNED',
      'InterviewSlot',
      assignModalInterview.id,
      'INTERVIEW',
      `Assigned interviewer ${assignForm.interviewerName} (${assignForm.interviewerRole}) to candidate ${assignModalInterview.candidateName}.`
    );

    showToast(`Assigned interviewer ${assignForm.interviewerName} to ${assignModalInterview.candidateName}!`);
    setAssignModalInterview(null);
  };

  const handleCancelInterview = (id: string, name: string) => {
    if (confirm(`Are you sure you want to cancel the interview for candidate "${name}"?`)) {
      const updated = interviews.map((i) => (i.id === id ? { ...i, status: 'CANCELLED' as InterviewStatus } : i));
      saveInterviews(updated);

      logAction(
        'Sarah Jenkins (Super Admin)',
        'SUPER_ADMIN',
        'INTERVIEW_CANCELLED',
        'InterviewSlot',
        id,
        'INTERVIEW',
        `Cancelled interview for candidate ${name} (${id}).`
      );

      showToast(`Cancelled interview for ${name}.`);
    }
  };

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">Scheduled</span>;
      case 'RESCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">Rescheduled</span>;
      case 'PENDING_FEEDBACK':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">Pending Feedback</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Organization Interviews Oversight</h2>
          <p className="text-xs text-slate-500">
            Monitor upcoming, completed, cancelled, and pending-feedback interviews across recruiters and jobs.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center gap-1.5 w-fit"
        >
          <PlusCircle className="w-4 h-4" /> Schedule New Interview
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Scheduled</span>
          <div className="text-2xl font-extrabold text-slate-900">{totalCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-blue-700 uppercase">Upcoming</span>
          <div className="text-2xl font-extrabold text-brand-blue-700">{upcomingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Feedback</span>
          <div className="text-2xl font-extrabold text-amber-800">{pendingFeedbackCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-700">{completedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-red-700 uppercase">Cancelled</span>
          <div className="text-2xl font-extrabold text-red-600">{cancelledCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'SCHEDULED', 'PENDING_FEEDBACK', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
                statusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={recruiterFilter}
            onChange={(e) => setRecruiterFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Recruiters</option>
            <option value="Elena Rostova">Elena Rostova</option>
            <option value="Kushi">Kushi</option>
            <option value="David Chen">David Chen</option>
          </select>
        </div>
      </div>

      {/* Interview Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredInterviews.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-2.5"
          >
            <div className="space-y-2">
              {/* Header Badge Row */}
              <div className="flex items-center justify-between gap-1.5">
                {getStatusBadge(item.status)}
                <span className="text-[10px] font-bold text-slate-500 truncate">
                  Round: <strong className="text-slate-800">{item.interviewType.replace(/_/g, ' ')}</strong>
                </span>
              </div>

              {/* Candidate & Job Info */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm truncate">{item.candidateName}</h3>
                  <p className="text-[11px] font-semibold text-brand-blue-600 truncate mt-0.5">{item.jobTitle}</p>
                </div>

                <div className="text-right text-[10px] text-slate-500 shrink-0">
                  <span className="block font-semibold text-slate-700">Recruiter: {item.recruiterName}</span>
                </div>
              </div>

              {/* Assigned Interviewer Card */}
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400">Assigned Interviewer</span>
                  <button
                    onClick={() => {
                      setAssignModalInterview(item);
                      setAssignForm({
                        interviewerName: item.interviewerName || 'Marcus Vance',
                        interviewerRole: item.interviewerRole || 'Senior Engineering Leader'
                      });
                    }}
                    className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    <UserCheck className="w-2.5 h-2.5" /> Reassign
                  </button>
                </div>

                <div className="font-bold text-slate-800 truncate">
                  {item.interviewerName ? `${item.interviewerName} (${item.interviewerRole || 'Interviewer'})` : 'Unassigned'}
                </div>
              </div>

              {/* Date, Time & Meeting Link */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-indigo-50/40 p-2 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-1 min-w-0">
                  <Calendar className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-900 truncate">{item.date}</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-900 truncate">{item.time}</span>
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-1">
                  "{item.notes}"
                </p>
              )}

              {/* Feedback Summary Section */}
              {item.feedbackNotes && (
                <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-0.5 text-[11px]">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span className="flex items-center gap-1 text-[10px]">
                      <MessageSquare className="w-3 h-3 text-emerald-600" /> Feedback
                    </span>
                    {item.feedbackRating && (
                      <span className="flex items-center gap-0.5 text-amber-600 font-extrabold text-[10px]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.feedbackRating}/5
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-700 line-clamp-1">{item.feedbackNotes}</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 text-[11px]">
              <a
                href={item.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1 text-[10px]"
              >
                <Video className="w-3 h-3" /> Join <ExternalLink className="w-2.5 h-2.5" />
              </a>

              <div className="flex items-center gap-1">
                {item.feedbackNotes && (
                  <button
                    onClick={() => setFeedbackModalInterview(item)}
                    className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 text-[10px]"
                  >
                    Feedback
                  </button>
                )}

                <button
                  onClick={() => {
                    setRescheduleInterview(item);
                    setRescheduleForm({
                      date: item.date,
                      time: item.time,
                      meetingLink: item.meetingLink,
                      notes: item.notes
                    });
                  }}
                  className="px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 border border-slate-200 flex items-center gap-1 text-[10px]"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" /> Reschedule
                </button>

                {item.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancelInterview(item.id, item.candidateName)}
                    className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                    title="Cancel Interview"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}

        {filteredInterviews.length === 0 && (
          <div className="col-span-full p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No interviews match selected filters</h4>
            <p className="text-xs text-slate-400">Try changing the status filter or recruiter dropdown.</p>
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-blue-400" />
                <h3 className="font-bold text-base">Schedule New Interview</h3>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Sen"
                  value={scheduleForm.candidateName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, candidateName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.jobTitle}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Recruiter</label>
                  <select
                    value={scheduleForm.recruiterName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, recruiterName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Kushi">Kushi</option>
                    <option value="David Chen">David Chen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={scheduleForm.interviewerName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interviewer Role</label>
                  <input
                    type="text"
                    value={scheduleForm.interviewerRole}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerRole: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 03:00 PM IST"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Meeting Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.clyptus.io/..."
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 rounded-xl shadow-sm"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reschedule Interview for {rescheduleInterview.candidateName}</h3>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time Slot</label>
                <input
                  type="text"
                  required
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={rescheduleForm.meetingLink}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, meetingLink: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleInterview(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 rounded-xl shadow-xs"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Interviewer Modal */}
      {assignModalInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Assign / Reassign Interviewer</h3>
            <p className="text-xs text-slate-500">Candidate: {assignModalInterview.candidateName} • Job: {assignModalInterview.jobTitle}</p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interviewer Name</label>
                <input
                  type="text"
                  required
                  value={assignForm.interviewerName}
                  onChange={(e) => setAssignForm({ ...assignForm, interviewerName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interviewer Designation / Role</label>
                <input
                  type="text"
                  required
                  value={assignForm.interviewerRole}
                  onChange={(e) => setAssignForm({ ...assignForm, interviewerRole: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalInterview(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Assign Interviewer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {feedbackModalInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Interviewer Feedback & Rating</h3>
              <button onClick={() => setFeedbackModalInterview(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                <span>Interviewer: {feedbackModalInterview.interviewerName}</span>
                <span className="flex items-center gap-1 text-amber-600 font-extrabold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {feedbackModalInterview.feedbackRating || 4.5} / 5.0
                </span>
              </div>
              <p className="text-xs text-slate-800">{feedbackModalInterview.feedbackNotes}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setFeedbackModalInterview(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
