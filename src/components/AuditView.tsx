import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Calendar, 
  Plus, 
  Download, 
  X,
  Building2,
  FileCheck2
} from 'lucide-react';
import { AuditFinding } from '../types';

interface AuditViewProps {
  audits: AuditFinding[];
  onSelectEntity: (id: number) => void;
  onCreateAudit?: (newAudit: Omit<AuditFinding, 'id'>) => void;
  onUpdateAuditStatus?: (id: number, status: AuditFinding['status']) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ 
  audits, 
  onSelectEntity,
  onCreateAudit,
  onUpdateAuditStatus 
}) => {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create finding modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntityId, setNewEntityId] = useState<number>(1);
  const [newEntityName, setNewEntityName] = useState('National Arts Council');
  const [newReference, setNewReference] = useState('AGSA-2025-Q3-01');
  const [newSeverity, setNewSeverity] = useState<AuditFinding['severity']>('Material');
  const [newDescription, setNewDescription] = useState('');
  const [newPlan, setNewPlan] = useState('');

  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.findingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !newPlan.trim()) return;

    if (onCreateAudit) {
      onCreateAudit({
        entityId: newEntityId,
        entityName: newEntityName,
        auditYear: '2024/2025',
        findingReference: newReference.trim(),
        severity: newSeverity,
        description: newDescription.trim(),
        correctiveAction: newPlan.trim(),
        responsiblePerson: 'Internal Audit & Risk Committee',
        dueDate: '31 March 2026',
        status: 'Open'
      });
    }

    setShowCreateModal(false);
    setNewDescription('');
    setNewPlan('');
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Reference', 'Entity', 'Severity', 'Description', 'Corrective Action', 'Due Date', 'Status'];
    const rows = audits.map(a => [
      a.id,
      `"${a.findingReference}"`,
      `"${a.entityName}"`,
      a.severity,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.correctiveAction.replace(/"/g, '""')}"`,
      a.dueDate,
      a.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AGSA_Audit_Findings_Tracker_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Create Finding Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/60 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                  AGSA Statutory Register
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Log Auditor-General Finding & Action Plan
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Audited Public Entity:
                  </label>
                  <select
                    value={newEntityId}
                    onChange={e => {
                      const id = Number(e.target.value);
                      setNewEntityId(id);
                      const ent = audits.find(a => a.entityId === id);
                      if (ent) setNewEntityName(ent.entityName);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value={1}>National Arts Council (NAC)</option>
                    <option value={2}>South African Heritage Resources Agency (SAHRA)</option>
                    <option value={3}>South African Institute for Drug-Free Sport (SAIDS)</option>
                    <option value={4}>National Film and Video Foundation (NFVF)</option>
                    <option value={5}>Artscape Theatre Centre</option>
                    <option value={6}>Freedom Park</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Finding Reference No:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AGSA-2025-NAC-03"
                    value={newReference}
                    onChange={e => setNewReference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Statutory Severity Level:
                </label>
                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value as AuditFinding['severity'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Material">Material Irregularity (PFMA Section 51)</option>
                  <option value="Minor">Minor Non-Compliance</option>
                  <option value="Administrative">Administrative / Documentation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  AGSA Observation Description:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the Auditor-General's statutory finding or financial deviation..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Corrective Action Plan & Remediation Milestones:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail internal audit remediation steps, policy updates, and responsible officials..."
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Log Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Search & Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, entity, finding..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Severities</option>
              <option value="Material">Material Irregularity</option>
              <option value="Minor">Minor Non-Compliance</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>

          <span className="text-slate-400 font-mono hidden sm:inline text-[11px]">
            {filteredAudits.length} Findings
          </span>
        </div>

        {/* Log and Export buttons on the right-hand side of the search bar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log AGSA Finding</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export AGSA Register (CSV)</span>
          </button>
        </div>
      </div>

      {/* Findings Cards */}
      <div className="space-y-3">
        {filteredAudits.map(audit => (
          <div
            key={audit.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow hover:border-slate-700 transition-all space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {audit.findingReference}
                  </span>
                  <button
                    onClick={() => onSelectEntity(audit.entityId)}
                    className="font-bold text-white hover:text-amber-400 transition-colors"
                  >
                    {audit.entityName}
                  </button>
                  <span className="text-slate-500">({audit.auditYear})</span>
                </div>
                <p className="text-slate-300 mt-2 leading-relaxed">
                  {audit.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  audit.severity === 'Material'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {audit.severity}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  audit.status === 'Resolved'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : audit.status === 'In Progress'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {audit.status}
                </span>
              </div>
            </div>

            {/* Corrective Action Plan */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 mt-2 space-y-1">
              <div className="text-[11px] font-semibold text-amber-400 flex items-center justify-between">
                <span>Corrective Action Plan & Remediation:</span>
                <span className="text-slate-400 font-normal">
                  Due Date: <strong className="text-white">{audit.dueDate}</strong>
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {audit.correctiveAction}
              </p>
            </div>

            {/* Remediation Action Controls */}
            {onUpdateAuditStatus && (
              <div className="flex justify-end gap-2 pt-1">
                {audit.status !== 'In Progress' && (
                  <button
                    onClick={() => onUpdateAuditStatus(audit.id, 'In Progress')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                  >
                    Mark In Progress
                  </button>
                )}
                {audit.status !== 'Resolved' && (
                  <button
                    onClick={() => onUpdateAuditStatus(audit.id, 'Resolved')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold"
                  >
                    Confirm AGSA Remediation Milestone
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
