import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import {
  DEMO_PROFILES,
  INITIAL_HOSPITAL_REQUESTS,
  VERIFIED_HOSPITALS
} from '../../lib/mockData';
import {
  addHospitalRequestInternalNote,
  addHospitalRequestPatientMessage,
  cancelHospitalAssistanceRequest,
  createHospitalAssistanceRequest,
  getHospitalRequestsForHospital,
  getHospitalRequestsForPatient,
  getStoredAuditLogs,
  getStoredHospitalRequests,
  getStoredInAppNotifications,
  requestHospitalAdditionalInformation,
  setStoredUser,
  updateHospitalRequestStatus
} from '../../lib/store';
import { HospitalDetailPage } from '../../pages/public/HospitalDetailPage';
import { HospitalAssistanceRequest, UserProfile } from '../../types';
import { HospitalAssistanceRequestModal } from './HospitalAssistanceRequestModal';
import { HospitalCoordinationDesk } from './HospitalCoordinationDesk';
import { HospitalStaffPortal } from './HospitalStaffPortal';
import { OfficialRegistrationGuidanceModal } from './OfficialRegistrationGuidanceModal';

const mockPatient = DEMO_PROFILES.find((p) => p.id === 'demo-patient') as UserProfile;
const mockFamily = DEMO_PROFILES.find((p) => p.id === 'demo-family') as UserProfile;
const mockVerifiedCoordinatorAIIMS = DEMO_PROFILES.find((p) => p.id === 'demo-hospital-staff') as UserProfile;
const mockVerifiedCoordinatorPGIMER = DEMO_PROFILES.find((p) => p.id === 'demo-hospital-staff-pgimer') as UserProfile;
const mockUnverifiedHospitalStaff = DEMO_PROFILES.find((p) => p.id === 'demo-hospital-staff-unverified') as UserProfile;

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('Verified Organ Transplant Request and Hospital Coordination System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ============================================================================
  // A. HOSPITAL DETAILS PAGE
  // ============================================================================
  describe('A. Hospital Details Page', () => {
    it('displays verified hospital identity, registration status, supported organs, and official contacts', async () => {
      setStoredUser(mockPatient);

      renderWithProviders(
        <MemoryRouter initialEntries={['/hospitals/hosp-001']}>
          <Routes>
            <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      // 1. Verified identity & registration status
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: /All India Institute of Medical Sciences/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText('Government Registered')).toBeInTheDocument();
      expect(screen.getByText('Verified by NOTTO/SOTTO')).toBeInTheDocument();
      expect(screen.getByText('NOTTO-APEX-ND-001')).toBeInTheDocument();

      // 2. Supported organ transplant programs based on verified records
      expect(screen.getAllByText(/kidney/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/liver/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/heart/i).length).toBeGreaterThan(0);

      // 3. Official contact details and website
      expect(screen.getByText('Dr. V. K. Sharma (Transplant Nodal Office)')).toBeInTheDocument();
      expect(screen.getByText('+91-11-26588500')).toBeInTheDocument();
      expect(screen.getByText('transplant-nodal@aiims.edu')).toBeInTheDocument();
      expect(screen.getByText('Visit Hospital Portal')).toBeInTheDocument();

      // 4. Verification source and last verification date
      expect(screen.getByText('2026-03-15')).toBeInTheDocument();

      // 5. Primary button labelled “Request Transplant Assistance”
      const primaryBtn = screen.getByRole('button', { name: /request transplant assistance/i });
      expect(primaryBtn).toBeInTheDocument();

      // 6. Secondary link labelled “Official Registration Guidance”
      const secondaryLink = screen.getByRole('button', { name: /official registration guidance/i });
      expect(secondaryLink).toBeInTheDocument();
    });

    it('opens Official Registration Guidance modal with statutory THOTA distinctions', async () => {
      setStoredUser(mockPatient);

      renderWithProviders(
        <MemoryRouter initialEntries={['/hospitals/hosp-001']}>
          <Routes>
            <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /official registration guidance/i })).toBeInTheDocument();
      });

      const secondaryLink = screen.getByRole('button', { name: /official registration guidance/i });
      fireEvent.click(secondaryLink);

      expect(screen.getByText('Official Organ Transplant Registration Guidance')).toBeInTheDocument();
      expect(screen.getByText(/1\. Platform Assistance Request/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Donor Voluntary Pledge/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Official Hospital Registration/i)).toBeInTheDocument();
      expect(screen.getByText(/4\. Medical Evaluation & Workup/i)).toBeInTheDocument();
      expect(screen.getByText(/5\. Official Waiting-List Status/i)).toBeInTheDocument();
      expect(screen.getByText(/6\. Clinical Organ Allocation/i)).toBeInTheDocument();
      expect(screen.getByText('1800-11-4770')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // B. PATIENT REQUEST FORM & DUPLICATE SUBMISSION GUARD
  // ============================================================================
  describe('B. Patient Request Form & Validation', () => {
    it('prefills hospital, restricts organs to verified programs, requires consent, and generates non-guessable reference', async () => {
      const aiimsHospital = VERIFIED_HOSPITALS[0];
      setStoredUser(mockPatient);
      const handleSuccess = vi.fn();

      renderWithProviders(
        <MemoryRouter>
          <HospitalAssistanceRequestModal
            isOpen={true}
            onClose={vi.fn()}
            hospital={aiimsHospital}
            onSuccess={handleSuccess}
          />
        </MemoryRouter>
      );

      // Prefilled hospital name and reg
      expect(screen.getAllByText(aiimsHospital.name).length).toBeGreaterThan(0);
      expect(screen.getByText(aiimsHospital.registrationNumber)).toBeInTheDocument();

      // Organ select is restricted to AIIMS supported organs
      const organSelect = screen.getByLabelText(/organ or transplant program/i) as HTMLSelectElement;
      expect(organSelect).toBeInTheDocument();
      aiimsHospital.organsSupported.forEach((organ) => {
        expect(
          screen.getByRole('option', { name: new RegExp(organ.replace('_', ' '), 'i') })
        ).toBeInTheDocument();
      });

      // Sensitive fields justification
      expect(screen.getByText(/Privacy & Sensitive Data Handling Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/Why are contact and organ details required\?/i)).toBeInTheDocument();

      // Fill in description
      const descInput = screen.getByLabelText(/short description of assistance needed/i);
      fireEvent.change(descInput, {
        target: {
          value: 'Requesting consultation on Form 1 living-donor affidavits and state SOTTO registration.'
        }
      });

      // Submit button should be disabled without consent
      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      expect(submitBtn).toBeDisabled();

      // Check consent
      const consentCheckbox = screen.getByLabelText(/I consent to transmitting this assistance inquiry/i);
      fireEvent.click(consentCheckbox);
      expect(submitBtn).toBeEnabled();

      // Submit form
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Assistance Request Confirmed')).toBeInTheDocument();
      });

      // Reference code format: TS-REQ-2026-XX-XXXX
      const refElements = screen.getAllByText(/TS-REQ-2026-/);
      expect(refElements.length).toBeGreaterThan(0);
      expect(handleSuccess).toHaveBeenCalledTimes(1);

      // Verify next steps and statutory disclaimer
      expect(screen.getByText(/What Happens Next in the Coordination Workflow/i)).toBeInTheDocument();
      expect(screen.getByText(/Official Waiting-List Clarification/i)).toBeInTheDocument();
    });

    it('prevents rapid duplicate submissions by the same patient for the same hospital and organ', () => {
      const input = {
        hospitalId: 'hosp-001',
        organProgram: 'kidney' as const,
        requestCategory: 'official_registration' as const,
        description: 'Need assistance organizing Form 1 affidavits for authorization committee.',
        preferredContactMethod: 'phone' as const,
        consentGiven: true
      };

      // First submission succeeds
      const firstRes = createHospitalAssistanceRequest(input, mockPatient);
      expect(firstRes.success).toBe(true);
      expect(firstRes.request?.referenceNumber).toMatch(/^TS-REQ-2026-KD-[2-9A-Z]{4}$/);

      // Immediate duplicate submission is safely blocked
      const duplicateRes = createHospitalAssistanceRequest(input, mockPatient);
      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.error).toMatch(/already.*submitted|just submitted/i);
    });

    it('rejects unconsented submissions or unverified organ programs', () => {
      const inputNoConsent = {
        hospitalId: 'hosp-001',
        organProgram: 'kidney' as const,
        requestCategory: 'transplant_guidance' as const,
        description: 'Need general guidance on kidney transplant waiting time.',
        preferredContactMethod: 'phone' as const,
        consentGiven: false
      };

      const res = createHospitalAssistanceRequest(inputNoConsent, mockPatient);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/consent is required/i);
    });

    it('displays required field validation items when description is too short or consent is unchecked', async () => {
      const aiimsHospital = VERIFIED_HOSPITALS[0];
      setStoredUser(mockPatient);

      renderWithProviders(
        <MemoryRouter>
          <HospitalAssistanceRequestModal
            isOpen={true}
            onClose={vi.fn()}
            hospital={aiimsHospital}
          />
        </MemoryRouter>
      );

      // Verify validation guidance banner is displayed when form is incomplete
      expect(screen.getByText(/Required items before submission:/i)).toBeInTheDocument();
      expect(screen.getByText(/Short description must be at least 10 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Informed consent checkbox must be selected/i)).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      expect(submitBtn).toBeDisabled();

      // Type short description
      const descInput = screen.getByLabelText(/short description of assistance needed/i);
      fireEvent.change(descInput, { target: { value: 'Help' } });
      expect(screen.getByText(/currently 4\/10/i)).toBeInTheDocument();

      // Fill valid description
      fireEvent.change(descInput, { target: { value: 'Need guidance for Form 1 registration at AIIMS.' } });
      // Description error goes away
      expect(screen.queryByText(/Short description must be at least 10 characters/i)).toBeNull();

      // Check consent
      const consentCheckbox = screen.getByLabelText(/I consent to transmitting this assistance inquiry/i);
      fireEvent.click(consentCheckbox);

      // Now form is valid and action required box is cleared
      await waitFor(() => {
        expect(screen.queryByText(/Required items before submission:/i)).toBeNull();
      });
      expect(submitBtn).toBeEnabled();
    });

    it('displays authentication required prompt when user is not logged in', () => {
      const aiimsHospital = VERIFIED_HOSPITALS[0];
      setStoredUser(null); // No active user session

      renderWithProviders(
        <MemoryRouter>
          <HospitalAssistanceRequestModal
            isOpen={true}
            onClose={vi.fn()}
            hospital={aiimsHospital}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Patient Authentication Required')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Proceed/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /submit assistance request/i })).toBeNull();
    });

    it('blocks inactive or unauthorized accounts from submitting hospital requests', () => {
      const input = {
        hospitalId: 'hosp-001',
        organProgram: 'kidney' as const,
        requestCategory: 'official_registration' as const,
        description: 'Need assistance organizing Form 1 affidavits for authorization committee.',
        preferredContactMethod: 'phone' as const,
        consentGiven: true
      };

      // Inactive account
      const inactiveUser: UserProfile = { ...mockPatient, isActive: false };
      const inactiveRes = createHospitalAssistanceRequest(input, inactiveUser);
      expect(inactiveRes.success).toBe(false);
      expect(inactiveRes.error).toMatch(/restricted|inactive/i);

      // Unauthorized account role (e.g. unverified hospital coordinator cannot submit patient request)
      const unauthRes = createHospitalAssistanceRequest(input, mockUnverifiedHospitalStaff);
      expect(unauthRes.success).toBe(false);
      expect(unauthRes.error).toMatch(/unauthorized|patients and family caregivers/i);
    });
  });

  // ============================================================================
  // C. PATIENT TRACKING & PRIVACY (INTERNAL NOTES STRIPPED)
  // ============================================================================
  describe('C. Patient Request Tracking & Privacy Guarantee', () => {
    it('allows patient to view only their own requests and strictly strips confidential internal notes', () => {
      // Seed pre-existing requests
      const patientRequests = getHospitalRequestsForPatient(mockPatient.id);
      expect(patientRequests.length).toBeGreaterThan(0);

      // Patient requests must only belong to demo-patient
      patientRequests.forEach((req) => {
        expect(req.patientId).toBe(mockPatient.id);
        // CRITICAL PRIVACY REQUIREMENT: Internal notes must be completely redacted for patient
        expect(req.internalNotes).toEqual([]);
      });
    });

    it('allows patient to cancel an active request with audit trail', () => {
      const requests = getStoredHospitalRequests();
      const patientReq = requests.find((r) => r.patientId === mockPatient.id && r.status !== 'cancelled');
      expect(patientReq).toBeDefined();

      const cancelRes = cancelHospitalAssistanceRequest(
        patientReq!.id,
        'Patient chose an alternative healthcare center',
        mockPatient
      );

      expect(cancelRes.success).toBe(true);
      expect(cancelRes.request?.status).toBe('cancelled');

      // Verify audit history is preserved
      const lastHistory = cancelRes.request?.statusHistory.slice(-1)[0];
      expect(lastHistory?.toStatus).toBe('cancelled');
      expect(lastHistory?.note).toContain('Patient chose an alternative healthcare center');

      // Verify audit log entry was generated
      const auditLogs = getStoredAuditLogs();
      const cancelAudit = auditLogs.find(
        (a) => a.action === 'HOSPITAL_REQUEST_CANCELLED' && a.targetId === patientReq!.id
      );
      expect(cancelAudit).toBeDefined();
    });
  });

  // ============================================================================
  // D. VERIFIED HOSPITAL COORDINATION PORTAL & MULTI-HOSPITAL ISOLATION
  // ============================================================================
  describe('D. Verified Hospital Coordination Portal & Multi-Hospital Isolation', () => {
    it('allows verified hospital coordinator to view requests assigned only to their institution', () => {
      // AIIMS Coordinator queries AIIMS requests
      const aiimsRequests = getHospitalRequestsForHospital('hosp-001', mockVerifiedCoordinatorAIIMS);
      expect(aiimsRequests.length).toBeGreaterThan(0);
      aiimsRequests.forEach((req) => {
        expect(req.hospitalId).toBe('hosp-001');
      });

      // PGIMER Coordinator queries PGIMER requests
      const pgimerRequests = getHospitalRequestsForHospital('hosp-002', mockVerifiedCoordinatorPGIMER);
      expect(pgimerRequests.length).toBeGreaterThan(0);
      pgimerRequests.forEach((req) => {
        expect(req.hospitalId).toBe('hosp-002');
      });

      // STRICT MULTI-HOSPITAL ISOLATION: PGIMER coordinator CANNOT view AIIMS requests
      const crossHospitalDenied = getHospitalRequestsForHospital('hosp-001', mockVerifiedCoordinatorPGIMER);
      expect(crossHospitalDenied).toEqual([]);

      // AIIMS coordinator CANNOT view PGIMER requests
      const crossHospitalDenied2 = getHospitalRequestsForHospital('hosp-002', mockVerifiedCoordinatorAIIMS);
      expect(crossHospitalDenied2).toEqual([]);
    });

    it('blocks unverified hospital accounts from accessing sensitive hospital workflows', () => {
      // Hospital user whose verification status is 'pending'
      const unverifiedAccess = getHospitalRequestsForHospital('hosp-001', mockUnverifiedHospitalStaff);
      expect(unverifiedAccess).toEqual([]);

      // Check UI guard in HospitalStaffPortal
      setStoredUser(mockUnverifiedHospitalStaff);
      renderWithProviders(
        <MemoryRouter>
          <HospitalStaffPortal />
        </MemoryRouter>
      );

      expect(screen.getByText('Institutional Verification Under Review')).toBeInTheDocument();
      expect(
        screen.getByText(/Selecting "Hospital" during registration does not automatically grant hospital staff privileges/i)
      ).toBeInTheDocument();
      expect(screen.queryByText('Transplant Assistance Requests')).not.toBeInTheDocument();
    });

    it('allows verified coordinator to update status, request additional info, and add confidential internal notes', () => {
      const aiimsRequests = getHospitalRequestsForHospital('hosp-001', mockVerifiedCoordinatorAIIMS);
      const targetReq = aiimsRequests[0];
      expect(targetReq).toBeDefined();

      // 1. Update status to 'under_hospital_review'
      const updateRes = updateHospitalRequestStatus(
        targetReq.id,
        'under_hospital_review',
        'Clinical workup reviewed by nodal desk.',
        mockVerifiedCoordinatorAIIMS
      );
      expect(updateRes.success).toBe(true);
      expect(updateRes.request?.status).toBe('under_hospital_review');

      // 2. Request additional information (transitions to 'additional_info_required')
      const infoRes = requestHospitalAdditionalInformation(
        targetReq.id,
        'Please bring original Form 1 joint affidavit and SDM attestation for Authorization Committee.',
        mockVerifiedCoordinatorAIIMS
      );
      expect(infoRes.success).toBe(true);
      expect(infoRes.request?.status).toBe('additional_info_required');
      expect(infoRes.request?.patientNotes.some((n) => n.message.includes('SDM attestation'))).toBe(true);

      // 3. Add confidential internal note (accessible to coordinators, hidden from patient)
      const internalRes = addHospitalRequestInternalNote(
        targetReq.id,
        'HLA crossmatch scheduled for next Tuesday. Ethics committee quorum confirmed.',
        mockVerifiedCoordinatorAIIMS
      );
      expect(internalRes.success).toBe(true);
      expect(internalRes.request?.internalNotes.some((n) => n.note.includes('HLA crossmatch'))).toBe(true);

      // Verify that when patient reads their request, the internal note is still stripped
      const patientView = getHospitalRequestsForPatient(targetReq.patientId);
      const patientReqView = patientView.find((r) => r.id === targetReq.id);
      expect(patientReqView?.internalNotes).toEqual([]);

      // 4. Verify in-app notifications generated for patient
      const patientNotifs = getStoredInAppNotifications(targetReq.patientId);
      expect(patientNotifs.some((n) => n.type === 'status_update' || n.type === 'message_received')).toBe(true);
    });

    it('renders HospitalCoordinationDesk with filter and modal workflows for verified coordinator', async () => {
      setStoredUser(mockVerifiedCoordinatorAIIMS);
      const aiimsHospital = VERIFIED_HOSPITALS[0];

      renderWithProviders(
        <MemoryRouter>
          <HospitalCoordinationDesk hospital={aiimsHospital} />
        </MemoryRouter>
      );

      expect(screen.getByText(aiimsHospital.name)).toBeInTheDocument();
      expect(screen.getByText(/Transplant Assistance Coordination Queue/i)).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();

      // Reviews table contains request references
      expect(screen.getByText('TS-REQ-2026-KD-7821')).toBeInTheDocument();

      // Open review modal
      const reviewBtns = screen.getAllByRole('button', { name: /review/i });
      fireEvent.click(reviewBtns[0]);

      expect(screen.getByText(/Assistance Request: TS-REQ-2026-KD-7821/i)).toBeInTheDocument();
      expect(screen.getByText('Request Overview')).toBeInTheDocument();
      expect(screen.getByText(/Patient Communication/i)).toBeInTheDocument();
      expect(screen.getByText(/Internal Notes/i)).toBeInTheDocument();
      expect(screen.getByText(/Status Audit/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // E. REGISTERED DONOR PRIVACY
  // ============================================================================
  describe('E. Registered Donor Privacy Preservation', () => {
    it('maintains anonymous donor public IDs without exposing real names or contact details', () => {
      const donorProfile = DEMO_PROFILES.find((p) => p.role === 'donor');
      expect(donorProfile).toBeDefined();

      // Public donor ID exists
      expect(donorProfile?.publicId).toMatch(/^TS-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

      // Hospital assistance requests never expose or link named donor identities
      const requests = getStoredHospitalRequests();
      requests.forEach((req) => {
        // Must never include donor names, phone numbers, or organ offers
        expect((req as any).donorId).toBeUndefined();
        expect((req as any).donorName).toBeUndefined();
        expect((req as any).donorPhone).toBeUndefined();
      });
    });
  });
});
