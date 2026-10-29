import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Hospital,
  Lock,
  MessageSquare,
  Phone,
  Play,
  Scale,
  ShieldAlert,
  ShieldCheck,
  User
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  getAssistanceRequestForVolunteer,
  getStoredRequests,
  recordAuditLog,
  saveStoredRequests
} from '../../lib/store';
import { RequestStatus } from '../../types';

export const VolunteerRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [interactionNote, setInteractionNote] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Security Verification via Least Privilege Access Check
  const accessResult = getAssistanceRequestForVolunteer(id || '', currentUser);

  if (accessResult.isUnauthorized) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-left">
        <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>403 — Unauthorized Record Access</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
              Access Denied: Restricted Case Dossier
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {accessResult.error ||
                'Under the Digital Personal Data Protection (DPDP) Act 2023 and THOTA 1994 confidentiality regulations, volunteer navigators are strictly restricted to cases explicitly assigned to them by an authorized Hospital Coordinator.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-xs text-[#0F172A] space-y-1">
            <span className="font-bold">Security Audit Notice:</span>
            <p className="text-[#64748B]">
              This unauthorized URL manipulation attempt has been logged in the platform compliance audit ledger for target reference{' '}
              <strong className="text-[#0F172A]">{id}</strong>.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/volunteer')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to My Assigned Requests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const req = accessResult.request;

  if (!req) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] font-heading">
            Request Record Not Found
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            No assistance request matches reference ID <strong className="text-[#0F172A]">{id}</strong>.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/volunteer')}>
            Back to Volunteer Desk
          </Button>
        </div>
      </div>
    );
  }

  // Update Task Status
  const handleUpdateStatus = (newStatus: RequestStatus, resolutionNote?: string) => {
    if (!currentUser) return;

    const all = getStoredRequests();
    const updated = all.map((r) => {
      if (r.id === req.id) {
        const appendedNotes = resolutionNote
          ? `${r.notes || ''}\n[Status Change to ${newStatus.toUpperCase()} by ${currentUser.fullName} - ${new Date().toLocaleDateString()}]: ${resolutionNote}`
          : r.notes;
        return {
          ...r,
          status: newStatus,
          notes: appendedNotes,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    saveStoredRequests(updated);

    recordAuditLog(
      currentUser,
      newStatus === 'completed' ? 'VOLUNTEER_TASK_COMPLETED' : 'VOLUNTEER_STATUS_UPDATED',
      'assistance_requests',
      req.id,
      {
        previousStatus: req.status,
        newStatus,
        resolutionNote
      }
    );

    setRefreshKey((k) => k + 1);
    setIsCompletionModalOpen(false);
    setCompletionNotes('');
  };

  // Add Interaction Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionNote.trim() || !currentUser) return;

    const all = getStoredRequests();
    const noteEntry = `[${currentUser.fullName} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}]: ${interactionNote.trim()}`;
    const updated = all.map((r) => {
      if (r.id === req.id) {
        return {
          ...r,
          notes: r.notes ? `${r.notes}\n${noteEntry}` : noteEntry,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    saveStoredRequests(updated);

    recordAuditLog(
      currentUser,
      'INTERACTION_NOTES_ADDED',
      'assistance_requests',
      req.id,
      { noteLength: interactionNote.length }
    );

    setInteractionNote('');
    setRefreshKey((k) => k + 1);
  };

  return (
    <div key={refreshKey} className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-left">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/volunteer')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Back to Assigned Queue
        </Button>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              req.status === 'completed'
                ? 'navy'
                : req.status === 'in_progress'
                ? 'primary'
                : 'subtle'
            }
          >
            {req.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-xs text-[#64748B]">Case Ref: <strong className="text-[#0F172A]">{req.id}</strong></span>
        </div>
      </div>

      {/* Primary Dossier Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/25 text-[11px] font-semibold text-[#1D4ED8] mb-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Assigned Non-Clinical Task Dossier</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
              {req.patientName}
            </h1>
            <div className="text-xs text-[#2563EB] font-bold uppercase tracking-wider mt-0.5">
              {req.organCategory} — {req.supportType}
            </div>
          </div>

          {/* Quick Call Action */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${req.contactPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4" />
              Call Patient ({req.contactPhone})
            </a>
          </div>
        </div>

        {/* Essential Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-[#F4F8FF]/60 border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
              <Hospital className="w-3.5 h-3.5 text-[#2563EB]" />
              Hospital Location
            </span>
            <p className="font-semibold text-[#0F172A]">{req.hospitalName}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F8FF]/60 border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              Assigned Date
            </span>
            <p className="font-semibold text-[#0F172A]">
              {req.assignedAt
                ? new Date(req.assignedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Assigned recently'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F8FF]/60 border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#2563EB]" />
              Assigned Saathi Navigator
            </span>
            <p className="font-semibold text-[#0F172A]">
              {req.assignedVolunteerName || currentUser?.fullName}
            </p>
          </div>
        </div>
      </div>

      {/* Coordinator Instructions Banner (if present) */}
      {req.coordinatorNotes && (
        <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/30 space-y-1.5">
          <div className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            Coordinator Triage & Handover Instructions
          </div>
          <p className="text-xs text-[#0F172A] leading-relaxed">
            {req.coordinatorNotes}
          </p>
        </div>
      )}

      {/* Task Status Transition Controls */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              Task Status Management
            </h3>
            <p className="text-xs text-[#64748B]">
              Update the active progress status of this non-clinical navigation task.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {req.status === 'assigned' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateStatus('in_progress')}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Mark In Progress
              </Button>
            )}

            {req.status === 'in_progress' && (
              <Button
                variant="navy"
                size="sm"
                onClick={() => setIsCompletionModalOpen(true)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />}
              >
                Complete Task
              </Button>
            )}

            {req.status === 'completed' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8]">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                <span>Task Successfully Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interaction Logs & Notes */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#2563EB]" />
            Interaction Log & Case History
          </h3>
          <p className="text-xs text-[#64748B]">
            Record administrative accompaniment milestones, affidavit attestation dates, and scheme paperwork assistance.
          </p>
        </div>

        {/* Existing Notes Display */}
        {req.notes ? (
          <div className="p-4 rounded-xl bg-[#F4F8FF]/40 border border-[#E2E8F0] text-xs text-[#0F172A] whitespace-pre-line leading-relaxed font-mono text-[11px]">
            {req.notes}
          </div>
        ) : (
          <p className="text-xs text-[#64748B] italic">No interaction notes recorded yet.</p>
        )}

        {/* Log Note Form */}
        <form onSubmit={handleAddNote} className="space-y-3 pt-2 border-t border-[#E2E8F0]">
          <label className="block text-xs font-bold text-[#0F172A]">
            Log New Interaction Note
          </label>
          <textarea
            rows={3}
            value={interactionNote}
            onChange={(e) => setInteractionNote(e.target.value)}
            placeholder="e.g. Met patient at AIIMS Gate 2; guided family to Form 1 notary counter. Assisted with gazetted officer affidavit attestation..."
            className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!interactionNote.trim()}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              Append Note
            </Button>
          </div>
        </form>
      </div>

      {/* Statutory Guidelines Guard */}
      <div className="p-4 rounded-xl bg-[#0F172A] text-white flex items-start gap-3">
        <Scale className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-white/90 leading-relaxed">
          <span className="font-bold text-white">Statutory Volunteer Boundary (THOTA 1994):</span>
          <p>
            Volunteers are peer logistical guides. Under Section 19 of THOTA 1994, volunteers must never participate in organ matching, commercial negotiations, or clinical eligibility assessments. Real clinical queries must be referred to the hospital transplant nodal officer.
          </p>
        </div>
      </div>

      {/* Completion Modal */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#E2E8F0] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#0F172A] font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
              Confirm Task Completion
            </div>
            <p className="text-xs text-[#64748B]">
              Record resolution summary notes for <strong>{req.patientName}</strong> before marking this assistance task completed.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Completion & Handover Summary (Optional)
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Patient successfully submitted Form 1 joint affidavit; hospital ethics committee review scheduled."
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCompletionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateStatus('completed', completionNotes)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Confirm Completion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
