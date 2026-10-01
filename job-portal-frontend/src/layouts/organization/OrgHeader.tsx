import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useOrganizationStore } from '../../store/organization.store';
import { useUiStore } from '../../store/ui.store';
import { useAuth } from '../../hooks/useAuth';
import { getStoreCreditAccount } from '../../store/clyptus.store';
import {
  Menu,
  Coins,
  LogOut,
  Edit,
  X,
  UserCheck
} from 'lucide-react';

export const OrgHeader: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { currentOrg } = useOrganizationStore();
  const { toggleSidebar } = useUiStore();
  const { logout } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('clyptus_admin_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: user ? `${user.firstName} ${user.lastName}` : 'Marcus Vance',
      email: user?.email || 'orgadmin@abctech.com',
      phone: '+91 98765 12345',
      department: 'Talent Operations',
      organization: currentOrg?.name || 'ABC Recruitment Pvt Ltd',
      role: user?.role === 'ORG_SUPER_ADMIN' ? 'Organization Super Admin' : 'Organization Primary Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(adminProfile.name);
  const [editEmail, setEditEmail] = useState(adminProfile.email);
  const [editPhone, setEditPhone] = useState(adminProfile.phone);
  const [editDepartment, setEditDepartment] = useState(adminProfile.department);
  const [editOrg, setEditOrg] = useState(adminProfile.organization);

  const handleOpenEdit = () => {
    setEditName(adminProfile.name);
    setEditEmail(adminProfile.email);
    setEditPhone(adminProfile.phone);
    setEditDepartment(adminProfile.department);
    setEditOrg(adminProfile.organization);
    setIsEditModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const nameParts = editName.trim().split(' ');
    const firstName = nameParts[0] || editName;
    const lastName = nameParts.slice(1).join(' ') || '';

    const updated = {
      ...adminProfile,
      name: editName,
      email: editEmail,
      phone: editPhone,
      department: editDepartment,
      organization: editOrg
    };

    setAdminProfile(updated);

    if (user) {
      setUser({
        ...user,
        firstName,
        lastName,
        email: editEmail
      });
    }

    try {
      localStorage.setItem('clyptus_admin_profile', JSON.stringify(updated));
      window.dispatchEvent(new Event('clyptus_store_updated'));
    } catch (e) {}
    setIsEditModalOpen(false);
  };

  const orgName = adminProfile.organization || currentOrg?.name || 'ABC Recruitment Pvt Ltd';
  const userName = adminProfile.name;
  const userRoleDisplay = adminProfile.role;
  
  const [credits, setCredits] = useState<number>(() => {
    return getStoreCreditAccount().balance;
  });

  useEffect(() => {
    const handleSync = () => {
      setCredits(getStoreCreditAccount().balance);
    };
    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-40 shadow-xs">
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

      <div className="flex items-center space-x-5">
        {/* Org Credit Balance Badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-[#0052CC] text-white flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold uppercase text-gray-500">Org Credit Balance</span>
            <span className="text-xs font-extrabold text-gray-900 leading-tight">
              {credits.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">credits</span>
            </span>
          </div>
        </div>

        {/* User Profile Badge */}
        <div className="relative flex items-center space-x-2">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border border-gray-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {userName}
              </p>
              <p className="text-[11px] text-[#0052CC] font-medium leading-tight">
                {userRoleDisplay}
              </p>
            </div>
          </button>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                <img
                  src={adminProfile.avatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-xs font-black text-gray-900 leading-tight">{userName}</h4>
                  <span className="inline-block text-[10px] font-extrabold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-md mt-0.5">
                    {userRoleDisplay}
                  </span>
                </div>
              </div>

              <div className="py-2.5 space-y-2 text-xs border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-semibold text-gray-800">{adminProfile.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mobile Phone</span>
                  <span className="font-semibold text-gray-800">{adminProfile.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Department</span>
                  <span className="font-semibold text-gray-800">{adminProfile.department}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Organization</span>
                  <span className="font-semibold text-gray-800">{orgName}</span>
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
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out from Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Admin Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0052CC]" />
                <h3 className="font-extrabold text-base text-slate-900">Edit Admin Profile</h3>
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
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
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
