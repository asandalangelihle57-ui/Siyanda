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
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Top Search & Options Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search problems, legal provisions (e.g. PFMA 51, 53), entities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Critical Risk">Critical Risk</option>
            <option value="Action Required">Action Required</option>
            <option value="Under Remediation">Under Remediation</option>
            <option value="Compliant">Compliant</option>
          </select>

          {(searchQuery || selectedSeverity !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('All');
                setSelectedStatus('All');
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportProblemDossier}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow cursor-pointer"
            title="Download official Parliamentary Problem Statement Register"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Statutory Register (CSV)</span>
          </button>

          <button
            onClick={() => onNavigateTab('audits')}
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>View AGSA Audit Findings</span>
          </button>
        </div>
      </div>

      {/* Problem Cards List */}
      <div className="space-y-4">
        {filteredProblems.map(problem => {
          const isExpanded = activeProblemId === problem.id;
          const isCritical = problem.severity === 'Critical';

          return (
            <div 
              key={problem.id}
              className={`bg-slate-900 border rounded-xl transition-all shadow-md overflow-hidden ${
                isCritical 
                  ? 'border-rose-900/50 hover:border-rose-500/60' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Bar */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-slate-800 text-amber-300 font-mono text-xs px-2 py-0.5 rounded font-bold border border-slate-700">
                      {problem.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                      problem.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      problem.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    }`}>
                      {problem.severity} Severity
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                      problem.status === 'Critical Risk' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                      problem.status === 'Action Required' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                      problem.status === 'Under Remediation' ? 'bg-sky-950 text-sky-300 border-sky-700' :
                      'bg-emerald-950 text-emerald-300 border-emerald-700'
                    }`}>
                      {problem.status}
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                      {problem.legalProvision}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {problem.title}
                  </h3>
                </div>

                {/* Progress & Quick Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Remediation</div>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {problem.remediationProgress}%
                    </div>
                  </div>

                  <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        problem.remediationProgress >= 80 ? 'bg-emerald-500' :
                        problem.remediationProgress >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ width: `${problem.remediationProgress}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => setActiveProblemId(isExpanded ? null : problem.id)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {isExpanded ? 'Hide Details' : 'Resolve & Inspect'}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Verbatim Statement Extract Box */}
              <div className="px-4 sm:px-5 py-3 bg-slate-950/80 border-t border-b border-slate-800/80">
                <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Verbatim Statement Description:
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-amber-500/60 pl-3 leading-relaxed">
                  "{problem.verbatimStatement}"
                </blockquote>
              </div>

              {/* Summary Stats Row */}
              <div className="px-4 sm:px-5 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-900">
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Risk Exposure:</span>
                  <span className="text-rose-300 font-medium">{problem.primaryRisk}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Empirical Data Finding:</span>
                  <span className="text-slate-200 font-medium">{problem.impactSummary}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Affected Public Entities / Units:</span>
                  <span className="text-amber-300 font-medium">{problem.affectedEntityNames.join(', ')}</span>
                </div>
              </div>

              {/* Detailed Breakdown (When Expanded) */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 space-y-5 animate-fadeIn">
                  {/* Remediation Milestones Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        Corrective Action Plan (CAP) Remediation Milestones
                      </h4>
                      <span className="text-[11px] text-slate-400">
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
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300' 
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {step.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                              )}
                            </div>
                            <div>
                              <div className={`text-xs font-bold ${step.isCompleted ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                {step.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {step.notes}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                <span>Assigned Authority: <strong className="text-slate-300">{step.assignedAuthority}</strong></span>
                                <span>•</span>
                                <span>Target Due: <strong className="text-amber-300">{step.targetDate}</strong></span>
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            step.isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {step.isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Mitigations Live in PERS */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Active PERS Digital Mitigations & Safeguards
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {problem.directMitigations.map((mitigation, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                          <span>{mitigation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Impacted Entities Drilldown Buttons */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
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
                            className="bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 px-3 py-1.5 rounded-lg text-xs text-slate-200 flex items-center gap-2 transition-colors group"
                          >
                            <span className="font-bold text-white group-hover:text-amber-400">{ent.acronym}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              ent.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-300' :
                              ent.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              Risk: {ent.riskScore}/100
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400">
                      Last Statutory Review: <strong>{problem.lastReviewDate}</strong> • PFMA Provision: <strong className="text-slate-300">{problem.legalProvision}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenDirectiveModal(problem)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Issue Section 38 Statutory Directive
                      </button>

                      {problem.category === 'Financial Mismanagement & UIFW' && (
                        <button
                          onClick={() => onNavigateTab('financials')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          Inspect Financial Reconciliation
                        </button>
                      )}

                      {problem.category === 'Late Statutory Submissions' && (
                        <button
                          onClick={() => onNavigateTab('documents')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                          Review Pending Submissions
                        </button>
                      )}

                      {problem.category === 'Recurring AGSA Audit Findings' && (
                        <button
                          onClick={() => onNavigateTab('audits')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Scale className="w-3.5 h-3.5 text-sky-400" />
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="text-base font-bold text-white">No Matching Statement Problems Found</div>
            <p className="text-xs">Adjust your search or filter parameters to view other statutory challenges.</p>
          </div>
        )}
      </div>

      {/* Section 38 Statutory Directive Dispatch Modal */}
      {directiveModalProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-500/80 rounded-xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Issue Formal Section 38 Statutory Directive
                  </h3>
                  <p className="text-xs text-slate-400">
                    Republic of South Africa • PFMA Act 1 of 1999 Section 38(1)(j)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDirectiveModalProblem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDirectiveSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Statutory Directive Dispatched Successfully</h4>
                <p className="text-xs text-slate-300">
                  Logged in official PERS audit ledger. Notification dispatched to Accounting Authority and Auditor-General.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Problem Code & Statutory Defect:
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-300 font-mono">
                    {directiveModalProblem.code} - {directiveModalProblem.title}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Accounting Authority / Public Entity:
                  </label>
                  <select
                    value={selectedDirectiveEntity}
                    onChange={e => setSelectedDirectiveEntity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none focus:border-rose-500"
                  >
                    {directiveModalProblem.affectedEntityNames.map((name, i) => (
                      <option key={i} value={name}>{name}</option>
                    ))}
                    <option value="All 26 Public Entities">All 26 Public Entities (DSAC Wide Directive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Legal Directive Wording & Remediation Demands:
                  </label>
                  <textarea
                    rows={4}
                    value={directiveNotes}
                    onChange={e => setDirectiveNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                  ></textarea>
                </div>

                <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg p-2.5 text-rose-300 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Legal Notice:</strong> This directive constitutes a formal administrative action under PFMA Section 38. Failure to comply within 7 days empowers the Director-General to withhold grant disbursements.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDirectiveModalProblem(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDirective}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow"
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
