export type UserRole = 
  | 'DSACAdministrator'
  | 'DSACManager'
  | 'DSACReviewer'
  | 'EntityAdministrator'
  | 'EntityStaff';

export interface User {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  entityId?: number;
  entityName?: string;
  avatarInitials: string;
}

export type EntityCategory = 
  | 'Performing Arts Council'
  | 'Heritage & Museums'
  | 'Arts & Culture Development'
  | 'Film & Media'
  | 'Language & Literature'
  | 'Sport Integrity & Boxing';

export interface PublicEntity {
  id: number;
  name: string;
  acronym: string;
  registrationNumber: string;
  category: EntityCategory;
  province: string;
  ceoName: string;
  contactEmail: string;
  budgetAllocated: number;
  budgetSpent: number;
  complianceRate: number; // percentage
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number; // 0-100
  riskReason: string;
  activeKpisCount: number;
  pendingReportsCount: number;
  openAuditFindings: number;
  jobsTarget: number;
  jobsCreated: number;
  missedDeadlinesCount?: number;
  status: 'Active' | 'Under Review' | 'Suspended';
  isFrozen?: boolean;
  freezeReason?: string;
  frozenAt?: string;
  frozenBy?: string;
}

export interface NPO {
  id: number;
  name: string;
  acronym: string;
  registrationNumber: string;
  focusArea: string;
  grantAmount: number;
  grantDisbursed: number;
  directorName: string;
  province: string;
  complianceStatus: 'Compliant' | 'Pending Review' | 'At Risk';
  lastReportDate: string;
  isFrozen?: boolean;
  freezeReason?: string;
  frozenAt?: string;
  frozenBy?: string;
}

export interface ReportingPeriod {
  id: number;
  financialYear: string;
  periodName: string; // e.g., "Q3 2025/2026"
  submissionOpenDate: string;
  submissionDeadlineDate: string;
  daysRemaining: number;
  isLocked: boolean;
  status: 'Active' | 'Upcoming' | 'Closed';
}

export interface KPI {
  id: number;
  entityId: number;
  entityName: string;
  name: string;
  strategicObjective: string;
  metricType: 'Number' | 'Percentage' | 'Currency';
  annualTarget: number;
  quarterlyTarget: number;
  actualResult: number;
  percentageAchieved: number;
  startDate: string;
  deadline: string;
  responsiblePerson: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'At Risk' | 'Deadline Missed';
  evidenceDocumentName?: string;
  comments?: string;
  trend: 'Improving' | 'Stable' | 'Declining';
}

export interface DocumentComment {
  id: number;
  documentVersionId: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  commentText: string;
  createdAt: string;
  isActionRequired: boolean;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number; // 1, 2, 3...
  fileName: string;
  fileSize: string;
  sha256Hash: string;
  uploadedBy: string;
  uploadedAt: string;
  changeDescription: string;
  aiSummary?: string;
  aiRiskFlags?: string[];
  comments: DocumentComment[];
}

export interface StatutoryDocument {
  id: number;
  entityId: number;
  entityName: string;
  documentType: 'Strategic Plan' | 'Annual Performance Plan' | 'Quarterly Report' | 'Annual Report' | 'Financial Report' | 'Audit Report' | 'Supporting Evidence';
  reportingPeriod: string;
  currentVersion: number;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Changes Required' | 'Approved' | 'Rejected';
  uploadDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  versions: DocumentVersion[];
}

export interface NotificationItem {
  id: number;
  userId?: number;
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'DeadlineWarning' | 'ReviewRequired' | 'ChangesRequested' | 'Approved' | 'RiskAlert';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AuditFinding {
  id: number;
  entityId: number;
  entityName: string;
  auditYear: string;
  findingReference: string;
  severity: 'Administrative' | 'Minor' | 'Material' | 'Qualified Item';
  description: string;
  correctiveAction: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Overdue';
}

export interface AuditLogEntry {
  id: number;
  userName: string;
  userRole: string;
  action: string;
  entityName: string;
  targetRecord: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface FinancialRecord {
  entityId: number;
  entityName: string;
  periodName: string;
  allocated: number;
  received: number;
  spent: number;
  remaining: number;
  utilisationPct: number;
  quarterlyTranche: number;
}

export type ProblemSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ProblemStatus = 'Critical Risk' | 'Action Required' | 'Under Remediation' | 'Compliant';

export interface ProblemRemediationStep {
  id: string;
  title: string;
  assignedAuthority: string;
  targetDate: string;
  isCompleted: boolean;
  notes: string;
}

export interface StatementProblem {
  id: string;
  code: string; // e.g., "PROB-01"
  title: string;
  category: 
    | 'Financial Mismanagement & UIFW'
    | 'Oversight Capacity & Manual Silos'
    | 'Late Statutory Submissions'
    | 'Recurring AGSA Audit Findings'
    | 'Unverified Reporting & Missing PoE'
    | 'NPO Grant Tranche Misalignment'
    | 'Duplication of Functions & Rationalization';
  verbatimStatement: string;
  legalProvision: string;
  severity: ProblemSeverity;
  status: ProblemStatus;
  primaryRisk: string;
  impactSummary: string;
  affectedEntityIds: number[];
  affectedEntityNames: string[];
  remediationProgress: number; // 0-100%
  remediationSteps: ProblemRemediationStep[];
  directMitigations: string[];
  lastReviewDate: string;
  ministerialEscalated: boolean;
}

export interface FundingRequest {
  id: string;
  entityId: number;
  entityName: string;
  isNpo: boolean;
  title: string;
  category: 'Operational Tranche' | 'Project Grant' | 'Infrastructure' | 'Capacity Building' | 'Capital Works';
  amountRequested: number;
  justification: string;
  submittedBy: string;
  submittedDate: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Paid' | 'Under Appeal' | 'Appeal Approved' | 'Appeal Rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  paymentRef?: string;
  paidDate?: string;
  paidAmount?: number;
  supportingDocumentName?: string;
  supportingDocumentSize?: string;
  appealReason?: string;
  appealDate?: string;
  appealSupportingDocName?: string;
  appealSupportingDocSize?: string;
  appealReviewNote?: string;
}

export interface AdminSchedule {
  id: string;
  entityId: number;
  entityName: string;
  isNpo: boolean;
  title: string;
  description: string;
  deadlineDate: string; // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm
  status: 'Pending' | 'Submitted' | 'Under Review' | 'Approved' | 'Extension Granted' | 'Overdue';
  attachedFileName?: string;
  attachedFileSize?: string;
  submittedAt?: string;
  submittedBy?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  managerNote?: string;
}

export interface PaymentRecord {
  id: string;
  paymentRef: string;
  requestId: string;
  entityId: number;
  entityName: string;
  isNpo: boolean;
  amount: number;
  category: string;
  disbursedBy: string;
  disbursedDate: string;
  paymentMethod: string;
  bankAccountMasked: string;
  status: 'Disbursed' | 'Processed';
  treasuryBatchNumber: string;
}

export interface SubmittedFile {
  id: string;
  entityId: number;
  entityName: string;
  isNpo: boolean;
  fileName: string;
  fileSize: string;
  fileType: string;
  scheduleId?: string;
  scheduleTitle?: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
  sha256Hash: string;
}

export interface InterDeptMessage {
  id: string;
  senderId: number;
  senderName: string;
  senderEmail?: string;
  senderRole: string;
  senderDepartment: 'DSAC Executive Management' | 'Entity / NPO Administration';
  recipientDepartment: 'DSAC Executive Management' | 'Entity / NPO Administration';
  entityId: number;
  entityName: string;
  isNpo: boolean;
  subject?: string;
  content: string;
  timestamp: string;
  messageType: 'chat' | 'official_email' | 'schedule_alert' | 'schedule_booked';
  priority: 'normal' | 'urgent' | 'high_risk';
  relatedScheduleId?: string;
  relatedScheduleTitle?: string;
  isRead?: boolean;
}
