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
    <div className="p-4 sm:p-6 space-y-5 animate-fadeIn">
      {/* Create Finding Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                  AGSA Statutory Register
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Log Auditor-General Finding & Action Plan
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    Finding Reference No:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AGSA-2025-NAC-03"
                    value={newReference}
                    onChange={e => setNewReference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Statutory Severity Level:
                </label>
                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value as AuditFinding['severity'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Material">Material Irregularity (PFMA Section 51)</option>
                  <option value="Minor">Minor Non-Compliance</option>
                  <option value="Administrative">Administrative / Documentation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  AGSA Observation Description:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the Auditor-General's statutory finding or financial deviation..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Corrective Action Plan & Remediation Milestones:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail internal audit remediation steps, policy updates, and responsible officials..."
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Log Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Search & Actions Bar: Search bar at the top with log and export buttons on the right-hand side */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search finding reference, public entity, description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Severities</option>
              <option value="Material">Material Irregularity</option>
              <option value="Minor">Minor Non-Compliance</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>

          <span className="text-slate-500 font-mono hidden sm:inline text-[11px] font-semibold">
            {filteredAudits.length} Findings
          </span>
        </div>

        {/* Log and Export buttons on the right-hand side of the search bar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log AGSA Finding</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Export AGSA Register (CSV)</span>
          </button>
        </div>
      </div>

      {/* Findings Cards */}
      <div className="space-y-3">
        {filteredAudits.map(audit => (
          <div
            key={audit.id}
            className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {audit.findingReference}
                  </span>
                  <button
                    onClick={() => onSelectEntity(audit.entityId)}
                    className="font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {audit.entityName}
                  </button>
                  <span className="text-slate-500">({audit.auditYear})</span>
                </div>
                <p className="text-slate-700 mt-2 leading-relaxed">
                  {audit.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border ${
                  audit.severity === 'Material'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {audit.severity}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border ${
                  audit.status === 'Resolved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : audit.status === 'In Progress'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {audit.status}
                </span>
              </div>
            </div>

            {/* Corrective Action Plan */}
            <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 mt-2 space-y-1">
              <div className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
                <span>Corrective Action Plan & Remediation:</span>
                <span className="text-slate-500 font-normal">
                  Due Date: <strong className="text-slate-900">{audit.dueDate}</strong>
                </span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {audit.correctiveAction}
              </p>
            </div>

            {/* Remediation Action Controls */}
            {onUpdateAuditStatus && (
              <div className="flex justify-end gap-3 pt-1">
                {audit.status !== 'In Progress' && (
                  <button
                    onClick={() => onUpdateAuditStatus(audit.id, 'In Progress')}
                    className="text-[11px] text-amber-800 hover:text-amber-900 underline font-medium cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                )}
                {audit.status !== 'Resolved' && (
                  <button
                    onClick={() => onUpdateAuditStatus(audit.id, 'Resolved')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer"
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
