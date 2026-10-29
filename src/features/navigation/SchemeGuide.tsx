import {
  ExternalLink,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FINANCIAL_SCHEMES } from '../../lib/mockData';

interface SchemeGuideProps {
  onRequestAssistance: () => void;
}

export const SchemeGuide: React.FC<SchemeGuideProps> = ({ onRequestAssistance }) => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(FINANCIAL_SCHEMES[0].id);

  const activeScheme = FINANCIAL_SCHEMES.find((s) => s.id === selectedSchemeId) || FINANCIAL_SCHEMES[0];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
          <IndianRupee className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Public Financial Welfare Pathways</span>
        </div>
        <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
          Government Health Schemes & Financial Assistance
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
          Comprehensive, verified guide to central and state assistance packages covering surgical hospitalization, pre-transplant workups, and ongoing immunosuppressive medications.
        </p>
      </div>

      {/* Scheme Cards Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FINANCIAL_SCHEMES.map((scheme) => {
          const isSelected = selectedSchemeId === scheme.id;
          return (
            <div
              key={scheme.id}
              onClick={() => setSelectedSchemeId(scheme.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#F4F8FF] border-[#2563EB] shadow-xs'
                  : 'bg-white border-[#E2E8F0] hover:border-[#2563EB]/30'
              }`}
            >
              <div>
                <Badge variant={isSelected ? 'primary' : 'subtle'} className="mb-2">
                  Verified Scheme
                </Badge>
                <h4 className="text-sm font-bold text-[#0F172A] leading-snug">
                  {scheme.title.split('—')[0]}
                </h4>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                  {scheme.authority}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] font-bold text-[#2563EB] flex items-center justify-between">
                <span>View Guidelines</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Scheme Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-8">
        {/* Header of Active Scheme */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <div>
            <Badge variant="navy" className="mb-2">
              Official Social Protection Program
            </Badge>
            <h3 className="text-2xl font-bold text-[#0F172A] font-heading">
              {activeScheme.title}
            </h3>
            <p className="text-xs text-[#1D4ED8] font-bold mt-1">
              Administering Body: {activeScheme.authority}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={activeScheme.officialPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-xs"
            >
              <span>Visit Official Government Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Coverage & Eligibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/25 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Eligibility & Beneficiary Criteria</span>
            </div>
            <p className="text-xs text-[#0F172A] leading-relaxed font-medium">
              {activeScheme.eligibility}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/25 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4" />
              <span>Financial Package & Coverage</span>
            </div>
            <p className="text-xs text-[#0F172A] leading-relaxed font-medium">
              {activeScheme.coverageDetails}
            </p>
          </div>
        </div>

        {/* Step-by-Step Application Process */}
        <div className="space-y-4">
          <h4 className="text-base font-bold text-[#0F172A] font-heading">
            Application & Pre-Authorization Procedure
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeScheme.applicationProcess.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-xs text-[#0F172A] leading-relaxed">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Audit Citation */}
        <div className="p-4 rounded-xl bg-[#F4F8FF]/80 border border-[#E2E8F0] text-xs text-[#64748B] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-[#0F172A]">Citation: </span>
            {activeScheme.sourceCitation}
          </div>
          <div className="text-[11px] font-semibold text-[#1D4ED8]">
            Last Verified: {activeScheme.lastVerifiedDate}
          </div>
        </div>

        {/* Bottom CTA for Saathi assistance */}
        <div className="p-6 rounded-2xl bg-[#0F172A] text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold font-heading">
              Need assistance with hospital Ayushman Mitra desk paperwork?
            </h4>
            <p className="text-xs text-white/70 mt-1">
              Trained Volunteer Saathis can guide you through pre-authorization documentation and income certificate requirements.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onRequestAssistance} className="shrink-0">
            Request Scheme Support
          </Button>
        </div>
      </div>
    </div>
  );
};
