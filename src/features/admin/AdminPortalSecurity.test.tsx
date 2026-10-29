import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import {
  getStoredAuditLogs,
  updateUserProfileRole
} from '../../lib/store';
import { UserProfile } from '../../types';
import { AdminPortal } from './AdminPortal';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const RoleSwitcher: React.FC<{ roleToSet: 'admin' | 'patient' | 'volunteer' | 'hospital_staff' }> = ({
  roleToSet
}) => {
  const { switchRole } = useAuth();
  React.useEffect(() => {
    switchRole(roleToSet);
  }, [roleToSet, switchRole]);
  return null;
};

const renderWithRole = (role: 'admin' | 'patient' | 'volunteer' | 'hospital_staff' = 'admin') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleSwitcher roleToSet={role} />
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Admin Portal & Privilege Escalation Guard Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Role-Based Access Control (RBAC) Protection', () => {
    it('blocks non-admin users (patient) and displays permission denied alert', async () => {
      renderWithRole('patient');

      expect(screen.getByText(/Transplant Saathi Directorate & Admin Desk/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Only authenticated platform administrators can access role assignment and system audit logs/i)
      ).toBeInTheDocument();
      expect(screen.queryByText(/Directory Governance/i)).not.toBeInTheDocument();
    });

    it('grants full console access when authenticated as platform admin', async () => {
      renderWithRole('admin');

      expect(screen.getByText(/System Administration & Security Governance/i)).toBeInTheDocument();
      expect(screen.getByText(/Logged in as/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Role RBAC/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Directory Governance/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Official Resources/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Request Oversight/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Audit Trail/i })).toBeInTheDocument();
    });
  });

  describe('2. User-Role Administration & Privilege Escalation Guard', () => {
    it('prevents non-admin callers from modifying user roles and records audit violation', () => {
      const maliciousCaller: UserProfile = {
        id: 'bad-actor',
        email: 'attacker@example.com',
        fullName: 'Mallory',
        role: 'patient',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const result = updateUserProfileRole(maliciousCaller, 'demo-patient', 'admin');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Only authenticated platform administrators can modify user roles/i);

      const logs = getStoredAuditLogs();
      const violation = logs.find((l) => l.action === 'UNAUTHORIZED_PRIVILEGE_ESCALATION_ATTEMPT');
      expect(violation).toBeDefined();
      expect(violation?.details?.violation).toBe('NON_ADMIN_ROLE_CHANGE_BLOCKED');
    });

    it('strictly prevents demoting the sole active administrator account', () => {
      const adminCaller: UserProfile = {
        id: 'demo-admin',
        email: 'admin.director@transplantsaathi.org',
        fullName: 'Siddharth Sen (Platform Admin)',
        role: 'admin',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z'
      };

      // Attempt to demote sole admin Siddharth Sen to patient
      const result = updateUserProfileRole(adminCaller, 'demo-admin', 'patient');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Cannot demote the sole active platform administrator/i);

      const logs = getStoredAuditLogs();
      const demotionBlockedLog = logs.find((l) => l.action === 'SOLE_ADMIN_DEMOTION_PREVENTED');
      expect(demotionBlockedLog).toBeDefined();
    });

    it('requires confirmation before applying role change through UI', async () => {
      renderWithRole('admin');

      // Find role select for patient Rajesh Sharma
      const rajeshSelect = screen.getByLabelText(/Change role for Rajesh Sharma/i);
      fireEvent.change(rajeshSelect, { target: { value: 'volunteer' } });

      // Confirmation modal must open
      await waitFor(() => {
        expect(screen.getByText(/Confirm Role Privilege Assignment/i)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to change the role for/i)).toBeInTheDocument();
      });

      // Confirm role change
      const confirmBtn = screen.getByRole('button', { name: /Confirm Role Change/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText(/Privilege updated: Rajesh Sharma is now assigned role 'volunteer'/i)).toBeInTheDocument();
        const logs = getStoredAuditLogs();
        const updateLog = logs.find((l) => l.action === 'ROLE_ASSIGNMENT_CONFIRMED');
        expect(updateLog).toBeDefined();
        expect(updateLog?.details?.assignedRole).toBe('volunteer');
      });
    });
  });

  describe('3. Hospital Directory Management & Verification Reviews', () => {
    it('searches and filters hospitals in the directory tab', async () => {
      renderWithRole('admin');

      const directoryTabBtn = screen.getByRole('button', { name: /Directory Governance/i });
      fireEvent.click(directoryTabBtn);

      expect(screen.getByText(/All India Institute of Medical Sciences \(AIIMS\)/i)).toBeInTheDocument();

      // Search for PGIMER
      const searchInput = screen.getByPlaceholderText(/Search hospital name, city, state, or registration ID.../i);
      fireEvent.change(searchInput, { target: { value: 'PGIMER' } });

      await waitFor(() => {
        expect(screen.getByText(/Postgraduate Institute of Medical Education and Research \(PGIMER\)/i)).toBeInTheDocument();
        expect(screen.queryByText(/ILBS/i)).not.toBeInTheDocument();
      });
    });

    it('conducts quarterly verification review and updates statutory status', async () => {
      renderWithRole('admin');

      const directoryTabBtn = screen.getByRole('button', { name: /Directory Governance/i });
      fireEvent.click(directoryTabBtn);

      // Click "Review" button on first row (AIIMS)
      const reviewBtns = screen.getAllByRole('button', { name: /Review/i });
      fireEvent.click(reviewBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/Transplant Center Verification Review/i)).toBeInTheDocument();
      });

      // Save review
      const saveReviewBtn = screen.getByRole('button', { name: /Save Verification Review/i });
      fireEvent.click(saveReviewBtn);

      await waitFor(() => {
        expect(screen.getByText(/Verification status for .* set to verified/i)).toBeInTheDocument();
        const logs = getStoredAuditLogs();
        const reviewLog = logs.find((l) => l.action === 'HOSPITAL_VERIFICATION_REVIEW_UPDATED');
        expect(reviewLog).toBeDefined();
      });
    });

    it('requires confirmation before deleting a hospital directory record', async () => {
      renderWithRole('admin');

      const directoryTabBtn = screen.getByRole('button', { name: /Directory Governance/i });
      fireEvent.click(directoryTabBtn);

      // Click delete trash icon
      const deleteBtn = screen.getAllByTitle(/Delete center/i)[0];
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByText(/Remove Hospital from Verified Directory/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete Center/i })).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmDeleteBtn = screen.getByRole('button', { name: /Delete Center/i });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(screen.getByText(/Removed .* from verified registry/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Official Resource Management', () => {
    it('lists official resources and creates a new published resource', async () => {
      renderWithRole('admin');

      const resourceTabBtn = screen.getByRole('button', { name: /Official Resources/i });
      fireEvent.click(resourceTabBtn);

      expect(screen.getByText(/Ayushman Bharat PM-JAY Specialty Care Package Guidelines/i)).toBeInTheDocument();

      // Click "Add Resource"
      const addResourceBtn = screen.getByRole('button', { name: /Add Resource/i });
      fireEvent.click(addResourceBtn);

      await waitFor(() => {
        expect(screen.getByText(/Add Official Public Resource/i)).toBeInTheDocument();
      });

      // Fill in form
      const titleInput = screen.getByPlaceholderText(/e\.g\. Ayushman Bharat PM-JAY/i);
      fireEvent.change(titleInput, { target: { value: 'State Organ Allocation Policy 2026' } });

      const authorityInput = screen.getByPlaceholderText(/e\.g\. National Health Authority/i);
      fireEvent.change(authorityInput, { target: { value: 'State Organ Agency' } });

      const descInput = screen.getByPlaceholderText(/Covers up to ₹5 Lakhs/i);
      fireEvent.change(descInput, { target: { value: 'Official state government guidelines for swap donation.' } });

      const urlInput = screen.getByPlaceholderText(/https:\/\/pmjay\.gov\.in/i);
      fireEvent.change(urlInput, { target: { value: 'https://health.state.gov.in' } });

      const submitBtn = screen.getByRole('button', { name: /Publish Resource/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Official resource "State Organ Allocation Policy 2026" published/i)).toBeInTheDocument();
        const logs = getStoredAuditLogs();
        const resourceLog = logs.find((l) => l.action === 'OFFICIAL_RESOURCE_CREATED');
        expect(resourceLog).toBeDefined();
      });
    });
  });

  describe('5. Patient Request Oversight', () => {
    it('oversees assistance requests, allowing status update and volunteer assignment', async () => {
      renderWithRole('admin');

      const requestTabBtn = screen.getByRole('button', { name: /Request Oversight/i });
      fireEvent.click(requestTabBtn);

      expect(screen.getByText(/Coordination Oversight/i)).toBeInTheDocument();
      expect(screen.getByText(/Rajesh Sharma/i)).toBeInTheDocument();

      // Click Manage Case on first request
      const manageBtns = screen.getAllByRole('button', { name: /Manage Case/i });
      fireEvent.click(manageBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/Support Requested:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Case Status \*/i)).toBeInTheDocument();
      });

      // Save updates
      const applyUpdatesBtn = screen.getByRole('button', { name: /Apply Case Updates/i });
      fireEvent.click(applyUpdatesBtn);

      await waitFor(() => {
        expect(screen.getByText(/Assistance request for Rajesh Sharma updated/i)).toBeInTheDocument();
        const logs = getStoredAuditLogs();
        const reqLog = logs.find((l) => l.action === 'ADMIN_REQUEST_OVERSIGHT_UPDATED');
        expect(reqLog).toBeDefined();
      });
    });
  });

  describe('6. Immutable Audit Trail Inspection', () => {
    it('displays audit history, supports search, and inspects JSON payload snapshots', async () => {
      renderWithRole('admin');

      const auditTabBtn = screen.getByRole('button', { name: /Audit Trail/i });
      fireEvent.click(auditTabBtn);

      expect(screen.getByText(/Immutable Security Audit Log/i)).toBeInTheDocument();
      expect(screen.getByText(/Total entries recorded/i)).toBeInTheDocument();

      // Click "Inspect" button to inspect metadata snapshot
      const inspectBtns = screen.getAllByRole('button', { name: /Inspect/i });
      expect(inspectBtns.length).toBeGreaterThan(0);
      fireEvent.click(inspectBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/Audit Log Event Inspection/i)).toBeInTheDocument();
        expect(screen.getByText(/Payload Snapshot \(JSON\):/i)).toBeInTheDocument();
      });

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Close Inspection/i });
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Audit Log Event Inspection/i)).not.toBeInTheDocument();
      });
    });
  });
});
