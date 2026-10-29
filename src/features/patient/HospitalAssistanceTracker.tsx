import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Hospital,
  Info,
  MapPin,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  addHospitalRequestPatientMessage,
  cancelHospitalAssistanceRequest,
  getHospitalRequestsForPatient,
  getStoredInAppNotifications,
  markInAppNotificationAsRead
} from '../../lib/store';
import {
  HospitalAssistanceCategory,
  HospitalAssistanceRequest,
  HospitalAssistanceStatus,
  InAppNotification
} from '../../types';

const STATUS_CONFIG: Record<
  HospitalAssistanceStatus,
  { label: string; variant: 'primary' | 'subtle' | 'outline' | 'neutral'; description: string }
> = {
  draft: {
    label: 'Draft',
    variant: 'neutral',
    description: 'Inquiry draft saved locally.'
  },
  submitted: {
    label: 'Submitted',
    variant: 'subtle',
    description: 'Assistance request logged and queued for hospital triage.'
  },
  awaiting_hospital_review: {
    label: 'Awaiting Hospital Review',
    variant: 'subtle',
    description: 'In queue for nodal coordinator assignment.'
  },
  additional_info_required: {
    label: 'Additional Information Required',
    variant: 'outline',
    description: 'Hospital coordinator has requested administrative details or affidavits.'
  },
  under_hospital_review: {
    label: 'Under Hospital Review',
    variant: 'primary',
    description: 'Nodal transplant desk is reviewing statutory records and eligibility.'
  },
  referred_official_registration: {
    label: 'Referred to Official Registration',
    variant: 'primary',
    description: 'Directing patient to official NOTTO/SOTTO registration desk.'
  },
  assistance_in_progress: {
    label: 'Assistance In Progress',
    variant: 'primary',
    description: 'Transplant coordinator is actively assisting with consultations.'
  },
  closed: {
    label: 'Closed',
    variant: 'neutral',
    description: 'Coordination request has concluded.'
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'neutral',
    description: 'Inquiry cancelled by patient or coordinator.'
  }
};

const CATEGORY_LABELS: Record<HospitalAssistanceCategory, string> = {
  transplant_guidance: 'Transplant Guidance',
  official_registration: 'Official Registration Assistance',
  document_guidance: 'Document Guidance (Form 1/2/3)',
  hospital_coordination: 'Hospital Nodal Coordination',
  financial_counseling: 'Financial Scheme Counseling'
};

export const HospitalAssistanceTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<HospitalAssistanceRequest[]>(() =>
    currentUser ? getHospitalRequestsForPatient(currentUser.id) : []
  );
  const [notifications, setNotifications] = useState<InAppNotification[]>(() =>
    currentUser ? getStoredInAppNotifications(currentUser.id) : []
  );
  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<HospitalAssistanceRequest | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refreshRequests = () => {
    if (!currentUser) return;
    const latest = getHospitalRequestsForPatient(currentUser.id);
    setRequests(latest);
    const notifs = getStoredInAppNotifications(currentUser.id);
    setNotifications(notifs);
    if (selectedRequest) {
      const updated = latest.find((r) => r.id === selectedRequest.id) || null;
      setSelectedRequest(updated);
    }
  };

  const handleMarkNotifRead = (id: string) => {
    markInAppNotificationAsRead(id);
    if (currentUser) {
      setNotifications(getStoredInAppNotifications(currentUser.id));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser || !replyMessage.trim()) return;
    setActionError(null);

    const res = addHospitalRequestPatientMessage(selectedRequest.id, replyMessage.trim(), currentUser);
    if (!res.success || !res.request) {
      setActionError(res.error || 'Failed to send message.');
      return;
    }

    setReplyMessage('');
    setActionSuccess('Message sent to hospital coordination desk.');
    refreshRequests();
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleCancelRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser) return;
    setActionError(null);

    const res = cancelHospitalAssistanceRequest(
      selectedRequest.id,
      cancelReason || 'Cancelled by patient',
      currentUser
    );

    if (!res.success || !res.request) {
      setActionError(res.error || 'Failed to cancel request.');
      return;
    }

    setCancelModalOpen(false);
    setCancelReason('');
    setActionSuccess('Assistance request successfully cancelled.');
    refreshRequests();
    setTimeout(() => setActionSuccess(null), 3000);
  };

  if (!currentUser) {
    return (
      <Card className="p-6 text-center text-xs text-[#64748B]">
        Please sign in as a patient to view your hospital assistance requests.
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header & Overview */}
      <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-extrabold text-[#0F172A] text-base">
              Verified Hospital Assistance Inquiries
            </h3>
            <Badge variant="primary" size="sm">
              {requests.length} Requests
            </Badge>
          </div>
          <p className="text-xs text-[#64748B]">
            Track coordination status with verified transplant nodal centers under THOTA 1994.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            leftIcon={<Bell className="w-3.5 h-3.5" />}
            className="relative"
          >
            <span>In-App Alerts</span>
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </Button>
          <Link to="/directory">
            <Button variant="primary" size="sm" leftIcon={<Hospital className="w-3.5 h-3.5" />}>
              Find Hospitals
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRequests}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="p-4 rounded-xl bg-white border border-[#2563EB]/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2563EB]" />
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                In-App Hospital Coordination Alerts
              </h4>
            </div>
            <span className="text-[10px] text-[#64748B]">
              SMS / Push Gateway: In-App Simulation Mode Active
            </span>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-[#64748B] py-2">No in-app notifications found.</p>
          ) : (
            <div className="divide-y divide-[#E2E8F0] max-h-56 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A]">{n.title}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] inline-block" />
                      )}
                      <span className="text-[10px] text-[#64748B]">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#64748B] text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkNotifRead(n.id)}
                      className="text-[10px] font-semibold text-[#2563EB] hover:underline shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statutory Clarification Banner */}
      <Alert variant="statutory" title="Administrative Assistance Scope">
        Transplant Saathi assistance requests provide hospital navigation and paperwork counseling. They do NOT register you on the official NOTTO/SOTTO organ waiting list. Official registration occurs exclusively through in-person evaluation at authorized transplant hospitals.
      </Alert>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="p-10 text-center space-y-3 bg-white border-[#E2E8F0]">
          <Hospital className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h4 className="text-sm font-bold text-[#0F172A]">No Hospital Assistance Requests Yet</h4>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            You have not submitted any assistance requests to verified transplant centers. Visit the Hospital Directory to connect with authorized centers for your organ program.
          </p>
          <Link to="/directory">
            <Button variant="primary" size="sm" className="mt-2">
              Browse Verified Directory
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusInfo = STATUS_CONFIG[req.status] || {
              label: req.status,
              variant: 'neutral',
              description: ''
            };
            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 hover:border-[#2563EB]/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1D4ED8] bg-[#F4F8FF] px-2.5 py-0.5 rounded border border-[#2563EB]/20">
                        {req.referenceNumber}
                      </span>
                      <Badge variant={statusInfo.variant} size="sm">
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs font-semibold text-[#0F172A] capitalize">
                        {req.organProgram.replace('_', ' ')} Program
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5 pt-0.5">
                      <Building2 className="w-4 h-4 text-[#2563EB]" />
                      <span>{req.hospitalName}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionSuccess(null);
                        setActionError(null);
                      }}
                    >
                      View Timeline & Updates
                    </Button>
                    {req.status !== 'closed' && req.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setCancelModalOpen(true);
                        }}
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Category:</span>
                    <strong className="text-[#0F172A]">
                      {CATEGORY_LABELS[req.requestCategory] || req.requestCategory}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Preferred Contact:</span>
                    <strong className="text-[#0F172A] capitalize">{req.preferredContactMethod}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Submitted Date:</span>
                    <span className="text-[#0F172A]">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] leading-relaxed">
                  <span className="text-[11px] font-semibold text-[#64748B] block mb-0.5">Inquiry Description:</span>
                  {req.description}
                </div>

                {/* If additional info is requested, show prominent callout */}
                {req.status === 'additional_info_required' && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Action Required from Hospital Coordinator:</strong>
                      <span>
                        The transplant desk at {req.hospitalName} has requested additional information. Please check the communication thread and reply with details.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Request Details & Communication Modal */}
      {selectedRequest && !cancelModalOpen && (
        <Modal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title={`Tracking: ${selectedRequest.referenceNumber}`}
          subtitle={`${selectedRequest.hospitalName} (${selectedRequest.organProgram.toUpperCase()})`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-left py-1 text-xs">
            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Current Status Card */}
            <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Current Status:</span>
                <Badge variant={STATUS_CONFIG[selectedRequest.status].variant}>
                  {STATUS_CONFIG[selectedRequest.status].label}
                </Badge>
              </div>
              <p className="text-[11px] text-[#0F172A] leading-relaxed">
                {STATUS_CONFIG[selectedRequest.status].description}
              </p>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
                Administrative Status Timeline
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {selectedRequest.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#1D4ED8] uppercase">{h.toStatus.replace(/_/g, ' ')}</span>
                      <span className="text-[#64748B]">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    {h.note && <p className="text-[#64748B] text-[11px]">{h.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Thread */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
                Messages from Hospital Coordinator
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {selectedRequest.patientNotes.length === 0 ? (
                  <p className="text-[#64748B] text-center py-4">
                    No hospital messages yet. Updates will appear here.
                  </p>
                ) : (
                  selectedRequest.patientNotes.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl space-y-0.5 ${
                        msg.senderRole === 'hospital_staff'
                          ? 'bg-[#F4F8FF] border border-[#2563EB]/30'
                          : 'bg-white border border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-[#0F172A] text-[11px]">
                        <span>{msg.senderName} ({msg.senderRole.replace('_', ' ')})</span>
                        <span className="text-[#64748B] font-normal">{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[#0F172A]">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              {selectedRequest.status !== 'closed' && selectedRequest.status !== 'cancelled' && (
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type reply or question to coordinator..."
                    className="flex-1 h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!replyMessage.trim()}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Reply
                  </Button>
                </form>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#E2E8F0]">
              {selectedRequest.status !== 'closed' && selectedRequest.status !== 'cancelled' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(true)}
                  className="text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  Cancel This Request
                </Button>
              ) : (
                <span />
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModalOpen && selectedRequest && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Assistance Request"
          subtitle={`Reference ID: ${selectedRequest.referenceNumber}`}
          maxWidth="sm"
        >
          <form onSubmit={handleCancelRequest} className="space-y-4 text-left py-2 text-xs">
            <p className="text-[#64748B] leading-relaxed">
              Are you sure you want to cancel this assistance request for <strong>{selectedRequest.hospitalName}</strong>? This action will notify the coordination desk and record a cancellation audit event.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-[#0F172A] block">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Registered at another hospital, assistance no longer required..."
                className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCancelModalOpen(false)}
              >
                Keep Request
              </Button>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700 border-rose-600 hover:text-white"
                leftIcon={<Ban className="w-3.5 h-3.5" />}
              >
                Confirm Cancellation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
