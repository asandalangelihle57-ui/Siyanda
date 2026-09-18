import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Coins, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { 
  PublicEntity, 
  NPO, 
  KPI, 
  StatutoryDocument, 
  ReportingPeriod, 
  StatementProblem,
  FundingRequest,
  AdminSchedule,
  PaymentRecord,
  SubmittedFile,
  User
} from '../types';
import { EntityClerkDashboard } from './EntityClerkDashboard';
import { ManagementDashboard } from './ManagementDashboard';

interface DashboardViewProps {
  entities: PublicEntity[];
  npos: NPO[];
  kpis: KPI[];
  documents: StatutoryDocument[];
  problems?: StatementProblem[];
  currentPeriod: ReportingPeriod;
  currentUser: User;
  onSelectEntity: (entityId: number) => void;
  onNavigateTab: (tab: any) => void;

  // New persistent modules
  fundingRequests: FundingRequest[];
  onSubmitFundingRequest: (request: Omit<FundingRequest, 'id' | 'status' | 'submittedBy' | 'submittedDate'>) => void;
  onApproveFundingRequest: (requestId: string) => void;
  onRejectFundingRequest: (requestId: string, reason: string) => void;
  onAppealFundingRequest?: (requestId: string, appealReason: string, docName: string, docSize: string) => void;
  onReviewAppeal?: (requestId: string, approved: boolean, note: string) => void;
  onFreezeEntity?: (entityId: number, isNpo: boolean, reason: string) => void;
  onUnfreezeEntity?: (entityId: number, isNpo: boolean, note: string) => void;
  onMakePayment: (requestId: string, paymentDetails: { amount: number; paymentMethod: string; bankAccount: string }) => void;
  paymentRecords: PaymentRecord[];
  schedules: AdminSchedule[];
  onAddSchedule: (schedule: Omit<AdminSchedule, 'id'>) => void;
  onUpdateSchedule: (id: string, updates: Partial<AdminSchedule>) => void;
  onSubmitScheduleFile: (scheduleId: string, file: File, notes: string) => void;
  submittedFiles: SubmittedFile[];
  onUploadGeneralFile: (file: File, notes: string, category: string) => void;
  activeSection?: 'schedules_and_funding' | 'reports_and_files';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entities,
  npos,
  kpis,
  documents,
  problems,
  currentPeriod,
  currentUser,
  onSelectEntity,
  onNavigateTab,
  fundingRequests,
  onSubmitFundingRequest,
  onApproveFundingRequest,
  onRejectFundingRequest,
  onAppealFundingRequest,
  onReviewAppeal,
  onFreezeEntity,
  onUnfreezeEntity,
  onMakePayment,
  paymentRecords,
  schedules,
  onAddSchedule,
  onUpdateSchedule,
  onSubmitScheduleFile,
  submittedFiles,
  onUploadGeneralFile,
  activeSection
}) => {
  // Strictly enforce role-based dashboard rendering (No switching panels)
  const isEntityClerkUser = currentUser.role === 'EntityAdministrator' || currentUser.role === 'EntityStaff';

  // For entity clerk, determine if assigned to an NPO or Entity
  const assignedNpo = npos.find(n => n.id === currentUser.entityId || n.name === currentUser.entityName);
  const assignedOrgId = currentUser.entityId || 1;
  const assignedIsNpo = !!assignedNpo;

  return (
    <div className="p-3 sm:p-5 space-y-5 animate-fadeIn">
      {isEntityClerkUser ? (
        <EntityClerkDashboard
          entities={entities}
          npos={npos}
          currentUser={currentUser}
          activeEntityId={assignedOrgId}
          activeIsNpo={assignedIsNpo}
          onSelectEntity={() => {}}
          fundingRequests={fundingRequests}
          onSubmitFundingRequest={onSubmitFundingRequest}
          onAppealFundingRequest={onAppealFundingRequest}
          schedules={schedules}
          onAddSchedule={onAddSchedule}
          onUpdateSchedule={onUpdateSchedule}
          onSubmitScheduleFile={onSubmitScheduleFile}
          submittedFiles={submittedFiles}
          onUploadGeneralFile={onUploadGeneralFile}
          activeSection={activeSection}
        />
      ) : (
        <ManagementDashboard
          entities={entities}
          npos={npos}
          currentUser={currentUser}
          fundingRequests={fundingRequests}
          onApproveFundingRequest={onApproveFundingRequest}
          onRejectFundingRequest={onRejectFundingRequest}
          onReviewAppeal={onReviewAppeal}
          onFreezeEntity={onFreezeEntity}
          onUnfreezeEntity={onUnfreezeEntity}
          onMakePayment={onMakePayment}
          paymentRecords={paymentRecords}
          schedules={schedules}
          onUpdateScheduleByManager={onUpdateSchedule}
          submittedFiles={submittedFiles}
          onSelectEntityForView={() => {}}
        />
      )}
    </div>
  );
};
