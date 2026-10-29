import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit2,
  ExternalLink,
  FileText,
  History,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Modal } from '../../components/common/Modal';
import { ErrorMessage } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { VETTED_VOLUNTEERS } from '../../lib/mockData';
import {
  adminUpdateRequest,
  createHospital,
  createResource,
  deleteHospital,
  deleteResource,
  getStoredHospitals,
  getStoredProfiles,
  getStoredRequests,
  getStoredResources,
  updateHospital,
  updateHospitalVerificationReview,
  updateResource,
  updateUserProfileRole
} from '../../lib/store';
import {
  AssistanceRequest,
  HospitalReviewStatus,
  OfficialResource,
  OrganType,
  RequestStatus,
  UserProfile,
  UserRole,
  VerifiedHospital
} from '../../types';
import { AuditLogView } from './AuditLogView';

const ALL_ORGAN_TYPES: OrganType[] = ['kidney', 'liver', 'heart', 'lungs', 'cornea', 'pancreas', 'bone_marrow'];

export const AdminPortal: React.FC = () => {
  const { currentUser, isAdmin, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'hospitals' | 'resources' | 'requests' | 'audit'>('roles');

  // Local state initialized from storage
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getStoredProfiles());
  const [hospitals, setHospitals] = useState<VerifiedHospital[]>(() => getStoredHospitals());
  const [resources, setResources] = useState<OfficialResource[]>(() => getStoredResources());
  const [requests, setRequests] = useState<AssistanceRequest[]>(() => getStoredRequests());

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ----------------------------------------------------
  // 1. USER-ROLE ADMINISTRATION & PRIVILEGE GUARD STATE
  // ----------------------------------------------------
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 6;

  // Role Change Confirmation Dialog State
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    user: UserProfile;
    newRole: UserRole;
  } | null>(null);
  const [roleChangeReason, setRoleChangeReason] = useState('');

  // ----------------------------------------------------
  // 2. HOSPITAL MANAGEMENT & VERIFICATION REVIEW STATE
  // ----------------------------------------------------
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [hospitalStatusFilter, setHospitalStatusFilter] = useState<string>('all');
  const [hospitalOrganFilter, setHospitalOrganFilter] = useState<string>('all');
  const [hospitalPage, setHospitalPage] = useState(1);
  const hospitalsPerPage = 5;

  // Add/Edit Hospital Modal
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<VerifiedHospital | null>(null);
  const [hospitalFormData, setHospitalFormData] = useState({
    name: '',
    registrationNumber: '',
    state: '',
    city: '',
    address: '',
    coordinatorName: '',
    coordinatorPhone: '',
    coordinatorEmail: '',
    sourceUrl: '',
    accreditation: 'NOTTO Empaneled Center',
    organsSupported: ['kidney'] as OrganType[]
  });
  const [hospitalFormError, setHospitalFormError] = useState<string | null>(null);

  // Hospital Verification Review Modal
  const [reviewingHospital, setReviewingHospital] = useState<VerifiedHospital | null>(null);
  const [newReviewStatus, setNewReviewStatus] = useState<HospitalReviewStatus>('verified');
  const [reviewNotes, setReviewNotes] = useState('');

  // Hospital Delete Confirmation
  const [hospitalToDelete, setHospitalToDelete] = useState<VerifiedHospital | null>(null);

  // ----------------------------------------------------
  // 3. RESOURCE MANAGEMENT STATE
  // ----------------------------------------------------
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>('all');
  const [resourcePage, setResourcePage] = useState(1);
  const resourcesPerPage = 5;

  // Add/Edit Resource Modal
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<OfficialResource | null>(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    category: 'scheme' as OfficialResource['category'],
    description: '',
    officialUrl: '',
    authorityName: ''
  });
  const [resourceFormError, setResourceFormError] = useState<string | null>(null);

  // Resource Delete Confirmation
  const [resourceToDelete, setResourceToDelete] = useState<OfficialResource | null>(null);

  // ----------------------------------------------------
  // 4. PATIENT REQUEST OVERSIGHT STATE
  // ----------------------------------------------------
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestPage, setRequestPage] = useState(1);
  const requestsPerPage = 5;

  // Request Oversight Action Modal
  const [managingRequest, setManagingRequest] = useState<AssistanceRequest | null>(null);
  const [oversightStatus, setOversightStatus] = useState<RequestStatus>('submitted');
  const [oversightVolunteerId, setOversightVolunteerId] = useState<string>('');
  const [oversightNotes, setOversightNotes] = useState<string>('');

  // ----------------------------------------------------
  // 1. USER-ROLE ADMINISTRATION HANDLERS
  // ----------------------------------------------------
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const q = userSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.organization && p.organization.toLowerCase().includes(q));
      const matchesRole = userRoleFilter === 'all' || p.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [profiles, userSearch, userRoleFilter]);

  const totalUserPages = Math.max(1, Math.ceil(filteredProfiles.length / usersPerPage));
  const paginatedProfiles = useMemo(() => {
    const start = (userPage - 1) * usersPerPage;
    return filteredProfiles.slice(start, start + usersPerPage);
  }, [filteredProfiles, userPage, usersPerPage]);

  const handleInitiateRoleChange = (user: UserProfile, newRole: UserRole) => {
    if (user.role === newRole) return;
    setRoleChangeTarget({ user, newRole });
    setRoleChangeReason('');
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeTarget) return;
    const res = updateUserProfileRole(
      currentUser,
      roleChangeTarget.user.id,
      roleChangeTarget.newRole,
      roleChangeReason || 'Administrative governance role update'
    );

    if (res.success && res.updatedProfiles) {
      setProfiles(res.updatedProfiles);
      showToast(
        `Privilege updated: ${roleChangeTarget.user.fullName} is now assigned role '${roleChangeTarget.newRole}'`
      );
    } else {
      showToast(res.error || 'Failed to update role', true);
    }
    setRoleChangeTarget(null);
  };

  // ----------------------------------------------------
  // 2. HOSPITAL DIRECTORY HANDLERS
  // ----------------------------------------------------
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const q = hospitalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.registrationNumber.toLowerCase().includes(q);
      const matchesStatus =
        hospitalStatusFilter === 'all' ||
        (hospitalStatusFilter === 'verified' && h.reviewStatus === 'verified') ||
        (hospitalStatusFilter === 'pending' && h.reviewStatus === 'pending') ||
        (hospitalStatusFilter === 'flagged' && h.reviewStatus === 'flagged');
      const matchesOrgan =
        hospitalOrganFilter === 'all' || h.organsSupported.includes(hospitalOrganFilter as OrganType);

      return matchesSearch && matchesStatus && matchesOrgan;
    });
  }, [hospitals, hospitalSearch, hospitalStatusFilter, hospitalOrganFilter]);

  const totalHospitalPages = Math.max(1, Math.ceil(filteredHospitals.length / hospitalsPerPage));
  const paginatedHospitals = useMemo(() => {
    const start = (hospitalPage - 1) * hospitalsPerPage;
    return filteredHospitals.slice(start, start + hospitalsPerPage);
  }, [filteredHospitals, hospitalPage, hospitalsPerPage]);

  const handleOpenAddHospital = () => {
    setEditingHospital(null);
    setHospitalFormData({
      name: '',
      registrationNumber: '',
      state: '',
      city: '',
      address: '',
      coordinatorName: '',
      coordinatorPhone: '',
      coordinatorEmail: '',
      sourceUrl: 'https://notto.mohfw.gov.in',
      accreditation: 'NOTTO Empaneled Center',
      organsSupported: ['kidney']
    });
    setHospitalFormError(null);
    setIsHospitalModalOpen(true);
  };

  const handleOpenEditHospital = (h: VerifiedHospital) => {
    setEditingHospital(h);
    setHospitalFormData({
      name: h.name,
      registrationNumber: h.registrationNumber,
      state: h.state,
      city: h.city,
      address: h.address,
      coordinatorName: h.coordinatorName,
      coordinatorPhone: h.coordinatorPhone,
      coordinatorEmail: h.coordinatorEmail,
      sourceUrl: h.sourceUrl,
      accreditation: h.accreditation,
      organsSupported: [...h.organsSupported]
    });
    setHospitalFormError(null);
    setIsHospitalModalOpen(true);
  };

  const handleSaveHospitalForm = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!hospitalFormData.name.trim() || hospitalFormData.name.length < 3) {
      setHospitalFormError('Center name must be at least 3 characters.');
      return;
    }
    if (!hospitalFormData.registrationNumber.trim()) {
      setHospitalFormError('Statutory registration number is required.');
      return;
    }
    if (!hospitalFormData.city.trim() || !hospitalFormData.state.trim()) {
      setHospitalFormError('City and state are required.');
      return;
    }
    if (hospitalFormData.organsSupported.length === 0) {
      setHospitalFormError('Select at least one supported organ program.');
      return;
    }
    if (!hospitalFormData.sourceUrl.startsWith('http')) {
      setHospitalFormError('A valid official citation URL is required.');
      return;
    }

    if (editingHospital) {
      // Update
      const res = updateHospital(currentUser, editingHospital.id, {
        name: hospitalFormData.name.trim(),
        registrationNumber: hospitalFormData.registrationNumber.trim(),
        state: hospitalFormData.state.trim(),
        city: hospitalFormData.city.trim(),
        address: hospitalFormData.address.trim(),
        coordinatorName: hospitalFormData.coordinatorName.trim(),
        coordinatorPhone: hospitalFormData.coordinatorPhone.trim(),
        coordinatorEmail: hospitalFormData.coordinatorEmail.trim(),
        sourceUrl: hospitalFormData.sourceUrl.trim(),
        accreditation: hospitalFormData.accreditation.trim(),
        organsSupported: hospitalFormData.organsSupported
      });
      if (res.success && res.hospital) {
        setHospitals(getStoredHospitals());
        showToast(`Hospital directory entry for "${res.hospital.name}" updated.`);
        setIsHospitalModalOpen(false);
      } else {
        setHospitalFormError(res.error || 'Failed to update hospital');
      }
    } else {
      // Create
      const res = createHospital(currentUser, {
        name: hospitalFormData.name.trim(),
        registrationNumber: hospitalFormData.registrationNumber.trim(),
        state: hospitalFormData.state.trim(),
        city: hospitalFormData.city.trim(),
        address: hospitalFormData.address.trim(),
        lat: 28.6139,
        lng: 77.2090,
        coordinatorName: hospitalFormData.coordinatorName.trim(),
        coordinatorPhone: hospitalFormData.coordinatorPhone.trim(),
        coordinatorEmail: hospitalFormData.coordinatorEmail.trim(),
        sourceUrl: hospitalFormData.sourceUrl.trim(),
        accreditation: hospitalFormData.accreditation.trim(),
        organsSupported: hospitalFormData.organsSupported,
        sourceVerificationDate: new Date().toISOString().split('T')[0],
        isVerified: true,
        reviewStatus: 'verified',
        isDemonstrationRecord: true,
        sources: [
          {
            id: `src-${Date.now()}`,
            organType: hospitalFormData.organsSupported[0],
            sourceAuthority: 'NOTTO State Registry Gazette',
            citationReference: hospitalFormData.registrationNumber,
            sourceUrl: hospitalFormData.sourceUrl,
            verifiedDate: new Date().toISOString().split('T')[0],
            reviewStatus: 'verified',
            statutoryStatus: 'Active Statutory License',
            reviewedBy: currentUser?.fullName || 'Platform Administrator'
          }
        ]
      });
      if (res.success && res.hospital) {
        setHospitals(getStoredHospitals());
        showToast(`Center "${res.hospital.name}" added to verified directory.`);
        setIsHospitalModalOpen(false);
      } else {
        setHospitalFormError(res.error || 'Failed to create hospital entry');
      }
    }
  };

  const handleConfirmVerificationReview = () => {
    if (!reviewingHospital) return;
    const res = updateHospitalVerificationReview(
      currentUser,
      reviewingHospital.id,
      newReviewStatus,
      reviewNotes || 'Quarterly administrative verification audit'
    );
    if (res.success && res.hospital) {
      setHospitals(getStoredHospitals());
      showToast(`Verification status for "${res.hospital.name}" set to ${newReviewStatus}.`);
    } else {
      showToast(res.error || 'Failed to update review status', true);
    }
    setReviewingHospital(null);
  };

  const handleConfirmDeleteHospital = () => {
    if (!hospitalToDelete) return;
    const res = deleteHospital(currentUser, hospitalToDelete.id, 'Administrative directory removal');
    if (res.success) {
      setHospitals(getStoredHospitals());
      showToast(`Removed "${hospitalToDelete.name}" from verified registry.`);
    } else {
      showToast(res.error || 'Failed to delete hospital', true);
    }
    setHospitalToDelete(null);
  };

  // ----------------------------------------------------
  // 3. RESOURCE MANAGEMENT HANDLERS
  // ----------------------------------------------------
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const q = resourceSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.authorityName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      const matchesCategory = resourceCategoryFilter === 'all' || r.category === resourceCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [resources, resourceSearch, resourceCategoryFilter]);

  const totalResourcePages = Math.max(1, Math.ceil(filteredResources.length / resourcesPerPage));
  const paginatedResources = useMemo(() => {
    const start = (resourcePage - 1) * resourcesPerPage;
    return filteredResources.slice(start, start + resourcesPerPage);
  }, [filteredResources, resourcePage, resourcesPerPage]);

  const handleOpenAddResource = () => {
    setEditingResource(null);
    setResourceFormData({
      title: '',
      category: 'scheme',
      description: '',
      officialUrl: '',
      authorityName: ''
    });
    setResourceFormError(null);
    setIsResourceModalOpen(true);
  };

  const handleOpenEditResource = (r: OfficialResource) => {
    setEditingResource(r);
    setResourceFormData({
      title: r.title,
      category: r.category,
      description: r.description,
      officialUrl: r.officialUrl,
      authorityName: r.authorityName
    });
    setResourceFormError(null);
    setIsResourceModalOpen(true);
  };

  const handleSaveResourceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceFormData.title.trim() || resourceFormData.title.length < 3) {
      setResourceFormError('Title must be at least 3 characters.');
      return;
    }
    if (!resourceFormData.authorityName.trim()) {
      setResourceFormError('Governing authority name is required.');
      return;
    }
    if (!resourceFormData.description.trim() || resourceFormData.description.length < 5) {
      setResourceFormError('Description must be at least 5 characters.');
      return;
    }
    if (!resourceFormData.officialUrl.startsWith('http')) {
      setResourceFormError('A valid official URL (http/https) is required.');
      return;
    }

    if (editingResource) {
      const res = updateResource(currentUser, editingResource.id, {
        title: resourceFormData.title.trim(),
        category: resourceFormData.category,
        description: resourceFormData.description.trim(),
        officialUrl: resourceFormData.officialUrl.trim(),
        authorityName: resourceFormData.authorityName.trim()
      });
      if (res.success && res.resource) {
        setResources(getStoredResources());
        showToast(`Resource "${res.resource.title}" updated successfully.`);
        setIsResourceModalOpen(false);
      } else {
        setResourceFormError(res.error || 'Failed to update resource');
      }
    } else {
      const res = createResource(currentUser, {
        title: resourceFormData.title.trim(),
        category: resourceFormData.category,
        description: resourceFormData.description.trim(),
        officialUrl: resourceFormData.officialUrl.trim(),
        authorityName: resourceFormData.authorityName.trim(),
        isActive: true
      });
      if (res.success && res.resource) {
        setResources(getStoredResources());
        showToast(`Official resource "${res.resource.title}" published.`);
        setIsResourceModalOpen(false);
      } else {
        setResourceFormError(res.error || 'Failed to create resource');
      }
    }
  };

  const handleConfirmDeleteResource = () => {
    if (!resourceToDelete) return;
    const res = deleteResource(currentUser, resourceToDelete.id, 'Administrative resource catalog cleanup');
    if (res.success) {
      setResources(getStoredResources());
      showToast(`Resource "${resourceToDelete.title}" removed.`);
    } else {
      showToast(res.error || 'Failed to delete resource', true);
    }
    setResourceToDelete(null);
  };

  // ----------------------------------------------------
  // 4. REQUEST OVERSIGHT HANDLERS
  // ----------------------------------------------------
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = requestSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.patientName.toLowerCase().includes(q) ||
        r.hospitalName.toLowerCase().includes(q) ||
        r.supportType.toLowerCase().includes(q) ||
        (r.assignedVolunteerName && r.assignedVolunteerName.toLowerCase().includes(q));
      const matchesStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, requestSearch, requestStatusFilter]);

  const totalRequestPages = Math.max(1, Math.ceil(filteredRequests.length / requestsPerPage));
  const paginatedRequests = useMemo(() => {
    const start = (requestPage - 1) * requestsPerPage;
    return filteredRequests.slice(start, start + requestsPerPage);
  }, [filteredRequests, requestPage, requestsPerPage]);

  const handleOpenManageRequest = (req: AssistanceRequest) => {
    setManagingRequest(req);
    setOversightStatus(req.status);
    setOversightVolunteerId(req.assignedVolunteerId || '');
    setOversightNotes(req.coordinatorNotes || '');
  };

  const handleSaveRequestOversight = () => {
    if (!managingRequest) return;
    const selectedVol = VETTED_VOLUNTEERS.find((v) => v.id === oversightVolunteerId);

    const res = adminUpdateRequest(currentUser, managingRequest.id, {
      status: oversightStatus,
      assignedVolunteerId: oversightVolunteerId || undefined,
      assignedVolunteerName: selectedVol ? selectedVol.name : (oversightVolunteerId ? 'Assigned Volunteer' : undefined),
      coordinatorNotes: oversightNotes
    });

    if (res.success && res.request) {
      setRequests(getStoredRequests());
      showToast(`Assistance request for ${res.request.patientName} updated.`);
    } else {
      showToast(res.error || 'Failed to update request', true);
    }
    setManagingRequest(null);
  };

  // ----------------------------------------------------
  // NON-ADMIN PROTECTION CHECK (Rendered after hooks)
  // ----------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
            Transplant Saathi Directorate & Admin Desk
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Access to administrative governance, directory auditing, and role assignment is strictly restricted to platform administrators.
          </p>
        </div>

        <ErrorMessage
          isPermissionDenied
          message={`Your active role is ${currentUser?.role || 'Guest'}. Only authenticated platform administrators can access role assignment and system audit logs.`}
        />

        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center space-y-4">
          <h4 className="text-base font-bold text-[#0F172A] font-heading">
            Prototype Security Demonstration
          </h4>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Switch your profile to the Administrator persona to audit system events, re-verify hospital registries, manage resources, and oversee patient requests.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => switchRole('admin')}
          >
            Switch to Siddharth Sen (Platform Admin)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>National Directory & Security Directorate</span>
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
            System Administration & Security Governance
          </h2>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Logged in as <strong>{currentUser?.fullName}</strong> (Platform Admin). Privileged console for user-role administration, directory verification, statutory resources, request oversight, and immutable audit logs.
          </p>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="inline-flex flex-wrap p-1 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] gap-1">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Role RBAC</span>
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'hospitals'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Directory Governance</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Official Resources</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Request Oversight</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            toastMessage.isError
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#F4F8FF] border-[#2563EB]/40 text-[#1D4ED8]'
          }`}
        >
          {toastMessage.isError ? (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 1: USER-ROLE ADMINISTRATION & ESCALATION GUARD   */}
      {/* ==================================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 text-xs text-[#0F172A] leading-relaxed flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Privilege Escalation Protection: </span>
              In accordance with DPDP Act 2023 security protocols, role modifications require administrative privileges and generate immutable audit logs. The system automatically prevents demoting the sole active administrator to avoid platform lockout.
            </div>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search user by name, email, or organization..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="hospital_staff">Hospital Staff</option>
                <option value="volunteer">Volunteer</option>
                <option value="patient">Patient</option>
                <option value="family">Family Caregiver</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3.5">User Profile</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Affiliated Organization</th>
                    <th className="px-5 py-3.5">Current Role</th>
                    <th className="px-5 py-3.5">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-[#64748B]">
                        No user profiles match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F4F8FF]/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-[#0F172A] whitespace-nowrap">
                          {p.fullName}
                          {p.id === currentUser?.id && (
                            <span className="ml-2 text-[10px] text-[#2563EB] font-normal">(You)</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-[#64748B] whitespace-nowrap font-mono text-[11px]">
                          {p.email}
                        </td>
                        <td className="px-5 py-4 text-[#0F172A] whitespace-nowrap">
                          {p.organization || 'Public Individual'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge variant={p.role === 'admin' ? 'navy' : 'subtle'}>
                            {p.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <select
                            value={p.role}
                            onChange={(e) => handleInitiateRoleChange(p, e.target.value as UserRole)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
                            aria-label={`Change role for ${p.fullName}`}
                          >
                            <option value="patient">patient</option>
                            <option value="family">family</option>
                            <option value="volunteer">volunteer</option>
                            <option value="hospital_staff">hospital_staff</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredProfiles.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-[#E2E8F0] bg-[#F4F8FF]/40 gap-3 text-xs">
                <div className="text-[#64748B]">
                  Showing <span className="font-bold text-[#0F172A]">{(userPage - 1) * usersPerPage + 1}</span> to{' '}
                  <span className="font-bold text-[#0F172A]">
                    {Math.min(userPage * usersPerPage, filteredProfiles.length)}
                  </span>{' '}
                  of <span className="font-bold text-[#0F172A]">{filteredProfiles.length}</span> profiles
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="py-1 px-2 text-xs"
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-xs font-semibold text-[#0F172A]">
                    Page {userPage} of {totalUserPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                    disabled={userPage === totalUserPages}
                    className="py-1 px-2 text-xs"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: HOSPITALS & VERIFICATION REVIEWS              */}
      {/* ==================================================== */}
      {activeTab === 'hospitals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#64748B] max-w-xl">
              Maintain active listings verified against state and national NOTTO registries. Quarterly audits are required for transplant centers under THOTA 1994.
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddHospital}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Center
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={hospitalSearch}
                onChange={(e) => {
                  setHospitalSearch(e.target.value);
                  setHospitalPage(1);
                }}
                placeholder="Search hospital name, city, state, or registration ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={hospitalStatusFilter}
                onChange={(e) => {
                  setHospitalStatusFilter(e.target.value);
                  setHospitalPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Active</option>
                <option value="pending">Pending Verification</option>
                <option value="flagged">Flagged for Audit</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <select
                value={hospitalOrganFilter}
                onChange={(e) => {
                  setHospitalOrganFilter(e.target.value);
                  setHospitalPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All Organ Programs</option>
                {ALL_ORGAN_TYPES.map((org) => (
                  <option key={org} value={org}>
                    {org.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospitals Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3.5">Center Name</th>
                    <th className="px-5 py-3.5">Registration ID</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Last Verified</th>
                    <th className="px-5 py-3.5">Organs</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedHospitals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-xs text-[#64748B]">
                        No transplant centers found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedHospitals.map((h) => (
                      <tr key={h.id} className="hover:bg-[#F4F8FF]/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-[#0F172A] whitespace-nowrap">
                          {h.name}
                        </td>
                        <td className="px-5 py-4 text-[#2563EB] font-mono font-bold whitespace-nowrap">
                          {h.registrationNumber}
                        </td>
                        <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                          {h.city}, {h.state}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              h.reviewStatus === 'verified'
                                ? 'primary'
                                : h.reviewStatus === 'pending'
                                ? 'subtle'
                                : 'outline'
                            }
                          >
                            {h.reviewStatus}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-[#0F172A] font-semibold whitespace-nowrap">
                          {h.sourceVerificationDate}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {h.organsSupported.slice(0, 3).map((org) => (
                              <span
                                key={org}
                                className="px-1.5 py-0.5 rounded bg-[#F4F8FF] border border-[#2563EB]/20 text-[10px] text-[#1D4ED8]"
                              >
                                {org}
                              </span>
                            ))}
                            {h.organsSupported.length > 3 && (
                              <span className="text-[10px] text-[#64748B]">
                                +{h.organsSupported.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReviewingHospital(h);
                                setNewReviewStatus(h.reviewStatus || 'verified');
                                setReviewNotes('');
                              }}
                              className="text-[11px] py-1 px-2"
                              leftIcon={<RefreshCw className="w-3 h-3 text-[#2563EB]" />}
                            >
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditHospital(h)}
                              className="text-[11px] py-1 px-2"
                              leftIcon={<Edit2 className="w-3 h-3 text-[#64748B]" />}
                            >
                              Edit
                            </Button>
                            <button
                              onClick={() => setHospitalToDelete(h)}
                              className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete center"
                              aria-label={`Delete ${h.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredHospitals.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-[#E2E8F0] bg-[#F4F8FF]/40 gap-3 text-xs">
                <div className="text-[#64748B]">
                  Showing <span className="font-bold text-[#0F172A]">{(hospitalPage - 1) * hospitalsPerPage + 1}</span> to{' '}
                  <span className="font-bold text-[#0F172A]">
                    {Math.min(hospitalPage * hospitalsPerPage, filteredHospitals.length)}
                  </span>{' '}
                  of <span className="font-bold text-[#0F172A]">{filteredHospitals.length}</span> centers
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHospitalPage((p) => Math.max(1, p - 1))}
                    disabled={hospitalPage === 1}
                    className="py-1 px-2 text-xs"
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-xs font-semibold text-[#0F172A]">
                    Page {hospitalPage} of {totalHospitalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHospitalPage((p) => Math.min(totalHospitalPages, p + 1))}
                    disabled={hospitalPage === totalHospitalPages}
                    className="py-1 px-2 text-xs"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: OFFICIAL RESOURCE MANAGEMENT                  */}
      {/* ==================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#64748B] max-w-xl">
              Curate authorized public resources, including Ayushman Bharat PM-JAY packages, Rashtriya Arogya Nidhi (RAN), THOTA statutory application forms, and NOTTO portal links.
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddResource}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Resource
            </Button>
          </div>

          {/* Search & Category Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={resourceSearch}
                onChange={(e) => {
                  setResourceSearch(e.target.value);
                  setResourcePage(1);
                }}
                placeholder="Search resource title, authority, or description..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={resourceCategoryFilter}
                onChange={(e) => {
                  setResourceCategoryFilter(e.target.value);
                  setResourcePage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="scheme">Financial Scheme</option>
                <option value="form">THOTA Statutory Form</option>
                <option value="statutory_act">Statutory Act / Law</option>
                <option value="portal">Official Portal</option>
              </select>
            </div>
          </div>

          {/* Resources Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3.5">Resource Title</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Authority</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Citation Link</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedResources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-xs text-[#64748B]">
                        No official resources found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedResources.map((res) => (
                      <tr key={res.id} className="hover:bg-[#F4F8FF]/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-[#0F172A] whitespace-nowrap">
                          {res.title}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge variant="subtle">{res.category}</Badge>
                        </td>
                        <td className="px-5 py-4 text-[#0F172A] whitespace-nowrap font-medium">
                          {res.authorityName}
                        </td>
                        <td className="px-5 py-4 text-[#64748B] max-w-xs truncate">
                          {res.description}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <a
                            href={res.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2563EB] hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditResource(res)}
                              className="text-[11px] py-1 px-2"
                              leftIcon={<Edit2 className="w-3 h-3 text-[#64748B]" />}
                            >
                              Edit
                            </Button>
                            <button
                              onClick={() => setResourceToDelete(res)}
                              className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete resource"
                              aria-label={`Delete ${res.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredResources.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-[#E2E8F0] bg-[#F4F8FF]/40 gap-3 text-xs">
                <div className="text-[#64748B]">
                  Showing <span className="font-bold text-[#0F172A]">{(resourcePage - 1) * resourcesPerPage + 1}</span> to{' '}
                  <span className="font-bold text-[#0F172A]">
                    {Math.min(resourcePage * resourcesPerPage, filteredResources.length)}
                  </span>{' '}
                  of <span className="font-bold text-[#0F172A]">{filteredResources.length}</span> resources
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResourcePage((p) => Math.max(1, p - 1))}
                    disabled={resourcePage === 1}
                    className="py-1 px-2 text-xs"
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-xs font-semibold text-[#0F172A]">
                    Page {resourcePage} of {totalResourcePages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResourcePage((p) => Math.min(totalResourcePages, p + 1))}
                    disabled={resourcePage === totalResourcePages}
                    className="py-1 px-2 text-xs"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: PATIENT REQUEST OVERSIGHT                     */}
      {/* ==================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 text-xs text-[#0F172A] leading-relaxed">
            <span className="font-bold">Coordination Oversight: </span>
            Monitor all patient non-clinical assistance requests submitted across centers. Administrators can reassign requests to vetted community volunteers or adjust case status with audit logging.
          </div>

          {/* Search & Status Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={requestSearch}
                onChange={(e) => {
                  setRequestSearch(e.target.value);
                  setRequestPage(1);
                }}
                placeholder="Search patient name, hospital, support type, or volunteer..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={requestStatusFilter}
                onChange={(e) => {
                  setRequestStatusFilter(e.target.value);
                  setRequestPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All Request Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3.5">Request ID & Patient</th>
                    <th className="px-5 py-3.5">Hospital</th>
                    <th className="px-5 py-3.5">Support Type</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Assigned Volunteer</th>
                    <th className="px-5 py-3.5 text-right">Oversight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-xs text-[#64748B]">
                        No assistance requests match the current filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#F4F8FF]/50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-bold text-[#0F172A] block">{req.patientName}</span>
                          <span className="text-[10px] text-[#64748B] font-mono">{req.id}</span>
                        </td>
                        <td className="px-5 py-4 text-[#0F172A] whitespace-nowrap">
                          {req.hospitalName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-[#1D4ED8] font-medium block">{req.supportType}</span>
                          <span className="text-[10px] text-[#64748B] capitalize">{req.organCategory}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              req.status === 'completed'
                                ? 'primary'
                                : req.status === 'in_progress' || req.status === 'assigned'
                                ? 'navy'
                                : 'subtle'
                            }
                          >
                            {req.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {req.assignedVolunteerName ? (
                            <span className="text-[#0F172A] font-semibold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                              {req.assignedVolunteerName}
                            </span>
                          ) : (
                            <span className="text-[#64748B] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenManageRequest(req)}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Manage Case
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredRequests.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-[#E2E8F0] bg-[#F4F8FF]/40 gap-3 text-xs">
                <div className="text-[#64748B]">
                  Showing <span className="font-bold text-[#0F172A]">{(requestPage - 1) * requestsPerPage + 1}</span> to{' '}
                  <span className="font-bold text-[#0F172A]">
                    {Math.min(requestPage * requestsPerPage, filteredRequests.length)}
                  </span>{' '}
                  of <span className="font-bold text-[#0F172A]">{filteredRequests.length}</span> requests
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRequestPage((p) => Math.max(1, p - 1))}
                    disabled={requestPage === 1}
                    className="py-1 px-2 text-xs"
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-xs font-semibold text-[#0F172A]">
                    Page {requestPage} of {totalRequestPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRequestPage((p) => Math.min(totalRequestPages, p + 1))}
                    disabled={requestPage === totalRequestPages}
                    className="py-1 px-2 text-xs"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: AUDIT HISTORY                                 */}
      {/* ==================================================== */}
      {activeTab === 'audit' && <AuditLogView />}

      {/* ==================================================== */}
      {/* MODAL 1: ROLE CHANGE CONFIRMATION DIALOG             */}
      {/* ==================================================== */}
      {roleChangeTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setRoleChangeTarget(null)}
          onConfirm={handleConfirmRoleChange}
          title="Confirm Role Privilege Assignment"
          variant={roleChangeTarget.newRole === 'admin' ? 'warning' : 'primary'}
          confirmText="Confirm Role Change"
          message={
            <div className="space-y-3">
              <p>
                Are you sure you want to change the role for{' '}
                <strong>{roleChangeTarget.user.fullName}</strong> from{' '}
                <Badge variant="subtle">{roleChangeTarget.user.role}</Badge> to{' '}
                <Badge variant="navy">{roleChangeTarget.newRole}</Badge>?
              </p>
              {roleChangeTarget.newRole === 'admin' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <strong>Warning:</strong> Granting `admin` gives full authority over hospital verifications, role management, and system resources.
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Reason for Role Change (recorded in Audit Log):
                </label>
                <input
                  type="text"
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  placeholder="e.g., Authorized liaison credentials verified"
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
          }
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ADD / EDIT HOSPITAL MODAL                   */}
      {/* ==================================================== */}
      {isHospitalModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsHospitalModalOpen(false)}
          title={editingHospital ? 'Edit Verified Hospital' : 'Register Verified Transplant Center'}
          subtitle="All listings must be supported by official NOTTO/SOTTO gazettes."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveHospitalForm} className="space-y-4">
            {hospitalFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{hospitalFormError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Hospital / Institute Name *
              </label>
              <input
                type="text"
                required
                value={hospitalFormData.name}
                onChange={(e) => setHospitalFormData({ ...hospitalFormData, name: e.target.value })}
                placeholder="e.g. Apollo Hospital Greams Road"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Registration ID (NOTTO/SOTTO) *
                </label>
                <input
                  type="text"
                  required
                  value={hospitalFormData.registrationNumber}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, registrationNumber: e.target.value })}
                  placeholder="e.g. NOTTO-TN-042"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Accreditation / Affiliation
                </label>
                <input
                  type="text"
                  value={hospitalFormData.accreditation}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, accreditation: e.target.value })}
                  placeholder="e.g. NABH / SOTTO Empaneled"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={hospitalFormData.city}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, city: e.target.value })}
                  placeholder="Chennai"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={hospitalFormData.state}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, state: e.target.value })}
                  placeholder="Tamil Nadu"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Address *</label>
              <input
                type="text"
                required
                value={hospitalFormData.address}
                onChange={(e) => setHospitalFormData({ ...hospitalFormData, address: e.target.value })}
                placeholder="21 Greams Lane, Thousand Lights"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Authorized Organ Programs *
              </label>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
                {ALL_ORGAN_TYPES.map((org) => {
                  const isChecked = hospitalFormData.organsSupported.includes(org);
                  return (
                    <label key={org} className="inline-flex items-center gap-1.5 text-xs text-[#0F172A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setHospitalFormData({
                              ...hospitalFormData,
                              organsSupported: [...hospitalFormData.organsSupported, org]
                            });
                          } else {
                            setHospitalFormData({
                              ...hospitalFormData,
                              organsSupported: hospitalFormData.organsSupported.filter((o) => o !== org)
                            });
                          }
                        }}
                        className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="capitalize">{org.replace('_', ' ')}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Coordinator Name</label>
                <input
                  type="text"
                  value={hospitalFormData.coordinatorName}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, coordinatorName: e.target.value })}
                  placeholder="Dr. S. Nair"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Phone</label>
                <input
                  type="text"
                  value={hospitalFormData.coordinatorPhone}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, coordinatorPhone: e.target.value })}
                  placeholder="+91-44-28290200"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Email</label>
                <input
                  type="email"
                  value={hospitalFormData.coordinatorEmail}
                  onChange={(e) => setHospitalFormData({ ...hospitalFormData, coordinatorEmail: e.target.value })}
                  placeholder="transplant@apollo.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Official Portal Citation Source URL *
              </label>
              <input
                type="url"
                required
                value={hospitalFormData.sourceUrl}
                onChange={(e) => setHospitalFormData({ ...hospitalFormData, sourceUrl: e.target.value })}
                placeholder="https://notto.mohfw.gov.in"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsHospitalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingHospital ? 'Update Hospital Record' : 'Save Center to Registry'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: HOSPITAL VERIFICATION REVIEW MODAL          */}
      {/* ==================================================== */}
      {reviewingHospital && (
        <Modal
          isOpen={true}
          onClose={() => setReviewingHospital(null)}
          title="Transplant Center Verification Review"
          subtitle={`Conducting audit for: ${reviewingHospital.name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-xs space-y-1">
              <div>
                <span className="text-[#64748B]">Registration ID: </span>
                <span className="font-mono font-bold text-[#0F172A]">{reviewingHospital.registrationNumber}</span>
              </div>
              <div>
                <span className="text-[#64748B]">Current Status: </span>
                <Badge variant="subtle">{reviewingHospital.reviewStatus}</Badge>
              </div>
              <div>
                <span className="text-[#64748B]">Last Verified Date: </span>
                <span className="font-semibold text-[#0F172A]">{reviewingHospital.sourceVerificationDate}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                New Verification Decision *
              </label>
              <select
                value={newReviewStatus}
                onChange={(e) => setNewReviewStatus(e.target.value as HospitalReviewStatus)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="verified">Verified Active (Compliant with NOTTO standards)</option>
                <option value="pending">Pending Re-Inspection (Awaiting updated state gazette)</option>
                <option value="flagged">Flagged for Audit (Discrepancy or license renewal required)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Verification Audit Notes (Recorded in Audit Trail)
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Confirmed registration against NOTTO 2026 Q1 notification."
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReviewingHospital(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmVerificationReview}
              >
                Save Verification Review
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: DELETE HOSPITAL CONFIRMATION                */}
      {/* ==================================================== */}
      {hospitalToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setHospitalToDelete(null)}
          onConfirm={handleConfirmDeleteHospital}
          title="Remove Hospital from Verified Directory"
          variant="danger"
          confirmText="Delete Center"
          message={`Are you sure you want to remove "${hospitalToDelete.name}" (${hospitalToDelete.registrationNumber}) from the verified directory? This action is logged in the permanent audit trail.`}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 5: ADD / EDIT OFFICIAL RESOURCE MODAL          */}
      {/* ==================================================== */}
      {isResourceModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsResourceModalOpen(false)}
          title={editingResource ? 'Edit Official Resource' : 'Add Official Public Resource'}
          subtitle="Publish trusted schemes, forms, and statutory guidelines for patients."
          maxWidth="md"
        >
          <form onSubmit={handleSaveResourceForm} className="space-y-4">
            {resourceFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{resourceFormError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Resource Title *
              </label>
              <input
                type="text"
                required
                value={resourceFormData.title}
                onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                placeholder="e.g. Ayushman Bharat PM-JAY Specialty Care Package Guidelines"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Category *
                </label>
                <select
                  value={resourceFormData.category}
                  onChange={(e) =>
                    setResourceFormData({
                      ...resourceFormData,
                      category: e.target.value as OfficialResource['category']
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="scheme">Financial Scheme</option>
                  <option value="form">THOTA Form</option>
                  <option value="statutory_act">Statutory Act</option>
                  <option value="portal">Official Portal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Governing Authority *
                </label>
                <input
                  type="text"
                  required
                  value={resourceFormData.authorityName}
                  onChange={(e) =>
                    setResourceFormData({ ...resourceFormData, authorityName: e.target.value })
                  }
                  placeholder="e.g. National Health Authority (NHA)"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Description & Patient Scope *
              </label>
              <textarea
                rows={3}
                required
                value={resourceFormData.description}
                onChange={(e) =>
                  setResourceFormData({ ...resourceFormData, description: e.target.value })
                }
                placeholder="Covers up to ₹5 Lakhs for organ transplant surgery and immunosuppressants."
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Official Citation Portal URL *
              </label>
              <input
                type="url"
                required
                value={resourceFormData.officialUrl}
                onChange={(e) =>
                  setResourceFormData({ ...resourceFormData, officialUrl: e.target.value })
                }
                placeholder="https://pmjay.gov.in"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsResourceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingResource ? 'Update Resource' : 'Publish Resource'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: DELETE RESOURCE CONFIRMATION                */}
      {/* ==================================================== */}
      {resourceToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setResourceToDelete(null)}
          onConfirm={handleConfirmDeleteResource}
          title="Remove Official Resource"
          variant="danger"
          confirmText="Delete Resource"
          message={`Are you sure you want to remove "${resourceToDelete.title}"? Users will no longer find this item under resources.`}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 7: REQUEST OVERSIGHT & VOLUNTEER REASSIGNMENT  */}
      {/* ==================================================== */}
      {managingRequest && (
        <Modal
          isOpen={true}
          onClose={() => setManagingRequest(null)}
          title="Assistance Request Oversight"
          subtitle={`Case ID: ${managingRequest.id} — ${managingRequest.patientName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-xs space-y-1">
              <div>
                <span className="text-[#64748B]">Support Requested: </span>
                <span className="font-semibold text-[#0F172A]">{managingRequest.supportType}</span>
              </div>
              <div>
                <span className="text-[#64748B]">Hospital: </span>
                <span className="font-semibold text-[#0F172A]">{managingRequest.hospitalName}</span>
              </div>
              <div>
                <span className="text-[#64748B]">Patient Notes: </span>
                <span className="text-[#0F172A] italic">"{managingRequest.notes || 'None'}"</span>
              </div>
            </div>

            <div>
              <label htmlFor="oversight-status-select" className="block text-xs font-semibold text-[#0F172A] mb-1">
                Case Status *
              </label>
              <select
                id="oversight-status-select"
                value={oversightStatus}
                onChange={(e) => setOversightStatus(e.target.value as RequestStatus)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="submitted">Submitted (New Request)</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned to Volunteer</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="oversight-volunteer-select" className="block text-xs font-semibold text-[#0F172A] mb-1">
                Assign / Reassign Vetted Volunteer Navigator
              </label>
              <select
                id="oversight-volunteer-select"
                value={oversightVolunteerId}
                onChange={(e) => setOversightVolunteerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="">-- Unassigned --</option>
                {VETTED_VOLUNTEERS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.specialization} — {v.activeCases} active cases)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Administrative Coordinator Notes
              </label>
              <textarea
                rows={3}
                value={oversightNotes}
                onChange={(e) => setOversightNotes(e.target.value)}
                placeholder="e.g., Direct escort at AIIMS Nodal counter Gate 2 arranged."
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManagingRequest(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveRequestOversight}
              >
                Apply Case Updates
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
