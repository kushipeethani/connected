import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, Lock, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getStoreRolePermissions, saveStoreRolePermissions } from '../../store/clyptus.store';
import { RolePermissionRow } from '../../types/clyptus.types';

interface ContextType {
  showToast?: (msg: string) => void;
}

export const RolesPermissions: React.FC = () => {
  const context = useOutletContext<ContextType>();
  const showToast = context?.showToast || ((msg: string) => alert(msg));

  const [permissions, setPermissions] = useState<RolePermissionRow[]>(() => getStoreRolePermissions());

  useEffect(() => {
    const handleStoreUpdate = (e: any) => {
      if (e.detail?.type === 'ROLE_PERMISSIONS') {
        setPermissions(getStoreRolePermissions());
      }
    };
    window.addEventListener('clyptus_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('clyptus_store_updated', handleStoreUpdate);
  }, []);

  const togglePermission = (id: string, roleKey: 'superAdmin' | 'admin' | 'recruiter') => {
    const updated = permissions.map((row) => {
      if (row.id === id) {
        return { ...row, [roleKey]: !row[roleKey] };
      }
      return row;
    });
    setPermissions(updated);
  };

  const handleSaveChanges = () => {
    saveStoreRolePermissions(permissions);
    showToast('Updated role permission matrix for Super Admin, Admin & Recruiter!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* Top Bar Header */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#0052CC] block mb-1">
          ACCESS CONTROL
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Assign organization roles
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review and update permissions for Super Admin, Admin, and Recruiter roles.
        </p>
      </div>

      {/* Main Permissions Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
        
        {/* Card Header Subtitle */}
        <div className="border-b border-slate-100 pb-5">
          <h3 className="text-base font-bold text-slate-900">Organization role permissions</h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure authorization boundaries across Super Admin, Admin, and Recruiter tiers.
          </p>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-1/2">PERMISSION</th>
                <th className="py-3 px-4 text-center">SUPER ADMIN</th>
                <th className="py-3 px-4 text-center">ADMIN</th>
                <th className="py-3 px-4 text-center">RECRUITER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {permissions.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Permission Label */}
                  <td className="py-4 px-4 font-semibold text-xs text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{row.label}</span>
                    </div>
                  </td>

                  {/* Super Admin Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => togglePermission(row.id, 'superAdmin')}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                          row.superAdmin
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        {row.superAdmin && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>
                  </td>

                  {/* Admin Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => togglePermission(row.id, 'admin')}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                          row.admin
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        {row.admin && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>
                  </td>

                  {/* Recruiter Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => togglePermission(row.id, 'recruiter')}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                          row.recruiter
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        {row.recruiter && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Footer with Save Changes at Bottom */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Changes will take effect immediately across all active sessions.
          </p>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0043A8] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save changes</span>
          </button>
        </div>

      </div>

    </div>
  );
};
