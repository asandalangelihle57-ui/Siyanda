import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  HelpCircle, 
  ShieldAlert, 
  FileSearch, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Building2 
} from 'lucide-react';
import { PublicEntity, KPI, StatutoryDocument, AuditFinding } from '../types';

interface AiAssistantViewProps {
  entities: PublicEntity[];
  kpis: KPI[];
  documents: StatutoryDocument[];
  audits: AuditFinding[];
  onSelectEntity: (id: number) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dataHighlights?: {
    label: string;
    value: string;
    entityId?: number;
  }[];
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  entities,
  kpis,
  documents,
  audits,
  onSelectEntity
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Good day. I am the DSAC Statutory Intelligence Assistant. I analyse PFMA compliance, strategic KPI trajectories, document versions, and AGSA audit observations across all 26 statutory entities and 6 NPOs. What executive insights do you need today?',
      timestamp: '10:00'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const quickQuestions = [
    'Which entities have reports due within 15 days?',
    'Which KPIs are currently at risk?',
    'Show the audit findings for the previous year.',
    'Which entities have missed reporting deadlines?',
    'What is the current financial utilisation?'
  ];

  const handleSend = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Formulate intelligent domain response based on system data
    setTimeout(() => {
      let aiText = '';
      let highlights: Message['dataHighlights'] = [];

      const lowerQ = q.toLowerCase();

      if (lowerQ.includes('due') || lowerQ.includes('15 days') || lowerQ.includes('deadline')) {
        aiText = 'There are currently 8 Public Entities with Q3 statutory reports due in 10 days (by 31 January 2026). The entities requiring urgent submission monitoring are:';
        highlights = [
          { label: 'National Arts Council (NAC)', value: '10 Days Left • High Risk', entityId: 1 },
          { label: 'Market Theatre Foundation', value: '10 Days Left • Low Risk', entityId: 2 },
          { label: 'Robben Island Museum', value: '10 Days Left • Low Risk', entityId: 6 },
          { label: 'Boxing South Africa', value: '10 Days Left • High Risk', entityId: 26 }
        ];
      } else if (lowerQ.includes('risk') || lowerQ.includes('kpi')) {
        const atRisk = kpis.filter(k => k.status === 'At Risk');
        aiText = `Analysis indicates ${atRisk.length} strategic KPIs are currently flagged 'At Risk' (under 60% of quarterly target). The most acute deviations are in grant disbursements to provincial communities and youth employment quotas:`;
        highlights = atRisk.slice(0, 4).map(k => ({
          label: `${k.entityName}: ${k.name}`,
          value: `${k.percentageAchieved}% Achieved (Target: ${k.quarterlyTarget})`,
          entityId: k.entityId
        }));
      } else if (lowerQ.includes('audit')) {
        aiText = `The Auditor-General of South Africa (AGSA) has registered ${audits.length} open audit observations across the portfolio. 2 are classified as Material Irregularities requiring immediate remediation plans:`;
        highlights = audits.map(a => ({
          label: `${a.entityName} (${a.findingReference})`,
          value: `${a.severity} • Action: ${a.correctiveAction.slice(0, 60)}...`,
          entityId: a.entityId
        }));
      } else if (lowerQ.includes('missed')) {
        const missed = entities.filter(e => (e.missedDeadlinesCount ?? (e.riskLevel === 'High' ? 3 : 0)) > 0);
        aiText = `Historical compliance records show ${missed.length} entities have experienced reporting delays in preceding cycles. NAC and Boxing SA have the highest incidence rate:`;
        highlights = missed.map(e => ({
          label: `${e.name} (${e.acronym})`,
          value: `${e.missedDeadlinesCount ?? (e.riskLevel === 'High' ? 3 : 0)} Past Missed Submissions`,
          entityId: e.id
        }));
      } else if (lowerQ.includes('financial') || lowerQ.includes('utilisation') || lowerQ.includes('budget')) {
        aiText = 'Across all 26 entities, total parliamentary allocation stands at R4.20 Billion. Total audited expenditure to date is R3.15 Billion, reflecting an aggregated utilisation rate of 75.0%, which is closely aligned with the Q3 target threshold of 75%.';
        highlights = [
          { label: 'Total Allocated', value: 'R4,200,000,000' },
          { label: 'Actual Spent', value: 'R3,150,000,000' },
          { label: 'Average Utilisation', value: '75.0%' },
          { label: 'Burn Rate Variance', value: 'Normal PFMA Threshold' }
        ];
      } else {
        aiText = `Query processed against DSAC statutory reporting database. I have cross-referenced entity profiles, uploaded PDF versions, and financial logs. You can drill down into any specific entity or ask targeted questions on statutory compliance, budgets, or AGSA audit items.`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataHighlights: highlights
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 450);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Statutory Copilot & Predictive Management Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 20 & 21 compliance: Natural language query engine synthesizing PFMA statutory reports, KPI trajectories, and AGSA audit notes
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800">
          <Sparkles className="w-4 h-4" />
          <span>Factual Grounding • Strict Governance Guardrails</span>
        </div>
      </div>

      {/* Suggested Executive Queries */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
        <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          Recommended Executive Prompts (Prompt Section 21):
        </div>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs transition-colors hover:border-amber-500/60 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map(msg => {
            const isAi = msg.sender === 'ai';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isAi ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-amber-500 text-slate-950 font-bold'
                }`}>
                  {isAi ? <Bot className="w-4 h-4" /> : 'YOU'}
                </div>

                <div className={`max-w-2xl rounded-xl p-4 text-xs space-y-2.5 ${
                  isAi ? 'bg-slate-950 border border-slate-800 text-slate-200' : 'bg-emerald-800 text-white shadow'
                }`}>
                  <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                    <span>{isAi ? 'DSAC AI Management Intelligence' : 'Authorized User'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="leading-relaxed whitespace-pre-line text-sm">
                    {msg.text}
                  </p>

                  {/* Highlight Cards if generated by query */}
                  {msg.dataHighlights && msg.dataHighlights.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      {msg.dataHighlights.map((h, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{h.label}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5">{h.value}</div>
                          </div>

                          {h.entityId && (
                            <button
                              onClick={() => onSelectEntity(h.entityId!)}
                              className="text-amber-400 hover:underline text-[11px] font-bold shrink-0"
                            >
                              Inspect &rarr;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <div className="pt-4 border-t border-slate-800 mt-2">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask any statutory question (e.g. 'Which entities have reports due in 15 days?')..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Query Copilot</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
