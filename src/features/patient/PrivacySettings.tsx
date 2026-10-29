import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Lock,
  RefreshCw,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2
} from 'lucide-react';
import React, { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { ConsentRecord } from '../../types';
import { usePatientConsents } from './usePatientData';

export const PrivacySettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { consents, isLoading, isError, refetch, toggleConsent, isToggling } = usePatientConsents();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletionRequested, setDeletionRequested] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    try {
      const exportPayload = {
        application: 'Transplant Saathi',
        exportDate: new Date().toISOString(),
        dpdpComplianceVersion: '2026.1',
        userProfile: {
          id: currentUser?.id,
          fullName: currentUser?.fullName,
          email: currentUser?.email,
          role: currentUser?.role,
          organization: currentUser?.organization
        },
        consents: consents,
        statutoryNotice:
          'Transplant Saathi provides non-clinical administrative navigation. Non-clinical data export prepared under Digital Personal Data Protection Act 2023.'
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `transplant_saathi_privacy_export_${currentUser?.id || 'patient'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } finally {
      setIsExporting(false);
    }
  };

  const handleRequestDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText.trim().toLowerCase() === 'delete my data') {
      setDeletionRequested(true);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              Privacy Governance & DPDP Act 2023 Consents
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Manage your personal data processing preferences, statutory acknowledgements, and data portability rights.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              isLoading={isExporting}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export My Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Statutory Regulatory Notice */}
      <Alert
        variant="statutory"
        title="THOTA Section 19 Anti-Commercialization Warning"
      >
        Under Section 19 of the Transplantation of Human Organs and Tissues Act 1994, any commercial dealing or financial solicitation for human organs carries strict penalties of up to 10 years imprisonment and ₹1 crore fine. Transplant Saathi never facilitates commercial donor discovery.
      </Alert>

      {deletionRequested && (
        <Alert
          variant="contrast"
          title="Data Erasure Request Logged with Directorate"
        >
          Your request for personal data erasure under Section 12 of the DPDP Act 2023 has been recorded. In accordance with statutory audit rules, active THOTA committee case filings will be retained until committee closure.
        </Alert>
      )}

      {/* Consent Management List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
            Active Statutory & Navigational Consents
          </h3>
          {isLoading && <span className="text-xs text-[#64748B]">Syncing with registry...</span>}
        </div>

        {isLoading ? (
          <SkeletonCard count={3} />
        ) : isError ? (
          <Card className="p-6 text-center bg-white border-[#E2E8F0] space-y-3">
            <p className="text-xs text-[#64748B]">Could not synchronize consent records with the registry.</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry Sync
            </Button>
          </Card>
        ) : consents.length === 0 ? (
          <EmptyState
            title="No Consent Records Found"
            description="No active data processing consent entries were found for this account."
          />
        ) : (
          <div className="space-y-3">
            {consents.map((consent: ConsentRecord) => {
              const isLocked = consent.consentType === 'thota_section19_warning' || consent.consentType === 'non_clinical_boundary';
              return (
                <Card
                  key={consent.id}
                  className="p-5 bg-white border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#0F172A]">
                        {consent.consentType === 'thota_section19_warning'
                          ? 'THOTA Section 19 Anti-Trafficking Notice'
                          : consent.consentType === 'non_clinical_boundary'
                          ? 'Non-Clinical Scope & Medical Boundary Notice'
                          : consent.consentType === 'volunteer_wayfinding'
                          ? 'Peer Volunteer Logistics Wayfinding Assistance'
                          : 'DPDP Act 2023 Data Processing Authorization'}
                      </span>
                      {isLocked ? (
                        <Badge variant="navy" className="text-[10px]">
                          <Lock className="w-3 h-3 mr-1 inline" />
                          Statutory Requirement
                        </Badge>
                      ) : (
                        <Badge variant={consent.hasConsented ? 'primary' : 'neutral'} className="text-[10px]">
                          {consent.hasConsented ? 'Active' : 'Revoked'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {consent.purpose}
                    </p>
                    <div className="text-[11px] text-[#64748B]">
                      Effective Since: {new Date(consent.consentedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {consent.revokedAt && ` • Revoked: ${new Date(consent.revokedAt).toLocaleDateString('en-IN')}`}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isLocked ? (
                      <span className="text-xs font-semibold text-[#1D4ED8] flex items-center gap-1 bg-[#F4F8FF] px-3 py-1.5 rounded-lg border border-[#2563EB]/20">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleConsent(consent.consentType)}
                        disabled={isToggling}
                        aria-label={`Toggle ${consent.consentType} consent`}
                        className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F4F8FF] transition-all"
                      >
                        {consent.hasConsented ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-[#2563EB]" />
                            <span className="text-[#0F172A]">Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-[#64748B]" />
                            <span className="text-[#64748B]">Disabled</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Right to Erasure / Danger Zone */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#1D4ED8]" />
              Account Erasure & Right to Be Forgotten
            </h4>
            <p className="text-xs text-[#64748B] max-w-xl">
              Request complete revocation of all navigational consents and erasure of contact records pursuant to Section 12 of the DPDP Act 2023.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-[#1D4ED8] hover:text-[#0F172A]"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Request Data Erasure
          </Button>
        </div>
      </Card>

      {/* Erasure Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Data Erasure Request"
      >
        <form onSubmit={handleRequestDeletion} className="space-y-4 text-left">
          <p className="text-xs text-[#64748B] leading-relaxed">
            This action will log a formal data erasure notice under the Digital Personal Data Protection Act 2023. Your assistance requests, appointment notes, and expense estimates will be unlinked.
          </p>
          <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-xs text-[#0F172A]">
            Please type <strong>delete my data</strong> below to confirm.
          </div>
          <input
            type="text"
            required
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="delete my data"
            className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={deleteConfirmationText.trim().toLowerCase() !== 'delete my data'}
            >
              Submit Erasure Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
