import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Coins, 
  Calendar, 
  FileText, 
  Upload, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Table, 
  Eye, 
  Send, 
  FileUp, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  Check, 
  X,
  HelpCircle,
  FileCheck,
  ChevronDown,
  Scale,
  Lock
} from 'lucide-react';
import { 
  PublicEntity, 
  NPO, 
  FundingRequest, 
  AdminSchedule, 
  SubmittedFile, 
  User 
} from '../types';
import { calculateDeadlineRisk, formatZAR } from '../utils/scheduleUtils';
import { getEntityFinancialData } from '../data/persModuleData';
import { Chart, registerables } from 'chart.js';
import { ReportsAndFilesTab } from './clerk/ReportsAndFilesTab';
import { SchedulesAndFundingTab } from './clerk/SchedulesAndFundingTab';

Chart.register(...registerables);

interface EntityClerkDashboardProps {
  entities: PublicEntity[];
  npos: NPO[];
  currentUser: User;
  activeEntityId: number;
  activeIsNpo: boolean;
  onSelectEntity: (entityId: number, isNpo: boolean) => void;
  fundingRequests: FundingRequest[];
  onSubmitFundingRequest: (request: Omit<FundingRequest, 'id' | 'status' | 'submittedBy' | 'submittedDate'>) => void;
  onAppealFundingRequest?: (requestId: string, appealReason: string, docName: string, docSize: string) => void;
  schedules: AdminSchedule[];
  onAddSchedule: (schedule: Omit<AdminSchedule, 'id'>) => void;
  onUpdateSchedule: (id: string, updates: Partial<AdminSchedule>) => void;
  onSubmitScheduleFile: (scheduleId: string, file: File, notes: string) => void;
  submittedFiles: SubmittedFile[];
  onUploadGeneralFile: (file: File, notes: string, category: string) => void;
  activeSection?: 'schedules_and_funding' | 'reports_and_files';
}

export const EntityClerkDashboard: React.FC<EntityClerkDashboardProps> = ({
  entities,
  npos,
  currentUser,
  activeEntityId,
  activeIsNpo,
  onSelectEntity,
  fundingRequests,
  onSubmitFundingRequest,
  onAppealFundingRequest,
  schedules,
  onAddSchedule,
  onUpdateSchedule,
  onSubmitScheduleFile,
  submittedFiles,
  onUploadGeneralFile,
  activeSection
}) => {
  // Navigation sections within Entity Dashboard:
  // 1. schedules_and_funding: Funding Requests, Schedules & Deliverables
  // 2. reports_and_files: Reports, Submissions & File Repository
  const [currentSection, setCurrentSection] = useState<'schedules_and_funding' | 'reports_and_files'>(
    activeSection || 'schedules_and_funding'
  );

  useEffect(() => {
    if (activeSection) {
      setCurrentSection(activeSection);
    }
  }, [activeSection]);

  // Graph vs Table toggle for financial reports
  const [reportViewMode, setReportViewMode] = useState<'both' | 'graph' | 'table'>('both');

  // Modals state
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [selectedScheduleForFile, setSelectedScheduleForFile] = useState<AdminSchedule | null>(null);
  const [scheduleToEdit, setScheduleToEdit] = useState<AdminSchedule | null>(null);

  // New Funding Request form state
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestCategory, setNewRequestCategory] = useState<FundingRequest['category']>('Operational Tranche');
  const [newRequestAmount, setNewRequestAmount] = useState<number>(3500000);
  const [newRequestJustification, setNewRequestJustification] = useState('');
  const [newRequestDocName, setNewRequestDocName] = useState('Supporting_Budget_Motivation.pdf');

  // New Schedule form state
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleDescription, setNewScheduleDescription] = useState('');
  const [newScheduleDeadline, setNewScheduleDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  // File upload form state
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [mockFileObj, setMockFileObj] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Appeal Modal state
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [selectedRequestForAppeal, setSelectedRequestForAppeal] = useState<FundingRequest | null>(null);
  const [appealReasonInput, setAppealReasonInput] = useState('');
  const [appealDocName, setAppealDocName] = useState('Remediation_Audit_Evidence.pdf');
  const [appealDocSize, setAppealDocSize] = useState('2.8 MB');
  const [appealFileObj, setAppealFileObj] = useState<File | null>(null);
  const appealFileInputRef = useRef<HTMLInputElement | null>(null);

  // Chart refs
  const historyChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstances = useRef<{ [key: string]: Chart }>({});

  // Active organization details
  const activeOrg = activeIsNpo 
    ? npos.find(n => n.id === activeEntityId) || npos[0]
    : entities.find(e => e.id === activeEntityId) || entities[0];

  const orgName = activeOrg?.name || 'National Arts Council of South Africa';
  const orgAcronym = activeOrg?.acronym || 'NAC';

  // Filter requests, schedules, and files for this entity
  const orgRequests = fundingRequests.filter(
    r => r.entityId === activeEntityId && r.isNpo === activeIsNpo
  );
  const orgSchedules = schedules.filter(
    s => s.entityId === activeEntityId && s.isNpo === activeIsNpo
  );
  const orgFiles = submittedFiles.filter(
    f => f.entityId === activeEntityId && f.isNpo === activeIsNpo
  );

  // Financial calculations
  const financialData = getEntityFinancialData(activeEntityId, activeIsNpo, orgName);

  // Initialize/Update Charts
  useEffect(() => {
    if (currentSection !== 'reports_and_files' || reportViewMode === 'table') {
      return;
    }

    // Destroy existing
    if (chartInstances.current.history) {
      chartInstances.current.history.destroy();
    }
    if (chartInstances.current.category) {
      chartInstances.current.category.destroy();
    }

    // Cash flow / History Chart
    if (historyChartRef.current) {
      chartInstances.current.history = new Chart(historyChartRef.current, {
        type: 'bar',
        data: {
          labels: financialData.quarters.map(q => q.period),
          datasets: [
            {
              label: 'Allocated (R)',
              data: financialData.quarters.map(q => q.allocated),
              backgroundColor: '#94a3b8', // slate-400
              borderRadius: 4
            },
            {
              label: 'Disbursed / Received (R)',
              data: financialData.quarters.map(q => q.received),
              backgroundColor: '#059669', // emerald-600
              borderRadius: 4
            },
            {
              label: 'Actual Spent (R)',
              data: financialData.quarters.map(q => q.spent),
              backgroundColor: '#d97706', // amber-600
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${formatZAR(ctx.parsed.y ?? 0)}`
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: (val) => `R ${(Number(val) / 1000000).toFixed(1)}M`
              }
            }
          }
        }
      });
    }

    // Categorical Breakdown Doughnut Chart
    if (categoryChartRef.current) {
      chartInstances.current.category = new Chart(categoryChartRef.current, {
        type: 'doughnut',
        data: {
          labels: financialData.breakdownCategories.map(c => c.category),
          datasets: [
            {
              data: financialData.breakdownCategories.map(c => c.amount),
              backgroundColor: ['#059669', '#2563eb', '#d97706', '#dc2626', '#64748b'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 10 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${formatZAR(ctx.parsed)}`
              }
            }
          },
          cutout: '62%'
        }
      });
    }

    return () => {
      if (chartInstances.current.history) chartInstances.current.history.destroy();
      if (chartInstances.current.category) chartInstances.current.category.destroy();
    };
  }, [currentSection, reportViewMode, activeEntityId, activeIsNpo]);

  // Handle funding form submission
  const handleFundingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestTitle.trim() || newRequestAmount <= 0) return;

    onSubmitFundingRequest({
      entityId: activeEntityId,
      entityName: orgName,
      isNpo: activeIsNpo,
      title: newRequestTitle,
      category: newRequestCategory,
      amountRequested: Number(newRequestAmount),
      justification: newRequestJustification,
      supportingDocumentName: newRequestDocName,
      supportingDocumentSize: '3.2 MB'
    });

    setNewRequestTitle('');
    setNewRequestJustification('');
    setShowFundingModal(false);
  };

  // Handle schedule creation
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim() || !newScheduleDeadline) return;

    onAddSchedule({
      entityId: activeEntityId,
      entityName: orgName,
      isNpo: activeIsNpo,
      title: newScheduleTitle,
      description: newScheduleDescription,
      deadlineDate: newScheduleDeadline,
      status: 'Pending',
      submittedBy: currentUser.fullName
    });

    setNewScheduleTitle('');
    setNewScheduleDescription('');
    setShowAddScheduleModal(false);
  };

  // Handle local file picking
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setMockFileObj(file);
    }
  };

  // Submit file
  const handleFileUploadConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const fakeFile = mockFileObj || new File(['mock content'], selectedFileName || 'Statutory_Schedule_Evidence.pdf', { type: 'application/pdf' });
    
    if (selectedScheduleForFile) {
      onSubmitScheduleFile(selectedScheduleForFile.id, fakeFile, uploadNotes);
    } else {
      onUploadGeneralFile(fakeFile, uploadNotes, 'Statutory Submission');
    }

    setShowFileUploadModal(false);
    setSelectedScheduleForFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setUploadNotes('');
    setMockFileObj(null);
  };

  // Handle Appeal Form Submission
  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForAppeal || !appealReasonInput.trim()) return;

    if (onAppealFundingRequest) {
      onAppealFundingRequest(
        selectedRequestForAppeal.id,
        appealReasonInput,
        appealDocName || 'Remediation_Audit_Evidence.pdf',
        appealDocSize || '2.8 MB'
      );
    }

    setShowAppealModal(false);
    setSelectedRequestForAppeal(null);
    setAppealReasonInput('');
  };

  const handleAppealFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAppealDocName(file.name);
      setAppealDocSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setAppealFileObj(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Entity / Admin Clerk Workspace Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {orgAcronym.slice(0, 4)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{orgName}</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                activeIsNpo 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                {activeIsNpo ? 'Non-Profit Organisation (NPO)' : 'Public Entity (PFMA Schedule 3)'}
              </span>
              {activeOrg?.isFrozen && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
                  <Lock className="w-3 h-3 text-rose-600" />
                  ACCOUNT FROZEN UNDER REVIEW
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Admin Clerk Portal: Statutory reporting, funding requests, financial tracking, and schedule compliance
            </p>
          </div>
        </div>

        {/* Assigned Organization Indicator - strictly locked to worker's organization */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Building2 className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Assigned Institution
            </div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="truncate max-w-xs">{orgName}</span>
              {activeOrg?.acronym && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 shrink-0">
                  {activeOrg.acronym}
                </span>
              )}
              {activeOrg?.isFrozen && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300 flex items-center gap-1 shrink-0">
                  <Lock className="w-3 h-3 text-rose-600" />
                  ACCOUNT FROZEN
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Freeze Statutory Alert Banner */}
      {activeOrg?.isFrozen && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-rose-600 text-white rounded-xl shadow shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-700 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                  EXECUTIVE ACCOUNT FREEZE IN EFFECT
                </span>
                <span className="text-xs text-rose-900 font-bold">
                  PFMA Section 51 Intervention Directive
                </span>
              </div>
              <h3 className="text-sm font-bold text-rose-950 mt-1">
                {activeOrg.name} is currently frozen by DSAC Executive Management
              </h3>
              <p className="text-xs text-rose-900 mt-1 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-rose-200">
                <strong>Grounds for Freeze / Serious Allegations:</strong> {activeOrg.freezeReason || 'Under official investigation for financial non-compliance or governance breakdown.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-rose-800 mt-2 font-medium">
                <span>Frozen By: <strong>{activeOrg.frozenBy || 'Dr. Zanele Buthelezi (Executive Director)'}</strong></span>
                <span>Date Imposed: <strong>{activeOrg.frozenAt || '2026-02-14'}</strong></span>
                <span className="text-rose-950 font-bold underline">• New funding allocations & bank dispatches are suspended</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const rejectedReq = orgRequests.find(r => r.status === 'Rejected');
              setSelectedRequestForAppeal(rejectedReq || orgRequests[0] || null);
              setAppealReasonInput('');
              setShowAppealModal(true);
            }}
            className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow shrink-0 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-amber-300" />
            <span>Appeal Review & Submit Evidence</span>
          </button>
        </div>
      )}

      {/* Entity Section Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
        <button
          onClick={() => setCurrentSection('schedules_and_funding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            currentSection === 'schedules_and_funding'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Funding Requests, Schedules & Deliverables</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
            Joint Module
          </span>
        </button>

        <button
          onClick={() => setCurrentSection('reports_and_files')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            currentSection === 'reports_and_files'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Reports, Submissions & File Repository</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            PoE Repo
          </span>
        </button>
      </div>

      {/* 1. JOINT MODULE: FUNDING REQUESTS, SCHEDULES & DELIVERABLES */}
      {currentSection === 'schedules_and_funding' && (
        <SchedulesAndFundingTab
          orgSchedules={orgSchedules}
          orgRequests={orgRequests}
          orgName={orgName}
          orgAcronym={orgAcronym}
          onAddScheduleClick={() => setShowAddScheduleModal(true)}
          onUpdateScheduleClick={(sch) => setScheduleToEdit(sch)}
          onSubmitScheduleFileClick={(sch) => {
            setSelectedScheduleForFile(sch);
            setShowFileUploadModal(true);
          }}
          onNewFundingRequestClick={() => setShowFundingModal(true)}
          onAppealClick={(req) => {
            setSelectedRequestForAppeal(req);
            setAppealReasonInput('');
            setShowAppealModal(true);
          }}
        />
      )}

      {/* 2. POE REPO: REPORTS, SUBMISSIONS & FILE REPOSITORY */}
      {currentSection === 'reports_and_files' && (
        <ReportsAndFilesTab
          financialData={financialData}
          reportViewMode={reportViewMode}
          setReportViewMode={setReportViewMode}
          historyChartRef={historyChartRef}
          categoryChartRef={categoryChartRef}
          orgFiles={orgFiles}
          orgName={orgName}
          onUploadFileClick={() => {
            setSelectedScheduleForFile(null);
            setShowFileUploadModal(true);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: SUBMIT FUNDING REQUEST */}
      {/* ========================================================= */}
      {showFundingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Submit New Funding Request</h3>
              </div>
              <button
                onClick={() => setShowFundingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFundingSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-semibold block text-[11px]">Requesting Entity / NPO:</span>
                <span className="font-bold text-slate-900 text-sm">{orgName} ({orgAcronym})</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Funding Request Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Operational Grant Tranche & Arts Incubation"
                  value={newRequestTitle}
                  onChange={(e) => setNewRequestTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newRequestCategory}
                    onChange={(e) => setNewRequestCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Operational Tranche">Operational Tranche</option>
                    <option value="Project Grant">Project Grant</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Capacity Building">Capacity Building</option>
                    <option value="Capital Works">Capital Works</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount (ZAR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="50000"
                    value={newRequestAmount}
                    onChange={(e) => setNewRequestAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Formatted: {formatZAR(newRequestAmount)}</div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Justification & Statutory Motivation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe program objectives, beneficiaries, and compliance with statutory mandates..."
                  value={newRequestJustification}
                  onChange={(e) => setNewRequestJustification(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supporting Budget Document</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRequestDocName}
                    onChange={(e) => setNewRequestDocName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFundingModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Management</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / UPLOAD SCHEDULE */}
      {/* ========================================================= */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add Schedule Milestone</h3>
              </div>
              <button
                onClick={() => setShowAddScheduleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deliverable Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Performance Report & Audit Reconciliation"
                  value={newScheduleTitle}
                  onChange={(e) => setNewScheduleTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Statutory Scope</label>
                <textarea
                  rows={2}
                  placeholder="Details of evidence required for submission..."
                  value={newScheduleDescription}
                  onChange={(e) => setNewScheduleDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Deadline Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newScheduleDeadline}
                  onChange={(e) => setNewScheduleDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                  Risk calculation: Passed date or ≤3 days = <strong>High Risk</strong>; ≤15 days = <strong>Medium Risk</strong>; ≤30 days = <strong>Low Risk</strong>.
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Save Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUBMIT FILE (SCHEDULE EVIDENCE OR GENERAL SUBMISSION) */}
      {/* ========================================================= */}
      {showFileUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm">
                  {selectedScheduleForFile ? `Submit File for: ${selectedScheduleForFile.title}` : 'Submit Statutory Schedule File'}
                </h3>
              </div>
              <button
                onClick={() => setShowFileUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUploadConfirm} className="p-6 space-y-4 text-xs">
              {/* Drag & Drop / File Select Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-6 text-center bg-slate-50 hover:bg-emerald-50/40 cursor-pointer transition-colors"
              >
                <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="font-bold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Click to select or drag & drop evidence file'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {selectedFileSize ? `File size: ${selectedFileSize}` : 'Supported: PDF, XLSX, DOCX, CSV (Max 25MB)'}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Or manual file name input if preferred */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NAC_Q3_Bank_Statements_Reconciled.pdf"
                  value={selectedFileName}
                  onChange={(e) => setSelectedFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Clerk Submission Declaration</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes for the reviewing manager (e.g. signed by CFO on 15 Jan)..."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFileUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFileName.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Submit to DSAC</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: UPDATE SCHEDULE */}
      {/* ========================================================= */}
      {scheduleToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Update Schedule Deliverable</h3>
              </div>
              <button
                onClick={() => setScheduleToEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deliverable Title</label>
                <input
                  type="text"
                  value={scheduleToEdit.title}
                  onChange={(e) => setScheduleToEdit({ ...scheduleToEdit, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Deadline Date</label>
                <input
                  type="date"
                  value={scheduleToEdit.deadlineDate.slice(0, 10)}
                  onChange={(e) => setScheduleToEdit({ ...scheduleToEdit, deadlineDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deliverable Status</label>
                <select
                  value={scheduleToEdit.status}
                  onChange={(e) => setScheduleToEdit({ ...scheduleToEdit, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Extension Granted">Extension Granted</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setScheduleToEdit(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSchedule(scheduleToEdit.id, {
                      title: scheduleToEdit.title,
                      deadlineDate: scheduleToEdit.deadlineDate,
                      status: scheduleToEdit.status,
                      lastUpdatedBy: currentUser.fullName,
                      lastUpdatedAt: new Date().toISOString().slice(0, 16)
                    });
                    setScheduleToEdit(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: APPEAL REVIEW & ATTACH SUPPORTING DOCUMENTS */}
      {/* ========================================================= */}
      {showAppealModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Statutory Review Appeal Submission</h3>
                  <p className="text-[11px] text-slate-300">
                    {selectedRequestForAppeal ? selectedRequestForAppeal.id : 'Institutional Review'} • {orgName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAppealModal(false);
                  setSelectedRequestForAppeal(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAppealSubmit} className="p-6 space-y-4 text-xs">
              {selectedRequestForAppeal && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Item Under Appeal</span>
                      <strong className="text-slate-900 text-xs">{selectedRequestForAppeal.title}</strong>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {formatZAR(selectedRequestForAppeal.amountRequested)}
                    </span>
                  </div>

                  {selectedRequestForAppeal.rejectionReason && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px] leading-relaxed">
                      <strong className="font-bold block text-rose-950 mb-0.5">Manager Reason for Rejection:</strong>
                      {selectedRequestForAppeal.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Grounds for Appeal & Corrective Remediation Taken *
                </label>
                <textarea
                  required
                  rows={4}
                  value={appealReasonInput}
                  onChange={(e) => setAppealReasonInput(e.target.value)}
                  placeholder="Detail how audit disclaimer or PFMA non-compliance has been addressed. Cite verified council approvals, external auditor sign-offs, or remedial procurement plans..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Attach Supporting Documents (PoE / Statutory Clearance) *
                </label>
                <div 
                  onClick={() => appealFileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                  <div className="font-bold text-slate-800 text-xs">
                    {appealDocName || 'Click or drag & drop supporting document'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload revised audited accounts, council resolutions, or competitive quote tenders (PDF, DOCX, XLSX)
                  </p>
                  {appealDocSize && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      Document Attached: {appealDocName} ({appealDocSize})
                    </span>
                  )}
                  <input
                    ref={appealFileInputRef}
                    type="file"
                    onChange={handleAppealFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAppealModal(false);
                    setSelectedRequestForAppeal(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!appealReasonInput.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-300" />
                  <span>Submit Formal Appeal to Management</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
