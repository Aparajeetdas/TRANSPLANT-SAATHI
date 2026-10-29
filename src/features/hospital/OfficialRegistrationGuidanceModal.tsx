import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Heart,
  Scale,
  ShieldCheck,
  Stethoscope,
  Users
} from 'lucide-react';
import React from 'react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { VerifiedHospital } from '../../types';

interface OfficialRegistrationGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital?: VerifiedHospital;
}

export const OfficialRegistrationGuidanceModal: React.FC<OfficialRegistrationGuidanceModalProps> = ({
  isOpen,
  onClose,
  hospital
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Organ Transplant Registration Guidance"
      subtitle="Statutory legal pathway under the Transplantation of Human Organs and Tissues Act (THOTA), 1994"
      maxWidth="xl"
    >
      <div className="space-y-6 text-left py-2">
        {/* Statutory Distinction Alert */}
        <Alert variant="statutory" title="Clear Distinction of Roles and Authority">
          <strong>Transplant Saathi is an administrative preparation and hospital guidance platform.</strong> We do not register patients on state or national waitlists, do not maintain waiting-list positions, and do not allocate organs. Official registration requires in-person clinical workup at a registered transplant hospital under NOTTO/SOTTO regulations.
        </Alert>

        {/* 6 Core Distinctions Matrix */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Key Institutional Distinctions You Must Know
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#2563EB]">
                <FileText className="w-4 h-4" />
                <span>1. Platform Assistance Request</span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                Connects you to {hospital?.name || 'the verified hospital'} coordination desk for paperwork, Form 1–3 guidance, and OPD appointment scheduling.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#2563EB]">
                <Heart className="w-4 h-4" />
                <span>2. Donor Voluntary Pledge</span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                A voluntary declaration of donation intention. It is NOT an organ reservation, sale, or donor-recipient match.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1D4ED8]">
                <Building2 className="w-4 h-4" />
                <span>3. Official Hospital Registration</span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                Performed strictly in person by an authorized government/NABH transplant center following blood work, cross-match, and medical eligibility.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1D4ED8]">
                <Stethoscope className="w-4 h-4" />
                <span>4. Medical Evaluation & Workup</span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                Full HLA tissue typing, cardiac clearance, and clinical fitness determined exclusively by hospital transplant physicians.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                <Scale className="w-4 h-4" />
                <span>5. Official Waiting-List Status</span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                Maintained centrally by NOTTO / ROTTO / SOTTO. Your waiting-list seniority is assigned exclusively by the government nodal authority.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                <ShieldCheck className="w-4 h-4" />
                <span>6. Clinical Organ Allocation</span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                Algorithms regulated by the National Organ and Tissue Transplant Organization based on medical urgency, blood group match, and waiting time.
              </p>
            </div>
          </div>
        </div>

        {/* Official Statutory Portals */}
        <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A]">Official Statutory Authorities & Portals</span>
            <Badge variant="primary" size="sm">Government of India</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
              <div>
                <strong className="text-[#0F172A] block">NOTTO (National Organ & Tissue Transplant Organisation)</strong>
                <span className="text-[11px] text-[#64748B]">MoHFW Apex Body for national registry, waitlists & organ allocation</span>
              </div>
              <a
                href="https://notto.mohfw.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-[#2563EB] font-bold text-xs inline-flex items-center gap-1 hover:underline shrink-0"
              >
                <span>notto.mohfw.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
              <div>
                <strong className="text-[#0F172A] block">National 24x7 NOTTO Helpline</strong>
                <span className="text-[11px] text-[#64748B]">Toll-free official registry and organ donation guidance</span>
              </div>
              <a
                href="tel:1800114770"
                className="text-[#2563EB] font-bold text-xs hover:underline shrink-0"
              >
                1800-11-4770
              </a>
            </div>
          </div>
        </div>

        {/* Living Donor Rules Reminder */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs space-y-1.5 text-amber-900">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Living Donor Regulations Under Section 9 of THOTA 1994</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Commercial dealing, financial consideration, or advertising for organ donors is a non-bailable criminal offense. Living donation is permitted only for near relatives (spouses, parents, children, siblings, grandparents, grandchildren) or approved by a statutory Hospital Authorization Committee with proof of affection and no financial transactions.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Understood & Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
