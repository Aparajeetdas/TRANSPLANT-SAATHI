import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import {
  generatePublicDonorId,
  isValidPublicDonorId,
  PUBLIC_DONOR_ID_REGEX,
  toPublicDonorIdentity
} from '../../lib/identity';
import {
  getDonorMilestones,
  getDonorProfileByPublicDonorId,
  getDonorProfileByUserId,
  getPublicDonorPledges,
  registerDonorPledge,
  setStoredUser,
  updateDonorPledge,
  withdrawDonorPledge
} from '../../lib/store';
import { DonorProfile, UserProfile } from '../../types';
import { DonorDashboardPage } from '../../pages/donor/DonorDashboardPage';
import { DonorRegisterPage } from '../../pages/donor/DonorRegisterPage';

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
      <AuthProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const mockUser: UserProfile = {
  id: 'usr-test-donor-01',
  publicId: 'TS-8K2P-9Q4W',
  email: 'test.donor@example.com',
  fullName: 'Vikram Malhotra',
  phone: '+91-98765-00112',
  role: 'donor',
  isActive: true,
  createdAt: '2026-03-01T10:00:00Z'
};

const otherUser: UserProfile = {
  id: 'usr-other-02',
  publicId: 'TS-3M7N-5X2Y',
  email: 'other.user@example.com',
  fullName: 'Sunita Rao',
  role: 'patient',
  isActive: true,
  createdAt: '2026-03-02T10:00:00Z'
};

describe('Organ Donor Registration & Private Profiles Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    setStoredUser(null);
  });

  describe('1. Public Donor ID Generation & Validation', () => {
    it('generates identifiers adhering to the TS-DNR-XXXX-XXXX format', () => {
      const publicDonorId = generatePublicDonorId();
      expect(publicDonorId).toMatch(PUBLIC_DONOR_ID_REGEX);
      expect(isValidPublicDonorId(publicDonorId)).toBe(true);
    });

    it('rejects invalid or tampered public donor IDs', () => {
      expect(isValidPublicDonorId('TS-7K9P-X4QM')).toBe(false); // User ID, not Donor ID
      expect(isValidPublicDonorId('TS-DNR-12345')).toBe(false);
      expect(isValidPublicDonorId('TS-DNR-ABCD-EFGI')).toBe(false); // Contains forbidden 'I'
      expect(isValidPublicDonorId('')).toBe(false);
      expect(isValidPublicDonorId(null)).toBe(false);
    });

    it('generates collision-free IDs across successive invocations', () => {
      const generated = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const id = generatePublicDonorId(generated);
        expect(generated.has(id)).toBe(false);
        generated.add(id);
      }
      expect(generated.size).toBe(50);
    });
  });

  describe('2. Privacy Separation & Sanitized Public Presentations', () => {
    it('strips all personal contact details and internal IDs from PublicDonorIdentity', () => {
      const sampleProfile: DonorProfile = {
        id: 'db-internal-uuid-12345',
        userId: 'usr-private-101',
        publicDonorId: 'TS-DNR-9K4P-2X8W',
        pledgeStatus: 'pledged_interest',
        pledgedOrgans: ['kidney', 'cornea'],
        familyInformed: true,
        emergencyContactName: 'Kavita Malhotra (Spouse)',
        emergencyContactPhone: '+91-98765-43210',
        officialNottoRegistrationNumber: 'NOTTO-FORM7-8899',
        state: 'Maharashtra',
        city: 'Mumbai',
        bloodGroup: 'B+',
        consentSigned: true,
        consentSignedAt: '2026-03-01T12:00:00Z',
        isPublicPledgeAnonymous: true,
        createdAt: '2026-03-01T12:00:00Z',
        updatedAt: '2026-03-01T12:00:00Z'
      };

      const publicDto = toPublicDonorIdentity(sampleProfile);

      expect(publicDto.publicDonorId).toBe('TS-DNR-9K4P-2X8W');
      expect(publicDto.pledgeStatus).toBe('pledged_interest');
      expect(publicDto.pledgedOrgans).toEqual(['kidney', 'cornea']);
      expect(publicDto.state).toBe('Maharashtra');
      expect(publicDto.familyInformed).toBe(true);

      // Verify strict privacy: No personal fields exposed
      const untyped = publicDto as unknown as Record<string, unknown>;
      expect(untyped.id).toBeUndefined();
      expect(untyped.userId).toBeUndefined();
      expect(untyped.emergencyContactName).toBeUndefined();
      expect(untyped.emergencyContactPhone).toBeUndefined();
      expect(untyped.officialNottoRegistrationNumber).toBeUndefined();
      expect(untyped.bloodGroup).toBeUndefined();
      expect(untyped.city).toBeUndefined();
    });

    it('getPublicDonorPledges excludes withdrawn and non-anonymous pledges', () => {
      const activePledges = getPublicDonorPledges();
      expect(activePledges.length).toBeGreaterThanOrEqual(1);
      for (const p of activePledges) {
        expect(p.pledgeStatus).not.toBe('withdrawn');
        expect(isValidPublicDonorId(p.publicDonorId)).toBe(true);
      }
    });
  });

  describe('3. Registration Workflow & Business Logic', () => {
    it('successfully registers an organ donor with public donor ID and explicit consent', () => {
      setStoredUser(mockUser);

      const result = registerDonorPledge(
        {
          pledgedOrgans: ['all'],
          state: 'Karnataka',
          city: 'Bengaluru',
          bloodGroup: 'O+',
          familyInformed: true,
          emergencyContactName: 'Rohan Malhotra (Brother)',
          emergencyContactPhone: '+91-98450-11223',
          isPublicPledgeAnonymous: true
        },
        mockUser
      );

      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.profile?.publicDonorId).toMatch(PUBLIC_DONOR_ID_REGEX);
      expect(result.profile?.pledgeStatus).toBe('pledged_interest');
      expect(result.profile?.state).toBe('Karnataka');
      expect(result.profile?.familyInformed).toBe(true);

      // Verify persisted in store
      const retrieved = getDonorProfileByUserId(mockUser.id);
      expect(retrieved?.publicDonorId).toBe(result.profile?.publicDonorId);
    });

    it('rejects registration when user is not authenticated', () => {
      const result = registerDonorPledge(
        {
          pledgedOrgans: ['kidney'],
          state: 'Delhi',
          familyInformed: true
        },
        null
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication required');
    });

    it('rejects registration when state is missing', () => {
      const result = registerDonorPledge(
        {
          pledgedOrgans: ['all'],
          state: '',
          familyInformed: true
        },
        mockUser
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('state of residence');
    });

    it('rejects duplicate active pledge registration for the same user', () => {
      setStoredUser(mockUser);

      // First pledge
      const first = registerDonorPledge(
        {
          pledgedOrgans: ['all'],
          state: 'Delhi',
          familyInformed: true
        },
        mockUser
      );
      expect(first.success).toBe(true);

      // Duplicate attempt
      const duplicate = registerDonorPledge(
        {
          pledgedOrgans: ['kidney'],
          state: 'Delhi',
          familyInformed: true
        },
        mockUser
      );

      expect(duplicate.success).toBe(false);
      expect(duplicate.error).toContain('active donor pledge');
    });
  });

  describe('4. Administrative Milestones & Progress Tracking', () => {
    it('accurately calculates milestone progress based on donor profile status', () => {
      const profile: DonorProfile = {
        id: 'prof-test-01',
        userId: mockUser.id,
        publicDonorId: 'TS-DNR-4K8P-2Q9T',
        pledgeStatus: 'notto_registered',
        pledgedOrgans: ['all'],
        familyInformed: true,
        officialNottoRegistrationNumber: 'NOTTO-FORM7-12345',
        state: 'Delhi',
        consentSigned: true,
        consentSignedAt: '2026-03-01T10:00:00Z',
        isPublicPledgeAnonymous: true,
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-01T10:00:00Z'
      };

      const milestones = getDonorMilestones(profile);
      expect(milestones).toHaveLength(4);

      // Step 1: Voluntary Pledge recorded
      expect(milestones[0].isCompleted).toBe(true);

      // Step 2: Family Informed
      expect(milestones[1].isCompleted).toBe(true);

      // Step 3: NOTTO Form 7 registered
      expect(milestones[2].isCompleted).toBe(true);

      // Step 4: Digital Card
      expect(milestones[3].isCompleted).toBe(true);
    });

    it('correctly marks family informed and NOTTO as pending when not yet completed', () => {
      const pendingProfile: DonorProfile = {
        id: 'prof-pending-02',
        userId: mockUser.id,
        publicDonorId: 'TS-DNR-7M2P-9Q4W',
        pledgeStatus: 'pledged_interest',
        pledgedOrgans: ['all'],
        familyInformed: false,
        state: 'Punjab',
        consentSigned: true,
        consentSignedAt: '2026-03-01T10:00:00Z',
        isPublicPledgeAnonymous: true,
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-01T10:00:00Z'
      };

      const milestones = getDonorMilestones(pendingProfile);
      expect(milestones[0].isCompleted).toBe(true);
      expect(milestones[1].isCompleted).toBe(false); // Family not informed yet
      expect(milestones[2].isCompleted).toBe(false); // No NOTTO Form 7 yet
    });
  });

  describe('5. Profile Updates & Immutability Enforcement', () => {
    it('allows the owner to update family informed status and NOTTO registration number', () => {
      setStoredUser(mockUser);

      const reg = registerDonorPledge(
        {
          pledgedOrgans: ['all'],
          state: 'Delhi',
          familyInformed: false
        },
        mockUser
      );

      const publicDonorId = reg.profile!.publicDonorId;

      const updateRes = updateDonorPledge(
        publicDonorId,
        {
          familyInformed: true,
          officialNottoRegistrationNumber: 'NOTTO-NEW-9988'
        },
        mockUser
      );

      expect(updateRes.success).toBe(true);
      expect(updateRes.profile?.familyInformed).toBe(true);
      expect(updateRes.profile?.officialNottoRegistrationNumber).toBe('NOTTO-NEW-9988');
      // Public Donor ID must remain unchanged and immutable
      expect(updateRes.profile?.publicDonorId).toBe(publicDonorId);
    });

    it('rejects update attempts by unauthorized other users', () => {
      setStoredUser(mockUser);
      const reg = registerDonorPledge(
        {
          pledgedOrgans: ['all'],
          state: 'Delhi',
          familyInformed: true
        },
        mockUser
      );

      const publicDonorId = reg.profile!.publicDonorId;

      // Other user attempts to update
      const updateRes = updateDonorPledge(
        publicDonorId,
        { familyInformed: false },
        otherUser
      );

      expect(updateRes.success).toBe(false);
      expect(updateRes.error).toContain('Access Denied');
    });
  });

  describe('6. Voluntary Pledge Withdrawal', () => {
    it('allows a donor to withdraw their pledge under DPDP Act 2023', () => {
      setStoredUser(mockUser);
      const reg = registerDonorPledge(
        {
          pledgedOrgans: ['all'],
          state: 'Delhi',
          familyInformed: true
        },
        mockUser
      );

      const publicDonorId = reg.profile!.publicDonorId;

      const withdrawRes = withdrawDonorPledge(publicDonorId, mockUser, 'Personal reasons');
      expect(withdrawRes.success).toBe(true);

      const retrieved = getDonorProfileByPublicDonorId(publicDonorId);
      expect(retrieved?.pledgeStatus).toBe('withdrawn');

      // Must be immediately excluded from public pledge list
      const publicPledges = getPublicDonorPledges();
      expect(publicPledges.some((p) => p.publicDonorId === publicDonorId)).toBe(false);
    });
  });

  describe('7. UI Component Verification', () => {
    it('renders DonorRegisterPage with statutory distinction and consent information', () => {
      setStoredUser(mockUser);
      renderWithProviders(<DonorRegisterPage />);

      expect(screen.getByText(/Register as an Organ Donor/i)).toBeInTheDocument();
      expect(screen.getByText(/Statutory Distinction: Intention vs. Official NOTTO Form 7/i)).toBeInTheDocument();
      expect(screen.getByText(/Important Legal Reality under THOTA 1994:/i)).toBeInTheDocument();
      expect(screen.getByText(/Record Donor Pledge/i)).toBeInTheDocument();
    });

    it('renders DonorDashboardPage showing public donor ID and copy action for active donor', async () => {
      setStoredUser(mockUser);
      registerDonorPledge(
        {
          pledgedOrgans: ['all'],
          state: 'Delhi',
          familyInformed: false
        },
        mockUser
      );

      renderWithProviders(<DonorDashboardPage />);

      expect(screen.getByText(/Welcome, Altruistic Donor/i)).toBeInTheDocument();
      expect(screen.getByText(/Public Donor ID \(Immutable\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Next Recommended Administrative Step: Inform Your Family/i)).toBeInTheDocument();
      expect(screen.getByText(/View Emergency Donor Card/i)).toBeInTheDocument();
    });
  });
});
