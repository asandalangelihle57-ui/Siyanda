import React, { useState } from 'react';
import { History, ShieldCheck, Download, Search, Filter } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    return log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.details.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const exportCsv = () => {
    const headers = 'ID,Timestamp,User,Role,Action,Entity,IP Address,Details\n';
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.entityName}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DSAC_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Cryptographic & Statutory System Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 26 compliance: Immutable append-only audit log tracking every user login, report submission, version commit, and approval
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors shadow"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, official name, entity, IP address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Immutable Ledger • 100% Non-Repudiation</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Official</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action Recorded</th>
                <th className="p-3">Entity Impacted</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-sans font-semibold text-white whitespace-nowrap">{log.userName}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="bg-slate-800 text-amber-300 text-[10px] px-1.5 py-0.5 rounded">
                      {log.userRole.replace('DSAC', '').replace('Entity', '')}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                      log.action.includes('Approv')
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : log.action.includes('Upload')
                        ? 'bg-sky-500/20 text-sky-300'
                        : log.action.includes('Risk')
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-sans text-slate-200">{log.entityName}</td>
                  <td className="p-3 text-slate-500">{log.ipAddress}</td>
                  <td className="p-3 font-sans text-slate-300 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
