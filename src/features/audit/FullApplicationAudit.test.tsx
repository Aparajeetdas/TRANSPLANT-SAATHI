import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { AuthProvider } from '../../context/AuthContext';
import { AdminPortal } from '../../features/admin/AdminPortal';
import { HospitalStaffPortal } from '../../features/hospital/HospitalStaffPortal';
import { VolunteerPortal } from '../../features/volunteer/VolunteerPortal';
import { VolunteerRequestDetailPage } from '../../features/volunteer/VolunteerRequestDetailPage';
import { DEMO_PROFILES } from '../../lib/mockData';
import {
  getStoredAppointmentNotes,
  getStoredAuditLogs,
  getStoredExpensePlan,
  getStoredHospitals,
  getStoredPatientChecklist,
  getStoredProfiles,
  getStoredRequests,
  getStoredResources,
  setStoredUser
} from '../../lib/store';
import { ForgotPasswordPage } from '../../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { ResetPasswordPage } from '../../pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from '../../pages/auth/UnauthorizedPage';
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage';
import { PatientDashboardPage } from '../../pages/patient/PatientDashboardPage';
import { AboutPage } from '../../pages/public/AboutPage';
import { ContactPage } from '../../pages/public/ContactPage';
import { DesignSystemShowcasePage } from '../../pages/public/DesignSystemShowcasePage';
import { DirectoryPage } from '../../pages/public/DirectoryPage';
import { HomePage } from '../../pages/public/HomePage';
import { HospitalDetailPage } from '../../pages/public/HospitalDetailPage';
import { HowItWorksPage } from '../../pages/public/HowItWorksPage';
import { NotFoundPage } from '../../pages/public/NotFoundPage';
import { PrivacyPage } from '../../pages/public/PrivacyPage';
import { ResourcesPage } from '../../pages/public/ResourcesPage';
import { SafetyLimitationsPage } from '../../pages/public/SafetyLimitationsPage';
import { UserRole } from '../../types';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const renderAppWithRoute = (
  initialRoute = '/',
  role: UserRole = 'patient',
  clearSession = false
) => {
  if (clearSession) {
    setStoredUser(null);
  } else {
    const profile = DEMO_PROFILES.find((p) => p.role === role) || {
      id: `test-${role}`,
      email: `${role}@example.com`,
      fullName: `Test ${role}`,
      role,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z'
    };
    setStoredUser(profile);
  }

  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/directory" element={<DirectoryPage />} />
              <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/safety-and-limitations" element={<SafetyLimitationsPage />} />
              <Route path="/design-system" element={<DesignSystemShowcasePage />} />

              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/unauthorized" element={<UnauthorizedPage />} />

              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'family', 'admin']}>
                    <PatientDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                    <VolunteerPortal onRequestNewSupport={() => {}} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/requests/:id"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                    <VolunteerRequestDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hospital"
                element={
                  <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                    <HospitalStaffPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Comprehensive End-to-End Application Audit Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. Public Routes, Headers & Content Integrity', () => {
    it('audits HomePage (/) - headline, statutory disclaimer and CTA', async () => {
      renderAppWithRoute('/');
      expect(screen.getByText(/compassionate guidance through organ transplantation in india/i)).toBeInTheDocument();
      expect(screen.getAllByText(/THOTA 1994/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /search centers/i })).toBeInTheDocument();
    });

    it('audits DirectoryPage (/directory) - search, filtering, and demonstration badge', async () => {
      renderAppWithRoute('/directory');
      await waitFor(() => {
        expect(screen.getByText(/verified transplant center directory/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/search verified hospitals/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Demonstration Record/i).length).toBeGreaterThan(0);
      });
    });

    it('audits HospitalDetailPage (/hospitals/hosp-001) - renders NOTTO registration citation', async () => {
      renderAppWithRoute('/hospitals/hosp-001');
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /All India Institute of Medical Sciences/i })).toBeInTheDocument();
        expect(screen.getByText(/NOTTO-APEX-ND-001/i)).toBeInTheDocument();
        expect(screen.getByText(/Supported Programs & Statutory Source Verifications/i)).toBeInTheDocument();
      });
    });

    it('audits ResourcesPage (/resources) - verifies financial schemes and THOTA forms', async () => {
      renderAppWithRoute('/resources');
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /official resources/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /legal forms/i })).toBeInTheDocument();
      });
    });

    it('audits HowItWorksPage (/how-it-works) - renders 5 statutory journey stages', async () => {
      renderAppWithRoute('/how-it-works');
      expect(screen.getByText(/how organ transplantation works in india/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /living donor pathway/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deceased donor waitlist/i })).toBeInTheDocument();
    });

    it('audits AboutPage (/about)', async () => {
      renderAppWithRoute('/about');
      expect(screen.getByText(/about transplant saathi/i)).toBeInTheDocument();
    });

    it('audits ContactPage (/contact)', async () => {
      renderAppWithRoute('/contact');
      expect(screen.getByText(/Contact Transplant Saathi/i)).toBeInTheDocument();
      expect(screen.getByText(/Statutory National Emergency Desks/i)).toBeInTheDocument();
    });

    it('audits PrivacyPage (/privacy)', async () => {
      renderAppWithRoute('/privacy');
      expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
      expect(screen.getByText(/Minimum Necessary Information Standard/i)).toBeInTheDocument();
    });

    it('audits SafetyLimitationsPage (/safety-and-limitations)', async () => {
      renderAppWithRoute('/safety-and-limitations');
      expect(screen.getByText(/Safety, Legal Boundaries & Platform Limitations/i)).toBeInTheDocument();
      expect(screen.getByText(/Statutory Boundaries & Clinical Disclaimers/i)).toBeInTheDocument();
    });

    it('audits Design System Showcase (/design-system)', async () => {
      renderAppWithRoute('/design-system');
      expect(screen.getByText(/Design System & UI Components Specification/i)).toBeInTheDocument();
      expect(screen.getByText(/Phase 1 Architecture/i)).toBeInTheDocument();
    });

    it('audits 404 Not Found Page on unrecognized path', async () => {
      renderAppWithRoute('/invalid-route-does-not-exist');
      expect(screen.getByText(/404/i)).toBeInTheDocument();
      expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    });
  });

  describe('2. Authentication Flows & Security Error States', () => {
    it('audits LoginPage (/auth/login) rendering and fields', async () => {
      renderAppWithRoute('/auth/login');
      expect(screen.getByText(/Sign In to Transplant Saathi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('audits RegisterPage (/auth/register) prohibiting privileged role selection', async () => {
      renderAppWithRoute('/auth/register?type=patient');
      expect(screen.getByText(/Create Patient & Family Account/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /select account type/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /patient/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /family/i })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /admin/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /hospital/i })).not.toBeInTheDocument();
    });

    it('audits ForgotPasswordPage (/auth/forgot-password)', async () => {
      renderAppWithRoute('/auth/forgot-password');
      expect(screen.getByText(/Recover Password/i)).toBeInTheDocument();
    });

    it('audits VerifyEmailPage (/auth/verify-email)', async () => {
      renderAppWithRoute('/auth/verify-email');
      expect(screen.getByText(/Email Verification/i)).toBeInTheDocument();
    });

    it('audits UnauthorizedPage (/auth/unauthorized)', async () => {
      renderAppWithRoute('/auth/unauthorized');
      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/institutional clearance/i)).toBeInTheDocument();
    });
  });

  describe('3. Role Authorization & Protected Route Isolation', () => {
    it('blocks unauthenticated access to /patient and redirects to login', async () => {
      renderAppWithRoute('/patient', undefined, true);
      await waitFor(() => {
        expect(screen.getByText(/Sign In to Transplant Saathi/i)).toBeInTheDocument();
      });
    });

    it('blocks non-admin users from privileged administrator portal', async () => {
      renderAppWithRoute('/admin', 'patient');
      expect(screen.getByText(/Access Restricted: Role Authorization Required/i)).toBeInTheDocument();
      expect(screen.getByText(/Restricted Institutional Workspace/i)).toBeInTheDocument();
    });

    it('blocks volunteers from accessing requests assigned to others', async () => {
      renderAppWithRoute('/volunteer/requests/req-104', 'volunteer');

      await waitFor(() => {
        expect(screen.getByText(/Access Denied: Restricted Case Dossier/i)).toBeInTheDocument();
        expect(screen.getByText(/403 — Unauthorized Record Access/i)).toBeInTheDocument();
      });

      const auditLogs = getStoredAuditLogs();
      const unauthorizedAttempt = auditLogs.find((l) => l.action === 'UNAUTHORIZED_RECORD_ACCESS_ATTEMPT');
      expect(unauthorizedAttempt).toBeDefined();
    });

    it('permits administrator to access /admin', async () => {
      renderAppWithRoute('/admin', 'admin');
      expect(screen.getByText(/System Administration & Security Governance/i)).toBeInTheDocument();
    });

    it('permits administrator to access /hospital', async () => {
      renderAppWithRoute('/hospital', 'admin');
      expect(screen.getByText(/Authorized Institutional Portal & Coordinator Desk/i)).toBeInTheDocument();
    });

    it('permits administrator to access /volunteer', async () => {
      renderAppWithRoute('/volunteer', 'admin');
      expect(screen.getByText(/Volunteer Saathi Coordination Hub/i)).toBeInTheDocument();
    });

    it('permits administrator to access /patient', async () => {
      renderAppWithRoute('/patient', 'admin');
      expect(screen.getByText(/Patient Workspace/i)).toBeInTheDocument();
    });
  });

  describe('4. Search, Filtering, and Empty Results State', () => {
    it('renders empty state when directory search yields zero results', async () => {
      renderAppWithRoute('/directory', 'patient');

      const searchInput = screen.getByLabelText(/search verified hospitals/i);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_HOSPITAL_XYZ_999' } });

      await waitFor(() => {
        expect(screen.getByText(/no verified transplant centers found/i)).toBeInTheDocument();
      });
    });

    it('resets search filter and restores hospital listings', async () => {
      renderAppWithRoute('/directory', 'patient');

      const searchInput = screen.getByLabelText(/search verified hospitals/i);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_HOSPITAL_XYZ_999' } });

      await waitFor(() => {
        expect(screen.getByText(/no verified transplant centers found/i)).toBeInTheDocument();
      });

      // Clear search
      const resetButton = screen.getByRole('button', { name: /reset filters/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
      });
    });
  });

  describe('5. Database & LocalStorage Persistence Validation', () => {
    it('initializes and persists all domain collections in local storage store', () => {
      const hospitals = getStoredHospitals();
      expect(hospitals.length).toBeGreaterThan(0);

      const profiles = getStoredProfiles();
      expect(profiles.length).toBeGreaterThan(0);

      const requests = getStoredRequests();
      expect(requests.length).toBeGreaterThan(0);

      const resources = getStoredResources();
      expect(resources.length).toBeGreaterThan(0);

      const auditLogs = getStoredAuditLogs();
      expect(auditLogs.length).toBeGreaterThan(0);

      const checklist = getStoredPatientChecklist('demo-patient');
      expect(checklist.length).toBeGreaterThan(0);

      const notes = getStoredAppointmentNotes('demo-patient');
      expect(notes.length).toBeGreaterThan(0);

      const expensePlan = getStoredExpensePlan('demo-patient');
      expect(expensePlan.items.length).toBeGreaterThan(0);
    });
  });
});
