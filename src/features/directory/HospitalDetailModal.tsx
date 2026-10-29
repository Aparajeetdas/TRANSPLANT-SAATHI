import {
  ExternalLink,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import React from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { VerifiedHospital } from '../../types';

interface HospitalDetailModalProps {
  hospital: VerifiedHospital | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestAssistance: (hospitalName: string) => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  isOpen,
  onClose,
  onRequestAssistance
}) => {
  if (!hospital) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hospital.name}
      subtitle={`Registration Number: ${hospital.registrationNumber}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Accreditation and verification banner */}
        <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Statutory Verified
              </Badge>
              <span className="text-xs font-semibold text-[#0F172A]">
                {hospital.accreditation}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Verified against official registry records on {hospital.sourceVerificationDate}.
            </p>
          </div>
          <a
            href={hospital.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#2563EB]/30 text-xs font-bold text-[#1D4ED8] hover:bg-[#F4F8FF] transition-colors shrink-0"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Location & Address */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Facility Location & Jurisdiction
          </h4>
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-[#0F172A]">{hospital.address}</div>
              <div className="text-[#64748B] mt-0.5">
                {hospital.city}, {hospital.state} — India
              </div>
            </div>
          </div>
        </div>

        {/* Licensed Organs Supported */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Licensed Organ & Tissue Transplantation Programs
          </h4>
          <div className="flex flex-wrap gap-2">
            {hospital.organsSupported.map((org) => (
              <span
                key={org}
                className="px-3 py-1.5 rounded-lg bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/25 text-xs font-bold uppercase tracking-wider"
              >
                {org.replace('_', ' ')}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            Transplant centers in India must hold active licenses issued by the State/Central Appropriate Authority under Section 14 of THOTA 1994.
          </p>
        </div>

        {/* Transplant Nodal Coordinator */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Hospital Transplant Nodal Desk
          </h4>
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#2563EB]" />
              <span className="text-sm font-bold text-[#0F172A]">
                {hospital.coordinatorName}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-2 text-[#0F172A]">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="font-semibold">Phone:</span>
                <a href={`tel:${hospital.coordinatorPhone}`} className="text-[#2563EB] hover:underline">
                  {hospital.coordinatorPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#0F172A]">
                <span className="font-semibold">Email:</span>
                <a href={`mailto:${hospital.coordinatorEmail}`} className="text-[#2563EB] hover:underline">
                  {hospital.coordinatorEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-[#0F172A] text-white text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#F4F8FF]">
            <Info className="w-4 h-4 text-[#2563EB]" />
            <span>Hospital Scheduling & Admission Notice</span>
          </div>
          <p className="text-white/75 leading-relaxed text-[11px]">
            Inpatient scheduling, waitlist listing, and authorization committee reviews are scheduled directly by the hospital nodal desk. Transplant Saathi does not influence hospital queue orders.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onRequestAssistance(hospital.name);
              onClose();
            }}
          >
            Request Saathi for this Center
          </Button>
        </div>
      </div>
    </Modal>
  );
};
