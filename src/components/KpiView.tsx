import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText,
  Save,
  X,
  Download,
  Building2
} from 'lucide-react';
import { KPI, UserRole } from '../types';

interface KpiViewProps {
  kpis: KPI[];
  onUpdateKpi: (updatedKpi: KPI) => void;
  onCreateKpi?: (newKpi: Omit<KPI, 'id'>) => void;
  userRole: UserRole;
}

export const KpiView: React.FC<KpiViewProps> = ({
  kpis,
  onUpdateKpi,
  onCreateKpi,
  userRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);

  // Edit form states
  const [editActual, setEditActual] = useState<number>(0);
  const [editComments, setEditComments] = useState<string>('');

  // Create KPI Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKpiName, setNewKpiName] = useState('');
  const [newKpiEntityId, setNewKpiEntityId] = useState<number>(1);
  const [newKpiEntityName, setNewKpiEntityName] = useState('National Arts Council');
  const [newKpiObjective, setNewKpiObjective] = useState('');
  const [newKpiTarget, setNewKpiTarget] = useState<number>(100);
  const [newKpiAnnualTarget, setNewKpiAnnualTarget] = useState<number>(400);

  const canEdit = userRole === 'EntityAdministrator' || userRole === 'EntityStaff' || userRole === 'DSACAdministrator';

  const filteredKpis = kpis.filter(k => {
    const matchesSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.strategicObjective.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (kpi: KPI) => {
    setEditingKpi(kpi);
    setEditActual(kpi.actualResult);
    setEditComments(kpi.comments || '');
  };

  const handleSaveKpi = () => {
    if (!editingKpi) return;

    // Mathematical formula requested: Actual / Target * 100
    const target = editingKpi.quarterlyTarget > 0 ? editingKpi.quarterlyTarget : 1;
    const computedPct = Math.round((editActual / target) * 100);

    let newStatus: KPI['status'] = 'In Progress';
    if (computedPct >= 100) newStatus = 'Completed';
    else if (computedPct < 60) newStatus = 'At Risk';

    const updated: KPI = {
      ...editingKpi,
      actualResult: editActual,
      percentageAchieved: computedPct,
      comments: editComments,
      status: newStatus
    };

    onUpdateKpi(updated);
    setEditingKpi(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKpiName.trim() || !newKpiObjective.trim()) return;

    if (onCreateKpi) {
      onCreateKpi({
        entityId: newKpiEntityId,
        entityName: newKpiEntityName,
        name: newKpiName.trim(),
        strategicObjective: newKpiObjective.trim(),
        metricType: 'Number',
        annualTarget: Number(newKpiAnnualTarget),
        quarterlyTarget: Number(newKpiTarget),
        actualResult: 0,
        percentageAchieved: 0,
        startDate: '2025-10-01',
        deadline: '2026-03-31',
        responsiblePerson: 'Senior Executive',
        status: 'In Progress',
        trend: 'Stable',
        comments: 'Statutory strategic indicator initialized in system.'
      });
    }

    setShowCreateModal(false);
    setNewKpiName('');
    setNewKpiObjective('');
  };

  // Export KPI catalog to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Entity', 'Indicator Name', 'Strategic Objective', 'Quarterly Target', 'Actual Result', '% Achieved', 'Status'];
    const rows = kpis.map(k => [
      k.id,
      `"${k.entityName}"`,
      `"${k.name}"`,
      `"${k.strategicObjective}"`,
      k.quarterlyTarget,
      k.actualResult,
      `${k.percentageAchieved}%`,
      k.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DSAC_Strategic_KPI_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Create New KPI Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  APP Strategic Framework
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Register Strategic Performance Indicator
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reporting Public Entity:
                </label>
                <select
                  value={newKpiEntityId}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setNewKpiEntityId(id);
                    const ent = kpis.find(k => k.entityId === id);
                    if (ent) setNewKpiEntityName(ent.entityName);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
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
                  Performance Indicator Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Number of rural community art centres funded"
                  value={newKpiName}
                  onChange={e => setNewKpiName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Strategic Objective Alignment:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand cultural infrastructure access across priority provinces"
                  value={newKpiObjective}
                  onChange={e => setNewKpiObjective(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quarterly Target (Q3):
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newKpiTarget}
                    onChange={e => setNewKpiTarget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Annual Target (MTSF):
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newKpiAnnualTarget}
                    onChange={e => setNewKpiAnnualTarget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Register Indicator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPI Update Modal */}
      {editingKpi && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                  {editingKpi.entityName}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Update Actual Performance Result
                </h3>
              </div>
              <button onClick={() => setEditingKpi(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
              <div className="font-semibold text-white">{editingKpi.name}</div>
              <div className="text-slate-400">Target: <span className="font-mono text-amber-400 font-bold">{editingKpi.quarterlyTarget}</span></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Verified Actual Result:
                </label>
                <input
                  type="number"
                  value={editActual}
                  onChange={e => setEditActual(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Variance Explanation & Evidence Portfolio Notes:
                </label>
                <textarea
                  rows={3}
                  value={editComments}
                  onChange={e => setEditComments(e.target.value)}
                  placeholder="Detail reasons for target deviation or corrective milestones..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingKpi(null)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKpi}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-colors"
              >
                <Save className="w-4 h-4" />
                Commit Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Metric Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Strategic KPI Performance Management System
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking PFMA delivery agreements, quarterly target variances, and verifiable evidence portfolios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export KPI Register (CSV)
          </button>
          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Strategic Indicator
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search strategic KPIs, entity, objective..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="At Risk">At Risk</option>
              <option value="Deadline Missed">Deadline Missed</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-mono">
          Displaying {filteredKpis.length} Indicators
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKpis.map(kpi => {
          return (
            <div
              key={kpi.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {kpi.entityName}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-1.5 leading-snug">
                    {kpi.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {kpi.strategicObjective}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-mono text-slate-400">
                    Actual / Target
                  </div>
                  <div className="flex items-baseline justify-end gap-2 mt-1">
                    <span className="font-mono text-lg font-bold text-white">
                      {kpi.actualResult.toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-xs">/</span>
                    <span className="font-mono text-sm text-slate-400">
                      {kpi.quarterlyTarget.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="mt-2 flex items-center gap-2 justify-end">
                    <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          kpi.percentageAchieved >= 100
                            ? 'bg-emerald-500'
                            : kpi.percentageAchieved >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(kpi.percentageAchieved, 100)}%` }}
                      ></div>
                    </div>
                    <span className={`font-mono text-xs font-black ${
                      kpi.percentageAchieved >= 100
                        ? 'text-emerald-400'
                        : kpi.percentageAchieved >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {kpi.percentageAchieved}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      kpi.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : kpi.status === 'In Progress'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {kpi.status}
                    </span>

                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(kpi)}
                        className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                      >
                        Update Actual &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
