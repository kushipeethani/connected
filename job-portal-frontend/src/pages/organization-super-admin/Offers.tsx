import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Gift, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  ShieldCheck, 
  Filter, 
  FileText, 
  History, 
  X, 
  UserCheck, 
  Check, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { Offer, OfferStatus } from '../../types/clyptus.types';
import { INITIAL_OFFERS, getStoreOffers, logAction } from '../../store/clyptus.store';

interface ContextType {
  showToast: (msg: string) => void;
}

const ALL_OFFER_STATUSES: OfferStatus[] = [
  'DRAFT', 
  'PENDING_APPROVAL', 
  'SENT', 
  'ACCEPTED', 
  'REJECTED', 
  'EXPIRED', 
  'WITHDRAWN'
];

export const OrgSuperAdminOffers: React.FC = () => {
  const { showToast } = useOutletContext<ContextType>();
  const [offers, setOffers] = useState<Offer[]>(() => getStoreOffers());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [auditModalOffer, setAuditModalOffer] = useState<Offer | null>(null);

  // Form State
  const [createForm, setCreateForm] = useState({
    candidateName: '',
    candidateEmail: '',
    role: 'Senior Python & FastAPI Engineer',
    annualCTC: '₹12,00,000 INR',
    joiningDate: '2026-11-15',
    createdBy: 'Sarah Jenkins (Super Admin)',
    status: 'PENDING_APPROVAL' as OfferStatus
  });

  const fetchOffers = () => {
    setOffers(getStoreOffers());
  };

  const saveOffers = (updated: Offer[]) => {
    setOffers(updated);
    try {
      localStorage.setItem('clyptus_offers', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('clyptus_store_updated', { detail: { type: 'OFFERS' } }));
    } catch (e) {}
  };

  useEffect(() => {
    fetchOffers();
    const handleSync = () => fetchOffers();
    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleStatusTransition = async (id: string, newStatus: OfferStatus, note?: string) => {
    const targetOffer = offers.find(o => o.id === id);
    const candidateName = targetOffer?.candidateName || id;

    try {
      await fetch(`http://localhost:5000/api/v1/offers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actorName: 'Super Admin',
          note: note || `Status transitioned to ${newStatus}`
        })
      });
    } catch (err) {}

    const updated = offers.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
    saveOffers(updated);

    logAction(
      'Sarah Jenkins (Super Admin)',
      'SUPER_ADMIN',
      'OFFER_STATUS_UPDATED',
      'OfferLetter',
      id,
      'OFFER',
      `Updated offer status for ${candidateName} (${id}) to ${newStatus}.`
    );

    showToast(`Updated offer status to ${newStatus}`);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    const newOfferPayload = {
      candidateName: createForm.candidateName,
      candidateEmail: createForm.candidateEmail,
      role: createForm.role,
      annualCTC: createForm.annualCTC,
      joiningDate: createForm.joiningDate,
      createdBy: createForm.createdBy || 'Sarah Jenkins (Super Admin)',
      status: createForm.status
    };

    try {
      await fetch('http://localhost:5000/api/v1/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOfferPayload)
      });
    } catch (err) {}

    const newOffer: Offer = {
      id: `off_${Date.now()}`,
      organizationId: 'org_abc_tech',
      jobId: 'job_201',
      jobTitle: createForm.role,
      candidateId: `cand_${Date.now()}`,
      candidateName: createForm.candidateName,
      candidateEmail: createForm.candidateEmail,
      role: createForm.role,
      annualCTC: createForm.annualCTC,
      joiningDate: createForm.joiningDate,
      status: createForm.status,
      createdBy: createForm.createdBy || 'Sarah Jenkins (Super Admin)',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newOffer, ...offers];
    saveOffers(updated);

    logAction(
      'Sarah Jenkins (Super Admin)',
      'SUPER_ADMIN',
      'OFFER_CREATED',
      'OfferLetter',
      newOffer.id,
      'OFFER',
      `Created new offer for candidate ${createForm.candidateName} (${createForm.candidateEmail}) as ${createForm.role} with CTC ${createForm.annualCTC}.`
    );

    setIsCreateModalOpen(false);
    showToast(`Created offer letter for ${createForm.candidateName}!`);
  };

  // Filtered offers list
  const filteredOffers = offers.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.candidateName.toLowerCase().includes(q) ||
        o.candidateEmail.toLowerCase().includes(q) ||
        o.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Counters
  const totalCount = offers.length;
  const pendingCount = offers.filter((o) => o.status === 'PENDING_APPROVAL' || o.status === 'DRAFT').length;
  const acceptedCount = offers.filter((o) => o.status === 'ACCEPTED').length;
  const rejectedCount = offers.filter((o) => o.status === 'REJECTED' || o.status === 'WITHDRAWN').length;
  const expiredCount = offers.filter((o) => o.status === 'EXPIRED').length;

  const getStatusBadge = (st: OfferStatus) => {
    switch (st) {
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">Pending Approval</span>;
      case 'SENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">Offer Sent</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">Accepted</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">Expired</span>;
      case 'WITHDRAWN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">Withdrawn</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Offer Management & Oversight</h2>
          <p className="text-xs text-slate-500">
            Oversee offers across recruitment teams, review recruiter submissions, track accepted, rejected, and expired states.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center gap-1.5 w-fit"
        >
          <PlusCircle className="w-4 h-4" /> Create Offer (Admin)
        </button>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Offers</span>
          <div className="text-2xl font-extrabold text-slate-900">{totalCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Review</span>
          <div className="text-2xl font-extrabold text-amber-800">{pendingCount}</div>
        </div>
        <div 
          onClick={() => setStatusFilter('ACCEPTED')}
          className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-1 cursor-pointer hover:border-emerald-400 transition-all"
        >
          <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center justify-between">
            Accepted Offers <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">{acceptedCount}</div>
        </div>
        <div 
          onClick={() => setStatusFilter('REJECTED')}
          className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs space-y-1 cursor-pointer hover:border-red-400 transition-all"
        >
          <span className="text-[10px] font-bold text-red-700 uppercase flex items-center justify-between">
            Rejected Offers <XCircle className="w-3.5 h-3.5 text-red-600" />
          </span>
          <div className="text-2xl font-extrabold text-red-600">{rejectedCount}</div>
        </div>
        <div 
          onClick={() => setStatusFilter('EXPIRED')}
          className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs space-y-1 cursor-pointer hover:border-rose-400 transition-all"
        >
          <span className="text-[10px] font-bold text-rose-700 uppercase flex items-center justify-between">
            Expired Offers <Clock className="w-3.5 h-3.5 text-rose-600" />
          </span>
          <div className="text-2xl font-extrabold text-rose-600">{expiredCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ALL ({offers.length})
          </button>
          {ALL_OFFER_STATUSES.map((st) => {
            const count = offers.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all border ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.replace(/_/g, ' ')} ({count})
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Filter candidate or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-blue-500 focus:outline-none w-full sm:w-56"
        />
      </div>

      {/* Offers List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Active Candidate Offers ({filteredOffers.length})</h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Server-Side Workflow Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Candidate Details</th>
                <th className="p-4">Offered Role</th>
                <th className="p-4">Annual CTC</th>
                <th className="p-4">Target Joining</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-900 text-xs">{offer.candidateName}</div>
                    <div className="text-[10px] text-slate-400">{offer.candidateEmail}</div>
                  </td>

                  <td className="p-4 font-bold text-slate-800">{offer.role || offer.jobTitle}</td>

                  <td className="p-4 font-extrabold text-brand-blue-600">{offer.annualCTC}</td>

                  <td className="p-4 text-slate-700 font-medium">{offer.joiningDate}</td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(offer.createdBy)}&background=4F46E5&color=fff`}
                        alt={offer.createdBy}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-800 text-[11px]">{offer.createdBy}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    {getStatusBadge(offer.status)}
                  </td>

                  <td className="p-4 text-right pr-6 space-x-2">
                    {/* Approve & Send Workflow Buttons */}
                    {(offer.status === 'PENDING_APPROVAL' || offer.status === 'DRAFT') && (
                      <button
                        onClick={() => handleStatusTransition(offer.id, 'SENT', 'Approved and dispatched by Super Admin')}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-300 inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Approve & Send
                      </button>
                    )}

                    {offer.status === 'SENT' && (
                      <>
                        <button
                          onClick={() => handleStatusTransition(offer.id, 'ACCEPTED', 'Candidate confirmed acceptance')}
                          className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                        >
                          Mark Accepted
                        </button>

                        <button
                          onClick={() => handleStatusTransition(offer.id, 'REJECTED', 'Candidate declined offer')}
                          className="px-2 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                        >
                          Mark Rejected
                        </button>
                      </>
                    )}

                    <select
                      value={offer.status}
                      onChange={(e) => handleStatusTransition(offer.id, e.target.value as OfferStatus)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      {ALL_OFFER_STATUSES.map((st) => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setAuditModalOffer(offer)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 inline-flex items-center"
                      title="View Offer History & Audit Logs"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOffers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-medium">
                    No candidate offers found matching selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Offer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-brand-blue-400" />
                <h3 className="font-bold text-base">Create & Issue Candidate Offer</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Sen"
                  value={createForm.candidateName}
                  onChange={(e) => setCreateForm({ ...createForm, candidateName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram.sen@devmail.com"
                  value={createForm.candidateEmail}
                  onChange={(e) => setCreateForm({ ...createForm, candidateEmail: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Offered Role / Title</label>
                  <input
                    type="text"
                    required
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual CTC</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹12,00,000 INR"
                    value={createForm.annualCTC}
                    onChange={(e) => setCreateForm({ ...createForm, annualCTC: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Joining Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.joiningDate}
                    onChange={(e) => setCreateForm({ ...createForm, joiningDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Created By</label>
                  <select
                    value={createForm.createdBy}
                    onChange={(e) => setCreateForm({ ...createForm, createdBy: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Kushi">Kushi</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as OfferStatus })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none bg-white font-bold"
                >
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL (Requires Approval)</option>
                  <option value="DRAFT">DRAFT (Draft Mode)</option>
                  <option value="SENT">SENT (Direct Send)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 rounded-xl shadow-sm"
                >
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Audit History Drawer / Modal */}
      {auditModalOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Offer Audit Log & History</h3>
                  <p className="text-xs text-slate-500">{auditModalOffer.candidateName} • {auditModalOffer.role}</p>
                </div>
              </div>
              <button onClick={() => setAuditModalOffer(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {auditModalOffer.history && auditModalOffer.history.length > 0 ? (
                auditModalOffer.history.map((h: any, idx: number) => (
                  <div key={h.id || idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-indigo-700">{h.action}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{h.timestamp ? new Date(h.timestamp).toLocaleString() : 'Just now'}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Actor: <strong>{h.actor}</strong>
                    </div>
                    {h.note && <p className="text-[10px] text-slate-500 italic">"{h.note}"</p>}
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between font-bold text-indigo-700">
                      <span>OFFER_CREATED</span>
                      <span className="text-[10px] text-slate-400">{auditModalOffer.createdAt}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Actor: <strong>{auditModalOffer.createdBy}</strong></div>
                    <p className="text-[10px] text-slate-500 italic">Offer created in initial state {auditModalOffer.status}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAuditModalOffer(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
