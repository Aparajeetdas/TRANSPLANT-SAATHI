export type UserRole = 'patient' | 'family' | 'volunteer' | 'hospital_staff' | 'admin' | 'donor';

export type OrganType = 'kidney' | 'liver' | 'heart' | 'lungs' | 'cornea' | 'pancreas' | 'bone_marrow' | 'intestine';

export type RequestStatus = 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type DonorPledgeStatus = 'pledged_interest' | 'notto_registered' | 'living_donor_candidate' | 'withdrawn';

export type PledgedOrganCategory = 'all' | 'kidney' | 'liver' | 'heart' | 'lungs' | 'cornea' | 'pancreas' | 'bone_marrow' | 'intestine' | 'tissues';

export interface DonorProfile {
  id: string;
  userId: string;
  publicDonorId: string; // Permanent anonymous donor identifier (e.g. "TS-DNR-7K9P-X4QM")
  pledgeStatus: DonorPledgeStatus;
  pledgedOrgans: PledgedOrganCategory[];
  familyInformed: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  officialNottoRegistrationNumber?: string;
  state: string;
  city?: string;
  bloodGroup?: string;
  consentSigned: boolean;
  consentSignedAt: string;
  isPublicPledgeAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicDonorIdentity {
  publicDonorId: string;
  pledgeStatus: DonorPledgeStatus;
  pledgedOrgans: PledgedOrganCategory[];
  state: string;
  pledgeDate: string;
  familyInformed: boolean;
}

export interface DonorMilestoneItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  statutoryNotice?: string;
  officialUrl?: string;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  publicId?: string; // Permanent anonymous public identifier (e.g. "TS-7K9P-X4QM")
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  organization?: string;
  hospitalVerificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  hospitalRegistrationNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PublicUserIdentity {
  publicId: string;
  role: UserRole;
  avatarSeed: string;
  organCategory?: OrganType;
  state?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserPrivacySettings {
  publicId: string;
  isPseudonymous: boolean;
  hideContactFromVolunteers: boolean;
  showGeneralRegionOnly: boolean;
}

export type HospitalReviewStatus = 'verified' | 'pending' | 'flagged';

export interface HospitalSourceCitation {
  id: string;
  organType: OrganType;
  sourceAuthority: string;
  citationReference: string;
  sourceUrl: string;
  verifiedDate: string;
  reviewStatus: HospitalReviewStatus;
  statutoryStatus: string;
  reviewedBy: string;
}

export interface VerifiedHospital {
  id: string;
  name: string;
  registrationNumber: string;
  state: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  organsSupported: OrganType[];
  accreditation: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  sourceUrl: string;
  sourceVerificationDate: string;
  isVerified: boolean;
  bedCapacityEstimate?: number;
  isDemonstrationRecord?: boolean;
  reviewStatus: HospitalReviewStatus;
  sources?: HospitalSourceCitation[];
}

export interface AssistanceRequest {
  id: string;
  patientId: string;
  patientPublicId?: string; // Pseudonymous identifier (e.g. "TS-7K9P-X4QM")
  patientName: string;
  contactPhone: string;
  organCategory: OrganType;
  hospitalName: string;
  supportType: 'Paperwork (Form 1/2/3)' | 'Wayfinding & Logistics' | 'Language Help' | 'Financial Scheme Guidance';
  notes?: string;
  status: RequestStatus;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  coordinatorNotes?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SanitizedAssistanceRequest {
  id: string;
  patientPublicId: string;
  patientDisplayName: string;
  contactPhoneMasked: string;
  organCategory: OrganType;
  hospitalName: string;
  supportType: 'Paperwork (Form 1/2/3)' | 'Wayfinding & Logistics' | 'Language Help' | 'Financial Scheme Guidance';
  notes?: string;
  status: RequestStatus;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  coordinatorNotes?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  isAuthorizedViewer: boolean;
}

export type HospitalAssistanceStatus =
  | 'draft'
  | 'submitted'
  | 'awaiting_hospital_review'
  | 'additional_info_required'
  | 'under_hospital_review'
  | 'referred_official_registration'
  | 'assistance_in_progress'
  | 'closed'
  | 'cancelled';

export type HospitalAssistanceCategory =
  | 'transplant_guidance'
  | 'official_registration'
  | 'document_guidance'
  | 'hospital_coordination'
  | 'financial_counseling';

export interface RequestStatusHistoryEntry {
  id: string;
  fromStatus: HospitalAssistanceStatus | null;
  toStatus: HospitalAssistanceStatus;
  updatedBy: string;
  updatedByRole: UserRole;
  timestamp: string;
  note?: string;
}

export interface RequestPatientMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface RequestInternalNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  note: string;
  timestamp: string;
}

export interface HospitalAssistanceRequest {
  id: string;
  referenceNumber: string; // Non-guessable identifier e.g. "TS-REQ-2026-KD-8472"
  patientId: string;
  patientPublicId: string; // Anonymous public identifier e.g. "TS-7K9P-X4QM"
  patientName: string;
  contactPhone: string;
  contactEmail: string;
  preferredContactMethod: 'phone' | 'email' | 'in_app';
  hospitalId: string;
  hospitalName: string;
  organProgram: OrganType;
  requestCategory: HospitalAssistanceCategory;
  description: string;
  consentGiven: boolean;
  consentTimestamp: string;
  status: HospitalAssistanceStatus;
  statusHistory: RequestStatusHistoryEntry[];
  patientNotes: RequestPatientMessage[];
  internalNotes: RequestInternalNote[]; // Restricted strictly to hospital coordinators & admins
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request_submitted' | 'status_update' | 'info_required' | 'message_received';
  requestId?: string;
  referenceNumber?: string;
  isRead: boolean;
  createdAt: string;
}

export interface HospitalIntakeRecord {
  id: string;
  hospitalId: string;
  anonymousPatientCode: string; // Synthetic code e.g. "SYN-PAT-2026-KD-041"
  organCategory: OrganType;
  donorRelationType: 'Near Relative (Living)' | 'Spouse' | 'Other / Swap' | 'Deceased Candidate List';
  thotaComplianceStatus: 'Form 1 Verified' | 'Awaiting Authorization Committee' | 'Committee Cleared' | 'Pending HLA Report';
  committeeMeetingDate?: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetTable: string;
  targetId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface FinancialScheme {
  id: string;
  title: string;
  authority: string;
  eligibility: string;
  coverageDetails: string;
  applicationProcess: string[];
  officialPortalUrl: string;
  sourceCitation: string;
  lastVerifiedDate: string;
}

export interface StatutoryDocumentRequirement {
  formNumber: string;
  title: string;
  actReference: string;
  applicability: string;
  requiredDocuments: string[];
  statutoryWarning: string;
  downloadUrl?: string;
}

export type JourneyStage = 'evaluation' | 'legal_clearance' | 'pre_transplant' | 'surgery' | 'post_discharge';

export interface PatientJourneyStep {
  id: string;
  stage: JourneyStage;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  mandatoryDocuments: string[];
  statutoryNotes?: string;
}

export interface PatientChecklistItem {
  id: string;
  userId: string;
  title: string;
  stage: JourneyStage;
  statutoryReference?: string;
  isMandatory: boolean;
  isCompleted: boolean;
  notes?: string;
  completedAt?: string;
}

export interface AppointmentNote {
  id: string;
  userId: string;
  doctorOrDepartment: string;
  hospitalName: string;
  appointmentDate: string;
  keyDiscussionPoints: string;
  prescribedTestsOrNextSteps: string;
  questionsForNextVisit: string;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  planId: string;
  category: 'donor_eval' | 'pre_op' | 'hospital_package' | 'lodging_travel' | 'immunosuppressants' | 'margin_of_safety';
  categoryLabel: string;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  isPaid: boolean;
  receiptReference?: string;
}

export interface ExpensePlan {
  id: string;
  userId: string;
  organCategory: OrganType;
  targetHospital: string;
  targetBudget: number;
  hasGovernmentScheme: boolean;
  schemeName?: string;
  sanctionedAmount: number;
  items: ExpenseItem[];
  updatedAt: string;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  role: UserRole;
  assignedBy?: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  governanceNotes?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  purpose: string;
  hasConsented: boolean;
  ipHash?: string;
  version: string;
  consentedAt: string;
  revokedAt?: string;
}

export interface SyntheticClinicalRecord {
  id: string;
  hospitalId?: string;
  syntheticPatientCode: string;
  organType: OrganType;
  bloodGroup: string;
  donorRelationType: string;
  tissueMatchScore: number;
  ethicsCommitteeStatus: string;
  committeeApprovalDate?: string;
  formSubmissionStatus: string;
  isSyntheticDemonstration: true;
  createdBy?: string;
  createdAt: string;
}

export interface OfficialResource {
  id: string;
  title: string;
  category: 'statutory_act' | 'form' | 'scheme' | 'portal';
  description: string;
  officialUrl: string;
  authorityName: string;
  isActive: boolean;
  createdAt: string;
}

export interface RequestAssignment {
  id: string;
  requestId: string;
  volunteerId: string;
  assignedBy?: string;
  assignedAt: string;
  completionNotes?: string;
  completedAt?: string;
}

export interface HospitalApplication {
  id: string;
  userId: string;
  hospitalName: string;
  registrationNumber: string;
  state: string;
  city: string;
  coordinatorName: string;
  officialEmail: string;
  officialPhone: string;
  accreditation: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}
