import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  Hospital,
  Info,
  Lock,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  CreateHospitalRequestInput,
  createHospitalAssistanceRequest
} from '../../lib/store';
import {
  HospitalAssistanceCategory,
  HospitalAssistanceRequest,
  OrganType,
  VerifiedHospital
} from '../../types';

// Helper: Validates Indian mobile numbers (10 digits starting with 6, 7, 8, or 9)
// Accepts optional +91, 91, or 0 prefixes and ignores spaces, hyphens, dots, parentheses
export const isValidIndianMobile = (phone: string): boolean => {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  const digitsOnly = trimmed.replace(/[\s\-\(\)\.]/g, '');
  return /^(?:\+?91|0)?[6-9]\d{9}$/.test(digitsOnly);
};

// Helper: Validates RFC-compliant email address format
export const isValidEmail = (email: string): boolean => {
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

interface HospitalAssistanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: VerifiedHospital;
  initialOrgan?: OrganType;
  onSuccess?: (request: HospitalAssistanceRequest) => void;
}

export const HospitalAssistanceRequestModal: React.FC<HospitalAssistanceRequestModalProps> = ({
  isOpen,
  onClose,
  hospital,
  initialOrgan,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();

  // Form State
  const [selectedOrgan, setSelectedOrgan] = useState<OrganType>(
    initialOrgan && hospital.organsSupported.includes(initialOrgan)
      ? initialOrgan
      : hospital.organsSupported[0] || 'kidney'
  );
  const [category, setCategory] = useState<HospitalAssistanceCategory>('official_registration');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'in_app'>('phone');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [consentGiven, setConsentGiven] = useState(false);

  // Synchronize state when modal opens or initialOrgan/currentUser changes
  useEffect(() => {
    if (isOpen) {
      if (initialOrgan && hospital.organsSupported.includes(initialOrgan)) {
        setSelectedOrgan(initialOrgan);
      } else if (!hospital.organsSupported.includes(selectedOrgan)) {
        setSelectedOrgan(hospital.organsSupported[0] || 'kidney');
      }
      if (currentUser?.phone && !contactPhone) {
        setContactPhone(currentUser.phone);
      }
      if (currentUser?.email && !contactEmail) {
        setContactEmail(currentUser.email);
      }
    }
  }, [isOpen, initialOrgan, hospital, currentUser]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<HospitalAssistanceRequest | null>(null);

  // Trimmed validation state checks
  const trimmedDescription = description.trim();
  const trimmedPhone = contactPhone.trim();
  const trimmedEmail = contactEmail.trim();

  const effectivePhone = trimmedPhone || (currentUser?.phone || '').trim();
  const effectiveEmail = trimmedEmail || (currentUser?.email || '').trim();

  const isDescriptionValid = trimmedDescription.length >= 10;
  const isPhoneValid =
    contactMethod === 'phone'
      ? isValidIndianMobile(effectivePhone)
      : effectivePhone.length === 0 || isValidIndianMobile(effectivePhone);
  const isEmailValid =
    contactMethod === 'email'
      ? isValidEmail(effectiveEmail)
      : effectiveEmail.length === 0 || isValidEmail(effectiveEmail);
  const isContactValid = isPhoneValid && isEmailValid;
  const isAuthorized = Boolean(
    currentUser &&
      currentUser.isActive !== false &&
      (currentUser.role === 'patient' || currentUser.role === 'family' || currentUser.role === 'admin')
  );
  const isFormValid = isDescriptionValid && consentGiven && isContactValid && isAuthorized;

  const resetForm = () => {
    setDescription('');
    setConsentGiven(false);
    setSubmitError(null);
    setCreatedRequest(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSubmitting) return;

    if (!currentUser) {
      setSubmitError('Authentication required. Please sign in with a patient account to submit an assistance request.');
      return;
    }

    if (currentUser.isActive === false) {
      setSubmitError('Account access restricted. Unverified or inactive accounts cannot submit hospital assistance requests.');
      return;
    }

    if (currentUser.role !== 'patient' && currentUser.role !== 'family' && currentUser.role !== 'admin') {
      setSubmitError('Unauthorized: Hospital assistance requests can only be initiated by registered Patients or Family Caregivers.');
      return;
    }

    if (!isDescriptionValid) {
      setSubmitError('Please provide at least 10 characters describing the assistance you need.');
      return;
    }

    if (contactMethod === 'phone' && !isValidIndianMobile(effectivePhone)) {
      setSubmitError('Please provide a valid 10-digit Indian contact phone number (+91 or 91 optional) for the hospital coordinator.');
      return;
    }

    if (contactMethod === 'email' && !isValidEmail(effectiveEmail)) {
      setSubmitError('Please provide a valid contact email address for coordination updates.');
      return;
    }

    if (!consentGiven) {
      setSubmitError('You must provide informed consent to transmit this request to the hospital nodal desk.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const input: CreateHospitalRequestInput = {
        hospitalId: hospital.id,
        organProgram: selectedOrgan,
        requestCategory: category,
        description: trimmedDescription,
        preferredContactMethod: contactMethod,
        contactPhone: effectivePhone || currentUser.phone,
        contactEmail: effectiveEmail || currentUser.email,
        consentGiven: true
      };

      const result = createHospitalAssistanceRequest(input, currentUser);

      if (!result.success || !result.request) {
        setSubmitError(result.error || 'Failed to submit assistance request. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setCreatedRequest(result.request);
      if (onSuccess) {
        onSuccess(result.request);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdRequest ? 'Assistance Request Confirmed' : 'Request Transplant Assistance'}
      subtitle={
        createdRequest
          ? `Reference ID: ${createdRequest.referenceNumber}`
          : `Direct administrative coordination with ${hospital.name}`
      }
      maxWidth="lg"
    >
      <div className="text-left py-2">
        {/* If user is not logged in */}
        {!currentUser ? (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Patient Authentication Required</span>
              </div>
              <p>
                To coordinate safely with verified hospital transplant desks and track your request privately, please sign in or register as a patient.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleClose();
                  navigate('/auth/login', { state: { returnTo: `/hospitals/${hospital.id}` } });
                }}
              >
                Sign In to Proceed
              </Button>
            </div>
          </div>
        ) : createdRequest ? (
          /* Confirmation Screen */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/25 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Submitted to Hospital Coordination Desk
                </Badge>
                <span className="text-[11px] text-[#64748B]">
                  {new Date(createdRequest.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#64748B] block">Permanent Reference Code:</span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#1D4ED8] tracking-tight">
                  {createdRequest.referenceNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block">Hospital:</span>
                  <span className="font-semibold text-[#0F172A]">{createdRequest.hospitalName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Organ Program:</span>
                  <span className="font-semibold text-[#0F172A] capitalize">
                    {createdRequest.organProgram.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                What Happens Next in the Coordination Workflow
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">Request Logged with Institutional Audit Stamp</strong>
                    <span className="text-[#64748B] text-[11px]">
                      Your request is recorded securely in {hospital.name}'s coordinator inbox.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB]/15 text-[#1D4ED8] font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">Nodal Coordinator Review</strong>
                    <span className="text-[#64748B] text-[11px]">
                      Authorized liaison staff will evaluate your administrative query and verify statutory documentation.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-[#64748B] font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">In-App Updates & Consultation Connect</strong>
                    <span className="text-[#64748B] text-[11px]">
                      You will receive notifications in your patient workspace if additional documents are needed.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <Alert variant="statutory" title="Official Waiting-List Clarification">
              This request is for administrative guidance and hospital liaison only. It does NOT register you on the official NOTTO/SOTTO waiting list or guarantee organ availability. Official waiting-list registration requires physical OPD evaluation and statutory committee clearance.
            </Alert>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Close Window
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleClose();
                  navigate('/patient', { state: { tab: 'my_requests' } });
                }}
              >
                View My Requests
              </Button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Prefilled Hospital Card */}
            <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                  <Building2 className="w-4 h-4 text-[#2563EB]" />
                  <span>{hospital.name}</span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Reg: <span className="font-mono text-[#0F172A]">{hospital.registrationNumber}</span> • {hospital.city}, {hospital.state}
                </div>
              </div>
              <Badge variant="primary" size="sm">
                Verified Center
              </Badge>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organ Program Selector (Strictly limited to hospital verified programs) */}
              <div className="space-y-1.5 text-xs">
                <label htmlFor="organ-program-select" className="font-semibold text-[#0F172A] block">
                  Organ or Transplant Program <span className="text-rose-500">*</span>
                </label>
                <select
                  id="organ-program-select"
                  value={selectedOrgan}
                  onChange={(e) => setSelectedOrgan(e.target.value as OrganType)}
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                >
                  {hospital.organsSupported.map((organ) => (
                    <option key={organ} value={organ}>
                      {organ.replace('_', ' ').toUpperCase()} (Verified Program)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#64748B]">
                  Restricted to services verified under Section 14 of THOTA 1994.
                </p>
              </div>

              {/* Request Category Selector */}
              <div className="space-y-1.5 text-xs">
                <label htmlFor="request-category-select" className="font-semibold text-[#0F172A] block">
                  Assistance Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="request-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HospitalAssistanceCategory)}
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                >
                  <option value="official_registration">Official Registration Assistance (NOTTO/SOTTO)</option>
                  <option value="transplant_guidance">Transplant Guidance & Medical Pathway</option>
                  <option value="document_guidance">Document Guidance (Form 1/2/3 Affidavits)</option>
                  <option value="hospital_coordination">Hospital Coordination & Nodal Liaison</option>
                  <option value="financial_counseling">Government Financial Scheme Guidance</option>
                </select>
              </div>
            </div>

            {/* Assistance Description */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label htmlFor="request-description" className="font-semibold text-[#0F172A]">
                  Short Description of Assistance Needed <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span
                    className={
                      trimmedDescription.length < 10
                        ? 'text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200'
                        : 'text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200'
                    }
                  >
                    {trimmedDescription.length}/10 min characters
                  </span>
                  <span className="text-[#64748B]">({description.length}/1000 max)</span>
                </div>
              </div>
              <textarea
                id="request-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                placeholder="Briefly describe what assistance you need (e.g., guidance on Form 1 near-relative joint affidavit, connecting with the transplant nodal coordinator, or AB-PMJAY scheme documentation)..."
                className={`w-full p-3 rounded-lg border bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 transition-colors ${
                  trimmedDescription.length > 0 && trimmedDescription.length < 10
                    ? 'border-amber-400 focus:ring-amber-400/30 focus:border-amber-500'
                    : isDescriptionValid
                    ? 'border-[#CBD5E1] focus:ring-[#2563EB]/30 focus:border-[#2563EB]'
                    : 'border-[#CBD5E1] focus:ring-[#2563EB]/30 focus:border-[#2563EB]'
                }`}
              />
              {/* Inline explanation & live feedback */}
              {trimmedDescription.length === 0 ? (
                <p className="text-[11px] text-[#64748B]">
                  Minimum 10 characters required. Do not upload diagnostic reports or sensitive genetic data here.
                </p>
              ) : trimmedDescription.length < 10 ? (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Please provide at least 10 characters ({trimmedDescription.length} entered so far).
                  </span>
                </p>
              ) : (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Description meets minimum length requirement ({trimmedDescription.length} characters).</span>
                </p>
              )}
            </div>

            {/* Contact Details & Preferred Method */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
              <span className="text-xs font-bold text-[#0F172A] block">
                Preferred Coordination Contact
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label htmlFor="contact-method-select" className="text-[11px] text-[#64748B] block mb-1">
                    Contact Method
                  </label>
                  <select
                    id="contact-method-select"
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as 'phone' | 'email' | 'in_app')}
                    className="w-full h-9 px-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="in_app">In-App Portal Only</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="request-phone-input" className="text-[11px] text-[#64748B] block mb-1">
                    Phone Number {contactMethod === 'phone' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    id="request-phone-input"
                    aria-label="Phone Number"
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91-98765-43210"
                    className={`w-full h-9 px-2 rounded-lg border bg-white text-xs focus:outline-none ${
                      contactMethod === 'phone' && effectivePhone.length > 0 && !isValidIndianMobile(effectivePhone)
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/30'
                        : 'border-[#CBD5E1] focus:border-[#2563EB]'
                    }`}
                  />
                  {contactMethod === 'phone' && effectivePhone.length === 0 ? (
                    <p className="text-[10px] text-rose-600 font-medium mt-1 leading-tight">
                      Valid 10-digit Indian mobile number is required when Phone Call is selected.
                    </p>
                  ) : effectivePhone.length > 0 && !isValidIndianMobile(effectivePhone) ? (
                    <p className="text-[10px] text-rose-600 font-medium mt-1 leading-tight">
                      Please enter a valid 10-digit Indian mobile number (e.g. +91-98765-43210 or 9876543210).
                    </p>
                  ) : effectivePhone.length > 0 && isValidIndianMobile(effectivePhone) ? (
                    <p className="text-[10px] text-emerald-600 font-medium mt-1 leading-tight">
                      ✓ Valid 10-digit mobile number.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="request-email-input" className="text-[11px] text-[#64748B] block mb-1">
                    Email Address {contactMethod === 'email' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    id="request-email-input"
                    aria-label="Email Address"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className={`w-full h-9 px-2 rounded-lg border bg-white text-xs focus:outline-none ${
                      contactMethod === 'email' && effectiveEmail.length > 0 && !isValidEmail(effectiveEmail)
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/30'
                        : 'border-[#CBD5E1] focus:border-[#2563EB]'
                    }`}
                  />
                  {contactMethod === 'email' && effectiveEmail.length === 0 ? (
                    <p className="text-[10px] text-rose-600 font-medium mt-1 leading-tight">
                      Valid email address is required when Email is selected.
                    </p>
                  ) : effectiveEmail.length > 0 && !isValidEmail(effectiveEmail) ? (
                    <p className="text-[10px] text-rose-600 font-medium mt-1 leading-tight">
                      Please enter a valid email address (e.g. name@example.com).
                    </p>
                  ) : effectiveEmail.length > 0 && isValidEmail(effectiveEmail) ? (
                    <p className="text-[10px] text-emerald-600 font-medium mt-1 leading-tight">
                      ✓ Valid email address format.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Sensitive Data Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-[#64748B]">
              <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>Privacy & Sensitive Data Handling Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                <strong>Why are contact and organ details required?</strong> They allow authorized hospital staff at {hospital.name} to triage your assistance query under Section 14 of THOTA 1994. No personal details are sold, rented, or made public.
              </p>
              <p className="text-[11px] leading-relaxed text-[#1D4ED8]">
                <strong>Donor Protection:</strong> Transplant Saathi never matches, selects, or requests organs from individual donors. Any donor discussions must strictly follow the statutory Authorization Committee route.
              </p>
            </div>

            {/* Informed Consent Checkbox */}
            <div className="space-y-1">
              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hospital-assistance-consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB] cursor-pointer"
                />
                <label
                  htmlFor="hospital-assistance-consent"
                  className="text-xs text-[#0F172A] leading-relaxed cursor-pointer font-medium"
                >
                  I consent to transmitting this assistance inquiry to the verified transplant coordination desk of{' '}
                  <strong>{hospital.name}</strong>. I understand this request is an administrative guidance query and NOT an official waiting-list registration, clinical approval, or organ offer.
                </label>
              </div>
              {!consentGiven && (
                <p className="text-[11px] text-amber-700 font-medium px-1">
                  Informed consent is required before transmitting this assistance request.
                </p>
              )}
            </div>

            {/* Action required explanation banner when form is not yet valid */}
            {!isFormValid && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Required items before submission:</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                  {!isDescriptionValid && (
                    <li>
                      Short description must be at least 10 characters (currently {trimmedDescription.length}/10)
                    </li>
                  )}
                  {contactMethod === 'phone' && !isPhoneValid && (
                    <li>Valid phone number is required when Phone Call is selected</li>
                  )}
                  {contactMethod === 'email' && !isEmailValid && (
                    <li>Valid email address is required when Email is selected</li>
                  )}
                  {!consentGiven && (
                    <li>Informed consent checkbox must be selected</li>
                  )}
                </ul>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Assistance Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
