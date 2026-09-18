import React from 'react';
import { Coins, TrendingUp, AlertCircle, ArrowUpRight, PieChart } from 'lucide-react';
import { FinancialRecord, PublicEntity } from '../types';

interface FinancialsViewProps {
  financials: FinancialRecord[];
  entities: PublicEntity[];
  onSelectEntity: (id: number) => void;
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({
  financials,
  entities,
  onSelectEntity
}) => {
  const totalAllocated = entities.reduce((acc, e) => acc + e.budgetAllocated, 0);
  const totalSpent = entities.reduce((acc, e) => acc + e.budgetSpent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallBurnRate = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Financial Accountability & Grant Monitoring
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            PFMA compliance: Tracking state funding allocation, quarterly tranche transfers, and operational expenditure burn rates
          </p>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          Financial Cycle: <strong className="text-white">2025/2026 Q3</strong>
        </div>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Total Funds Allocated</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            R{(totalAllocated / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Parliamentary Grant Vote 37</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Funds Transferred to Date</span>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">
            R{(totalAllocated * 0.75 / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] text-sky-400/80 mt-1 block">Q1, Q2 & Q3 Tranches Paid</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Actual Funds Spent</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            R{(totalSpent / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">Audited Expenditure</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Overall Burn Rate</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {overallBurnRate}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Target for Q3: 75%</span>
        </div>
      </div>

      {/* Financial Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
          <h3 className="font-bold text-white text-sm">
            Entities Expenditure Breakdown (PFMA Schedule 3A & 3C)
          </h3>
          <span className="text-slate-400 font-mono">Currency: ZAR (South African Rand)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Entity Name</th>
                <th className="p-3 text-right">Allocated</th>
                <th className="p-3 text-right">Transferred</th>
                <th className="p-3 text-right">Actual Spent</th>
                <th className="p-3 text-right">Remaining</th>
                <th className="p-3 text-center">Burn Rate %</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {entities.map(e => {
                const spent = e.budgetSpent;
                const remaining = e.budgetAllocated - spent;
                const burnRate = Math.round((spent / e.budgetAllocated) * 100);

                return (
                  <tr key={e.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          {e.acronym}
                        </span>
                        <span>{e.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-white">
                      R{e.budgetAllocated.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-sky-400">
                      R{(e.budgetAllocated * 0.75).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                      R{spent.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      R{remaining.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        burnRate >= 70 && burnRate <= 85
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : burnRate < 60
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {burnRate}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectEntity(e.id)}
                        className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                      >
                        Breakdown &rarr;
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
  );
};
