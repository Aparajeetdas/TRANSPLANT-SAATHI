import {
  Activity,
  ArrowRight,
  ChevronDown,
  Clock,
  Compass,
  FileCheck,
  Heart,
  Hospital,
  Info,
  Scale,
  ShieldCheck,
  Stethoscope,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { OrganType } from '../../types';

interface TransplantRoadmapProps {
  onNavigateTab: (tab: string) => void;
  onRequestSupport: () => void;
}

export const TransplantRoadmap: React.FC<TransplantRoadmapProps> = ({
  onNavigateTab,
  onRequestSupport
}) => {
  const [selectedPathway, setSelectedPathway] = useState<'living' | 'deceased'>('living');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganType>('kidney');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const organDescriptions: Record<OrganType, { title: string; highlight: string; duration: string }> = {
    kidney: {
      title: 'Renal (Kidney) Navigation',
      highlight: 'Living related donor (Form 1) or paired swap (Form 18) are common living pathways. Deceased waiting list through State SOTTO.',
      duration: 'Evaluation: 4-8 weeks'
    },
    liver: {
      title: 'Hepatic (Liver) Navigation',
      highlight: 'Living donor partial graft (Segments II/III or V-VIII) from family donor, or split/whole liver from deceased donor pool.',
      duration: 'Evaluation: 2-4 weeks'
    },
    heart: {
      title: 'Cardiac (Heart) Navigation',
      highlight: 'Deceased donor retrieval only (brain-stem dead donor via NOTTO allocation algorithm based on urgency status).',
      duration: 'Waitlist: Urgency dependent'
    },
    lungs: {
      title: 'Pulmonary (Lungs) Navigation',
      highlight: 'Single or bilateral lung transplant from brain-stem dead donor pool under strict size and HLA matching.',
      duration: 'Waitlist: Center prioritized'
    },
    cornea: {
      title: 'Corneal Tissue Restoration',
      highlight: 'Deceased eye donation through registered Eye Banks. Short waiting times in most major Indian hubs.',
      duration: 'Listing: 1-3 weeks'
    },
    pancreas: {
      title: 'Pancreatic / Simultaneous Kidney-Pancreas (SKP)',
      highlight: 'Primarily performed in conjunction with renal graft for Type 1 diabetic nephropathy through deceased donor network.',
      duration: 'Evaluation: 6-12 weeks'
    },
    bone_marrow: {
      title: 'Stem Cell / Bone Marrow Transplant (BMT)',
      highlight: 'Autologous or allogeneic living related / unrelated registry donor (DATRI / DKMS-BMST registries).',
      duration: 'HLA Search: 4-12 weeks'
    },
    intestine: {
      title: 'Composite Intestinal Navigation',
      highlight: 'Isolated small bowel or multivisceral deceased donor transplantation licensed under specialized NOTTO center authorization.',
      duration: 'Waitlist: Urgency dependent'
    }
  };

  const livingSteps = [
    {
      step: '01',
      title: 'Clinical Evaluation & Staging',
      actor: 'Registered Transplant Center Nephrologist / Hepatologist',
      description: 'Comprehensive medical workup of the recipient to establish medical necessity. Treating clinicians determine if transplantation is clinically indicated.',
      statutoryNote: 'Healthcare Boundary: Clinical candidacy is determined solely by certified transplant specialists at registered centers, never by automated tools.',
      icon: Stethoscope
    },
    {
      step: '02',
      title: 'Donor Identification & Medical Fitness',
      actor: 'Independent Donor Advocacy Team',
      description: 'Identification of a voluntary donor: Near Relative (Form 1) or Spouse (Form 2). Complete multi-phase medical, immunological (HLA typing), and independent psychological evaluation.',
      statutoryNote: 'Coercion Check: The prospective donor is examined privately by an independent physician to guarantee absence of familial pressure or economic coercion.',
      icon: Users
    },
    {
      step: '03',
      title: 'Statutory Documentation & Affidavit',
      actor: 'Judicial Magistrate / Nodal Legal Desk',
      description: 'Execution of statutory joint affidavits, genetic relationship verification (DNA testing by accredited lab), and financial/domicile records.',
      statutoryNote: 'Section 19 THOTA: Strict documentation required to ensure zero financial transaction. Commercial brokering carries up to 10 years imprisonment.',
      icon: FileCheck
    },
    {
      step: '04',
      title: 'Authorization Committee Interview',
      actor: 'Hospital / State Authorization Committee',
      description: 'Formal interview of recipient, donor, and family members. Required for all non-near relatives (Form 3) and certain state living protocols. Entire proceeding is video-recorded as mandated by THOTA 2014 Rules.',
      statutoryNote: 'Quorum Requirement: Must include Medical Superintendent, two senior doctors, and two independent persons of high integrity.',
      icon: Scale
    },
    {
      step: '05',
      title: 'Surgical Procedure & Hospitalization',
      actor: 'Surgical Transplant Team',
      description: 'Simultaneous donor retrieval and recipient implantation in accredited sterile operating theaters. In swap donation, both surgeries must begin concurrently.',
      statutoryNote: 'Registered Facilities: Surgery must occur in a facility licensed by the Appropriate Authority under Section 14 of THOTA.',
      icon: Hospital
    },
    {
      step: '06',
      title: 'Lifelong Care & Immunosuppression',
      actor: 'Outpatient Transplant Clinic',
      description: 'Regular trough level monitoring (Tacrolimus/Cyclosporine), prophylactic anti-infection therapy, and registration for welfare drug subsidies where applicable.',
      statutoryNote: 'Welfare Schemes: Government schemes like PM-JAY and CGHS provide defined support for immunosuppressive therapy.',
      icon: Activity
    }
  ];

  const deceasedSteps = [
    {
      step: '01',
      title: 'Waitlist Registration at Accredited Hospital',
      actor: 'Hospital Transplant Coordinator',
      description: 'Patient is evaluated and enrolled into the state/regional deceased donor registry (e.g., SOTTO / ROTTO / NOTTO) by an accredited hospital.',
      statutoryNote: 'No Direct Public Signups: Patients cannot self-register onto organ waitlists; enrollment must be routed through an empaneled hospital.',
      icon: Hospital
    },
    {
      step: '02',
      title: 'Centralized Registry Allocation Queue',
      actor: 'NOTTO / SOTTO Algorithm',
      description: 'Waitlist placement based on objective statutory criteria: seniority on list, geographical proximity (City → State → Region → National), blood group, and clinical severity score (e.g. MELD for liver, status 1 for heart).',
      statutoryNote: 'Fair Allocation: Organs cannot be purchased or preferentially diverted. Algorithms are managed by Government nodal registries.',
      icon: Scale
    },
    {
      step: '03',
      title: 'Deceased Donor Notification & Match Call',
      actor: '24/7 On-Call Coordinator',
      description: 'When a brain-stem dead donor is certified (Form 8 and family consent Form 11), organs are matched. The hospital on-call coordinator contacts the patient immediately.',
      statutoryNote: 'Time Sensitivity: Recipient must report to the hospital within 2 to 4 hours of notification for pre-op crossmatch.',
      icon: Clock
    },
    {
      step: '04',
      title: 'Pre-Op Crossmatch & Organ Retrieval',
      actor: 'Retrieval Surgical Team & Green Corridor Police',
      description: 'Rapid physical crossmatch. Police coordinate green transport corridors if organ is retrieved from another city/hospital.',
      statutoryNote: 'Cold Ischemia Time: Kidneys (under 24h), Livers (under 12h), Hearts/Lungs (under 4-6h).',
      icon: Compass
    },
    {
      step: '05',
      title: 'Transplant Surgery & Post-Op ICU Care',
      actor: 'Critical Care & Surgical Specialists',
      description: 'Transplant surgery followed by specialized barrier-nursing ICU care to safeguard against opportunistic infections during induction.',
      statutoryNote: 'Post-transplant reporting: Every transplant is submitted to the NOTTO national registry for public audit.',
      icon: ShieldCheck
    }
  ];

  const faqs = [
    {
      q: 'Can a patient or family pay money to arrange a living kidney or liver donor in India?',
      a: 'ABSOLUTELY NOT. Under Section 19 of the Transplantation of Human Organs and Tissues Act (THOTA), 1994, buying, selling, or offering financial inducement for organs is a grave criminal offense punishable with rigorous imprisonment of 5 to 10 years and fines up to ₹1 Crore. All living donations must be altruistic.'
    },
    {
      q: 'What is the role of Transplant Saathi? Does it match or give organs?',
      a: 'Transplant Saathi does NOT match, distribute, or allocate organs, nor does it conduct clinical eligibility tests. It is an educational and logistical navigation platform created to guide patients and families through legal paperwork (Forms 1/2/3), connect with verified government-registered hospitals, navigate financial schemes (PM-JAY, RAN), and request volunteer peer guidance.'
    },
    {
      q: 'What is the difference between SOTTO, ROTTO, and NOTTO?',
      a: 'SOTTO is the State Organ and Tissue Transplant Organization (operates at the state level). ROTTO is the Regional hub (five regions across India: North, South, West, East, North-East). NOTTO is the apex national body under the Ministry of Health and Family Welfare (MoHFW) that coordinates nationwide allocation and deceased donor registries.'
    },
    {
      q: 'How does an Authorization Committee work for living non-near relatives (Form 3)?',
      a: 'When a donor is not an immediate near-relative (mother, father, sibling, spouse, child), Indian law requires clearance by a statutory Authorization Committee. The committee conducts rigorous in-person interviews, reviews financial stability to rule out commercial exchange, inspects family history, and records the session on video before granting permission.'
    }
  ];

  const currentSteps = selectedPathway === 'living' ? livingSteps : deceasedSteps;

  return (
    <div className="space-y-12">
      {/* Hero Navigation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-[#F4F8FF] to-white border border-[#2563EB]/20 p-8 sm:p-12 text-center md:text-left">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>National Patient Navigation Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight font-heading leading-tight">
            Clear, Step-by-Step Guidance Through the Transplant Journey
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] mt-4 leading-relaxed max-w-2xl">
            A comprehensive, transparent roadmap navigating legal requirements under THOTA 1994, hospital coordination, and financial assistance schemes across India.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigateTab('directory')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Verified Hospital Directory
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onRequestSupport}
              leftIcon={<Heart className="w-4 h-4 text-[#2563EB]" />}
            >
              Request a Volunteer Saathi
            </Button>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="mt-10 pt-8 border-t border-[#E2E8F0] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B]">Statutory Standard</div>
            <div className="text-sm font-bold text-[#0F172A] mt-0.5">THOTA 1994 & 2014</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B]">Directory Registry</div>
            <div className="text-sm font-bold text-[#0F172A] mt-0.5">NOTTO & SOTTO</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B]">Financial Coverage</div>
            <div className="text-sm font-bold text-[#0F172A] mt-0.5">PM-JAY & RAN Aid</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="text-xs text-[#64748B]">Volunteer Network</div>
            <div className="text-sm font-bold text-[#0F172A] mt-0.5">Peer Guidance</div>
          </div>
        </div>
      </div>

      {/* Organ Type Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
              Select Organ or Tissue Pathway
            </h2>
            <p className="text-xs text-[#64748B]">
              Each transplant category has specific regulatory and logistical prerequisites under Indian health guidelines.
            </p>
          </div>
          <Badge variant="subtle" icon={<Info className="w-3.5 h-3.5" />}>
            Verified Clinical Guidelines
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['kidney', 'liver', 'heart', 'lungs', 'cornea', 'pancreas', 'bone_marrow'] as OrganType[]).map((org) => {
            const isSelected = selectedOrgan === org;
            return (
              <button
                key={org}
                onClick={() => setSelectedOrgan(org)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/25'
                    : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
                }`}
              >
                {org.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        {/* Selected Organ Information Card */}
        <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              {organDescriptions[selectedOrgan].title}
            </div>
            <p className="text-sm text-[#0F172A] font-medium">
              {organDescriptions[selectedOrgan].highlight}
            </p>
          </div>
          <div className="shrink-0 bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#1D4ED8] font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span>{organDescriptions[selectedOrgan].duration}</span>
          </div>
        </div>
      </div>

      {/* Pathway Switcher (Living vs Deceased) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#0F172A] font-heading">
              Chronological Milestones
            </h3>
            <p className="text-xs text-[#64748B]">
              Switch between living related donation and the deceased donor allocation queue.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
            <button
              onClick={() => setSelectedPathway('living')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedPathway === 'living'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Living Donor Journey
            </button>
            <button
              onClick={() => setSelectedPathway('deceased')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedPathway === 'deceased'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Deceased Donor (Waitlist)
            </button>
          </div>
        </div>

        {/* Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#2563EB] font-heading">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#0F172A] font-heading">
                      {step.title}
                    </h4>
                    <div className="text-[11px] font-semibold text-[#1D4ED8] mt-0.5">
                      Lead: {step.actor}
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] text-[11px] text-[#0F172A] bg-[#F4F8FF]/50 p-2.5 rounded-lg border border-[#2563EB]/15">
                  <span className="font-semibold text-[#2563EB]">Compliance Rule: </span>
                  {step.statutoryNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legal & Boundary Callout */}
      <div className="rounded-2xl bg-[#0F172A] text-white p-6 sm:p-8 border border-[#2563EB]/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2563EB] text-white text-xs font-bold uppercase">
              <Scale className="w-3.5 h-3.5" />
              Statutory Protection
            </div>
            <h3 className="text-xl font-bold font-heading">
              Need assistance understanding Form 1, Form 2, or Form 3 affidavits?
            </h3>
            <p className="text-xs text-white/75 leading-relaxed">
              We provide free, verified document checklists and non-legal volunteer navigation to ensure families avoid delays with Hospital Authorization Committees.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigateTab('checklist')}
            >
              View Document Checklists
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigateTab('schemes')}
            >
              Explore Financial Schemes
            </Button>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-[#0F172A] font-heading">
            Frequently Asked Questions on Transplant Law & Processes
          </h3>
          <p className="text-xs text-[#64748B]">
            Clear, authoritative answers based on the Transplantation of Human Organs and Tissues Act (THOTA), 1994.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F4F8FF]/50 transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                  aria-expanded={isExpanded}
                >
                  <span className="text-sm font-bold text-[#0F172A]">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#2563EB] shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#64748B] leading-relaxed border-t border-[#E2E8F0] bg-[#F4F8FF]/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
