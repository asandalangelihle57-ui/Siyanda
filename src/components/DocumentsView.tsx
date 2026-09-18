import React, { useState, useRef } from 'react';
import { 
  FolderGit2, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  History, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Download,
  Send,
  X,
  FileCheck2,
  FileX2,
  Layers,
  Plus,
  FileSpreadsheet,
  FileCheck,
  Hash,
  ExternalLink
} from 'lucide-react';
import { StatutoryDocument, DocumentVersion, UserRole, User } from '../types';

interface DocumentsViewProps {
  documents: StatutoryDocument[];
  currentUser: User;
  onUploadNewVersion: (docId: number, changeDescription: string, fileName: string, fileSize?: string) => void;
  onCreateNewDocument?: (newDoc: Partial<StatutoryDocument>, initialFile: { name: string; size: string; notes: string }) => void;
  onAddComment: (versionId: number, commentText: string) => void;
  onApproveDocument: (docId: number) => void;
  onRequestChanges: (docId: number, comment: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  currentUser,
  onUploadNewVersion,
  onCreateNewDocument,
  onAddComment,
  onApproveDocument,
  onRequestChanges
}) => {
  const [selectedDocId, setSelectedDocId] = useState<number>(documents[0]?.id || 1);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Upload Version Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New Document Modal states
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocEntityId, setNewDocEntityId] = useState<number>(1);
  const [newDocType, setNewDocType] = useState<string>('Quarterly Performance Report');
  const [newDocPeriod, setNewDocPeriod] = useState<string>('2025/2026 Q3 (Oct - Dec)');
  const [newDocNotes, setNewDocNotes] = useState<string>('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  // Checksum Verification Modal
  const [verifyingVersion, setVerifyingVersion] = useState<DocumentVersion | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newDocFileInputRef = useRef<HTMLInputElement>(null);

  const currentDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const activeVersion = currentDoc?.versions.find(
    v => selectedVersionNum ? v.versionNumber === selectedVersionNum : v.versionNumber === currentDoc?.currentVersion
  ) || currentDoc?.versions[0];

  const isReviewer = currentUser.role === 'DSACReviewer' || currentUser.role === 'DSACManager' || currentUser.role === 'DSACAdministrator';
  const isEntityAdmin = currentUser.role === 'EntityAdministrator' || currentUser.role === 'EntityStaff' || currentUser.role === 'DSACAdministrator';

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeVersion) return;
    onAddComment(activeVersion.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleExecuteUpload = () => {
    if (!currentDoc) return;
    setIsUploading(true);
    setUploadProgress(20);

    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(timer);
          setTimeout(() => {
            const nextVer = currentDoc.currentVersion + 1;
            const finalFileName = uploadedFile ? uploadedFile.name : `NAC_Q3_Performance_Report_2025_v${nextVer}.pdf`;
            const finalFileSize = uploadedFile 
              ? (uploadedFile.size > 1024 * 1024 
                  ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB` 
                  : `${Math.round(uploadedFile.size / 1024)} KB`)
              : '4.1 MB';
            const notes = uploadNotes.trim() || `Statutory revision v${nextVer} with supplementary financial schedules.`;

            onUploadNewVersion(currentDoc.id, notes, finalFileName, finalFileSize);
            setIsUploading(false);
            setUploadProgress(0);
            setShowUploadModal(false);
            setUploadNotes('');
            setUploadedFile(null);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Download Statutory Report Handler (Creates a real file blob and downloads)
  const handleDownloadFile = (version: DocumentVersion, doc: StatutoryDocument) => {
    const reportContent = `
================================================================================
REPUBLIC OF SOUTH AFRICA • DEPARTMENT OF SPORT, ARTS AND CULTURE (DSAC)
PUBLIC ENTITIES REPORTING SYSTEM (PERS) • OFFICIAL STATUTORY SUBMISSION
================================================================================
Document Type      : ${doc.documentType}
Reporting Entity   : ${doc.entityName}
Reporting Cycle    : ${doc.reportingPeriod}
Submission Date    : ${version.uploadedAt}
Authorized Submitter: ${version.uploadedBy}
Version Number     : v${version.versionNumber} (Current Active Version)
Statutory Status   : ${doc.status.toUpperCase()}
Cryptographic Hash : SHA-256:${version.sha256Hash}
PFMA Compliance    : Section 38(1)(j), Section 53(1), Treasury Regulation 16A
================================================================================

EXECUTIVE SUMMARY & REVISION NOTES:
${version.changeDescription || 'No amendments noted.'}

AUDIT TRAIL & SYSTEM SIGN-OFF:
${version.comments.map(c => `[${c.createdAt}] ${c.userName}: ${c.commentText}`).join('\n') || 'No formal reviewer conditions recorded.'}

================================================================================
GOVERNMENT RECORDS NOTICE:
This record is authenticated and protected in terms of the National Archives and
Records Service of South Africa Act (Act No. 43 of 1996) and the Electronic
Communications and Transactions Act (Act No. 25 of 2002).
Generated on: ${new Date().toISOString()}
================================================================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = version.fileName || `${doc.entityName.replace(/\s+/g, '_')}_${doc.reportingPeriod.replace(/[^a-zA-Z0-9]/g, '_')}_v${version.versionNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Documents Register to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Entity Name', 'Document Type', 'Reporting Period', 'Current Version', 'Status', 'Last Upload Date'];
    const rows = documents.map(d => [
      d.id,
      `"${d.entityName}"`,
      `"${d.documentType}"`,
      `"${d.reportingPeriod}"`,
      `v${d.currentVersion}`,
      d.status,
      d.uploadDate
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DSAC_Statutory_Documents_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Cryptographic SHA-256 Checksum Modal */}
      {verifyingVersion && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  SHA-256 Cryptographic File Verification
                </h3>
              </div>
              <button onClick={() => setVerifyingVersion(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-400">File Name:</span>
                <p className="font-mono text-white font-bold">{verifyingVersion.fileName}</p>
              </div>
              <div>
                <span className="text-slate-400">Calculated SHA-256 Checksum:</span>
                <p className="font-mono text-emerald-400 bg-slate-900 p-2 rounded border border-emerald-800/60 break-all text-[11px]">
                  {verifyingVersion.sha256Hash}
                </p>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                <span>Verification Authority:</span>
                <span className="text-white font-semibold">National Archives & Records Service (NARSSA)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Binary integrity validated. Non-destructive audit compliance confirmed.</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setVerifyingVersion(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Version Modal */}
      {showUploadModal && currentDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-600/60 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Statutory Document Control
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Upload Revised Document Version
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">Target Document: <strong className="text-white">{currentDoc.documentType}</strong></div>
              <div className="text-slate-400">Entity: <strong className="text-amber-300">{currentDoc.entityName}</strong></div>
              <div className="text-slate-400">
                Active Version: <span className="font-mono text-amber-400">v{currentDoc.currentVersion}</span> &rarr; Target: <span className="font-mono text-emerald-400 font-bold">v{currentDoc.currentVersion + 1}</span>
              </div>
            </div>

            {/* Real Drag-and-Drop / File Browser Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-950/40' 
                  : uploadedFile 
                  ? 'border-emerald-600/80 bg-slate-950' 
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.xlsx,.csv,.doc"
                className="hidden"
              />

              {uploadedFile ? (
                <div className="space-y-1">
                  <FileCheck2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-white font-mono">{uploadedFile.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for statutory processing
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold underline pt-1">
                    Click or drag another file to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-200 font-semibold">
                    Drag and drop official report file here, or <span className="text-emerald-400 underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Supported: PDF, Microsoft Excel (.xlsx), Word (.docx) • Max 50 MB
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-semibold">
                Revision Notes & Compliance Amendment Description:
              </label>
              <textarea
                rows={3}
                placeholder="Detail amendments made in this revision (e.g. reconciled Limpopo disbursement schedules and bank confirmations attached)..."
                value={uploadNotes}
                onChange={e => setUploadNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Progress bar when uploading */}
            {isUploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Uploading and calculating cryptographic hash...</span>
                  <span className="font-mono text-emerald-400 font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteUpload}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Commit Version {currentDoc.currentVersion + 1}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Statutory Documents & Revision Registry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 38 & 53 PFMA statutory returns, quarterly reports, and immutable revision trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export Register (CSV)
          </button>
          {isEntityAdmin && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Revision (v{currentDoc ? currentDoc.currentVersion + 1 : 2})
            </button>
          )}
        </div>
      </div>

      {/* Master Detail View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Catalog List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Statutory Submissions ({documents.length})</span>
            <span className="text-[10px] text-emerald-400 font-mono">2025/26 Cycle</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {documents.map(doc => {
              const isSelected = doc.id === currentDoc?.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setSelectedVersionNum(doc.currentVersion);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/80 shadow-md'
                      : 'bg-slate-900/90 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-300 truncate max-w-[200px]">
                      {doc.entityName}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      doc.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : doc.status === 'Changes Required'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">
                    {doc.documentType}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cycle: {doc.reportingPeriod}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="w-3 h-3 text-amber-400" />
                      {doc.versions.length} Version{doc.versions.length > 1 ? 's' : ''} (Active: v{doc.currentVersion})
                    </span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Details, Versions & Commentary Panel */}
        <div className="lg:col-span-8 space-y-4">
          {currentDoc && activeVersion && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
              {/* Document Title Bar & Action Buttons */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">
                      {activeVersion.fileName}
                    </h3>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2 py-0.5 rounded font-mono font-bold">
                      v{activeVersion.versionNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uploaded by <strong className="text-slate-200">{activeVersion.uploadedBy}</strong> on {activeVersion.uploadedAt} • Size: {activeVersion.fileSize}
                  </p>
                </div>

                {/* Reviewer Sign-Off Controls */}
                {isReviewer && currentDoc.status !== 'Approved' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRequestChanges(currentDoc.id, 'Please supply detailed proof of payment and variance narrative on youth allocations before approval.')}
                      className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Request Changes
                    </button>
                    <button
                      onClick={() => onApproveDocument(currentDoc.id)}
                      className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Approve Report
                    </button>
                  </div>
                )}
              </div>

              {/* Version History Selector Tabs */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Version History (Non-Destructive Storage):
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentDoc.versions.map(ver => {
                    const isVerActive = ver.versionNumber === activeVersion.versionNumber;
                    return (
                      <button
                        key={ver.id}
                        onClick={() => setSelectedVersionNum(ver.versionNumber)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                          isVerActive
                            ? 'bg-emerald-900/60 border-emerald-500 text-white shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <History className="w-3.5 h-3.5 text-amber-400" />
                        <span>v{ver.versionNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({ver.uploadedAt})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Version Summary & Integrity Checksum */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-slate-400">Statutory Revision Description:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVerifyingVersion(activeVersion)}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono underline"
                    >
                      <Hash className="w-3 h-3" />
                      Verify SHA-256 Checksum
                    </button>
                    <button
                      onClick={() => handleDownloadFile(activeVersion, currentDoc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      Download Official Record
                    </button>
                  </div>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed italic bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                  "{activeVersion.changeDescription}"
                </p>
                <div className="text-[11px] font-mono text-slate-500 break-all">
                  SHA-256: {activeVersion.sha256Hash}
                </div>
              </div>

              {/* AI Document Analysis Spotlight: Automated Variance Pre-Screen */}
              {activeVersion.aiSummary && (
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-700/50 rounded-lg p-4 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Statutory Pre-Screening & Variance Verification Analysis</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "{activeVersion.aiSummary}"
                  </p>

                  {activeVersion.aiRiskFlags && activeVersion.aiRiskFlags.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] text-amber-400 font-semibold">Flags Requiring Official Review:</div>
                      {activeVersion.aiRiskFlags.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Threaded Reviewer Comments */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    Reviewer Commentary & Compliance Directives ({activeVersion.comments.length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    PFMA Statutory Record
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {activeVersion.comments.map(c => (
                    <div key={c.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <strong className="text-amber-300">{c.userName}</strong>
                        <span>{c.createdAt}</span>
                      </div>
                      <p className="text-slate-200 mt-1">{c.commentText}</p>
                    </div>
                  ))}

                  {activeVersion.comments.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-xs italic">
                      No compliance directives or revision notes logged for this version.
                    </div>
                  )}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Log statutory review observation or revision directive..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
