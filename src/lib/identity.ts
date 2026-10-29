import {
  AssistanceRequest,
  DonorProfile,
  OrganType,
  PublicDonorIdentity,
  PublicUserIdentity,
  SanitizedAssistanceRequest,
  UserProfile
} from '../types';

/**
 * Unambiguous 32-character base32 alphabet avoiding visually confusing characters:
 * Omits: 0 (zero), O (capital O), 1 (one), I (capital i), L (lowercase L).
 */
export const PUBLIC_ID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const PUBLIC_ID_PREFIX = 'TS';
export const PUBLIC_DONOR_ID_PREFIX = 'TS-DNR';
export const PUBLIC_ID_REGEX = /^TS-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;
export const PUBLIC_DONOR_ID_REGEX = /^TS-DNR-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;

/**
 * Generates a unique, cryptographically random, permanent public identifier.
 * Format: TS-XXXX-XXXX (e.g. TS-7K9P-X4QM).
 *
 * @param existingIds Optional set or array of existing public IDs for database-level collision prevention.
 * @returns A unique, permanent, pseudonymous public identifier.
 */
export function generatePublicUserId(existingIds?: Set<string> | string[]): string {
  const existingSet = existingIds instanceof Set ? existingIds : new Set(existingIds || []);
  const maxAttempts = 25;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const bytes = new Uint8Array(8);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      // Fallback for non-browser or test environments
      for (let i = 0; i < 8; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += PUBLIC_ID_ALPHABET[bytes[i] % PUBLIC_ID_ALPHABET.length];
    }
    for (let i = 4; i < 8; i++) {
      p2 += PUBLIC_ID_ALPHABET[bytes[i] % PUBLIC_ID_ALPHABET.length];
    }

    const candidate = `${PUBLIC_ID_PREFIX}-${p1}-${p2}`;

    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Fallback in astronomical collision scenario
  const timestampSalt = (Date.now() % 10000).toString().padStart(4, '0');
  return `${PUBLIC_ID_PREFIX}-${timestampSalt}-${PUBLIC_ID_ALPHABET[Math.floor(Math.random() * 32)]}99`;
}

/**
 * Generates a unique, cryptographically random, permanent public donor identifier.
 * Format: TS-DNR-XXXX-XXXX (e.g. TS-DNR-7K9P-X4QM).
 *
 * @param existingIds Optional set or array of existing public donor IDs for collision prevention.
 * @returns A unique, permanent, pseudonymous public donor identifier.
 */
export function generatePublicDonorId(existingIds?: Set<string> | string[]): string {
  const existingSet = existingIds instanceof Set ? existingIds : new Set(existingIds || []);
  const maxAttempts = 25;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const bytes = new Uint8Array(8);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 8; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += PUBLIC_ID_ALPHABET[bytes[i] % PUBLIC_ID_ALPHABET.length];
    }
    for (let i = 4; i < 8; i++) {
      p2 += PUBLIC_ID_ALPHABET[bytes[i] % PUBLIC_ID_ALPHABET.length];
    }

    const candidate = `${PUBLIC_DONOR_ID_PREFIX}-${p1}-${p2}`;

    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  const timestampSalt = (Date.now() % 10000).toString().padStart(4, '0');
  return `${PUBLIC_DONOR_ID_PREFIX}-${timestampSalt}-${PUBLIC_ID_ALPHABET[Math.floor(Math.random() * 32)]}99`;
}

/**
 * Validates whether a candidate string complies with the permanent public ID format.
 */
export function isValidPublicUserId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return PUBLIC_ID_REGEX.test(id.trim());
}

/**
 * Validates whether a candidate string complies with the permanent public donor ID format.
 */
export function isValidPublicDonorId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return PUBLIC_DONOR_ID_REGEX.test(id.trim());
}

/**
 * Strips all personal, private, and internal fields from a Donor Profile.
 * Returns only explicitly approved, non-identifying public donor fields.
 */
export function toPublicDonorIdentity(donor: DonorProfile): PublicDonorIdentity {
  return {
    publicDonorId: donor.publicDonorId,
    pledgeStatus: donor.pledgeStatus,
    pledgedOrgans: donor.pledgedOrgans,
    state: donor.state,
    pledgeDate: donor.createdAt,
    familyInformed: donor.familyInformed
  };
}

/**
 * Strips all personal, private, and internal account fields.
 * Returns only explicitly approved, non-identifying public identity fields.
 */
export function toPublicUserIdentity(
  profile: UserProfile,
  extra?: { organCategory?: OrganType; state?: string }
): PublicUserIdentity {
  const safePublicId = profile.publicId || generatePublicUserId();

  return {
    publicId: safePublicId,
    role: profile.role,
    avatarSeed: safePublicId.replace(/[^A-Z0-9]/g, '').slice(0, 4),
    organCategory: extra?.organCategory,
    state: extra?.state,
    isActive: profile.isActive,
    createdAt: profile.createdAt
  };
}

/**
 * Safely masks a telephone number for pseudonymous presentation.
 * Example: "+91-98765-43210" -> "+91-98***-***10"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone || phone.trim().length < 4) return 'Protected Phone';
  const clean = phone.trim();
  if (clean.length <= 6) return '******';
  const start = clean.slice(0, 4);
  const end = clean.slice(-2);
  return `${start}****${end}`;
}

/**
 * Safely masks an email address for privacy-safe presentation.
 * Example: "patient.sharma@example.com" -> "p***a@example.com"
 */
export function maskEmailAddress(email?: string | null): string {
  if (!email || !email.includes('@')) return 'Protected Email';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `*@${domain}`;
  const first = user[0];
  const last = user[user.length - 1];
  return `${first}***${last}@${domain}`;
}

/**
 * Enforces default-deny privacy rules for Assistance Requests.
 * Only the patient themselves, their assigned volunteer, authorized hospital staff,
 * or platform administrators may view real contact details and real names.
 * All other viewers receive pseudonymous representation with Public ID.
 */
export function sanitizeAssistanceRequest(
  req: AssistanceRequest,
  viewer: UserProfile | null
): SanitizedAssistanceRequest {
  const safePublicId = req.patientPublicId || `TS-PAT-${req.id.slice(-4).toUpperCase()}`;

  const isOwner = Boolean(
    viewer &&
      (viewer.id === req.patientId ||
        (viewer.publicId && req.patientPublicId && viewer.publicId === req.patientPublicId) ||
        (viewer.role === 'patient' && req.patientId === 'demo-patient'))
  );

  const isAssignedVolunteer = Boolean(
    viewer &&
      viewer.role === 'volunteer' &&
      viewer.id === req.assignedVolunteerId
  );

  const isInstitutionalAuthorized = Boolean(
    viewer &&
      (viewer.role === 'admin' || viewer.role === 'hospital_staff')
  );

  const isAuthorizedViewer = isOwner || isAssignedVolunteer || isInstitutionalAuthorized;

  return {
    id: req.id,
    patientPublicId: safePublicId,
    patientDisplayName: isAuthorizedViewer
      ? req.patientName
      : `Patient (${safePublicId})`,
    contactPhoneMasked: isAuthorizedViewer
      ? req.contactPhone
      : 'Confidential (Protected under DPDP Act 2023)',
    organCategory: req.organCategory,
    hospitalName: req.hospitalName,
    supportType: req.supportType,
    notes: req.notes,
    status: req.status,
    assignedVolunteerId: req.assignedVolunteerId,
    assignedVolunteerName: req.assignedVolunteerName,
    coordinatorNotes: req.coordinatorNotes,
    assignedAt: req.assignedAt,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
    isAuthorizedViewer
  };
}
