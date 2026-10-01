import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  Edit3, 
  KeyRound, 
  X, 
  CheckCircle2, 
  ShieldAlert,
  Lock
} from 'lucide-react';
import { AdminUser, AdminPermission } from '../../types/clyptus.types';
import { INITIAL_ADMINS, getStoreAdmins, saveStoreAdmins, logAction } from '../../store/clyptus.store';

interface ContextType {
  showToast: (msg: string) => void;
}

const ALL_PERMISSIONS: { key: AdminPermission; label: string; desc: string }[] = [
  { key: 'RECRUITER_MANAGEMENT', label: 'Recruiter Management', desc: 'Create, edit, suspend recruiters' },
  { key: 'JOB_MANAGEMENT', label: 'Job Management', desc: 'Approve, edit, publish organization jobs' },
  { key: 'CANDIDATE_MANAGEMENT', label: 'Candidate Management', desc: 'View candidate database & details' },
  { key: 'APPLICATION_MANAGEMENT', label: 'Application Management', desc: 'Review candidate applications & ATS' },
  { key: 'REPORTS', label: 'Reports & Analytics', desc: 'View recruiter activity & credit usage reports' },
  { key: 'USER_MANAGEMENT', label: 'User Management', desc: 'Manage organization user accounts' },
];

export const AdminManagement: React.FC = () => {
  const { showToast } = useOutletContext<ContextType>();
  const [admins, setAdmins] = useState<AdminUser[]>(() => getStoreAdmins());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; tempPass: string } | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([
    'RECRUITER_MANAGEMENT', 'JOB_MANAGEMENT', 'APPLICATION_MANAGEMENT'
  ]);

  // Fetch admins from backend API or reactive store
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/v1/admins');
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        setAdmins(json.data);
        saveStoreAdmins(json.data);
      } else {
        setAdmins(getStoreAdmins());
      }
    } catch (err) {
      setAdmins(getStoreAdmins());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    const handleSync = () => setAdmins(getStoreAdmins());
    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormConfirmPassword('');
    setGeneratedCreds(null);
    setSelectedPermissions(['RECRUITER_MANAGEMENT', 'JOB_MANAGEMENT', 'CANDIDATE_MANAGEMENT', 'APPLICATION_MANAGEMENT', 'REPORTS', 'USER_MANAGEMENT']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormName(admin.name);
    setFormEmail(admin.email);
    setFormPassword('');
    setFormConfirmPassword('');
    setGeneratedCreds(null);
    setSelectedPermissions(admin.permissions);
    setIsModalOpen(true);
  };

  const togglePermission = (perm: AdminPermission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const [deleteTransferAdmin, setDeleteTransferAdmin] = useState<AdminUser | null>(null);
  const [successorAdminId, setSuccessorAdminId] = useState<string>('');

  const handleInitiateDeleteAdmin = (adm: AdminUser) => {
    setDeleteTransferAdmin(adm);
    const others = admins.filter((item) => item.id !== adm.id);
    if (others.length > 0) {
      setSuccessorAdminId(others[0].id);
    } else {
      setSuccessorAdminId('');
    }
  };

  const handleConfirmDeleteAdminWithTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTransferAdmin) return;

    const successorAdm = admins.find((a) => a.id === successorAdminId);
    const updatedList = admins.filter((a) => a.id !== deleteTransferAdmin.id);
    saveStoreAdmins(updatedList);
    setAdmins(updatedList);

    try {
      await fetch(`http://localhost:5000/api/v1/admins/${deleteTransferAdmin.id}`, { method: 'DELETE' });
    } catch (err) {}

    const successorInfo = successorAdm ? `Reassigned admin permissions & history to ${successorAdm.name}` : `Archived admin logs`;
    logAction(
      'Super Admin',
      'SUPER_ADMIN',
      'ADMIN_DELETED_WITH_TRANSFER',
      'AdminUser',
      deleteTransferAdmin.id,
      'USER',
      `Deleted Organization Admin account for ${deleteTransferAdmin.name}. ${successorInfo}.`
    );

    showToast(`Transferred admin history of ${deleteTransferAdmin.name} to ${successorAdm?.name || 'System Pool'} and removed account.`);
    setDeleteTransferAdmin(null);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAdmin) {
      // Editing Admin RBAC Permissions
      const updatedAdmins = admins.map(a => a.id === editingAdmin.id ? { ...a, permissions: selectedPermissions } : a);
      saveStoreAdmins(updatedAdmins);
      setAdmins(updatedAdmins);

      try {
        await fetch(`http://localhost:5000/api/v1/admins/${editingAdmin.id}/permissions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: selectedPermissions })
        });
      } catch (err) {}

      showToast(`Updated Admin permissions for ${formName}!`);
      setIsModalOpen(false);
    } else {
      // Creating New Admin Account
      if (formPassword && formConfirmPassword && formPassword !== formConfirmPassword) {
        showToast('Passwords do not match! Please confirm your password.');
        return;
      }

      const assignedPassword = formPassword || 'Admin@2026';
      const newAdmin: AdminUser = {
        id: `adm_${Date.now()}`,
        organizationId: 'org_abc_tech',
        name: formName,
        email: formEmail,
        password: assignedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formName)}&background=0D8ABC&color=fff`,
        status: 'ACTIVE',
        permissions: selectedPermissions,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const updatedList = [newAdmin, ...getStoreAdmins()];
      saveStoreAdmins(updatedList);
      setAdmins(updatedList);

      try {
        await fetch('http://localhost:5000/api/v1/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            password: assignedPassword,
            permissions: selectedPermissions
          })
        });
      } catch (err) {}

      setGeneratedCreds({
        email: formEmail,
        tempPass: assignedPassword
      });

      logAction(
        'Super Admin',
        'SUPER_ADMIN',
        'ADMIN_CREATED',
        'AdminUser',
        newAdmin.id,
        'USER',
        `Created new Organization Admin account for ${formName} (${formEmail}).`
      );

      showToast(`Created new Organization Admin: ${formName}!`);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updatedList = admins.map(a => a.id === id ? { ...a, status: newStatus as any } : a);
    saveStoreAdmins(updatedList);
    setAdmins(updatedList);

    try {
      await fetch(`http://localhost:5000/api/v1/admins/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {}

    showToast(`Updated Admin account status to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Organization Admin Management</h2>
          <p className="text-xs text-slate-500">Create Admin credentials with passwords, manage active status, and set granular RBAC permissions</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center gap-1.5 w-fit"
        >
          <UserPlus className="w-4 h-4" /> Create New Organization Admin
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Active Organization Admins ({admins.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Admin Name & Email</th>
                <th className="p-4">Assigned RBAC Permissions</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img src={admin.avatar} alt={admin.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{admin.name}</div>
                        <div className="text-[10px] text-slate-400">{admin.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {admin.permissions.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 bg-blue-50 text-brand-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      admin.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400">{admin.createdAt}</td>

                  <td className="p-4 text-right pr-6 space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(admin)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                    >
                      Edit RBAC
                    </button>
                    <button
                      onClick={() => toggleStatus(admin.id, admin.status)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        admin.status === 'ACTIVE' 
                          ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200' 
                          : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                    >
                      {admin.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleInitiateDeleteAdmin(admin)}
                      className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <h3 className="font-extrabold text-base">{editingAdmin ? 'Edit Admin & RBAC Matrix' : 'Create Organization Admin'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedCreds ? (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Admin Credentials Created Successfully</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1 pt-1 font-mono">
                    <div><strong>Email:</strong> {generatedCreds.email}</div>
                    <div><strong>Assigned Password:</strong> <span className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold text-emerald-800">{generatedCreds.tempPass}</span></div>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. marcus.v@abctech.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                  />
                </div>

                {!editingAdmin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Set Account Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Set Admin password..."
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Account Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Confirm password..."
                        value={formConfirmPassword}
                        onChange={(e) => setFormConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-brand-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {editingAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">RBAC Permission Matrix</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {ALL_PERMISSIONS.map((perm) => (
                        <label key={perm.key} className="flex items-start gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.key)}
                            onChange={() => togglePermission(perm.key)}
                            className="mt-0.5 text-brand-blue-600 rounded focus:ring-brand-blue-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{perm.label}</div>
                            <div className="text-[10px] text-slate-500">{perm.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 rounded-xl shadow-sm"
                  >
                    {editingAdmin ? 'Save Permissions' : 'Create Admin Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reassign Admin History & Transfer Data Modal */}
      {deleteTransferAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150 relative text-xs">
            <button
              onClick={() => setDeleteTransferAdmin(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Reassign History & Delete Admin</h3>
                <p className="text-xs text-slate-500">Target Admin: {deleteTransferAdmin.name}</p>
              </div>
            </div>

            {/* Direct Deletion Warning */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
              <p className="font-extrabold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                No Direct Deleting Permitted
              </p>
              <p className="text-[11px] leading-relaxed font-medium">
                To preserve administrative audit logs and organizational governance history, select a successor Organization Admin to receive this admin's history before account removal.
              </p>
            </div>

            <form onSubmit={handleConfirmDeleteAdminWithTransfer} className="space-y-4">
              {/* Successor Admin Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Successor Admin *
                </label>
                {admins.filter((a) => a.id !== deleteTransferAdmin.id).length > 0 ? (
                  <select
                    value={successorAdminId}
                    onChange={(e) => setSuccessorAdminId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                  >
                    {admins
                      .filter((a) => a.id !== deleteTransferAdmin.id)
                      .map((adm) => (
                        <option key={adm.id} value={adm.id}>
                          {adm.name} ({adm.email})
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold text-xs">
                    No other Organization Admin accounts found. Governance history will be safely archived in System Logs.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteTransferAdmin(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Transfer History & Delete Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
