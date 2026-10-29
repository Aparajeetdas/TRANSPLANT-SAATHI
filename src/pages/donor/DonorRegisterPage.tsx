import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Heart,
  HelpCircle,
  Info,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PledgedOrganCategory } from '../../types';
import { getDonorProfileByUserId, registerDonorPledge } from '../../lib/store';

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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ORGAN_OPTIONS: { id: PledgedOrganCategory; label: string; description: string }[] = [
  { id: 'all', label: 'All Organs & Tissues', description: 'Pledge all viable organs and tissues to save maximum lives' },
  { id: 'kidney', label: 'Kidneys', description: 'Two lives saved for end-stage renal disease patients' },
  { id: 'liver', label: 'Liver', description: 'Can be split to save both an adult and a child' },
  { id: 'heart', label: 'Heart', description: 'Lifesaving for end-stage cardiac heart failure' },
  { id: 'lungs', label: 'Lungs', description: 'Restores breathing capacity for pulmonary fibrosis' },
  { id: 'cornea', label: 'Corneas (Eyes)', description: 'Restores sight to two individuals blind from corneal opacity' },
  { id: 'pancreas', label: 'Pancreas', description: 'Treats severe type 1 diabetes mellitus' },
  { id: 'bone_marrow', label: 'Bone Marrow', description: 'For leukemia, aplastic anemia, and blood disorders' },
  { id: 'tissues', label: 'Heart Valves, Skin & Bones', description: 'Vital for severe burn victims and reconstructive surgeries' }
];

export const DonorRegisterPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // If already registered, check if user has active profile
  const existingProfile = currentUser ? getDonorProfileByUserId(currentUser.id) : null;

  // Form states
  const [selectedOrgans, setSelectedOrgans] = useState<PledgedOrganCategory[]>(['all']);
  const [state, setState] = useState<string>('Delhi');
  const [city, setCity] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [familyInformed, setFamilyInformed] = useState<boolean>(true);
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>('');
  const [officialNottoRegistrationNumber, setOfficialNottoRegistrationNumber] = useState<string>('');
  const [isPublicPledgeAnonymous, setIsPublicPledgeAnonymous] = useState<boolean>(true);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registeredDonorId, setRegisteredDonorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentUser) {
      setFormError('Please sign in or create an account to record your organ donation pledge.');
      return;
    }

    if (selectedOrgans.length === 0) {
      setFormError('Please select at least one organ category or all organs to pledge.');
      return;
    }

    if (!state) {
      setFormError('Please select your state of residence.');
      return;
    }

    if (!consentChecked) {
      setFormError('Explicit consent under THOTA 1994 and DPDP Act 2023 is required to complete registration.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = registerDonorPledge(
        {
          pledgedOrgans: selectedOrgans,
          state,
          city: city.trim() || undefined,
          bloodGroup: bloodGroup || undefined,
          familyInformed,
          emergencyContactName: emergencyContactName.trim() || undefined,
          emergencyContactPhone: emergencyContactPhone.trim() || undefined,
          officialNottoRegistrationNumber: officialNottoRegistrationNumber.trim() || undefined,
          isPublicPledgeAnonymous
        },
        currentUser
      );

      if (!result.success || !result.profile) {
        setFormError(result.error || 'Failed to complete donor registration. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setRegisteredDonorId(result.profile.publicDonorId);
      setIsSubmitting(false);
    } catch {
      setFormError('An unexpected error occurred while saving your donor pledge.');
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // If user already has an active pledge and visits registration
  if (existingProfile && existingProfile.pledgeStatus !== 'withdrawn' && !registeredDonorId) {
    return (
      <div className="min-h-[80vh] bg-[#F4F8FF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4 border border-[#2563EB]/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2 font-heading">
            You are Already an Organ Donor
          </h1>
          <p className="text-sm text-[#64748B] mb-6">
            Your voluntary organ donor pledge is active under your permanent anonymous Public Donor ID.
          </p>

          <div className="bg-[#F4F8FF] border border-[#2563EB]/25 rounded-xl p-4 max-w-md mx-auto mb-6">
            <span className="text-xs uppercase tracking-wider font-bold text-[#64748B] block mb-1">
              Public Donor ID
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-mono font-bold text-[#1D4ED8]">
                {existingProfile.publicDonorId}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(existingProfile.publicDonorId)}
                className="p-1.5 rounded-lg text-[#2563EB] hover:bg-white transition-colors"
                title="Copy Public Donor ID"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/donor"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] shadow-xs transition-colors"
            >
              <span>Go to Donor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white text-[#0F172A] border border-[#E2E8F0] font-semibold text-sm hover:bg-[#F4F8FF] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Registration Success View
  if (registeredDonorId) {
    return (
      <div className="min-h-[85vh] bg-[#F4F8FF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#2563EB]/30 shadow-md p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] text-[#2563EB] text-xs font-semibold border border-[#2563EB]/20 mb-3">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Voluntary Organ Donor Intention Recorded
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3 font-heading">
            Thank You for Pledging the Gift of Life
          </h1>

          <p className="text-sm text-[#64748B] mb-6 max-w-lg mx-auto">
            Your decision represents the highest form of altruism. Your pledge is securely registered under your unique, immutable Public Donor ID.
          </p>

          {/* Public Donor ID Card */}
          <div className="bg-[#F4F8FF] border-2 border-[#2563EB]/30 rounded-2xl p-6 max-w-md mx-auto mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#64748B]">
                Your Permanent Public Donor ID
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Active Pledge
              </span>
            </div>

            <div className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 mb-3">
              <span className="text-xl font-mono font-bold text-[#1D4ED8] tracking-wider">
                {registeredDonorId}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(registeredDonorId)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F8FF] text-[#2563EB] hover:bg-[#2563EB]/15 text-xs font-medium transition-colors"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#64748B] flex items-start gap-1.5 leading-relaxed">
              <Lock className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guaranteed:</strong> Your real name, phone number, address, and personal records remain private. Only your non-identifying Public Donor ID is visible.
              </span>
            </p>
          </div>

          {/* Next Recommended Administrative Step */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto mb-8 text-left">
            <div className="flex items-start gap-2.5">
              <Users className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-0.5">
                  Most Important Next Step: Inform Your Family
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Under the Transplantation of Human Organs and Tissues Act (THOTA 1994, Rule 11), deceased organ donation legally requires written consent from your legal next-of-kin. Your family is your voice.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/donor')}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] shadow-xs transition-colors"
            >
              <span>Open Private Donor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/directory"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white text-[#0F172A] border border-[#E2E8F0] font-semibold text-sm hover:bg-[#F4F8FF] transition-colors"
            >
              Browse Verified Hospital Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FF] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2563EB]/25 text-[#2563EB] text-xs font-semibold mb-3 shadow-2xs">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Voluntary Organ Donation Pledge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading tracking-tight mb-2">
            Register as an Organ Donor
          </h1>
          <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Record your altruistic wish to donate organs and tissues upon brain stem death. You will receive a permanent, privacy-protected Public Donor ID and guidance for official statutory registration.
          </p>
        </div>

        {/* Statutory Distinction Banner: Saathi Intention vs Official Form 7 */}
        <div className="bg-white rounded-2xl border border-[#2563EB]/25 shadow-xs p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#2563EB]/20">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#0F172A] leading-relaxed">
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">
                Statutory Distinction: Intention vs. Official NOTTO Form 7
              </h3>
              <p className="text-[#64748B] mb-2">
                Recording your pledge on <strong>Transplant Saathi</strong> creates a private voluntary intention record and issues your anonymous Public Donor ID. It provides navigation checklists, hospital directories, and guidance.
              </p>
              <div className="bg-[#F4F8FF] rounded-xl p-3 border border-[#E2E8F0] space-y-1 text-[#64748B]">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                  <Info className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Important Legal Reality under THOTA 1994:</span>
                </div>
                <p>
                  &bull; <strong>Official Registration:</strong> Statutory registry is maintained by the National Organ and Tissue Transplant Organisation (NOTTO) under Form 7 at <a href="https://notto.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] underline font-medium">notto.mohfw.gov.in</a>.
                </p>
                <p>
                  &bull; <strong>Next-of-Kin Consent:</strong> Regardless of pledge cards, Indian law requires written consent from lawful family members before organ retrieval. Discussing your intention with your family is essential.
                </p>
                <p>
                  &bull; <strong>No Commercial Dealings:</strong> Organ buying, selling, or financial compensation is strictly forbidden by law.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Notice if not signed in */}
        {!currentUser && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 mb-1">
                  Authentication Required
                </h4>
                <p className="text-xs text-amber-800 mb-3 leading-relaxed">
                  To securely bind your anonymous Public Donor ID to your private account and enable future preference updates, please sign in or create an account.
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors"
                  >
                    Sign In to Proceed
                  </Link>
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold hover:bg-[#F4F8FF] transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-8">
          {/* Section 1: Organs Pledged */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <span>1. Select Organs & Tissues You Wish to Pledge</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-[#64748B]">Deceased donor pledge</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ORGAN_OPTIONS.map((opt) => {
                const isSelected = selectedOrgans.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleOrgan(opt.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#F4F8FF] text-[#0F172A]'
                        : 'border-[#E2E8F0] hover:border-[#2563EB]/40 bg-white text-[#64748B]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-[#2563EB] border-[#2563EB] text-white'
                          : 'border-[#CBD5E1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">{opt.label}</div>
                      <div className="text-[11px] text-[#64748B] leading-tight mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Residential Location & Demographics */}
          <div className="border-t border-[#E2E8F0] pt-6">
            <h3 className="text-sm font-bold text-[#0F172A] mb-3">
              2. General Region (For Regional SOTTO / ROTTO Coordination)
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              State information helps connect you with verified local regional organ retrieval networks. Your specific address is never collected or disclosed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="donor-state" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  State / Union Territory <span className="text-red-500">*</span>
                </label>
                <select
                  id="donor-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  required
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="donor-city" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  City / Town <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
                </label>
                <input
                  id="donor-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="donor-blood-group" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Blood Group <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
                </label>
                <select
                  id="donor-blood-group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                >
                  <option value="">Unknown / Skip</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Family Communication & Emergency Contact */}
          <div className="border-t border-[#E2E8F0] pt-6">
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">
              3. Family Communication & Emergency Identification
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Next-of-kin agreement is mandatory for deceased donation retrieval in India. Keeping emergency contacts private ensures authorized hospital coordinators can verify your wish when needed.
            </p>

            <div className="bg-[#F4F8FF] border border-[#2563EB]/20 rounded-xl p-4 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyInformed}
                  onChange={(e) => setFamilyInformed(e.target.checked)}
                  className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#0F172A] block">
                    I have discussed (or commit to discussing) my donation pledge with my family
                  </span>
                  <span className="text-[#64748B] leading-relaxed block mt-0.5">
                    Under THOTA 1994, organ retrieval cannot proceed without next-of-kin informed consent. Sharing your decision now prevents hesitation during times of critical loss.
                  </span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergency-contact-name" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Emergency Contact Name & Relation <span className="text-xs font-normal text-[#64748B]">(Private)</span>
                </label>
                <input
                  id="emergency-contact-name"
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Kavita Verma (Spouse)"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="emergency-contact-phone" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Emergency Contact Phone <span className="text-xs font-normal text-[#64748B]">(Private)</span>
                </label>
                <input
                  id="emergency-contact-phone"
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="e.g. +91 98100 55443"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Section 4: National NOTTO Cross-Reference (Optional) */}
          <div className="border-t border-[#E2E8F0] pt-6">
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">
              4. National NOTTO Registration (Optional)
            </h3>
            <p className="text-xs text-[#64748B] mb-3">
              If you have already filed official Form 7 on the Government of India NOTTO portal, you may link your statutory pledge number below.
            </p>

            <div className="max-w-md">
              <label htmlFor="notto-reg-number" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Official NOTTO Form 7 Registration Number
              </label>
              <input
                id="notto-reg-number"
                type="text"
                value={officialNottoRegistrationNumber}
                onChange={(e) => setOfficialNottoRegistrationNumber(e.target.value)}
                placeholder="e.g. NOTTO-PLEDGE-2026-XXXXX"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Do not have one yet? You can complete Form 7 anytime at <a href="https://notto.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] underline">notto.mohfw.gov.in</a>.
              </span>
            </div>
          </div>

          {/* Section 5: Privacy Controls & Explicit Consent */}
          <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">
              5. Privacy Guarantee & Altruistic Consent
            </h3>

            {/* Privacy Shield Item */}
            <div className="flex items-start gap-3 bg-[#F4F8FF] border border-[#2563EB]/20 rounded-xl p-3.5">
              <Shield className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="text-xs text-[#0F172A]">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isPublicPledgeAnonymous}
                    onChange={(e) => setIsPublicPledgeAnonymous(e.target.checked)}
                    className="rounded text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Maintain Strict Pseudonymity (Recommended)</span>
                </label>
                <p className="text-[#64748B] mt-1">
                  Your identity is protected under DPDP Act 2023. Other ordinary users cannot view your real name, email, or telephone. Only your non-identifying Public Donor ID will exist publicly.
                </p>
              </div>
            </div>

            {/* Mandatory Statutory Consent */}
            <div className="bg-white border border-[#CBD5E1] rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 rounded text-[#2563EB] focus:ring-[#2563EB]"
                  required
                />
                <div className="text-xs">
                  <span className="font-bold text-[#0F172A] block mb-1">
                    Explicit Altruistic Pledge & Privacy Agreement <span className="text-red-500">*</span>
                  </span>
                  <p className="text-[#64748B] leading-relaxed">
                    I wish to donate my organs and tissues for therapeutic transplantation upon brain-stem death without financial consideration. I confirm that I am aged 18 or above, and I understand that this platform records voluntary interest and navigation, does not conduct clinical organ retrieval or allocation, and complies with THOTA 1994 and the Digital Personal Data Protection Act 2023.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
            <div className="text-xs text-[#64748B] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 256-Bit Encryption &bull; DPDP Act 2023 Compliant</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !currentUser}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1D4ED8] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording Intention...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Record Donor Pledge</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Informative Footer Box */}
        <div className="mt-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-4">
          <Link to="/resources" className="hover:text-[#2563EB] underline flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Read Official THOTA 1994 Guidelines</span>
          </Link>
          <span>&bull;</span>
          <Link to="/safety-and-limitations" className="hover:text-[#2563EB] underline">
            Safety & Non-Commercial Boundaries
          </Link>
        </div>
      </div>
    </div>
  );
};
