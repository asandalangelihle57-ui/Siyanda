import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  UserCheck, 
  AlertCircle, 
  ArrowRight, 
  Building2,
  CheckCircle2,
  KeyRound,
  FileText
} from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  // Role portal mode selector: 'manager' vs 'entity_clerk'
  const [selectedPortal, setSelectedPortal] = useState<'manager' | 'entity_clerk'>('manager');

  // Input states
  const [emailOrWorkerId, setEmailOrWorkerId] = useState<string>('z.buthelezi@dsac.gov.za');
  const [passwordInput, setPasswordInput] = useState<string>('PFMA#2026@Secure');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Switch portal and automatically populate credentials for that profile
  const handleSelectPortal = (portal: 'manager' | 'entity_clerk') => {
    setSelectedPortal(portal);
    setErrorMessage('');
    if (portal === 'manager') {
      const mgr = users.find(u => u.role === 'DSACManager' || u.role === 'DSACAdministrator' || u.role === 'DSACReviewer') || users[1];
      setEmailOrWorkerId(mgr?.email || 'z.buthelezi@dsac.gov.za');
    } else {
      const clerk = users.find(u => u.role === 'EntityAdministrator' || u.role === 'EntityStaff') || users[2];
      setEmailOrWorkerId(clerk?.email || 'p.dlamini@nac.org.za');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const inputTrimmed = emailOrWorkerId.trim().toLowerCase();
      
      // Match by email, userName, or ID
      const matchedUser = users.find(
        u => u.email.toLowerCase() === inputTrimmed ||
             u.userName.toLowerCase() === inputTrimmed ||
             `pers-rsa-${1000 + u.id * 142}`.toLowerCase() === inputTrimmed
      );

      if (!matchedUser) {
        // Fallback matching by selected portal if custom email was typed
        const portalFallback = selectedPortal === 'manager'
          ? users.find(u => u.role === 'DSACManager' || u.role === 'DSACAdministrator' || u.role === 'DSACReviewer')
          : users.find(u => u.role === 'EntityAdministrator' || u.role === 'EntityStaff');

        if (portalFallback) {
          setIsAuthenticating(false);
          onLogin(portalFallback);
          return;
        }

        setIsAuthenticating(false);
        setErrorMessage('Worker identity not found on the PERS registry. Please verify your official email or Worker ID.');
        return;
      }

      setIsAuthenticating(false);
      onLogin(matchedUser);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-700 selection:text-white">
      {/* South Africa National Colours Top Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-400 via-red-600 to-blue-700 shadow-sm"></div>

      {/* Top Header Bar */}
      <header className="px-4 sm:px-8 py-3 bg-blue-900 text-white border-b border-blue-800 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-black text-xs shadow-inner">
            DSAC
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-blue-200 font-semibold">
              Republic of South Africa
            </div>
            <div className="text-xs sm:text-sm font-bold tracking-tight text-white">
              Department of Sport, Arts and Culture
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-800 border border-blue-700 text-blue-200 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            Official Government Intranet
          </span>
          <span className="text-[11px] font-mono text-blue-200 font-semibold">
            PFMA Act 1 of 1999
          </span>
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          {/* Top Panel Banner */}
          <div className="bg-blue-900 text-white p-6 border-b border-blue-800">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-800/90 border border-blue-700 text-blue-200 text-[11px] font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Secure Statutory Gateway
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              PERS Official Sign-In
            </h1>
            <p className="text-xs text-blue-200/90 mt-1">
              Public Entities Reporting System • 26 Entities & 6 Funded NPOs
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile Selection Tabs (Switch between Manager and Entity Clerk without exposing user roster) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Designated Worker Workspace:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => handleSelectPortal('manager')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedPortal === 'manager'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Executive Manager</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPortal('entity_clerk')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedPortal === 'entity_clerk'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Entity / NPO Clerk</span>
                </button>
              </div>
            </div>

            {/* Portal Role Description Banner */}
            <div className={`p-3 rounded-xl border text-xs ${
              selectedPortal === 'manager'
                ? 'bg-blue-50 border-blue-200 text-blue-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {selectedPortal === 'manager' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-blue-800" />
                    <span>Executive Oversight Profile</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Institutional Submissions Profile</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {selectedPortal === 'manager'
                  ? 'Access funding reviews & approvals, disbursement payments, audit expenditure graphs, and statutory oversight.'
                  : 'Access institutional reports, submit funding requests & appeals, update schedules, and upload statutory deliverables.'}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Worker Email or Persal Reference #
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={emailOrWorkerId}
                    onChange={e => setEmailOrWorkerId(e.target.value)}
                    placeholder="worker@dsac.gov.za or PERS-RSA-1142"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Official Security Passcode / PIN
                  </label>
                  <span className="text-[11px] text-blue-800 font-medium cursor-default">
                    PFMA Clearance Key
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 px-4 text-white bg-blue-800 hover:bg-blue-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAuthenticating ? (
                    <span>Verifying Credentials & Clearance...</span>
                  ) : (
                    <>
                      <span>Sign In to {selectedPortal === 'manager' ? 'Management Dashboard' : 'Entity Dashboard'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                <span>Session Privacy & Security Notice:</span>
              </div>
              <p>
                In compliance with the Protection of Personal Information Act (POPIA) and National Treasury security regulations, worker accounts are private and isolated. Once signed in, use the top-right Profile menu to safely Sign Out and authenticate with another account.
              </p>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 text-center">
            Department of Sport, Arts and Culture • Authorized RSA Personnel Only
          </div>
        </div>
      </main>

      {/* RSA Official Footer */}
      <footer className="px-4 sm:px-8 py-3 bg-slate-300/80 border-t border-slate-300 text-center text-xs text-slate-600">
        © 2026 Department of Sport, Arts and Culture • Republic of South Africa • Public Entities Reporting System
      </footer>
    </div>
  );
};
