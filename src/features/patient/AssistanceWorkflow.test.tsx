import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { HospitalStaffPortal } from '../../features/hospital/HospitalStaffPortal';
import { ExpensePlanner } from '../../features/patient/ExpensePlanner';
import { SupportRequestTracker } from '../../features/patient/SupportRequestTracker';
import { RequestSupportModal } from '../../features/support/RequestSupportModal';
import {
  getStoredAuditLogs,
  getStoredExpensePlan,
  getStoredRequests,
  saveStoredExpensePlan,
  saveStoredRequests
} from '../../lib/store';
import { AssistanceRequest, ExpensePlan } from '../../types';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const RoleSwitcher: React.FC<{ roleToSet: 'patient' | 'hospital_staff' | 'admin' | 'volunteer' }> = ({
  roleToSet
}) => {
  const { switchRole } = useAuth();
  React.useEffect(() => {
    switchRole(roleToSet);
  }, [roleToSet, switchRole]);
  return null;
};

const renderWithRole = (
  ui: React.ReactElement,
  role: 'patient' | 'hospital_staff' | 'admin' | 'volunteer' = 'patient'
) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleSwitcher roleToSet={role} />
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Assistance Request Workflow & Expense Planner Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Assistance Request Submission & Input Validation', () => {
    it('validates required fields before accepting assistance submission', async () => {
      renderWithRole(
        <RequestSupportModal
          isOpen={true}
          onClose={() => {}}
          onRequestSubmitted={() => {}}
        />,
        'patient'
      );

      // Verify Non-Clinical Boundary notice is rendered
      expect(screen.getByText(/Volunteers provide logistical and emotional accompaniment only/i)).toBeInTheDocument();

      // Clear input fields and submit to test Zod validation errors
      const nameInput = screen.getByPlaceholderText(/e\.g\. Ramesh Kumar/i);
      const phoneInput = screen.getByPlaceholderText(/e\.g\. \+91 98765 43210/i);
      const hospitalInput = screen.getByPlaceholderText(/e\.g\. AIIMS New Delhi/i);
      const submitBtn = screen.getByRole('button', { name: /Submit Support Request/i });

      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.change(phoneInput, { target: { value: '' } });
      fireEvent.change(hospitalInput, { target: { value: '' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Please enter the patient or caregiver full name/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter a valid 10-digit mobile number/i)).toBeInTheDocument();
        expect(screen.getByText(/Please specify the registered hospital or city/i)).toBeInTheDocument();
      });
    });

    it('submits valid non-clinical support request and records audit log', async () => {
      renderWithRole(
        <RequestSupportModal
          isOpen={true}
          onClose={() => {}}
          onRequestSubmitted={() => {}}
        />,
        'patient'
      );

      const nameInput = screen.getByPlaceholderText(/e\.g\. Ramesh Kumar/i);
      const phoneInput = screen.getByPlaceholderText(/e\.g\. \+91 98765 43210/i);
      const hospitalInput = screen.getByPlaceholderText(/e\.g\. AIIMS New Delhi/i);
      const notesInput = screen.getByPlaceholderText(/Provide any specific context/i);
      const submitBtn = screen.getByRole('button', { name: /Submit Support Request/i });

      fireEvent.change(nameInput, { target: { value: 'Sunil Verma' } });
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
      fireEvent.change(hospitalInput, { target: { value: 'PGIMER Chandigarh' } });
      fireEvent.change(notesInput, { target: { value: 'Assistance needed with Form 1 notary attestation' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Support Request Submitted Successfully/i)).toBeInTheDocument();
      });

      // Verify persistence in store
      const requests = getStoredRequests();
      const created = requests.find((r) => r.patientName === 'Sunil Verma');
      expect(created).toBeDefined();
      expect(created?.hospitalName).toBe('PGIMER Chandigarh');
      expect(created?.status).toBe('submitted');

      // Verify audit trail entry
      const auditLogs = getStoredAuditLogs();
      const log = auditLogs.find((l) => l.action === 'ASSISTANCE_REQUEST_CREATED');
      expect(log).toBeDefined();
      expect(log?.targetTable).toBe('assistance_requests');
    });
  });

  describe('Request History, Lifecycle Timeline & Cancellation', () => {
    it('displays request history with lifecycle timeline and assigned volunteer', async () => {
      renderWithRole(<SupportRequestTracker />, 'patient');

      // Header and Statutory Notice
      expect(screen.getByText(/Non-Clinical Support Requests & History/i)).toBeInTheDocument();
      expect(screen.getByText(/Non-Clinical Support Scope:/i)).toBeInTheDocument();
      expect(screen.getByText(/Financial assistance is not guaranteed/i)).toBeInTheDocument();

      // Displays pre-seeded requests
      expect(screen.getByText(/Rajesh Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/All India Institute of Medical Sciences \(AIIMS\)/i)).toBeInTheDocument();

      // Lifecycle progression steps
      expect(screen.getByText(/Request Lifecycle Timeline/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Submitted/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Assigned/i).length).toBeGreaterThan(0);

      // Volunteer information
      expect(screen.getByText(/Assigned Volunteer: Arun Varma/i)).toBeInTheDocument();
      expect(screen.getByText(/Call Navigator/i)).toBeInTheDocument();
    });

    it('allows patient to cancel pending request with confirmation and audit log', async () => {
      // Seed a pending request for current demo-patient
      const pendingReq: AssistanceRequest = {
        id: 'req-pending-test',
        patientId: 'demo-patient',
        patientName: 'Rajesh Sharma',
        contactPhone: '+91-98765-43210',
        organCategory: 'kidney',
        hospitalName: 'Safdarjung Hospital',
        supportType: 'Wayfinding & Logistics',
        notes: 'Needs help finding nephrology OPD counter',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveStoredRequests([pendingReq, ...getStoredRequests()]);

      renderWithRole(<SupportRequestTracker />, 'patient');

      // Find Cancel Request button for pending request
      const cancelBtns = screen.getAllByRole('button', { name: /Cancel Request/i });
      expect(cancelBtns.length).toBeGreaterThan(0);
      fireEvent.click(cancelBtns[0]);

      // Confirm dialog appears
      expect(screen.getByText(/Confirm Request Cancellation/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Confirm Cancellation/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        const auditLogs = getStoredAuditLogs();
        const cancelLog = auditLogs.find((l) => l.action === 'REQUEST_CANCELLED_BY_PATIENT');
        expect(cancelLog).toBeDefined();
        expect(cancelLog?.targetId).toBe('req-pending-test');
      });
    });
  });

  describe('Coordinator Volunteer Assignment & RBAC Permissions', () => {
    it('allows authorized hospital coordinator to assign volunteer with notes', async () => {
      // Seed unassigned request
      const unassignedReq: AssistanceRequest = {
        id: 'req-unassigned-coord',
        patientId: 'patient-patna-01',
        patientName: 'Anil Kumar (Patna Caregiver)',
        contactPhone: '+91-98350-11223',
        organCategory: 'liver',
        hospitalName: 'AIIMS Apex Transplant Center',
        supportType: 'Wayfinding & Logistics',
        notes: 'Arriving by train tomorrow; needs guide from gate to ILBS OPD',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveStoredRequests([unassignedReq, ...getStoredRequests()]);

      renderWithRole(<HospitalStaffPortal />, 'hospital_staff');

      // Switch to Volunteer Assignment tab
      const assignmentTabBtn = screen.getByRole('button', { name: /Patient Support Requests & Volunteer Assignment/i });
      fireEvent.click(assignmentTabBtn);

      expect(screen.getByText(/Anil Kumar \(Patna Caregiver\)/i)).toBeInTheDocument();

      // Click Assign Volunteer
      const assignBtns = screen.getAllByRole('button', { name: /Assign Volunteer/i });
      fireEvent.click(assignBtns[0]);

      // Assignment modal appears
      expect(screen.getByText(/Assign Volunteer Saathi/i)).toBeInTheDocument();
      expect(screen.getByText(/Select Verified Peer Volunteer Navigator/i)).toBeInTheDocument();

      // Submit assignment
      const confirmAssignBtn = screen.getByRole('button', { name: /Confirm Volunteer Assignment/i });
      fireEvent.click(confirmAssignBtn);

      await waitFor(() => {
        expect(screen.getByText(/Successfully assigned/i)).toBeInTheDocument();
      });

      // Verify audit log
      const auditLogs = getStoredAuditLogs();
      const assignLog = auditLogs.find((l) => l.action === 'VOLUNTEER_ASSIGNED_BY_COORDINATOR');
      expect(assignLog).toBeDefined();
      expect(assignLog?.actorRole).toBe('hospital_staff');
    });

    it('blocks unauthorized patient role from accessing coordinator assignment portal', async () => {
      renderWithRole(<HospitalStaffPortal />, 'patient');

      expect(screen.getByText(/Access to inpatient clinical tracking records and volunteer assignment is restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/Switch to Dr. Priya Raman \(Hospital Coordinator\)/i)).toBeInTheDocument();
    });
  });

  describe('Expense Planner & Financial Variance Analysis', () => {
    it('prominently states financial assistance is not guaranteed', () => {
      renderWithRole(<ExpensePlanner />, 'patient');

      expect(screen.getByText(/Statutory Notice: Financial Assistance is Not Guaranteed/i)).toBeInTheDocument();
      expect(screen.getByText(/Financial assistance or grant approvals are NOT guaranteed by Transplant Saathi/i)).toBeInTheDocument();
    });

    it('creates, edits, and tracks actual vs estimated expense variance', async () => {
      renderWithRole(<ExpensePlanner />, 'patient');

      // Check baseline metrics
      expect(screen.getByText(/Transplant Expense & Financial Planning/i)).toBeInTheDocument();
      expect(screen.getByText(/Cost Variance Analysis/i)).toBeInTheDocument();

      // Open Add Item Modal
      const addItemBtn = screen.getByRole('button', { name: /Add Expense Item/i });
      fireEvent.click(addItemBtn);

      const descInput = screen.getByPlaceholderText(/HLA high-resolution typing/i);
      expect(descInput).toBeInTheDocument();
      const amountInput = screen.getByPlaceholderText(/e\.g\. 45000/i);
      const saveItemBtn = screen.getByRole('button', { name: /^Add Item$/i });

      fireEvent.change(descInput, { target: { value: 'Post-Op CMV Viral Load Monitoring' } });
      fireEvent.change(amountInput, { target: { value: '18000' } });
      fireEvent.click(saveItemBtn);

      // Verify item rendered in table
      await waitFor(() => {
        expect(screen.getByText(/Post-Op CMV Viral Load Monitoring/i)).toBeInTheDocument();
      });

      // Verify audit log for creation
      const auditLogsAfterCreate = getStoredAuditLogs();
      const createLog = auditLogsAfterCreate.find((l) => l.action === 'EXPENSE_ITEM_CREATED');
      expect(createLog).toBeDefined();

      // Edit the expense item: record actual invoice amount
      const editButtons = screen.getAllByTitle(/Edit Item/i);
      fireEvent.click(editButtons[0]);

      expect(screen.getByText(/Edit Expense Item & Record Invoice/i)).toBeInTheDocument();

      const editActualInput = screen.getByLabelText(/Actual Amount Paid/i);
      const editReceiptInput = screen.getByPlaceholderText(/e\.g\. AIIMS-BIL-2026-901/i);
      const saveChangesBtn = screen.getByRole('button', { name: /Save Changes/i });

      fireEvent.change(editActualInput, { target: { value: '46000' } });
      fireEvent.change(editReceiptInput, { target: { value: 'INV-TEST-4411' } });
      fireEvent.click(saveChangesBtn);

      await waitFor(() => {
        const auditLogsAfterEdit = getStoredAuditLogs();
        const updateLog = auditLogsAfterEdit.find((l) => l.action === 'EXPENSE_ITEM_UPDATED');
        expect(updateLog).toBeDefined();
      });
    });

    it('deletes an expense item and logs audit trail', async () => {
      // Seed a distinct plan with disposable item
      const testPlan: ExpensePlan = {
        ...getStoredExpensePlan('demo-patient'),
        items: [
          {
            id: 'item-to-delete-test',
            planId: 'exp-plan-001',
            category: 'lodging_travel',
            categoryLabel: 'Lodging',
            description: 'Temporary Hotel Booking',
            estimatedAmount: 12000,
            actualAmount: 0,
            isPaid: false
          }
        ]
      };
      saveStoredExpensePlan(testPlan);

      renderWithRole(<ExpensePlanner />, 'patient');

      expect(screen.getByText(/Temporary Hotel Booking/i)).toBeInTheDocument();

      const deleteBtn = screen.getByTitle(/Delete Item/i);
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Temporary Hotel Booking/i)).not.toBeInTheDocument();
        const auditLogs = getStoredAuditLogs();
        const deleteLog = auditLogs.find((l) => l.action === 'EXPENSE_ITEM_DELETED');
        expect(deleteLog).toBeDefined();
      });
    });
  });
});
