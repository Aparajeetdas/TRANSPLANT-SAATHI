import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { AuthProvider } from '../../context/AuthContext';
import { HospitalStaffPortal } from '../hospital/HospitalStaffPortal';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { DonorDashboardPage } from '../../pages/donor/DonorDashboardPage';

const renderTestApp = (initialPath = '/auth/register') => {
  const testClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={testClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<div data-testid="home-page">Home Page Content</div>} />
              <Route path="/directory" element={<div>Directory</div>} />
              <Route path="/resources" element={<div>Resources</div>} />
              <Route path="/how-it-works" element={<div>How It Works</div>} />
              <Route path="/about" element={<div>About</div>} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/donor" element={<DonorDashboardPage />} />
              <Route
                path="/hospital"
                element={
                  <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                    <HospitalStaffPortal />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Registration Flow & Account-Type Selection Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes donor registration from the global navbar while preserving Sign Up link', () => {
    renderTestApp('/');

    // Verify navbar brand and main navigation links (desktop & mobile rendered)
    expect(screen.getAllByText('Transplant Saathi')[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Home$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Hospital Directory$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Official Resources$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^How It Works$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^About$/i })[0]).toBeInTheDocument();

    // Verify "Register as Donor" is NOT in the navbar
    const donorNavLinks = screen.queryAllByRole('link', { name: /Register as (a )?Donor/i });
    expect(donorNavLinks).toHaveLength(0);

    // Verify clean blue-and-white auth actions in header
    expect(screen.getAllByRole('link', { name: /Sign In/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Sign Up/i })[0]).toBeInTheDocument();
  });

  it('renders 3 distinct account-type selection cards when visiting registration', () => {
    renderTestApp('/auth/register');

    expect(screen.getByText(/Create Your Transplant Saathi Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Account Registration Path/i)).toBeInTheDocument();

    // Option 1: Donor
    expect(screen.getByText('Register as a Donor')).toBeInTheDocument();
    expect(screen.getByText(/Record voluntary intention to donate organs and tissues upon brain-stem death/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as Donor/i })).toBeInTheDocument();

    // Option 2: Patient
    expect(screen.getByText('Register as a Patient')).toBeInTheDocument();
    expect(screen.getByText(/For individuals and family caregivers seeking transplant navigation and legal guidance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as Patient/i })).toBeInTheDocument();

    // Option 3: Hospital
    expect(screen.getByText('Register as a Hospital')).toBeInTheDocument();
    expect(screen.getByText(/For accredited transplant centers and licensed organ retrieval institutions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as Hospital/i })).toBeInTheDocument();
  });

  it('navigates to Donor Registration form and allows returning back to selection', () => {
    renderTestApp('/auth/register');

    // Click Continue as Donor
    fireEvent.click(screen.getByRole('button', { name: /Continue as Donor/i }));

    // Expect Donor Registration Form elements
    expect(screen.getByRole('heading', { level: 1, name: /Register as an Organ Donor/i })).toBeInTheDocument();
    expect(screen.getByText(/Statutory THOTA 1994 Safeguards & Legal Distinction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Legal Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();

    // Click Change Account Type / Back
    const backBtn = screen.getByRole('button', { name: /Change Account Type/i });
    fireEvent.click(backBtn);

    // Verify back on selection screen
    expect(screen.getByText('Register as a Donor')).toBeInTheDocument();
    expect(screen.getByText('Register as a Patient')).toBeInTheDocument();
    expect(screen.getByText('Register as a Hospital')).toBeInTheDocument();
  });

  it('submits Hospital Registration, requires verification, and denies privileged hospital portal access', async () => {
    renderTestApp('/auth/register');

    // Click Continue as Hospital
    fireEvent.click(screen.getByRole('button', { name: /Continue as Hospital/i }));

    // Verify Hospital Institution form
    expect(screen.getByRole('heading', { level: 1, name: /Register as a Healthcare Institution/i })).toBeInTheDocument();
    expect(screen.getByText(/Mandatory Statutory Verification under THOTA 1994/i)).toBeInTheDocument();

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/Official Hospital Legal Name/i), {
      target: { value: 'Apex Memorial Transplant Institute' }
    });
    fireEvent.change(screen.getByLabelText(/NOTTO \/ State Statutory License Number/i), {
      target: { value: 'NOTTO-MH-2024-9988' }
    });
    fireEvent.change(screen.getByLabelText(/Accreditation \/ Licensing Body/i), {
      target: { value: 'NABH Accredited' }
    });
    fireEvent.change(screen.getByLabelText(/State \/ Union Territory/i), {
      target: { value: 'Maharashtra' }
    });
    fireEvent.change(screen.getByLabelText(/City \/ District/i), {
      target: { value: 'Mumbai' }
    });
    fireEvent.change(screen.getByLabelText(/Transplant Coordinator \/ Medical Superintendent Name/i), {
      target: { value: 'Dr. Aarav Deshmukh' }
    });
    fireEvent.change(screen.getByLabelText(/Official Institutional Email/i), {
      target: { value: 'coordinator@apexmemorial.org' }
    });
    fireEvent.change(screen.getByLabelText(/Official Hospital Phone Number/i), {
      target: { value: '+91 98765 43210' }
    });
    fireEvent.change(screen.getByLabelText(/^Account Password/i), {
      target: { value: 'SecurePass@2025' }
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'SecurePass@2025' }
    });

    // Accept certification
    const certifyCheckbox = screen.getByRole('checkbox', {
      name: /I certify that I am an authorized clinical coordinator or administrator/i
    });
    fireEvent.click(certifyCheckbox);

    // Submit institutional application
    const submitBtn = screen.getByRole('button', { name: /Submit Hospital for Verification/i });
    fireEvent.click(submitBtn);

    // Verify review pending state is displayed
    await waitFor(() => {
      expect(screen.getByText('Institutional Registration Submitted')).toBeInTheDocument();
    });
    expect(screen.getByText(/Statutory Verification Under Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Apex Memorial Transplant Institute/i)).toBeInTheDocument();
    expect(screen.getByText(/NOTTO-MH-2024-9988/i)).toBeInTheDocument();

    // Verify user profile stored in localStorage has pending status and patient fallback role
    const storedUserStr = localStorage.getItem('transplant_saathi_current_user');
    expect(storedUserStr).not.toBeNull();
    const storedUser = JSON.parse(storedUserStr!);
    expect(storedUser.role).toBe('patient'); // NOT hospital_staff
    expect(storedUser.hospitalVerificationStatus).toBe('pending');
    expect(storedUser.isActive).toBe(false);

    // Verify application stored in applications store
    const storedAppsStr = localStorage.getItem('transplant_saathi_hospital_applications');
    expect(storedAppsStr).not.toBeNull();
    const apps = JSON.parse(storedAppsStr!);
    expect(apps).toHaveLength(1);
    expect(apps[0].hospitalName).toBe('Apex Memorial Transplant Institute');
    expect(apps[0].status).toBe('pending');
  });
});
