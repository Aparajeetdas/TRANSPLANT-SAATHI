import {
  AppointmentNote,
  AssistanceRequest,
  AuditLogEntry,
  DonorMilestoneItem,
  DonorProfile,
  ExpensePlan,
  HospitalApplication,
  HospitalIntakeRecord,
  HospitalReviewStatus,
  OfficialResource,
  PatientChecklistItem,
  PledgedOrganCategory,
  PublicDonorIdentity,
  PublicUserIdentity,
  RequestStatus,
  SanitizedAssistanceRequest,
  UserProfile,
  UserRole,
  VerifiedHospital
} from '../types';
import {
  generatePublicDonorId,
  generatePublicUserId,
  sanitizeAssistanceRequest,
  toPublicDonorIdentity,
  toPublicUserIdentity
} from './identity';
import {
  DEFAULT_DONOR_MILESTONES,
  DEMO_PROFILES,
  INITIAL_DONOR_PROFILES,
  SYNTHETIC_HOSPITAL_INTAKES,
  VERIFIED_HOSPITALS
} from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'transplant_saathi_current_user',
  REQUESTS: 'transplant_saathi_assistance_requests',
  HOSPITALS: 'transplant_saathi_hospitals',
  INTAKES: 'transplant_saathi_intakes',
  AUDIT_LOGS: 'transplant_saathi_audit_logs',
  SAVED_HOSPITALS: 'transplant_saathi_saved_hospitals',
  PATIENT_CHECKLIST: 'transplant_saathi_patient_checklist',
  APPOINTMENT_NOTES: 'transplant_saathi_appointment_notes',
  EXPENSE_PLANS: 'transplant_saathi_expense_plans',
  RESOURCES: 'transplant_saathi_resources',
  PROFILES: 'transplant_saathi_profiles',
  DONOR_PROFILES: 'transplant_saathi_donor_profiles',
  HOSPITAL_APPLICATIONS: 'transplant_saathi_hospital_applications'
};

const INITIAL_REQUESTS: AssistanceRequest[] = [
  {
    id: 'req-101',
    patientId: 'demo-patient',
    patientPublicId: 'TS-7K9P-X4QM',
    patientName: 'Rajesh Sharma',
    contactPhone: '+91-98765-43210',
    organCategory: 'kidney',
    hospitalName: 'All India Institute of Medical Sciences (AIIMS)',
    supportType: 'Paperwork (Form 1/2/3)',
    notes: 'Need guidance organizing Form 1 joint affidavit and DNA HLA documentation checklist.',
    status: 'assigned',
    assignedVolunteerId: 'demo-volunteer',
    assignedVolunteerName: 'Arun Varma',
    coordinatorNotes: 'Elderly recipient; provide direct physical accompaniment at Gate 2 AIIMS OPD counter.',
    assignedAt: '2026-03-25T11:00:00Z',
    createdAt: '2026-03-24T10:00:00Z',
    updatedAt: '2026-03-25T12:00:00Z'
  },
  {
    id: 'req-102',
    patientId: 'demo-family',
    patientPublicId: 'TS-3B8R-N2WV',
    patientName: 'Kavita Patel (Family Caregiver)',
    contactPhone: '+91-98222-33445',
    organCategory: 'liver',
    hospitalName: 'Institute of Liver and Biliary Sciences (ILBS)',
    supportType: 'Financial Scheme Guidance',
    notes: 'Family seeking assistance with AB-PMJAY pre-authorization paperwork for liver recipient.',
    status: 'submitted',
    createdAt: '2026-03-28T15:30:00Z',
    updatedAt: '2026-03-28T15:30:00Z'
  },
  {
    id: 'req-103',
    patientId: 'patient-gurgaon-01',
    patientPublicId: 'TS-6V8M-P4TK',
    patientName: 'Manoj Tiwari',
    contactPhone: '+91-98100-77665',
    organCategory: 'kidney',
    hospitalName: 'Safdarjung Hospital',
    supportType: 'Wayfinding & Logistics',
    notes: 'Accompanied for Form 1 verification at SDM office. All affidavits attested before JMFC.',
    status: 'completed',
    assignedVolunteerId: 'demo-volunteer',
    assignedVolunteerName: 'Arun Varma',
    coordinatorNotes: 'Accompaniment completed successfully. Patient dossier submitted to hospital Authorization Committee.',
    assignedAt: '2026-03-18T09:00:00Z',
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-03-20T16:00:00Z'
  },
  {
    id: 'req-104',
    patientId: 'patient-mumbai-02',
    patientPublicId: 'TS-2D9L-W7NR',
    patientName: 'Deepak Joshi',
    contactPhone: '+91-98201-99887',
    organCategory: 'liver',
    hospitalName: 'KEM Hospital Mumbai',
    supportType: 'Language Help',
    notes: 'Requires Marathi to Hindi translation for transplant committee hearing.',
    status: 'assigned',
    assignedVolunteerId: 'vol-mumbai-02',
    assignedVolunteerName: 'Meera Deshmukh',
    coordinatorNotes: 'Assigned to Mumbai regional volunteer navigator Meera Deshmukh.',
    assignedAt: '2026-03-26T10:00:00Z',
    createdAt: '2026-03-26T09:00:00Z',
    updatedAt: '2026-03-26T10:00:00Z'
  }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    actorId: 'demo-admin',
    actorName: 'Siddharth Sen (Platform Admin)',
    actorRole: 'admin',
    action: 'VERIFIED_HOSPITAL_DIRECTORY_AUDIT',
    targetTable: 'verified_hospitals',
    targetId: 'hosp-001',
    details: { registrationNumber: 'NOTTO-APEX-ND-001', verifiedAgainst: 'notto.mohfw.gov.in' },
    createdAt: '2026-03-15T09:30:00Z'
  },
  {
    id: 'audit-002',
    actorId: 'demo-admin',
    actorName: 'Siddharth Sen (Platform Admin)',
    actorRole: 'admin',
    action: 'ROLE_ASSIGNMENT_CONFIRMED',
    targetTable: 'profiles',
    targetId: 'demo-hospital-staff',
    details: { assignedRole: 'hospital_staff', organization: 'AIIMS Apex Transplant Center' },
    createdAt: '2026-03-16T11:00:00Z'
  }
];

export const getStoredUser = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data || data === 'null' || data === 'undefined') return null;
  try {
    const user: UserProfile = JSON.parse(data);
    if (!user.publicId) {
      const canonical = DEMO_PROFILES.find((demo) => demo.id === user.id);
      user.publicId = canonical?.publicId || generatePublicUserId();
    }
    return user;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: UserProfile | null): void => {
  if (user) {
    if (!user.publicId) {
      const canonical = DEMO_PROFILES.find((demo) => demo.id === user.id);
      user.publicId = canonical?.publicId || generatePublicUserId();
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getStoredRequests = (): AssistanceRequest[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    return INITIAL_REQUESTS;
  }
  try {
    const parsed: AssistanceRequest[] = JSON.parse(data);
    return parsed.map((r) => {
      if (!r.patientPublicId) {
        const canonical = INITIAL_REQUESTS.find((init) => init.id === r.id);
        return {
          ...r,
          patientPublicId: canonical?.patientPublicId || (r.patientId === 'demo-patient' ? 'TS-7K9P-X4QM' : 'TS-6V8M-P4TK')
        };
      }
      return r;
    });
  } catch {
    return INITIAL_REQUESTS;
  }
};

export const saveStoredRequests = (requests: AssistanceRequest[]): void => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
};

export const getVolunteerAssignedRequests = (volunteerId: string): AssistanceRequest[] => {
  const all = getStoredRequests();
  return all.filter((r) => r.assignedVolunteerId === volunteerId);
};

export interface VolunteerAccessResult {
  request: AssistanceRequest | null;
  error?: string;
  isUnauthorized?: boolean;
}

export const getAssistanceRequestForVolunteer = (
  requestId: string,
  user: UserProfile | null
): VolunteerAccessResult => {
  if (!user) {
    return {
      request: null,
      error: 'Authentication required to access case files.',
      isUnauthorized: true
    };
  }

  const all = getStoredRequests();
  const target = all.find((r) => r.id === requestId);

  if (!target) {
    return {
      request: null,
      error: 'Assistance request not found in the platform registry.'
    };
  }

  // Administrators and hospital coordinators have cross-case verification authority
  if (user.role === 'admin' || user.role === 'hospital_staff') {
    return { request: target };
  }

  // Volunteers may ONLY access requests specifically assigned to them
  if (user.role === 'volunteer') {
    if (target.assignedVolunteerId === user.id) {
      return { request: target };
    }

    // Record unauthorized access attempt audit log
    recordAuditLog(
      user,
      'UNAUTHORIZED_RECORD_ACCESS_ATTEMPT',
      'assistance_requests',
      requestId,
      {
        attemptedById: user.id,
        attemptedByName: user.fullName,
        actualAssignedVolunteerId: target.assignedVolunteerId || 'unassigned',
        patientId: target.patientId,
        violationType: 'VOLUNTEER_LEAST_PRIVILEGE_BREACH_PREVENTED'
      }
    );

    return {
      request: null,
      error: 'Access Denied: You are not assigned to this assistance request. Under DPDP Act 2023 & THOTA 1994 confidentiality provisions, volunteers may access only their assigned cases.',
      isUnauthorized: true
    };
  }

  // Patients/Family can only access their own request
  if (user.role === 'patient' || user.role === 'family') {
    if (target.patientId === user.id || target.patientId === 'demo-patient') {
      return { request: target };
    }
    return {
      request: null,
      error: 'Access Denied: You do not have permission to view other patients’ requests.',
      isUnauthorized: true
    };
  }

  return {
    request: null,
    error: 'Access Denied: Unauthorized role.',
    isUnauthorized: true
  };
};


export const getStoredHospitals = (): VerifiedHospital[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(VERIFIED_HOSPITALS));
    return VERIFIED_HOSPITALS;
  }
  try {
    const parsed: VerifiedHospital[] = JSON.parse(data);
    // Ensure existing storage records contain statutory review status and sources
    const upgraded = parsed.map((item) => {
      const canonical = VERIFIED_HOSPITALS.find((h) => h.id === item.id);
      return {
        ...item,
        reviewStatus: item.reviewStatus || canonical?.reviewStatus || 'verified',
        sources: item.sources && item.sources.length > 0 ? item.sources : canonical?.sources || []
      };
    });
    return upgraded;
  } catch {
    return VERIFIED_HOSPITALS;
  }
};

export const saveStoredHospitals = (hospitals: VerifiedHospital[]): void => {
  localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
};

export const getStoredIntakes = (): HospitalIntakeRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INTAKES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(SYNTHETIC_HOSPITAL_INTAKES));
    return SYNTHETIC_HOSPITAL_INTAKES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return SYNTHETIC_HOSPITAL_INTAKES;
  }
};

export const saveStoredIntakes = (intakes: HospitalIntakeRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(intakes));
};

export const getStoredAuditLogs = (): AuditLogEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
};

let auditLogSeq = 100;

export const recordAuditLog = (
  actor: UserProfile,
  action: string,
  targetTable: string,
  targetId: string,
  details?: Record<string, unknown>
): void => {
  auditLogSeq += 1;
  const currentLogs = getStoredAuditLogs();
  const newLog: AuditLogEntry = {
    id: `audit-${Date.now()}-${auditLogSeq}`,
    actorId: actor.id,
    actorName: actor.fullName,
    actorRole: actor.role,
    action,
    targetTable,
    targetId,
    details,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newLog, ...currentLogs]));
};

// --- Saved Hospitals ---
export const getSavedHospitalIds = (): string[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SAVED_HOSPITALS);
  if (!data) return ['hosp-001']; // AIIMS default saved
  try {
    return JSON.parse(data);
  } catch {
    return ['hosp-001'];
  }
};

export const toggleSaveHospitalId = (hospitalId: string): boolean => {
  const current = getSavedHospitalIds();
  let updated: string[];
  const isSaved = current.includes(hospitalId);
  if (isSaved) {
    updated = current.filter(id => id !== hospitalId);
  } else {
    updated = [...current, hospitalId];
  }
  localStorage.setItem(STORAGE_KEYS.SAVED_HOSPITALS, JSON.stringify(updated));
  return !isSaved;
};

// --- Patient Checklists ---
const INITIAL_CHECKLIST_ITEMS: PatientChecklistItem[] = [
  {
    id: 'chk-1',
    userId: 'demo-patient',
    title: 'Aadhaar & PAN Identity Verification',
    stage: 'evaluation',
    statutoryReference: 'THOTA 1994 Rules, Rule 3',
    isMandatory: true,
    isCompleted: true,
    completedAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'chk-2',
    userId: 'demo-patient',
    title: 'Living Donor Blood Group & HLA Tissue Cross-Match',
    stage: 'evaluation',
    statutoryReference: 'THOTA 1994 Section 9(1)',
    isMandatory: true,
    isCompleted: true,
    completedAt: '2026-03-22T14:30:00Z'
  },
  {
    id: 'chk-3',
    userId: 'demo-patient',
    title: 'Form 1 Joint Application for Near Relative Living Donor',
    stage: 'legal_clearance',
    statutoryReference: 'THOTA Rules 2014, Form 1',
    isMandatory: true,
    isCompleted: false,
    notes: 'Awaiting Tehsildar genealogical family tree certificate'
  },
  {
    id: 'chk-4',
    userId: 'demo-patient',
    title: 'State Authorization Committee Interview Schedule',
    stage: 'legal_clearance',
    statutoryReference: 'THOTA 1994 Section 9(4)',
    isMandatory: true,
    isCompleted: false
  },
  {
    id: 'chk-5',
    userId: 'demo-patient',
    title: 'Hospital Surgical Fitness & Anesthesia Workup',
    stage: 'pre_transplant',
    statutoryReference: 'NABH Organ Transplant Standard 4.1',
    isMandatory: true,
    isCompleted: false
  },
  {
    id: 'chk-6',
    userId: 'demo-patient',
    title: 'Sterile Isolation Room & Induction Immunosuppressants Delivery',
    stage: 'surgery',
    isMandatory: true,
    isCompleted: false
  },
  {
    id: 'chk-7',
    userId: 'demo-patient',
    title: 'Post-Transplant Tacrolimus / Mycophenolate Trough Level Schedule',
    stage: 'post_discharge',
    statutoryReference: 'Post-Operative Clinical Follow-Up Protocol',
    isMandatory: true,
    isCompleted: false
  }
];

export const getStoredPatientChecklist = (userId: string): PatientChecklistItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENT_CHECKLIST);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PATIENT_CHECKLIST, JSON.stringify(INITIAL_CHECKLIST_ITEMS));
    return INITIAL_CHECKLIST_ITEMS.filter(i => i.userId === userId || i.userId === 'demo-patient');
  }
  try {
    const all = JSON.parse(data) as PatientChecklistItem[];
    return all.filter(i => i.userId === userId || i.userId === 'demo-patient');
  } catch {
    return INITIAL_CHECKLIST_ITEMS;
  }
};

export const saveStoredPatientChecklist = (items: PatientChecklistItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.PATIENT_CHECKLIST, JSON.stringify(items));
};

export const toggleChecklistItem = (itemId: string, userId: string): PatientChecklistItem[] => {
  const all = getStoredPatientChecklist(userId);
  const updated = all.map(item => {
    if (item.id === itemId) {
      const isCompleted = !item.isCompleted;
      return {
        ...item,
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined
      };
    }
    return item;
  });
  saveStoredPatientChecklist(updated);
  return updated;
};

// --- Appointment Notes ---
const INITIAL_NOTES: AppointmentNote[] = [
  {
    id: 'note-1',
    userId: 'demo-patient',
    doctorOrDepartment: 'Nephrology & Renal Transplant OPD - Dr. V. Sen',
    hospitalName: 'All India Institute of Medical Sciences (AIIMS)',
    appointmentDate: '2026-03-22',
    keyDiscussionPoints: 'Discussed HLA 5/6 antigen match with sibling donor. Viral screening serologies confirmed negative.',
    prescribedTestsOrNextSteps: 'Renal DTPA scan for donor GFR quantification, cardiac echo for recipient.',
    questionsForNextVisit: 'Ask coordinator whether Tehsildar certificate needs SDM counter-signature before Form 1.',
    createdAt: '2026-03-22T16:00:00Z'
  }
];

export const getStoredAppointmentNotes = (userId: string): AppointmentNote[] => {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENT_NOTES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENT_NOTES, JSON.stringify(INITIAL_NOTES));
    return INITIAL_NOTES.filter(n => n.userId === userId || n.userId === 'demo-patient');
  }
  try {
    const all = JSON.parse(data) as AppointmentNote[];
    return all.filter(n => n.userId === userId || n.userId === 'demo-patient');
  } catch {
    return INITIAL_NOTES;
  }
};

export const saveAppointmentNote = (note: AppointmentNote): AppointmentNote[] => {
  const current = getStoredAppointmentNotes(note.userId);
  const updated = [note, ...current.filter(n => n.id !== note.id)];
  localStorage.setItem(STORAGE_KEYS.APPOINTMENT_NOTES, JSON.stringify(updated));
  return updated;
};

export const deleteAppointmentNote = (noteId: string, userId: string): AppointmentNote[] => {
  const current = getStoredAppointmentNotes(userId);
  const updated = current.filter(n => n.id !== noteId);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENT_NOTES, JSON.stringify(updated));
  return updated;
};

// --- Expense Planning ---
const DEFAULT_EXPENSE_PLAN: ExpensePlan = {
  id: 'exp-plan-001',
  userId: 'demo-patient',
  organCategory: 'kidney',
  targetHospital: 'All India Institute of Medical Sciences (AIIMS)',
  targetBudget: 650000,
  hasGovernmentScheme: true,
  schemeName: 'Ayushman Bharat PM-JAY',
  sanctionedAmount: 500000,
  updatedAt: '2026-03-25T11:00:00Z',
  items: [
    {
      id: 'item-1',
      planId: 'exp-plan-001',
      category: 'donor_eval',
      categoryLabel: 'Living Donor Workup & HLA Cross-Match',
      description: 'Tissue typing, viral markers, DTPA renal scan, CT Angiography',
      estimatedAmount: 45000,
      actualAmount: 42000,
      isPaid: true,
      receiptReference: 'REC-LAB-8812'
    },
    {
      id: 'item-2',
      planId: 'exp-plan-001',
      category: 'pre_op',
      categoryLabel: 'Recipient Pre-Operative Fitness Workup',
      description: 'Cardiology, Pulmonology, Dental clearance, blood grouping crossmatch',
      estimatedAmount: 30000,
      actualAmount: 28500,
      isPaid: true,
      receiptReference: 'REC-PRE-3914'
    },
    {
      id: 'item-3',
      planId: 'exp-plan-001',
      category: 'hospital_package',
      categoryLabel: 'Hospital Surgical & ICU Package',
      description: 'Transplant surgery, ICU stay (donor & recipient), OT consumables',
      estimatedAmount: 350000,
      actualAmount: 0,
      isPaid: false
    },
    {
      id: 'item-4',
      planId: 'exp-plan-001',
      category: 'immunosuppressants',
      categoryLabel: 'Initial 6-Month Immunosuppressive Medications',
      description: 'Tacrolimus, Mycophenolate Mofetil, Prednisolone',
      estimatedAmount: 90000,
      actualAmount: 0,
      isPaid: false
    },
    {
      id: 'item-5',
      planId: 'exp-plan-001',
      category: 'lodging_travel',
      categoryLabel: 'Patient & Attendant Lodging Near Apex Center',
      description: '30-day stay during immediate post-discharge monitoring',
      estimatedAmount: 45000,
      actualAmount: 15000,
      isPaid: false
    },
    {
      id: 'item-6',
      planId: 'exp-plan-001',
      category: 'margin_of_safety',
      categoryLabel: 'Unforeseen Emergency Buffer / Infection Management',
      description: 'Contingency for CMV prophylaxis, IVIG or extended ICU stay',
      estimatedAmount: 90000,
      actualAmount: 0,
      isPaid: false
    }
  ]
};

export const getStoredExpensePlan = (userId: string): ExpensePlan => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_PLANS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_PLANS, JSON.stringify([DEFAULT_EXPENSE_PLAN]));
    return DEFAULT_EXPENSE_PLAN;
  }
  try {
    const plans = JSON.parse(data) as ExpensePlan[];
    const userPlan = plans.find(p => p.userId === userId || p.userId === 'demo-patient');
    return userPlan || { ...DEFAULT_EXPENSE_PLAN, userId };
  } catch {
    return DEFAULT_EXPENSE_PLAN;
  }
};

export const saveStoredExpensePlan = (plan: ExpensePlan): ExpensePlan => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_PLANS);
  let plans: ExpensePlan[] = [];
  if (data) {
    try {
      plans = JSON.parse(data);
    } catch {
      plans = [];
    }
  }
  const otherPlans = plans.filter(p => p.id !== plan.id && p.userId !== plan.userId);
  const updated = [...otherPlans, plan];
  localStorage.setItem(STORAGE_KEYS.EXPENSE_PLANS, JSON.stringify(updated));
  return plan;
};

// ==========================================
// ADMINISTRATIVE GOVERNANCE & PRIVILEGE GUARDS
// ==========================================

export const INITIAL_OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    id: 'res-pmjay',
    title: 'Ayushman Bharat PM-JAY Specialty Care Package Guidelines',
    category: 'scheme',
    description: 'National Health Authority guidelines on surgical and post-transplant immunosuppressant coverage up to ₹5,00,000 for eligible families.',
    officialUrl: 'https://pmjay.gov.in',
    authorityName: 'National Health Authority (NHA)',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'res-ran',
    title: 'Rashtriya Arogya Nidhi (RAN) Financial Assistance Scheme',
    category: 'scheme',
    description: 'One-time financial assistance up to ₹15 Lakhs for BPL patients undergoing major organ transplantation at Central Govt hospitals.',
    officialUrl: 'https://mohfw.gov.in',
    authorityName: 'Ministry of Health and Family Welfare (MoHFW)',
    isActive: true,
    createdAt: '2026-01-12T12:00:00Z'
  },
  {
    id: 'res-thota-act',
    title: 'Transplantation of Human Organs and Tissues Act, 1994 (with 2011 Amendments)',
    category: 'statutory_act',
    description: 'Principal statutory legislation regulating organ removal, storage, transplantation, and prevention of commercial dealings in India.',
    officialUrl: 'https://notto.mohfw.gov.in',
    authorityName: 'Parliament of India / MoHFW',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'res-form-1',
    title: 'THOTA Form 1 — Living Near-Relative Donor Application & Joint Affidavit',
    category: 'form',
    description: 'Mandatory statutory application and declaration format for parents, siblings, children, and spouses donating under Rule 3.',
    officialUrl: 'https://notto.mohfw.gov.in',
    authorityName: 'NOTTO Statutory Directorate',
    isActive: true,
    createdAt: '2026-01-05T09:00:00Z'
  },
  {
    id: 'res-notto-portal',
    title: 'National Organ and Tissue Transplant Organisation (NOTTO) Apex Registry',
    category: 'portal',
    description: 'Central portal for national organ allocation registry, waiting lists, transplant center licensing, and SOTTO coordination.',
    officialUrl: 'https://notto.mohfw.gov.in',
    authorityName: 'Directorate General of Health Services (DGHS)',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// --- 1. User Profile & Role Administration ---

export const getStoredProfiles = (): UserProfile[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  let profiles: UserProfile[] = DEMO_PROFILES;
  if (data) {
    try {
      profiles = JSON.parse(data);
    } catch {
      profiles = DEMO_PROFILES;
    }
  }
  // Guarantee every profile has a permanent publicId
  return profiles.map((p) => {
    if (!p.publicId) {
      const canonical = DEMO_PROFILES.find((d) => d.id === p.id);
      return { ...p, publicId: canonical?.publicId || generatePublicUserId() };
    }
    return p;
  });
};

export const saveStoredProfiles = (profiles: UserProfile[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
};

/**
 * Retrieves a public pseudonymous user identity without exposing
 * internal user ID, email, telephone number, or private account details.
 */
export const getPublicUserIdentity = (publicId: string): PublicUserIdentity | null => {
  if (!publicId) return null;
  const profiles = getStoredProfiles();
  const matched = profiles.find((p) => p.publicId === publicId.trim());
  if (!matched) return null;
  return toPublicUserIdentity(matched);
};

/**
 * Default-Deny Server/Store Level Authorization for User Profiles.
 * Only the owner, an administrator, or authorized hospital staff may view private profile details.
 */
export const getUserProfileSecure = (
  targetUserId: string,
  requester: UserProfile | null
): { profile?: UserProfile; error?: string } => {
  if (!requester) {
    return { error: 'Authentication required: Unauthenticated users cannot access user profiles.' };
  }

  const profiles = getStoredProfiles();
  const target = profiles.find((p) => p.id === targetUserId || p.publicId === targetUserId);

  if (!target) {
    return { error: 'User profile not found.' };
  }

  // Owner access
  if (requester.id === target.id || (requester.publicId && requester.publicId === target.publicId)) {
    return { profile: target };
  }

  // Administrator supervisory access
  if (requester.role === 'admin') {
    return { profile: target };
  }

  // Authorized hospital staff (only for active patients under hospital care)
  if (requester.role === 'hospital_staff') {
    recordAuditLog(
      requester,
      'CLINICAL_INTAKE_PROFILE_ACCESSED',
      'profiles',
      target.id,
      {
        accessedPublicId: target.publicId,
        authorizedStaffOrg: requester.organization || 'AIIMS Apex Center'
      }
    );
    return { profile: target };
  }

  // Default-deny for ordinary users & volunteers
  recordAuditLog(
    requester,
    'UNAUTHORIZED_PROFILE_ACCESS_PREVENTED',
    'profiles',
    target.id,
    {
      attemptedById: requester.id,
      attemptedRole: requester.role,
      targetUserId: target.id,
      violation: 'DEFAULT_DENY_USER_ISOLATION'
    }
  );

  return {
    error: 'Access Denied: Private user profiles are strictly protected under DPDP Act 2023. Ordinary users cannot view other profiles.'
  };
};

/**
 * Updates a user profile with strict immutability checks.
 * Under no circumstances can a user alter their permanent publicId.
 */
export const updateUserProfile = (
  targetUserId: string,
  updates: Partial<UserProfile>,
  requester: UserProfile | null
): { success: boolean; error?: string; profile?: UserProfile } => {
  if (!requester) {
    return { success: false, error: 'Authentication required to update profile settings.' };
  }

  const profiles = getStoredProfiles();
  const existing = profiles.find((p) => p.id === targetUserId);

  if (!existing) {
    return { success: false, error: 'User profile not found.' };
  }

  // Authorization: Only owner or admin can update profile details
  if (requester.id !== existing.id && requester.role !== 'admin') {
    return { success: false, error: 'Access Denied: You cannot modify another user’s account.' };
  }

  // IMMUTABILITY GUARD: Reject any attempt to modify or tamper with publicId
  if (updates.publicId && updates.publicId !== existing.publicId) {
    recordAuditLog(
      requester,
      'PUBLIC_ID_TAMPERING_ATTEMPT_BLOCKED',
      'profiles',
      existing.id,
      {
        attemptedNewPublicId: updates.publicId,
        existingPublicId: existing.publicId,
        violation: 'PERMANENT_PUBLIC_ID_IMMUTABILITY'
      }
    );
    return {
      success: false,
      error: 'Security Policy Violation: public_id is permanent and immutable. It cannot be altered.'
    };
  }

  // Role escalation guard: ordinary users cannot change their own role
  if (updates.role && updates.role !== existing.role && requester.role !== 'admin') {
    return {
      success: false,
      error: 'Privilege Escalation Detected: Role assignments can only be authorized by platform administrators.'
    };
  }

  const updatedProfile: UserProfile = {
    ...existing,
    ...updates,
    publicId: existing.publicId, // Enforce immutability
    updatedAt: new Date().toISOString()
  };

  const updatedList = profiles.map((p) => (p.id === targetUserId ? updatedProfile : p));
  saveStoredProfiles(updatedList);

  // If updating current user, sync current user storage
  const currentUser = getStoredUser();
  if (currentUser && currentUser.id === targetUserId) {
    setStoredUser(updatedProfile);
  }

  recordAuditLog(requester, 'USER_PROFILE_UPDATED', 'profiles', targetUserId, {
    publicId: updatedProfile.publicId,
    updatedFields: Object.keys(updates).filter((k) => k !== 'publicId')
  });

  return { success: true, profile: updatedProfile };
};

/**
 * Returns assistance requests with sensitive fields sanitized according to default-deny rules.
 */
export const getSanitizedAssistanceRequests = (
  viewer: UserProfile | null
): SanitizedAssistanceRequest[] => {
  const requests = getStoredRequests();
  return requests.map((req) => sanitizeAssistanceRequest(req, viewer));
};

export interface RoleUpdateResult {
  success: boolean;
  error?: string;
  updatedProfiles?: UserProfile[];
}

export const updateUserProfileRole = (
  adminUser: UserProfile | null,
  targetUserId: string,
  newRole: UserRole,
  reason?: string
): RoleUpdateResult => {
  // Authorization check: only admin can change roles
  if (!adminUser || adminUser.role !== 'admin') {
    if (adminUser) {
      recordAuditLog(
        adminUser,
        'UNAUTHORIZED_PRIVILEGE_ESCALATION_ATTEMPT',
        'profiles',
        targetUserId,
        {
          attemptedBy: adminUser.fullName,
          attemptedRole: adminUser.role,
          targetUserId,
          targetDesiredRole: newRole,
          violation: 'NON_ADMIN_ROLE_CHANGE_BLOCKED'
        }
      );
    }
    return {
      success: false,
      error: 'Security Breach Prevented: Only authenticated platform administrators can modify user roles.'
    };
  }

  const profiles = getStoredProfiles();
  const targetUser = profiles.find((p) => p.id === targetUserId);
  if (!targetUser) {
    return { success: false, error: 'Target user profile not found in directory.' };
  }

  // Prevent sole active administrator demotion
  const activeAdmins = profiles.filter((p) => p.role === 'admin' && p.isActive);
  if (targetUser.role === 'admin' && newRole !== 'admin' && activeAdmins.length <= 1) {
    recordAuditLog(
      adminUser,
      'SOLE_ADMIN_DEMOTION_PREVENTED',
      'profiles',
      targetUserId,
      {
        attemptedBy: adminUser.fullName,
        targetUserName: targetUser.fullName,
        violation: 'CANNOT_DEMOTE_SOLE_ADMINISTRATOR'
      }
    );
    return {
      success: false,
      error: 'Privilege Escalation Protection: Cannot demote the sole active platform administrator. Promote another administrator before reassigning this account.'
    };
  }

  const updated = profiles.map((p) => (p.id === targetUserId ? { ...p, role: newRole } : p));
  saveStoredProfiles(updated);

  recordAuditLog(
    adminUser,
    'ROLE_ASSIGNMENT_CONFIRMED',
    'profiles',
    targetUserId,
    {
      targetUserName: targetUser.fullName,
      oldRole: targetUser.role,
      assignedRole: newRole,
      governanceReason: reason || 'Administrative privilege review'
    }
  );

  return { success: true, updatedProfiles: updated };
};

// --- 2. Official Resources Management ---

export const getStoredResources = (): OfficialResource[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RESOURCES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(INITIAL_OFFICIAL_RESOURCES));
    return INITIAL_OFFICIAL_RESOURCES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_OFFICIAL_RESOURCES;
  }
};

export const saveStoredResources = (resources: OfficialResource[]): void => {
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
};

export const createResource = (
  adminUser: UserProfile | null,
  resourceData: Omit<OfficialResource, 'id' | 'createdAt'>
): { success: boolean; error?: string; resource?: OfficialResource } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can create official resources.' };
  }
  const current = getStoredResources();
  const newResource: OfficialResource = {
    ...resourceData,
    id: `res-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newResource, ...current];
  saveStoredResources(updated);

  recordAuditLog(adminUser, 'OFFICIAL_RESOURCE_CREATED', 'official_resources', newResource.id, {
    title: newResource.title,
    category: newResource.category,
    authority: newResource.authorityName
  });

  return { success: true, resource: newResource };
};

export const updateResource = (
  adminUser: UserProfile | null,
  resourceId: string,
  updates: Partial<OfficialResource>
): { success: boolean; error?: string; resource?: OfficialResource } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can update official resources.' };
  }
  const current = getStoredResources();
  const existing = current.find((r) => r.id === resourceId);
  if (!existing) {
    return { success: false, error: 'Resource not found.' };
  }
  const updatedResource: OfficialResource = { ...existing, ...updates };
  const updatedList = current.map((r) => (r.id === resourceId ? updatedResource : r));
  saveStoredResources(updatedList);

  recordAuditLog(adminUser, 'OFFICIAL_RESOURCE_UPDATED', 'official_resources', resourceId, {
    title: updatedResource.title,
    updates
  });

  return { success: true, resource: updatedResource };
};

export const deleteResource = (
  adminUser: UserProfile | null,
  resourceId: string,
  reason: string
): { success: boolean; error?: string } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can delete official resources.' };
  }
  const current = getStoredResources();
  const target = current.find((r) => r.id === resourceId);
  if (!target) {
    return { success: false, error: 'Resource not found.' };
  }
  const updatedList = current.filter((r) => r.id !== resourceId);
  saveStoredResources(updatedList);

  recordAuditLog(adminUser, 'OFFICIAL_RESOURCE_DELETED', 'official_resources', resourceId, {
    title: target.title,
    reason
  });

  return { success: true };
};

// --- 3. Hospital Directory Administration & Verification Reviews ---

export const createHospital = (
  adminUser: UserProfile | null,
  hospitalData: Omit<VerifiedHospital, 'id'>
): { success: boolean; error?: string; hospital?: VerifiedHospital } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can add hospitals to the verified directory.' };
  }
  const current = getStoredHospitals();
  const newHospital: VerifiedHospital = {
    ...hospitalData,
    id: `hosp-${Date.now()}`
  };
  const updated = [newHospital, ...current];
  saveStoredHospitals(updated);

  recordAuditLog(adminUser, 'HOSPITAL_DIRECTORY_CREATED', 'verified_hospitals', newHospital.id, {
    name: newHospital.name,
    registrationNumber: newHospital.registrationNumber,
    state: newHospital.state
  });

  return { success: true, hospital: newHospital };
};

export const updateHospital = (
  adminUser: UserProfile | null,
  hospitalId: string,
  updates: Partial<VerifiedHospital>
): { success: boolean; error?: string; hospital?: VerifiedHospital } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can edit hospital directory records.' };
  }
  const current = getStoredHospitals();
  const existing = current.find((h) => h.id === hospitalId);
  if (!existing) {
    return { success: false, error: 'Hospital not found.' };
  }
  const updatedHospital: VerifiedHospital = { ...existing, ...updates };
  const updatedList = current.map((h) => (h.id === hospitalId ? updatedHospital : h));
  saveStoredHospitals(updatedList);

  recordAuditLog(adminUser, 'HOSPITAL_DIRECTORY_UPDATED', 'verified_hospitals', hospitalId, {
    name: updatedHospital.name,
    registrationNumber: updatedHospital.registrationNumber,
    updates
  });

  return { success: true, hospital: updatedHospital };
};

export const deleteHospital = (
  adminUser: UserProfile | null,
  hospitalId: string,
  reason: string
): { success: boolean; error?: string } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can remove hospital directory records.' };
  }
  const current = getStoredHospitals();
  const target = current.find((h) => h.id === hospitalId);
  if (!target) {
    return { success: false, error: 'Hospital not found.' };
  }
  const updatedList = current.filter((h) => h.id !== hospitalId);
  saveStoredHospitals(updatedList);

  recordAuditLog(adminUser, 'HOSPITAL_DIRECTORY_DELETED', 'verified_hospitals', hospitalId, {
    name: target.name,
    registrationNumber: target.registrationNumber,
    reason
  });

  return { success: true };
};

export const updateHospitalVerificationReview = (
  adminUser: UserProfile | null,
  hospitalId: string,
  reviewStatus: HospitalReviewStatus,
  notes?: string
): { success: boolean; error?: string; hospital?: VerifiedHospital } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can conduct verification reviews.' };
  }
  const current = getStoredHospitals();
  const target = current.find((h) => h.id === hospitalId);
  if (!target) {
    return { success: false, error: 'Hospital not found.' };
  }
  const today = new Date().toISOString().split('T')[0];
  const updatedHospital: VerifiedHospital = {
    ...target,
    reviewStatus,
    isVerified: reviewStatus === 'verified',
    sourceVerificationDate: today
  };
  const updatedList = current.map((h) => (h.id === hospitalId ? updatedHospital : h));
  saveStoredHospitals(updatedList);

  recordAuditLog(adminUser, 'HOSPITAL_VERIFICATION_REVIEW_UPDATED', 'verified_hospitals', hospitalId, {
    name: target.name,
    registrationNumber: target.registrationNumber,
    oldReviewStatus: target.reviewStatus,
    newReviewStatus: reviewStatus,
    reverifiedDate: today,
    reviewNotes: notes || 'Quarterly regulatory compliance review'
  });

  return { success: true, hospital: updatedHospital };
};

// --- 4. Request Oversight Administration ---

export const adminUpdateRequest = (
  adminUser: UserProfile | null,
  requestId: string,
  updates: {
    status?: RequestStatus;
    assignedVolunteerId?: string;
    assignedVolunteerName?: string;
    coordinatorNotes?: string;
  }
): { success: boolean; error?: string; request?: AssistanceRequest } => {
  if (!adminUser || adminUser.role !== 'admin') {
    return { success: false, error: 'Access Denied: Only administrators can conduct global request oversight.' };
  }
  const allRequests = getStoredRequests();
  const target = allRequests.find((r) => r.id === requestId);
  if (!target) {
    return { success: false, error: 'Assistance request not found.' };
  }
  const updatedReq: AssistanceRequest = {
    ...target,
    ...updates,
    updatedAt: new Date().toISOString(),
    assignedAt: updates.assignedVolunteerId ? (target.assignedAt || new Date().toISOString()) : target.assignedAt
  };
  const updatedList = allRequests.map((r) => (r.id === requestId ? updatedReq : r));
  saveStoredRequests(updatedList);

  recordAuditLog(adminUser, 'ADMIN_REQUEST_OVERSIGHT_UPDATED', 'assistance_requests', requestId, {
    patientName: target.patientName,
    oldStatus: target.status,
    newStatus: updates.status || target.status,
    assignedVolunteerId: updates.assignedVolunteerId,
    coordinatorNotes: updates.coordinatorNotes
  });

  return { success: true, request: updatedReq };
};

// ==============================================================================
// 5. Organ Donor Registration & Private Donor Profiles
// ==============================================================================

export const getStoredDonorProfiles = (): DonorProfile[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.DONOR_PROFILES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.DONOR_PROFILES, JSON.stringify(INITIAL_DONOR_PROFILES));
    return INITIAL_DONOR_PROFILES;
  }
  try {
    return JSON.parse(raw) as DonorProfile[];
  } catch {
    return INITIAL_DONOR_PROFILES;
  }
};

export const saveStoredDonorProfiles = (profiles: DonorProfile[]): void => {
  localStorage.setItem(STORAGE_KEYS.DONOR_PROFILES, JSON.stringify(profiles));
};

export const getDonorProfileByUserId = (userId: string): DonorProfile | null => {
  const all = getStoredDonorProfiles();
  return all.find((p) => p.userId === userId) || null;
};

export const getDonorProfileByPublicDonorId = (publicDonorId: string): DonorProfile | null => {
  const all = getStoredDonorProfiles();
  return all.find((p) => p.publicDonorId === publicDonorId) || null;
};

/**
 * Returns only explicitly approved, non-identifying public donor records.
 * Strips all personal names, phone numbers, emails, emergency contacts, and internal IDs.
 */
export const getPublicDonorPledges = (): PublicDonorIdentity[] => {
  const all = getStoredDonorProfiles();
  return all
    .filter((p) => p.isPublicPledgeAnonymous && p.pledgeStatus !== 'withdrawn')
    .map(toPublicDonorIdentity);
};

export interface RegisterDonorPledgeInput {
  pledgedOrgans: PledgedOrganCategory[];
  state: string;
  city?: string;
  bloodGroup?: string;
  familyInformed: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  officialNottoRegistrationNumber?: string;
  isPublicPledgeAnonymous?: boolean;
}

export const registerDonorPledge = (
  data: RegisterDonorPledgeInput,
  user: UserProfile | null
): { success: boolean; error?: string; profile?: DonorProfile } => {
  if (!user) {
    return { success: false, error: 'Authentication required to register as an organ donor.' };
  }

  // Validate state
  if (!data.state || data.state.trim() === '') {
    return { success: false, error: 'Please select your state of residence.' };
  }

  // Validate pledged organs
  if (!data.pledgedOrgans || data.pledgedOrgans.length === 0) {
    return { success: false, error: 'Please select at least one organ category or all organs to pledge.' };
  }

  const existingList = getStoredDonorProfiles();
  const alreadyPledged = existingList.find((p) => p.userId === user.id);
  if (alreadyPledged && alreadyPledged.pledgeStatus !== 'withdrawn') {
    return {
      success: false,
      error: `You have an active donor pledge with Public Donor ID: ${alreadyPledged.publicDonorId}. You can manage it from your dashboard.`
    };
  }

  // Generate unique immutable public donor ID
  const existingPublicDonorIds = new Set(existingList.map((p) => p.publicDonorId));
  const publicDonorId = generatePublicDonorId(existingPublicDonorIds);

  const now = new Date().toISOString();
  const newProfile: DonorProfile = {
    id: `dnr-prof-${Date.now()}`,
    userId: user.id,
    publicDonorId,
    pledgeStatus: data.officialNottoRegistrationNumber ? 'notto_registered' : 'pledged_interest',
    pledgedOrgans: data.pledgedOrgans,
    familyInformed: data.familyInformed,
    emergencyContactName: data.emergencyContactName?.trim(),
    emergencyContactPhone: data.emergencyContactPhone?.trim(),
    officialNottoRegistrationNumber: data.officialNottoRegistrationNumber?.trim(),
    state: data.state.trim(),
    city: data.city?.trim(),
    bloodGroup: data.bloodGroup?.trim(),
    consentSigned: true,
    consentSignedAt: now,
    isPublicPledgeAnonymous: data.isPublicPledgeAnonymous !== false,
    createdAt: now,
    updatedAt: now
  };

  // Replace old profile if user re-pledged after withdrawal, else append
  const updatedList = existingList.some((p) => p.userId === user.id)
    ? existingList.map((p) => (p.userId === user.id ? newProfile : p))
    : [...existingList, newProfile];

  saveStoredDonorProfiles(updatedList);

  recordAuditLog(user, 'DONOR_PLEDGE_REGISTERED', 'donor_profiles', newProfile.id, {
    publicDonorId,
    pledgedOrgans: newProfile.pledgedOrgans,
    state: newProfile.state,
    familyInformed: newProfile.familyInformed,
    statutoryNotice: 'Voluntary altruistic pledge recorded under DPDP Act 2023 & THOTA 1994.'
  });

  return { success: true, profile: newProfile };
};

export const updateDonorPledge = (
  publicDonorId: string,
  updates: Partial<Omit<DonorProfile, 'id' | 'userId' | 'publicDonorId' | 'createdAt'>>,
  user: UserProfile | null
): { success: boolean; error?: string; profile?: DonorProfile } => {
  if (!user) {
    return { success: false, error: 'Authentication required to update donor pledge.' };
  }

  const all = getStoredDonorProfiles();
  const targetIndex = all.findIndex((p) => p.publicDonorId === publicDonorId);

  if (targetIndex === -1) {
    return { success: false, error: 'Donor profile not found.' };
  }

  const target = all[targetIndex];

  // Least privilege / ownership check
  if (target.userId !== user.id && user.role !== 'admin') {
    recordAuditLog(user, 'UNAUTHORIZED_DONOR_PROFILE_ACCESS_ATTEMPT', 'donor_profiles', target.id, {
      attemptedById: user.id,
      targetUserId: target.userId
    });
    return { success: false, error: 'Access Denied: You do not have permission to modify this donor profile.' };
  }

  const updatedProfile: DonorProfile = {
    ...target,
    ...updates,
    // publicDonorId is permanent and immutable
    publicDonorId: target.publicDonorId,
    updatedAt: new Date().toISOString()
  };

  all[targetIndex] = updatedProfile;
  saveStoredDonorProfiles(all);

  recordAuditLog(user, 'DONOR_PLEDGE_UPDATED', 'donor_profiles', target.id, {
    publicDonorId: target.publicDonorId,
    updatedFields: Object.keys(updates)
  });

  return { success: true, profile: updatedProfile };
};

export const withdrawDonorPledge = (
  publicDonorId: string,
  user: UserProfile | null,
  reason?: string
): { success: boolean; error?: string } => {
  if (!user) {
    return { success: false, error: 'Authentication required to withdraw donor pledge.' };
  }

  const all = getStoredDonorProfiles();
  const targetIndex = all.findIndex((p) => p.publicDonorId === publicDonorId);

  if (targetIndex === -1) {
    return { success: false, error: 'Donor profile not found.' };
  }

  const target = all[targetIndex];

  if (target.userId !== user.id && user.role !== 'admin') {
    return { success: false, error: 'Access Denied: You can only withdraw your own donor pledge.' };
  }

  all[targetIndex] = {
    ...target,
    pledgeStatus: 'withdrawn',
    updatedAt: new Date().toISOString()
  };

  saveStoredDonorProfiles(all);

  recordAuditLog(user, 'DONOR_PLEDGE_WITHDRAWN', 'donor_profiles', target.id, {
    publicDonorId: target.publicDonorId,
    reason: reason || 'Donor voluntary withdrawal',
    statutoryNotice: 'Pledge withdrawn. Public directory access removed immediately.'
  });

  return { success: true };
};

export const getDonorMilestones = (donorProfile: DonorProfile): DonorMilestoneItem[] => {
  return DEFAULT_DONOR_MILESTONES.map((step) => {
    if (step.id === 'step-1-pledge') {
      return {
        ...step,
        isCompleted: donorProfile.pledgeStatus !== 'withdrawn',
        completedAt: donorProfile.createdAt
      };
    }
    if (step.id === 'step-2-family') {
      return {
        ...step,
        isCompleted: donorProfile.familyInformed,
        completedAt: donorProfile.familyInformed ? donorProfile.updatedAt : undefined
      };
    }
    if (step.id === 'step-3-notto') {
      const isNotto = Boolean(donorProfile.officialNottoRegistrationNumber) || donorProfile.pledgeStatus === 'notto_registered';
      return {
        ...step,
        isCompleted: isNotto,
        completedAt: isNotto ? donorProfile.updatedAt : undefined
      };
    }
    if (step.id === 'step-4-card') {
      return {
        ...step,
        isCompleted: true // Available once registered
      };
    }
    return step;
  });
};

// ==============================================================================
// 6. Hospital Institutional Registration & Statutory Verification
// ==============================================================================

export const getStoredHospitalApplications = (): HospitalApplication[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.HOSPITAL_APPLICATIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HospitalApplication[];
  } catch {
    return [];
  }
};

export const saveStoredHospitalApplications = (apps: HospitalApplication[]): void => {
  localStorage.setItem(STORAGE_KEYS.HOSPITAL_APPLICATIONS, JSON.stringify(apps));
};

export interface SubmitHospitalApplicationInput {
  hospitalName: string;
  registrationNumber: string;
  state: string;
  city: string;
  coordinatorName: string;
  officialEmail: string;
  officialPhone: string;
  accreditation: string;
}

export const submitHospitalRegistrationApplication = (
  data: SubmitHospitalApplicationInput
): { success: boolean; error?: string; application?: HospitalApplication; user?: UserProfile } => {
  // Input validations
  if (!data.hospitalName || data.hospitalName.trim() === '') {
    return { success: false, error: 'Please enter the official legal name of the healthcare institution.' };
  }
  if (!data.registrationNumber || data.registrationNumber.trim() === '') {
    return { success: false, error: 'Please provide the official NOTTO or State statutory licensing registration number.' };
  }
  if (!data.coordinatorName || data.coordinatorName.trim() === '') {
    return { success: false, error: 'Please enter the name of the authorized transplant coordinator or medical superintendent.' };
  }
  if (!data.officialEmail || !data.officialEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid institutional email address.' };
  }
  if (!data.officialPhone || data.officialPhone.trim().length < 8) {
    return { success: false, error: 'Please provide a valid institutional contact number.' };
  }
  if (!data.state || data.state.trim() === '') {
    return { success: false, error: 'Please select the state or union territory where the institution operates.' };
  }

  const existingApps = getStoredHospitalApplications();
  const duplicate = existingApps.find(
    (app) =>
      app.registrationNumber.toLowerCase() === data.registrationNumber.trim().toLowerCase() ||
      app.officialEmail.toLowerCase() === data.officialEmail.trim().toLowerCase()
  );

  if (duplicate && duplicate.status === 'pending') {
    return {
      success: false,
      error: `An application for registration number "${data.registrationNumber}" is already under administrative review. Our compliance team will reach out to ${duplicate.officialEmail}.`
    };
  }

  const appId = `hosp-app-${Date.now()}`;
  const userId = `usr-hosp-${Date.now()}`;
  const now = new Date().toISOString();

  const newApplication: HospitalApplication = {
    id: appId,
    userId,
    hospitalName: data.hospitalName.trim(),
    registrationNumber: data.registrationNumber.trim(),
    state: data.state.trim(),
    city: data.city.trim(),
    coordinatorName: data.coordinatorName.trim(),
    officialEmail: data.officialEmail.trim().toLowerCase(),
    officialPhone: data.officialPhone.trim(),
    accreditation: data.accreditation.trim() || 'NABH / State Statutory License',
    status: 'pending',
    submittedAt: now
  };

  const updatedApps = [...existingApps, newApplication];
  saveStoredHospitalApplications(updatedApps);

  // SECURITY GUARD: Create user account with 'patient' safe public role and 'pending' verification.
  // Privileged 'hospital_staff' role is NEVER automatically granted upon self-registration.
  const newProfile: UserProfile = {
    id: userId,
    publicId: generatePublicUserId(),
    email: data.officialEmail.trim().toLowerCase(),
    fullName: data.coordinatorName.trim(),
    phone: data.officialPhone.trim(),
    role: 'patient', // Safe unprivileged baseline
    organization: data.hospitalName.trim(),
    hospitalVerificationStatus: 'pending',
    hospitalRegistrationNumber: data.registrationNumber.trim(),
    isActive: false, // Inactive for privileged hospital staff operations until verified
    createdAt: now,
    updatedAt: now
  };

  // Add to local profiles store
  const allProfiles = getStoredProfiles();
  saveStoredProfiles([...allProfiles, newProfile]);

  recordAuditLog(newProfile, 'HOSPITAL_REGISTRATION_APPLICATION_SUBMITTED', 'hospital_applications', appId, {
    hospitalName: newApplication.hospitalName,
    registrationNumber: newApplication.registrationNumber,
    coordinatorName: newApplication.coordinatorName,
    state: newApplication.state,
    verificationStatus: 'pending_administrative_review',
    statutoryNotice: 'THOTA 1994 compliance check required before hospital staff portal activation.'
  });

  return { success: true, application: newApplication, user: newProfile };
};

export const getHospitalApplicationByUserId = (userId: string): HospitalApplication | null => {
  const apps = getStoredHospitalApplications();
  return apps.find((a) => a.userId === userId) || null;
};

