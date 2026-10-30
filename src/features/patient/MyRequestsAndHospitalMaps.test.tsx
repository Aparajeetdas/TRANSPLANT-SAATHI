import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { DEMO_PROFILES, VERIFIED_HOSPITALS } from '../../lib/mockData';
import { getHospitalGoogleMapsUrl } from '../../lib/maps';
import {
  addHospitalRequestInternalNote,
  createHospitalAssistanceRequest,
  getHospitalRequestsForPatient,
  saveStoredHospitalRequests,
  saveStoredHospitals,
  setStoredUser,
  updateHospitalRequestStatus
} from '../../lib/store';
import { DirectoryPage } from '../../pages/public/DirectoryPage';
import { HospitalDetailPage } from '../../pages/public/HospitalDetailPage';
import { PatientDashboardPage } from '../../pages/patient/PatientDashboardPage';
import { HospitalAssistanceTracker } from './HospitalAssistanceTracker';
import { UserProfile, VerifiedHospital } from '../../types';

const demoPatient = DEMO_PROFILES.find((p) => p.id === 'demo-patient') as UserProfile;
const demoAdmin = DEMO_PROFILES.find((p) => p.role === 'admin') as UserProfile;

const otherPatient: UserProfile = {
  id: 'patient-test-002',
  fullName: 'Sunita Sharma',
  email: 'sunita.patient@example.com',
  phone: '+91-9876543211',
  role: 'patient',
  publicId: 'TS-SUNI-9900',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z'
};

const renderWithProviders = (ui: React.ReactElement, initialPath = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Transplant Saathi — Direct Hospital Map Links & My Requests Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    saveStoredHospitals(VERIFIED_HOSPITALS);
    saveStoredHospitalRequests([]);
    setStoredUser(demoPatient);
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. Hospital Google Maps Links without API Key', () => {
    it('generates a properly encoded Google Maps search URL preferring verified address', () => {
      const hospital: Partial<VerifiedHospital> = {
        name: 'AIIMS New Delhi',
        address: 'Ansari Nagar East, New Delhi, Delhi 110029',
        city: 'New Delhi',
        state: 'Delhi',
        lat: 28.5672,
        lng: 77.21
      };

      const url = getHospitalGoogleMapsUrl(hospital);
      expect(url).not.toBeNull();
      expect(url).toContain('https://www.google.com/maps/search/?api=1&query=');
      expect(url).toContain(encodeURIComponent('AIIMS New Delhi'));
      expect(url).toContain(encodeURIComponent('Ansari Nagar East'));
    });

    it('falls back to coordinates when street address is missing', () => {
      const hospitalWithoutAddress: Partial<VerifiedHospital> = {
        name: 'Regional Center Without Street Address',
        address: '',
        city: 'Pune',
        state: 'Maharashtra',
        lat: 18.5204,
        lng: 73.8567
      };

      const url = getHospitalGoogleMapsUrl(hospitalWithoutAddress);
      expect(url).not.toBeNull();
      expect(url).toBe('https://www.google.com/maps/search/?api=1&query=18.5204%2C73.8567');
    });

    it('returns null without inventing fictitious location when both address and coordinates are absent', () => {
      const hospitalNoLocation: Partial<VerifiedHospital> = {
        name: 'Unmapped Memorial Hospital',
        address: '',
        lat: undefined,
        lng: undefined
      };

      const url = getHospitalGoogleMapsUrl(hospitalNoLocation);
      expect(url).toBeNull();
    });

    it('renders "View on Google Maps" links on directory cards with security attributes', async () => {
      renderWithProviders(<DirectoryPage />, '/directory');

      await waitFor(() => {
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
      });

      const mapLinks = screen.getAllByRole('link', { name: /view on google maps/i });
      expect(mapLinks.length).toBeGreaterThan(0);
      expect(mapLinks[0]).toHaveAttribute('target', '_blank');
      expect(mapLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
      expect(mapLinks[0].getAttribute('href')).toContain('https://www.google.com/maps/search/?api=1&query=');
    });

    it('renders "View on Google Maps" button in HospitalDetailPage header', async () => {
      renderWithProviders(
        <Routes>
          <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
        </Routes>,
        '/hospitals/hosp-001'
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /All India Institute of Medical Sciences/i })).toBeInTheDocument();
      });

      const mapLink = screen.getByRole('link', { name: /view on google maps/i });
      expect(mapLink).toBeInTheDocument();
      expect(mapLink).toHaveAttribute('target', '_blank');
      expect(mapLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(mapLink.getAttribute('href')).toContain('https://www.google.com/maps/search/?api=1&query=');
    });
  });

  describe('2. Request Submission Workflow & Database Integrity', () => {
    it('validates consent, description length, and saves request to store', () => {
      // 1. Consent missing
      const noConsentRes = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Need assistance with statutory Form 1 submission.',
          consentGiven: false,
          preferredContactMethod: 'email'
        },
        demoPatient
      );
      expect(noConsentRes.success).toBe(false);
      expect(noConsentRes.error).toMatch(/informed consent is required/i);

      // 2. Short description
      const shortDescRes = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Help',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );
      expect(shortDescRes.success).toBe(false);
      expect(shortDescRes.error).toMatch(/at least 10 characters/i);

      // 3. Valid submission
      const validRes = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Seeking nodal coordinator guidance for near-relative Form 1 clearance.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );

      expect(validRes.success).toBe(true);
      expect(validRes.request).toBeDefined();
      expect(validRes.request?.referenceNumber).toMatch(/^TS-REQ-\d{4}-KD-[A-Z0-9]{4}$/);
      expect(validRes.request?.status).toBe('submitted');
      expect(validRes.request?.patientId).toBe(demoPatient.id);
    });

    it('prevents rapid duplicate submissions', () => {
      const first = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'First request for kidney consultation guidance.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );
      expect(first.success).toBe(true);

      const duplicate = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Duplicate submission attempt immediately after.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );

      expect(duplicate.success).toBe(false);
      expect(duplicate.error).toMatch(/request for this hospital and organ program was just submitted/i);
    });
  });

  describe('3. My Requests Page, Privacy & Status Filters', () => {
    it('isolates patient requests: patient cannot view another user\'s requests', () => {
      // Create request for demoPatient
      createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Patient kidney transplant assistance request.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );

      // Create request for Sunita
      createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-002',
          organProgram: 'liver',
          requestCategory: 'document_guidance',
          description: 'Sunita\'s liver transplant document inquiry.',
          consentGiven: true,
          preferredContactMethod: 'phone'
        },
        otherPatient
      );

      const demoRequests = getHospitalRequestsForPatient(demoPatient.id);
      expect(demoRequests).toHaveLength(1);
      expect(demoRequests[0].patientName).toBe(demoPatient.fullName);
      expect(demoRequests.some((r) => r.patientId === otherPatient.id)).toBe(false);

      const sunitaRequests = getHospitalRequestsForPatient(otherPatient.id);
      expect(sunitaRequests).toHaveLength(1);
      expect(sunitaRequests[0].patientName).toBe('Sunita Sharma');
      expect(sunitaRequests.some((r) => r.patientId === demoPatient.id)).toBe(false);
    });

    it('renders "My Requests" tab on the Patient Dashboard with correct card attributes', async () => {
      const reqRes = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Need administrative guidance for living donor authorization committee.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );
      expect(reqRes.success).toBe(true);

      setStoredUser(demoPatient);
      renderWithProviders(<PatientDashboardPage />);

      // Switch to "My Requests" tab
      const myRequestsTab = screen.getByRole('button', { name: /my requests/i });
      expect(myRequestsTab).toBeInTheDocument();
      fireEvent.click(myRequestsTab);

      // Check card contents: reference ID, hospital name, organ program, status, submission date, View Details
      await waitFor(() => {
        expect(screen.getByText(reqRes.request!.referenceNumber)).toBeInTheDocument();
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
        expect(screen.getByText(/KIDNEY Program/i)).toBeInTheDocument();
        expect(screen.getByText(/Submission Date:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
      });
    });

    it('filters requests by status tabs: All, Submitted, Under Review, Action Required, Completed/Closed', async () => {
      // 1. Submitted request
      const r1 = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Kidney coordination query.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );

      // 2. Additional Info Required request
      const r2 = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-002',
          organProgram: 'liver',
          requestCategory: 'document_guidance',
          description: 'Liver coordination query needing affidavit.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );
      const updateRes = updateHospitalRequestStatus(r2.request!.id, 'additional_info_required', 'Please attach Form 2 affidavit', demoAdmin);
      expect(updateRes.success).toBe(true);

      setStoredUser(demoPatient);
      renderWithProviders(<HospitalAssistanceTracker />);

      // Filter: Action Required
      const actionRequiredBtn = screen.getByRole('button', { name: /action required/i });
      fireEvent.click(actionRequiredBtn);

      await waitFor(() => {
        expect(screen.getByText(r2.request!.referenceNumber)).toBeInTheDocument();
      });
      expect(screen.queryByText(r1.request!.referenceNumber)).not.toBeInTheDocument();

      // Filter: Submitted
      const submittedBtn = screen.getByRole('button', { name: /^submitted/i });
      fireEvent.click(submittedBtn);

      await waitFor(() => {
        expect(screen.getByText(r1.request!.referenceNumber)).toBeInTheDocument();
        expect(screen.queryByText(r2.request!.referenceNumber)).not.toBeInTheDocument();
      });
    });

    it('opens Request Details modal with submitted data, direct Google Maps link, and keeps internal notes private', async () => {
      const reqRes = createHospitalAssistanceRequest(
        {
          hospitalId: 'hosp-001',
          organProgram: 'kidney',
          requestCategory: 'hospital_coordination',
          description: 'Detailed description for living donor verification process.',
          consentGiven: true,
          preferredContactMethod: 'email'
        },
        demoPatient
      );
      expect(reqRes.success).toBe(true);

      // Hospital coordinator adds internal clinical verification note
      addHospitalRequestInternalNote(
        reqRes.request!.id,
        'INTERNAL ONLY: Preliminary cross-match negative, donor HLA clearance in progress.',
        demoAdmin
      );

      setStoredUser(demoPatient);
      renderWithProviders(<HospitalAssistanceTracker />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
      });

      const viewDetailsBtn = screen.getByRole('button', { name: /view details/i });
      fireEvent.click(viewDetailsBtn);

      await waitFor(() => {
        // Reference number and hospital name in modal
        expect(screen.getAllByText(reqRes.request!.referenceNumber).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/All India Institute of Medical Sciences/i).length).toBeGreaterThanOrEqual(1);
      });

      // Direct Google Maps link in modal
      const mapsLink = screen.getByRole('link', { name: /view hospital on google maps/i });
      expect(mapsLink).toBeInTheDocument();
      expect(mapsLink).toHaveAttribute('href', expect.stringContaining('https://www.google.com/maps/search/?api=1&query='));
      expect(mapsLink).toHaveAttribute('target', '_blank');
      expect(mapsLink).toHaveAttribute('rel', 'noopener noreferrer');

      // Patient-submitted description visible
      expect(screen.getAllByText(/Detailed description for living donor verification process/i).length).toBeGreaterThanOrEqual(1);

      // Confidential internal notes MUST NOT be visible to patient
      expect(screen.queryByText(/INTERNAL ONLY/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Preliminary cross-match negative/i)).not.toBeInTheDocument();
    });
  });
});
