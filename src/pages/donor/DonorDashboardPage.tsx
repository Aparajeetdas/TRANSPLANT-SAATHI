import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  Heart,
  Hospital,
  Info,
  Lock,
  Printer,
  Scale,
  Shield,
  ShieldAlert,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  DonorMilestoneItem,
  DonorPledgeStatus
} from '../../types';
import {
  getDonorMilestones,
  getDonorProfileByUserId,
  updateDonorPledge,
  withdrawDonorPledge
} from '../../lib/store';

export const DonorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Load donor profile for the active user
  const donorProfile = currentUser ? getDonorProfileByUserId(currentUser.id) : null;

  // Local interaction states
  const [copiedId, setCopiedId] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editable settings states
  const [familyInformed, setFamilyInformed] = useState<boolean>(donorProfile?.familyInformed || false);
  const [nottoRegNumber, setNottoRegNumber] = useState<string>(donorProfile?.officialNottoRegistrationNumber || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(donorProfile?.isPublicPledgeAnonymous !== false);

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

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] bg-[#F4F8FF] py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-[#2563EB] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2 font-heading">
            Authentication Required
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Please sign in to access your private donor dashboard and Public Donor ID.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs hover:bg-[#1D4ED8] transition-colors"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  // If no profile registered yet
  if (!donorProfile) {
    return (
      <div className="min-h-[80vh] bg-[#F4F8FF] py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4 border border-[#2563EB]/25">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2 font-heading">
            No Organ Donor Pledge Found
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            You have not recorded an organ donor pledge with this account yet. Join the altruistic donor network to receive your permanent Public Donor ID.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/donor/register"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs hover:bg-[#1D4ED8] shadow-xs transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Register as an Organ Donor</span>
            </Link>
            <Link
              to="/directory"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs hover:bg-[#F4F8FF] transition-colors"
            >
              Browse Hospital Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const milestones: DonorMilestoneItem[] = getDonorMilestones(donorProfile);
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  // Handle saving privacy & family status updates
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMessage(null);

    const result = updateDonorPledge(
      donorProfile.publicDonorId,
      {
        familyInformed,
        officialNottoRegistrationNumber: nottoRegNumber.trim() || undefined,
        pledgeStatus: nottoRegNumber.trim() ? 'notto_registered' : donorProfile.pledgeStatus,
        isPublicPledgeAnonymous: isAnonymous
      },
      currentUser
    );

    setIsUpdating(false);
    if (result.success) {
      setStatusMessage('Preferences updated successfully.');
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage(result.error || 'Failed to update preferences.');
    }
  };

  // Handle pledge withdrawal
  const handleWithdraw = () => {
    const result = withdrawDonorPledge(donorProfile.publicDonorId, currentUser, withdrawReason);
    if (result.success) {
      setShowWithdrawModal(false);
      navigate('/');
    } else {
      alert(result.error || 'Failed to withdraw pledge.');
    }
  };

  const getStatusBadge = (status: DonorPledgeStatus) => {
    switch (status) {
      case 'notto_registered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            NOTTO Registered
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Pledge Withdrawn
          </span>
        );
      case 'living_donor_candidate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            Living Donor Candidate
          </span>
        );
      case 'pledged_interest':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Voluntary Pledge Active
          </span>
        );
    }
  };

  const organListDisplay = donorProfile.pledgedOrgans.includes('all')
    ? 'All Viable Organs & Tissues'
    : donorProfile.pledgedOrgans.map((o) => o.charAt(0).toUpperCase() + o.slice(1)).join(', ');

  return (
    <div className="min-h-screen bg-[#F4F8FF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card with Public Donor ID & Copy */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#64748B]">
                  Organ Donor Dashboard
                </span>
                {getStatusBadge(donorProfile.pledgeStatus)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading tracking-tight">
                Welcome, Altruistic Donor
              </h1>
              <p className="text-xs text-[#64748B] mt-1 max-w-xl">
                Your voluntary intention record is preserved with strict privacy. Your real name, phone number, and address are protected and never displayed to ordinary users.
              </p>
            </div>

            {/* Public Donor ID Showcase Card */}
            <div className="bg-[#F4F8FF] border border-[#2563EB]/25 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[280px]">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] mb-1">
                Public Donor ID (Immutable)
              </div>
              <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-[#CBD5E1]">
                <span className="text-base font-mono font-bold text-[#1D4ED8] tracking-wider">
                  {donorProfile.publicDonorId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(donorProfile.publicDonorId)}
                  className="p-1 rounded-lg text-[#2563EB] hover:bg-[#F4F8FF] transition-colors"
                  title="Copy Public Donor ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748B]">
                <span>State: <strong>{donorProfile.state}</strong></span>
                <span>Pledged: {new Date(donorProfile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] shadow-2xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Emergency Donor Card</span>
            </button>

            <Link
              to="/directory"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold hover:bg-[#F4F8FF] transition-colors"
            >
              <Hospital className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Verified Hospital Directory</span>
            </Link>

            <a
              href="https://notto.mohfw.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold hover:bg-[#F4F8FF] transition-colors ml-auto"
            >
              <span>Official NOTTO Portal</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
          </div>
        </div>

        {/* Next Recommended Administrative Step Callout */}
        {!donorProfile.familyInformed ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <Users className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                    Next Recommended Administrative Step: Inform Your Family
                  </h3>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    Statutory Rule 11
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Under the Transplantation of Human Organs and Tissues Act (THOTA 1994), organ retrieval from deceased donors legally requires written consent from legal next-of-kin. Your family is your voice when you are no longer here. Discussing your decision now ensures your wish will be honored without hesitation.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFamilyInformed(true);
                      updateDonorPledge(donorProfile.publicDonorId, { familyInformed: true }, currentUser);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>I Have Discussed with My Family</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : !donorProfile.officialNottoRegistrationNumber ? (
          <div className="bg-blue-50 border border-[#2563EB]/30 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <Scale className="w-6 h-6 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1D4ED8]">
                    Next Recommended Step: Register on National NOTTO Registry (Form 7)
                  </h3>
                  <span className="text-[11px] font-bold text-[#2563EB] bg-[#F4F8FF] px-2 py-0.5 rounded border border-[#2563EB]/20">
                    Statutory Step
                  </span>
                </div>
                <p className="text-xs text-[#1E3A8A] mt-1 leading-relaxed">
                  Your intention is recorded on Transplant Saathi. To record your statutory organ pledge on the official Government of India central registry, complete NOTTO Form 7.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href="https://notto.mohfw.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors"
                  >
                    <span>Open NOTTO Form 7 Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 2-Column Main Section: Progress & Administrative Checklist vs Private Details & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Administrative Step Tracking & Document Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Progress Checklist Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] font-heading">
                    Administrative Progress Tracking
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Essential statutory and administrative milestones for deceased organ donation
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#F4F8FF] px-2.5 py-1 rounded-lg border border-[#2563EB]/20">
                  {progressPercent}% Complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#E2E8F0] mb-6 overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Milestone list */}
              <div className="space-y-4">
                {milestones.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${
                      step.isCompleted
                        ? 'border-emerald-200 bg-emerald-50/40 text-[#0F172A]'
                        : 'border-[#E2E8F0] bg-white text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          step.isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-[#CBD5E1] text-[#64748B] bg-white'
                        }`}
                      >
                        {step.isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#0F172A]">{step.title}</h4>
                          {step.isCompleted && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                          {step.description}
                        </p>
                        {step.statutoryNotice && (
                          <div className="mt-2 text-[11px] text-[#2563EB] flex items-center gap-1 font-medium">
                            <Info className="w-3 h-3 shrink-0" />
                            <span>{step.statutoryNotice}</span>
                          </div>
                        )}
                        {step.officialUrl && !step.isCompleted && (
                          <div className="mt-2">
                            <a
                              href={step.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                            >
                              <span>Complete on official government portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Guidance Checklist (THOTA Rules 2014) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-3">
                <FileCheck className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A] font-heading">
                  Document Guidance Checklist for Families
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                We do not collect sensitive personal documents. Keep the following documents accessible with your family so authorized hospital coordinators can quickly facilitate legal clearance if ever needed:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F172A] block">Aadhaar Card / Government Photo ID</span>
                    <span className="text-[#64748B]">Verifies Indian citizenship and legal identity of the donor.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F172A] block">Next-of-Kin Relationship Proof</span>
                    <span className="text-[#64748B]">Marriage certificate, birth certificate, or joint ration card confirming legal standing under THOTA Section 3(3).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F172A] block">THOTA Rules 2014 Form 11 (Hospital-Provided)</span>
                    <span className="text-[#64748B]">Official next-of-kin authorization form signed in the presence of the hospital medical superintendent and witnesses.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 span): Private Details, Preferences & Account Settings */}
          <div className="space-y-6">
            {/* Private Details Overview */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Private Profile Data
                </h3>
              </div>
              <p className="text-[11px] text-[#64748B] mb-4">
                Kept strictly confidential under the Digital Personal Data Protection Act 2023.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-[#64748B] block">Pledged Organs</span>
                  <span className="font-semibold text-[#0F172A] block mt-0.5">{organListDisplay}</span>
                </div>

                <div className="border-t border-[#E2E8F0] pt-2.5">
                  <span className="text-[11px] text-[#64748B] block">Blood Group</span>
                  <span className="font-semibold text-[#0F172A] block mt-0.5">{donorProfile.bloodGroup || 'Not specified'}</span>
                </div>

                <div className="border-t border-[#E2E8F0] pt-2.5">
                  <span className="text-[11px] text-[#64748B] block">Emergency Contact</span>
                  <span className="font-semibold text-[#0F172A] block mt-0.5">
                    {donorProfile.emergencyContactName || 'None listed'}
                  </span>
                  {donorProfile.emergencyContactPhone && (
                    <span className="text-[#64748B] font-mono text-[11px] block mt-0.5">
                      {donorProfile.emergencyContactPhone}
                    </span>
                  )}
                </div>

                <div className="border-t border-[#E2E8F0] pt-2.5">
                  <span className="text-[11px] text-[#64748B] block">Official NOTTO Number</span>
                  <span className="font-semibold font-mono text-[#0F172A] block mt-0.5">
                    {donorProfile.officialNottoRegistrationNumber || 'Not submitted yet'}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy & Preference Controls Form */}
            <form onSubmit={handleSavePreferences} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Consent & Privacy Settings
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={familyInformed}
                      onChange={(e) => setFamilyInformed(e.target.checked)}
                      className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-[#0F172A] font-medium leading-tight">
                      Family / Next-of-Kin Informed
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-[#0F172A] font-medium leading-tight">
                      Show pledge anonymously in public counter
                    </span>
                  </label>
                </div>

                <div>
                  <label htmlFor="dashboard-notto-number" className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                    Link NOTTO Form 7 Reg. No.
                  </label>
                  <input
                    id="dashboard-notto-number"
                    type="text"
                    value={nottoRegNumber}
                    onChange={(e) => setNottoRegNumber(e.target.value)}
                    placeholder="e.g. NOTTO-PLEDGE-XXXX"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                </div>

                {statusMessage && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium">
                    {statusMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2 rounded-xl bg-[#2563EB] text-white font-semibold text-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>

            {/* Withdraw Voluntary Pledge Action */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 text-xs">
              <h4 className="font-bold text-red-900 mb-1">Withdraw Voluntary Pledge</h4>
              <p className="text-[#64748B] mb-3 leading-relaxed">
                You have the statutory right under the DPDP Act 2023 to revoke your voluntary donation intention at any time.
              </p>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                className="w-full py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                Withdraw Pledge
              </button>
            </div>
          </div>
        </div>

        {/* Statutory Guardrails Footer Banner */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] text-xs text-[#64748B] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#2563EB]" />
            <span>
              <strong>Statutory Notice:</strong> Transplant Saathi does not determine clinical eligibility, match donors directly to recipients, or participate in organ commerce.
            </span>
          </div>
          <Link to="/safety-and-limitations" className="text-[#2563EB] hover:underline font-semibold shrink-0">
            Learn More &rarr;
          </Link>
        </div>
      </div>

      {/* Modal: Emergency Digital Donor Card Preview & Print */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] relative">
            <button
              type="button"
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF]"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#0F172A] font-heading mb-1">
              Transplant Saathi Digital Donor Card
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Keep this card in your wallet or digital health locker for emergency medical identification.
            </p>

            {/* Printable Card */}
            <div
              id="printable-donor-card"
              className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-2xl p-6 border-2 border-[#2563EB] shadow-lg mb-6 relative overflow-hidden"
            >
              <div className="flex items-start justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">Transplant Saathi</h4>
                    <span className="text-[10px] text-white/70 block">Official Organ Donor Intention Card</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Altruistic Pledge
                </span>
              </div>

              <div className="space-y-3 text-xs mb-4">
                <div>
                  <span className="text-[10px] text-white/60 uppercase tracking-wider block">Public Donor Identifier</span>
                  <span className="text-lg font-mono font-bold text-white tracking-widest">{donorProfile.publicDonorId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider block">Pledged Organs</span>
                    <span className="text-xs font-semibold text-white/95">{organListDisplay}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider block">Region</span>
                    <span className="text-xs font-semibold text-white/95">{donorProfile.state}</span>
                  </div>
                </div>

                {donorProfile.emergencyContactName && (
                  <div className="border-t border-white/15 pt-2">
                    <span className="text-[10px] text-white/60 uppercase tracking-wider block">Emergency Contact</span>
                    <span className="text-xs font-semibold text-white/95">
                      {donorProfile.emergencyContactName} ({donorProfile.emergencyContactPhone || 'Protected'})
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-white/60 border-t border-white/15 pt-2 leading-relaxed">
                Section 3(3) THOTA 1994: Organ retrieval requires written consent from lawful next-of-kin upon certification of brain-stem death. 24/7 Helpline: 1800-11-4770.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold hover:bg-[#F4F8FF] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Voluntary Pledge Withdrawal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] text-center mb-1">
              Confirm Voluntary Pledge Withdrawal
            </h3>
            <p className="text-xs text-[#64748B] text-center mb-4 leading-relaxed">
              Are you sure you wish to withdraw your organ donation pledge? Your Public Donor ID will be deactivated from public verification registries.
            </p>

            <div className="mb-4">
              <label htmlFor="withdraw-reason" className="block text-xs font-semibold text-[#0F172A] mb-1">
                Reason for withdrawal (Optional)
              </label>
              <textarea
                id="withdraw-reason"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Optional feedback..."
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold hover:bg-[#F4F8FF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
