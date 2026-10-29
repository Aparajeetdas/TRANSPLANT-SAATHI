import { DonorMilestoneItem, DonorProfile, FinancialScheme, HospitalIntakeRecord, StatutoryDocumentRequirement, UserProfile, VerifiedHospital } from '../types';

export const VERIFIED_HOSPITALS: VerifiedHospital[] = [
  {
    id: 'hosp-001',
    name: 'All India Institute of Medical Sciences (AIIMS) - Apex Centre',
    registrationNumber: 'NOTTO-APEX-ND-001',
    state: 'Delhi',
    city: 'New Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
    lat: 28.5672,
    lng: 77.2100,
    organsSupported: ['kidney', 'liver', 'heart', 'cornea', 'bone_marrow', 'intestine'],
    accreditation: 'NOTTO Apex National Center / NABH Certified',
    coordinatorName: 'Dr. V. K. Sharma (Transplant Nodal Office)',
    coordinatorPhone: '+91-11-26588500',
    coordinatorEmail: 'transplant-nodal@aiims.edu',
    sourceUrl: 'https://notto.mohfw.gov.in',
    sourceVerificationDate: '2026-03-15',
    isVerified: true,
    bedCapacityEstimate: 48,
    isDemonstrationRecord: true,
    reviewStatus: 'verified',
    sources: [
      {
        id: 'src-001-kidney',
        organType: 'kidney',
        sourceAuthority: 'NOTTO National Apex Registry',
        citationReference: 'MoHFW Gazette Notif. No. T-12014/05/2024-NOTTO',
        sourceUrl: 'https://notto.mohfw.gov.in',
        verifiedDate: '2026-03-15',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'MoHFW Central Verification Directorate'
      },
      {
        id: 'src-001-liver',
        organType: 'liver',
        sourceAuthority: 'NOTTO National Liver Allocation Hub',
        citationReference: 'Order Ref: NOTTO/LIV/REG-0012',
        sourceUrl: 'https://notto.mohfw.gov.in',
        verifiedDate: '2026-03-15',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'MoHFW Central Verification Directorate'
      },
      {
        id: 'src-001-heart',
        organType: 'heart',
        sourceAuthority: 'NOTTO Thoracic Directorate',
        citationReference: 'MoHFW Thoracic Reg. No. 04/2023',
        sourceUrl: 'https://notto.mohfw.gov.in',
        verifiedDate: '2026-03-15',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'MoHFW Central Verification Directorate'
      },
      {
        id: 'src-001-cornea',
        organType: 'cornea',
        sourceAuthority: 'National Eye Bank AIIMS',
        citationReference: 'Gazette Reg. EB-DL-1998',
        sourceUrl: 'https://www.aiims.edu',
        verifiedDate: '2026-03-15',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'Directorate General of Health Services'
      },
      {
        id: 'src-001-bmt',
        organType: 'bone_marrow',
        sourceAuthority: 'National Marrow Registry AIIMS',
        citationReference: 'BMT Hub Reg. 2024/99',
        sourceUrl: 'https://www.aiims.edu',
        verifiedDate: '2026-03-15',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'MoHFW Central Verification Directorate'
      },
      {
        id: 'src-001-intestine',
        organType: 'intestine',
        sourceAuthority: 'NOTTO Apex National Center Registry',
        citationReference: 'MoHFW Gazette Notif. No. T-12014/11/2025-NOTTO-INT',
        sourceUrl: 'https://notto.mohfw.gov.in',
        verifiedDate: '2026-03-15',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'MoHFW Central Verification Directorate'
      }
    ]
  },
  {
    id: 'hosp-002',
    name: 'Postgraduate Institute of Medical Education and Research (PGIMER)',
    registrationNumber: 'ROTTO-NORTH-CHD-004',
    state: 'Chandigarh',
    city: 'Chandigarh',
    address: 'Sector 12, Chandigarh 160012',
    lat: 30.7645,
    lng: 76.7744,
    organsSupported: ['kidney', 'liver', 'lungs', 'pancreas', 'cornea'],
    accreditation: 'ROTTO North Designated Hub / MOHFW Government Registry',
    coordinatorName: 'Ms. Harpreet Kaur (ROTTO Coordinator)',
    coordinatorPhone: '+91-172-2746018',
    coordinatorEmail: 'rottochd@pgimer.edu.in',
    sourceUrl: 'https://pgimer.edu.in',
    sourceVerificationDate: '2026-02-28',
    isVerified: true,
    bedCapacityEstimate: 36,
    isDemonstrationRecord: true,
    reviewStatus: 'verified',
    sources: [
      {
        id: 'src-002-kidney',
        organType: 'kidney',
        sourceAuthority: 'ROTTO North Regional Hub',
        citationReference: 'ROTTO-CHD-RENAL-2022-19',
        sourceUrl: 'https://pgimer.edu.in',
        verifiedDate: '2026-02-28',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'ROTTO Regional Inspection Team'
      },
      {
        id: 'src-002-liver',
        organType: 'liver',
        sourceAuthority: 'ROTTO North Regional Hub',
        citationReference: 'ROTTO-CHD-LIV-092',
        sourceUrl: 'https://pgimer.edu.in',
        verifiedDate: '2026-02-28',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'ROTTO Regional Inspection Team'
      },
      {
        id: 'src-002-lungs',
        organType: 'lungs',
        sourceAuthority: 'ROTTO North Regional Hub',
        citationReference: 'ROTTO-CHD-PULM-018',
        sourceUrl: 'https://pgimer.edu.in',
        verifiedDate: '2026-02-28',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'ROTTO Regional Inspection Team'
      },
      {
        id: 'src-002-pancreas',
        organType: 'pancreas',
        sourceAuthority: 'ROTTO North Regional Hub',
        citationReference: 'ROTTO-CHD-PANC-007',
        sourceUrl: 'https://pgimer.edu.in',
        verifiedDate: '2026-02-28',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'ROTTO Regional Inspection Team'
      },
      {
        id: 'src-002-cornea',
        organType: 'cornea',
        sourceAuthority: 'Advanced Eye Centre PGIMER',
        citationReference: 'Eye Bank Lic. CHD-EB-03',
        sourceUrl: 'https://pgimer.edu.in',
        verifiedDate: '2026-02-28',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'ROTTO Regional Inspection Team'
      }
    ]
  },
  {
    id: 'hosp-003',
    name: 'Institute of Liver and Biliary Sciences (ILBS)',
    registrationNumber: 'DL-ILBS-LIV-019',
    state: 'Delhi',
    city: 'New Delhi',
    address: 'D-1, Vasant Kunj, New Delhi 110070',
    lat: 28.5135,
    lng: 77.1584,
    organsSupported: ['liver', 'kidney'],
    accreditation: 'Autonomous Super-Specialty / NABH / NABL',
    coordinatorName: 'Col. (Retd) R. N. Pillai (Donor Desk)',
    coordinatorPhone: '+91-11-46300000',
    coordinatorEmail: 'organliaison@ilbs.in',
    sourceUrl: 'https://www.ilbs.in',
    sourceVerificationDate: '2026-04-10',
    isVerified: true,
    bedCapacityEstimate: 28,
    isDemonstrationRecord: true,
    reviewStatus: 'verified',
    sources: [
      {
        id: 'src-003-liver',
        organType: 'liver',
        sourceAuthority: 'Delhi State Appropriate Authority',
        citationReference: 'DL-ILBS-LIV-019',
        sourceUrl: 'https://www.ilbs.in',
        verifiedDate: '2026-04-10',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'Delhi State Appropriate Authority'
      },
      {
        id: 'src-003-kidney',
        organType: 'kidney',
        sourceAuthority: 'Delhi State Appropriate Authority',
        citationReference: 'DL-ILBS-REN-024',
        sourceUrl: 'https://www.ilbs.in',
        verifiedDate: '2026-04-10',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'Delhi State Appropriate Authority'
      }
    ]
  },
  {
    id: 'hosp-004',
    name: 'King Edward Memorial (KEM) Hospital & SOTTO Maharashtra',
    registrationNumber: 'MH-SOTTO-MUM-011',
    state: 'Maharashtra',
    city: 'Mumbai',
    address: 'Acharya Donde Marg, Parel, Mumbai 400012',
    lat: 19.0022,
    lng: 72.8427,
    organsSupported: ['kidney', 'liver', 'cornea'],
    accreditation: 'SOTTO Western Regional Hub / Municipal Corporation Greater Mumbai',
    coordinatorName: 'Dr. Sujata Patwardhan (SOTTO Chief)',
    coordinatorPhone: '+91-22-24107000',
    coordinatorEmail: 'sotto.maharashtra@kem.edu',
    sourceUrl: 'https://sottomaharashtra.org',
    sourceVerificationDate: '2026-03-22',
    isVerified: true,
    bedCapacityEstimate: 40,
    isDemonstrationRecord: true,
    reviewStatus: 'verified',
    sources: [
      {
        id: 'src-004-kidney',
        organType: 'kidney',
        sourceAuthority: 'SOTTO Maharashtra',
        citationReference: 'MH-SOTTO-MUM-011-K',
        sourceUrl: 'https://sottomaharashtra.org',
        verifiedDate: '2026-03-22',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'SOTTO Western Regional Directorate'
      },
      {
        id: 'src-004-liver',
        organType: 'liver',
        sourceAuthority: 'SOTTO Maharashtra',
        citationReference: 'MH-SOTTO-MUM-011-L',
        sourceUrl: 'https://sottomaharashtra.org',
        verifiedDate: '2026-03-22',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'SOTTO Western Regional Directorate'
      },
      {
        id: 'src-004-cornea',
        organType: 'cornea',
        sourceAuthority: 'Municipal Eye Bank KEM',
        citationReference: 'MCGM-EB-014',
        sourceUrl: 'https://sottomaharashtra.org',
        verifiedDate: '2026-03-22',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'SOTTO Western Regional Directorate'
      }
    ]
  },
  {
    id: 'hosp-005',
    name: 'Madras Medical College & Rajiv Gandhi Government General Hospital',
    registrationNumber: 'TN-TRANSTAN-CHE-002',
    state: 'Tamil Nadu',
    city: 'Chennai',
    address: 'EVR Periyar Salai, Park Town, Chennai 600003',
    lat: 13.0827,
    lng: 80.2707,
    organsSupported: ['kidney', 'liver', 'heart', 'lungs', 'cornea'],
    accreditation: 'TRANSTAN Government Transplant Authority Hub',
    coordinatorName: 'Dr. N. Gopalakrishnan (Transplant Wing)',
    coordinatorPhone: '+91-44-25305000',
    coordinatorEmail: 'transtan.rggh@tn.gov.in',
    sourceUrl: 'https://transtan.tn.gov.in',
    sourceVerificationDate: '2026-01-19',
    isVerified: true,
    bedCapacityEstimate: 52,
    isDemonstrationRecord: true,
    reviewStatus: 'verified',
    sources: [
      {
        id: 'src-005-kidney',
        organType: 'kidney',
        sourceAuthority: 'TRANSTAN Tamil Nadu Authority',
        citationReference: 'TN-TRANSTAN-CHE-002-K',
        sourceUrl: 'https://transtan.tn.gov.in',
        verifiedDate: '2026-01-19',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'TRANSTAN State Government Authority'
      },
      {
        id: 'src-005-liver',
        organType: 'liver',
        sourceAuthority: 'TRANSTAN Tamil Nadu Authority',
        citationReference: 'TN-TRANSTAN-CHE-002-L',
        sourceUrl: 'https://transtan.tn.gov.in',
        verifiedDate: '2026-01-19',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'TRANSTAN State Government Authority'
      },
      {
        id: 'src-005-heart',
        organType: 'heart',
        sourceAuthority: 'TRANSTAN Tamil Nadu Authority',
        citationReference: 'TN-TRANSTAN-CHE-002-H',
        sourceUrl: 'https://transtan.tn.gov.in',
        verifiedDate: '2026-01-19',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'TRANSTAN State Government Authority'
      },
      {
        id: 'src-005-lungs',
        organType: 'lungs',
        sourceAuthority: 'TRANSTAN Tamil Nadu Authority',
        citationReference: 'TN-TRANSTAN-CHE-002-LU',
        sourceUrl: 'https://transtan.tn.gov.in',
        verifiedDate: '2026-01-19',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'TRANSTAN State Government Authority'
      },
      {
        id: 'src-005-cornea',
        organType: 'cornea',
        sourceAuthority: 'RIO Government Ophthalmic Hospital',
        citationReference: 'TN-EB-CHE-001',
        sourceUrl: 'https://transtan.tn.gov.in',
        verifiedDate: '2026-01-19',
        reviewStatus: 'verified',
        statutoryStatus: 'Active Statutory License',
        reviewedBy: 'TRANSTAN State Government Authority'
      }
    ]
  },
  {
    id: 'hosp-006',
    name: 'National Institute of Mental Health and Neurosciences (NIMHANS)',
    registrationNumber: 'KA-SOTTO-BLR-008',
    state: 'Karnataka',
    city: 'Bengaluru',
    address: 'Hosur Road, Lakkasandra, Bengaluru 560029',
    lat: 12.9392,
    lng: 77.5954,
    organsSupported: ['cornea', 'bone_marrow'],
    accreditation: 'Institute of National Importance / Jeevasarthakathe Registered',
    coordinatorName: 'Dr. Anita Desai (Nodal Tissue Liaison)',
    coordinatorPhone: '+91-80-26995000',
    coordinatorEmail: 'tissuebank@nimhans.ac.in',
    sourceUrl: 'https://nimhans.ac.in',
    sourceVerificationDate: '2026-02-14',
    isVerified: true,
    bedCapacityEstimate: 20,
    isDemonstrationRecord: true,
    reviewStatus: 'pending',
    sources: [
      {
        id: 'src-006-cornea',
        organType: 'cornea',
        sourceAuthority: 'Jeevasarthakathe Karnataka',
        citationReference: 'KA-SOTTO-BLR-008-C',
        sourceUrl: 'https://nimhans.ac.in',
        verifiedDate: '2026-02-14',
        reviewStatus: 'pending',
        statutoryStatus: 'Under Periodic Audit',
        reviewedBy: 'Jeevasarthakathe SOTTO Karnataka'
      },
      {
        id: 'src-006-bmt',
        organType: 'bone_marrow',
        sourceAuthority: 'Jeevasarthakathe Karnataka',
        citationReference: 'KA-SOTTO-BLR-008-BMT',
        sourceUrl: 'https://nimhans.ac.in',
        verifiedDate: '2026-02-14',
        reviewStatus: 'pending',
        statutoryStatus: 'Under Periodic Audit',
        reviewedBy: 'Jeevasarthakathe SOTTO Karnataka'
      }
    ]
  }
];

export const STATUTORY_DOCUMENTS: StatutoryDocumentRequirement[] = [
  {
    formNumber: 'Form 1',
    title: 'Application for Living Donor - Near Relative',
    actReference: 'Transplantation of Human Organs and Tissues Rules (THOTA), 2014 - Rule 3',
    applicability: 'Mother, father, brother, sister, son, daughter, or legally recognized near-relatives.',
    requiredDocuments: [
      'Proof of biological relationship (DNA HLA Typing certificate signed by accredited lab)',
      'Government Photo ID with address (Aadhaar / Voter ID / Passport) of donor and recipient',
      'Joint affidavit before Judicial Magistrate First Class or Executive Magistrate',
      'Blood group compatibility report',
      'No Objection Certificate from direct family members of the donor'
    ],
    statutoryWarning: 'Strict Prohibition: Under Section 19 of THOTA 1994, any financial transaction or commercial offer is punishable with rigorous imprisonment up to 10 years and fines up to ₹1 Crore.'
  },
  {
    formNumber: 'Form 2',
    title: 'Application for Living Donor - Spouse',
    actReference: 'THOTA Rules 2014 - Rule 4',
    applicability: 'Legally married spouse of recipient.',
    requiredDocuments: [
      'Marriage Certificate issued under Special Marriage Act, Hindu Marriage Act, or relevant registrar',
      'Joint photograph spanning minimum duration of marriage',
      'Family ration card or joint passport indicating spousal relationship',
      'Independent psychological evaluation of spouse confirming voluntary informed consent'
    ],
    statutoryWarning: 'Voluntary Consent: Spouse must be interviewed separately without presence of in-laws to verify absence of domestic coercion.'
  },
  {
    formNumber: 'Form 3',
    title: 'Application for Living Donor - Other than Near Relative',
    actReference: 'THOTA Rules 2014 - Rule 5 & Rule 7',
    applicability: 'Close friends, distant relatives, or altruistic non-related donors.',
    requiredDocuments: [
      'Mandatory Approval from Hospital Authorization Committee (or State Authorization Committee)',
      'Detailed documented statement of affection and attachment, corroborated with historical photographs or correspondence',
      'Income and financial assessment of donor for past 3 years (ITR / Bank statements to verify financial stability and preclude inducement)',
      'Police verification report verifying absence of commercial inducement'
    ],
    statutoryWarning: 'MANDATORY AUTHORIZATION COMMITTEE: Non-near relative transplants CANNOT proceed without formal interview, video recording, and written clearance by the statutory Authorization Committee.'
  },
  {
    formNumber: 'Form 11',
    title: 'Consent for Organ Retrieval from Deceased / Brain Stem Dead Donor',
    actReference: 'THOTA Rules 2014 - Rule 8',
    applicability: 'Next of kin or person lawfully in possession of the body of deceased candidate.',
    requiredDocuments: [
      'Form 8: Brain Stem Death Certification signed by panel of 4 doctors (including Neurologist/Neurosurgeon)',
      'Two clinical tests spaced 6 hours apart confirming irreversible cessation of brain stem function',
      'Signed Form 11 by legal spouse or first-degree relative in presence of 2 independent witnesses',
      'Medico-legal autopsy NOC if accidental injury / police inquest case'
    ],
    statutoryWarning: 'Transparent Allocation: Deceased organs are allocated strictly through NOTTO / ROTTO / SOTTO registry computerized algorithms based on medical urgency, waiting time, and immunological match.'
  },
  {
    formNumber: 'Form 18',
    title: 'Declaration for Paired (Swap) Donation',
    actReference: 'THOTA Amendment Act 2011, Section 9(3A) & Rule 13',
    applicability: 'Two incompatible living donor-recipient pairs agreeing to altruistic cross-donation.',
    requiredDocuments: [
      'Joint declarations by both pairs verified before Hospital Authorization Committee',
      'Dual surgical scheduling confirmation for simultaneous induction in operating theatres',
      'Immuno-hematology crossmatch compatibility documents for both paired sets'
    ],
    statutoryWarning: 'Simultaneous Surgery: Swap donations require concurrent surgical operations to prevent either party from revoking consent post-procedure.'
  }
];

export const FINANCIAL_SCHEMES: FinancialScheme[] = [
  {
    id: 'scheme-pmjay',
    title: 'Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    authority: 'National Health Authority (NHA), Government of India',
    eligibility: 'Deprived rural families and identified occupational categories of urban families as per SECC 2011 database or verified PM-JAY e-Card holders.',
    coverageDetails: 'Covers up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization, including pre-operative evaluation, transplant surgery package, and defined post-transplant immunosuppressive medication at empaneled public and private hospitals.',
    applicationProcess: [
      'Check family eligibility at nearest Ayushman Mitra kiosk or Mera PMJAY portal (pmjay.gov.in)',
      'Generate ABHA (Ayushman Bharat Health Account) card',
      'Transplant Hospital Ayushman Desk submits pre-authorization request with clinical workup',
      'NHA State Health Agency approves package pre-authorization before hospital admission'
    ],
    officialPortalUrl: 'https://pmjay.gov.in',
    sourceCitation: 'National Health Authority Guidelines on Specialty Packages (Surgical/Transplant Care)',
    lastVerifiedDate: '2026-03-01'
  },
  {
    id: 'scheme-ran',
    title: 'Rashtriya Arogya Nidhi (RAN) & Health Minister\'s Cancer Patient Fund',
    authority: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    eligibility: 'Patients living below the poverty line (BPL) suffering from life-threatening major illnesses requiring treatment in Government Super-specialty Hospitals / AIIMS.',
    coverageDetails: 'One-time financial assistance up to ₹15,00,000 for organ transplantation (Kidney, Liver, Bone Marrow) in designated Central Government hospitals and regional medical institutes.',
    applicationProcess: [
      'Application Form signed by treating Head of Department and Medical Superintendent of government hospital',
      'Valid BPL Ration Card / Income Certificate issued by District Collector/Revenue Officer',
      'Hospital estimate certificate and clinical prescription of necessary immunosuppressive drugs',
      'Submission to RAN Section, Nirman Bhawan, New Delhi via hospital administration'
    ],
    officialPortalUrl: 'https://mohfw.gov.in',
    sourceCitation: 'Rashtriya Arogya Nidhi Citizen Charter & Guidelines 2024-2026',
    lastVerifiedDate: '2026-02-15'
  },
  {
    id: 'scheme-cmrf',
    title: 'Chief Minister\'s Comprehensive Health Relief Fund (State-Specific)',
    authority: 'State Governments (e.g., CMRF Maharashtra, CMCHIS Tamil Nadu, CMRF Delhi, Arogyasri AP/Telangana)',
    eligibility: 'Domicile residents of the respective state with annual household income beneath specified state thresholds (e.g. < ₹1,20,000 to ₹5,00,000 depending on state policy).',
    coverageDetails: 'Direct state exchequer grant ranging between ₹2,00,000 and ₹10,00,000 disbursed directly to empaneled transplant centers towards surgical costs and ICU admission.',
    applicationProcess: [
      'Obtain pro-forma medical estimate signed by registered transplant nodal surgeon',
      'Attested domicile certificate, income certificate from Tehsildar, and Aadhaar card',
      'Application submission via online state CM Portal or through local Member of Legislative Assembly (MLA) endorsement desk',
      'Disbursement directly to hospital bank escrow account'
    ],
    officialPortalUrl: 'https://india.gov.in/topics/health-family-welfare',
    sourceCitation: 'State Health Department Portals & Public Welfare Gazettes',
    lastVerifiedDate: '2026-03-20'
  },
  {
    id: 'scheme-echs-cghs',
    title: 'Central Government Health Scheme (CGHS) & ECHS',
    authority: 'Directorate General of CGHS & Ministry of Defence',
    eligibility: 'Serving/retired Central Government employees, defence veterans, and eligible dependent family members.',
    coverageDetails: 'Full or capped reimbursement / cashless approval at CGHS/ECHS empaneled transplant hospitals as per approved CGHS package rates for kidney, liver, and bone marrow transplants, including ongoing reimbursement for lifelong immunosuppressants (Tacrolimus, Mycophenolate, Cyclosporine).',
    applicationProcess: [
      'Referral and recommendation by CGHS/ECHS Medical Specialist',
      'Prior approval from Additional Director (CGHS) / Senior Executive Medical Officer (ECHS)',
      'Cashless hospital admission upon issuance of sanction letter'
    ],
    officialPortalUrl: 'https://cghs.nic.in',
    sourceCitation: 'Office Memorandum on Organ Transplant Procedures under CGHS Rates',
    lastVerifiedDate: '2026-01-30'
  }
];

export const SYNTHETIC_HOSPITAL_INTAKES: HospitalIntakeRecord[] = [
  {
    id: 'rec-001',
    hospitalId: 'hosp-001',
    anonymousPatientCode: 'SYN-PAT-2026-KD-041',
    organCategory: 'kidney',
    donorRelationType: 'Near Relative (Living)',
    thotaComplianceStatus: 'Form 1 Verified',
    committeeMeetingDate: '2026-04-12',
    notes: 'Living related maternal donor. HLA mismatch 2/6. Crossmatch negative. Authorization Form 1 signed.',
    createdAt: '2026-03-25T10:30:00Z'
  },
  {
    id: 'rec-002',
    hospitalId: 'hosp-003',
    anonymousPatientCode: 'SYN-PAT-2026-LV-019',
    organCategory: 'liver',
    donorRelationType: 'Spouse',
    thotaComplianceStatus: 'Committee Cleared',
    committeeMeetingDate: '2026-03-29',
    notes: 'Spousal living donor. Marriage registered 2018. Independent psychological evaluation complete. Ethics cleared.',
    createdAt: '2026-03-20T14:15:00Z'
  },
  {
    id: 'rec-003',
    hospitalId: 'hosp-002',
    anonymousPatientCode: 'SYN-PAT-2026-HT-008',
    organCategory: 'heart',
    donorRelationType: 'Deceased Candidate List',
    thotaComplianceStatus: 'Awaiting Authorization Committee',
    committeeMeetingDate: '2026-04-18',
    notes: 'Dilated cardiomyopathy. Listed on ROTTO North priority deceased donor waitlist. Periodic cardiac workup updated.',
    createdAt: '2026-03-28T09:00:00Z'
  },
  {
    id: 'rec-004',
    hospitalId: 'hosp-004',
    anonymousPatientCode: 'SYN-PAT-2026-KD-089',
    organCategory: 'kidney',
    donorRelationType: 'Other / Swap',
    thotaComplianceStatus: 'Pending HLA Report',
    committeeMeetingDate: '2026-04-20',
    notes: 'Swap candidate paired with Pair #14. Paired donor Form 18 filed. Awaiting second cross-match validation.',
    createdAt: '2026-04-01T11:45:00Z'
  }
];

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'demo-patient',
    publicId: 'TS-7K9P-X4QM',
    email: 'patient.sharma@example.com',
    fullName: 'Rajesh Sharma',
    phone: '+91-98765-43210',
    role: 'patient',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'demo-family',
    publicId: 'TS-3B8R-N2WV',
    email: 'family.ananya@example.com',
    fullName: 'Ananya Sharma (Caregiver)',
    phone: '+91-98765-43211',
    role: 'family',
    isActive: true,
    createdAt: '2026-01-16T09:30:00Z'
  },
  {
    id: 'demo-volunteer',
    publicId: 'TS-9M4L-H6TD',
    email: 'volunteer.arun@saathi-volunteer.org',
    fullName: 'Arun Varma',
    phone: '+91-98111-22334',
    role: 'volunteer',
    organization: 'Saathi Caregiver Network Delhi Chapter',
    isActive: true,
    createdAt: '2026-02-01T12:00:00Z'
  },
  {
    id: 'demo-hospital-staff',
    publicId: 'TS-5J2C-K8FY',
    email: 'coordinator.aiims@hospital.gov.in',
    fullName: 'Dr. Priya Raman (Transplant Liaison)',
    phone: '+91-11-26588500',
    role: 'hospital_staff',
    organization: 'AIIMS Apex Transplant Center',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'demo-admin',
    publicId: 'TS-1A0Z-E9QP',
    email: 'admin.director@transplantsaathi.org',
    fullName: 'Siddharth Sen (Platform Admin)',
    phone: '+91-11-40001000',
    role: 'admin',
    organization: 'Transplant Saathi Directorate',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'demo-donor',
    publicId: 'TS-6P1X-9W2K',
    email: 'donor.alok@example.com',
    fullName: 'Alok Nath Verma',
    phone: '+91-98100-11223',
    role: 'donor',
    isActive: true,
    createdAt: '2026-02-10T11:00:00Z'
  }
];

export interface VettedVolunteer {
  id: string;
  name: string;
  phone: string;
  registrationNumber: string;
  organization: string;
  specialization: string;
  languages: string[];
  activeCases: number;
}

export const VETTED_VOLUNTEERS: VettedVolunteer[] = [
  {
    id: 'demo-volunteer',
    name: 'Arun Varma',
    phone: '+91-98111-22334',
    registrationNumber: 'VOL-DEL-2026-042',
    organization: 'Saathi Caregiver Network Delhi Chapter',
    specialization: 'Form 1 Joint Affidavits & AIIMS Wayfinding',
    languages: ['Hindi', 'English', 'Punjabi'],
    activeCases: 2
  },
  {
    id: 'vol-mumbai-02',
    name: 'Meera Deshmukh',
    phone: '+91-98200-44556',
    registrationNumber: 'VOL-MUM-2026-019',
    organization: 'Sanjivani Foundation Mumbai',
    specialization: 'Liver Pre-Op Logistics & KEM / Global Hospital Navigation',
    languages: ['Marathi', 'Hindi', 'English'],
    activeCases: 1
  },
  {
    id: 'vol-blr-03',
    name: 'Rajesh Kulkarni',
    phone: '+91-98450-77889',
    registrationNumber: 'VOL-BLR-2026-008',
    organization: 'Jeevan Sathi NGO Bangalore',
    specialization: 'PM-JAY Scheme Paperwork & Manipal / Narayana Hospital Guidance',
    languages: ['Kannada', 'Hindi', 'English'],
    activeCases: 3
  }
];

export const INITIAL_DONOR_PROFILES: DonorProfile[] = [
  {
    id: 'donor-prof-001',
    userId: 'demo-donor',
    publicDonorId: 'TS-DNR-4K8P-2Q9T',
    pledgeStatus: 'pledged_interest',
    pledgedOrgans: ['all'],
    familyInformed: true,
    emergencyContactName: 'Kavita Verma (Spouse)',
    emergencyContactPhone: '+91-98100-55443',
    officialNottoRegistrationNumber: 'NOTTO-PLEDGE-2026-99120',
    state: 'Delhi',
    city: 'New Delhi',
    bloodGroup: 'B+',
    consentSigned: true,
    consentSignedAt: '2026-02-10T11:05:00Z',
    isPublicPledgeAnonymous: true,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:05:00Z'
  },
  {
    id: 'donor-prof-002',
    userId: 'demo-patient',
    publicDonorId: 'TS-DNR-8W3J-7M5X',
    pledgeStatus: 'notto_registered',
    pledgedOrgans: ['cornea', 'tissues'],
    familyInformed: true,
    emergencyContactName: 'Ananya Sharma (Caregiver)',
    emergencyContactPhone: '+91-98765-43211',
    officialNottoRegistrationNumber: 'NOTTO-GOV-REG-77401',
    state: 'Maharashtra',
    city: 'Mumbai',
    bloodGroup: 'O+',
    consentSigned: true,
    consentSignedAt: '2026-02-14T09:30:00Z',
    isPublicPledgeAnonymous: true,
    createdAt: '2026-02-14T09:30:00Z',
    updatedAt: '2026-02-14T09:30:00Z'
  }
];

export const DEFAULT_DONOR_MILESTONES: DonorMilestoneItem[] = [
  {
    id: 'step-1-pledge',
    title: 'Record Voluntary Donation Intention',
    description: 'Pledge interest on Transplant Saathi and generate your permanent anonymous Public Donor ID.',
    isCompleted: true,
    statutoryNotice: 'Pledging on Transplant Saathi creates a private voluntary intention record and public donor ID. It is not an organ match or sale.',
    completedAt: '2026-02-10T11:00:00Z'
  },
  {
    id: 'step-2-family',
    title: 'Crucial: Inform Your Family & Next-of-Kin',
    description: 'Under Indian law (THOTA 1994, Rule 11), deceased organ retrieval legally requires informed written consent from next-of-kin. Your family is your voice.',
    isCompleted: false,
    statutoryNotice: 'Section 3(3) THOTA 1994: Organ retrieval requires family authorization. Always have an open conversation with your legal next-of-kin.'
  },
  {
    id: 'step-3-notto',
    title: 'Register on National Registry (NOTTO Form 7)',
    description: 'Complete official statutory registration on the Ministry of Health and Family Welfare National NOTTO Portal (Form 7).',
    isCompleted: false,
    statutoryNotice: 'Official statutory organ donor pledge under Transplantation of Human Organs and Tissues Rules, 2014.',
    officialUrl: 'https://notto.mohfw.gov.in'
  },
  {
    id: 'step-4-card',
    title: 'Carry Your Digital Donor Card',
    description: 'Save or print your official Transplant Saathi emergency donor card with your Public Donor ID and emergency contact info.',
    isCompleted: false,
    statutoryNotice: 'Keep your digital donor card in your wallet or smartphone for emergency identification by authorized trauma coordinators.'
  }
];

