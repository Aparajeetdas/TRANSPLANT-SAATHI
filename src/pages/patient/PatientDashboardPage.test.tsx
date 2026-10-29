import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { PatientDashboardPage } from './PatientDashboardPage';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('PatientDashboardPage & Workspace Modules', () => {
  it('renders patient workspace header and emergency statutory helpline', () => {
    renderWithProviders(<PatientDashboardPage />);
    expect(screen.getByText(/Transplant Navigation Journey/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-11-4770/i)).toBeInTheDocument();
    expect(screen.getByText(/Journey Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Administrative Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Doctor Notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Volunteer Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Expense Planner/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved Hospitals/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy & Consents/i)).toBeInTheDocument();
  });

  it('displays prominent non-clinical scope and statutory boundary notices', () => {
    renderWithProviders(<PatientDashboardPage />);
    expect(screen.getByText(/Statutory Non-Clinical Scope Notice/i)).toBeInTheDocument();
    expect(
      screen.getByText(/We do not make clinical decisions, assess medical organ suitability, or match donors/i)
    ).toBeInTheDocument();
  });

  it('switches to Administrative Checklist tab and displays THOTA compliance items', () => {
    renderWithProviders(<PatientDashboardPage />);
    const checklistTab = screen.getByRole('button', { name: /Administrative Checklist/i });
    fireEvent.click(checklistTab);

    expect(screen.getByText(/Administrative & Document Readiness/i)).toBeInTheDocument();
    expect(screen.getByText(/Aadhaar & PAN Identity Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Form 1 Joint Application for Near Relative Living Donor/i)).toBeInTheDocument();
  });

  it('switches to Doctor Notes tab and displays consultation logger', () => {
    renderWithProviders(<PatientDashboardPage />);
    const notesTab = screen.getByRole('button', { name: /Doctor Notes/i });
    fireEvent.click(notesTab);

    expect(screen.getByText(/Consultation & Appointment Notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Appointment Note/i })).toBeInTheDocument();
  });

  it('switches to Volunteer Requests tab and displays non-clinical scope notice', () => {
    renderWithProviders(<PatientDashboardPage />);
    const supportTab = screen.getByRole('button', { name: /Volunteer Requests/i });
    fireEvent.click(supportTab);

    expect(screen.getByText(/Non-Clinical Support Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Clinical Support Scope/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Volunteer Assistance/i })).toBeInTheDocument();
  });

  it('switches to Expense Planner tab and displays 6-pillar financial projections', () => {
    renderWithProviders(<PatientDashboardPage />);
    const expenseTab = screen.getByRole('button', { name: /Expense Planner/i });
    fireEvent.click(expenseTab);

    expect(screen.getByText(/Transplant Expense & Financial Planning/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Total Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Government \/ Scheme Relief/i)).toBeInTheDocument();
    expect(screen.getByText(/Net Out-Of-Pocket Target/i)).toBeInTheDocument();
    expect(screen.getByText(/Itemized Expense Breakdown/i)).toBeInTheDocument();
  });

  it('switches to Saved Hospitals tab and displays bookmarked apex centers', () => {
    renderWithProviders(<PatientDashboardPage />);
    const savedTab = screen.getByRole('button', { name: /Saved Hospitals/i });
    fireEvent.click(savedTab);

    expect(screen.getByText(/Saved Hospitals & Official Advisories/i)).toBeInTheDocument();
    expect(screen.getByText(/NOTTO National Organ & Tissue Transplant Organization/i)).toBeInTheDocument();
  });

  it('switches to Privacy & Consents tab and displays DPDP Act 2023 controls', () => {
    renderWithProviders(<PatientDashboardPage />);
    const privacyTab = screen.getByRole('button', { name: /Privacy & Consents/i });
    fireEvent.click(privacyTab);

    expect(screen.getByText(/Privacy Governance & DPDP Act 2023 Consents/i)).toBeInTheDocument();
    expect(screen.getByText(/THOTA Section 19 Anti-Commercialization Warning/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export My Data/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Data Erasure/i })).toBeInTheDocument();
  });

  it('opens and cancels account data erasure modal in Privacy tab', () => {
    renderWithProviders(<PatientDashboardPage />);
    const privacyTab = screen.getByRole('button', { name: /Privacy & Consents/i });
    fireEvent.click(privacyTab);

    const erasureBtn = screen.getByRole('button', { name: /Request Data Erasure/i });
    fireEvent.click(erasureBtn);

    expect(screen.getByText(/Confirm Data Erasure Request/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/delete my data/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByPlaceholderText(/delete my data/i)).not.toBeInTheDocument();
  });
});
