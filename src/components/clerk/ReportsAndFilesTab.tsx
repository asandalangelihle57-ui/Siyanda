import React from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Table,
  Eye,
  FileUp,
  Upload,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { SubmittedFile } from '../../types';
import { formatZAR } from '../../utils/scheduleUtils';
import { getEntityFinancialData } from '../../data/persModuleData';

interface ReportsAndFilesTabProps {
  financialData: ReturnType<typeof getEntityFinancialData>;
  reportViewMode: 'both' | 'graph' | 'table';
  setReportViewMode: (mode: 'both' | 'graph' | 'table') => void;
  historyChartRef: React.RefObject<HTMLCanvasElement | null>;
  categoryChartRef: React.RefObject<HTMLCanvasElement | null>;
  orgFiles: SubmittedFile[];
  orgName: string;
  onUploadFileClick: () => void;
}

export const ReportsAndFilesTab: React.FC<ReportsAndFilesTabProps> = ({
  financialData,
  reportViewMode,
  setReportViewMode,
  historyChartRef,
  categoryChartRef,
  orgFiles,
  orgName,
  onUploadFileClick
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Key Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Allocated Budget</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{formatZAR(financialData.baseAllocation)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Full 2025/26 Statutory Baseline</div>
        </div>

        <div className="bg-white border border-emerald-300 rounded-xl p-4 shadow-xs bg-gradient-to-br from-white to-emerald-50/50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Funds Received</div>
          <div className="text-xl font-extrabold text-emerald-900 mt-1">{formatZAR(financialData.received)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">Exchequer Disbursed</div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Actual Expenditure</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{formatZAR(financialData.spent)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audited Outlays to Date</div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Remaining Balance</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{formatZAR(financialData.remaining)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Uncommitted Statutory Reserves</div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Budget Utilisation</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-slate-900">{financialData.utilizationPct}%</span>
            <span className="text-xs text-slate-500 font-medium">of baseline</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                financialData.utilizationPct > 90
                  ? 'bg-rose-500'
                  : financialData.utilizationPct > 70
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, financialData.utilizationPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Financial History & Breakdown Visualizer (Graph vs Table) */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Financial History & Expenditure Breakdown</h3>
            <p className="text-xs text-slate-600">
              Comparative review of quarterly allocations, disbursements, and categorical spending.
            </p>
          </div>

          {/* View Mode Toggle: Graph vs Table */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
            <button
              onClick={() => setReportViewMode('both')}
              className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                reportViewMode === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Combined</span>
            </button>
            <button
              onClick={() => setReportViewMode('graph')}
              className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                reportViewMode === 'graph' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Charts</span>
            </button>
            <button
              onClick={() => setReportViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                reportViewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Table</span>
            </button>
          </div>
        </div>

        {/* Charts Container */}
        {(reportViewMode === 'graph' || reportViewMode === 'both') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <span>Quarterly Cash Flow & Expenditure Tracking (ZAR)</span>
              </div>
              <div className="h-64 relative">
                <canvas ref={historyChartRef} />
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-slate-600" />
                <span>Expenditure by Operational Category</span>
              </div>
              <div className="h-64 relative">
                <canvas ref={categoryChartRef} />
              </div>
            </div>
          </div>
        )}

        {/* Table Container */}
        {(reportViewMode === 'table' || reportViewMode === 'both') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">
                Quarterly Cash Flow Summary
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3 text-right">Allocated</th>
                      <th className="py-2 px-3 text-right">Received</th>
                      <th className="py-2 px-3 text-right">Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financialData.quarters.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{q.period}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">{formatZAR(q.allocated)}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">{formatZAR(q.received)}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-900">{formatZAR(q.spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Operational Line-Item Proportions
              </h4>
              <div className="space-y-3">
                {financialData.breakdownCategories.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{item.category}</span>
                      <span className="font-mono font-bold text-slate-900">{formatZAR(item.amount)} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Statutory Submissions, Evidence & File Repository (Joined Tab) */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submitted Statutory Files & Proof of Evidence (PoE)</h3>
            <p className="text-xs text-slate-600">
              All statutory submissions, proof of evidence (PoE), bank statements, and compliance returns for {orgName}.
            </p>
          </div>
          <button
            onClick={onUploadFileClick}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Supporting File / Evidence</span>
          </button>
        </div>

        {orgFiles.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Files Uploaded for This Organization</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Upload compliance reports, bank reconciliations, performance portfolios, or audit schedules above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">File Name & Type</th>
                  <th className="py-3 px-3">Associated Milestone / Subject</th>
                  <th className="py-3 px-3">File Size</th>
                  <th className="py-3 px-3">Uploaded At</th>
                  <th className="py-3 px-3">Uploaded By</th>
                  <th className="py-3 px-3">SHA-256 Checksum</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orgFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{file.fileName}</div>
                          {file.notes && <div className="text-[10px] text-slate-500">{file.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {file.scheduleTitle || 'General Compliance Filing'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{file.fileSize}</td>
                    <td className="py-3 px-3 text-slate-600">{file.uploadedAt}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{file.uploadedBy}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                      {file.sha256Hash ? `${file.sha256Hash.slice(0, 14)}...` : 'Pending'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-emerald-700 font-bold text-xs flex items-center justify-end gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Archived
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
