import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import { 
  Bell, 
  ChevronDown, 
  ShieldCheck, 
  Building2, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  LogOut,
  UserCheck,
  User as UserIcon,
  BadgeCheck,
  Key,
  Clock,
  X
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: number) => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications,
  onMarkNotificationRead,
  onSignOut,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-blue-900 text-white border-b border-blue-800 shadow-md sticky top-0 z-40">
      {/* Main App Navigation Bar */}
      <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 px-2.5 py-2 rounded-lg text-blue-950 shadow-inner flex items-center justify-center font-black tracking-tight text-base select-none">
            DSAC
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
              Public Entities Reporting System
            </h1>
            <div className="text-xs font-semibold text-blue-200 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-xs sm:max-w-md">
                {currentUser.entityName || 'Department of Sport, Arts and Culture (National Oversight)'}
              </span>
            </div>
          </div>
        </div>

        {/* Worker Name Display on Top Panel */}
        <div className="hidden lg:flex items-center gap-2 bg-blue-800/90 px-3.5 py-1.5 rounded-full border border-blue-700/80 text-xs shadow-inner">
          <span className="text-blue-300 uppercase tracking-wider font-bold text-[10px]">
            Worker:
          </span>
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {currentUser.fullName}
          </span>
          <span className="text-blue-200/80 text-[11px] font-medium">
            ({currentUser.roleTitle})
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Reporting Period Indicator */}
          <div className="hidden md:flex items-center gap-1.5 bg-blue-800/60 border border-blue-700 px-2.5 py-1.5 rounded-lg text-xs text-blue-200">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium">Reporting Cycle: <strong className="text-white font-semibold">2025/2026 Q3</strong></span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg relative transition-colors cursor-pointer"
              aria-label="Statutory Notifications"
              title="Statutory Notifications and Compliance Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-300 text-slate-900 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    Statutory Alerts & Reminders
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-3 text-xs cursor-pointer transition-colors ${
                        notif.isRead ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'DeadlineWarning' && (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'RiskAlert' && (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'ReviewRequired' && (
                          <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'ChangesRequested' && (
                          <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'Approved' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-[11px] text-slate-900">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TOP RIGHT CORNER: Profile Option with Worker Details & Sign Out */}
          <div className="relative">
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="flex items-center gap-2 bg-blue-800/90 hover:bg-blue-700 border border-blue-700/80 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
              title="Worker Profile & Account Session"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-xs shadow-sm">
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden md:block">
                <div className="font-bold text-white text-xs leading-tight">{currentUser.fullName}</div>
                <div className="text-[10px] text-blue-200 truncate max-w-[140px]">{currentUser.roleTitle}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {/* Profile Dropdown / Modal */}
            {showProfileModal && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-300 text-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs animate-fadeIn">
                {/* Profile Header */}
                <div className="p-4 bg-blue-900 text-white flex items-start justify-between border-b border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-400 text-blue-950 font-black text-sm flex items-center justify-center shadow-md">
                      {currentUser.avatarInitials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {currentUser.fullName}
                        <BadgeCheck className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-[11px] text-blue-200 mt-0.5">{currentUser.roleTitle}</div>
                      <div className="text-[10px] text-blue-200/80 font-mono mt-0.5">{currentUser.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-blue-200 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Worker Details Card */}
                <div className="p-4 space-y-3 bg-slate-50">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Official Statutory Worker Credentials
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Persal Reference #</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">
                        PERS-RSA-{1000 + currentUser.id * 142}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">PFMA Clearance</span>
                      <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {currentUser.role.includes('Manager') ? 'Level 4 Executive' : 'Level 2 Submitter'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Assigned Institution:</span>
                      <strong className="text-slate-900 text-right truncate max-w-[200px]">
                        {currentUser.entityName || 'National Department (DSAC Pretoria)'}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-100">
                      <span className="text-slate-500">Statutory Role:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-100">
                      <span className="text-slate-500">Session Status:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Authenticated Session
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sign Out Option (Takes to Login Page to sign into other accounts) */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      onSignOut();
                    }}
                    className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out (Switch / Sign in Other Accounts)</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Signing out will terminate this session and return you to the secure login page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
