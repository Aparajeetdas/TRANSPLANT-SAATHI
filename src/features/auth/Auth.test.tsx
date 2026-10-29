import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { AdminPortal } from '../admin/AdminPortal';
import { HospitalStaffPortal } from '../hospital/HospitalStaffPortal';
import { ForgotPasswordPage } from '../../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { ResetPasswordPage } from '../../pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from '../../pages/auth/UnauthorizedPage';
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage';
import { PatientDashboardPage } from '../../pages/patient/PatientDashboardPage';
import { UserProfile } from '../../types';

const renderAuthApp = (initialPath = '/auth/login', initialUser?: UserProfile | null) => {
  const testClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  if (initialUser !== undefined) {
    if (initialUser) {
      localStorage.setItem('transplant_saathi_current_user', JSON.stringify(initialUser));
    } else {
      localStorage.removeItem('transplant_saathi_current_user');
    }
  }

  return render(
    <QueryClientProvider client={testClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
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
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// Component helper to inspect useAuth() hook
const AuthHookInspector: React.FC<{
  onInspect: (auth: ReturnType<typeof useAuth>) => void;
}> = ({ onInspect }) => {
  const auth = useAuth();
  React.useEffect(() => {
    onInspect(auth);
  }, [auth, onInspect]);
  return null;
};

describe('Supabase Auth & Session Security Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('prohibits public users from selecting privileged roles during registration', async () => {
    renderAuthApp('/auth/register', null);

    // Initial account selection step shows 3 registration options
    expect(screen.getByText(/Create Your Transplant Saathi Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Register as a Donor/i)).toBeInTheDocument();
    expect(screen.getByText(/Register as a Patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Register as a Hospital/i)).toBeInTheDocument();

    // Select Patient registration
    const patientContinueBtn = screen.getByRole('button', { name: /Continue as Patient/i });
    fireEvent.click(patientContinueBtn);

    expect(screen.getByText(/Create Patient & Family Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Strict Public Role Governance/i)).toBeInTheDocument();

    const roleSelect = screen.getByLabelText(/select account type/i) as HTMLSelectElement;
    expect(roleSelect).toBeInTheDocument();

    // Verify allowed public options
    const options = Array.from(roleSelect.options).map((opt) => opt.value);
    expect(options).toEqual(['patient', 'family']);

    // Ensure privileged roles are completely absent from public selection
    expect(options).not.toContain('admin');
    expect(options).not.toContain('hospital_staff');
    expect(options).not.toContain('volunteer');
  });

  it('enforces runtime guard against privileged role injection in signUpWithEmail', async () => {
    let capturedAuth: ReturnType<typeof useAuth> | undefined;

    render(
      <AuthProvider>
        <AuthHookInspector onInspect={(auth) => { capturedAuth = auth; }} />
      </AuthProvider>
    );

    await waitFor(() => expect(capturedAuth).toBeDefined());

    // Attempting to pass 'admin' through public signup must be blocked
    const adminAttempt = await capturedAuth!.signUpWithEmail(
      'hacker@example.com',
      'password123',
      'Malicious Actor',
      'admin' as unknown as 'patient'
    );
    expect(adminAttempt.success).toBe(false);
    expect(adminAttempt.error).toContain('Security Policy Violation');

    // Attempting to pass 'hospital_staff' through public signup must be blocked
    const staffAttempt = await capturedAuth!.signUpWithEmail(
      'fake.doctor@example.com',
      'password123',
      'Fake Doctor',
      'hospital_staff' as unknown as 'patient'
    );
    expect(staffAttempt.success).toBe(false);
    expect(staffAttempt.error).toContain('Security Policy Violation');

    // Legitimate public registration as 'patient' succeeds
    const legitimateAttempt = await capturedAuth!.signUpWithEmail(
      'patient.kumar@example.com',
      'password123',
      'Sunil Kumar',
      'patient'
    );
    expect(legitimateAttempt.success).toBe(true);
  });

  it('handles invalid credentials with clear authentication error state', async () => {
    renderAuthApp('/auth/login', null);

    const emailInput = screen.getByLabelText(/email address/i);
    const passInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
    });
  });

  it('handles unverified email error state with direct verification link', async () => {
    renderAuthApp('/auth/login', null);

    const emailInput = screen.getByLabelText(/email address/i);
    const passInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

    fireEvent.change(emailInput, { target: { value: 'patient@unverified.test' } });
    fireEvent.change(passInput, { target: { value: 'correctpassword123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Email address not verified/i)).toBeInTheDocument();
      expect(screen.getByText(/Verify your email address now/i)).toBeInTheDocument();
    });
  });

  it('displays session expired alert when user is redirected with expired session', async () => {
    renderAuthApp('/auth/login?session=expired', null);

    expect(screen.getByText(/Session Expired/i)).toBeInTheDocument();
    expect(screen.getByText(/Your session has timed out/i)).toBeInTheDocument();
  });

  it('handles user logout and resets auth state', async () => {
    let capturedAuth: ReturnType<typeof useAuth> | undefined;

    const testUser: UserProfile = {
      id: 'usr-active-1',
      email: 'active@example.com',
      fullName: 'Active User',
      role: 'patient',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    render(
      <AuthProvider>
        <AuthHookInspector onInspect={(auth) => { capturedAuth = auth; }} />
      </AuthProvider>
    );

    await waitFor(() => expect(capturedAuth).toBeDefined());

    act(() => {
      capturedAuth!.loginAs(testUser);
    });

    await waitFor(() => {
      expect(capturedAuth!.currentUser).toEqual(testUser);
    });

    await act(async () => {
      await capturedAuth!.logout();
    });

    await waitFor(() => {
      expect(capturedAuth!.currentUser).toBeNull();
    });
  });

  it('blocks unauthenticated access to protected routes and redirects to login', async () => {
    renderAuthApp('/patient', null);

    await waitFor(() => {
      expect(screen.getByText(/Sign In to Transplant Saathi/i)).toBeInTheDocument();
      expect(screen.getByText(/Please sign in with your credentials to access this protected portal/i)).toBeInTheDocument();
    });
  });

  it('blocks unauthorized patient access to /admin and shows access restricted state', async () => {
    const patientUser: UserProfile = {
      id: 'patient-rajesh',
      email: 'rajesh@example.com',
      fullName: 'Rajesh Sharma',
      role: 'patient',
      isActive: true,
      createdAt: '2026-01-01'
    };

    renderAuthApp('/admin', patientUser);

    await waitFor(() => {
      expect(screen.getByText(/Access Restricted: Role Authorization Required/i)).toBeInTheDocument();
      expect(screen.getByText(/Hospital staff and volunteer accounts cannot be self-selected/i)).toBeInTheDocument();
    });
  });

  it('blocks unauthorized patient access to /hospital and shows access restricted state', async () => {
    const patientUser: UserProfile = {
      id: 'patient-rajesh',
      email: 'rajesh@example.com',
      fullName: 'Rajesh Sharma',
      role: 'patient',
      isActive: true,
      createdAt: '2026-01-01'
    };

    renderAuthApp('/hospital', patientUser);

    await waitFor(() => {
      expect(screen.getByText(/Access Restricted: Role Authorization Required/i)).toBeInTheDocument();
    });
  });

  it('allows authorized admin user to access /admin', async () => {
    const adminUser: UserProfile = {
      id: 'admin-siddharth',
      email: 'siddharth@example.com',
      fullName: 'Siddharth Sen',
      role: 'admin',
      isActive: true,
      createdAt: '2026-01-01'
    };

    renderAuthApp('/admin', adminUser);

    await waitFor(() => {
      expect(screen.getByText(/System Administration & Security Governance/i)).toBeInTheDocument();
    });
  });

  it('allows authorized hospital staff user to access /hospital', async () => {
    const staffUser: UserProfile = {
      id: 'staff-priya',
      email: 'priya@aiims.gov.in',
      fullName: 'Dr. Priya Raman',
      role: 'hospital_staff',
      isActive: true,
      createdAt: '2026-01-01'
    };

    renderAuthApp('/hospital', staffUser);

    await waitFor(() => {
      expect(screen.getByText(/Hospital Coordinator & Ethics Committee Tracker/i)).toBeInTheDocument();
    });
  });

  it('handles password recovery email dispatch and new password submission', async () => {
    // 1. Forgot password request
    renderAuthApp('/auth/forgot-password', null);

    const emailInput = screen.getByLabelText(/registered email/i);
    const submitBtn = screen.getByRole('button', { name: /send password reset link/i });

    fireEvent.change(emailInput, { target: { value: 'patient@example.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Reset Link Dispatched/i)).toBeInTheDocument();
    });

    // 2. Reset password page
    renderAuthApp('/auth/reset-password', null);

    const newPass = screen.getByLabelText(/^new password/i);
    const confirmPass = screen.getByLabelText(/confirm new password/i);
    const updateBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPass, { target: { value: 'newsecurepass123' } });
    fireEvent.change(confirmPass, { target: { value: 'newsecurepass123' } });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Password Successfully Updated/i)).toBeInTheDocument();
    });
  });

  it('renders verify email page and handles resend verification email', async () => {
    renderAuthApp('/auth/verify-email?email=test%40example.com', null);

    expect(screen.getByText(/Email Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Check Your Inbox/i)).toBeInTheDocument();

    const resendBtn = screen.getByRole('button', { name: /resend verification email/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Verification Link Sent/i)).toBeInTheDocument();
    });
  });
});
