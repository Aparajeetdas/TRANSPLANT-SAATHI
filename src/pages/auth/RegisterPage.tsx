import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Heart,
  Hospital,
  Info,
  Lock,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import {
  registerDonorPledge,
  setStoredUser,
  submitHospitalRegistrationApplication
} from '../../lib/store';

import { isSupabaseConfigured } from '../../lib/supabase';
import { PledgedOrganCategory } from '../../types';

// ==============================================================================
// Schemas
// ==============================================================================

const patientSchema = z
  .object({
    fullName: z.string().min(2, 'Please enter your full legal name'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
    role: z.enum(['patient', 'family'], {
      message: 'Please select whether you are a patient or a family caregiver'
    }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type PatientFormData = z.infer<typeof patientSchema>;

const donorSchema = z
  .object({
    fullName: z.string().min(2, 'Please enter your full legal name'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    state: z.string().min(2, 'Please select your state of residence'),
    city: z.string().optional(),
    bloodGroup: z.string().optional(),
    familyInformed: z.boolean(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    nottoRegistrationNumber: z.string().optional(),
    isPublicPledgeAnonymous: z.boolean(),
    agreeConsent: z.boolean().refine((val) => val === true, 'Explicit consent under THOTA 1994 is required')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type DonorFormData = z.infer<typeof donorSchema>;

const hospitalSchema = z
  .object({
    hospitalName: z.string().min(3, 'Please enter the official legal name of the institution'),
    registrationNumber: z.string().min(3, 'Please provide the NOTTO or State statutory licensing registration number'),
    state: z.string().min(2, 'Please select the state or union territory'),
    city: z.string().min(2, 'Please enter the city or district'),
    coordinatorName: z.string().min(2, 'Please enter the name of the authorized coordinator or medical superintendent'),
    officialEmail: z.string().email('Please enter an official institutional email address'),
    officialPhone: z.string().min(8, 'Please enter an official telephone number'),
    accreditation: z.string().min(2, 'Please enter accreditation or licensing status'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    certifyAuthorization: z.boolean().refine((val) => val === true, 'You must certify institutional representation')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type HospitalFormData = z.infer<typeof hospitalSchema>;

type AccountTypeOption = 'donor' | 'patient' | 'hospital';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const ORGAN_OPTIONS: { id: PledgedOrganCategory; label: string }[] = [
  { id: 'all', label: 'All Organs & Tissues' },
  { id: 'kidney', label: 'Kidneys' },
  { id: 'liver', label: 'Liver' },
  { id: 'heart', label: 'Heart' },
  { id: 'lungs', label: 'Lungs' },
  { id: 'cornea', label: 'Corneas (Eyes)' },
  { id: 'pancreas', label: 'Pancreas' },
  { id: 'bone_marrow', label: 'Bone Marrow' },
  { id: 'tissues', label: 'Tissues' }
];

const createDonorUserMetadata = () => ({
  id: `usr-dnr-${Date.now()}`,
  createdAt: new Date().toISOString()
});

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signUpWithEmail } = useAuth();

  // Read initial account type from URL or default to selection step
  const rawType = searchParams.get('type');
  const initialType: AccountTypeOption | null =
    rawType === 'donor' || rawType === 'patient' || rawType === 'hospital' ? rawType : null;

  const [selectedType, setSelectedType] = useState<AccountTypeOption | null>(initialType);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [registeredPublicDonorId, setRegisteredPublicDonorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [hospitalApplicationSubmitted, setHospitalApplicationSubmitted] = useState<HospitalFormData | null>(null);
  const [selectedOrgans, setSelectedOrgans] = useState<PledgedOrganCategory[]>(['all']);

  // Handle account type selection
  const handleSelectAccountType = (type: AccountTypeOption) => {
    setSelectedType(type);
    setSearchParams({ type });
    setAuthError(null);
  };

  const handleBackToSelection = () => {
    setSelectedType(null);
    setSearchParams({});
    setAuthError(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Toggle organ selection
  const handleToggleOrgan = (organId: PledgedOrganCategory) => {
    if (organId === 'all') {
      setSelectedOrgans(['all']);
      return;
    }
    const withoutAll = selectedOrgans.filter((o) => o !== 'all');
    if (withoutAll.includes(organId)) {
      const remaining = withoutAll.filter((o) => o !== organId);
      setSelectedOrgans(remaining.length > 0 ? remaining : ['all']);
    } else {
      setSelectedOrgans([...withoutAll, organId]);
    }
  };

  // Patient form hook
  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'patient',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    }
  });

  // Donor form hook
  const donorForm = useForm<DonorFormData>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      state: 'Delhi',
      city: '',
      bloodGroup: '',
      familyInformed: true,
      emergencyContactName: '',
      emergencyContactPhone: '',
      nottoRegistrationNumber: '',
      isPublicPledgeAnonymous: true,
      agreeConsent: false
    }
  });

  // Hospital form hook
  const hospitalForm = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      hospitalName: '',
      registrationNumber: '',
      state: 'Delhi',
      city: '',
      coordinatorName: '',
      officialEmail: '',
      officialPhone: '',
      accreditation: 'NABH / State Statutory License',
      password: '',
      confirmPassword: '',
      certifyAuthorization: false
    }
  });

  // 1. Submit Patient Form
  const onPatientSubmit = async (data: PatientFormData) => {
    setAuthError(null);
    setSuccessNotice(null);

    const result = await signUpWithEmail(
      data.email,
      data.password,
      data.fullName,
      data.role,
      data.phone
    );

    if (!result.success) {
      setAuthError(result.error || 'Failed to create patient account. Please check your information.');
      return;
    }

    if (result.requiresEmailVerification) {
      navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      return;
    }

    setSuccessNotice('Patient account created successfully! Loading your personal patient workspace...');
    setTimeout(() => {
      navigate('/patient');
    }, 1200);
  };

  // 2. Submit Donor Form
  const onDonorSubmit = async (data: DonorFormData) => {
    setAuthError(null);
    setSuccessNotice(null);

    if (selectedOrgans.length === 0) {
      setAuthError('Please select at least one organ category or all organs to pledge.');
      return;
    }

    // Create user authentication account with safe role 'donor'
    const authResult = await signUpWithEmail(
      data.email,
      data.password,
      data.fullName,
      'donor',
      data.phone
    );

    if (!authResult.success) {
      setAuthError(authResult.error || 'Failed to create donor account credentials.');
      return;
    }

    // Register donor pledge record with public donor ID
    const pledgeResult = registerDonorPledge(
      {
        pledgedOrgans: selectedOrgans,
        state: data.state,
        city: data.city,
        bloodGroup: data.bloodGroup,
        familyInformed: data.familyInformed,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        officialNottoRegistrationNumber: data.nottoRegistrationNumber,
        isPublicPledgeAnonymous: data.isPublicPledgeAnonymous
      },
      (() => {
        const meta = createDonorUserMetadata();
        return {
          id: meta.id,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          role: 'donor' as const,
          isActive: true,
          createdAt: meta.createdAt
        };
      })()
    );

    if (!pledgeResult.success || !pledgeResult.profile) {
      setAuthError(pledgeResult.error || 'Failed to record donor pledge details.');
      return;
    }

    setRegisteredPublicDonorId(pledgeResult.profile.publicDonorId);
  };

  // 3. Submit Hospital Form (Statutory verification pipeline)
  const onHospitalSubmit = async (data: HospitalFormData) => {
    setAuthError(null);
    setSuccessNotice(null);

    // If live Supabase backend is configured, register credentials under safe unprivileged 'patient' role
    if (isSupabaseConfigured) {
      const authResult = await signUpWithEmail(
        data.officialEmail,
        data.password,
        `${data.coordinatorName} (${data.hospitalName})`,
        'patient', // Baseline unprivileged role - hospital staff privileges are never granted automatically
        data.officialPhone
      );

      if (!authResult.success) {
        setAuthError(authResult.error || 'Failed to create coordinator account credentials.');
        return;
      }
    }

    const result = submitHospitalRegistrationApplication({
      hospitalName: data.hospitalName,
      registrationNumber: data.registrationNumber,
      state: data.state,
      city: data.city,
      coordinatorName: data.coordinatorName,
      officialEmail: data.officialEmail,
      officialPhone: data.officialPhone,
      accreditation: data.accreditation
    });

    if (!result.success) {
      setAuthError(result.error || 'Failed to submit hospital verification application.');
      return;
    }

    if (result.user) {
      setStoredUser(result.user);
    }

    setHospitalApplicationSubmitted(data);
  };

  // ==============================================================================
  // Render: Donor Registration Success State
  // ==============================================================================
  if (registeredPublicDonorId) {
    return (
      <div className="py-8 sm:py-12 max-w-lg mx-auto text-left space-y-6">
        <div className="bg-white rounded-2xl border-2 border-[#2563EB]/30 shadow-md p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4F8FF] text-[#2563EB] text-xs font-semibold border border-[#2563EB]/20 mb-3">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Organ Donor Account Created
          </span>

          <h2 className="text-2xl font-bold text-[#0F172A] font-heading mb-2">
            Welcome to the Donor Network
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Your voluntary pledge has been recorded under your permanent, anonymous Public Donor ID. Personal identifying details are kept strictly private.
          </p>

          <div className="bg-[#F4F8FF] border border-[#2563EB]/30 rounded-2xl p-4 mb-6 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
              Your Public Donor ID
            </span>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-[#CBD5E1]">
              <span className="text-lg font-mono font-bold text-[#1D4ED8]">
                {registeredPublicDonorId}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(registeredPublicDonorId)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4F8FF] text-[#2563EB] hover:bg-[#2563EB]/15 text-xs font-semibold"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] mt-2 flex items-start gap-1">
              <Lock className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
              <span>Real names and contact information are protected under DPDP Act 2023.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/donor')}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs hover:bg-[#1D4ED8] transition-colors"
            >
              <span>Go to Donor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs hover:bg-[#F4F8FF]"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // Render: Hospital Application Submitted State (Pending Verification)
  // ==============================================================================
  if (hospitalApplicationSubmitted) {
    return (
      <div className="py-8 sm:py-12 max-w-lg mx-auto text-left space-y-6">
        <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Building2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            Statutory Verification Under Review
          </span>

          <h2 className="text-2xl font-bold text-[#0F172A] font-heading mb-2">
            Institutional Registration Submitted
          </h2>

          <p className="text-xs text-[#64748B] leading-relaxed mb-6">
            Your application for <strong>{hospitalApplicationSubmitted.hospitalName}</strong> (License: <strong>{hospitalApplicationSubmitted.registrationNumber}</strong>) has been recorded in our compliance registry.
          </p>

          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 text-left space-y-2 mb-6">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>THOTA 1994 Compliance Verification Required</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              In accordance with Section 11 of the Transplantation of Human Organs and Tissues Act, clinical portal privileges are <strong>never automatically granted</strong> upon public registration. Platform administrators independently verify institutional statutory licenses before activating hospital staff access.
            </p>
            <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-800">
              Representative Coordinator: <strong>{hospitalApplicationSubmitted.coordinatorName}</strong> &bull; Institutional Contact: <strong>{hospitalApplicationSubmitted.officialEmail}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/directory"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs hover:bg-[#1D4ED8] transition-colors"
            >
              <span>Browse Verified Hospital Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs hover:bg-[#F4F8FF]"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // STEP 1: Account-Type Selection Step (Donor, Patient, Hospital)
  // ==============================================================================
  if (!selectedType) {
    return (
      <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 text-left space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/25 text-xs font-semibold text-[#1D4ED8]">
            <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Select Account Registration Path</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight">
            Create Your Transplant Saathi Account
          </h1>

          <p className="text-sm text-[#64748B] leading-relaxed">
            Choose the registration option that matches your role. Strict pseudonymity, identity protection, and statutory THOTA 1994 compliance are enforced across all paths.
          </p>
        </div>

        {/* 3 Responsive Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Option 1: Organ Donor */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] hover:border-[#2563EB] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F8FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Altruistic Donor
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0F172A] font-heading group-hover:text-[#2563EB] transition-colors">
                  Register as a Donor
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Record voluntary intention to donate organs and tissues upon brain-stem death.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#0F172A]">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unique Public Donor ID (<code className="font-mono text-[#1D4ED8]">TS-DNR-XXXX</code>)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Real identity kept private under DPDP Act</span>
                </div>
                <div className="flex items-start gap-2">
                  <Scale className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Official NOTTO Form 7 statutory guidance</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleSelectAccountType('donor')}
                className="w-full justify-center"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue as Donor
              </Button>
            </div>
          </div>

          {/* Option 2: Patient or Caregiver */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] hover:border-[#2563EB] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F8FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Recipient & Family
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0F172A] font-heading group-hover:text-[#2563EB] transition-colors">
                  Register as a Patient
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  For individuals and family caregivers seeking transplant navigation and legal guidance.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#0F172A]">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Anonymous Public User ID (<code className="font-mono text-[#1D4ED8]">TS-XXXX-XXXX</code>)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Hospital className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Verified hospital directory & nodal contacts</span>
                </div>
                <div className="flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>THOTA Form 1/2 checklists & volunteer Saathi</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleSelectAccountType('patient')}
                className="w-full justify-center"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue as Patient
              </Button>
            </div>
          </div>

          {/* Option 3: Hospital Institution */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] hover:border-[#2563EB] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F8FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Verification Required
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0F172A] font-heading group-hover:text-[#2563EB] transition-colors">
                  Register as a Hospital
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  For accredited transplant centers and licensed organ retrieval institutions.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#0F172A]">
                <div className="flex items-start gap-2">
                  <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>NOTTO / State statutory license validation</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Mandatory administrative approval before access</span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                  <span>Prevents unauthorized clinical privilege elevation</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => handleSelectAccountType('hospital')}
                className="w-full justify-center border-[#CBD5E1] text-[#0F172A] hover:bg-[#F4F8FF] hover:border-[#2563EB]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue as Hospital
              </Button>
            </div>
          </div>
        </div>

        {/* Existing account prompt */}
        <div className="text-center text-xs text-[#64748B] pt-4 border-t border-[#E2E8F0]">
          Already have a Transplant Saathi account?{' '}
          <Link to="/auth/login" className="text-[#2563EB] font-bold hover:underline">
            Sign In to Your Workspace
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // STEP 2A: Patient / Family Caregiver Registration Form
  // ==============================================================================
  if (selectedType === 'patient') {
    return (
      <div className="py-8 sm:py-12 max-w-md mx-auto text-left space-y-6">
        {/* Navigation & Progress Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToSelection}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Account Type</span>
          </button>
          <span className="text-[11px] font-mono font-bold text-[#2563EB] bg-[#F4F8FF] px-2.5 py-0.5 rounded-full border border-[#2563EB]/20">
            Step 2 of 2: Patient
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mx-auto shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
            Create Patient & Family Account
          </h1>
          <p className="text-xs text-[#64748B]">
            Register for secure administrative navigation, checklist tracking, and expense planning.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-start gap-3 text-xs">
          <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-[#0F172A]">Strict Public Role Governance</div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Public accounts are strictly restricted to <strong>Patients</strong> and <strong>Family Caregivers</strong>. Hospital staff, coordinators, and volunteers require administrative authorization and cannot be self-selected.
            </p>
          </div>
        </div>

        {authError && (
          <Alert variant="danger" title="Registration Error">
            {authError}
          </Alert>
        )}

        {successNotice && (
          <Alert variant="contrast" title="Registration Completed">
            {successNotice}
          </Alert>
        )}

        <Card>
          <CardContent className="space-y-4 pt-0">
            <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
              <Input
                label="Full Legal Name"
                required
                placeholder="e.g. Ananya Sharma"
                error={patientForm.formState.errors.fullName?.message}
                {...patientForm.register('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                error={patientForm.formState.errors.email?.message}
                {...patientForm.register('email')}
              />

              <Input
                label="Mobile Phone Number"
                type="tel"
                required
                placeholder="98765 43210"
                error={patientForm.formState.errors.phone?.message}
                {...patientForm.register('phone')}
              />

              {/* Public Role Choice (strictly patient or family) */}
              <div className="space-y-1.5">
                <label htmlFor="role-select" className="block text-xs font-semibold text-[#0F172A]">
                  Account Type <span className="text-[#2563EB]">*</span>
                </label>
                <select
                  id="role-select"
                  aria-label="Select account type"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                  {...patientForm.register('role')}
                >
                  <option value="patient">Patient (Organ Recipient / Transplant Candidate)</option>
                  <option value="family">Family Member / Primary Caregiver</option>
                </select>
                {patientForm.formState.errors.role && (
                  <p className="text-[11px] font-semibold text-red-600">
                    {patientForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              <Input
                label="Password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                error={patientForm.formState.errors.password?.message}
                {...patientForm.register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                placeholder="Re-enter password"
                error={patientForm.formState.errors.confirmPassword?.message}
                {...patientForm.register('confirmPassword')}
              />

              <div className="space-y-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-[#64748B]">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    {...patientForm.register('agreeTerms')}
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/privacy" className="text-[#2563EB] font-bold hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    and acknowledge that Transplant Saathi provides non-clinical navigation only.
                  </span>
                </label>
                {patientForm.formState.errors.agreeTerms && (
                  <p className="text-[11px] font-semibold text-[#1D4ED8]">
                    {patientForm.formState.errors.agreeTerms.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  isLoading={patientForm.formState.isSubmitting}
                  className="w-full"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Create Patient Account
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={handleBackToSelection}
                  className="shrink-0"
                >
                  Cancel
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-[#2563EB] font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================================================
  // STEP 2B: Organ Donor Registration Form
  // ==============================================================================
  if (selectedType === 'donor') {
    return (
      <div className="py-8 sm:py-12 max-w-2xl mx-auto text-left space-y-6">
        {/* Navigation & Progress Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToSelection}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Account Type</span>
          </button>
          <span className="text-[11px] font-mono font-bold text-[#2563EB] bg-[#F4F8FF] px-2.5 py-0.5 rounded-full border border-[#2563EB]/20">
            Step 2 of 2: Organ Donor
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mx-auto shadow-sm">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
            Register as an Organ Donor
          </h1>
          <p className="text-xs text-[#64748B] max-w-xl mx-auto">
            Record voluntary intention to donate organs and tissues upon brain-stem death. A unique, immutable Public Donor ID (<span className="font-mono text-[#1D4ED8] font-bold">TS-DNR-XXXX-XXXX</span>) will be generated.
          </p>
        </div>

        {/* Statutory Distinction Notice */}
        <div className="p-4 rounded-2xl bg-white border border-[#2563EB]/25 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#0F172A]">
            <Scale className="w-4 h-4 text-[#2563EB]" />
            <span>Statutory THOTA 1994 Safeguards & Legal Distinction</span>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            Transplant Saathi records voluntary intention and navigation support. Official statutory registration is maintained by NOTTO under Form 7 at <a href="https://notto.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] underline">notto.mohfw.gov.in</a>. In India, deceased organ retrieval legally requires informed written consent from next-of-kin under THOTA Rule 11.
          </p>
        </div>

        {authError && (
          <Alert variant="danger" title="Registration Error">
            {authError}
          </Alert>
        )}

        <Card>
          <CardContent className="space-y-6 pt-0">
            <form onSubmit={donorForm.handleSubmit(onDonorSubmit)} className="space-y-6">
              {/* Account Credentials */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                  1. Donor Account Credentials (Private)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Legal Name"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    error={donorForm.formState.errors.fullName?.message}
                    {...donorForm.register('fullName')}
                  />

                  <Input
                    label="Mobile Phone Number"
                    type="tel"
                    required
                    placeholder="98765 00112"
                    error={donorForm.formState.errors.phone?.message}
                    {...donorForm.register('phone')}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="name@example.com"
                  error={donorForm.formState.errors.email?.message}
                  {...donorForm.register('email')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    error={donorForm.formState.errors.password?.message}
                    {...donorForm.register('password')}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    placeholder="Re-enter password"
                    error={donorForm.formState.errors.confirmPassword?.message}
                    {...donorForm.register('confirmPassword')}
                  />
                </div>
              </div>

              {/* Organs Selection */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex items-center justify-between">
                  <span>2. Pledged Organs & Tissues</span>
                  <span className="text-[11px] font-normal text-[#64748B]">Deceased donor intention</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ORGAN_OPTIONS.map((opt) => {
                    const isSelected = selectedOrgans.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleOrgan(opt.id)}
                        className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-[#2563EB] bg-[#F4F8FF] text-[#1D4ED8] font-bold'
                            : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 border ${
                            isSelected ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'border-[#CBD5E1]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Residential Location */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                  3. Region & Family Dialogue
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="donor-state-select" className="block text-xs font-semibold text-[#0F172A]">
                      State of Residence <span className="text-[#2563EB]">*</span>
                    </label>
                    <select
                      id="donor-state-select"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                      {...donorForm.register('state')}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="City (Optional)"
                    placeholder="e.g. New Delhi"
                    {...donorForm.register('city')}
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                      {...donorForm.register('familyInformed')}
                    />
                    <div>
                      <span className="font-bold text-[#0F172A] block">
                        I have discussed (or will discuss) my donation wish with my family
                      </span>
                      <span className="text-[11px] text-[#64748B] block mt-0.5">
                        THOTA Section 3(3) requires next-of-kin informed consent at the time of retrieval.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Consent and Privacy */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#0F172A]">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    {...donorForm.register('isPublicPledgeAnonymous')}
                  />
                  <span>
                    Keep public pledge completely anonymous (only Public Donor ID, state, and organs appear in aggregate counters).
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#0F172A]">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    {...donorForm.register('agreeConsent')}
                  />
                  <span>
                    I confirm voluntary altruistic consent to organ donation under THOTA 1994 and DPDP Act 2023. I understand organ commercial trade and direct donor-recipient matching are prohibited. <span className="text-[#2563EB]">*</span>
                  </span>
                </label>
                {donorForm.formState.errors.agreeConsent && (
                  <p className="text-[11px] font-semibold text-[#1D4ED8]">
                    {donorForm.formState.errors.agreeConsent.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  isLoading={donorForm.formState.isSubmitting}
                  className="w-full"
                  leftIcon={<Heart className="w-4 h-4 fill-current" />}
                >
                  Create Donor Account & Record Pledge
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={handleBackToSelection}
                  className="shrink-0"
                >
                  Cancel
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
              Already registered as a donor?{' '}
              <Link to="/auth/login" className="text-[#2563EB] font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================================================
  // STEP 2C: Hospital Institutional Registration Form (Statutory Verification)
  // ==============================================================================
  return (
    <div className="py-8 sm:py-12 max-w-2xl mx-auto text-left space-y-6">
      {/* Navigation & Progress Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackToSelection}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Account Type</span>
        </button>
        <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
          Step 2 of 2: Hospital Verification
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white mx-auto shadow-sm">
          <Building2 className="w-6 h-6 text-[#2563EB]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
          Register as a Healthcare Institution
        </h1>
        <p className="text-xs text-[#64748B] max-w-xl mx-auto">
          For accredited transplant centers and licensed organ retrieval hospitals. Institutional applications undergo mandatory verification prior to clinical portal activation.
        </p>
      </div>

      {/* Strict Security Guardrail Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-2xs space-y-1.5 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Mandatory Statutory Verification under THOTA 1994</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Public registration does <strong>not</strong> automatically grant clinical hospital staff privileges. Submitted statutory license codes and coordinator identities are verified by platform compliance administrators before access to clinical matching and patient intake workflows is authorized.
        </p>
      </div>

      {authError && (
        <Alert variant="danger" title="Registration Error">
          {authError}
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-6 pt-0">
          <form onSubmit={hospitalForm.handleSubmit(onHospitalSubmit)} className="space-y-6">
            {/* Institution Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                1. Healthcare Institution Identity
              </h4>

              <Input
                label="Official Hospital Legal Name"
                required
                placeholder="e.g. All India Institute of Medical Sciences (AIIMS)"
                error={hospitalForm.formState.errors.hospitalName?.message}
                {...hospitalForm.register('hospitalName')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="NOTTO / State Statutory License Number"
                  required
                  placeholder="e.g. NOTTO-APEX-ND-001"
                  error={hospitalForm.formState.errors.registrationNumber?.message}
                  {...hospitalForm.register('registrationNumber')}
                />

                <Input
                  label="Accreditation / Licensing Body"
                  required
                  placeholder="e.g. NABH Certified / NOTTO Apex"
                  error={hospitalForm.formState.errors.accreditation?.message}
                  {...hospitalForm.register('accreditation')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="hospital-state-select" className="block text-xs font-semibold text-[#0F172A]">
                    State / Union Territory <span className="text-[#2563EB]">*</span>
                  </label>
                  <select
                    id="hospital-state-select"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                    {...hospitalForm.register('state')}
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="City / District"
                  required
                  placeholder="e.g. New Delhi"
                  error={hospitalForm.formState.errors.city?.message}
                  {...hospitalForm.register('city')}
                />
              </div>
            </div>

            {/* Representative Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                2. Authorized Representative & Official Contact
              </h4>

              <Input
                label="Transplant Coordinator / Medical Superintendent Name"
                required
                placeholder="e.g. Dr. Priya Raman"
                error={hospitalForm.formState.errors.coordinatorName?.message}
                {...hospitalForm.register('coordinatorName')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Institutional Email"
                  type="email"
                  required
                  placeholder="coordinator@hospital.gov.in"
                  error={hospitalForm.formState.errors.officialEmail?.message}
                  {...hospitalForm.register('officialEmail')}
                />

                <Input
                  label="Official Hospital Phone Number"
                  type="tel"
                  required
                  placeholder="+91-11-26588500"
                  error={hospitalForm.formState.errors.officialPhone?.message}
                  {...hospitalForm.register('officialPhone')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Account Password"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  error={hospitalForm.formState.errors.password?.message}
                  {...hospitalForm.register('password')}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  error={hospitalForm.formState.errors.confirmPassword?.message}
                  {...hospitalForm.register('confirmPassword')}
                />
              </div>
            </div>

            {/* Certification */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#0F172A]">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                  {...hospitalForm.register('certifyAuthorization')}
                />
                <span>
                  I certify that I am an authorized clinical coordinator or administrator representing this institution. I understand that access to hospital portal features is subject to independent statutory verification by platform compliance authorities under THOTA 1994. <span className="text-[#2563EB]">*</span>
                </span>
              </label>
              {hospitalForm.formState.errors.certifyAuthorization && (
                <p className="text-[11px] font-semibold text-[#1D4ED8]">
                  {hospitalForm.formState.errors.certifyAuthorization.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={hospitalForm.formState.isSubmitting}
                className="w-full"
                leftIcon={<Building2 className="w-4 h-4" />}
              >
                Submit Hospital for Verification
              </Button>
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={handleBackToSelection}
                className="shrink-0"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Already an accredited hospital?{' '}
            <Link to="/auth/login" className="text-[#2563EB] font-bold hover:underline">
              Sign In to Staff Portal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
