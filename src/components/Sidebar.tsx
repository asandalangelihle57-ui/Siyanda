import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Target, 
  FolderGit2, 
  Coins, 
  ClipboardCheck, 
  BarChart3, 
  History,
  ChevronRight,
  ShieldAlert,
  CreditCard,
  AlertTriangle,
  Lock,
  CheckCircle2,
  FileSpreadsheet,
  FileCheck2,
  Scale,
  Mail,
  Calendar
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'problems'
  | 'entities'
  | 'npos'
  | 'kpis'
  | 'documents'
  | 'reports'
  | 'tasks'
  | 'financials'
  | 'audits'
  | 'analytics'
  | 'ai'
  | 'chat'
  | 'auditlog';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  pendingDocsCount: number;
  atRiskKpisCount: number;
  openAuditsCount: number;
  // Specific profile stats
  entityName?: string;
  isEntityFrozen?: boolean;
  complianceRate?: number;
  budgetAllocated?: number;
  budgetSpent?: number;
  pendingFundingCount?: number;
  pendingAppealsCount?: number;
  frozenEntitiesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  pendingDocsCount,
  atRiskKpisCount,
  openAuditsCount,
  entityName = 'National Arts Council of South Africa',
  isEntityFrozen = false,
  complianceRate = 78,
  budgetAllocated = 145000000,
  budgetSpent = 112000000,
  pendingFundingCount = 3,
  pendingAppealsCount = 1,
  frozenEntitiesCount = 1
}) => {
  const isEntityUser = userRole === 'EntityAdministrator' || userRole === 'EntityStaff';

  // Navigation specifically tailored for Entity or NPO Clerk
  const entityNav = [
    {
      id: 'tasks' as NavTab,
      label: 'Funding Requests, Schedules & Deliverables',
      icon: Calendar,
      badge: 'Joint Module',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports, Submissions & File Repository',
      icon: FileSpreadsheet,
      badge: 'PoE Repo',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
    },
    {
      id: 'chat' as NavTab,
      label: 'Inter-Dept Chat & Email',
      icon: Mail,
      badge: 'Comms',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
    },
    {
      id: 'audits' as NavTab,
      label: 'AGSA Audit Action Items',
      icon: ClipboardCheck,
      badge: openAuditsCount > 0 ? `${openAuditsCount} open` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      id: 'kpis' as NavTab,
      label: 'Entity Targets & KPIs',
      icon: Target,
      badge: atRiskKpisCount > 0 ? `${atRiskKpisCount} at risk` : null,
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
    }
  ];

  // Navigation specifically tailored for DSAC Executive Management
  const managerNav = [
    {
      id: 'dashboard' as NavTab,
      label: 'Executive Oversight Dashboard',
      icon: LayoutDashboard,
      badge: '32 Orgs',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      id: 'chat' as NavTab,
      label: 'Inter-Dept Chat & Email',
      icon: Mail,
      badge: 'Alerts',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
    },
    {
      id: 'financials' as NavTab,
      label: 'Funding Approvals, Appeals & Expenditure Audit',
      icon: Coins,
      badge: pendingFundingCount > 0 ? `${pendingFundingCount} review` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      id: 'analytics' as NavTab,
      label: 'Disbursements & Payment Audit',
      icon: CreditCard,
      badge: 'Graph'
    },
    {
      id: 'tasks' as NavTab,
      label: 'Statutory Risk Watchlist',
      icon: AlertTriangle,
      badge: 'Hourly/15/30d',
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
    },
    {
      id: 'problems' as NavTab,
      label: 'Problem Statement Directives',
      icon: ShieldAlert,
      badge: '7 Directives'
    },
    {
      id: 'auditlog' as NavTab,
      label: 'Statutory Compliance Audit Log',
      icon: History,
      badge: 'Logs'
    }
  ];

  const currentNavItems = isEntityUser ? entityNav : managerNav;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 sticky top-0 h-[calc(100vh-69px)] overflow-y-auto text-slate-200 select-none z-20">
      {/* Role Navigation Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
            {isEntityUser ? 'Entity Portal' : 'Executive Oversight'}
          </span>
          <span className="text-xs font-bold text-white tracking-tight">
            {isEntityUser ? 'Institutional Submissions' : 'Statutory Governance'}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
          {isEntityUser ? 'Clerk' : 'Manager'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {isEntityUser ? 'Entity Operations' : 'Management Controls'}
        </div>

        {currentNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center space-x-1 shrink-0 ml-1">
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-300" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Profile-Specific Live Information and Stats Card */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs">
        {isEntityUser ? (
          /* Entity / NPO Clerk Specific Stats */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                Assigned Entity
              </span>
              {isEntityFrozen ? (
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  FROZEN
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  Active
                </span>
              )}
            </div>

            <div className="text-[11px] font-bold text-slate-100 truncate" title={entityName}>
              {entityName}
            </div>

            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>Compliance Rating:</span>
                <strong className={`font-mono ${complianceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {complianceRate}%
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Allocated Budget:</span>
                <strong className="text-slate-200 font-mono text-[10px]">
                  R {(budgetAllocated / 1000000).toFixed(1)}M
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Budget Spent:</span>
                <strong className="text-slate-200 font-mono text-[10px]">
                  R {(budgetSpent / 1000000).toFixed(1)}M
                </strong>
              </div>

              {pendingAppealsCount > 0 && (
                <div className="p-1.5 rounded bg-amber-950/60 border border-amber-900/60 text-amber-300 text-[10px] flex items-center gap-1.5">
                  <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{pendingAppealsCount} Review Appeal active</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Executive Manager Specific Stats */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                Oversight Portfolio
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                32 Portfolios
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Public Entities</span>
                <strong className="text-white font-mono text-xs">26 Entities</strong>
              </div>

              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Funded NPOs</span>
                <strong className="text-white font-mono text-xs">6 NPOs</strong>
              </div>
            </div>

            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>Pending Approvals:</span>
                <strong className="text-amber-400 font-mono font-bold">
                  {pendingFundingCount} Requests
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Frozen Accounts:</span>
                <strong className={`font-mono font-bold ${frozenEntitiesCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {frozenEntitiesCount} Under Review
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Statutory Vote:</span>
                <strong className="text-emerald-400 font-mono">
                  R 4.20 Billion
                </strong>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>PFMA Node RSA</span>
          <span className="font-mono text-emerald-400">SECURE-SSL</span>
        </div>
      </div>
    </aside>
  );
};
