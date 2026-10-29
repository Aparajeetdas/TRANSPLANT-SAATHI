import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  ShieldAlert,
  User,
  UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton';
import { RequestSupportModal } from '../../features/support/RequestSupportModal';
import { AssistanceRequest, RequestStatus } from '../../types';
import { usePatientSupportRequests } from './usePatientData';

interface CancelDialogState {
  isOpen: boolean;
  requestId: string | null;
  patientName: string;
}

export const SupportRequestTracker: React.FC = () => {
  const { requests, isLoading, isError, refetch, cancelRequest, isCancelling } = usePatientSupportRequests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<CancelDialogState>({
    isOpen: false,
    requestId: null,
    patientName: ''
  });
  const [cancelReason, setCancelReason] = useState('');

  const handleRequestCreated = () => {
    refetch();
    setIsModalOpen(false);
  };

  const openCancelDialog = (req: AssistanceRequest) => {
    setCancelDialog({
      isOpen: true,
      requestId: req.id,
      patientName: req.patientName
    });
    setCancelReason('');
  };

  const handleConfirmCancel = () => {
    if (!cancelDialog.requestId) return;
    cancelRequest(
      {
        requestId: cancelDialog.requestId,
        reason: cancelReason || 'Cancelled by patient from portal'
      },
      {
        onSuccess: () => {
          setCancelDialog({ isOpen: false, requestId: null, patientName: '' });
          refetch();
        }
      }
    );
  };

  const getLifecycleStep = (status: RequestStatus): number => {
    switch (status) {
      case 'submitted':
        return 1;
      case 'under_review':
        return 2;
      case 'assigned':
      case 'in_progress':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const steps = [
    { num: 1, label: 'Submitted', desc: 'Request Registered' },
    { num: 2, label: 'Under Review', desc: 'Coordinator Triage' },
    { num: 3, label: 'Assigned', desc: 'Saathi Matched' },
    { num: 4, label: 'Completed', desc: 'Assistance Provided' }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header & Overview */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/20 text-[11px] font-semibold text-[#1D4ED8] mb-2">
              <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Vetted Peer Saathi Network</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#2563EB]" />
              Non-Clinical Support Requests & History
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Submit and monitor peer volunteer requests for hospital navigation, THOTA Form 1 joint affidavits, and scheme paperwork.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Request Volunteer Assistance
          </Button>
        </div>
      </Card>

      {/* Statutory Boundary Notice */}
      <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0F172A] leading-relaxed">
          <span className="font-bold">Non-Clinical Support Scope: </span>
          Volunteer Saathis provide administrative and wayfinding accompaniment only. Volunteers cannot give clinical counsel, arrange donors, or alter organ waiting lists. <span className="font-semibold text-[#1D4ED8]">Financial assistance is not guaranteed</span> through support requests; schemes require state/nodal committee approval.
        </div>
      </div>

      {/* Requests List & History */}
      <div className="space-y-4">
        {isLoading ? (
          <SkeletonCard count={3} />
        ) : isError ? (
          <Card className="p-6 text-center bg-white border-[#E2E8F0] space-y-3">
            <p className="text-xs text-[#64748B]">Could not load assistance requests from the database.</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry Load
            </Button>
          </Card>
        ) : requests.length === 0 ? (
          <EmptyState
            title="You Have No Active Assistance Requests"
            description="Submit a non-clinical request for hospital wayfinding, Form 1 notary paperwork help, or PM-JAY scheme guidance."
            actionText="Submit Support Request"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          requests.map((req) => {
            const currentStep = getLifecycleStep(req.status);
            const isCancelled = req.status === 'cancelled';
            const canCancel = req.status === 'submitted' || req.status === 'under_review';

            return (
              <Card key={req.id} className="border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
                {/* Request Header Bar */}
                <div className="bg-[#F4F8FF] px-6 py-3.5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{req.supportType}</Badge>
                    <span className="text-xs text-[#64748B]">
                      Ref: <strong className="text-[#0F172A]">{req.id}</strong>
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Organ: <strong className="text-[#0F172A] uppercase">{req.organCategory}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        req.status === 'completed'
                          ? 'navy'
                          : req.status === 'assigned' || req.status === 'in_progress'
                          ? 'primary'
                          : req.status === 'cancelled'
                          ? 'neutral'
                          : 'subtle'
                      }
                    >
                      {req.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Status Lifecycle Progression Stepper */}
                  {!isCancelled ? (
                    <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F4F8FF]/30">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-3">
                        Request Lifecycle Timeline
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {steps.map((st) => {
                          const isDone = currentStep >= st.num;
                          const isCurrent = currentStep === st.num;
                          return (
                            <div
                              key={st.num}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                isCurrent
                                  ? 'bg-white border-[#2563EB] shadow-xs'
                                  : isDone
                                  ? 'bg-[#F4F8FF] border-[#2563EB]/40'
                                  : 'bg-white/60 border-[#E2E8F0] opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-[#64748B] flex items-center justify-center text-[9px] font-bold text-[#64748B]">
                                    {st.num}
                                  </div>
                                )}
                                <span className={`text-xs font-bold ${isCurrent ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                                  {st.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#64748B]">{st.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] flex items-center gap-2 text-xs text-[#64748B]">
                      <Ban className="w-4 h-4 text-[#64748B]" />
                      <span>This request was cancelled by the patient and is marked inactive in the registry.</span>
                    </div>
                  )}

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                        Hospital / Target Facility
                      </div>
                      <p className="text-sm font-semibold text-[#0F172A]">{req.hospitalName}</p>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                        Registered Patient Contact
                      </div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {req.patientName} &bull; {req.contactPhone}
                      </p>
                    </div>
                  </div>

                  {/* Notes / Triage Context */}
                  {req.notes && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                        Request Details & Patient Notes
                      </div>
                      <p className="text-xs text-[#0F172A] leading-relaxed bg-[#F4F8FF]/50 p-3.5 rounded-xl border border-[#E2E8F0]">
                        {req.notes}
                      </p>
                    </div>
                  )}

                  {/* Coordinator Triage Notes (if assigned) */}
                  {req.coordinatorNotes && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] mb-1">
                        Coordinator Handover Instructions
                      </div>
                      <p className="text-xs text-[#1D4ED8] leading-relaxed bg-[#F4F8FF] p-3 rounded-xl border border-[#2563EB]/30">
                        {req.coordinatorNotes}
                      </p>
                    </div>
                  )}

                  {/* Assigned Volunteer Card */}
                  {req.assignedVolunteerName ? (
                    <div className="p-4 rounded-xl bg-white border border-[#2563EB]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F4F8FF] border border-[#2563EB] flex items-center justify-center text-[#2563EB]">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A]">
                            Assigned Volunteer: {req.assignedVolunteerName}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            Verified Non-Clinical Patient Saathi Navigator
                          </div>
                          {req.assignedAt && (
                            <div className="text-[10px] text-[#64748B] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              Assigned {new Date(req.assignedAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href="tel:+919811122334"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Navigator
                        </a>
                      </div>
                    </div>
                  ) : !isCancelled ? (
                    <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs text-[#64748B]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
                        <span>Awaiting hospital coordinator triage & volunteer match. Typically assigned within 24 hours.</span>
                      </div>
                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCancelDialog(req)}
                          className="text-[#0F172A] border-[#E2E8F0] hover:bg-[#F4F8FF]"
                        >
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  ) : null}

                  {/* Footer Action if Still Pending & Can Cancel */}
                  {canCancel && req.assignedVolunteerName && (
                    <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCancelDialog(req)}
                        className="text-xs text-[#64748B] hover:text-[#0F172A]"
                      >
                        Cancel Request
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E2E8F0] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#0F172A] font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-[#2563EB]" />
              Confirm Request Cancellation
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Are you sure you want to cancel the non-clinical assistance request for <strong>{cancelDialog.patientName}</strong>? The volunteer coordinator will be notified and this request will be marked cancelled.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Reason for cancellation (optional):
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Hospital paperwork resolved independently"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelDialog({ isOpen: false, requestId: null, patientName: '' })}
                disabled={isCancelling}
              >
                Keep Request
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancel}
                isLoading={isCancelling}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Support Request Modal */}
      <RequestSupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestSubmitted={handleRequestCreated}
      />
    </div>
  );
};
