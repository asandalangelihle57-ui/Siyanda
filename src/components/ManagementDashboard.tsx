import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Coins, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  Search, 
  Filter, 
  Eye, 
  FileSpreadsheet, 
  Check, 
  X, 
  Download, 
  Building2, 
  Send,
  Building,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  Lock,
  Unlock,
  Scale
} from 'lucide-react';
import { 
  PublicEntity, 
  NPO, 
  FundingRequest, 
  AdminSchedule, 
  PaymentRecord, 
  SubmittedFile, 
  User 
} from '../types';
import { calculateDeadlineRisk, formatZAR } from '../utils/scheduleUtils';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ManagementDashboardProps {
  entities: PublicEntity[];
  npos: NPO[];
  currentUser: User;
  fundingRequests: FundingRequest[];
  onApproveFundingRequest: (requestId: string) => void;
  onRejectFundingRequest: (requestId: string, reason: string) => void;
  onReviewAppeal?: (requestId: string, approved: boolean, note: string) => void;
  onMakePayment: (requestId: string, paymentDetails: { amount: number; paymentMethod: string; bankAccount: string }) => void;
  paymentRecords: PaymentRecord[];
  schedules: AdminSchedule[];
  onUpdateScheduleByManager: (id: string, updates: Partial<AdminSchedule>) => void;
  submittedFiles: SubmittedFile[];
  onSelectEntityForView?: (entityId: number, isNpo: boolean) => void;
  onFreezeEntity?: (entityId: number, isNpo: boolean, reason: string) => void;
  onUnfreezeEntity?: (entityId: number, isNpo: boolean, notes: string) => void;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  entities,
  npos,
  currentUser,
  fundingRequests,
  onApproveFundingRequest,
  onRejectFundingRequest,
  onReviewAppeal,
  onMakePayment,
  paymentRecords,
  schedules,
  onUpdateScheduleByManager,
  submittedFiles,
  onSelectEntityForView,
  onFreezeEntity,
  onUnfreezeEntity
}) => {
  // Navigation tabs for management requirements
  type ManagementTab = 
    | 'funding_reviews' // 1. Funding Approvals, Appeals & Expenditure Audit
    | 'files_access'    // 2. Access files submitted by admin
    | 'make_payments'   // 3. Make payments after approved
    | 'payment_history' // 4. View historical data & payment history (audit) + graph
    | 'schedules_risk'; // 5. View admin schedules with High/Med/Low risk & update

  const [activeTab, setActiveTab] = useState<ManagementTab>('funding_reviews');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<'All' | 'Entities' | 'NPOs'>('All');
  const [fundingStatusFilter, setFundingStatusFilter] = useState<'All' | 'Pending Review' | 'Under Appeal' | 'Approved' | 'Rejected' | 'Paid'>('All');
  const [fundingCategoryFilter, setFundingCategoryFilter] = useState<string>('All');
  const [showExpenditureTable, setShowExpenditureTable] = useState(false);
  const [scheduleRiskFilter, setScheduleRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [accountStatusFilter, setAccountStatusFilter] = useState<'All' | 'Active' | 'Frozen'>('All');

  // Financial breakdown values for Funding & Review Limit Action
  const totalStatutoryAllocation = entities.reduce((acc, e) => acc + (e.budgetAllocated || 0), 0);
  const totalFundingRequested = fundingRequests.reduce((acc, r) => acc + r.amountRequested, 0);
  const totalFundingDisbursed = paymentRecords.reduce((acc, p) => acc + p.amount, 0);
  const pendingRequestsTotalAmount = fundingRequests
    .filter(r => r.status === 'Pending Review')
    .reduce((acc, r) => acc + r.amountRequested, 0);

  // Modal States
  // Rejection modal
  const [requestToReject, setRequestToReject] = useState<FundingRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Appeal Review modal
  const [appealToReview, setAppealToReview] = useState<FundingRequest | null>(null);
  const [appealReviewDecision, setAppealReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [appealDecisionNote, setAppealDecisionNote] = useState('');

  // Freeze Entity modal
  const [entityToFreeze, setEntityToFreeze] = useState<{ id: number; name: string; isNpo: boolean } | null>(null);
  const [freezeReasonPreset, setFreezeReasonPreset] = useState('Under Ministerial Inquiry & Serious Allegations of Financial Mismanagement');
  const [freezeReasonDetails, setFreezeReasonDetails] = useState('');

  // Unfreeze Entity modal
  const [entityToUnfreeze, setEntityToUnfreeze] = useState<{ id: number; name: string; isNpo: boolean } | null>(null);
  const [unfreezeNotes, setUnfreezeNotes] = useState('');

  // Payment processing modal
  const [requestToPay, setRequestToPay] = useState<FundingRequest | null>(null);
  const [paymentMethodInput, setPaymentMethodInput] = useState('National Treasury BAS Transfer (EFT)');
  const [bankAccountInput, setBankAccountInput] = useState('Verified Treasury PMF Account •••• 9310');

  // Manager Schedule Update modal
  const [scheduleToUpdate, setScheduleToUpdate] = useState<AdminSchedule | null>(null);
  const [newDeadlineInput, setNewDeadlineInput] = useState('');
  const [newStatusInput, setNewStatusInput] = useState<AdminSchedule['status']>('Extension Granted');
  const [managerNoteInput, setManagerNoteInput] = useState('');

  // Chart References
  const paymentHistoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const expenditureChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstances = useRef<{ [key: string]: Chart }>({});

  // Summary counts
  const pendingRequestsCount = fundingRequests.filter(r => r.status === 'Pending Review').length;
  const underAppealRequestsCount = fundingRequests.filter(r => r.status === 'Under Appeal').length;
  const approvedAwaitingPaymentCount = fundingRequests.filter(r => r.status === 'Approved').length;
  const frozenEntitiesCount = entities.filter(e => e.isFrozen).length + npos.filter(n => n.isFrozen).length;
  
  // Calculate total schedule risks across all 26 entities and 6 NPOs
  const highRiskSchedulesCount = schedules.filter(s => calculateDeadlineRisk(s.deadlineDate).riskLevel === 'High').length;
  const mediumRiskSchedulesCount = schedules.filter(s => calculateDeadlineRisk(s.deadlineDate).riskLevel === 'Medium').length;
  const lowRiskSchedulesCount = schedules.filter(s => calculateDeadlineRisk(s.deadlineDate).riskLevel === 'Low').length;

  // Initialize/Update Charts
  useEffect(() => {
    // Payment History Chart
    if (activeTab === 'payment_history') {
      if (chartInstances.current.payments) {
        chartInstances.current.payments.destroy();
      }

      if (paymentHistoryChartRef.current) {
        // Prepare top organizations by disbursement
        const paymentsByEntity: { [key: string]: number } = {};
        paymentRecords.forEach(p => {
          paymentsByEntity[p.entityName] = (paymentsByEntity[p.entityName] || 0) + p.amount;
        });

        const labels = Object.keys(paymentsByEntity).slice(0, 7);
        const data = labels.map(lbl => paymentsByEntity[lbl]);

        chartInstances.current.payments = new Chart(paymentHistoryChartRef.current, {
          type: 'bar',
          data: {
            labels: labels.map(l => l.length > 25 ? `${l.slice(0, 22)}...` : l),
            datasets: [
              {
                label: 'Total Historical Disbursements (R)',
                data: data,
                backgroundColor: '#059669', // emerald-600
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` Disbursed: ${formatZAR(ctx.parsed.y ?? 0)}`
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
    }

    // Expenditure Audit Chart (Joined with Funding Approvals & Reviews)
    if (activeTab === 'funding_reviews') {
      if (chartInstances.current.expenditures) {
        chartInstances.current.expenditures.destroy();
      }

      if (expenditureChartRef.current) {
        // Compare top entities budget allocated vs spent
        const topEntities = entities.slice(0, 8);
        chartInstances.current.expenditures = new Chart(expenditureChartRef.current, {
          type: 'bar',
          data: {
            labels: topEntities.map(e => e.acronym || e.name.slice(0, 15)),
            datasets: [
              {
                label: 'Allocated Budget (R)',
                data: topEntities.map(e => e.budgetAllocated),
                backgroundColor: '#94a3b8', // slate-400
                borderRadius: 4
              },
              {
                label: 'Actual Spent (R)',
                data: topEntities.map(e => e.budgetSpent),
                backgroundColor: '#2563eb', // blue-600
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
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
    }

    return () => {
      if (chartInstances.current.payments) chartInstances.current.payments.destroy();
      if (chartInstances.current.expenditures) chartInstances.current.expenditures.destroy();
    };
  }, [activeTab, paymentRecords, entities]);

  // Handle Reject Action
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestToReject || !rejectionReasonInput.trim()) return;

    onRejectFundingRequest(requestToReject.id, rejectionReasonInput.trim());
    setRequestToReject(null);
    setRejectionReasonInput('');
  };

  // Handle Payment Confirmation
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestToPay) return;

    onMakePayment(requestToPay.id, {
      amount: requestToPay.amountRequested,
      paymentMethod: paymentMethodInput,
      bankAccount: bankAccountInput
    });
    setRequestToPay(null);
  };

  // Handle Schedule Update by Manager
  const handleConfirmScheduleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleToUpdate) return;

    onUpdateScheduleByManager(scheduleToUpdate.id, {
      deadlineDate: newDeadlineInput || scheduleToUpdate.deadlineDate,
      status: newStatusInput,
      managerNote: managerNoteInput.trim() || undefined,
      lastUpdatedBy: currentUser.fullName,
      lastUpdatedAt: new Date().toISOString().slice(0, 16)
    });

    setScheduleToUpdate(null);
    setManagerNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Management Oversight Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            DSAC
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Executive Management Oversight Dashboard
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                26 Entities • 6 Funded NPOs
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Statutory verification, funding reviews, payment authorization, audit tracking, and schedule risk governance
            </p>
          </div>
        </div>

        {/* Executive Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {underAppealRequestsCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>{underAppealRequestsCount} Statutory Appeal{underAppealRequestsCount > 1 ? 's' : ''} Pending</span>
            </div>
          )}
          {pendingRequestsCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{pendingRequestsCount} Funding Request{pendingRequestsCount > 1 ? 's' : ''} to Review</span>
            </div>
          )}
          {approvedAwaitingPaymentCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>{approvedAwaitingPaymentCount} Ready for Payment</span>
            </div>
          )}
          {frozenEntitiesCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>{frozenEntitiesCount} Account{frozenEntitiesCount > 1 ? 's' : ''} Frozen Under Review</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Sub-Navigation for Management Dashboard */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 pb-2">
        <button
          onClick={() => setActiveTab('funding_reviews')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'funding_reviews'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>1. Funding Approvals, Appeals & Expenditure Audit</span>
          {pendingRequestsCount + underAppealRequestsCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
              {pendingRequestsCount + underAppealRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('files_access')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'files_access'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-sky-400" />
          <span>2. Submitted Files (Admin)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-mono">
            {submittedFiles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('make_payments')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'make_payments'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>3. Make Payments (Approved)</span>
          {approvedAwaitingPaymentCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold">
              {approvedAwaitingPaymentCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payment_history')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'payment_history'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>4. Payment History (Audit & Graph)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-mono">
            {paymentRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schedules_risk')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'schedules_risk'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-rose-400" />
          <span>5. Admin Schedules & Risk Updates</span>
          {highRiskSchedulesCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold">
              {highRiskSchedulesCount} High Risk
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. FUNDING APPROVALS, APPEALS & EXPENDITURE AUDIT                         */}
      {/* ========================================================================= */}
      {activeTab === 'funding_reviews' && (
        <div className="space-y-6">
          {/* Statutory Funding & Review Limits Simple Breakdown */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Funding & Review Limit Action: Statutory Baseline Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time statutory allocation oversight, funds requested, disbursements, and pending reviews
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 w-fit">
                PFMA Section 38 Compliance
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Statutory Allocation</span>
                <span className="text-base font-extrabold font-mono text-slate-900 block mt-0.5">{formatZAR(totalStatutoryAllocation)}</span>
                <span className="text-[10px] text-slate-500">32 Entities & NPOs</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Total Requested</span>
                <span className="text-base font-extrabold font-mono text-slate-900 block mt-0.5">{formatZAR(totalFundingRequested)}</span>
                <span className="text-[10px] text-slate-500">{fundingRequests.length} Formal Requests</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">Approved / Disbursed</span>
                <span className="text-base font-extrabold font-mono text-emerald-700 block mt-0.5">{formatZAR(totalFundingDisbursed)}</span>
                <span className="text-[10px] text-emerald-700">{paymentRecords.length} BAS Transfers</span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="text-[10px] font-bold text-amber-800 uppercase block tracking-wider">Pending Review</span>
                <span className="text-base font-extrabold font-mono text-amber-800 block mt-0.5">{pendingRequestsCount} ({formatZAR(pendingRequestsTotalAmount)})</span>
                <span className="text-[10px] text-amber-700">Awaiting Manager Ruling</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-600 uppercase block tracking-wider">Under Formal Appeal</span>
                <span className="text-base font-extrabold font-mono text-slate-900 block mt-0.5">{underAppealRequestsCount}</span>
                <span className="text-[10px] text-slate-500">Submissions Under Review</span>
              </div>
            </div>
          </div>

          {/* Joined Expenditure Audit Section */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Expenditure Audit: Budget Allocated vs Actual Spent
                </h3>
                <p className="text-xs text-slate-500">
                  PFMA statutory spending compliance and institution burn rate comparison
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-200">
                  Auditor-General Benchmarked
                </span>
                <button
                  type="button"
                  onClick={() => setShowExpenditureTable(!showExpenditureTable)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition-colors cursor-pointer"
                >
                  {showExpenditureTable ? 'Hide Entity Table' : 'Show Entity Table'}
                </button>
              </div>
            </div>

            {/* Expenditure Chart */}
            <div className="h-60 sm:h-64">
              <canvas ref={expenditureChartRef}></canvas>
            </div>

            {/* Comprehensive Table Toggle */}
            {showExpenditureTable && (
              <div className="pt-3 border-t border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Organisation</th>
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3">Budget Allocated</th>
                      <th className="py-2.5 px-3">Actual Spent</th>
                      <th className="py-2.5 px-3">Remaining</th>
                      <th className="py-2.5 px-3">Utilisation %</th>
                      <th className="py-2.5 px-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {entities.map((e, idx) => {
                      const remaining = e.budgetAllocated - e.budgetSpent;
                      const utilPct = Math.round((e.budgetSpent / e.budgetAllocated) * 100);
                      return (
                        <tr key={`ent-${e.id}`} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <div className="font-bold text-slate-900">{e.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{e.acronym} • {e.province}</div>
                          </td>
                          <td className="py-2 px-3 text-slate-700">{e.category}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{formatZAR(e.budgetAllocated)}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{formatZAR(e.budgetSpent)}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-700">{formatZAR(remaining)}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{utilPct}%</span>
                              <div className="w-14 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${utilPct > 80 ? 'bg-emerald-600' : 'bg-amber-500'}`} 
                                  style={{ width: `${Math.min(utilPct, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              e.riskLevel === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : e.riskLevel === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {e.riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Funding Requests Review & Approvals Register with Integrated Filters */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review Entity & NPO Funding Requests</h3>
                <p className="text-xs text-slate-600">
                  Review statutory allocations, grant tranches, and project proposals. Approve to queue for payment, or reject with a formal reason.
                </p>
              </div>
            </div>

            {/* Filter Toolbar for Requests */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by request title, entity name, or Req ID..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Status:</label>
                <select
                  value={fundingStatusFilter}
                  onChange={(e) => setFundingStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium"
                >
                  <option value="All">All Statuses ({fundingRequests.length})</option>
                  <option value="Pending Review">Pending Review ({pendingRequestsCount})</option>
                  <option value="Under Appeal">Under Appeal ({underAppealRequestsCount})</option>
                  <option value="Approved">Approved (Ready for Payment)</option>
                  <option value="Paid">Paid / Disbursed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Category:</label>
                <select
                  value={fundingCategoryFilter}
                  onChange={(e) => setFundingCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium"
                >
                  <option value="All">All Categories</option>
                  <option value="Operational Tranche">Operational Tranche</option>
                  <option value="Project Grant">Project Grant</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Capacity Building">Capacity Building</option>
                  <option value="Emergency Relief">Emergency Relief</option>
                </select>
              </div>

              {/* Org Type Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Org Type:</label>
                <select
                  value={selectedOrgFilter}
                  onChange={(e) => setSelectedOrgFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium"
                >
                  <option value="All">All Orgs</option>
                  <option value="Entities">Public Entities (26)</option>
                  <option value="NPOs">Funded NPOs (6)</option>
                </select>
              </div>

              {(searchTerm || fundingStatusFilter !== 'All' || fundingCategoryFilter !== 'All' || selectedOrgFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFundingStatusFilter('All');
                    setFundingCategoryFilter('All');
                    setSelectedOrgFilter('All');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Funding Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Req ID</th>
                    <th className="py-3 px-3">Entity / NPO Organisation</th>
                    <th className="py-3 px-3">Request Title & Justification</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Amount Requested</th>
                    <th className="py-3 px-3">Status & Audit Notes</th>
                    <th className="py-3 px-3 text-right">Manager Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fundingRequests
                    .filter(r => {
                      const matchesStatus = fundingStatusFilter === 'All' || r.status === fundingStatusFilter;
                      const matchesCategory = fundingCategoryFilter === 'All' || r.category === fundingCategoryFilter;
                      const matchesOrg = selectedOrgFilter === 'All' 
                        || (selectedOrgFilter === 'Entities' && !r.isNpo) 
                        || (selectedOrgFilter === 'NPOs' && r.isNpo);
                      const matchesSearch = !searchTerm.trim() 
                        || r.title.toLowerCase().includes(searchTerm.toLowerCase())
                        || r.entityName.toLowerCase().includes(searchTerm.toLowerCase())
                        || r.id.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesStatus && matchesCategory && matchesOrg && matchesSearch;
                    })
                  .map((req) => {
                    const isPending = req.status === 'Pending Review';
                    const isUnderAppeal = req.status === 'Under Appeal';
                    const isApproved = req.status === 'Approved';
                    const isPaid = req.status === 'Paid';
                    const isRejected = req.status === 'Rejected';
                    const isAppealApproved = req.status === 'Appeal Approved';
                    const isAppealRejected = req.status === 'Appeal Rejected';

                    const requestingOrg = req.isNpo 
                      ? npos.find(n => n.id === req.entityId)
                      : entities.find(e => e.id === req.entityId);
                    const isOrgFrozen = requestingOrg?.isFrozen;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{req.id}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{req.entityName}</span>
                            {isOrgFrozen && (
                              <span className="p-0.5 rounded bg-rose-100 text-rose-700" title="Institution Account is Frozen">
                                <Lock className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded ${
                              req.isNpo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {req.isNpo ? 'Funded NPO' : 'Public Entity'}
                            </span>
                            {isOrgFrozen && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                                FROZEN
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 max-w-xs">
                          <div className="font-bold text-slate-900">{req.title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{req.justification}</div>
                          {req.supportingDocumentName && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                              <FileText className="w-3 h-3 text-emerald-600" />
                              <span className="truncate max-w-[160px]">{req.supportingDocumentName}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-medium">
                            {req.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900 text-sm">
                          {formatZAR(req.amountRequested)}
                        </td>
                        <td className="py-3.5 px-3">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pending Review
                            </span>
                          )}
                          {isUnderAppeal && (
                            <div className="max-w-xs space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                <Scale className="w-3.5 h-3.5 text-amber-700" />
                                Under Formal Appeal
                              </span>
                              <div className="p-2 bg-amber-50/90 border border-amber-200 rounded text-[11px] text-amber-900">
                                <strong className="block text-amber-950">Appeal Grounds ({req.appealDate}):</strong>
                                <p className="line-clamp-2 mt-0.5">{req.appealReason}</p>
                                {req.appealSupportingDocName && (
                                  <div className="mt-1 pt-1 border-t border-amber-200 flex items-center gap-1 font-mono text-[10px] text-amber-800">
                                    <FileText className="w-3 h-3 text-amber-700 shrink-0" />
                                    <span className="truncate">{req.appealSupportingDocName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {isApproved && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                Approved (Awaiting Payment)
                              </span>
                              <div className="text-[10px] text-slate-500 mt-1">
                                Reviewed by {req.reviewedBy} on {req.reviewedDate}
                              </div>
                            </div>
                          )}
                          {isPaid && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Paid & Disbursed
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono mt-1">
                                Ref: {req.paymentRef}
                              </div>
                            </div>
                          )}
                          {isRejected && (
                            <div className="max-w-xs">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Rejected
                              </span>
                              {req.rejectionReason && (
                                <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-900">
                                  <strong>Reason:</strong> {req.rejectionReason}
                                </div>
                              )}
                            </div>
                          )}
                          {isAppealApproved && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Appeal Approved & Reinstated
                              </span>
                              {req.appealReviewNote && (
                                <div className="text-[10px] text-slate-500 mt-1">
                                  Ruling: {req.appealReviewNote}
                                </div>
                              )}
                            </div>
                          )}
                          {isAppealRejected && (
                            <div className="max-w-xs">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Appeal Rejected
                              </span>
                              {req.appealReviewNote && (
                                <div className="mt-1 p-1.5 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-900">
                                  Decision: {req.appealReviewNote}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          {isUnderAppeal ? (
                            <button
                              onClick={() => {
                                setAppealToReview(req);
                                setAppealReviewDecision('approve');
                                setAppealDecisionNote('');
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span>Review Appeal</span>
                            </button>
                          ) : isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Approve Button */}
                              <button
                                onClick={() => onApproveFundingRequest(req.id)}
                                disabled={isOrgFrozen}
                                className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 shadow-xs transition-colors ${
                                  isOrgFrozen
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                                }`}
                                title={isOrgFrozen ? 'Approval blocked: Account is currently frozen under review' : 'Approve funding request'}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              {/* Reject Button (opens reason modal) */}
                              <button
                                onClick={() => {
                                  setRequestToReject(req);
                                  setRejectionReasonInput('');
                                }}
                                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : isApproved ? (
                            <button
                              onClick={() => {
                                setRequestToPay(req);
                              }}
                              disabled={isOrgFrozen}
                              className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 shadow-xs transition-colors ${
                                isOrgFrozen
                                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                  : 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                              }`}
                              title={isOrgFrozen ? 'Payment disbursement blocked: Account is currently frozen under review' : 'Process payment to verified account'}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Process Payment</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Action completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ENTITY ACCOUNTS & FREEZE CONTROL (SERIOUS ALLEGATIONS / UNDER REVIEW)    */}
      {/* ========================================================================= */}
      {(activeTab as any) === 'freeze_control' && (
        <div className="space-y-4">
          {/* Statutory Authority Header Banner */}
          <div className="bg-white border border-rose-300 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-900 text-rose-300 flex items-center justify-center shrink-0 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Statutory Account Intervention & Freeze Control
                    </h3>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                      PFMA §51 & §54
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                    Under the Public Finance Management Act and DSAC Statutory Oversight Framework, Executive Management holds the authority to immediately freeze entity and NPO disbursement accounts when under forensic investigation, AGSA disclaimers, or serious allegations of financial irregularities.
                  </p>
                </div>
              </div>

              {/* Statistical Metrics */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Monitored</div>
                  <div className="font-extrabold text-base text-slate-900">32 Institutions</div>
                  <div className="text-[10px] text-slate-500">26 Entities • 6 NPOs</div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2 text-center">
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Active Accounts</div>
                  <div className="font-extrabold text-base text-emerald-800">
                    {32 - frozenEntitiesCount} Active
                  </div>
                  <div className="text-[10px] text-emerald-600">Statutory Clear</div>
                </div>

                <div className="bg-rose-50 border border-rose-300 rounded-lg px-3.5 py-2 text-center">
                  <div className="text-[10px] text-rose-700 font-semibold uppercase">Frozen Accounts</div>
                  <div className="font-extrabold text-base text-rose-800 flex items-center justify-center gap-1">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>{frozenEntitiesCount} Frozen</span>
                  </div>
                  <div className="text-[10px] text-rose-600 font-medium">Under Allegations</div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, acronym, province, or CEO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Type:</label>
                  <select
                    value={selectedOrgFilter}
                    onChange={(e) => setSelectedOrgFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-900 font-medium"
                  >
                    <option value="All">All 32 Institutions</option>
                    <option value="Entities">26 Public Entities Only</option>
                    <option value="NPOs">6 Funded NPOs Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Account State:</label>
                  <select
                    value={accountStatusFilter}
                    onChange={(e) => setAccountStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-900 font-medium"
                  >
                    <option value="All">All States (32)</option>
                    <option value="Active">Active Accounts Only ({32 - frozenEntitiesCount})</option>
                    <option value="Frozen">Frozen Under Review Only ({frozenEntitiesCount})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Institutions Table */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Code / ID</th>
                    <th className="py-3 px-3">Institution Name</th>
                    <th className="py-3 px-3">Type & Category</th>
                    <th className="py-3 px-3">Accounting Authority / CEO</th>
                    <th className="py-3 px-3">AGSA Audit Risk</th>
                    <th className="py-3 px-3">Account Status & Allegation Grounds</th>
                    <th className="py-3 px-3 text-right">Management Oversight Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Combine entities and npos into single list with uniform typing */}
                  {[
                    ...entities.map(e => ({ 
                      ...e, 
                      isNpo: false,
                      leaderCeo: e.ceoName || 'Accounting Authority',
                      leaderCfo: 'Chief Financial Officer',
                      risk: e.riskLevel || 'Medium',
                      score: e.complianceRate || 80,
                      categoryLabel: e.category as string,
                      yearEnd: '31 March'
                    })),
                    ...npos.map(n => ({ 
                      ...n, 
                      isNpo: true,
                      leaderCeo: n.directorName || 'NPO Director',
                      leaderCfo: 'Finance Committee',
                      risk: n.complianceStatus === 'At Risk' ? 'High' : 'Low',
                      score: n.complianceStatus === 'Compliant' ? 92 : 68,
                      categoryLabel: n.focusArea,
                      yearEnd: '31 March'
                    }))
                  ]
                    .filter(org => {
                      if (selectedOrgFilter === 'Entities' && org.isNpo) return false;
                      if (selectedOrgFilter === 'NPOs' && !org.isNpo) return false;
                      if (accountStatusFilter === 'Active' && org.isFrozen) return false;
                      if (accountStatusFilter === 'Frozen' && !org.isFrozen) return false;

                      if (searchTerm) {
                        const term = searchTerm.toLowerCase();
                        return (
                          org.name.toLowerCase().includes(term) ||
                          (org.acronym && org.acronym.toLowerCase().includes(term)) ||
                          (org.categoryLabel && org.categoryLabel.toLowerCase().includes(term)) ||
                          (org.province && org.province.toLowerCase().includes(term)) ||
                          (org.leaderCeo && org.leaderCeo.toLowerCase().includes(term))
                        );
                      }
                      return true;
                    })
                    .map((org) => {
                      const isFrozen = !!org.isFrozen;

                      return (
                        <tr 
                          key={`${org.isNpo ? 'npo' : 'entity'}-${org.id}`} 
                          className={`hover:bg-slate-50/80 ${isFrozen ? 'bg-rose-50/40' : ''}`}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                            {org.isNpo ? `NPO-${org.id}` : `ENT-${org.id}`}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{org.name}</span>
                              {org.acronym && (
                                <span className="font-mono text-[10px] text-slate-500">
                                  ({org.acronym})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{org.province} Province</span>
                              <span>•</span>
                              <span>Year Est: {org.yearEnd}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                              org.isNpo ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {org.isNpo ? 'Funded NPO (6 Total)' : 'Public Entity (26 Total)'}
                            </span>
                            <div className="text-[11px] text-slate-700 mt-1 font-medium">
                              {org.categoryLabel}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-900">
                              {org.leaderCeo}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              CFO: {org.leaderCfo}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              org.risk === 'High' 
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : org.risk === 'Medium'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {org.risk === 'High' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                              {org.risk} Audit Risk
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Compliance: {org.score}%
                            </div>
                          </td>

                          <td className="py-3.5 px-3 max-w-sm">
                            {isFrozen ? (
                              <div className="p-2.5 bg-rose-100/80 border border-rose-300 rounded-lg text-rose-950 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
                                  <Lock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                  <span>ACCOUNT FROZEN UNDER STATUTORY REVIEW</span>
                                </div>
                                <div className="text-[11px] leading-tight">
                                  <strong>Grounds:</strong> {org.freezeReason || 'Under forensic inquiry & ministerial investigation'}
                                </div>
                                <div className="text-[10px] text-rose-800 font-mono pt-0.5 border-t border-rose-200">
                                  Order by {org.frozenBy || 'DSAC Executive Management'} • {org.frozenAt || '2026-03-01'}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 w-fit">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Active Statutory Account (Normal Operations)</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {isFrozen ? (
                              <button
                                onClick={() => {
                                  setEntityToUnfreeze({ id: org.id, name: org.name, isNpo: org.isNpo });
                                  setUnfreezeNotes('');
                                }}
                                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto transition-colors"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Unfreeze / Restore</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEntityToFreeze({ id: org.id, name: org.name, isNpo: org.isNpo });
                                  setFreezeReasonPreset('Under Forensic Investigation / Serious Allegations of Financial Irregularities');
                                  setFreezeReasonDetails('');
                                }}
                                className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto transition-colors"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Freeze Account</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACCESS FILES SUBMITTED BY ADMIN CLERK                                  */}
      {/* ========================================================================= */}
      {activeTab === 'files_access' && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Statutory Documents & Files Submitted by Admins</h3>
              <p className="text-xs text-slate-600">
                Full repository of statutory reports, schedules, bank statements, and portfolios of evidence uploaded across all 26 entities and 6 NPOs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search file or entity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">File Name</th>
                  <th className="py-3 px-3">Submitted By Entity / NPO</th>
                  <th className="py-3 px-3">Associated Milestone / Schedule</th>
                  <th className="py-3 px-3">File Size</th>
                  <th className="py-3 px-3">Submission Timestamp</th>
                  <th className="py-3 px-3">Clerk / Official</th>
                  <th className="py-3 px-3">Integrity Checksum (SHA-256)</th>
                  <th className="py-3 px-3 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submittedFiles
                  .filter(f => 
                    !searchTerm || 
                    f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.entityName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">{file.fileName}</div>
                            {file.notes && <div className="text-[10px] text-slate-500 mt-0.5">{file.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{file.entityName}</div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          file.isNpo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {file.isNpo ? 'NPO' : 'Entity'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {file.scheduleTitle || 'Statutory Filing'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{file.fileSize}</td>
                      <td className="py-3 px-3 text-slate-600">{file.uploadedAt}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{file.uploadedBy}</td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                        {file.sha256Hash ? `${file.sha256Hash.slice(0, 16)}...` : 'Verified'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">
                          <Download className="w-3.5 h-3.5" />
                          <span>Download / Inspect</span>
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAKE PAYMENTS AFTER APPROVED                                           */}
      {/* ========================================================================= */}
      {activeTab === 'make_payments' && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">National Treasury Disbursement & Payment Processing</h3>
              <p className="text-xs text-slate-600">
                Direct statutory payments to verified entity accounts after review and approval.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-xs border border-emerald-300">
              {approvedAwaitingPaymentCount} Approved Ready for Transfer
            </span>
          </div>

          {approvedAwaitingPaymentCount === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">All Approved Requests Have Been Paid</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                There are currently no approved requests awaiting disbursement. Review pending requests to authorize new payments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundingRequests
                .filter(r => r.status === 'Approved')
                .map(req => (
                  <div key={req.id} className="p-4 border-2 border-emerald-500/40 rounded-xl bg-gradient-to-br from-white to-emerald-50/30 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-500">{req.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                          Approved by {req.reviewedBy}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{req.title}</h4>
                      <div className="text-xs font-semibold text-emerald-800 mt-0.5">{req.entityName}</div>
                      <p className="text-xs text-slate-600 mt-1">{req.justification}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Approved Tranche Amount:</div>
                        <div className="text-lg font-mono font-extrabold text-slate-900">{formatZAR(req.amountRequested)}</div>
                      </div>
                      <button
                        onClick={() => setRequestToPay(req)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Process Payment</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW HISTORICAL DATA AND PAYMENT HISTORY MADE TO ADMIN (AUDIT) + GRAPH  */}
      {/* ========================================================================= */}
      {activeTab === 'payment_history' && (
        <div className="space-y-6">
          {/* Payment History Graph Area */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Historical Payment Disbursements Audit Graph
                </h3>
                <p className="text-xs text-slate-500">Total statutory disbursements made to entity/NPO admins over the financial period</p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded border border-emerald-200">
                National Treasury PMF Batch Verified
              </span>
            </div>
            <div className="h-64 sm:h-72">
              <canvas ref={paymentHistoryChartRef}></canvas>
            </div>
          </div>

          {/* Payment History Audit Table */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">Statutory Payment Audit Register</h4>
                <p className="text-xs text-slate-600">
                  Full non-repudiation audit trail of electronic fund transfers made to entity/NPO bank accounts.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Total Disbursed: <strong className="font-mono text-emerald-700">
                  {formatZAR(paymentRecords.reduce((acc, p) => acc + p.amount, 0))}
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Payment Reference</th>
                    <th className="py-3 px-3">Beneficiary Organisation</th>
                    <th className="py-3 px-3">Disbursed Amount (ZAR)</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Disbursement Date</th>
                    <th className="py-3 px-3">Authorized By (Manager)</th>
                    <th className="py-3 px-3">Payment Method & Bank</th>
                    <th className="py-3 px-3">Treasury Batch No.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paymentRecords.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{pay.paymentRef}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{pay.entityName}</div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          pay.isNpo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {pay.isNpo ? 'NPO' : 'Public Entity'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-emerald-800 text-sm">
                        {formatZAR(pay.amount)}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{pay.category}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{pay.disbursedDate}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{pay.disbursedBy}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{pay.paymentMethod}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{pay.bankAccountMasked}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{pay.treasuryBatchNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* 6. VIEW ADMIN SCHEDULES & UPDATE (DEADLINE RISK CALCULATION)               */}
      {/* ========================================================================= */}
      {activeTab === 'schedules_risk' && (
        <div className="space-y-6">
          {/* Master Risk Overview Banner */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin Deliverables Master Schedule & Statutory Deadline Risk Engine
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Automated risk classification applied per ministerial directive:
                </p>
              </div>

              {/* Exact user requirement tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScheduleRiskFilter('All')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    scheduleRiskFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({schedules.length})
                </button>
                <button
                  onClick={() => setScheduleRiskFilter('High')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                    scheduleRiskFilter === 'High' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>High Risk: Passed / Hourly / ≤3 Days ({highRiskSchedulesCount})</span>
                </button>
                <button
                  onClick={() => setScheduleRiskFilter('Medium')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                    scheduleRiskFilter === 'Medium' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Medium Risk: ≤15 Days ({mediumRiskSchedulesCount})</span>
                </button>
                <button
                  onClick={() => setScheduleRiskFilter('Low')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                    scheduleRiskFilter === 'Low' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Low Risk: ≤30 Days ({lowRiskSchedulesCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Master Schedules Table */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Admin Deliverables Schedule Register
              </h4>
              <span className="text-xs text-slate-500">
                Managers can update deadlines, grant extensions, or add compliance warnings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Organisation</th>
                    <th className="py-3 px-3">Milestone Deliverable</th>
                    <th className="py-3 px-3">Deadline Date</th>
                    <th className="py-3 px-3">Risk Classification</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Attached File Evidence</th>
                    <th className="py-3 px-3">Manager Notes / Directives</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schedules
                    .filter(s => {
                      if (scheduleRiskFilter === 'All') return true;
                      const r = calculateDeadlineRisk(s.deadlineDate);
                      return r.riskLevel === scheduleRiskFilter;
                    })
                    .map((sch) => {
                      const risk = calculateDeadlineRisk(sch.deadlineDate);

                      return (
                        <tr key={sch.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-900">{sch.entityName}</div>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              sch.isNpo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {sch.isNpo ? 'NPO' : 'Public Entity'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 max-w-xs">
                            <div className="font-bold text-slate-900">{sch.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{sch.description}</div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-mono font-bold text-slate-900">{sch.deadlineDate}</div>
                            <div className="text-[11px] text-slate-500">
                              {risk.isPastDue ? 'Passed date' : `${risk.daysRemaining} days remaining`}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${risk.badgeClass}`}>
                              {risk.riskLevel === 'High' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                              {risk.riskLevel === 'Medium' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                              {risk.riskLevel === 'Low' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              <span>{risk.riskLabel}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              sch.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : sch.status === 'Submitted'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : sch.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}>
                              {sch.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            {sch.attachedFileName ? (
                              <div className="flex items-center gap-1.5 text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[11px]">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[120px]" title={sch.attachedFileName}>
                                  {sch.attachedFileName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No file attached</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 max-w-xs">
                            {sch.managerNote ? (
                              <div className="p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                                {sch.managerNote}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No manager notes</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setScheduleToUpdate(sch);
                                setNewDeadlineInput(sch.deadlineDate.slice(0, 10));
                                setNewStatusInput(sch.status);
                                setManagerNoteInput(sch.managerNote || '');
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer ml-auto"
                            >
                              <span>Update Schedule</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REJECT FUNDING REQUEST WITH REJECTION REASON       */}
      {/* ========================================================= */}
      {requestToReject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-sm">Reject Funding Request: {requestToReject.id}</h3>
              </div>
              <button
                onClick={() => setRequestToReject(null)}
                className="text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900">{requestToReject.title}</div>
                <div className="text-slate-600 mt-0.5">{requestToReject.entityName} • {formatZAR(requestToReject.amountRequested)}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Required Rejection Reason & Compliance Citation <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide explicit reasons for rejection (e.g., Section 38(1)(j) non-compliance, missing supporting proof of expenditure, unauthorized expenditure threshold exceeded)..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              {/* Quick Preset Reasons */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Insert Common Statutory Reason:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRejectionReasonInput('Section 38(1)(j) Non-Compliance: Missing previous quarter bank reconciliations and verified expenditure proof. Resubmit with signed CFO certification.')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700 cursor-pointer"
                  >
                    + Missing Bank Reconciliations
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectionReasonInput('Tranche Ceiling Exceeded: Requested amount exceeds the approved MTEF quarterly baseline allocation for this cycle.')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700 cursor-pointer"
                  >
                    + Tranche Ceiling Exceeded
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectionReasonInput('AGSA Material Audit Finding Unresolved: Entity has open repeat audit disclaimers under PFMA Section 51. Corrective action plan must be filed first.')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700 cursor-pointer"
                  >
                    + Repeat AGSA Finding
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRequestToReject(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectionReasonInput.trim()}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PROCESS PAYMENT / DISBURSEMENT                     */}
      {/* ========================================================= */}
      {requestToPay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Authorize Statutory Payment / Transfer</h3>
              </div>
              <button
                onClick={() => setRequestToPay(null)}
                className="text-emerald-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-[11px] uppercase font-bold text-emerald-800">Beneficiary Organisation:</div>
                <div className="font-extrabold text-slate-900 text-base">{requestToPay.entityName}</div>
                <div className="text-slate-600 mt-1">{requestToPay.title}</div>
                <div className="mt-2 text-xl font-mono font-black text-emerald-900">
                  {formatZAR(requestToPay.amountRequested)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Method</label>
                <select
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="National Treasury BAS Transfer (EFT)">National Treasury BAS Transfer (EFT)</option>
                  <option value="National Treasury Direct Credit (PMF)">National Treasury Direct Credit (PMF)</option>
                  <option value="Inter-Departmental Allocation Credit">Inter-Departmental Allocation Credit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Bank Account</label>
                <input
                  type="text"
                  value={bankAccountInput}
                  onChange={(e) => setBankAccountInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                <strong className="block text-slate-800">Treasury Verification:</strong>
                Payment will be assigned a unique PERS payment reference and committed to the government financial ledger.
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRequestToPay(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Authorize & Disburse Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: UPDATE SCHEDULE BY MANAGER                         */}
      {/* ========================================================= */}
      {scheduleToUpdate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Manage Schedule: {scheduleToUpdate.entityName}</h3>
              </div>
              <button
                onClick={() => setScheduleToUpdate(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmScheduleUpdate} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900">{scheduleToUpdate.title}</div>
                <div className="text-slate-600 mt-0.5">{scheduleToUpdate.description}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deadline Date (Update or Grant Extension)
                </label>
                <input
                  type="date"
                  value={newDeadlineInput}
                  onChange={(e) => setNewDeadlineInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Schedule Status</label>
                <select
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Extension Granted">Extension Granted</option>
                  <option value="Approved">Approved</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Overdue">Overdue / Non-Compliant</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manager Compliance Instruction</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 7-day statutory extension approved per DG memo. Resubmit with verified PoE..."
                  value={managerNoteInput}
                  onChange={(e) => setManagerNoteInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setScheduleToUpdate(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Schedule Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REVIEW STATUTORY APPEAL                            */}
      {/* ========================================================= */}
      {appealToReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Adjudicate Funding Appeal</h3>
                  <p className="text-[11px] text-slate-300">
                    {appealToReview.id} • {appealToReview.entityName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAppealToReview(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Funding Request Item</span>
                    <strong className="text-slate-900 text-xs">{appealToReview.title}</strong>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {formatZAR(appealToReview.amountRequested)}
                  </span>
                </div>

                {appealToReview.rejectionReason && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px]">
                    <strong className="font-bold block text-rose-950">Prior Rejection Reason:</strong>
                    {appealToReview.rejectionReason}
                  </div>
                )}

                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="font-bold text-amber-900">Appellant Grounds for Appeal:</strong>
                    <span className="text-[10px] font-mono text-amber-800">{appealToReview.appealDate}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{appealToReview.appealReason}</p>

                  {appealToReview.appealSupportingDocName && (
                    <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-900">
                        <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="font-bold">{appealToReview.appealSupportingDocName}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-semibold">
                        PoE Document Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-2">Executive Adjudication Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer transition-all ${
                    appealReviewDecision === 'approve'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="appealDecision"
                      checked={appealReviewDecision === 'approve'}
                      onChange={() => setAppealReviewDecision('approve')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Uphold Appeal & Approve</span>
                      <span className="text-[11px] text-slate-500">
                        Reinstates request to Approved status, queued for BAS disbursement.
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer transition-all ${
                    appealReviewDecision === 'reject'
                      ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="appealDecision"
                      checked={appealReviewDecision === 'reject'}
                      onChange={() => setAppealReviewDecision('reject')}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Dismiss Appeal / Uphold</span>
                      <span className="text-[11px] text-slate-500">
                        Confirms rejection. Inadequate statutory rectification.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Manager Ruling Notes & Compliance Directive *
                </label>
                <textarea
                  required
                  rows={3}
                  value={appealDecisionNote}
                  onChange={(e) => setAppealDecisionNote(e.target.value)}
                  placeholder="State formal findings, council minute verification, or justification for reinstating or upholding rejection..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAppealToReview(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onReviewAppeal) {
                      onReviewAppeal(
                        appealToReview.id,
                        appealReviewDecision === 'approve',
                        appealDecisionNote.trim() || (appealReviewDecision === 'approve' ? 'Appeal approved following review of supporting evidence' : 'Appeal dismissed due to insufficient statutory PoE')
                      );
                    }
                    setAppealToReview(null);
                  }}
                  className={`px-4 py-2 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    appealReviewDecision === 'approve'
                      ? 'bg-emerald-700 hover:bg-emerald-600'
                      : 'bg-rose-700 hover:bg-rose-600'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>
                    {appealReviewDecision === 'approve' ? 'Confirm Appeal Approval' : 'Confirm Dismissal'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FREEZE ENTITY ACCOUNT                              */}
      {/* ========================================================= */}
      {entityToFreeze && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-rose-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-rose-800 text-rose-200 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Execute Statutory Account Freeze</h3>
                  <p className="text-[11px] text-rose-200">
                    {entityToFreeze.name} ({entityToFreeze.isNpo ? 'Funded NPO' : 'Public Entity'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEntityToFreeze(null)}
                className="text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <div className="font-bold text-xs flex items-center gap-1.5 text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Immediate Interdict on Financial Disbursements</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Executing this freeze will immediately disable all pending and future funding disbursements, lock approval actions, and notify the accounting authority under PFMA Section 51 statutory intervention.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Statutory Grounds / Allegation Category *
                </label>
                <select
                  value={freezeReasonPreset}
                  onChange={(e) => setFreezeReasonPreset(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Under Forensic Investigation / Serious Allegations of Financial Irregularities">
                    Forensic Investigation / Serious Financial Irregularities
                  </option>
                  <option value="AGSA Section 51 Material Irregularity & Disclaimer of Audit Opinion">
                    AGSA Section 51 Material Irregularity & Audit Disclaimer
                  </option>
                  <option value="Interim Board Governance Dispute / Absence of Quorate Board">
                    Interim Board Governance Collapse / Inquorate Council
                  </option>
                  <option value="Severe Supply Chain & Tender Fraud Allegation (Docket PERS-INV)">
                    Supply Chain & Tender Fraud Allegation (Docket PERS-INV)
                  </option>
                  <option value="Failure to Submit Statutory Financial Returns & Reconciliations">
                    Gross Failure to Submit Statutory Reconciliations & Annual Returns
                  </option>
                  <option value="Ministerial Directive / Urgent Statutory Inquiry">
                    Urgent Ministerial Directive / Section 54 Inquiry
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Investigation Details, Case Docket & Terms of Freeze *
                </label>
                <textarea
                  required
                  rows={3}
                  value={freezeReasonDetails}
                  onChange={(e) => setFreezeReasonDetails(e.target.value)}
                  placeholder="Detail the case docket number, SIU/Forensic referral, or specific financial irregularities under review..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEntityToFreeze(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onFreezeEntity) {
                      const fullReason = freezeReasonDetails.trim() 
                        ? `${freezeReasonPreset} — ${freezeReasonDetails.trim()}`
                        : freezeReasonPreset;
                      onFreezeEntity(entityToFreeze.id, entityToFreeze.isNpo, fullReason);
                    }
                    setEntityToFreeze(null);
                  }}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Execute Account Freeze</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: UNFREEZE / RESTORE ENTITY ACCOUNT                  */}
      {/* ========================================================= */}
      {entityToUnfreeze && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-emerald-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-800 text-emerald-200 rounded-lg">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Lift Statutory Account Freeze</h3>
                  <p className="text-[11px] text-emerald-200">
                    {entityToUnfreeze.name} ({entityToUnfreeze.isNpo ? 'Funded NPO' : 'Public Entity'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEntityToUnfreeze(null)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Restoration of Statutory Financial Operations</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Lifting this freeze will restore regular funding disbursement processing, re-enable funding request approvals, and re-activate the institution's BAS payment credentials.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clearance Reference, Ministerial Authorization & Audit Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={unfreezeNotes}
                  onChange={(e) => setUnfreezeNotes(e.target.value)}
                  placeholder="Cite forensic clearance report, ministerial memorandum, or verified council remediation plan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEntityToUnfreeze(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUnfreezeEntity) {
                      onUnfreezeEntity(
                        entityToUnfreeze.id, 
                        entityToUnfreeze.isNpo, 
                        unfreezeNotes.trim() || 'Account freeze lifted following forensic review and compliance clearance.'
                      );
                    }
                    setEntityToUnfreeze(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Confirm & Lift Account Freeze</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
