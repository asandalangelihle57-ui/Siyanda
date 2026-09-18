import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Upload,
  Coins,
  Scale,
  FileText,
  Search,
  Check
} from 'lucide-react';
import { AdminSchedule, FundingRequest } from '../../types';
import { calculateDeadlineRisk, formatZAR } from '../../utils/scheduleUtils';

interface SchedulesAndFundingTabProps {
  orgSchedules: AdminSchedule[];
  orgRequests: FundingRequest[];
  orgName: string;
  orgAcronym: string;
  onAddScheduleClick: () => void;
  onUpdateScheduleClick: (sch: AdminSchedule) => void;
  onSubmitScheduleFileClick: (sch: AdminSchedule) => void;
  onNewFundingRequestClick: () => void;
  onAppealClick: (req: FundingRequest) => void;
}

export const SchedulesAndFundingTab: React.FC<SchedulesAndFundingTabProps> = ({
  orgSchedules,
  orgRequests,
  orgName,
  orgAcronym,
  onAddScheduleClick,
  onUpdateScheduleClick,
  onSubmitScheduleFileClick,
  onNewFundingRequestClick,
  onAppealClick
}) => {
  const [fundingSearch, setFundingSearch] = useState('');
  const [fundingCategoryFilter, setFundingCategoryFilter] = useState<string>('all');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'pending' | 'submitted'>('all');

  const filteredSchedules = orgSchedules.filter((sch) => {
    if (scheduleFilter === 'pending') return sch.status !== 'Approved' && sch.status !== 'Submitted';
    if (scheduleFilter === 'submitted') return sch.status === 'Approved' || sch.status === 'Submitted';
    return true;
  });

  const filteredRequests = orgRequests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(fundingSearch.toLowerCase()) ||
      req.id.toLowerCase().includes(fundingSearch.toLowerCase()) ||
      req.justification.toLowerCase().includes(fundingSearch.toLowerCase());
    const matchesCategory =
      fundingCategoryFilter === 'all' || req.category === fundingCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Admin Deliverable Schedules & Compliance Timeline */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Admin Deliverable Schedules & Compliance Timeline</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Manage statutory reporting deadlines and milestone evidence submissions for {orgName}.
            </p>
          </div>

          {/* Risk Assessment Criteria Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 border border-rose-300 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Past Due / ≤3 Days: High Risk
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              ≤15 Days: Medium Risk
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ≤30 Days: Low Risk
            </span>
          </div>
        </div>

        {/* Schedule Table Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Milestones & Deliverable Tasks ({filteredSchedules.length} Items)
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setScheduleFilter('all')}
                className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                  scheduleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setScheduleFilter('pending')}
                className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                  scheduleFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setScheduleFilter('submitted')}
                className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                  scheduleFilter === 'submitted' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <button
            onClick={onAddScheduleClick}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Milestone Deliverable</span>
          </button>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Schedules Logged</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Add a statutory reporting milestone or schedule deliverable using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">Milestone Deliverable</th>
                  <th className="py-3 px-3">Target Deadline</th>
                  <th className="py-3 px-3">Risk Assessment</th>
                  <th className="py-3 px-3">Deliverable Status</th>
                  <th className="py-3 px-3">Attached Evidence File</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSchedules.map((sch) => {
                  const risk = calculateDeadlineRisk(sch.deadlineDate);

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-bold text-slate-900">{sch.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{sch.description}</div>
                        {sch.managerNote && (
                          <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900">
                            <strong>Manager Instruction:</strong> {sch.managerNote}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{sch.deadlineDate}</div>
                        <div className="text-[11px] text-slate-500">
                          {risk.isPastDue ? 'Passed date' : `${risk.daysRemaining} days remaining`}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${risk.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${risk.riskLevel === 'High' ? 'bg-rose-600' : risk.riskLevel === 'Medium' ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                          {risk.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {sch.status === 'Approved' || sch.status === 'Submitted' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {sch.status === 'Approved' ? 'Approved & Met' : 'Submitted'}
                          </span>
                        ) : sch.status === 'Under Review' ? (
                          <span className="inline-flex items-center gap-1 text-sky-800 font-bold bg-sky-50 border border-sky-300 px-2 py-0.5 rounded text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            Under Review
                          </span>
                        ) : sch.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-50 border border-rose-300 px-2 py-0.5 rounded text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Overdue
                          </span>
                        ) : sch.status === 'Extension Granted' ? (
                          <span className="inline-flex items-center gap-1 text-purple-800 font-bold bg-purple-50 border border-purple-300 px-2 py-0.5 rounded text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            Extension Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px]">
                            Pending Action
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        {sch.attachedFileName ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-emerald-900 font-medium">
                              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[140px]" title={sch.attachedFileName}>
                                {sch.attachedFileName}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {sch.submittedAt || 'Submitted'} • {sch.attachedFileSize || 'File'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No file attached yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Submit file */}
                          <button
                            onClick={() => onSubmitScheduleFileClick(sch)}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            title="Submit Proof of Evidence File"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit File</span>
                          </button>

                          {/* Update schedule */}
                          <button
                            onClick={() => onUpdateScheduleClick(sch)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Update Schedule Dates / Status"
                          >
                            <span>Update</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Submitted Funding Requests & Allocations (Joined Tab) */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submitted Funding Requests & Allocations</h3>
            <p className="text-xs text-slate-600">
              Track funding requests submitted by this entity. View review status, manager approvals, payments, and rejection reasons.
            </p>
          </div>
          <button
            onClick={onNewFundingRequestClick}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Funding Request</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Title, ID, or Purpose..."
              value={fundingSearch}
              onChange={(e) => setFundingSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-semibold">Category:</label>
            <select
              value={fundingCategoryFilter}
              onChange={(e) => setFundingCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Operational Tranche">Operational Tranche</option>
              <option value="Project Grant">Project Grant</option>
              <option value="Emergency Relief">Emergency Relief</option>
              <option value="Infrastructure Subsidy">Infrastructure Subsidy</option>
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <Coins className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Funding Requests Found</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click "New Funding Request" above to request an operational tranche, project grant, or emergency relief.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">Req ID</th>
                  <th className="py-3 px-3">Title & Purpose</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Amount Requested</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status & Audit Details</th>
                  <th className="py-3 px-3">Document Attached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.map((req) => {
                  const isPending = req.status === 'Pending Review';
                  const isApproved = req.status === 'Approved';
                  const isPaid = req.status === 'Paid';
                  const isRejected = req.status === 'Rejected';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{req.id}</td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900">{req.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{req.justification}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-medium text-[11px] text-slate-800">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {formatZAR(req.amountRequested)}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{req.submittedDate}</div>
                        <div className="text-[10px] text-slate-500">{req.submittedBy}</div>
                      </td>
                      <td className="py-3 px-3">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Under Management Review
                          </span>
                        )}
                        {isApproved && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              Approved - Awaiting Payment
                            </span>
                            <div className="text-[10px] text-slate-600 mt-1">
                              By {req.reviewedBy} on {req.reviewedDate}
                            </div>
                          </div>
                        )}
                        {isPaid && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Paid & Disbursed
                            </span>
                            <div className="text-[10px] text-slate-600 font-mono mt-1">
                              Ref: {req.paymentRef} ({req.paidDate})
                            </div>
                          </div>
                        )}
                        {isRejected && (
                          <div className="max-w-xs space-y-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Funding Request Rejected
                            </span>
                            {req.rejectionReason && (
                              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-900 leading-tight">
                                <strong className="font-semibold block text-rose-950">Manager Rejection Reason:</strong>
                                {req.rejectionReason}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => onAppealClick(req)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span>Appeal Review & Attach Evidence</span>
                            </button>
                          </div>
                        )}

                        {req.status === 'Under Appeal' && (
                          <div className="max-w-xs space-y-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Scale className="w-3.5 h-3.5 text-amber-600" />
                              Under Formal Appeal
                            </span>
                            <div className="p-2 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-900">
                              <strong className="block text-amber-950">Grounds Submitted ({req.appealDate}):</strong>
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

                        {req.status === 'Appeal Approved' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Appeal Approved & Reinstated
                            </span>
                            {req.appealReviewNote && (
                              <div className="text-[10px] text-emerald-800">
                                Manager Note: {req.appealReviewNote}
                              </div>
                            )}
                          </div>
                        )}

                        {req.status === 'Appeal Rejected' && (
                          <div className="max-w-xs space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Appeal Rejected
                            </span>
                            {req.appealReviewNote && (
                              <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-900">
                                Decision Note: {req.appealReviewNote}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => onAppealClick(req)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-100 text-[10px] font-medium"
                            >
                              <Scale className="w-3 h-3" />
                              <span>Submit Supplementary Appeal</span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {req.supportingDocumentName ? (
                          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[120px]" title={req.supportingDocumentName}>
                              {req.supportingDocumentName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None attached</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
