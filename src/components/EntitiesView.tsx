import React, { useState } from 'react';
import { 
  Building2, 
  HeartHandshake, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Target, 
  Coins, 
  ClipboardCheck, 
  ShieldAlert, 
  ChevronRight, 
  X,
  FileText,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { PublicEntity, NPO, KPI, StatutoryDocument, AuditFinding, FinancialRecord } from '../types';
import { STATEMENT_PROBLEMS } from '../data/problemStatementData';

interface EntitiesViewProps {
  entities: PublicEntity[];
  npos: NPO[];
  kpis: KPI[];
  documents: StatutoryDocument[];
  audits: AuditFinding[];
  financials: FinancialRecord[];
  selectedEntityId: number | null;
  onSelectEntity: (id: number | null) => void;
  onNavigateTab: (tab: any) => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({
  entities,
  npos,
  kpis,
  documents,
  audits,
  financials,
  selectedEntityId,
  onSelectEntity,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'entities' | 'npos'>('entities');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'kpis' | 'documents' | 'financials' | 'audits'>('overview');

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

  // Filter entities
  const filteredEntities = entities.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesRisk = riskFilter === 'All' || e.riskLevel === riskFilter;
    return matchesSearch && matchesCategory && matchesRisk;
  });

  // Filter NPOs
  const filteredNpos = npos.filter(n => {
    return n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           n.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
           n.focusArea.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Entity-specific records
  const entityKpis = kpis.filter(k => k.entityId === selectedEntityId);
  const entityDocs = documents.filter(d => d.entityId === selectedEntityId);
  const entityAudits = audits.filter(a => a.entityId === selectedEntityId);
  const entityFinancial = financials.find(f => f.entityId === selectedEntityId);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Entity Workspace Modal / Deep Dive if an entity is selected */}
      {selectedEntity && (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-mono font-bold text-xs px-2 py-0.5 rounded">
                  {selectedEntity.acronym}
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedEntity.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  selectedEntity.riskLevel === 'Low'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : selectedEntity.riskLevel === 'Medium'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {selectedEntity.riskLevel} Risk ({selectedEntity.riskScore}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Registration: <strong className="text-slate-200">{selectedEntity.registrationNumber}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-slate-200">{selectedEntity.category}</strong></span>
                <span>•</span>
                <span>Province: <strong className="text-slate-200">{selectedEntity.province}</strong></span>
                <span>•</span>
                <span>CEO: <strong className="text-slate-200">{selectedEntity.ceoName}</strong></span>
              </p>
            </div>

            <button
              onClick={() => onSelectEntity(null)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Close Workspace
            </button>
          </div>

          {/* Workspace Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs">
            <button
              onClick={() => setWorkspaceTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                workspaceTab === 'overview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Executive Overview & Risk
            </button>
            <button
              onClick={() => setWorkspaceTab('kpis')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                workspaceTab === 'kpis' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              KPI Progress ({entityKpis.length})
            </button>
            <button
              onClick={() => setWorkspaceTab('documents')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                workspaceTab === 'documents' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Statutory Documents ({entityDocs.length})
            </button>
            <button
              onClick={() => setWorkspaceTab('financials')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                workspaceTab === 'financials' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Grant Budget & Expenditure
            </button>
            <button
              onClick={() => setWorkspaceTab('audits')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                workspaceTab === 'audits' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Audit Findings ({entityAudits.length})
            </button>
          </div>

          {/* Workspace Tab Content */}
          {workspaceTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Budget Allocation</span>
                  <div className="text-lg font-bold text-white mt-1">
                    R{(selectedEntity.budgetAllocated / 1000000).toFixed(1)}M
                  </div>
                  <span className="text-slate-500 text-[10px]">Expenditure: R{(selectedEntity.budgetSpent / 1000000).toFixed(1)}M</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">KPI Compliance Rate</span>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {selectedEntity.complianceRate}%
                  </div>
                  <span className="text-slate-500 text-[10px]">Expected Q3 Trajectory: 75%</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Open Audit Findings</span>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    {selectedEntity.openAuditFindings} Findings
                  </div>
                  <span className="text-slate-500 text-[10px]">AGSA Material Items</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Job Creation Target</span>
                  <div className="text-lg font-bold text-purple-400 mt-1">
                    {selectedEntity.jobsCreated} / {selectedEntity.jobsTarget}
                  </div>
                  <span className="text-slate-500 text-[10px]">PES Verified Grantees</span>
                </div>
              </div>

              {/* AI Risk Vector Analysis */}
              <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>AI Early Warning & Performance Risk Analysis</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {selectedEntity.riskReason}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                    Days Remaining for Q3: <strong>10 Days</strong>
                  </span>
                  <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                    Previous Missed Deadlines: <strong>3 Cycles</strong>
                  </span>
                  <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                    Historical Trajectory: <strong className="text-rose-400">Declining</strong>
                  </span>
                </div>
              </div>

              {/* Linked Statutory Statement Problems */}
              {(() => {
                const linkedProblems = STATEMENT_PROBLEMS.filter(
                  p => p.affectedEntityIds.includes(selectedEntity.id) || p.affectedEntityNames.includes('All 26 Public Entities and 6 Funded NPOs')
                );
                if (linkedProblems.length === 0) return null;
                return (
                  <div className="bg-slate-950/80 p-4 rounded-lg border border-rose-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Deficiencies on Official Statement Impacting This Entity ({linkedProblems.length})</span>
                      </div>
                      <button
                        onClick={() => onNavigateTab('problems')}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                      >
                        Open Problem Statement Dossier &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {linkedProblems.map(p => (
                        <div
                          key={p.id}
                          onClick={() => onNavigateTab('problems')}
                          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-2.5 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] text-amber-400 font-bold">{p.code}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              p.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {p.severity}
                            </span>
                          </div>
                          <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            Provision: {p.legalProvision}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {workspaceTab === 'kpis' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-bold text-white">Active Strategic KPIs</h4>
                <button 
                  onClick={() => onNavigateTab('kpis')}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Manage All Strategic KPIs &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {entityKpis.map(kpi => (
                  <div key={kpi.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-100">{kpi.name}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{kpi.strategicObjective}</div>
                      <div className="text-slate-500 text-[10px] mt-1">Responsible: {kpi.responsiblePerson}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-slate-200">
                        Target: {kpi.quarterlyTarget} • Actual: {kpi.actualResult}
                      </div>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="font-mono font-bold text-amber-300">{kpi.percentageAchieved}%</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          kpi.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {kpi.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workspaceTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-bold text-white">Statutory Reporting Submissions</h4>
                <button 
                  onClick={() => onNavigateTab('documents')}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Open Document Version Control &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {entityDocs.map(doc => (
                  <div key={doc.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        {doc.documentType} ({doc.reportingPeriod})
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono text-[10px]">
                          v{doc.currentVersion}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">Uploaded: {doc.uploadDate}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        doc.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {doc.status}
                      </span>
                      <button
                        onClick={() => onNavigateTab('documents')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs"
                      >
                        Inspect Versions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workspaceTab === 'financials' && entityFinancial && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white">Grant Allocation & Tranches Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <div className="text-slate-400 text-[11px]">Total Allocation</div>
                  <div className="font-bold text-white font-mono text-sm">R{entityFinancial.allocated.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Transferred to Date</div>
                  <div className="font-bold text-sky-400 font-mono text-sm">R{entityFinancial.received.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Actual Expenditure</div>
                  <div className="font-bold text-emerald-400 font-mono text-sm">R{entityFinancial.spent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Utilisation Rate</div>
                  <div className="font-bold text-amber-400 font-mono text-sm">{entityFinancial.utilisationPct}%</div>
                </div>
              </div>
            </div>
          )}

          {workspaceTab === 'audits' && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white">Auditor-General (AGSA) Observations</h4>
              {entityAudits.map(audit => (
                <div key={audit.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold text-white">{audit.findingReference}: {audit.severity}</div>
                      <p className="text-slate-300 mt-1">{audit.description}</p>
                      <p className="text-amber-300/90 mt-1">Corrective Plan: {audit.correctiveAction}</p>
                    </div>
                    <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0">
                      {audit.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Directory Controls & Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab('entities')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeSubTab === 'entities'
                  ? 'bg-emerald-800 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Public Entities ({entities.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('npos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeSubTab === 'npos'
                  ? 'bg-emerald-800 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-sky-400" />
              <span>Non-Profit Organisations ({npos.length})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, acronym, province..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {activeSubTab === 'entities' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Performing Arts Council">Performing Arts Councils</option>
                <option value="Heritage & Museums">Heritage & Museums</option>
                <option value="Arts & Culture Development">Arts & Culture Development</option>
                <option value="Film & Media">Film & Media</option>
                <option value="Language & Literature">Language & Literature</option>
                <option value="Sport Integrity & Boxing">Sport & Boxing</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Risk Level:</span>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="All">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <span className="text-slate-500 text-[11px] ml-auto">
              Displaying {filteredEntities.length} of {entities.length} statutory organisations
            </span>
          </div>
        )}
      </div>

      {/* Directory Grid */}
      {activeSubTab === 'entities' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map(entity => (
            <div
              key={entity.id}
              onClick={() => onSelectEntity(entity.id)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-300 font-mono font-bold text-xs px-2 py-0.5 rounded transition-colors">
                      {entity.acronym}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{entity.registrationNumber}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    entity.riskLevel === 'Low'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : entity.riskLevel === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {entity.riskLevel}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mt-2 leading-snug group-hover:text-amber-200 transition-colors">
                  {entity.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">{entity.category} • {entity.province}</p>

                <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <div className="text-slate-500 text-[10px]">Budget</div>
                    <div className="font-bold text-slate-200 font-mono">
                      R{(entity.budgetAllocated / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Achievement</div>
                    <div className="font-bold text-amber-400 font-mono">
                      {entity.complianceRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Audits</div>
                    <div className="font-bold text-slate-200 font-mono">
                      {entity.openAuditFindings}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[11px] text-amber-400 font-semibold flex items-center justify-between">
                <span>Access Entity Workspace</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNpos.map(npo => (
            <div
              key={npo.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-sky-500/20 text-sky-300 font-mono font-bold text-xs px-2 py-0.5 rounded border border-sky-500/30">
                    {npo.acronym}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    {npo.complianceStatus}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mt-2">{npo.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{npo.focusArea}</p>

                <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual Grant:</span>
                    <strong className="text-white font-mono">R{(npo.grantAmount / 1000000).toFixed(1)}M</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disbursed:</span>
                    <strong className="text-sky-300 font-mono">R{(npo.grantDisbursed / 1000000).toFixed(1)}M</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Director:</span>
                    <span className="text-slate-300">{npo.directorName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                <span>Last Report: {npo.lastReportDate}</span>
                <span className="text-sky-400 font-semibold cursor-pointer hover:underline">
                  Compliance Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
