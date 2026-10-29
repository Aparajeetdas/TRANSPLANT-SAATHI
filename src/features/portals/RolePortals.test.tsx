import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { AdminPortal } from '../admin/AdminPortal';
import { HospitalStaffPortal } from '../hospital/HospitalStaffPortal';
import { VolunteerPortal } from '../volunteer/VolunteerPortal';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const TestRoleSwitcher: React.FC<{ roleToSet: 'volunteer' | 'hospital_staff' | 'admin' | 'patient' }> = ({
  roleToSet
}) => {
  const { switchRole } = useAuth();
  React.useEffect(() => {
    switchRole(roleToSet);
  }, [roleToSet, switchRole]);
  return null;
};

const renderWithRole = (ui: React.ReactElement, role: 'volunteer' | 'hospital_staff' | 'admin' | 'patient') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TestRoleSwitcher roleToSet={role} />
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Role Portals Suite', () => {
  describe('VolunteerPortal', () => {
    it('renders volunteer coordination hub, conduct rules, and queue', () => {
      renderWithRole(<VolunteerPortal onRequestNewSupport={() => {}} />, 'volunteer');
      expect(screen.getByText(/Volunteer Saathi Coordination Hub/i)).toBeInTheDocument();
      expect(screen.getByText(/1. Non-Medical Support Only/i)).toBeInTheDocument();
      expect(screen.getByText(/2. Strict Altruism Check/i)).toBeInTheDocument();
      expect(screen.getByText(/All Requests/i)).toBeInTheDocument();
    });

    it('filters requests by queue tab', () => {
      renderWithRole(<VolunteerPortal onRequestNewSupport={() => {}} />, 'volunteer');
      const unassignedButton = screen.getByRole('button', { name: /Unassigned/i });
      fireEvent.click(unassignedButton);
      expect(screen.getByText(/Volunteer Saathi Coordination Hub/i)).toBeInTheDocument();
    });
  });

  describe('HospitalStaffPortal', () => {
    it('renders hospital coordinator desk and synthetic intake queue', () => {
      renderWithRole(<HospitalStaffPortal />, 'hospital_staff');
      expect(screen.getByText(/Hospital Coordinator & Ethics Committee Tracker/i)).toBeInTheDocument();
      expect(screen.getByText(/Add Synthetic Case Record/i)).toBeInTheDocument();
      expect(screen.getByText(/Statutory Mandate/i)).toBeInTheDocument();
    });

    it('opens new synthetic patient intake dialog', () => {
      renderWithRole(<HospitalStaffPortal />, 'hospital_staff');
      const newIntakeBtn = screen.getByRole('button', { name: /Add Synthetic Case Record/i });
      fireEvent.click(newIntakeBtn);
      expect(screen.getByText(/Organ Program \*/i)).toBeInTheDocument();
    });
  });

  describe('AdminPortal', () => {
    it('shows permission-denied warning when accessed as non-admin patient', () => {
      renderWithRole(<AdminPortal />, 'patient');
      expect(screen.getByText(/Transplant Saathi Directorate & Admin Desk/i)).toBeInTheDocument();
      expect(screen.getByText(/Prototype Security Demonstration/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Siddharth Sen/i })).toBeInTheDocument();
    });

    it('renders admin console, audit logs, and directory management when admin', () => {
      renderWithRole(<AdminPortal />, 'admin');
      expect(screen.getByText(/System Administration & Security Governance/i)).toBeInTheDocument();
      expect(screen.getByText(/Audit Trail/i)).toBeInTheDocument();
      expect(screen.getByText(/Role RBAC/i)).toBeInTheDocument();
    });
  });
});
