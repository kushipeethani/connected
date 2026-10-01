import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download } from 'lucide-react';
import { AuditLog } from '../../types/clyptus.types';
import { getStoreAuditLogs } from '../../store/clyptus.store';

interface ContextType {
  showToast: (msg: string) => void;
}

export const OrgSuperAdminAuditLogs: React.FC = () => {
  const { showToast } = useOutletContext<ContextType>();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getStoreAuditLogs());

  React.useEffect(() => {
    const handleSync = () => {
      setAuditLogs(getStoreAuditLogs());
    };
    window.addEventListener('clyptus_store_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clyptus_store_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleExportCSV = () => {
    const headers = ['Log ID', 'User Name', 'Role', 'Action', 'Dimension', 'Resource Target', 'Details', 'IP Address', 'Timestamp'];
    const rows = auditLogs.map((l) => [
      l.id,
      `"${l.userName}"`,
      l.role,
      l.action,
      l.dimension || 'RESOURCE',
      `"${l.resource} (${l.resourceId})"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ip,
      l.timestamp
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clyptus_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast('Exported audit records to CSV!');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Organization Audit Logs & Security Oversight</h2>
          <p className="text-xs text-slate-500">
            Append-only, immutable audit ledger of privileged administrative actions, role updates, token allocations, and recruitment operations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-bold rounded-2xl shadow-xs flex items-center gap-2 w-fit cursor-pointer"
        >
          <Download className="w-4 h-4 text-white" /> Export Audit Records (CSV)
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Organization Audit Records ({auditLogs.length})</h3>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            Compliance Secured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Log ID</th>
                <th className="p-4">User & Role</th>
                <th className="p-4">Dimension & Action</th>
                <th className="p-4">Resource Target & Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right pr-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-slate-900">{log.id}</td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black ${
                      log.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      log.role === 'ORGANIZATION_ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {log.role}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900">{log.action}</div>
                    <span className="text-[10px] font-bold text-brand-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                      {log.dimension || 'RESOURCE'}
                    </span>
                  </td>

                  <td className="p-4 max-w-xs">
                    <div className="font-mono text-[11px] text-slate-800 font-bold">
                      {log.resource} ({log.resourceId})
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 italic">
                        "{log.details}"
                      </p>
                    )}
                  </td>

                  <td className="p-4 font-mono text-slate-500">{log.ip}</td>

                  <td className="p-4 text-right pr-6 font-semibold text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                </tr>
              ))}

              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs font-medium">
                    No audit records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
