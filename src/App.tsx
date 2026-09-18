import React, { useState } from 'react';
import { 
  INITIAL_USERS, 
  PUBLIC_ENTITIES, 
  NPOS, 
  INITIAL_KPIS, 
  INITIAL_DOCUMENTS, 
  INITIAL_FINANCIALS, 
  INITIAL_AUDIT_FINDINGS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  REPORTING_PERIODS,
  INITIAL_INTERDEPT_MESSAGES
} from './data/seedData';
import { STATEMENT_PROBLEMS } from './data/problemStatementData';
import { 
  User, 
  UserRole, 
  PublicEntity, 
  NPO, 
  KPI, 
  StatutoryDocument, 
  FinancialRecord, 
  AuditFinding, 
  AuditLogEntry, 
  ReportingPeriod, 
  NotificationItem,
  DocumentVersion,
  StatementProblem,
  FundingRequest,
  AdminSchedule,
  PaymentRecord,
  SubmittedFile,
  InterDeptMessage
} from './types';
import {
  INITIAL_FUNDING_REQUESTS,
  INITIAL_SCHEDULES,
  INITIAL_PAYMENT_RECORDS,
  INITIAL_SUBMITTED_FILES
} from './data/persModuleData';

import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProblemStatementView } from './components/ProblemStatementView';
import { EntitiesView } from './components/EntitiesView';
import { KpiView } from './components/KpiView';
import { DocumentsView } from './components/DocumentsView';
import { FinancialsView } from './components/FinancialsView';
import { AuditView } from './components/AuditView';
import { AnalyticsView } from './components/AnalyticsView';
import { AiAssistantView } from './components/AiAssistantView';
import { AuditLogView } from './components/AuditLogView';
import { InterDepartmentalChatView } from './components/InterDepartmentalChatView';

export default function App() {
  // Authentication State: Must show login page first when running the system
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Application Data States
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Default: Dr. Zanele Buthelezi (DSAC Chief Director)
  const [entities, setEntities] = useState<PublicEntity[]>(PUBLIC_ENTITIES);
  const [npos, setNpos] = useState<NPO[]>(NPOS);
  const [kpis, setKpis] = useState<KPI[]>(INITIAL_KPIS);
  const [documents, setDocuments] = useState<StatutoryDocument[]>(INITIAL_DOCUMENTS);
  const [financials] = useState<FinancialRecord[]>(INITIAL_FINANCIALS);
  const [audits, setAudits] = useState<AuditFinding[]>(INITIAL_AUDIT_FINDINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [reportingPeriods] = useState<ReportingPeriod[]>(REPORTING_PERIODS);
  const [problems, setProblems] = useState<StatementProblem[]>(STATEMENT_PROBLEMS);
  const currentPeriod = reportingPeriods[0];

  // User-requested persistent modules for Entity Clerk and Manager
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>(INITIAL_FUNDING_REQUESTS);
  const [schedules, setSchedules] = useState<AdminSchedule[]>(INITIAL_SCHEDULES);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(INITIAL_PAYMENT_RECORDS);
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>(INITIAL_SUBMITTED_FILES);
  const [messages, setMessages] = useState<InterDeptMessage[]>(INITIAL_INTERDEPT_MESSAGES);

  // Navigation and Selection States
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  // User Role Switcher
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'EntityAdministrator' || user.role === 'EntityStaff') {
      setSelectedEntityId(user.entityId || 1); // Set to their entity
    }
  };

  const handleMarkNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Add system audit log entry
  const logAction = (action: string, details: string, targetRecord: string = 'General', entityName: string = 'System') => {
    const newLog: AuditLogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entityName,
      targetRecord,
      details,
      ipAddress: '10.240.12.84'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handlers for Entity Clerk & Management Modules
  const handleSubmitFundingRequest = (newReqData: Omit<FundingRequest, 'id' | 'status' | 'submittedBy' | 'submittedDate'>) => {
    const newReq: FundingRequest = {
      ...newReqData,
      id: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Pending Review',
      submittedBy: currentUser.fullName,
      submittedDate: new Date().toISOString().slice(0, 10)
    };

    setFundingRequests(prev => [newReq, ...prev]);
    logAction(
      'FundingRequestSubmitted',
      `Submitted funding request "${newReq.title}" for R ${newReq.amountRequested.toLocaleString('en-ZA')}`,
      newReq.id,
      newReq.entityName
    );
  };

  const handleApproveFundingRequest = (requestId: string) => {
    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Approved',
          reviewedBy: currentUser.fullName,
          reviewedDate: new Date().toISOString().slice(0, 10)
        };
      }
      return req;
    }));

    const found = fundingRequests.find(r => r.id === requestId);
    logAction(
      'FundingRequestApproved',
      `Executive Manager ${currentUser.fullName} approved funding request ${requestId} for payment`,
      requestId,
      found?.entityName || 'System'
    );
  };

  const handleRejectFundingRequest = (requestId: string, reason: string) => {
    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Rejected',
          rejectionReason: reason,
          reviewedBy: currentUser.fullName,
          reviewedDate: new Date().toISOString().slice(0, 10)
        };
      }
      return req;
    }));

    const found = fundingRequests.find(r => r.id === requestId);
    logAction(
      'FundingRequestRejected',
      `Executive Manager ${currentUser.fullName} rejected funding request ${requestId}. Reason: ${reason}`,
      requestId,
      found?.entityName || 'System'
    );
  };

  // Statutory Appeal Submitted by Entity or NPO Clerk
  const handleAppealFundingRequest = (requestId: string, appealReason: string, docName: string, docSize: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setFundingRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'Under Appeal',
          appealReason,
          appealDate: today,
          appealSupportingDocName: docName || 'Appeal_Substantiating_Evidence.pdf',
          appealSupportingDocSize: docSize || '2.4 MB'
        };
      }
      return r;
    }));

    const found = fundingRequests.find(r => r.id === requestId);
    logAction(
      'FundingAppealSubmitted',
      `Appellant ${currentUser.fullName} submitted statutory appeal for request ${requestId}. Grounds: ${appealReason}`,
      requestId,
      found?.entityName || currentUser.entityName || 'System'
    );
  };

  // Executive Management Decision on Appeal
  const handleReviewAppeal = (requestId: string, approved: boolean, note: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setFundingRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: approved ? 'Approved' : 'Rejected',
          appealReviewNote: note,
          reviewedBy: currentUser.fullName,
          reviewedDate: today
        };
      }
      return r;
    }));

    const found = fundingRequests.find(r => r.id === requestId);
    logAction(
      'FundingAppealReviewed',
      `Executive Manager ${currentUser.fullName} ruled on appeal for ${requestId}: ${approved ? 'APPROVED & REINSTATED' : 'DISMISSED'}. Directive: ${note}`,
      requestId,
      found?.entityName || 'System'
    );
  };

  // Executive Management Statutory Freeze on Entity or NPO Account
  const handleFreezeEntity = (entityId: number, isNpo: boolean, reason: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (isNpo) {
      setNpos(prev => prev.map(n => n.id === entityId ? {
        ...n,
        isFrozen: true,
        freezeReason: reason,
        frozenAt: today,
        frozenBy: currentUser.fullName
      } : n));
    } else {
      setEntities(prev => prev.map(e => e.id === entityId ? {
        ...e,
        isFrozen: true,
        freezeReason: reason,
        frozenAt: today,
        frozenBy: currentUser.fullName
      } : e));
    }

    const orgName = isNpo
      ? npos.find(n => n.id === entityId)?.name
      : entities.find(e => e.id === entityId)?.name;

    logAction(
      'EntityAccountFrozen',
      `Executive Manager ${currentUser.fullName} FROZE statutory account for ${orgName || 'Institution'} under PFMA Section 51 intervention. Grounds: ${reason}`,
      `ORG-${entityId}`,
      orgName || 'System'
    );
  };

  // Executive Management Lift Statutory Freeze
  const handleUnfreezeEntity = (entityId: number, isNpo: boolean, note: string) => {
    if (isNpo) {
      setNpos(prev => prev.map(n => n.id === entityId ? {
        ...n,
        isFrozen: false,
        freezeReason: undefined,
        frozenAt: undefined,
        frozenBy: undefined
      } : n));
    } else {
      setEntities(prev => prev.map(e => e.id === entityId ? {
        ...e,
        isFrozen: false,
        freezeReason: undefined,
        frozenAt: undefined,
        frozenBy: undefined
      } : e));
    }

    const orgName = isNpo
      ? npos.find(n => n.id === entityId)?.name
      : entities.find(e => e.id === entityId)?.name;

    logAction(
      'EntityAccountUnfrozen',
      `Executive Manager ${currentUser.fullName} LIFTED freeze on ${orgName || 'Institution'}. PFMA Clearance: ${note}`,
      `ORG-${entityId}`,
      orgName || 'System'
    );
  };

  const handleMakePayment = (requestId: string, details: { amount: number; paymentMethod: string; bankAccount: string }) => {
    const paymentRef = `PERS-PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().slice(0, 10);
    const targetReq = fundingRequests.find(r => r.id === requestId);

    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Paid',
          paymentRef,
          paidDate: now
        };
      }
      return req;
    }));

    if (targetReq) {
      const newPayment: PaymentRecord = {
        id: `PAY-${Date.now()}`,
        requestId: targetReq.id,
        entityId: targetReq.entityId,
        entityName: targetReq.entityName,
        isNpo: targetReq.isNpo,
        amount: details.amount,
        paymentRef,
        disbursedDate: now,
        disbursedBy: currentUser.fullName,
        category: targetReq.category,
        paymentMethod: details.paymentMethod,
        bankAccountMasked: details.bankAccount,
        treasuryBatchNumber: `BAS-DISB-${Math.floor(80000 + Math.random() * 19999)}`,
        status: 'Disbursed'
      };

      setPaymentRecords(prev => [newPayment, ...prev]);

      // Update entity allocated/received funds
      setEntities(prev => prev.map(ent => {
        if (ent.id === targetReq.entityId && !targetReq.isNpo) {
          return {
            ...ent,
            budgetSpent: ent.budgetSpent + details.amount
          };
        }
        return ent;
      }));

      logAction(
        'PaymentDisbursed',
        `Disbursed payment ${paymentRef} of R ${details.amount.toLocaleString('en-ZA')} to ${targetReq.entityName} via ${details.paymentMethod}`,
        paymentRef,
        targetReq.entityName
      );
    }
  };

  const handleAddSchedule = (scheduleData: Omit<AdminSchedule, 'id'>) => {
    const newSch: AdminSchedule = {
      ...scheduleData,
      id: `SCH-${Date.now()}`
    };

    setSchedules(prev => [newSch, ...prev]);
    logAction(
      'ScheduleCreated',
      `Created deliverable schedule "${newSch.title}" with target deadline ${newSch.deadlineDate}`,
      newSch.title,
      newSch.entityName
    );
  };

  const handleUpdateSchedule = (id: string, updates: Partial<AdminSchedule>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const found = schedules.find(s => s.id === id);
    logAction(
      'ScheduleUpdated',
      `Schedule "${found?.title}" updated. Status: ${updates.status || found?.status}`,
      found?.title || id,
      found?.entityName || 'System'
    );
  };

  const handleSubmitScheduleFile = (scheduleId: string, file: File, notes: string) => {
    const foundSchedule = schedules.find(s => s.id === scheduleId);
    const fileName = file.name || 'Statutory_Schedule_Evidence.pdf';
    const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newFile: SubmittedFile = {
      id: `FILE-${Date.now()}`,
      fileName,
      fileSize: fileSize === '0.0 MB' ? '2.8 MB' : fileSize,
      fileType: fileName.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
      uploadedAt: now,
      uploadedBy: currentUser.fullName,
      entityId: foundSchedule?.entityId || 1,
      entityName: foundSchedule?.entityName || 'National Arts Council of South Africa',
      isNpo: foundSchedule?.isNpo || false,
      scheduleId,
      scheduleTitle: foundSchedule?.title,
      notes,
      sha256Hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852${Math.floor(1000 + Math.random() * 9000)}`
    };

    setSubmittedFiles(prev => [newFile, ...prev]);

    // Update schedule with attached file
    setSchedules(prev => prev.map(s => {
      if (s.id === scheduleId) {
        return {
          ...s,
          attachedFileName: fileName,
          attachedFileSize: newFile.fileSize,
          submittedAt: now,
          status: 'Submitted'
        };
      }
      return s;
    }));

    logAction(
      'FileSubmitted',
      `Submitted evidence file "${fileName}" for milestone "${foundSchedule?.title}"`,
      fileName,
      foundSchedule?.entityName || 'System'
    );
  };

  const handleUploadGeneralFile = (file: File, notes: string, category: string) => {
    const fileName = file.name || 'Statutory_Evidence_Submission.pdf';
    const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newFile: SubmittedFile = {
      id: `FILE-${Date.now()}`,
      fileName,
      fileSize: fileSize === '0.0 MB' ? '3.4 MB' : fileSize,
      fileType: 'application/pdf',
      uploadedAt: now,
      uploadedBy: currentUser.fullName,
      entityId: currentUser.entityId || 1,
      entityName: currentUser.entityName || 'National Arts Council of South Africa',
      isNpo: false,
      notes: `${category}: ${notes}`,
      sha256Hash: `a8b2c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852${Math.floor(1000 + Math.random() * 9000)}`
    };

    setSubmittedFiles(prev => [newFile, ...prev]);
    logAction(
      'FileSubmitted',
      `Uploaded statutory evidence file "${fileName}" (${category})`,
      fileName,
      currentUser.entityName || 'System'
    );
  };

  const handleSendMessage = (msgData: Omit<InterDeptMessage, 'id' | 'timestamp'>) => {
    const newMsg: InterDeptMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMessages(prev => [...prev, newMsg]);

    logAction(
      'CommsDispatch',
      `Dispatched ${newMsg.messageType} communication to ${newMsg.entityName} from ${newMsg.senderName}`,
      newMsg.id,
      newMsg.entityName
    );
  };

  // KPI Update Handler
  const handleUpdateKpi = (updatedKpi: KPI) => {
    setKpis(prev => prev.map(k => k.id === updatedKpi.id ? updatedKpi : k));

    // Update entity compliance rate & risk if needed
    setEntities(prev => prev.map(entity => {
      if (entity.id === updatedKpi.entityId) {
        const entityKpis = kpis.map(k => k.id === updatedKpi.id ? updatedKpi : k).filter(k => k.entityId === entity.id);
        const avgPct = Math.round(entityKpis.reduce((acc, k) => acc + k.percentageAchieved, 0) / (entityKpis.length || 1));
        const hasLag = entityKpis.some(k => k.percentageAchieved < 60);
        return {
          ...entity,
          complianceRate: avgPct,
          riskLevel: hasLag ? 'High' : avgPct >= 80 ? 'Low' : 'Medium'
        };
      }
      return entity;
    }));

    logAction(
      'KPIUpdated',
      `Updated KPI #${updatedKpi.id} actual to ${updatedKpi.actualResult} (${updatedKpi.percentageAchieved}% achieved).`,
      `KPI #${updatedKpi.id}`,
      updatedKpi.entityName
    );
  };

  // Register New Strategic KPI
  const handleCreateKpi = (newKpiData: Omit<KPI, 'id'>) => {
    const newKpi: KPI = {
      ...newKpiData,
      id: Date.now()
    };
    setKpis(prev => [newKpi, ...prev]);
    logAction(
      'KPICreated',
      `Registered strategic performance indicator: "${newKpi.name}" for ${newKpi.entityName}`,
      newKpi.name,
      newKpi.entityName
    );
  };

  // Upload New Document Version
  const handleUploadNewVersion = (docId: number, changeDescription: string, fileName: string, fileSize: string = '4.1 MB') => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const nextVer = doc.currentVersion + 1;
        const newVersionObj: DocumentVersion = {
          id: doc.versions.length + 300 + Math.floor(Math.random() * 100),
          documentId: docId,
          versionNumber: nextVer,
          fileName,
          fileSize,
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedBy: currentUser.fullName,
          changeDescription,
          sha256Hash: `a7f92b${Math.floor(Math.random() * 899999 + 100000)}e84c987213d2f93`,
          comments: []
        };

        return {
          ...doc,
          currentVersion: nextVer,
          status: 'Submitted',
          versions: [...doc.versions, newVersionObj]
        };
      }
      return doc;
    }));

    logAction(
      'DocumentUploaded',
      `Uploaded statutory revision for Document #${docId}: ${fileName} (${changeDescription})`,
      fileName,
      'National Arts Council of South Africa'
    );
  };

  // Add Reviewer Comment
  const handleAddComment = (versionId: number, commentText: string) => {
    setDocuments(prev => prev.map(doc => {
      const updatedVersions = doc.versions.map(v => {
        if (v.id === versionId) {
          return {
            ...v,
            comments: [
              ...v.comments,
              {
                id: Date.now(),
                documentVersionId: versionId,
                userId: currentUser.id,
                userName: currentUser.fullName,
                userRole: currentUser.role,
                commentText,
                createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                isActionRequired: true
              }
            ]
          };
        }
        return v;
      });
      return { ...doc, versions: updatedVersions };
    }));

    logAction('CommentAdded', `Comment posted: "${commentText}"`, `Version #${versionId}`, 'National Arts Council of South Africa');
  };

  // Approve Document
  const handleApproveDocument = (docId: number) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'Approved',
          reviewedBy: currentUser.fullName,
          reviewDate: new Date().toISOString().slice(0, 10)
        };
      }
      return doc;
    }));

    // Update entity compliance to reflect resolution
    setEntities(prev => prev.map(e => {
      if (e.id === 1) {
        return {
          ...e,
          riskLevel: 'Low',
          complianceRate: 85,
          riskReason: 'Q3 statutory report approved with verified bank reconciliation addendum.'
        };
      }
      return e;
    }));

    logAction(
      'DocumentApproved',
      `Statutory compliance sign-off approved by ${currentUser.fullName}. Version committed to permanent archive.`,
      `Document #${docId}`,
      'National Arts Council of South Africa'
    );
  };

  // Request Changes on Document
  const handleRequestChanges = (docId: number, comment: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'Changes Required'
        };
      }
      return doc;
    }));

    const doc = documents.find(d => d.id === docId);
    if (doc && doc.versions.length > 0) {
      handleAddComment(doc.versions[doc.versions.length - 1].id, comment);
    }

    logAction(
      'ChangesRequested',
      `Reviewer flagged submission: "${comment}"`,
      `Document #${docId}`,
      'National Arts Council of South Africa'
    );
  };

  // Log AGSA Finding
  const handleCreateAudit = (newAuditData: Omit<AuditFinding, 'id'>) => {
    const newAudit: AuditFinding = {
      ...newAuditData,
      id: Date.now()
    };
    setAudits(prev => [newAudit, ...prev]);
    logAction(
      'AuditFindingLogged',
      `Logged AGSA finding [${newAudit.findingReference}] (${newAudit.severity}) for ${newAudit.entityName}`,
      newAudit.findingReference,
      newAudit.entityName
    );
  };

  // Update Audit Finding Status
  const handleUpdateAuditStatus = (id: number, status: AuditFinding['status']) => {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    const found = audits.find(a => a.id === id);
    if (found) {
      logAction(
        'AuditRemediationUpdated',
        `AGSA Finding ${found.findingReference} status updated to ${status}`,
        found.findingReference,
        found.entityName
      );
    }
  };

  // Update Statement Problem
  const handleUpdateProblem = (updatedProblem: StatementProblem) => {
    setProblems(prev => prev.map(p => p.id === updatedProblem.id ? updatedProblem : p));
  };

  // If signed out, display official Government Login Gateway
  if (!isAuthenticated) {
    return (
      <LoginView
        users={users}
        onLogin={user => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const pendingDocsCount = documents.filter(d => d.status === 'Submitted' || d.status === 'Changes Required').length;
  const atRiskKpisCount = kpis.filter(k => k.status === 'At Risk').length;
  const openAuditsCount = audits.filter(a => a.status === 'Open').length;

  const currentOrg = currentUser.entityId
    ? (entities.find(e => e.id === currentUser.entityId) || npos.find(n => n.id === currentUser.entityId))
    : undefined;
  const isEntityFrozen = !!currentOrg?.isFrozen;
  const pendingFundingCount = fundingRequests.filter(r => r.status === 'Pending Review').length;
  const pendingAppealsCount = fundingRequests.filter(r => r.status === 'Under Appeal').length;
  const frozenEntitiesCount = entities.filter(e => e.isFrozen).length + npos.filter(n => n.isFrozen).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Official Government Header with Worker Name Banner, Details & Sign Out */}
      <Header
        currentUser={currentUser}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSignOut={() => setIsAuthenticated(false)}
      />

      {/* Main Body with Fixed Sidebar Navigation */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={tab => {
            setActiveTab(tab);
            if (tab !== 'entities') {
              setSelectedEntityId(null);
            }
          }}
          userRole={currentUser.role}
          pendingDocsCount={pendingDocsCount}
          atRiskKpisCount={atRiskKpisCount}
          openAuditsCount={openAuditsCount}
          entityName={currentUser.entityName || currentOrg?.name}
          isEntityFrozen={isEntityFrozen}
          pendingFundingCount={pendingFundingCount}
          pendingAppealsCount={pendingAppealsCount}
          frozenEntitiesCount={frozenEntitiesCount}
        />

        {/* Dynamic View Canvas: Only this main area scrolls when browsing */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-2 sm:p-4">
          {(activeTab === 'dashboard' || activeTab === 'financials') && (
            <DashboardView
              entities={entities}
              npos={npos}
              kpis={kpis}
              documents={documents}
              problems={problems}
              currentPeriod={currentPeriod}
              currentUser={currentUser}
              onSelectEntity={id => {
                setSelectedEntityId(id);
                setActiveTab('entities');
              }}
              onNavigateTab={tab => setActiveTab(tab)}
              fundingRequests={fundingRequests}
              onSubmitFundingRequest={handleSubmitFundingRequest}
              onApproveFundingRequest={handleApproveFundingRequest}
              onRejectFundingRequest={handleRejectFundingRequest}
              onMakePayment={handleMakePayment}
              onAppealFundingRequest={handleAppealFundingRequest}
              onReviewAppeal={handleReviewAppeal}
              onFreezeEntity={handleFreezeEntity}
              onUnfreezeEntity={handleUnfreezeEntity}
              paymentRecords={paymentRecords}
              schedules={schedules}
              onAddSchedule={handleAddSchedule}
              onUpdateSchedule={handleUpdateSchedule}
              onSubmitScheduleFile={handleSubmitScheduleFile}
              submittedFiles={submittedFiles}
              onUploadGeneralFile={handleUploadGeneralFile}
            />
          )}

          {activeTab === 'problems' && (
            <ProblemStatementView
              problems={problems}
              entities={entities}
              currentUser={currentUser}
              onUpdateProblem={handleUpdateProblem}
              onSelectEntity={id => {
                setSelectedEntityId(id);
                setActiveTab('entities');
              }}
              onNavigateTab={tab => setActiveTab(tab)}
              onLogAction={logAction}
            />
          )}

          {activeTab === 'entities' && (
            <EntitiesView
              entities={entities}
              npos={npos}
              kpis={kpis}
              documents={documents}
              audits={audits}
              financials={financials}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'npos' && (
            <EntitiesView
              entities={entities}
              npos={npos}
              kpis={kpis}
              documents={documents}
              audits={audits}
              financials={financials}
              selectedEntityId={null}
              onSelectEntity={setSelectedEntityId}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'kpis' && (
            <KpiView
              kpis={kpis}
              onUpdateKpi={handleUpdateKpi}
              onCreateKpi={handleCreateKpi}
              userRole={currentUser.role}
            />
          )}

          {(activeTab === 'reports' || activeTab === 'documents') && (
            <DocumentsView
              documents={documents}
              currentUser={currentUser}
              onUploadNewVersion={handleUploadNewVersion}
              onAddComment={handleAddComment}
              onApproveDocument={handleApproveDocument}
              onRequestChanges={handleRequestChanges}
            />
          )}

          {activeTab === 'tasks' && (
            <div className="p-6 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-lg font-bold text-white mb-1">
                  Statutory Reporting Tasks & Approaching Deadlines
                </h2>
                <p className="text-xs text-slate-400">
                  Automated notifications, deadline countdowns, and escalation alerts
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-amber-500/40 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">Q3 Quarterly Performance Report Submission</span>
                      <div className="text-slate-400 mt-0.5">Applies to: All 26 Public Entities & 6 Funded NPOs</div>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded font-mono">
                      10 Days Left (31 Jan 2026)
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">Quarterly Financial Reconciliation & Bank Statements</span>
                      <div className="text-slate-400 mt-0.5">PFMA Section 53 compliance verification</div>
                    </div>
                    <span className="bg-sky-500/20 text-sky-300 font-bold px-3 py-1 rounded font-mono">
                      10 Days Left (31 Jan 2026)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audits' && (
            <AuditView
              audits={audits}
              onSelectEntity={id => {
                setSelectedEntityId(id);
                setActiveTab('entities');
              }}
              onCreateAudit={handleCreateAudit}
              onUpdateAuditStatus={handleUpdateAuditStatus}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView entities={entities} />
          )}

          {activeTab === 'ai' && (
            <AiAssistantView
              entities={entities}
              kpis={kpis}
              documents={documents}
              audits={audits}
              onSelectEntity={id => {
                setSelectedEntityId(id);
                setActiveTab('entities');
              }}
            />
          )}

          {activeTab === 'chat' && (
            <InterDepartmentalChatView
              currentUser={currentUser}
              entities={entities}
              npos={npos}
              schedules={schedules}
              submittedFiles={submittedFiles}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'auditlog' && (
            <AuditLogView logs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
}
