import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Hospital,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  addHospitalRequestInternalNote,
  addHospitalRequestPatientMessage,
  getHospitalRequestsForHospital,
  requestHospitalAdditionalInformation,
  updateHospitalRequestStatus
} from '../../lib/store';
import {
  HospitalAssistanceCategory,
  HospitalAssistanceRequest,
  HospitalAssistanceStatus,
  OrganType,
  VerifiedHospital
} from '../../types';

interface HospitalCoordinationDeskProps {
  hospital: VerifiedHospital;
}

const STATUS_LABELS: Record<HospitalAssistanceStatus, { label: string; variant: 'primary' | 'subtle' | 'outline' | 'neutral' }> = {
  draft: { label: 'Draft', variant: 'neutral' },
  submitted: { label: 'Submitted', variant: 'subtle' },
  awaiting_hospital_review: { label: 'Awaiting Review', variant: 'subtle' },
  additional_info_required: { label: 'Info Required', variant: 'outline' },
  under_hospital_review: { label: 'Under Review', variant: 'primary' },
  referred_official_registration: { label: 'Referred to NOTTO', variant: 'primary' },
  assistance_in_progress: { label: 'In Progress', variant: 'primary' },
  closed: { label: 'Closed', variant: 'neutral' },
  cancelled: { label: 'Cancelled', variant: 'neutral' }
};

const CATEGORY_LABELS: Record<HospitalAssistanceCategory, string> = {
  transplant_guidance: 'Transplant Guidance',
  official_registration: 'Official Registration',
  document_guidance: 'Document Guidance',
  hospital_coordination: 'Hospital Coordination',
  financial_counseling: 'Financial Scheme'
};

export const HospitalCoordinationDesk: React.FC<HospitalCoordinationDeskProps> = ({ hospital }) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<HospitalAssistanceRequest[]>(() =>
    currentUser ? getHospitalRequestsForHospital(hospital.id, currentUser) : []
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organFilter, setOrganFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Request Modal
  const [selectedRequest, setSelectedRequest] = useState<HospitalAssistanceRequest | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'messages' | 'internal_notes' | 'audit_trail'>('overview');

  // Action Inputs inside modal
  const [statusToUpdate, setStatusToUpdate] = useState<HospitalAssistanceStatus>('under_hospital_review');
  const [statusNote, setStatusNote] = useState('');
  const [additionalInfoMsg, setAdditionalInfoMsg] = useState('');
  const [isAskingInfo, setIsAskingInfo] = useState(false);
  const [newInternalNote, setNewInternalNote] = useState('');
  const [newPatientMsg, setNewPatientMsg] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const refreshRequests = () => {
    if (!currentUser) return;
    const latest = getHospitalRequestsForHospital(hospital.id, currentUser);
    setRequests(latest);
    if (selectedRequest) {
      const updatedSelected = latest.find((r) => r.id === selectedRequest.id) || null;
      setSelectedRequest(updatedSelected);
    }
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser) return;
    setActionError(null);

    const res = updateHospitalRequestStatus(
      selectedRequest.id,
      statusToUpdate,
      statusNote || `Status updated to ${statusToUpdate.replace(/_/g, ' ')}`,
      currentUser
    );

    if (!res.success || !res.request) {
      setActionError(res.error || 'Failed to update status.');
      return;
    }

    setActionSuccess(`Status successfully updated to ${STATUS_LABELS[statusToUpdate].label}.`);
    setStatusNote('');
    refreshRequests();
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleAskAdditionalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser || !additionalInfoMsg.trim()) return;
    setActionError(null);

    const res = requestHospitalAdditionalInformation(selectedRequest.id, additionalInfoMsg.trim(), currentUser);
    if (!res.success || !res.request) {
      setActionError(res.error || 'Failed to request additional information.');
      return;
    }

    setActionSuccess('Information request sent to patient. Request status set to Additional Info Required.');
    setAdditionalInfoMsg('');
    setIsAskingInfo(false);
    refreshRequests();
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser || !newInternalNote.trim()) return;
    setActionError(null);

    const res = addHospitalRequestInternalNote(selectedRequest.id, newInternalNote.trim(), currentUser);
    if (!res.success || !res.request) {
      setActionError(res.error || 'Failed to save internal note.');
      return;
    }

    setNewInternalNote('');
    setActionSuccess('Confidential internal note saved.');
    refreshRequests();
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleSendPatientMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser || !newPatientMsg.trim()) return;
    setActionError(null);

    const res = addHospitalRequestPatientMessage(selectedRequest.id, newPatientMsg.trim(), currentUser);
    if (!res.success || !res.request) {
      setActionError(res.error || 'Failed to send message.');
      return;
    }

    setNewPatientMsg('');
    setActionSuccess('Message transmitted to patient workspace.');
    refreshRequests();
    setTimeout(() => setActionSuccess(null), 2500);
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (organFilter !== 'all' && r.organProgram !== organFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = r.referenceNumber.toLowerCase().includes(q);
      const matchName = r.patientName.toLowerCase().includes(q);
      const matchPublicId = r.patientPublicId.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchPublicId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <span className="font-extrabold text-[#0F172A] text-base">{hospital.name}</span>
            <Badge variant="primary" size="sm">
              Verified Institution
            </Badge>
          </div>
          <p className="text-xs text-[#64748B]">
            Transplant Assistance Coordination Queue • Reg: <span className="font-mono text-[#0F172A] font-semibold">{hospital.registrationNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRequests}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-semibold text-[#0F172A]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Statuses ({requests.length})</option>
              <option value="submitted">Submitted</option>
              <option value="awaiting_hospital_review">Awaiting Review</option>
              <option value="additional_info_required">Info Required</option>
              <option value="under_hospital_review">Under Review</option>
              <option value="referred_official_registration">Referred to NOTTO</option>
              <option value="assistance_in_progress">In Progress</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Organ Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#0F172A]">Program:</span>
            <select
              value={organFilter}
              onChange={(e) => setOrganFilter(e.target.value)}
              className="h-8 px-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Verified Programs</option>
              {hospital.organsSupported.map((organ) => (
                <option key={organ} value={organ}>
                  {organ.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ref # or Patient..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Hospital className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <h4 className="text-sm font-bold text-[#0F172A]">No Assistance Requests Found</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              There are currently no patient requests matching the selected status or organ filter for {hospital.name}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-3.5">Reference ID</th>
                  <th className="px-4 py-3.5">Patient Details</th>
                  <th className="px-4 py-3.5">Program</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredRequests.map((req) => {
                  const statusConfig = STATUS_LABELS[req.status] || { label: req.status, variant: 'neutral' };
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-[#F4F8FF]/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedRequest(req);
                        setStatusToUpdate(req.status);
                        setActiveDetailTab('overview');
                        setActionError(null);
                        setActionSuccess(null);
                      }}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-[#1D4ED8]">
                        {req.referenceNumber}
                      </td>
                      <td className="px-4 py-3.5 space-y-0.5">
                        <div className="font-semibold text-[#0F172A]">{req.patientName}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          Public ID: {req.patientPublicId}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 capitalize font-semibold text-[#0F172A]">
                        {req.organProgram.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B]">
                        {CATEGORY_LABELS[req.requestCategory] || req.requestCategory}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setStatusToUpdate(req.status);
                            setActiveDetailTab('overview');
                          }}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Details & Workflow Modal */}
      {selectedRequest && (
        <Modal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title={`Assistance Request: ${selectedRequest.referenceNumber}`}
          subtitle={`Submitted to ${selectedRequest.hospitalName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-left py-1">
            {/* Feedback Banners */}
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Navigation Tabs inside modal */}
            <div className="border-b border-[#E2E8F0]">
              <nav className="flex space-x-4">
                {[
                  { id: 'overview', label: 'Request Overview', icon: FileText },
                  {
                    id: 'messages',
                    label: `Patient Communication (${selectedRequest.patientNotes.length})`,
                    icon: MessageSquare
                  },
                  {
                    id: 'internal_notes',
                    label: `Internal Notes (${selectedRequest.internalNotes.length})`,
                    icon: Lock
                  },
                  {
                    id: 'audit_trail',
                    label: `Status Audit (${selectedRequest.statusHistory.length})`,
                    icon: Clock
                  }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeDetailTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveDetailTab(tab.id as typeof activeDetailTab)}
                      className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'border-[#2563EB] text-[#2563EB]'
                          : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* TAB 1: OVERVIEW & STATUS ACTIONS */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-5">
                {/* Status & Priority Badge Bar */}
                <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] mr-2">Current Workflow Status:</span>
                    <Badge variant={STATUS_LABELS[selectedRequest.status].variant}>
                      {STATUS_LABELS[selectedRequest.status].label}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Created: <strong className="text-[#0F172A]">{new Date(selectedRequest.createdAt).toLocaleString()}</strong>
                  </div>
                </div>

                {/* Patient Information & Contact */}
                <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Patient & Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#64748B] block">Full Name:</span>
                      <strong className="text-[#0F172A]">{selectedRequest.patientName}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Public Identifier:</span>
                      <span className="font-mono font-bold text-[#1D4ED8]">{selectedRequest.patientPublicId}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Preferred Contact:</span>
                      <strong className="text-[#0F172A] capitalize">{selectedRequest.preferredContactMethod}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Phone:</span>
                      <span className="text-[#0F172A]">{selectedRequest.contactPhone}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#64748B] block">Email:</span>
                      <span className="text-[#0F172A]">{selectedRequest.contactEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Program & Inquiry Description */}
                <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Transplant Program & Query
                    </span>
                    <Badge variant="primary" size="sm">
                      {selectedRequest.organProgram.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Category:</span>
                    <span className="text-xs font-semibold text-[#0F172A]">
                      {CATEGORY_LABELS[selectedRequest.requestCategory]}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0F172A] leading-relaxed">
                    {selectedRequest.description}
                  </div>
                </div>

                {/* Status Update Form */}
                <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 space-y-3">
                  <span className="text-xs font-bold text-[#0F172A] block">
                    Update Assistance Workflow Status
                  </span>
                  <form onSubmit={handleStatusUpdate} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                          New Status:
                        </label>
                        <select
                          value={statusToUpdate}
                          onChange={(e) => setStatusToUpdate(e.target.value as HospitalAssistanceStatus)}
                          className="w-full h-9 px-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                        >
                          <option value="under_hospital_review">Under Hospital Review</option>
                          <option value="additional_info_required">Additional Information Required</option>
                          <option value="referred_official_registration">Referred to Official Registration Process</option>
                          <option value="assistance_in_progress">Assistance In Progress</option>
                          <option value="closed">Closed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                          Status Transition Note:
                        </label>
                        <input
                          type="text"
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="e.g. Inpatient dossier verified, OPD consult scheduled"
                          className="w-full h-9 px-2 rounded-lg border border-[#CBD5E1] bg-white text-xs focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAskingInfo(!isAskingInfo)}
                      >
                        {isAskingInfo ? 'Cancel Info Request' : 'Ask Additional Info'}
                      </Button>
                      <Button type="submit" variant="primary" size="sm">
                        Apply Status Update
                      </Button>
                    </div>
                  </form>

                  {/* Ask for Additional Info Sub-form */}
                  {isAskingInfo && (
                    <form onSubmit={handleAskAdditionalInfo} className="p-3 bg-white rounded-xl border border-amber-300 space-y-2 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Specify Administrative Documents or Details Needed</span>
                      </div>
                      <textarea
                        rows={2}
                        value={additionalInfoMsg}
                        onChange={(e) => setAdditionalInfoMsg(e.target.value)}
                        placeholder="e.g., Please bring a copy of Form 1 joint affidavit and Aadhaar card of near relative..."
                        className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB]"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={!additionalInfoMsg.trim()}
                        >
                          Send Request to Patient
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PATIENT COMMUNICATION */}
            {activeDetailTab === 'messages' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  Messages sent here are visible to the patient in their private dashboard and trigger an in-app notification.
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                  {selectedRequest.patientNotes.length === 0 ? (
                    <p className="text-xs text-[#64748B] text-center py-6">
                      No communication records yet. Send an update or guidance message below.
                    </p>
                  ) : (
                    selectedRequest.patientNotes.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msg.senderRole === 'hospital_staff'
                            ? 'bg-[#F4F8FF] border border-[#2563EB]/25 ml-4'
                            : 'bg-white border border-[#E2E8F0] mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                          <span>{msg.senderName} ({msg.senderRole.replace('_', ' ')})</span>
                          <span className="text-[10px] text-[#64748B] font-normal">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#0F172A] leading-relaxed">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendPatientMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newPatientMsg}
                    onChange={(e) => setNewPatientMsg(e.target.value)}
                    placeholder="Type message to patient..."
                    className="flex-1 h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!newPatientMsg.trim()}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send
                  </Button>
                </form>
              </div>
            )}

            {/* TAB 3: INTERNAL RESTRICTED NOTES */}
            {activeDetailTab === 'internal_notes' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Strictly Confidential — Hospital Staff Only</strong>
                    <span>These internal clinical liaison notes are never visible to patients. Used for internal verification and ethics documentation.</span>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                  {selectedRequest.internalNotes.length === 0 ? (
                    <p className="text-xs text-[#64748B] text-center py-6">
                      No internal notes recorded. Record private liaison notes below.
                    </p>
                  ) : (
                    selectedRequest.internalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                          <span>{note.authorName} ({note.authorRole.replace('_', ' ')})</span>
                          <span className="text-[10px] text-[#64748B] font-normal">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#0F172A] leading-relaxed">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddInternalNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    placeholder="Add confidential internal note (e.g. SOTTO roster clearance, HLA status, ethics committee date)..."
                    className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!newInternalNote.trim()}
                      leftIcon={<Lock className="w-3.5 h-3.5" />}
                    >
                      Save Internal Note
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: AUDIT TRAIL */}
            {activeDetailTab === 'audit_trail' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Status History & Audit Event Log
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto p-1">
                  {selectedRequest.statusHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#0F172A]">
                          {item.fromStatus ? `${item.fromStatus} → ` : ''}
                          <strong className="text-[#1D4ED8] uppercase">{item.toStatus}</strong>
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Actor: <strong className="text-[#0F172A]">{item.updatedBy}</strong> ({item.updatedByRole})
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-[#0F172A] bg-slate-50 p-2 rounded border border-slate-200">
                          {item.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
