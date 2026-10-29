import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { VolunteerPortal } from '../../features/volunteer/VolunteerPortal';
import { VolunteerRequestDetailPage } from '../../features/volunteer/VolunteerRequestDetailPage';
import {
  getAssistanceRequestForVolunteer,
  getStoredAuditLogs,
  getVolunteerAssignedRequests
} from '../../lib/store';
import { UserProfile } from '../../types';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const RoleSwitcher: React.FC<{ roleToSet: 'volunteer' | 'hospital_staff' | 'admin' | 'patient' }> = ({
  roleToSet
}) => {
  const { switchRole } = useAuth();
  React.useEffect(() => {
    switchRole(roleToSet);
  }, [roleToSet, switchRole]);
  return null;
};

const renderWithRoleAndRoute = (
  initialRoute: string,
  role: 'volunteer' | 'hospital_staff' | 'admin' | 'patient' = 'volunteer'
) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleSwitcher roleToSet={role} />
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/volunteer" element={<VolunteerPortal />} />
            <Route path="/volunteer/requests/:id" element={<VolunteerRequestDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Volunteer Portal & Least Privilege Security Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Assigned Requests & Task Progress Workflow', () => {
    it('displays only requests assigned to the logged-in volunteer', async () => {
      renderWithRoleAndRoute('/volunteer', 'volunteer');

      // Title & Volunteer Saathi Banner
      expect(screen.getByText(/Volunteer Saathi Coordination Hub/i)).toBeInTheDocument();
      expect(screen.getByText(/Patient Support & Accompaniment Queue/i)).toBeInTheDocument();

      // Assigned to demo-volunteer: Rajesh Sharma (req-101)
      expect(screen.getByText(/Rajesh Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/All India Institute of Medical Sciences \(AIIMS\)/i)).toBeInTheDocument();

      // Must NOT display requests belonging to other volunteers or unassigned pool in the active list
      expect(screen.queryByText(/Deepak Joshi/i)).not.toBeInTheDocument(); // req-104 assigned to Meera Deshmukh
      expect(screen.queryByText(/Kavita Patel/i)).not.toBeInTheDocument(); // req-102 unassigned
    });

    it('advances task status from assigned to in_progress to completed with resolution notes', async () => {
      renderWithRoleAndRoute('/volunteer', 'volunteer');

      // Click "Start Task"
      const startTaskBtn = screen.getByRole('button', { name: /Start Task/i });
      fireEvent.click(startTaskBtn);

      await waitFor(() => {
        expect(screen.getByText(/IN PROGRESS/i)).toBeInTheDocument();
        const logs = getStoredAuditLogs();
        const updateLog = logs.find((l) => l.action === 'VOLUNTEER_STATUS_UPDATED');
        expect(updateLog).toBeDefined();
        expect(updateLog?.details?.newStatus).toBe('in_progress');
      });

      // Click "Complete"
      const completeBtn = screen.getByRole('button', { name: /^Complete$/i });
      fireEvent.click(completeBtn);

      // Completion modal appears
      expect(screen.getByText(/Confirm Task Completion/i)).toBeInTheDocument();

      const notesTextarea = screen.getByPlaceholderText(/e\.g\. Patient successfully attested Form 1/i);
      fireEvent.change(notesTextarea, {
        target: { value: 'Accompanied patient to AIIMS Gate 2. Form 1 joint affidavit completed with JMFC stamp.' }
      });

      const confirmBtn = screen.getByRole('button', { name: /Confirm Completion/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        const logs = getStoredAuditLogs();
        const compLog = logs.find((l) => l.action === 'VOLUNTEER_TASK_COMPLETED');
        expect(compLog).toBeDefined();
        expect(compLog?.targetId).toBe('req-101');
      });
    });

    it('displays completion history tab with completed tasks', async () => {
      renderWithRoleAndRoute('/volunteer', 'volunteer');

      const completionTabBtn = screen.getByRole('button', { name: /Completion History/i });
      fireEvent.click(completionTabBtn);

      // Manoj Tiwari (req-103) was completed by demo-volunteer
      expect(screen.getByText(/Manoj Tiwari/i)).toBeInTheDocument();
      expect(screen.getByText(/Safdarjung Hospital/i)).toBeInTheDocument();
    });
  });

  describe('URL Manipulation & Direct Database Access Protection', () => {
    it('blocks volunteer from accessing unassigned requests via URL manipulation (403)', async () => {
      // req-102 is unassigned in synthetic seed
      renderWithRoleAndRoute('/volunteer/requests/req-102', 'volunteer');

      // Verify 403 Forbidden state is rendered
      expect(screen.getByText(/403 — Unauthorized Record Access/i)).toBeInTheDocument();
      expect(screen.getByText(/Access Denied: Restricted Case Dossier/i)).toBeInTheDocument();

      // Sensitive patient contact must NOT be leaked
      expect(screen.queryByText(/\+91-98222-33445/i)).not.toBeInTheDocument();

      // Verify unauthorized attempt logged in audit ledger
      const auditLogs = getStoredAuditLogs();
      const breachAttempt = auditLogs.find((l) => l.action === 'UNAUTHORIZED_RECORD_ACCESS_ATTEMPT');
      expect(breachAttempt).toBeDefined();
      expect(breachAttempt?.targetId).toBe('req-102');
      expect(breachAttempt?.details?.violationType).toBe('VOLUNTEER_LEAST_PRIVILEGE_BREACH_PREVENTED');
    });

    it('blocks volunteer from accessing another volunteer assigned request via URL manipulation (403)', async () => {
      // req-104 is assigned to Meera Deshmukh (vol-mumbai-02)
      renderWithRoleAndRoute('/volunteer/requests/req-104', 'volunteer');

      expect(screen.getByText(/403 — Unauthorized Record Access/i)).toBeInTheDocument();
      expect(screen.getByText(/Access Denied: Restricted Case Dossier/i)).toBeInTheDocument();

      // Verify Deepak Joshi details are not exposed
      expect(screen.queryByText(/Deepak Joshi/i)).not.toBeInTheDocument();

      const auditLogs = getStoredAuditLogs();
      const breachAttempt = auditLogs.find(
        (l) => l.action === 'UNAUTHORIZED_RECORD_ACCESS_ATTEMPT' && l.targetId === 'req-104'
      );
      expect(breachAttempt).toBeDefined();
    });

    it('allows volunteer to access their own assigned case dossier via URL', async () => {
      // req-101 is assigned to demo-volunteer (Arun Varma)
      renderWithRoleAndRoute('/volunteer/requests/req-101', 'volunteer');

      expect(screen.getByText(/Rajesh Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/All India Institute of Medical Sciences \(AIIMS\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Coordinator Triage & Handover Instructions/i)).toBeInTheDocument();
      expect(screen.getByText(/Task Status Management/i)).toBeInTheDocument();
    });

    it('blocks volunteers from viewing unassigned pool from tab switcher', async () => {
      renderWithRoleAndRoute('/volunteer', 'volunteer');

      const unassignedBtn = screen.getByRole('button', { name: /Unassigned Pool/i });
      fireEvent.click(unassignedBtn);

      expect(screen.getByText(/Access Restricted: Coordinator Triage Required/i)).toBeInTheDocument();
      expect(screen.getByText(/Volunteers may only view cases specifically assigned to them/i)).toBeInTheDocument();
    });
  });

  describe('Direct Database / Store Isolation API Unit Tests', () => {
    const mockVolunteerUser: UserProfile = {
      id: 'demo-volunteer',
      email: 'volunteer.arun@saathi-volunteer.org',
      fullName: 'Arun Varma',
      role: 'volunteer',
      isActive: true,
      createdAt: '2026-02-01T12:00:00Z'
    };

    it('enforces least privilege in getAssistanceRequestForVolunteer API', () => {
      // Calling with assigned request: success
      const allowedResult = getAssistanceRequestForVolunteer('req-101', mockVolunteerUser);
      expect(allowedResult.request).toBeDefined();
      expect(allowedResult.request?.id).toBe('req-101');
      expect(allowedResult.isUnauthorized).toBeUndefined();

      // Calling with unassigned request: blocked & unauthorized
      const unassignedResult = getAssistanceRequestForVolunteer('req-102', mockVolunteerUser);
      expect(unassignedResult.request).toBeNull();
      expect(unassignedResult.isUnauthorized).toBe(true);

      // Calling with other volunteer's request: blocked & unauthorized
      const otherVolunteerResult = getAssistanceRequestForVolunteer('req-104', mockVolunteerUser);
      expect(otherVolunteerResult.request).toBeNull();
      expect(otherVolunteerResult.isUnauthorized).toBe(true);
    });

    it('filters strictly by volunteerId in getVolunteerAssignedRequests', () => {
      const assigned = getVolunteerAssignedRequests('demo-volunteer');
      expect(assigned.every((r) => r.assignedVolunteerId === 'demo-volunteer')).toBe(true);

      const requestIds = assigned.map((r) => r.id);
      expect(requestIds).toContain('req-101');
      expect(requestIds).toContain('req-103');
      expect(requestIds).not.toContain('req-102');
      expect(requestIds).not.toContain('req-104');
    });
  });
});
