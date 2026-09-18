import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Filter, 
  Search, 
  Paperclip, 
  Calendar, 
  Bell, 
  User as UserIcon, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  User, 
  InterDeptMessage, 
  AdminSchedule, 
  PublicEntity, 
  NPO, 
  SubmittedFile 
} from '../types';

interface InterDepartmentalChatViewProps {
  currentUser: User;
  entities: PublicEntity[];
  npos: NPO[];
  schedules: AdminSchedule[];
  submittedFiles: SubmittedFile[];
  messages: InterDeptMessage[];
  onSendMessage: (msg: Omit<InterDeptMessage, 'id' | 'timestamp'>) => void;
}

export const InterDepartmentalChatView: React.FC<InterDepartmentalChatViewProps> = ({
  currentUser,
  entities,
  npos,
  schedules,
  submittedFiles,
  messages,
  onSendMessage
}) => {
  const isManager = currentUser.role === 'DSACManager' || 
                    currentUser.role === 'DSACAdministrator' || 
                    currentUser.role === 'DSACReviewer';

  // For entity clerk, locked to their own entity
  const clerkOrgId = currentUser.entityId || 1;
  const clerkIsNpo = !!npos.find(n => n.id === clerkOrgId);
  const clerkOrgName = currentUser.entityName || (clerkIsNpo ? npos.find(n => n.id === clerkOrgId)?.name : entities.find(e => e.id === clerkOrgId)?.name) || 'National Arts Council of South Africa';

  // For manager, they can view conversations per entity
  const [selectedChannelOrgId, setSelectedChannelOrgId] = useState<number>(clerkOrgId);
  const [selectedChannelIsNpo, setSelectedChannelIsNpo] = useState<boolean>(clerkIsNpo);

  // Active filter tab
  const [filterTab, setFilterTab] = useState<'all' | 'chat_email' | 'schedule_alerts'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New message form state
  const [msgContent, setMsgContent] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  // Active channel details
  const activeChannelOrgId = isManager ? selectedChannelOrgId : clerkOrgId;
  const activeChannelIsNpo = isManager ? selectedChannelIsNpo : clerkIsNpo;

  const activeChannelOrg = activeChannelIsNpo
    ? npos.find(n => n.id === activeChannelOrgId)
    : entities.find(e => e.id === activeChannelOrgId);

  const activeChannelName = activeChannelOrg?.name || clerkOrgName;

  // Filter messages for current channel
  const channelMessages = useMemo(() => {
    return messages.filter(m => {
      // Must match current channel entity
      const matchesEntity = m.entityId === activeChannelOrgId;
      if (!matchesEntity) return false;

      // Filter by type
      if (filterTab === 'chat_email') {
        if (m.messageType !== 'chat' && m.messageType !== 'official_email') return false;
      } else if (filterTab === 'schedule_alerts') {
        if (m.messageType !== 'schedule_alert' && m.messageType !== 'schedule_booked') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return m.content.toLowerCase().includes(query) ||
               (m.subject && m.subject.toLowerCase().includes(query)) ||
               m.senderName.toLowerCase().includes(query) ||
               (m.relatedScheduleTitle && m.relatedScheduleTitle.toLowerCase().includes(query));
      }

      return true;
    });
  }, [messages, activeChannelOrgId, filterTab, searchQuery]);

  // Live schedule metrics for current channel
  const channelSchedules = useMemo(() => {
    return schedules.filter(s => s.entityId === activeChannelOrgId);
  }, [schedules, activeChannelOrgId]);

  const overdueSchedules = useMemo(() => {
    return channelSchedules.filter(s => s.status === 'Overdue');
  }, [channelSchedules]);

  const bookedSchedules = useMemo(() => {
    return channelSchedules.filter(s => s.status === 'Approved' || s.status === 'Submitted' || !!s.attachedFileName);
  }, [channelSchedules]);

  // Handle sending message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;

    const relatedSched = schedules.find(s => s.id === selectedScheduleId);

    onSendMessage({
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderEmail: currentUser.email || `${currentUser.userName.toLowerCase()}@${isManager ? 'dsac.gov.za' : 'gov.za'}`,
      senderRole: currentUser.roleTitle,
      senderDepartment: isManager ? 'DSAC Executive Management' : 'Entity / NPO Administration',
      recipientDepartment: isManager ? 'Entity / NPO Administration' : 'DSAC Executive Management',
      entityId: activeChannelOrgId,
      entityName: activeChannelName,
      isNpo: activeChannelIsNpo,
      subject: msgSubject.trim() || undefined,
      content: msgContent.trim(),
      messageType: 'chat',
      priority: 'normal',
      relatedScheduleId: selectedScheduleId || undefined,
      relatedScheduleTitle: relatedSched?.title || undefined,
      isRead: false
    });

    setMsgContent('');
    setMsgSubject('');
    setSelectedScheduleId('');
  };

  const getSenderEmail = (msg: InterDeptMessage) => {
    if (msg.senderEmail) return msg.senderEmail;
    const namePart = msg.senderName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
    if (msg.senderDepartment.includes('DSAC')) {
      return `${namePart}@dsac.gov.za`;
    }
    const entity = entities.find(e => e.id === msg.entityId);
    const acronym = entity?.acronym?.toLowerCase() || 'gov';
    return `${namePart}@${acronym}.org.za`;
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Search Bar with Filter Options */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search messages, names, emails, schedules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Correspondence ({channelMessages.length})
          </button>

          <button
            onClick={() => setFilterTab('chat_email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'chat_email'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Direct Messages & Email
          </button>

          <button
            onClick={() => setFilterTab('schedule_alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'schedule_alerts'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Schedule Updates & Bookings
          </button>
        </div>
      </div>

      {/* Main Split Layout: Channels/Schedule Alerts (Left) + Messages (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Department Channels & Schedule Summary */}
        <div className="lg:col-span-4 space-y-4">
          {/* Channel Selector for Managers or Locked Info for Clerks */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                Department Communication Channel
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {isManager ? 'Manager Oversight' : 'Clerk Channel'}
              </span>
            </div>

            {isManager ? (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Select Institutional Correspondence Channel:
                </label>
                <select
                  value={`${selectedChannelIsNpo ? 'npo' : 'entity'}-${selectedChannelOrgId}`}
                  onChange={(e) => {
                    const [type, idStr] = e.target.value.split('-');
                    setSelectedChannelOrgId(Number(idStr));
                    setSelectedChannelIsNpo(type === 'npo');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-2.5 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
                >
                  <optgroup label="Public Entities (26 Total)">
                    {entities.map(ent => (
                      <option key={`ch-entity-${ent.id}`} value={`entity-${ent.id}`}>
                        {ent.id}. {ent.name} ({ent.acronym})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Funded Non-Profit Organisations (6 Total)">
                    {npos.map(npo => (
                      <option key={`ch-npo-${npo.id}`} value={`npo-${npo.id}`}>
                        NPO {npo.id}. {npo.name} ({npo.acronym})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{activeChannelName}</span>
                </div>
                <div className="text-[11px] text-blue-800 mt-1">
                  Direct official line connected to DSAC Executive Management (Pretoria Head Office).
                </div>
              </div>
            )}

            {/* Quick Channel Stats */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Overdue Deliverables</div>
                <div className={`text-base font-black font-mono ${overdueSchedules.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {overdueSchedules.length}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Booked / Submitted</div>
                <div className="text-base font-black font-mono text-blue-800">
                  {bookedSchedules.length}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Updates Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                Live Schedule Status Feed
              </h3>
              <span className="text-[10px] font-semibold text-slate-500">
                {channelSchedules.length} schedules
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {channelSchedules.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                  No reporting schedules configured for this institution.
                </div>
              ) : (
                channelSchedules.map(sched => {
                  const isOverdue = sched.status === 'Overdue';
                  const isBooked = sched.status === 'Approved' || sched.status === 'Submitted' || !!sched.attachedFileName;

                  return (
                    <div 
                      key={sched.id}
                      className={`p-2.5 rounded-lg border text-xs transition-all ${
                        isOverdue 
                          ? 'bg-rose-50/70 border-rose-200' 
                          : isBooked 
                          ? 'bg-emerald-50/70 border-emerald-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-slate-900 leading-tight">
                          {sched.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                          isOverdue 
                            ? 'bg-rose-100 text-rose-800 border-rose-200' 
                            : isBooked 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {isOverdue ? 'OVERDUE' : isBooked ? 'BOOKED' : sched.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1">
                        <span>Deadline: {sched.deadlineDate}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{sched.entityName}</span>
                      </div>

                      {sched.attachedFileName && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">Booked PoE: {sched.attachedFileName}</span>
                        </div>
                      )}

                      {/* Quick reference trigger */}
                      {isManager && isOverdue && (
                        <button
                          type="button"
                          onClick={() => setSelectedScheduleId(sched.id)}
                          className="mt-2 w-full py-1 px-2 text-[10px] font-bold text-blue-800 bg-white hover:bg-blue-50 rounded border border-blue-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Calendar className="w-3 h-3 text-blue-700" />
                          Reference Deliverable in Dispatch
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Message History & Interactive Composer */}
        <div className="lg:col-span-8 space-y-4">
          {/* Messages Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs min-h-[420px] max-h-[560px] overflow-y-auto space-y-3.5">
            {channelMessages.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No correspondence found in this channel</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Use the composer below to dispatch a message, query a schedule deliverable, or verify booked evidence.
                </p>
              </div>
            ) : (
              channelMessages.map(msg => {
                const senderEmail = getSenderEmail(msg);

                return (
                  <div 
                    key={msg.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs text-slate-800 transition-all hover:border-blue-200 space-y-2.5"
                  >
                    {/* Header with Sender Name, Email, Department and Timestamp - without arbitrary status states */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {msg.senderName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                            <span>{msg.senderName}</span>
                            <span className="text-[11px] font-mono text-blue-700 font-normal">
                              &lt;{senderEmail}&gt;
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {msg.senderDepartment} • {msg.senderRole}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {msg.subject && (
                      <div className="text-xs font-bold text-slate-900">
                        Subject: {msg.subject}
                      </div>
                    )}

                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </p>

                    {msg.relatedScheduleTitle && (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>Attached Schedule Reference: <strong className="text-slate-800">{msg.relatedScheduleTitle}</strong></span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Message Dispatch Composer (No Quick Chat or Priority dropdown, only Attach Schedule Reference) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-800" />
                Compose Inter-Departmental Dispatch
              </h3>
              <div className="text-[11px] text-slate-500">
                Posting as: <strong className="text-slate-800 font-semibold">{currentUser.fullName}</strong>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Subject (Optional): e.g. Quarterly Deliverable Update, Expenditure Verification Inquiry..."
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder={`Write your correspondence to ${isManager ? activeChannelName : 'DSAC Executive Management'}...`}
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 leading-relaxed"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Attach Schedule Reference (Optional) */}
                <div className="flex items-center gap-2 text-xs flex-1 min-w-[240px] max-w-lg">
                  <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 truncate focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Attach Schedule Reference (Optional)</option>
                    {channelSchedules.map(sched => (
                      <option key={`opt-sched-${sched.id}`} value={sched.id}>
                        {sched.title} ({sched.status} - Deadline {sched.deadlineDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={!msgContent.trim()}
                    className="px-4 py-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Dispatch</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
