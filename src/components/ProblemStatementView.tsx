import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Send, 
  Download, 
  Filter, 
  Search, 
  Building2, 
  Scale, 
  Flame, 
  TrendingUp, 
  CheckSquare, 
  X, 
  Coins, 
  FileCheck2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { StatementProblem, ProblemSeverity, ProblemStatus, PublicEntity, User } from '../types';

interface ProblemStatementViewProps {
  problems: StatementProblem[];
  entities: PublicEntity[];
  currentUser: User;
  onUpdateProblem: (updated: StatementProblem) => void;
  onSelectEntity: (entityId: number) => void;
  onNavigateTab: (tab: any) => void;
  onLogAction: (action: string, details: string, targetRecord?: string, entityName?: string) => void;
}

export const ProblemStatementView: React.FC<ProblemStatementViewProps> = ({
  problems,
  entities,
  currentUser,
  onUpdateProblem,
  onSelectEntity,
  onNavigateTab,
  onLogAction
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);

  // Modal State for Issuing Section 38 Statutory Directive
  const [directiveModalProblem, setDirectiveModalProblem] = useState<StatementProblem | null>(null);
  const [selectedDirectiveEntity, setSelectedDirectiveEntity] = useState<string>('');
  const [directiveNotes, setDirectiveNotes] = useState<string>('');
  const [isDirectiveSubmitted, setIsDirectiveSubmitted] = useState<boolean>(false);

  // Filter problems
  const filteredProblems = problems.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'All' || p.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.verbatimStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.legalProvision.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.affectedEntityNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSeverity && matchesStatus && matchesSearch;
  });

  // Aggregates
  const totalCount = problems.length;
  const criticalCount = problems.filter(p => p.severity === 'Critical').length;
  const actionRequiredCount = problems.filter(p => p.status === 'Critical Risk' || p.status === 'Action Required').length;
  const avgProgress = Math.round(problems.reduce((acc, p) => acc + p.remediationProgress, 0) / (totalCount || 1));

  // Toggle remediation step
  const handleToggleStep = (problem: StatementProblem, stepId: string) => {
    const updatedSteps = problem.remediationSteps.map(step => {
      if (step.id === stepId) {
        return { ...step, isCompleted: !step.isCompleted };
      }
      return step;
    });
    const completedCount = updatedSteps.filter(s => s.isCompleted).length;
    const newProgress = Math.round((completedCount / (updatedSteps.length || 1)) * 100);
    const newStatus: ProblemStatus = 
      newProgress === 100 ? 'Compliant' : 
      newProgress >= 70 ? 'Under Remediation' : 
      problem.severity === 'Critical' ? 'Critical Risk' : 'Action Required';

    const updatedProblem: StatementProblem = {
      ...problem,
      remediationSteps: updatedSteps,
      remediationProgress: newProgress,
      status: newStatus
    };

    onUpdateProblem(updatedProblem);
    onLogAction(
      'RemediationMilestoneToggled',
      `Toggled milestone for ${problem.code} (${problem.title}). New progress: ${newProgress}%.`,
      problem.code,
      'DSAC Oversight'
    );
  };

  // Open Directive Modal
  const handleOpenDirectiveModal = (problem: StatementProblem) => {
    setDirectiveModalProblem(problem);
    setSelectedDirectiveEntity(problem.affectedEntityNames[0] || 'All Affected Entities');
    setDirectiveNotes(`Take formal notice that under PFMA Section 38(1)(j) and Section 53, the Department requires an immediate written response and certified remediation submission regarding ${problem.title} within 7 working days.`);
    setIsDirectiveSubmitted(false);
  };

  // Submit Directive
  const handleSubmitDirective = () => {
    if (!directiveModalProblem) return;

    onLogAction(
      'Section38DirectiveIssued',
      `Ministerial Section 38 Directive dispatched to ${selectedDirectiveEntity} regarding ${directiveModalProblem.code}. Reference: DIR-${Date.now().toString().slice(-6)}.`,
      directiveModalProblem.code,
      selectedDirectiveEntity
    );

    setIsDirectiveSubmitted(true);
    setTimeout(() => {
      setDirectiveModalProblem(null);
      setIsDirectiveSubmitted(false);
    }, 1800);
  };

  // Export Problem Statement Dossier (CSV)
  const handleExportProblemDossier = () => {
    const headers = ['Problem Code', 'Title', 'Category', 'Severity', 'Status', 'Legal Provision', 'Remediation %', 'Affected Entities', 'Primary Risk'];
    const rows = problems.map(p => [
      `"${p.code}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.severity}"`,
      `"${p.status}"`,
      `"${p.legalProvision.replace(/"/g, '""')}"`,
      `"${p.remediationProgress}%"`,
      `"${p.affectedEntityNames.join('; ')}"`,
      `"${p.primaryRisk.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DSAC_Statutory_Problem_Statement_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onLogAction('DossierExported', 'Exported full DSAC Statutory Problem Statement & Resolution Register CSV', 'ProblemStatementRegister', 'DSAC Central');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fadeIn">
      {/* Top Search & Options Bar: Search Bar at the very top, with only Export Statutory and View AGSA options on the right */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search problem statements, PFMA provisions, or affected public entities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 cursor-pointer font-medium"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportProblemDossier}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            title="Download official Parliamentary Problem Statement Register"
          >
            <Download className="w-4 h-4 text-blue-700" />
            <span>Export Statutory Register (CSV)</span>
          </button>

          <button
            onClick={() => onNavigateTab('audits')}
            className="bg-blue-800 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Scale className="w-4 h-4 text-white" />
            <span>View AGSA Audit Findings</span>
          </button>
        </div>
      </div>

      {/* Problem Cards List - Clean White Dashboard Cards with Consistent Status Colors */}
      <div className="space-y-4">
        {filteredProblems.map(problem => {
          const isExpanded = activeProblemId === problem.id;
          const isCritical = problem.severity === 'Critical';

          return (
            <div 
              key={problem.id}
              className={`bg-white border rounded-xl transition-all shadow-xs overflow-hidden ${
                isCritical 
                  ? 'border-rose-300 hover:border-rose-400' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Card Header Bar */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60 border-b border-slate-100">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-800 font-mono text-xs px-2.5 py-0.5 rounded font-bold border border-blue-200">
                      {problem.code}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      problem.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      problem.severity === 'High' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {problem.severity} Severity
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      problem.status === 'Critical Risk' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      problem.status === 'Action Required' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      problem.status === 'Under Remediation' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                      'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {problem.status}
                    </span>
                    <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      {problem.legalProvision}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {problem.title}
                  </h3>
                </div>

                {/* Progress & Quick Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 font-medium">Remediation</div>
                    <div className="text-base font-black text-blue-800 font-mono">
                      {problem.remediationProgress}%
                    </div>
                  </div>

                  <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        problem.remediationProgress >= 80 ? 'bg-emerald-600' :
                        problem.remediationProgress >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ width: `${problem.remediationProgress}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => setActiveProblemId(isExpanded ? null : problem.id)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    {isExpanded ? 'Hide Details' : 'Resolve & Inspect'}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Verbatim Statement Extract Box */}
              <div className="px-4 sm:px-5 py-3 bg-blue-50/40 border-b border-slate-100">
                <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  Statutory Problem Directive Extract:
                </div>
                <blockquote className="text-xs text-slate-700 italic border-l-2 border-blue-600 pl-3 leading-relaxed">
                  "{problem.verbatimStatement}"
                </blockquote>
              </div>

              {/* Summary Stats Row */}
              <div className="px-4 sm:px-5 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white">
                <div>
                  <span className="text-slate-500 block text-[11px]">Primary Risk Exposure:</span>
                  <span className="text-rose-700 font-semibold">{problem.primaryRisk}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Empirical Data Finding:</span>
                  <span className="text-slate-800 font-medium">{problem.impactSummary}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Affected Public Entities / Units:</span>
                  <span className="text-blue-900 font-medium">{problem.affectedEntityNames.join(', ')}</span>
                </div>
              </div>

              {/* Detailed Breakdown (When Expanded) */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 space-y-5 animate-fadeIn">
                  {/* Remediation Milestones Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-blue-700" />
                        Corrective Action Plan (CAP) Remediation Milestones
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {problem.remediationSteps.filter(s => s.isCompleted).length} of {problem.remediationSteps.length} Milestones Complete
                      </span>
                    </div>

                    <div className="space-y-2">
                      {problem.remediationSteps.map(step => (
                        <div 
                          key={step.id}
                          onClick={() => handleToggleStep(problem, step.id)}
                          className={`p-3 rounded-lg border flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                            step.isCompleted 
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-700' 
                              : 'bg-white border-slate-200 hover:border-blue-300 text-slate-900'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {step.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                              )}
                            </div>
                            <div>
                              <div className={`text-xs font-bold ${step.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {step.title}
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                {step.notes}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                                <span>Assigned Authority: <strong className="text-slate-700">{step.assignedAuthority}</strong></span>
                                <span>•</span>
                                <span>Target Due: <strong className="text-blue-900">{step.targetDate}</strong></span>
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            step.isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {step.isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Mitigations Live in PERS */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
                    <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                      Active PERS Digital Mitigations & Safeguards
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {problem.directMitigations.map((mitigation, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                          <span>{mitigation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Impacted Entities Drilldown Buttons */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Target Impacted Entities & Remediation Channels
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {problem.affectedEntityIds.map(entId => {
                        const ent = entities.find(e => e.id === entId);
                        if (!ent) return null;
                        return (
                          <button
                            key={ent.id}
                            onClick={() => {
                              onSelectEntity(ent.id);
                              onNavigateTab('entities');
                            }}
                            className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-400 px-3 py-1.5 rounded-lg text-xs text-slate-800 flex items-center gap-2 transition-colors group cursor-pointer shadow-xs"
                          >
                            <span className="font-bold text-blue-900 group-hover:text-blue-700">{ent.acronym}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                              ent.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              ent.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              Risk: {ent.riskScore}/100
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-700" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <div className="text-[11px] text-slate-500">
                      Last Statutory Review: <strong>{problem.lastReviewDate}</strong> • PFMA Provision: <strong className="text-slate-800">{problem.legalProvision}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenDirectiveModal(problem)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Issue Section 38 Statutory Directive
                      </button>

                      {problem.category === 'Financial Mismanagement & UIFW' && (
                        <button
                          onClick={() => onNavigateTab('financials')}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5 text-blue-700" />
                          Inspect Financial Reconciliation
                        </button>
                      )}

                      {problem.category === 'Late Statutory Submissions' && (
                        <button
                          onClick={() => onNavigateTab('documents')}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-700" />
                          Review Pending Submissions
                        </button>
                      )}

                      {problem.category === 'Recurring AGSA Audit Findings' && (
                        <button
                          onClick={() => onNavigateTab('audits')}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5 text-blue-700" />
                          Track Material Irregularities
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredProblems.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 space-y-2 shadow-xs">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-base font-bold text-slate-800">No Matching Statement Problems Found</div>
            <p className="text-xs">Adjust your search parameters to view other statutory challenges.</p>
          </div>
        )}
      </div>

      {/* Section 38 Statutory Directive Dispatch Modal */}
      {directiveModalProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Issue Formal Section 38 Statutory Directive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Republic of South Africa • PFMA Act 1 of 1999 Section 38(1)(j)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDirectiveModalProblem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDirectiveSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900">Statutory Directive Dispatched Successfully</h4>
                <p className="text-xs text-slate-600">
                  Logged in official PERS audit ledger. Notification dispatched to Accounting Authority and Auditor-General.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Problem Code & Statutory Defect:
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-blue-900 font-mono font-bold">
                    {directiveModalProblem.code} - {directiveModalProblem.title}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Target Accounting Authority / Public Entity:
                  </label>
                  <select
                    value={selectedDirectiveEntity}
                    onChange={e => setSelectedDirectiveEntity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-blue-600"
                  >
                    {directiveModalProblem.affectedEntityNames.map((name, i) => (
                      <option key={i} value={name}>{name}</option>
                    ))}
                    <option value="All 26 Public Entities">All 26 Public Entities (DSAC Wide Directive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Legal Directive Wording & Remediation Demands:
                  </label>
                  <textarea
                    rows={4}
                    value={directiveNotes}
                    onChange={e => setDirectiveNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 focus:outline-none focus:border-blue-600 font-mono text-[11px]"
                  ></textarea>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-rose-800 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Legal Notice:</strong> This directive constitutes a formal administrative action under PFMA Section 38. Failure to comply within 7 days empowers the Director-General to withhold grant disbursements.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDirectiveModalProblem(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDirective}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Directive & Notify Authority
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
