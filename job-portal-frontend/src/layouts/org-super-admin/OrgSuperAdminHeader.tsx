import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, LogOut, Menu, Edit, X, ShieldCheck } from 'lucide-react';
import { useUiStore } from '../../store/ui.store';

interface HeaderProps {
  creditBalance: number;
}

export const OrgSuperAdminHeader: React.FC<HeaderProps> = ({ creditBalance }) => {
  const navigate = useNavigate();
  const { toggleSidebar } = useUiStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Super Admin Profile State
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('clyptus_superadmin_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Sarah Jenkins',
      role: 'Organization Super Admin',
      email: 'sarah.j@abctech.com',
      phone: '+91 98000 11223',
      organization: 'ABC Recruitment Pvt Ltd',
      scope: 'Full Tenant & Credit Control',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    };
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editRole, setEditRole] = useState(profile.role);
  const [editOrg, setEditOrg] = useState(profile.organization);

  const handleOpenEdit = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditRole(profile.role);
    setEditOrg(profile.organization);
    setIsEditModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      organization: editOrg
    };
    setProfile(updated);
    try {
      localStorage.setItem('clyptus_superadmin_profile', JSON.stringify(updated));
      window.dispatchEvent(new Event('clyptus_store_updated'));
    } catch (e) {}
    setIsEditModalOpen(false);
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-40 shadow-xs">
      {/* Left: Brand & Badge matching Admin Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#0052CC] text-white flex items-center justify-center font-black text-xl shadow-sm">
            C
          </div>
          <div>
            <span className="font-extrabold text-lg text-[#0B192C] tracking-tight">
              Clyptus
            </span>
          </div>
        </div>
      </div>

      {/* Right: Credit Balance & Profile Dropdown */}
      <div className="flex items-center space-x-5">
        {/* Credit Balance Card */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-[#0052CC] text-white flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold uppercase text-gray-500">Org Credit Balance</span>
            <span className="text-xs font-extrabold text-gray-900 leading-tight">
              {creditBalance.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">credits</span>
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className="relative flex items-center space-x-2">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50 transition"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-9 h-9 rounded-full object-cover border border-gray-300"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {profile.name}
              </p>
              <p className="text-[11px] text-[#0052CC] font-medium leading-tight">
                {profile.role}
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/organization-super-admin/login')}
            title="Logout from Org Super Admin Portal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-xs font-black text-gray-900 leading-tight">{profile.name}</h4>
                  <span className="inline-block text-[10px] font-extrabold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-md mt-0.5">
                    {profile.role}
                  </span>
                </div>
              </div>

              <div className="py-2.5 space-y-2 text-xs border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-semibold text-gray-800">{profile.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mobile Phone</span>
                  <span className="font-semibold text-gray-800">{profile.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Organization</span>
                  <span className="font-semibold text-gray-800">{profile.organization}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Governance Scope</span>
                  <span className="font-semibold text-emerald-700">{profile.scope}</span>
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <button
                  onClick={handleOpenEdit}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#0052CC] hover:bg-blue-50 rounded-xl flex items-center space-x-2 transition cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-[#0052CC]" />
                  <span>Edit Profile Details</span>
                </button>

                <button
                  onClick={() => navigate('/organization-super-admin/login')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out from Super Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Super Admin Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0052CC]" />
                <h3 className="font-extrabold text-base text-slate-900">Edit Super Admin Profile</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Super Admin Role</label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={editOrg}
                  onChange={(e) => setEditOrg(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0043A8] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
