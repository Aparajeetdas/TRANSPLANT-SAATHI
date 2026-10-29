import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  Filter,
  HeartHandshake,
  Hospital,
  MapPin,
  Plus,
  Scale,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ErrorMessage } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { VERIFIED_HOSPITALS, VETTED_VOLUNTEERS } from '../../lib/mockData';
import {
  getStoredIntakes,
  getStoredRequests,
  recordAuditLog,
  saveStoredIntakes,
  saveStoredRequests
} from '../../lib/store';
import { AssistanceRequest, HospitalIntakeRecord, OrganType, VerifiedHospital } from '../../types';
import { HospitalCoordinationDesk } from './HospitalCoordinationDesk';

// Zod validation schemas
const intakeSchema = z.object({
  organCategory: z.enum(['kidney', 'liver', 'heart', 'lungs', 'cornea', 'pancreas', 'bone_marrow']),
  donorRelationType: z.enum(['Near Relative (Living)', 'Spouse', 'Other / Swap', 'Deceased Candidate List']),
  thotaComplianceStatus: z.enum([
    'Form 1 Verified',
    'Awaiting Authorization Committee',
    'Committee Cleared',
    'Pending HLA Report'
  ]),
  committeeMeetingDate: z.string().optional(),
  notes: z.string().min(5, 'Please provide clinical coordination notes')
});

type IntakeFormData = z.infer<typeof intakeSchema>;

const assignmentSchema = z.object({
  volunteerId: z.string().min(1, 'Please select a vetted volunteer navigator'),
  coordinatorNotes: z.string().min(3, 'Please provide brief triage/handover notes for the volunteer')
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

let counter = 100;
function createSyntheticCode(organ: string): string {
  counter += 1;
  const organPrefix = organ.substring(0, 2).toUpperCase();
  return `SYN-PAT-2026-${organPrefix}-${counter}`;
}

interface HospitalStaffPortalProps {
  initialTab?: 'assistance_coordination' | 'volunteer_assignment' | 'compliance';
}

export const HospitalStaffPortal: React.FC<HospitalStaffPortalProps> = ({
  initialTab = 'compliance'
}) => {
  const { currentUser, isHospitalStaff, isAdmin, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'assistance_coordination' | 'volunteer_assignment' | 'compliance'>(initialTab);
  const [intakes, setIntakes] = useState<HospitalIntakeRecord[]>(() => getStoredIntakes());
  const [requests, setRequests] = useState<AssistanceRequest[]>(() => getStoredRequests());
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [filterOrgan, setFilterOrgan] = useState<string>('all');
  const [filterRequestStatus, setFilterRequestStatus] = useState<string>('all');

  // Assignment Modal State
  const [selectedRequestForAssignment, setSelectedRequestForAssignment] = useState<AssistanceRequest | null>(null);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Case Intake Form
  const {
    register: registerIntake,
    handleSubmit: handleSubmitIntake,
    reset: resetIntake,
    formState: { errors: intakeErrors }
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      organCategory: 'kidney',
      donorRelationType: 'Near Relative (Living)',
      thotaComplianceStatus: 'Form 1 Verified',
      committeeMeetingDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  // Volunteer Assignment Form
  const {
    register: registerAssignment,
    handleSubmit: handleSubmitAssignment,
    reset: resetAssignment,
    setValue: setAssignmentValue,
    control: assignmentControl,
    formState: { errors: assignmentErrors, isSubmitting: isAssigning }
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      volunteerId: 'demo-volunteer',
      coordinatorNotes: ''
    }
  });

  const selectedVolunteerId = useWatch({ control: assignmentControl, name: 'volunteerId' });
  const currentVolunteer = VETTED_VOLUNTEERS.find((v) => v.id === selectedVolunteerId);

  // Role Security Guard
  const hasAccess = isHospitalStaff || isAdmin;

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
            Hospital Transplant Nodal Desk
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Access to inpatient clinical tracking records and volunteer assignment is restricted to authorized hospital nodal coordinators.
          </p>
        </div>

        <ErrorMessage
          isPermissionDenied
          message={`Your current role is ${currentUser?.role || 'Guest'}. Access requires authorized Hospital Coordinator or Administrator credentials under clinical audit rules.`}
        />

        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center space-y-4">
          <h4 className="text-base font-bold text-[#0F172A] font-heading">
            Prototype Role Demonstration
          </h4>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Switch your profile to the verified Hospital Coordinator persona to inspect the clinical compliance tracker and assign volunteers.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => switchRole('hospital_staff')}
          >
            Switch to Dr. Priya Raman (Hospital Coordinator)
          </Button>
        </div>
      </div>
    );
  }

  // Institutional Verification Guard
  if (currentUser?.role === 'hospital_staff' && currentUser?.hospitalVerificationStatus === 'pending') {
    return (
      <div className="space-y-6 text-left max-w-4xl mx-auto py-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
            Hospital Transplant Nodal Desk
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Institutional verification is required before hospital coordination privileges are activated.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Institutional Verification Under Review
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your registration application for <strong>"{currentUser.organization || 'Healthcare Facility'}"</strong> is currently pending statutory review under THOTA 1994. Selecting "Hospital" during registration does not automatically grant hospital staff privileges.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed space-y-1">
            <strong>Statutory Rule (Section 14, THOTA 1994):</strong>
            <p>
              Platform administrators must verify official registration certificates, gazette notifications, and nodal appointment credentials before institutional staff may view private patient assistance requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Resolve coordinator's institution
  const userHospital: VerifiedHospital =
    VERIFIED_HOSPITALS.find(
      (h) =>
        (currentUser?.hospitalRegistrationNumber &&
          h.registrationNumber === currentUser.hospitalRegistrationNumber) ||
        (currentUser?.organization &&
          (h.name.toLowerCase().includes(currentUser.organization.toLowerCase().substring(0, 15)) ||
            currentUser.organization.toLowerCase().includes(h.name.toLowerCase().substring(0, 15))))
    ) || VERIFIED_HOSPITALS[0];

  // Submit synthetic case
  const onIntakeSubmit = (data: IntakeFormData) => {
    if (!currentUser) return;

    const syntheticCode = createSyntheticCode(data.organCategory);

    const newRecord: HospitalIntakeRecord = {
      id: `intake-${counter}`,
      hospitalId: 'hosp-001',
      anonymousPatientCode: syntheticCode,
      organCategory: data.organCategory as OrganType,
      donorRelationType: data.donorRelationType,
      thotaComplianceStatus: data.thotaComplianceStatus,
      committeeMeetingDate: data.committeeMeetingDate,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...intakes];
    setIntakes(updated);
    saveStoredIntakes(updated);

    recordAuditLog(currentUser, 'HOSPITAL_INTAKE_RECORD_CREATED', 'hospital_intake_records', newRecord.id, {
      syntheticCode,
      organ: data.organCategory,
      status: data.thotaComplianceStatus
    });

    resetIntake();
    setIsCaseModalOpen(false);
  };

  // Open Assignment Modal
  const openAssignmentModal = (req: AssistanceRequest) => {
    // Role verification
    if (!isHospitalStaff && !isAdmin) {
      setAssignmentError('Unauthorized: Only authorized coordinators can assign volunteers.');
      return;
    }
    setSelectedRequestForAssignment(req);
    setAssignmentError(null);
    setAssignmentSuccessMsg(null);
    setAssignmentValue('volunteerId', VETTED_VOLUNTEERS[0].id);
    setAssignmentValue('coordinatorNotes', `Assigned for ${req.supportType} accompaniment at ${req.hospitalName}. Please connect with patient directly.`);
  };

  // Submit Volunteer Assignment
  const onAssignmentSubmit = (data: AssignmentFormData) => {
    if (!selectedRequestForAssignment || !currentUser) return;

    // Verify authorized role
    if (!isHospitalStaff && !isAdmin) {
      setAssignmentError('Permission Denied: Coordinator or Admin role required.');
      return;
    }

    const volunteer = VETTED_VOLUNTEERS.find((v) => v.id === data.volunteerId);
    if (!volunteer) {
      setAssignmentError('Selected volunteer was not found in the verified roster.');
      return;
    }

    const assignedAt = new Date().toISOString();
    const updated = requests.map((r) => {
      if (r.id === selectedRequestForAssignment.id) {
        return {
          ...r,
          status: 'assigned' as const,
          assignedVolunteerId: volunteer.id,
          assignedVolunteerName: volunteer.name,
          coordinatorNotes: data.coordinatorNotes,
          assignedAt,
          updatedAt: assignedAt
        };
      }
      return r;
    });

    setRequests(updated);
    saveStoredRequests(updated);

    // Record audit log
    recordAuditLog(
      currentUser,
      'VOLUNTEER_ASSIGNED_BY_COORDINATOR',
      'assistance_requests',
      selectedRequestForAssignment.id,
      {
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        volunteerOrganization: volunteer.organization,
        patientName: selectedRequestForAssignment.patientName,
        coordinatorNotes: data.coordinatorNotes
      }
    );

    setAssignmentSuccessMsg(`Successfully assigned ${volunteer.name} to ${selectedRequestForAssignment.patientName}'s request.`);
    setTimeout(() => {
      setSelectedRequestForAssignment(null);
      setAssignmentSuccessMsg(null);
      resetAssignment();
    }, 1200);
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (filterRequestStatus === 'all') return true;
    if (filterRequestStatus === 'unassigned') return r.status === 'submitted';
    if (filterRequestStatus === 'assigned') return r.status === 'assigned' || r.status === 'in_progress';
    if (filterRequestStatus === 'completed') return r.status === 'completed';
    return true;
  });

  const filteredIntakes = intakes.filter((rec) => {
    if (filterOrgan === 'all') return true;
    return rec.organCategory === filterOrgan;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Title & Portal Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
            <Hospital className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Authorized Institutional Portal & Coordinator Desk</span>
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
            Hospital Coordinator & Ethics Committee Tracker
          </h2>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Logged in as <strong>{currentUser?.fullName}</strong> ({currentUser?.organization || 'Apex Center Coordinator'}). Manage volunteer triage assignments and clinical THOTA compliance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'compliance' && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCaseModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Synthetic Case Record
            </Button>
          )}
        </div>
      </div>

      {/* Statutory Mandate Reminder */}
      <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/30 flex items-start gap-3">
        <Scale className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0F172A] leading-relaxed">
          <span className="font-bold">Statutory Mandate & Governance: </span>
          Volunteers assigned by hospital coordinators provide administrative wayfinding and paperwork assistance only. Coordinators must ensure volunteers never advise patients on clinical suitability or make financial commitments. Financial assistance is not guaranteed.
        </div>
      </div>

      {/* Portal Tab Switcher */}
      <div className="flex border-b border-[#E2E8F0] gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('assistance_coordination')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'assistance_coordination'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Hospital className="w-4 h-4" />
          Transplant Assistance Requests
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('volunteer_assignment')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'volunteer_assignment'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Patient Support Requests & Volunteer Assignment ({requests.filter(r => r.status === 'submitted').length} Pending)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'compliance'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Scale className="w-4 h-4" />
          Clinical Compliance & THOTA Cases ({intakes.length})
        </button>
      </div>

      {/* TAB 1: TRANSPLANT ASSISTANCE REQUESTS */}
      {activeTab === 'assistance_coordination' && (
        <HospitalCoordinationDesk hospital={userHospital} />
      )}

      {/* TAB 1: VOLUNTEER ASSIGNMENT */}
      {activeTab === 'volunteer_assignment' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
                Filter by Status:
              </span>
              <select
                value={filterRequestStatus}
                onChange={(e) => setFilterRequestStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All Statuses ({requests.length})</option>
                <option value="unassigned">Unassigned / Pending Match ({requests.filter(r => r.status === 'submitted').length})</option>
                <option value="assigned">Assigned / In Progress ({requests.filter(r => r.status === 'assigned' || r.status === 'in_progress').length})</option>
                <option value="completed">Completed ({requests.filter(r => r.status === 'completed').length})</option>
              </select>
            </div>

            <div className="text-xs text-[#64748B]">
              Showing <strong className="text-[#0F172A]">{filteredRequests.length}</strong> patient assistance requests
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3.5">Request Ref</th>
                    <th className="px-5 py-3.5">Patient / Family</th>
                    <th className="px-5 py-3.5">Organ & Type</th>
                    <th className="px-5 py-3.5">Hospital Facility</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Assigned Volunteer</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredRequests.map((req) => {
                    const isUnassigned = req.status === 'submitted';
                    return (
                      <tr key={req.id} className="hover:bg-[#F4F8FF]/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-[#0F172A] whitespace-nowrap">
                          {req.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#0F172A]">{req.patientName}</div>
                          <div className="text-[11px] text-[#64748B]">{req.contactPhone}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="uppercase font-bold text-[#2563EB]">{req.organCategory}</div>
                          <div className="text-[11px] text-[#64748B]">{req.supportType}</div>
                        </td>
                        <td className="px-5 py-4 text-[#0F172A] max-w-xs">
                          {req.hospitalName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              req.status === 'completed'
                                ? 'navy'
                                : req.status === 'assigned' || req.status === 'in_progress'
                                ? 'primary'
                                : req.status === 'cancelled'
                                ? 'outline'
                                : 'subtle'
                            }
                          >
                            {req.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {req.assignedVolunteerName ? (
                            <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                              <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>{req.assignedVolunteerName}</span>
                            </div>
                          ) : (
                            <span className="text-[#64748B] italic">Awaiting Volunteer</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <Button
                            variant={isUnassigned ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => openAssignmentModal(req)}
                          >
                            {isUnassigned ? 'Assign Volunteer' : 'Reassign / Edit'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL THOTA COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Filter and Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A]">Filter by Organ:</span>
              <select
                value={filterOrgan}
                onChange={(e) => setFilterOrgan(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All Programs</option>
                <option value="kidney">Kidney</option>
                <option value="liver">Liver</option>
                <option value="heart">Heart</option>
                <option value="lungs">Lungs</option>
              </select>
            </div>

            <div className="text-xs text-[#64748B]">
              Displaying <span className="font-bold text-[#0F172A]">{filteredIntakes.length}</span> compliance dossiers
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3.5">Case Code (Synthetic)</th>
                    <th className="px-5 py-3.5">Organ Program</th>
                    <th className="px-5 py-3.5">Donor Pathway</th>
                    <th className="px-5 py-3.5">THOTA Compliance Status</th>
                    <th className="px-5 py-3.5">Committee Review Date</th>
                    <th className="px-5 py-3.5">Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredIntakes.map((intake) => (
                    <tr key={intake.id} className="hover:bg-[#F4F8FF]/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#0F172A] whitespace-nowrap">
                        {intake.anonymousPatientCode}
                      </td>
                      <td className="px-5 py-4 uppercase font-bold text-[#2563EB] whitespace-nowrap">
                        {intake.organCategory}
                      </td>
                      <td className="px-5 py-4 text-[#0F172A] whitespace-nowrap font-medium">
                        {intake.donorRelationType}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            intake.thotaComplianceStatus === 'Committee Cleared'
                              ? 'navy'
                              : intake.thotaComplianceStatus === 'Form 1 Verified'
                              ? 'primary'
                              : 'subtle'
                          }
                        >
                          {intake.thotaComplianceStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                        {intake.committeeMeetingDate || 'Not Scheduled'}
                      </td>
                      <td className="px-5 py-4 text-[#64748B] max-w-xs truncate">
                        {intake.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN VOLUNTEER MODAL */}
      <Modal
        isOpen={Boolean(selectedRequestForAssignment)}
        onClose={() => setSelectedRequestForAssignment(null)}
        title="Assign Volunteer Saathi"
        subtitle="Match a verified non-clinical peer navigator to assist this patient"
        maxWidth="lg"
      >
        {selectedRequestForAssignment && (
          <form onSubmit={handleSubmitAssignment(onAssignmentSubmit)} className="space-y-4 text-left">
            {/* Request Summary Banner */}
            <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[#0F172A] text-sm">
                  {selectedRequestForAssignment.patientName} &bull; {selectedRequestForAssignment.contactPhone}
                </span>
                <Badge variant="primary">{selectedRequestForAssignment.supportType}</Badge>
              </div>
              <div className="text-xs text-[#64748B] flex items-center gap-4">
                <span>Organ: <strong className="text-[#0F172A] uppercase">{selectedRequestForAssignment.organCategory}</strong></span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> {selectedRequestForAssignment.hospitalName}</span>
              </div>
              {selectedRequestForAssignment.notes && (
                <p className="text-xs text-[#0F172A] italic bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                  &ldquo;{selectedRequestForAssignment.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Error & Success Messages */}
            {assignmentError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{assignmentError}</span>
              </div>
            )}
            {assignmentSuccessMsg && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{assignmentSuccessMsg}</span>
              </div>
            )}

            {/* Select Vetted Volunteer */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Select Verified Peer Volunteer Navigator *
              </label>
              <select
                {...registerAssignment('volunteerId')}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                {VETTED_VOLUNTEERS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} &bull; {v.organization} ({v.registrationNumber}) - {v.specialization}
                  </option>
                ))}
              </select>
              {assignmentErrors.volunteerId && (
                <p className="text-[11px] text-[#2563EB] mt-1">{assignmentErrors.volunteerId.message}</p>
              )}
            </div>

            {/* Volunteer Details Card */}
            {currentVolunteer && (
              <div className="p-3.5 rounded-xl bg-white border border-[#2563EB]/40 flex items-start justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                    {currentVolunteer.name} ({currentVolunteer.registrationNumber})
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {currentVolunteer.organization} &bull; Languages: {currentVolunteer.languages.join(', ')}
                  </div>
                  <div className="text-[11px] text-[#2563EB] font-medium mt-1">
                    Specialty: {currentVolunteer.specialization}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#64748B] block">Current Load</span>
                  <span className="text-xs font-bold text-[#0F172A]">{currentVolunteer.activeCases} active cases</span>
                </div>
              </div>
            )}

            {/* Coordinator Triage & Handover Notes */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Coordinator Triage & Handover Notes *
              </label>
              <textarea
                rows={3}
                {...registerAssignment('coordinatorNotes')}
                placeholder="Specify priority, upcoming committee hearing dates, or specific guidance for the volunteer..."
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              {assignmentErrors.coordinatorNotes && (
                <p className="text-[11px] text-[#2563EB] mt-1">{assignmentErrors.coordinatorNotes.message}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setSelectedRequestForAssignment(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isAssigning}
                leftIcon={<HeartHandshake className="w-4 h-4" />}
              >
                Confirm Volunteer Assignment
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADD SYNTHETIC CASE MODAL */}
      <Modal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        title="Add Synthetic Case Record"
        subtitle="For hospital workflow demonstration and compliance audit testing"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitIntake(onIntakeSubmit)} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Organ Program *
            </label>
            <select
              {...registerIntake('organCategory')}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
            >
              <option value="kidney">Kidney (Renal)</option>
              <option value="liver">Liver (Hepatic)</option>
              <option value="heart">Heart (Cardiac)</option>
              <option value="lungs">Lungs (Pulmonary)</option>
              <option value="cornea">Cornea (Ocular)</option>
              <option value="bone_marrow">Bone Marrow / BMT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Donor Relationship Category *
            </label>
            <select
              {...registerIntake('donorRelationType')}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
            >
              <option value="Near Relative (Living)">Near Relative (Living - Form 1)</option>
              <option value="Spouse">Spouse (Living - Form 2)</option>
              <option value="Other / Swap">Other / Swap (Form 3 / Form 18)</option>
              <option value="Deceased Candidate List">Deceased Candidate Waitlist</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Statutory Compliance Status *
            </label>
            <select
              {...registerIntake('thotaComplianceStatus')}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
            >
              <option value="Form 1 Verified">Form 1 Verified</option>
              <option value="Awaiting Authorization Committee">Awaiting Authorization Committee</option>
              <option value="Committee Cleared">Committee Cleared</option>
              <option value="Pending HLA Report">Pending HLA Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Committee Review Target Date
            </label>
            <input
              type="date"
              {...registerIntake('committeeMeetingDate')}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Clinical Workup Notes *
            </label>
            <textarea
              rows={3}
              {...registerIntake('notes')}
              placeholder="e.g. Crossmatch negative. Joint affidavit attested before JMFC. Video hearing date scheduled..."
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            />
            {intakeErrors.notes && (
              <p className="text-[11px] text-[#2563EB] mt-1">{intakeErrors.notes.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCaseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Case Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
