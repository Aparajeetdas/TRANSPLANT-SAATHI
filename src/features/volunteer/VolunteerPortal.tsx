import {
  CheckCircle2,
  Clock,
  ExternalLink,
  HeartHandshake,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Play,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { getStoredRequests, recordAuditLog, saveStoredRequests } from '../../lib/store';
import { AssistanceRequest, RequestStatus } from '../../types';

export const VolunteerPortal: React.FC<{ onRequestNewSupport?: () => void }> = () => {
  const navigate = useNavigate();
  const { currentUser, isVolunteer, isAdmin, switchRole } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>(() => getStoredRequests());
  const [activeFilter, setActiveFilter] = useState<'all' | 'unassigned' | 'mine' | 'completed'>('mine');
  const [volunteerStatus, setVolunteerStatus] = useState<'available' | 'busy' | 'offline'>('available');

  // Interaction Note Modal State
  const [selectedRequestForNotes, setSelectedRequestForNotes] = useState<AssistanceRequest | null>(null);
  const [interactionNote, setInteractionNote] = useState('');

  // Completion Modal State
  const [selectedRequestForCompletion, setSelectedRequestForCompletion] = useState<AssistanceRequest | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  // Strict Least Privilege Isolation:
  // Volunteers can only view requests assigned to their authenticated identity.
  const myAssignedRequests = requests.filter((r) => r.assignedVolunteerId === currentUser?.id);
  const activeAssignedRequests = myAssignedRequests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
  const completedHistory = myAssignedRequests.filter((r) => r.status === 'completed');

  // Status Progression
  const handleUpdateStatus = (req: AssistanceRequest, newStatus: RequestStatus, resolutionNote?: string) => {
    if (!currentUser) return;

    // Verify assignment boundary
    if (!isAdmin && req.assignedVolunteerId !== currentUser.id) {
      recordAuditLog(currentUser, 'UNAUTHORIZED_STATUS_UPDATE_ATTEMPT', 'assistance_requests', req.id, {
        reason: 'Attempted to alter status of an unassigned case'
      });
      return;
    }

    const updated = requests.map((r) => {
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

    setRequests(updated);
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

    setSelectedRequestForCompletion(null);
    setCompletionNote('');
  };

  // Add Interaction Note
  const handleSaveNotes = () => {
    if (!selectedRequestForNotes || !currentUser) return;

    // Verify assignment boundary
    if (!isAdmin && selectedRequestForNotes.assignedVolunteerId !== currentUser.id) {
      recordAuditLog(currentUser, 'UNAUTHORIZED_NOTE_ATTEMPT', 'assistance_requests', selectedRequestForNotes.id, {
        reason: 'Attempted to add notes to an unassigned case'
      });
      return;
    }

    const noteTimestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    const existingNotes = selectedRequestForNotes.notes ? `${selectedRequestForNotes.notes}\n` : '';
    const updatedNotes = `${existingNotes}[${currentUser.fullName} - ${noteTimestamp}]: ${interactionNote.trim()}`;

    const updated = requests.map((r) => {
      if (r.id === selectedRequestForNotes.id) {
        return {
          ...r,
          notes: updatedNotes,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setRequests(updated);
    saveStoredRequests(updated);

    recordAuditLog(currentUser, 'INTERACTION_NOTES_ADDED', 'assistance_requests', selectedRequestForNotes.id, {
      noteLength: interactionNote.length
    });

    setSelectedRequestForNotes(null);
    setInteractionNote('');
  };

  // Determine what to display based on active filter and role restrictions
  let displayedRequests: AssistanceRequest[] = [];
  let isRestrictedView = false;

  if (activeFilter === 'unassigned') {
    if (!isAdmin) {
      isRestrictedView = true;
    } else {
      displayedRequests = requests.filter((r) => !r.assignedVolunteerId && r.status === 'submitted');
    }
  } else if (activeFilter === 'completed') {
    displayedRequests = isAdmin ? requests.filter((r) => r.status === 'completed') : completedHistory;
  } else if (activeFilter === 'all') {
    displayedRequests = isAdmin ? requests : myAssignedRequests;
  } else {
    // 'mine' (Active Assigned Tasks)
    displayedRequests = activeAssignedRequests;
  }

  return (
    <div className="space-y-8 text-left">
      {/* Title & Volunteer Persona Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Volunteer Saathi Coordination Hub</span>
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
            Patient Support & Accompaniment Queue
          </h2>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Trained volunteers assist verified patients with hospital wayfinding, compiling THOTA statutory checklists, and accessing government welfare desks.
          </p>
        </div>

        {/* Volunteer Status Bar */}
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="text-xs">
            <span className="text-[#64748B] block text-[10px]">Your Status:</span>
            <span className="font-bold text-[#0F172A] capitalize">{volunteerStatus}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setVolunteerStatus('available')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                volunteerStatus === 'available'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#F4F8FF] text-[#1D4ED8]'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setVolunteerStatus('offline')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                volunteerStatus === 'offline'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F4F8FF] text-[#64748B]'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Role Check / Switch Hint if not volunteer */}
      {!isVolunteer && !isAdmin && (
        <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#0F172A]">
            <UserCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              You are currently viewing as <strong>{currentUser?.fullName}</strong> ({currentUser?.role}).
              Switch to <strong>Volunteer</strong> role to test least privilege case isolation.
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => switchRole('volunteer')}
            className="shrink-0 text-xs"
          >
            Switch to Volunteer Role
          </Button>
        </div>
      )}

      {/* Volunteer Conduct Guidelines */}
      <div className="p-5 rounded-2xl bg-[#0F172A] text-white border border-[#2563EB]/30 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-[#F4F8FF]">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>1. Non-Medical Support Only</span>
          </div>
          <p className="text-white/70 leading-relaxed text-[11px]">
            Never give medical advice, adjust medications, or judge clinical eligibility. Refer all clinical inquiries to treating doctors.
          </p>
        </div>

        <div className="space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-[#F4F8FF]">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>2. Strict Altruism Check</span>
          </div>
          <p className="text-white/70 leading-relaxed text-[11px]">
            Never engage in or tolerate discussions involving money or exchange of favors for organs. Report violations immediately.
          </p>
        </div>

        <div className="space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-[#F4F8FF]">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>3. Patient Confidentiality</span>
          </div>
          <p className="text-white/70 leading-relaxed text-[11px]">
            Under DPDP Act 2023, volunteers are restricted to their assigned patients. Unassigned case files remain confidential.
          </p>
        </div>
      </div>

      {/* Queue Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('mine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'mine'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
            }`}
          >
            Assigned to Me ({activeAssignedRequests.length})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'completed'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
            }`}
          >
            Completion History ({completedHistory.length})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
            }`}
          >
            All Requests ({isAdmin ? requests.length : myAssignedRequests.length})
          </button>
          <button
            onClick={() => setActiveFilter('unassigned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'unassigned'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
            }`}
          >
            Unassigned Pool {isAdmin ? `(${requests.filter((r) => !r.assignedVolunteerId).length})` : ''}
          </button>
        </div>

        <div className="text-xs text-[#64748B]">
          Active Caseload: <strong className="text-[#0F172A]">{activeAssignedRequests.length}</strong> &bull; Completed: <strong className="text-[#0F172A]">{completedHistory.length}</strong>
        </div>
      </div>

      {/* RESTRICTED UNASSIGNED POOL NOTICE (Least Privilege Enforcement) */}
      {isRestrictedView ? (
        <div className="p-8 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">
              Access Restricted: Coordinator Triage Required
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Under Section 19 of THOTA 1994 and the DPDP Act 2023, patient assistance requests are confidential. Volunteers may only view cases specifically assigned to them by an authorized Hospital Coordinator.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveFilter('mine')}
          >
            Return to My Assigned Requests
          </Button>
        </div>
      ) : displayedRequests.length === 0 ? (
        <EmptyState
          title={
            activeFilter === 'completed'
              ? 'No Completed Tasks Yet'
              : 'No Active Requests Assigned to You'
          }
          description={
            activeFilter === 'completed'
              ? 'When you finish non-clinical accompaniment tasks, your resolution records will appear here.'
              : 'You have no pending accompaniment tasks. Hospital coordinators will assign cases based on your availability.'
          }
          actionText="View Assigned Tasks"
          onAction={() => setActiveFilter('mine')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedRequests.map((req) => {
            const isAssignedToCurrent = req.assignedVolunteerId === currentUser?.id;
            const isCompleted = req.status === 'completed';

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
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
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#0F172A] font-heading">
                      {req.patientName}
                    </h4>
                    <div className="text-xs text-[#2563EB] font-bold uppercase tracking-wider mt-0.5">
                      {req.organCategory} — {req.supportType}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/15 text-xs text-[#0F172A] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="truncate">{req.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <a href={`tel:${req.contactPhone}`} className="text-[#2563EB] hover:underline font-semibold">
                        {req.contactPhone}
                      </a>
                    </div>
                  </div>

                  {/* Coordinator Triage Notes (if assigned) */}
                  {req.coordinatorNotes && (
                    <div className="p-2.5 rounded-lg bg-[#F4F8FF]/80 border border-[#2563EB]/25 text-[11px] text-[#1D4ED8]">
                      <span className="font-bold block">Coordinator Instructions:</span>
                      {req.coordinatorNotes}
                    </div>
                  )}

                  {/* Patient / Interaction Notes */}
                  {req.notes && (
                    <div className="text-xs text-[#64748B] bg-white p-3 rounded-xl border border-[#E2E8F0] space-y-1">
                      <span className="font-bold text-[#0F172A] block text-[11px] uppercase tracking-wider">
                        Patient Request Context & Logs:
                      </span>
                      <p className="whitespace-pre-line leading-relaxed text-[11px] max-h-24 overflow-y-auto font-mono">
                        {req.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions for Authorized Volunteers */}
                <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/volunteer/requests/${req.id}`)}
                    leftIcon={<ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />}
                    className="text-xs"
                  >
                    View Case Dossier
                  </Button>

                  {(isAssignedToCurrent || isAdmin) && (
                    <div className="flex items-center gap-1.5">
                      {!isCompleted && req.status !== 'in_progress' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatus(req, 'in_progress')}
                          leftIcon={<Play className="w-3 h-3 text-[#2563EB]" />}
                          className="text-xs py-1"
                        >
                          Start Task
                        </Button>
                      )}

                      {!isCompleted && (
                        <Button
                          variant="navy"
                          size="sm"
                          onClick={() => setSelectedRequestForCompletion(req)}
                          className="text-xs py-1"
                          leftIcon={<CheckCircle2 className="w-3 h-3 text-[#2563EB]" />}
                        >
                          Complete
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequestForNotes(req)}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />}
                        className="text-xs py-1"
                      >
                        Add Log
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Log Modal */}
      {selectedRequestForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#E2E8F0] shadow-2xl space-y-4 text-left">
            <h4 className="text-base font-bold text-[#0F172A] font-heading">
              Log Volunteer Interaction Note
            </h4>
            <p className="text-xs text-[#64748B]">
              Add interaction details for <strong>{selectedRequestForNotes.patientName}</strong> (e.g. helped with Form 1 affidavit submission).
            </p>
            <textarea
              rows={4}
              value={interactionNote}
              onChange={(e) => setInteractionNote(e.target.value)}
              placeholder="e.g. Accompanied family to hospital nodal desk; reviewed Form 1 checklist..."
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRequestForNotes(null);
                  setInteractionNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                disabled={!interactionNote.trim()}
              >
                Save Note to Case
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {selectedRequestForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#E2E8F0] shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-2 text-[#0F172A] font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
              Confirm Task Completion
            </div>
            <p className="text-xs text-[#64748B]">
              Record resolution summary notes for <strong>{selectedRequestForCompletion.patientName}</strong> before marking this assistance task completed.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Resolution & Handover Summary (Optional)
              </label>
              <textarea
                rows={3}
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder="e.g. Patient successfully attested Form 1 joint affidavit before JMFC; OPD registration completed."
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRequestForCompletion(null);
                  setCompletionNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleUpdateStatus(
                    selectedRequestForCompletion,
                    'completed',
                    completionNote.trim() || 'Accompaniment task successfully completed'
                  )
                }
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
