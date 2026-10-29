import { Bookmark, Building2, ExternalLink, Mail, Phone, ShieldCheck, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useHospitals } from '../../hooks/useHospitals';
import { getSavedHospitalIds, toggleSaveHospitalId } from '../../lib/store';

export const SavedHospitalsAndResources: React.FC = () => {
  const { data: hospitals = [] } = useHospitals();
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedHospitalIds());

  const savedHospitals = hospitals.filter((h) => savedIds.includes(h.id));

  const handleRemove = (hospitalId: string) => {
    toggleSaveHospitalId(hospitalId);
    setSavedIds(getSavedHospitalIds());
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#2563EB]" />
          Saved Hospitals & Official Advisories
        </h2>
        <p className="text-xs text-[#64748B] mt-1">
          Quick access to your preferred transplant apex centers and statutory regulatory guidance.
        </p>
      </Card>

      {/* Saved Hospitals Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#2563EB]" />
          Bookmarked Verified Hospitals ({savedHospitals.length})
        </h3>

        {savedHospitals.length === 0 ? (
          <Card className="p-8 text-center bg-white border-dashed border-[#E2E8F0]">
            <p className="text-sm text-[#64748B]">You have not bookmarked any hospitals yet.</p>
            <Link to="/directory">
              <Button variant="primary" size="sm" className="mt-3">
                Explore Verified Hospital Directory
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedHospitals.map((hosp) => (
              <Card key={hosp.id} className="border-[#E2E8F0] bg-white shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-[#F4F8FF] px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#2563EB] font-bold">
                      {hosp.registrationNumber}
                    </span>
                    <button
                      onClick={() => handleRemove(hosp.id)}
                      className="text-[#64748B] hover:text-[#0F172A] transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h4 className="text-base font-bold text-[#0F172A] font-heading leading-tight">
                      {hosp.name}
                    </h4>

                    <div className="text-xs text-[#64748B]">
                      {hosp.city}, {hosp.state}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {hosp.organsSupported.map((organ) => (
                        <Badge key={organ} variant="neutral" size="sm">
                          {organ.toUpperCase()}
                        </Badge>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-[#F4F8FF]/60 border border-[#E2E8F0] space-y-1 text-xs">
                      <div className="font-semibold text-[#0F172A]">
                        Coordinator: {hosp.coordinatorName}
                      </div>
                      <div className="flex items-center gap-3 text-[#64748B]">
                        <a href={`tel:${hosp.coordinatorPhone}`} className="flex items-center gap-1 hover:text-[#2563EB]">
                          <Phone className="w-3 h-3 text-[#2563EB]" />
                          <span>{hosp.coordinatorPhone}</span>
                        </a>
                        <a href={`mailto:${hosp.coordinatorEmail}`} className="flex items-center gap-1 hover:text-[#2563EB]">
                          <Mail className="w-3 h-3 text-[#2563EB]" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 bg-white border-t border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-[10px] text-[#64748B]">
                    Audit Verified: {hosp.sourceVerificationDate}
                  </span>
                  <Link to={`/hospitals/${hosp.id}`}>
                    <Button variant="secondary" size="sm">
                      Full Details
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bookmarked Official Statutory Notices */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          Key Statutory Advisories & Official Helplines
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-xs">
            <div>
              <div className="text-sm font-bold text-[#0F172A]">
                NOTTO National Organ & Tissue Transplant Organization
              </div>
              <div className="text-xs text-[#64748B]">
                Apex national statutory body responsible for deceased donor allocation roster & THOTA enforcement.
              </div>
            </div>
            <a
              href="https://notto.mohfw.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F8FF] text-[#2563EB] border border-[#2563EB]/30 text-xs font-semibold hover:bg-[#2563EB] hover:text-white transition-colors shrink-0"
            >
              <span>notto.mohfw.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-xs">
            <div>
              <div className="text-sm font-bold text-[#0F172A]">
                National Health Authority (NHA) — Ayushman Bharat PM-JAY
              </div>
              <div className="text-xs text-[#64748B]">
                Pre-authorization portal for transplant surgical package benefits up to ₹5 Lakhs per family/year.
              </div>
            </div>
            <a
              href="https://pmjay.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F8FF] text-[#2563EB] border border-[#2563EB]/30 text-xs font-semibold hover:bg-[#2563EB] hover:text-white transition-colors shrink-0"
            >
              <span>pmjay.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
