import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import {
  generatePublicUserId,
  isValidPublicUserId,
  maskEmailAddress,
  maskPhoneNumber,
  PUBLIC_ID_REGEX,
  sanitizeAssistanceRequest,
  toPublicUserIdentity
} from '../../lib/identity';
import { DEMO_PROFILES } from '../../lib/mockData';
import {
  getPublicUserIdentity,
  getSanitizedAssistanceRequests,
  getUserProfileSecure,
  setStoredUser,
  updateUserProfile
} from '../../lib/store';
import { AssistanceRequest, UserProfile } from '../../types';
import { AnonymousIdentityCard } from './AnonymousIdentityCard';
import { PublicUserBadge } from './PublicUserBadge';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('Privacy-First Anonymous User Identity System Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    setStoredUser(null);
  });

  describe('1. Cryptographic Public User ID Generation & Unambiguous Formatting', () => {
    it('generates identifiers adhering to the TS-XXXX-XXXX format', () => {
      const publicId = generatePublicUserId();
      expect(publicId).toMatch(PUBLIC_ID_REGEX);
      expect(isValidPublicUserId(publicId)).toBe(true);
    });

    it('rejects invalid, sequential, or tampered public IDs', () => {
      expect(isValidPublicUserId('12345')).toBe(false);
      expect(isValidPublicUserId('usr-101')).toBe(false);
      expect(isValidPublicUserId('rajesh@example.com')).toBe(false);
      expect(isValidPublicUserId('TS-0000-1111')).toBe(false); // 0 and 1 are excluded from unambiguous alphabet
      expect(isValidPublicUserId('TS-IIII-OOOO')).toBe(false); // I and O are excluded
      expect(isValidPublicUserId(null)).toBe(false);
      expect(isValidPublicUserId(undefined)).toBe(false);
    });

    it('guarantees statistical uniqueness across 100 consecutive generations with zero collisions', () => {
      const generatedIds = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const id = generatePublicUserId(generatedIds);
        expect(generatedIds.has(id)).toBe(false);
        expect(id).toMatch(PUBLIC_ID_REGEX);
        generatedIds.add(id);
      }
      expect(generatedIds.size).toBe(100);
    });

    it('handles simulated collision by regenerating safely until a unique ID is obtained', () => {
      const existingIds = new Set(['TS-7K9P-X4QM', 'TS-3B8R-N2WV', 'TS-9M4L-H6TD']);
      const newId = generatePublicUserId(existingIds);
      expect(existingIds.has(newId)).toBe(false);
      expect(isValidPublicUserId(newId)).toBe(true);
    });
  });

  describe('2. Public ID Immutability & Anti-Tampering Enforcement', () => {
    it('rejects attempts by users to alter or tamper with their permanent publicId', () => {
      const patient: UserProfile = {
        ...DEMO_PROFILES[0],
        publicId: 'TS-7K9P-X4QM'
      };

      const tamperingAttempt = updateUserProfile(
        patient.id,
        { publicId: 'TS-FAKE-9999' },
        patient
      );

      expect(tamperingAttempt.success).toBe(false);
      expect(tamperingAttempt.error).toContain('permanent and immutable');
    });

    it('preserves the original immutable publicId during legitimate profile updates', () => {
      const patient: UserProfile = {
        ...DEMO_PROFILES[0],
        publicId: 'TS-7K9P-X4QM'
      };

      const legitimateUpdate = updateUserProfile(
        patient.id,
        { phone: '+91-99999-88888' },
        patient
      );

      expect(legitimateUpdate.success).toBe(true);
      expect(legitimateUpdate.profile?.publicId).toBe('TS-7K9P-X4QM');
      expect(legitimateUpdate.profile?.phone).toBe('+91-99999-88888');
    });
  });

  describe('3. Default-Deny Privacy Rules & User Profile Isolation', () => {
    const userA = DEMO_PROFILES[0]; // Patient Rajesh (demo-patient)
    const userB = DEMO_PROFILES[1]; // Family Caregiver Ananya (demo-family)
    const adminUser = DEMO_PROFILES[4]; // Platform Admin Siddharth (demo-admin)
    const hospitalStaff = DEMO_PROFILES[3]; // Hospital Coordinator Dr. Priya (demo-hospital-staff)
    const volunteerUser = DEMO_PROFILES[2]; // Volunteer Arun (demo-volunteer)

    it('prevents User A from retrieving User B’s private profile', () => {
      const crossAccessResult = getUserProfileSecure(userB.id, userA);
      expect(crossAccessResult.profile).toBeUndefined();
      expect(crossAccessResult.error).toContain('Access Denied');
    });

    it('rejects unauthenticated attempts to retrieve private user profiles', () => {
      const anonAccessResult = getUserProfileSecure(userA.id, null);
      expect(anonAccessResult.profile).toBeUndefined();
      expect(anonAccessResult.error).toContain('Authentication required');
    });

    it('prevents volunteers from retrieving private profile rows of unassigned patients', () => {
      const volunteerAccessResult = getUserProfileSecure(userA.id, volunteerUser);
      expect(volunteerAccessResult.profile).toBeUndefined();
      expect(volunteerAccessResult.error).toContain('Access Denied');
    });

    it('allows users to retrieve and inspect their own profile', () => {
      const ownAccessResult = getUserProfileSecure(userA.id, userA);
      expect(ownAccessResult.profile).toBeDefined();
      expect(ownAccessResult.profile?.id).toBe(userA.id);
      expect(ownAccessResult.profile?.publicId).toBe('TS-7K9P-X4QM');
    });

    it('allows platform administrators supervisory audit access to user profiles', () => {
      const adminAccessResult = getUserProfileSecure(userA.id, adminUser);
      expect(adminAccessResult.profile).toBeDefined();
      expect(adminAccessResult.profile?.fullName).toBe(userA.fullName);
    });

    it('allows authorized hospital coordinator access within legitimate clinical workflow and audits action', () => {
      const staffAccessResult = getUserProfileSecure(userA.id, hospitalStaff);
      expect(staffAccessResult.profile).toBeDefined();
      expect(staffAccessResult.profile?.publicId).toBe('TS-7K9P-X4QM');
    });
  });

  describe('4. Data Transfer Object (DTO) Sanitization & Zero-Leakage Guarantees', () => {
    it('toPublicUserIdentity strips all identifying personal fields and internal UUIDs', () => {
      const sensitiveProfile: UserProfile = {
        id: 'usr-uuid-secret-999',
        publicId: 'TS-7K9P-X4QM',
        fullName: 'Rajesh Sharma',
        email: 'patient.sharma@example.com',
        phone: '+91-98765-43210',
        role: 'patient',
        isActive: true,
        createdAt: '2026-01-15T08:00:00Z'
      };

      const publicDto = toPublicUserIdentity(sensitiveProfile, {
        organCategory: 'kidney',
        state: 'Delhi'
      });

      // Public DTO must expose only non-identifying fields
      expect(publicDto.publicId).toBe('TS-7K9P-X4QM');
      expect(publicDto.role).toBe('patient');
      expect(publicDto.organCategory).toBe('kidney');
      expect(publicDto.state).toBe('Delhi');

      // Zero-leakage verification: must NOT contain private identifiers
      const rawDto = publicDto as unknown as Record<string, unknown>;
      expect(rawDto.id).toBeUndefined();
      expect(rawDto.fullName).toBeUndefined();
      expect(rawDto.email).toBeUndefined();
      expect(rawDto.phone).toBeUndefined();
    });

    it('getPublicUserIdentity returns only safe public record by publicId', () => {
      const publicRecord = getPublicUserIdentity('TS-7K9P-X4QM');
      expect(publicRecord).not.toBeNull();
      expect(publicRecord?.publicId).toBe('TS-7K9P-X4QM');
      expect(publicRecord?.role).toBe('patient');

      const raw = publicRecord as unknown as Record<string, unknown>;
      expect(raw.fullName).toBeUndefined();
      expect(raw.email).toBeUndefined();
      expect(raw.phone).toBeUndefined();
    });

    it('maskPhoneNumber and maskEmailAddress safely obfuscate contact information', () => {
      expect(maskPhoneNumber('+91-98765-43210')).toBe('+91-****10');
      expect(maskEmailAddress('patient.sharma@example.com')).toBe('p***a@example.com');
    });
  });

  describe('5. Assistance Request Sanitization & Role-Based Masking', () => {
    const rawRequest: AssistanceRequest = {
      id: 'req-101',
      patientId: 'demo-patient',
      patientPublicId: 'TS-7K9P-X4QM',
      patientName: 'Rajesh Sharma',
      contactPhone: '+91-98765-43210',
      organCategory: 'kidney',
      hospitalName: 'AIIMS New Delhi',
      supportType: 'Paperwork (Form 1/2/3)',
      notes: 'Need affidavit guidance',
      status: 'assigned',
      assignedVolunteerId: 'demo-volunteer',
      assignedVolunteerName: 'Arun Varma',
      createdAt: '2026-03-24T10:00:00Z',
      updatedAt: '2026-03-25T12:00:00Z'
    };

    const patientOwner = DEMO_PROFILES[0];
    const assignedVolunteer = DEMO_PROFILES[2];
    const unassignedVolunteer: UserProfile = {
      ...DEMO_PROFILES[2],
      id: 'vol-unassigned-88'
    };
    const thirdPartyUser = DEMO_PROFILES[1];

    it('masks patient name and contact phone for third-party ordinary users', () => {
      const sanitized = sanitizeAssistanceRequest(rawRequest, thirdPartyUser);
      expect(sanitized.isAuthorizedViewer).toBe(false);
      expect(sanitized.patientDisplayName).toBe('Patient (TS-7K9P-X4QM)');
      expect(sanitized.contactPhoneMasked).toContain('Confidential');
      expect(sanitized.patientPublicId).toBe('TS-7K9P-X4QM');
    });

    it('masks patient name and contact phone for unassigned volunteers', () => {
      const sanitized = sanitizeAssistanceRequest(rawRequest, unassignedVolunteer);
      expect(sanitized.isAuthorizedViewer).toBe(false);
      expect(sanitized.patientDisplayName).toBe('Patient (TS-7K9P-X4QM)');
      expect(sanitized.contactPhoneMasked).toContain('Confidential');
    });

    it('reveals contact details to the verified patient owner', () => {
      const sanitized = sanitizeAssistanceRequest(rawRequest, patientOwner);
      expect(sanitized.isAuthorizedViewer).toBe(true);
      expect(sanitized.patientDisplayName).toBe('Rajesh Sharma');
      expect(sanitized.contactPhoneMasked).toBe('+91-98765-43210');
    });

    it('reveals contact details to the assigned volunteer navigator', () => {
      const sanitized = sanitizeAssistanceRequest(rawRequest, assignedVolunteer);
      expect(sanitized.isAuthorizedViewer).toBe(true);
      expect(sanitized.patientDisplayName).toBe('Rajesh Sharma');
      expect(sanitized.contactPhoneMasked).toBe('+91-98765-43210');
    });

    it('getSanitizedAssistanceRequests sanitizes all requests for anonymous or ordinary viewers', () => {
      const sanitizedList = getSanitizedAssistanceRequests(null);
      for (const item of sanitizedList) {
        expect(item.isAuthorizedViewer).toBe(false);
        expect(item.contactPhoneMasked).toContain('Confidential');
        expect(item.patientDisplayName).toMatch(/^Patient \(TS-/);
      }
    });
  });

  describe('6. Anonymous User Interface & Interaction Components', () => {
    it('renders the AnonymousIdentityCard with Public ID, Copy action, and Privacy status', async () => {
      const mockUser = {
        ...DEMO_PROFILES[0],
        publicId: 'TS-7K9P-X4QM'
      };
      setStoredUser(mockUser);

      // Mock navigator.clipboard
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      });

      renderWithProviders(<AnonymousIdentityCard />);

      // Verify Public ID is rendered
      expect(screen.getAllByText('TS-7K9P-X4QM').length).toBeGreaterThanOrEqual(1);

      // Verify Privacy Status Indicators
      expect(screen.getByText(/Pseudonymous & Protected/i)).toBeInTheDocument();
      expect(screen.getByText(/Real identity hidden from public & peers/i)).toBeInTheDocument();
      expect(screen.getByText(/How Your Privacy Is Protected on Transplant Saathi/i)).toBeInTheDocument();

      // Test Copy ID action
      const copyBtn = screen.getByRole('button', { name: /Copy Public Identifier/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
      expect(writeTextMock).toHaveBeenCalledWith('TS-7K9P-X4QM');
    });

    it('renders PublicUserBadge showing only pseudonymous ID and zero personal information', () => {
      render(
        <PublicUserBadge
          publicId="TS-3B8R-N2WV"
          role="patient"
          organCategory="kidney"
        />
      );

      expect(screen.getByText('TS-3B8R-N2WV')).toBeInTheDocument();
      expect(screen.getByText(/Pseudonymous/i)).toBeInTheDocument();
      expect(screen.getByText(/KIDNEY/i)).toBeInTheDocument();

      // Verify no real personal info is present
      expect(screen.queryByText(/Rajesh/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Sharma/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/@/i)).not.toBeInTheDocument();
    });

    it('enforces that Public ID field is disabled and immutable in contact edit form', () => {
      setStoredUser(DEMO_PROFILES[0]);
      renderWithProviders(<AnonymousIdentityCard />);

      const editBtn = screen.getByRole('button', { name: /Edit Contact Settings/i });
      fireEvent.click(editBtn);

      // The publicId input must be disabled
      const publicIdInput = screen.getByTitle(/Permanent identifier cannot be changed/i) as HTMLInputElement;
      expect(publicIdInput).toBeDisabled();
      expect(publicIdInput.value).toBe('TS-7K9P-X4QM');

      // The phone input is editable
      const phoneInput = screen.getByPlaceholderText('+91-98765-43210') as HTMLInputElement;
      expect(phoneInput).not.toBeDisabled();
    });
  });
});
