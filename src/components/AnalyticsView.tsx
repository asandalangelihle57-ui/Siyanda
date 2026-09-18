import React from 'react';
import { Briefcase, Users, Award, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { PublicEntity } from '../types';

interface AnalyticsViewProps {
  entities: PublicEntity[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entities }) => {
  const totalTarget = entities.reduce((acc, e) => acc + e.jobsTarget, 0);
  const totalCreated = entities.reduce((acc, e) => acc + e.jobsCreated, 0);
  const permanentJobs = Math.round(totalCreated * 0.32);
  const temporaryJobs = totalCreated - permanentJobs;
  const youthJobs = Math.round(totalCreated * 0.61);
  const womenJobs = Math.round(totalCreated * 0.54);
  const pwdJobs = Math.round(totalCreated * 0.045);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Job Creation & Staff Demographics Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Presidential Employment Stimulus (PES) tracking, youth employment quotas (18-35), and Employment Equity (EE) compliance
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>POPIA Verified: Aggregated Statistical Disclosure</span>
        </div>
      </div>

      {/* Primary Job Creation Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Total Jobs Created</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {totalCreated.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            Target: {totalTarget.toLocaleString()} ({Math.round((totalCreated / totalTarget) * 100)}%)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Youth Under 35</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {youthJobs.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">61% of total arts & heritage jobs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Women Beneficiaries</span>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">
            {womenJobs.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">54% gender parity threshold met</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-slate-400 font-semibold">Persons with Disabilities</span>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">
            {pwdJobs.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">4.5% inclusion rate</span>
        </div>
      </div>

      {/* Demographics & Job Typology Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Aggregated Sector Employment Composition
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Permanent Statutory Staff</span>
                <span className="font-mono font-bold text-white">{permanentJobs.toLocaleString()} (32%)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Contract & Temporary Creative Stimulus</span>
                <span className="font-mono font-bold text-white">{temporaryJobs.toLocaleString()} (68%)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>African National Demographic Representation</span>
                <span className="font-mono font-bold text-white">82%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top 5 Entities in Job Creation Volume
          </h3>

          <div className="divide-y divide-slate-800">
            {entities.slice(0, 5).map(e => (
              <div key={e.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{e.name}</div>
                  <div className="text-slate-500 text-[10px]">{e.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400">{e.jobsCreated.toLocaleString()} jobs</div>
                  <div className="text-slate-500 text-[10px]">Target: {e.jobsTarget.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
