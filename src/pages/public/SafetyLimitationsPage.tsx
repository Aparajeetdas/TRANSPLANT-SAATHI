import { BookOpen, HeartHandshake, Hospital, Scale } from 'lucide-react';
import React from 'react';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';

export const SafetyLimitationsPage: React.FC = () => {
  return (
    <div className="space-y-12 text-left max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
          <Scale className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Statutory Boundaries & Clinical Disclaimers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
          Safety, Legal Boundaries & Platform Limitations
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
          Comprehensive disclosure regarding the exact capabilities, legal constraints, and clinical boundaries governing Transplant Saathi.
        </p>
      </div>

      {/* Critical Statutory Alert Banner */}
      <Alert variant="contrast" title="CRIMINAL PROHIBITION OF COMMERCIAL ORGAN TRADE (THOTA 1994, SECTION 19)">
        Under Section 19 of the Transplantation of Human Organs and Tissues Act (THOTA), 1994, any commercial dealing, financial inducement, or paid arrangement for human organs is a non-bailable offense punishable with rigorous imprisonment of 5 to 10 years and fines between ₹20 Lakhs and ₹1 Crore. All donations in India must be strictly altruistic.
      </Alert>

      {/* Detailed Boundaries Sections */}
      <div className="space-y-8 text-xs leading-relaxed text-[#0F172A]">
        {/* 1. No Clinical Advice */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <Hospital className="w-5 h-5 text-[#2563EB]" />
            <span>1. No Clinical Diagnosis or Candidacy Determinations</span>
          </h2>
          <p className="text-[#64748B]">
            Transplant Saathi does not offer medical advice, evaluate patient laboratory results, or determine clinical eligibility for organ transplantation. Medical decisions, donor-recipient immunological compatibility (HLA/crossmatch), and surgical staging must be performed exclusively by certified transplant physicians at licensed hospitals.
          </p>
        </Card>

        {/* 2. No Organ Allocation */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#2563EB]" />
            <span>2. No Autonomous Organ Allocation or Donor Matching</span>
          </h2>
          <p className="text-[#64748B]">
            This platform does not possess, manage, or influence any deceased or living donor organ rosters. In India, deceased organ allocation is administered strictly by government statutory bodies (NOTTO, ROTTO, SOTTO) using computerized waitlists based on transparent medical and geographic priority criteria.
          </p>
        </Card>

        {/* 3. Scope of Volunteer Saathis */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#2563EB]" />
            <span>3. Limitations of Volunteer Peer Saathi Support</span>
          </h2>
          <p className="text-[#64748B]">
            Volunteer Saathis are non-medical lay volunteers trained solely in administrative navigation, hospital wayfinding, and emotional accompaniment. Volunteers are strictly prohibited from giving medical recommendations, recommending specific private surgeons, or handling family finances.
          </p>
        </Card>

        {/* 4. Directory Information Currency */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2563EB]" />
            <span>4. Hospital Directory Verification & Citations</span>
          </h2>
          <p className="text-[#64748B]">
            All hospital listings cite official source URLs (NOTTO registry, state health gazettes) and explicit verification audit dates. However, hospital bed capacity, transplant coordinator telephone numbers, and empaneled insurance packages may change. Families must always confirm details directly with the hospital nodal desk.
          </p>
        </Card>
      </div>
    </div>
  );
};
