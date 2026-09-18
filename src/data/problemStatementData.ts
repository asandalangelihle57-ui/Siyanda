import { StatementProblem } from '../types';

export const STATEMENT_PROBLEMS: StatementProblem[] = [
  {
    id: 'prob-01',
    code: 'PROB-01',
    title: 'Fruitless, Wasteful & Irregular Expenditure (UIFW) and Financial Deviations',
    category: 'Financial Mismanagement & UIFW',
    verbatimStatement: 
      'Public entities reporting to DSAC have experienced high incidents of fruitless, wasteful, and irregular expenditure. Persistent discrepancies exist between approved parliamentary allocations and actual quarterly expenditure, compounded by uncompetitive procurement deviations and missing proof of grant reconciliation with bank statements.',
    legalProvision: 'PFMA Act 1 of 1999 Section 51(1)(b)(ii), Section 53(4) & National Treasury Regulation 16A6.1',
    severity: 'Critical',
    status: 'Critical Risk',
    primaryRisk: 'Material Irregularity referral by AGSA, parliamentary censure, and unrecovered public funds.',
    impactSummary: 'R16.6M in unregularised expenditure identified across 3 entities; 1 missed grant-to-bank statement reconciliation.',
    affectedEntityIds: [1, 18, 3],
    affectedEntityNames: [
      'National Arts Council of South Africa (NAC)',
      'South African State Theatre (SAST)',
      'South African Heritage Resources Agency (SAHRA)'
    ],
    remediationProgress: 45,
    remediationSteps: [
      {
        id: 'step-01-1',
        title: 'Zero-Deviation SCM Gateway Implementation',
        assignedAuthority: 'DSAC Chief Financial Officer',
        targetDate: '2026-02-15',
        isCompleted: true,
        notes: 'Mandatory Treasury deviation approval required before issuing procurement contracts > R500,000.'
      },
      {
        id: 'step-01-2',
        title: 'Mandatory Bank Reconciliation Upload Protocol',
        assignedAuthority: 'NAC Chief Financial Officer',
        targetDate: '2026-01-31',
        isCompleted: false,
        notes: 'Section 53 compliance block: entity cannot submit Q3 report without certified bank statement ledger.'
      },
      {
        id: 'step-01-3',
        title: 'Forensic Audit of Overtime Ceiling Breaches',
        assignedAuthority: 'SAST Accounting Authority',
        targetDate: '2026-02-28',
        isCompleted: false,
        notes: 'Biometric scheduling controls instituted to eliminate unauthorized overtime shifts.'
      }
    ],
    directMitigations: [
      'Automated financial variance alerts on any quarterly line item deviating > 10% from APP budget',
      'Digital PFMA Section 53 certification checklist prior to quarterly submission approval',
      'Mandatory double-signoff by CFO and Accounting Authority before fund drawdown'
    ],
    lastReviewDate: '2026-01-15',
    ministerialEscalated: true
  },
  {
    id: 'prob-02',
    code: 'PROB-02',
    title: 'Inadequate Departmental Oversight Capacity & Disparate Reporting Silos',
    category: 'Oversight Capacity & Manual Silos',
    verbatimStatement: 
      'The Department of Sport, Arts and Culture has been under-capacitated to effectively oversee 26 Public Entities and 6 NPOs, relying historically on manual spreadsheets, uncoordinated email chains, and physical paper submissions. This creates operational blind spots and delayed detection of non-compliance.',
    legalProvision: 'PFMA Section 38(1)(j), Public Service Regulations 2016, Minimum Information Security Standards (MISS)',
    severity: 'High',
    status: 'Under Remediation',
    primaryRisk: 'Inability of the Executive Authority to account accurately to Parliament and Standing Committee on Public Accounts (SCOPA).',
    impactSummary: 'Elimination of fragmented email threads across 32 statutory bodies; 100% data consolidated in PERS repository.',
    affectedEntityIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    affectedEntityNames: [
      'All 26 Public Entities and 6 Funded NPOs'
    ],
    remediationProgress: 88,
    remediationSteps: [
      {
        id: 'step-02-1',
        title: 'Centralised PERS Digital Infrastructure Deployment',
        assignedAuthority: 'Chief Director: Entities Oversight',
        targetDate: '2026-01-05',
        isCompleted: true,
        notes: 'Full multi-entity database live with role-based access control and Republic of SA GovID integration.'
      },
      {
        id: 'step-02-2',
        title: 'Standardised Statutory Reporting Templates & Field Rules',
        assignedAuthority: 'DSAC Senior Statutory Reviewer',
        targetDate: '2026-01-10',
        isCompleted: true,
        notes: 'Uniform APP, quarterly target, and financial reconciliation schemas enforced across all entities.'
      },
      {
        id: 'step-02-3',
        title: 'Capacity Building & Training for Entity M&E Officers',
        assignedAuthority: 'DSAC Capacity Development Unit',
        targetDate: '2026-02-20',
        isCompleted: false,
        notes: 'System training underway for 54 reporting officers across provincial hubs.'
      }
    ],
    directMitigations: [
      'Single consolidated executive dashboard showing live status of all 26 entities & 6 NPOs',
      'Automated data validation rules preventing corrupted or incomplete statutory submissions',
      'Immutable system audit log recording every user action, timestamp, and IP address'
    ],
    lastReviewDate: '2026-01-14',
    ministerialEscalated: false
  },
  {
    id: 'prob-03',
    code: 'PROB-03',
    title: 'Chronic Late Submissions & Untracked Statutory Deadlines',
    category: 'Late Statutory Submissions',
    verbatimStatement: 
      'Public entities consistently fail to submit their quarterly performance and financial documentation within the required 30 days post-quarter. Without an automated early warning alert and deadline tracking mechanism, statutory non-compliance escalates unchecked.',
    legalProvision: 'PFMA Section 53, National Treasury Regulation 29.3.1 (Quarterly Submission Windows)',
    severity: 'High',
    status: 'Action Required',
    primaryRisk: 'Breach of PFMA statutory deadlines resulting in delayed Departmental Annual Reports to Parliament and National Treasury withholding of subsequent tranches.',
    impactSummary: '8 entities currently have outstanding Q3 submissions with 10 days remaining before statutory deadline of 31 January 2026.',
    affectedEntityIds: [1, 24, 21, 5, 18],
    affectedEntityNames: [
      'National Arts Council (NAC)',
      'Boxing South Africa (BSA)',
      'Performing Arts Centre of the Free State (PACOFS)',
      'Robben Island Museum (RIM)',
      'South African State Theatre (SAST)'
    ],
    remediationProgress: 60,
    remediationSteps: [
      {
        id: 'step-03-1',
        title: 'Automated 10-Day Early Warning Alert Engine',
        assignedAuthority: 'DSAC System Administrator',
        targetDate: '2026-01-08',
        isCompleted: true,
        notes: 'Real-time countdown banner activated on all executive and entity user dashboards.'
      },
      {
        id: 'step-03-2',
        title: 'Section 38 Statutory Compliance Notices Issued',
        assignedAuthority: 'Chief Director: Entities Oversight',
        targetDate: '2026-01-20',
        isCompleted: true,
        notes: 'Formal warning letters dispatched to 8 outstanding entities reminding of 31 January deadline.'
      },
      {
        id: 'step-03-3',
        title: 'Automated Cycle Lockdown and Override Protocol',
        assignedAuthority: 'DSAC Executive Committee',
        targetDate: '2026-01-31',
        isCompleted: false,
        notes: 'System will automatically lock submissions at 23:59 on 31 Jan; late submissions require formal DG sign-off.'
      }
    ],
    directMitigations: [
      'Automated daily countdown alert to Entity Administrators starting 15 days before deadline',
      'One-click statutory escalation to CEO and Council Chairperson upon reaching 5 days remaining',
      'Real-time statutory status flags (On Track, Due Soon, Overdue, Locked)'
    ],
    lastReviewDate: '2026-01-16',
    ministerialEscalated: true
  },
  {
    id: 'prob-04',
    code: 'PROB-04',
    title: 'Recurring Auditor-General (AGSA) Material Findings & Unresolved Action Plans',
    category: 'Recurring AGSA Audit Findings',
    verbatimStatement: 
      'A recurring and systemic challenge is the low percentage of public entities achieving unqualified audit opinions without findings. Material findings around procurement deviations, inaccurate performance information, and unverified assets are carried over year after year without tracked corrective action.',
    legalProvision: 'Public Audit Act No. 25 of 2004 (amended 2018), PFMA Section 55 (Annual Financial Statements)',
    severity: 'Critical',
    status: 'Critical Risk',
    primaryRisk: 'Issuance of Material Irregularity certificates by the Auditor-General and personal financial liability for Accounting Authorities.',
    impactSummary: '4 active material findings logged for 2024/2025; 2 past due dates without resolved evidence.',
    affectedEntityIds: [1, 3, 18],
    affectedEntityNames: [
      'National Arts Council of South Africa (NAC)',
      'South African Heritage Resources Agency (SAHRA)',
      'South African State Theatre (SAST)'
    ],
    remediationProgress: 52,
    remediationSteps: [
      {
        id: 'step-04-1',
        title: 'Digital AGSA Finding & Corrective Action Plan (CAP) Register',
        assignedAuthority: 'DSAC Chief Audit Executive',
        targetDate: '2026-01-10',
        isCompleted: true,
        notes: 'All AGSA audit management letter points codified with designated owners and target dates.'
      },
      {
        id: 'step-04-2',
        title: 'Procurement Bid Adjudication Reconstitution at NAC',
        assignedAuthority: 'NAC Chief Financial Officer',
        targetDate: '2026-02-28',
        isCompleted: false,
        notes: 'Independent bid committee appointed to address AGSA-2024-NAC-002 procurement deviation.'
      },
      {
        id: 'step-04-3',
        title: 'Physical Heritage Asset Barcode Reconciliation at SAHRA',
        assignedAuthority: 'SAHRA Heritage Asset Officer',
        targetDate: '2026-03-15',
        isCompleted: false,
        notes: 'Barcoding underway across 2 regional sites to reconcile physical tags with asset register.'
      }
    ],
    directMitigations: [
      'Integrated AGSA Tracker with severity classification (Material, Qualified, Minor, Administrative)',
      'Bi-weekly automated status alerts to Audit and Risk Committees (ARC)',
      'Mandatory documentary evidence attachment required before any finding can be marked Resolved'
    ],
    lastReviewDate: '2026-01-12',
    ministerialEscalated: true
  },
  {
    id: 'prob-05',
    code: 'PROB-05',
    title: 'Inaccurate Performance Reporting, Phantom Indicators & Missing Portfolios of Evidence (PoE)',
    category: 'Unverified Reporting & Missing PoE',
    verbatimStatement: 
      'Allegations and audit queries highlight risks of untruthful, unverified, or exaggerated reporting to Parliamentary Committees. Entities have submitted performance results without verifiable Portfolios of Evidence (PoE), particularly in job creation statistics, bursaries, and youth quotas.',
    legalProvision: 'National Treasury Framework for Managing Programme Performance Information (FMPPI), PFMA Section 40(1)',
    severity: 'Critical',
    status: 'Action Required',
    primaryRisk: 'Misleading parliamentary oversight bodies, fraudulent expenditure allocations, and reputational damage to the Department.',
    impactSummary: '18 KPIs currently lagging below 60% trajectory; 1 statutory document rejected for unverified evidence.',
    affectedEntityIds: [1, 24, 19, 21],
    affectedEntityNames: [
      'National Arts Council of South Africa (NAC)',
      'Boxing South Africa (BSA)',
      'Artscape Theatre Centre',
      'Performing Arts Centre of the Free State (PACOFS)'
    ],
    remediationProgress: 65,
    remediationSteps: [
      {
        id: 'step-05-1',
        title: 'Mandatory Portfolio of Evidence (PoE) Attachment Engine',
        assignedAuthority: 'DSAC Statutory Review Team',
        targetDate: '2026-01-10',
        isCompleted: true,
        notes: 'Quarterly KPI updates blocked in system without accompanying PDF/documentary evidence link.'
      },
      {
        id: 'step-05-2',
        title: 'SHA-256 Cryptographic Checksum & Document Immutability',
        assignedAuthority: 'PERS Technical Governance',
        targetDate: '2026-01-12',
        isCompleted: true,
        notes: 'NARSSA-compliant digital hashing guarantees evidentiary files cannot be tampered with post-submission.'
      },
      {
        id: 'step-05-3',
        title: 'Field Audit Sampling for Presidential Employment Stimulus (PES) Jobs',
        assignedAuthority: 'Chief Director: Entities Oversight',
        targetDate: '2026-02-10',
        isCompleted: false,
        notes: 'Physical verification of 30% sample of youth beneficiaries on NAC and Artscape job registers.'
      }
    ],
    directMitigations: [
      'Evidence Portfolio requirement tied directly to every strategic indicator',
      'Side-by-side version comparison showing changes between draft and final submissions',
      'Reviewer rejection workflow with mandatory remediation checklist requirements'
    ],
    lastReviewDate: '2026-01-15',
    ministerialEscalated: false
  },
  {
    id: 'prob-06',
    code: 'PROB-06',
    title: 'Grant Beneficiary Tranche Misalignment & Weak NPO Expenditure Oversight',
    category: 'NPO Grant Tranche Misalignment',
    verbatimStatement: 
      'Over R71 Million in annual grant transfers are disbursed to Non-Profit Organisations without adequate pre-disbursement verification of prior tranche expenditure, independent beneficiary confirmation, or bank reconciliation proof, leading to delayed project execution.',
    legalProvision: 'PFMA Section 38(1)(j), Non-Profit Organisations Act No. 71 of 1997',
    severity: 'High',
    status: 'Action Required',
    primaryRisk: 'Transfer of public funds to non-compliant or dormant entities without delivery of arts, culture, or heritage outcomes.',
    impactSummary: '2 of 6 funded NPOs flagged with At Risk or Pending Review compliance status; R8.2M pending proof of expenditure.',
    affectedEntityIds: [1, 2],
    affectedEntityNames: [
      'Music In Africa Foundation (NPO)',
      'Business and Arts South Africa - BASA (NPO)'
    ],
    remediationProgress: 58,
    remediationSteps: [
      {
        id: 'step-06-1',
        title: 'NPO Compliance Scorecard Integration',
        assignedAuthority: 'Director: Cultural Development',
        targetDate: '2026-01-08',
        isCompleted: true,
        notes: 'All 6 funded NPOs scored against tax clearance, NPO Directorate registration, and prior tranche delivery.'
      },
      {
        id: 'step-06-2',
        title: 'Tranche Disbursement Gateway Rule',
        assignedAuthority: 'DSAC Chief Financial Officer',
        targetDate: '2026-01-25',
        isCompleted: false,
        notes: 'Subsequent grant tranche release requires 80% verified expenditure of previous disbursement.'
      }
    ],
    directMitigations: [
      'Dedicated NPO Oversight portal with grant tracking, expenditure reconciliation, and compliance scoring',
      'Mandatory beneficiary bank account validation against National Treasury Central Supplier Database (CSD)',
      'Automatic warning flags when NPO report submission exceeds 45 days past quarter end'
    ],
    lastReviewDate: '2026-01-11',
    ministerialEscalated: false
  },
  {
    id: 'prob-07',
    code: 'PROB-07',
    title: 'Duplication of Functions & Public Entity Rationalization / Amalgamation Inefficiencies',
    category: 'Duplication of Functions & Rationalization',
    verbatimStatement: 
      'The proliferation of 26 separate public entities under DSAC leads to overlapping mandates, redundant administrative overheads, multiple board governance costs, and operational inefficiencies, necessitating an urgent amalgamation feasibility and rationalization process.',
    legalProvision: 'Cabinet Mandate on Rationalization of Public Entities, National Development Plan (NDP) 2030, PFMA Chapter 6',
    severity: 'Medium',
    status: 'Under Remediation',
    primaryRisk: 'Disproportionate expenditure on administrative governance rather than front-line arts, heritage, and sporting programs.',
    impactSummary: 'Feasibility study underway across 5 functional clusters; R120M potential annual administrative savings identified.',
    affectedEntityIds: [18, 19, 20, 21, 22, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    affectedEntityNames: [
      'Performing Arts Council Cluster (5 Theatres)',
      'National Museums & Heritage Cluster (11 Institutions)'
    ],
    remediationProgress: 40,
    remediationSteps: [
      {
        id: 'step-07-1',
        title: 'Functional Cluster Categorisation in PERS',
        assignedAuthority: 'Chief Director: Entities Oversight',
        targetDate: '2026-01-05',
        isCompleted: true,
        notes: '26 entities classified into 6 standardized clusters for comparative cost and delivery benchmarking.'
      },
      {
        id: 'step-07-2',
        title: 'Cross-Entity Administrative Cost & Overhead Benchmarking',
        assignedAuthority: 'DSAC Strategic Planning Directorate',
        targetDate: '2026-02-28',
        isCompleted: false,
        notes: 'Comparative analysis of CEO/Executive remuneration, audit fees, and IT infrastructure spend per entity.'
      },
      {
        id: 'step-07-3',
        title: 'Shared Services Feasibility Framework for Theatres & Museums',
        assignedAuthority: 'Ministerial Task Team on Rationalization',
        targetDate: '2026-03-31',
        isCompleted: false,
        notes: 'Evaluating consolidated payroll, supply chain, and legal advisory shared services.'
      }
    ],
    directMitigations: [
      'Comparative cost-per-outcome and budget-per-job analytics across similar entities',
      'Benchmarking tool identifying overlapping initiatives and joint touring possibilities',
      'Amalgamation Readiness Index embedded into entity profile registers'
    ],
    lastReviewDate: '2026-01-09',
    ministerialEscalated: false
  }
];
