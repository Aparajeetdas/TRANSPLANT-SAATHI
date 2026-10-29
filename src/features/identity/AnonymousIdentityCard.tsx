import {
  Check,
  Copy,
  Info,
  Lock,
  Phone,
  Save,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

interface AnonymousIdentityCardProps {
  className?: string;
}

export const AnonymousIdentityCard: React.FC<AnonymousIdentityCardProps> = ({ className = '' }) => {
  const { currentUser, updateProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const publicId = currentUser?.publicId || 'TS-7K9P-X4QM';

  const handleCopyId = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicId);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSavePrivateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveStatus(null);

    const res = await updateProfile({
      phone: phoneInput.trim()
    });

    setIsSaving(false);
    if (res.success) {
      setSaveStatus('Private account settings updated successfully.');
      setIsEditing(false);
      setTimeout(() => setSaveStatus(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to update personal settings.');
    }
  };

  return (
    <Card className={`bg-white border-[#E2E8F0] p-6 shadow-xs space-y-6 text-left ${className}`}>
      {/* 1. Header: Anonymous Public ID & Privacy Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Anonymous Public Identifier
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4F8FF] border border-[#2563EB]/20 text-[11px] font-semibold text-[#1D4ED8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              Pseudonymous & Protected
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-wider font-mono select-all bg-[#F4F8FF] px-3.5 py-1.5 rounded-xl border border-[#2563EB]/25">
              {publicId}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              aria-label="Copy Public Identifier"
              className="shrink-0 h-10 border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F4F8FF]"
              leftIcon={
                copied ? (
                  <Check className="w-4 h-4 text-[#1D4ED8]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#2563EB]" />
                )
              }
            >
              {copied ? 'Copied!' : 'Copy ID'}
            </Button>
          </div>
        </div>

        {/* Status indicator badge */}
        <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
          <Badge variant="primary" size="md" className="gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Identity Masked
          </Badge>
          <span className="text-[11px] text-[#64748B]">
            Real identity hidden from public & peers
          </span>
        </div>
      </div>

      {/* 2. Privacy Guarantee & Non-Disclosure Notice */}
      <div className="rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>How Your Privacy Is Protected on Transplant Saathi</span>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Your real name, contact phone number, email address, and personal health documents are stored securely and never published to ordinary users or public directories. Peer volunteers and navigators interact with you exclusively through this permanent, pseudonymous Public ID (<strong>{publicId}</strong>).
        </p>
        <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#1D4ED8] font-medium">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#2563EB]" />
            DPDP Act 2023 Compliant
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
            Default-Deny RLS Enforcement
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#2563EB]" />
            Immutable Identifier
          </span>
        </div>
      </div>

      {saveStatus && (
        <Alert variant="info" title="Privacy Settings Saved">
          {saveStatus}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="warning" title="Update Error">
          {errorMessage}
        </Alert>
      )}

      {/* 3. Secure Private Account Settings */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Private Account Information</h3>
            <p className="text-xs text-[#64748B]">
              Information accessible solely by you and verified hospital transplant coordinators.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-[#2563EB] hover:bg-[#F4F8FF]"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Contact Settings'}
          </Button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSavePrivateSettings} className="space-y-4 rounded-xl border border-[#E2E8F0] p-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Public ID (Immutable)
                </label>
                <input
                  type="text"
                  disabled
                  value={publicId}
                  className="w-full text-xs font-mono bg-slate-100 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#64748B] cursor-not-allowed"
                  title="Permanent identifier cannot be changed"
                />
                <span className="text-[10px] text-[#64748B] mt-0.5 block">
                  Fixed cryptographically generated identifier
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Private Mobile Phone (Coordinator Reachout Only)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91-98765-43210"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                  />
                </div>
                <span className="text-[10px] text-[#64748B] mt-0.5 block">
                  Never revealed to other platform users
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Private Details
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
              <span className="text-[11px] text-[#64748B] block">Private Full Name</span>
              <span className="text-xs font-semibold text-[#0F172A] mt-0.5 block">
                {currentUser?.fullName || 'Not specified'}
              </span>
              <span className="text-[10px] text-[#2563EB] font-medium mt-1 block flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Hidden from public
              </span>
            </div>

            <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
              <span className="text-[11px] text-[#64748B] block">Private Email</span>
              <span className="text-xs font-semibold text-[#0F172A] mt-0.5 block truncate">
                {currentUser?.email || 'Not specified'}
              </span>
              <span className="text-[10px] text-[#2563EB] font-medium mt-1 block flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Hidden from public
              </span>
            </div>

            <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
              <span className="text-[11px] text-[#64748B] block">Private Phone</span>
              <span className="text-xs font-semibold text-[#0F172A] mt-0.5 block">
                {currentUser?.phone || '+91-98***-***10'}
              </span>
              <span className="text-[10px] text-[#2563EB] font-medium mt-1 block flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Hidden from public
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
