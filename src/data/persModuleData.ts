import { FundingRequest, AdminSchedule, PaymentRecord, SubmittedFile } from '../types';

// Helper to format ISO date offset by days
export function getDateOffset(days: number, hours: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
}

export const INITIAL_FUNDING_REQUESTS: FundingRequest[] = [
  {
    id: 'FR-2026-001',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    title: 'Q3 Operational Grant Tranche & Performing Arts Subsidy',
    category: 'Operational Tranche',
    amountRequested: 18500000,
    justification: 'Quarterly statutory allocation for nationwide artist grant disbursements and regional community arts incubation workshops.',
    submittedBy: 'Themba Molefe (Admin Clerk)',
    submittedDate: '2026-01-08',
    status: 'Pending Review',
    supportingDocumentName: 'NAC_Q3_Tranche_Motivation_Budget_Breakdown.pdf',
    supportingDocumentSize: '3.4 MB'
  },
  {
    id: 'FR-2026-002',
    entityId: 19,
    entityName: 'Artscape Theatre Centre',
    isNpo: false,
    title: 'Inclusive Stage Production & Accessible Theatre Equipment',
    category: 'Project Grant',
    amountRequested: 4200000,
    justification: 'Subsidized accessibility staging, sign-language interpretation, and rural youth bus transport for indigenous drama season.',
    submittedBy: 'Thabo Sithole (Admin Clerk)',
    submittedDate: '2026-01-05',
    status: 'Approved',
    reviewedBy: 'Dr. Zanele Buthelezi',
    reviewedDate: '2026-01-12',
    supportingDocumentName: 'Artscape_Accessibility_Equip_Invoice.pdf',
    supportingDocumentSize: '2.1 MB'
  },
  {
    id: 'FR-2026-003',
    entityId: 1, // BASA (NPO ID 1)
    entityName: 'Business and Arts South Africa',
    isNpo: true,
    title: 'Public-Private Matching Grants Tranche (Cycle 2)',
    category: 'Project Grant',
    amountRequested: 4500000,
    justification: 'Disbursement matching grants for 38 vetted SME creative ventures across KwaZulu-Natal and Limpopo.',
    submittedBy: 'Karin Mthembu (NPO Admin)',
    submittedDate: '2025-12-20',
    status: 'Paid',
    reviewedBy: 'Dr. Zanele Buthelezi',
    reviewedDate: '2025-12-23',
    paymentRef: 'PERS-PAY-2025-8841',
    paidDate: '2025-12-28',
    paidAmount: 4500000,
    supportingDocumentName: 'BASA_Matching_Grant_Audit_Report.xlsx',
    supportingDocumentSize: '1.8 MB'
  },
  {
    id: 'FR-2026-004',
    entityId: 24,
    entityName: 'Boxing South Africa',
    isNpo: false,
    title: 'Emergency Legal Sanctioning Defense & Tournament Oversight',
    category: 'Capacity Building',
    amountRequested: 2800000,
    justification: 'Funding for interim tournament sanctioning arbitration panel and national referee anti-corruption seminars.',
    submittedBy: 'Vuyisile Mncube (Admin Clerk)',
    submittedDate: '2026-01-02',
    status: 'Rejected',
    rejectionReason: 'Section 38(1)(j) Non-Compliance: Missing previous quarter expenditure reconciliation and unresolved AGSA audit disclaimer on tournament licensing fees. Resubmit with signed external audit sign-off.',
    reviewedBy: 'Dr. Zanele Buthelezi',
    reviewedDate: '2026-01-10',
    supportingDocumentName: 'BSA_Arbitration_Estimate.pdf',
    supportingDocumentSize: '1.5 MB'
  },
  {
    id: 'FR-2026-005',
    entityId: 3, // SAMRO Foundation (NPO ID 3)
    entityName: 'SAMRO Foundation (Music Development)',
    isNpo: true,
    title: 'Indigenous Music Masterclasses & Composition Bursaries',
    category: 'Capacity Building',
    amountRequested: 3500000,
    justification: 'Tranche funding for 120 music student composition grants and masterclasses at rural tertiary community colleges.',
    submittedBy: 'Candice Jansen (NPO Admin)',
    submittedDate: '2026-01-11',
    status: 'Approved',
    reviewedBy: 'Dr. Zanele Buthelezi',
    reviewedDate: '2026-01-14',
    supportingDocumentName: 'SAMRO_Masterclasses_Q3_Schedule.pdf',
    supportingDocumentSize: '4.8 MB'
  },
  {
    id: 'FR-2026-006',
    entityId: 2,
    entityName: 'National Film and Video Foundation',
    isNpo: false,
    title: 'African International Film Festival Delegation Co-funding',
    category: 'Project Grant',
    amountRequested: 6500000,
    justification: 'Sponsorship grants for 14 emerging South African female documentary filmmakers attending Rotterdam and FESPACO.',
    submittedBy: 'Lerato Kgosi (Admin Clerk)',
    submittedDate: '2026-01-13',
    status: 'Pending Review',
    supportingDocumentName: 'NFVF_Festival_Bursary_Selection.pdf',
    supportingDocumentSize: '5.2 MB'
  },
  {
    id: 'FR-2026-007',
    entityId: 5,
    entityName: 'Robben Island Museum',
    isNpo: false,
    title: 'Ferry Propulsion Refurbishment & Safety Certification',
    category: 'Capital Works',
    amountRequested: 12000000,
    justification: 'Dry-dock mandatory engine overhaul for MV Sikhululekile and passenger maritime safety certificate renewal.',
    submittedBy: 'Mandla Dlamini (Admin Clerk)',
    submittedDate: '2026-01-14',
    status: 'Pending Review',
    supportingDocumentName: 'RIM_Maritime_Surveyor_Costing.pdf',
    supportingDocumentSize: '6.7 MB'
  },
  {
    id: 'FR-2026-008',
    entityId: 4, // SANYOF (NPO ID 4)
    entityName: 'South African National Youth Orchestra Foundation',
    isNpo: true,
    title: 'National Symphonic Youth Winter Camp Infrastructure',
    category: 'Operational Tranche',
    amountRequested: 2200000,
    justification: 'Travel logistics, venue hire, and instrument insurance for 90 youth orchestra members across 9 provinces.',
    submittedBy: 'Sophia Welz (NPO Admin)',
    submittedDate: '2025-11-15',
    status: 'Paid',
    reviewedBy: 'Dr. Zanele Buthelezi',
    reviewedDate: '2025-11-20',
    paymentRef: 'PERS-PAY-2025-7729',
    paidDate: '2025-11-25',
    paidAmount: 2200000,
    supportingDocumentName: 'SANYOF_Camp_Logistics_PoE.pdf',
    supportingDocumentSize: '3.1 MB'
  },
  {
    id: 'FR-2026-009',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    title: 'Provincial Community Arts Audio-Visual Studio Infrastructure Grant',
    category: 'Capital Works',
    amountRequested: 5200000,
    justification: 'Procurement of mobile digital recording studio equipment for community art centers in Eastern Cape and Free State.',
    submittedBy: 'Themba Molefe (Admin Clerk)',
    submittedDate: '2025-12-18',
    status: 'Rejected',
    rejectionReason: 'Procurement Plan Deficiency: Capital expenditure exceeds R5M threshold without ministerial concurrence and lacks 3 independent competitive market quotes under PFMA Section 51(1)(a)(iii). Resubmit with council resolution and verified procurement quotes.',
    reviewedBy: 'Dr. Zanele Buthelezi',
    reviewedDate: '2026-01-04',
    supportingDocumentName: 'NAC_Mobile_Rig_Initial_Quotes.pdf',
    supportingDocumentSize: '3.1 MB'
  },
  {
    id: 'FR-2026-010',
    entityId: 24,
    entityName: 'Boxing South Africa',
    isNpo: false,
    title: 'Interim National Title Tournament Sanctioning & Medical Insurance',
    category: 'Operational Tranche',
    amountRequested: 1950000,
    justification: 'Statutory medical insurance and anti-doping panel funding for upcoming East London national championship card.',
    submittedBy: 'Vuyisile Mncube (Admin Clerk)',
    submittedDate: '2025-12-10',
    status: 'Under Appeal',
    rejectionReason: 'Frozen account status and non-submission of sanctioning ring fee reconciliation.',
    reviewedBy: 'Dr. Zanele Buthelezi',
    reviewedDate: '2025-12-15',
    appealReason: 'Grounds for Appeal: Ring fee reconciliation has now been fully audited and signed off by independent external chartered accountants. Medical insurance provider has verified policy cover for all participating professional fighters under Act 11 of 2001. Requesting emergency conditional approval.',
    appealDate: '2026-01-08',
    appealSupportingDocName: 'BSA_Audited_RingFee_Reconciliation_Signed.pdf',
    appealSupportingDocSize: '4.6 MB'
  }
];

export const INITIAL_ADMIN_SCHEDULES: AdminSchedule[] = [
  // High Risk - Deadline passed (Past Due)
  {
    id: 'SCH-001',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    title: 'Q2 AGSA Remediation Implementation Matrix',
    description: 'Statutory submission of audited actions resolving material irregularities in bursary register.',
    deadlineDate: getDateOffset(-2, 0), // 2 days ago (Past Due - HIGH RISK)
    status: 'Overdue',
    submittedBy: 'Themba Molefe (Admin Clerk)',
    managerNote: 'Statutory deadline elapsed. Urgent submission required under PFMA Section 51.'
  },
  // High Risk - Hourly due / 1 to 2 days left
  {
    id: 'SCH-002',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    title: 'Q3 Bank Reconciliation & Verified Cash Statements',
    description: 'Certified bank reconciliations and cash flow statements for Q3 statutory review.',
    deadlineDate: getDateOffset(1, 14), // approx 38 hours left (HIGH RISK)
    status: 'Pending',
    attachedFileName: 'NAC_Q3_Bank_Statements_Draft.xlsx',
    attachedFileSize: '2.4 MB',
    submittedAt: '2026-01-15 14:20',
    submittedBy: 'Themba Molefe (Admin Clerk)'
  },
  // High Risk - Hourly due (36 hours left)
  {
    id: 'SCH-003',
    entityId: 24,
    entityName: 'Boxing South Africa',
    isNpo: false,
    title: 'Interim Executive Governance Compliance Notice',
    description: 'Updated schedule of sanctioned fights, referee medical insurance policies, and board roster.',
    deadlineDate: getDateOffset(2, 6), // ~2 days left (HIGH RISK)
    status: 'Pending',
    managerNote: 'High risk entity. Ensure all insurance certificates are attached.'
  },
  // Medium Risk - 15 days left (e.g. 7 to 15 days)
  {
    id: 'SCH-004',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    title: 'Q3 Statutory Performance Report & Evidence (PoE)',
    description: 'Formal quarterly report with verified indicators, job creation registers, and beneficiary attendance proofs.',
    deadlineDate: getDateOffset(10, 0), // 10 days left (MEDIUM RISK)
    status: 'Submitted',
    attachedFileName: 'NAC_Q3_Performance_Report_Signed.pdf',
    attachedFileSize: '8.4 MB',
    submittedAt: '2026-01-14 09:30',
    submittedBy: 'Themba Molefe (Admin Clerk)'
  },
  {
    id: 'SCH-005',
    entityId: 19,
    entityName: 'Artscape Theatre Centre',
    isNpo: false,
    title: 'Occupational Health & Fire Safety Audit Sign-off',
    description: 'Western Cape local government compliance certificate for the Opera House stage facilities.',
    deadlineDate: getDateOffset(12, 0), // 12 days left (MEDIUM RISK)
    status: 'Submitted',
    attachedFileName: 'Artscape_Fire_Safety_Signoff_2026.pdf',
    attachedFileSize: '4.1 MB',
    submittedAt: '2026-01-12 11:15',
    submittedBy: 'Thabo Sithole (Admin Clerk)'
  },
  {
    id: 'SCH-006',
    entityId: 1, // BASA (NPO 1)
    entityName: 'Business and Arts South Africa',
    isNpo: true,
    title: 'Quarterly Grant Disbursements Verification Roster',
    description: 'Audited listing of creative enterprise beneficiaries with verified tax clearance pin numbers.',
    deadlineDate: getDateOffset(14, 0), // 14 days left (MEDIUM RISK)
    status: 'Submitted',
    attachedFileName: 'BASA_Q3_Beneficiary_Tax_Clearance.xlsx',
    attachedFileSize: '1.9 MB',
    submittedAt: '2026-01-10 16:45',
    submittedBy: 'Karin Mthembu (NPO Admin)'
  },
  // Low Risk - 30 days left (e.g. 20 to 30 days)
  {
    id: 'SCH-007',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    title: 'Annual Performance Plan (APP) 2026/27 Draft Submission',
    description: 'First draft of Medium Term Expenditure Framework (MTEF) strategic objectives and annual KPI targets.',
    deadlineDate: getDateOffset(26, 0), // 26 days left (LOW RISK)
    status: 'Pending'
  },
  {
    id: 'SCH-008',
    entityId: 2,
    entityName: 'National Film and Video Foundation',
    isNpo: false,
    title: 'Film Incentive Fund Mid-Term Impact Assessment',
    description: 'Comprehensive economic multiplier report analyzing local film crew employment numbers.',
    deadlineDate: getDateOffset(28, 0), // 28 days left (LOW RISK)
    status: 'Submitted',
    attachedFileName: 'NFVF_Economic_Multiplier_Impact_Draft.pdf',
    attachedFileSize: '12.5 MB',
    submittedAt: '2026-01-13 15:10',
    submittedBy: 'Lerato Kgosi (Admin Clerk)'
  },
  {
    id: 'SCH-009',
    entityId: 3, // SAMRO Foundation (NPO 3)
    entityName: 'SAMRO Foundation (Music Development)',
    isNpo: true,
    title: 'Annual Financial Statements & Governance Declarations',
    description: 'Audited AFS signed by independent auditors and director register for DSAC compliance verification.',
    deadlineDate: getDateOffset(29, 0), // 29 days left (LOW RISK)
    status: 'Pending'
  },
  {
    id: 'SCH-010',
    entityId: 7,
    entityName: 'Iziko Museums of South Africa',
    isNpo: false,
    title: 'National Estate Heritage Artifacts Conservation Audit',
    description: 'Verification of 100,000+ national heritage artifacts cataloged across Iziko museum campuses.',
    deadlineDate: getDateOffset(30, 0), // 30 days left (LOW RISK)
    status: 'Pending'
  }
];

export const INITIAL_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'PAY-001',
    paymentRef: 'PERS-PAY-2025-8841',
    requestId: 'FR-2026-003',
    entityId: 1,
    entityName: 'Business and Arts South Africa',
    isNpo: true,
    amount: 4500000,
    category: 'Project Grant',
    disbursedBy: 'Dr. Zanele Buthelezi (DSAC Chief Director)',
    disbursedDate: '2025-12-28',
    paymentMethod: 'National Treasury BAS Transfer (EFT)',
    bankAccountMasked: 'Standard Bank •••• 4902',
    status: 'Disbursed',
    treasuryBatchNumber: 'NT-BAS-2025-12-8821'
  },
  {
    id: 'PAY-002',
    paymentRef: 'PERS-PAY-2025-7729',
    requestId: 'FR-2026-008',
    entityId: 4,
    entityName: 'South African National Youth Orchestra Foundation',
    isNpo: true,
    amount: 2200000,
    category: 'Operational Tranche',
    disbursedBy: 'Dr. Zanele Buthelezi (DSAC Chief Director)',
    disbursedDate: '2025-11-25',
    paymentMethod: 'National Treasury BAS Transfer (EFT)',
    bankAccountMasked: 'Nedbank •••• 7183',
    status: 'Disbursed',
    treasuryBatchNumber: 'NT-BAS-2025-11-7419'
  },
  {
    id: 'PAY-003',
    paymentRef: 'PERS-PAY-2025-6540',
    requestId: 'FR-HIST-001',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    amount: 36250000,
    category: 'Operational Tranche',
    disbursedBy: 'Dr. Zanele Buthelezi (DSAC Chief Director)',
    disbursedDate: '2025-10-15',
    paymentMethod: 'National Treasury Direct Credit (PMF)',
    bankAccountMasked: 'ABSA Bank •••• 9310',
    status: 'Disbursed',
    treasuryBatchNumber: 'NT-BAS-2025-10-6102'
  },
  {
    id: 'PAY-004',
    paymentRef: 'PERS-PAY-2025-5912',
    requestId: 'FR-HIST-002',
    entityId: 19,
    entityName: 'Artscape Theatre Centre',
    isNpo: false,
    amount: 24000000,
    category: 'Operational Tranche',
    disbursedBy: 'Dr. Zanele Buthelezi (DSAC Chief Director)',
    disbursedDate: '2025-10-18',
    paymentMethod: 'National Treasury Direct Credit (PMF)',
    bankAccountMasked: 'First National Bank •••• 1045',
    status: 'Disbursed',
    treasuryBatchNumber: 'NT-BAS-2025-10-5890'
  },
  {
    id: 'PAY-005',
    paymentRef: 'PERS-PAY-2025-4109',
    requestId: 'FR-HIST-003',
    entityId: 2,
    entityName: 'National Film and Video Foundation',
    isNpo: false,
    amount: 40500000,
    category: 'Operational Tranche',
    disbursedBy: 'Dr. Zanele Buthelezi (DSAC Chief Director)',
    disbursedDate: '2025-10-20',
    paymentMethod: 'National Treasury Direct Credit (PMF)',
    bankAccountMasked: 'Standard Bank •••• 3381',
    status: 'Disbursed',
    treasuryBatchNumber: 'NT-BAS-2025-10-4109'
  },
  {
    id: 'PAY-006',
    paymentRef: 'PERS-PAY-2025-3382',
    requestId: 'FR-HIST-004',
    entityId: 3,
    entityName: 'South African Heritage Resources Agency',
    isNpo: false,
    amount: 22250000,
    category: 'Operational Tranche',
    disbursedBy: 'Dr. Zanele Buthelezi (DSAC Chief Director)',
    disbursedDate: '2025-10-22',
    paymentMethod: 'National Treasury Direct Credit (PMF)',
    bankAccountMasked: 'Nedbank •••• 6290',
    status: 'Disbursed',
    treasuryBatchNumber: 'NT-BAS-2025-10-3382'
  }
];

export const INITIAL_SUBMITTED_FILES: SubmittedFile[] = [
  {
    id: 'FILE-001',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    fileName: 'NAC_Q3_Performance_Report_Signed.pdf',
    fileSize: '8.4 MB',
    fileType: 'application/pdf',
    scheduleId: 'SCH-004',
    scheduleTitle: 'Q3 Statutory Performance Report & Evidence (PoE)',
    uploadedBy: 'Themba Molefe (Admin Clerk)',
    uploadedAt: '2026-01-14 09:30',
    notes: 'Signed by Acting CEO and CFO with full annexures on job creation.',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'FILE-002',
    entityId: 1,
    entityName: 'National Arts Council of South Africa',
    isNpo: false,
    fileName: 'NAC_Q3_Bank_Statements_Draft.xlsx',
    fileSize: '2.4 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    scheduleId: 'SCH-002',
    scheduleTitle: 'Q3 Bank Reconciliation & Verified Cash Statements',
    uploadedBy: 'Themba Molefe (Admin Clerk)',
    uploadedAt: '2026-01-15 14:20',
    notes: 'Draft bank reconciliations awaiting final treasury stamp.',
    sha256Hash: 'a7f92b918231e84c987213d2f93bc174826194200874e5088274028374928172'
  },
  {
    id: 'FILE-003',
    entityId: 19,
    entityName: 'Artscape Theatre Centre',
    isNpo: false,
    fileName: 'Artscape_Fire_Safety_Signoff_2026.pdf',
    fileSize: '4.1 MB',
    fileType: 'application/pdf',
    scheduleId: 'SCH-005',
    scheduleTitle: 'Occupational Health & Fire Safety Audit Sign-off',
    uploadedBy: 'Thabo Sithole (Admin Clerk)',
    uploadedAt: '2026-01-12 11:15',
    notes: 'Certified compliant by City of Cape Town Fire & Rescue inspectorate.',
    sha256Hash: 'd41d8cd98f00b204e9800998ecf8427e02938472918374829103847582918274'
  },
  {
    id: 'FILE-004',
    entityId: 1,
    entityName: 'Business and Arts South Africa',
    isNpo: true,
    fileName: 'BASA_Q3_Beneficiary_Tax_Clearance.xlsx',
    fileSize: '1.9 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    scheduleId: 'SCH-006',
    scheduleTitle: 'Quarterly Grant Disbursements Verification Roster',
    uploadedBy: 'Karin Mthembu (NPO Admin)',
    uploadedAt: '2026-01-10 16:45',
    notes: '38 vetted enterprise recipients with valid SARS compliance pins.',
    sha256Hash: 'c4ca4238a0b923820dcc509a6f75849b29184720193847291038472918374628'
  },
  {
    id: 'FILE-005',
    entityId: 2,
    entityName: 'National Film and Video Foundation',
    isNpo: false,
    fileName: 'NFVF_Economic_Multiplier_Impact_Draft.pdf',
    fileSize: '12.5 MB',
    fileType: 'application/pdf',
    scheduleId: 'SCH-008',
    scheduleTitle: 'Film Incentive Fund Mid-Term Impact Assessment',
    uploadedBy: 'Lerato Kgosi (Admin Clerk)',
    uploadedAt: '2026-01-13 15:10',
    notes: 'Field survey of 2,950 creative jobs supported in Gauteng, KZN, and Western Cape.',
    sha256Hash: 'fbba4238a0b923820dcc509a6f75849b81928374619283746192837461928374'
  }
];

// Helper to provide financial history & breakdown for any entity or NPO
export function getEntityFinancialData(entityId: number, isNpo: boolean, entityName: string) {
  // Typical allocation scale
  const baseAllocation = isNpo ? 14000000 : (entityId * 3500000 + 45000000);
  const received = Math.round(baseAllocation * 0.65);
  const spent = Math.round(received * 0.78);
  const remaining = baseAllocation - spent;
  const utilizationPct = Math.round((spent / baseAllocation) * 100);

  const quarters = [
    { period: 'Q1 (Apr - Jun)', allocated: Math.round(baseAllocation * 0.25), received: Math.round(baseAllocation * 0.25), spent: Math.round(baseAllocation * 0.24) },
    { period: 'Q2 (Jul - Sep)', allocated: Math.round(baseAllocation * 0.25), received: Math.round(baseAllocation * 0.25), spent: Math.round(baseAllocation * 0.23) },
    { period: 'Q3 (Oct - Dec)', allocated: Math.round(baseAllocation * 0.25), received: Math.round(baseAllocation * 0.15), spent: Math.round(baseAllocation * 0.18) },
    { period: 'Q4 (Jan - Mar)', allocated: Math.round(baseAllocation * 0.25), received: 0, spent: 0 }
  ];

  const breakdownCategories = [
    { category: 'Personnel & Executive Remuneration', amount: Math.round(spent * 0.38), percentage: 38, icon: 'Users' },
    { category: 'Programme Grants & Artist Subsidies', amount: Math.round(spent * 0.34), percentage: 34, icon: 'Sparkles' },
    { category: 'Operations, Venues & Facilities', amount: Math.round(spent * 0.18), percentage: 18, icon: 'Building' },
    { category: 'Internal & AGSA Audit Compliance', amount: Math.round(spent * 0.06), percentage: 6, icon: 'ShieldCheck' },
    { category: 'Capital Assets & ICT Infrastructure', amount: Math.round(spent * 0.04), percentage: 4, icon: 'Laptop' }
  ];

  return {
    baseAllocation,
    received,
    spent,
    remaining,
    utilizationPct,
    quarters,
    breakdownCategories
  };
}

export const INITIAL_SCHEDULES = INITIAL_ADMIN_SCHEDULES;
