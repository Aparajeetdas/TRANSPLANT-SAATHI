import {
  ArrowLeft,
  ExternalLink,
  HeartHandshake,
  Hospital,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { RequestSupportModal } from '../../features/support/RequestSupportModal';
import { useHospital } from '../../hooks/useHospitals';

export const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: hospital, isLoading } = useHospital(id);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Hospital className="w-10 h-10 text-[#2563EB] animate-pulse mx-auto" />
        <p className="text-xs font-semibold text-[#0F172A]">Loading verified hospital dossier...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="py-16 text-center space-y-4">
        <Hospital className="w-12 h-12 text-[#2563EB] mx-auto" />
        <h2 className="text-xl font-bold text-[#0F172A] font-heading">Hospital Record Not Found</h2>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto">
          The requested transplant center could not be located in the verified registry.
        </p>
        <Link to="/directory">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/directory" className="hover:text-[#0F172A] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>
        <span>/</span>
        <span className="text-[#0F172A] font-semibold truncate">{hospital.name}</span>
      </div>

      {/* Main Header Card */}
      <div className="p-6 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="primary" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Government Registered
              </Badge>
              <Badge
                variant={hospital.reviewStatus === 'verified' ? 'primary' : hospital.reviewStatus === 'pending' ? 'subtle' : 'outline'}
              >
                {hospital.reviewStatus === 'verified' ? 'Verified by NOTTO/SOTTO' : hospital.reviewStatus === 'pending' ? 'Pending Periodic Audit' : 'Flagged for Review'}
              </Badge>
              <Badge variant="subtle">
                Demonstration Record
              </Badge>
              <Badge variant="outline">
                {hospital.registrationNumber}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
              {hospital.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>{hospital.address} — {hospital.city}, {hospital.state}</span>
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsSupportModalOpen(true)}
            leftIcon={<HeartHandshake className="w-4 h-4" />}
            className="shrink-0"
          >
            Request Saathi for this Center
          </Button>
        </div>

        {/* Verification and Source Badge Bar */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-[#0F172A]">Accreditation: </span>
            <span className="text-[#1D4ED8] font-semibold">{hospital.accreditation}</span>
          </div>
          <div className="flex items-center gap-4 text-[#64748B]">
            <span>Review Status: <strong className="text-[#0F172A] uppercase font-bold">{hospital.reviewStatus}</strong></span>
            <span>Last Audit: <strong className="text-[#0F172A]">{hospital.sourceVerificationDate}</strong></span>
            <a
              href={hospital.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#2563EB] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Gazette Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Programs & Nodal Coordination */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Programs & Clinical Scope */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Programs & Statutory Source Verifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[#64748B] leading-relaxed">
                Transplant Saathi never claims a hospital currently offers a service unless verified against official government registries. Below are the statutory licensing citations recorded under Section 14 of the Transplantation of Human Organs and Tissues Act (THOTA), 1994:
              </p>

              {/* Citations List / Table */}
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
                {hospital.sources && hospital.sources.length > 0 ? (
                  hospital.sources.map((src) => (
                    <div key={src.id} className="p-3 bg-white hover:bg-[#F4F8FF]/50 transition-colors space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1D4ED8] uppercase text-[11px] px-2 py-0.5 rounded bg-[#F4F8FF] border border-[#2563EB]/25">
                            {src.organType.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-[#0F172A]">{src.sourceAuthority}</span>
                        </div>
                        <Badge
                          variant={src.reviewStatus === 'verified' ? 'primary' : 'subtle'}
                          size="sm"
                        >
                          {src.reviewStatus === 'verified' ? 'Verified' : 'Pending Audit'}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-[#64748B] flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span>Citation: <strong className="text-[#0F172A]">{src.citationReference}</strong></span>
                        <div className="flex items-center gap-3">
                          <span>Audit: {src.verifiedDate}</span>
                          <a
                            href={src.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2563EB] font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Official Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-[#64748B] bg-[#F4F8FF]">
                    Licensed programs: {hospital.organsSupported.join(', ')} (Verified against {hospital.sourceUrl})
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center justify-between">
                <span>Estimated Inpatient Surgical Capacity:</span>
                <strong className="text-[#0F172A]">~{hospital.bedCapacityEstimate || 30} beds (ICU / HDU)</strong>
              </div>
            </CardContent>
          </Card>

          <Alert variant="statutory" title="Statutory Source Requirement & Ethics Rule">
            Transplant Saathi enforces strict source integrity: we never claim a hospital currently offers an organ transplant service unless supported by an official gazette citation from NOTTO, ROTTO, or the State Appropriate Authority. Commercial dealings or unverified claims are strictly prohibited under Section 19 of THOTA 1994.
          </Alert>
        </div>

        {/* Right Column: Nodal Coordination Desk */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transplant Nodal Office</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2563EB]" />
                <span className="font-bold text-[#0F172A] text-sm">
                  {hospital.coordinatorName}
                </span>
              </div>
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span className="text-[#64748B]">Nodal Phone:</span>
                  <a href={`tel:${hospital.coordinatorPhone}`} className="text-[#2563EB] font-bold hover:underline">
                    {hospital.coordinatorPhone}
                  </a>
                </div>
                <div>
                  <span className="text-[#64748B]">Official Email: </span>
                  <a href={`mailto:${hospital.coordinatorEmail}`} className="text-[#2563EB] font-semibold hover:underline">
                    {hospital.coordinatorEmail}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/15 text-[11px] text-[#0F172A] leading-relaxed">
                Contact the nodal coordinator to verify appointment slots for pre-transplant HLA workup or to register with the state SOTTO waiting list.
              </div>
            </CardContent>
          </Card>

          <Card variant="navy">
            <h4 className="text-sm font-bold font-heading mb-1">
              Need Help with Hospital Documentation?
            </h4>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Our trained Volunteer Saathis can assist your family in organizing Form 1 joint affidavits, income proofs, and Ayushman Bharat pre-authorizations.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full text-xs"
            >
              Request Peer Guidance
            </Button>
          </Card>
        </div>
      </div>

      {/* Support Request Modal */}
      <RequestSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        defaultHospitalName={hospital.name}
      />
    </div>
  );
};
