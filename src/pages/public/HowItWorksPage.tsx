import {
  Activity,
  Clock,
  Compass,
  FileCheck,
  Heart,
  Hospital,
  Scale,
  ShieldCheck,
  Stethoscope,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { RequestSupportModal } from '../../features/support/RequestSupportModal';

export const HowItWorksPage: React.FC = () => {
  const [selectedPathway, setSelectedPathway] = useState<'living' | 'deceased'>('living');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const livingSteps = [
    {
      num: '01',
      title: 'Clinical Candidacy Workup',
      subtitle: 'Treating Nephrologist / Hepatologist',
      description: 'Recipient undergoes comprehensive diagnostic staging (cardiac fitness, infection screening, viral serology) at an accredited transplant center.',
      compliance: 'Boundary: Clinical eligibility is determined solely by certified hospital doctors, never by automated tools.',
      icon: Stethoscope
    },
    {
      num: '02',
      title: 'Altruistic Donor Identification',
      subtitle: 'Living Near Relative (Form 1) or Spouse (Form 2)',
      description: 'Prospective donor undergoes preliminary blood group crossmatch and HLA typing. An independent medical evaluation verifies donor fitness and voluntariness.',
      compliance: 'Coercion Check: Donor is interviewed in private without family present to rule out economic pressure or coercion.',
      icon: Users
    },
    {
      num: '03',
      title: 'Magistrate Joint Affidavits',
      subtitle: 'Judicial Magistrate First Class (JMFC)',
      description: 'Execution of statutory affidavits on non-judicial stamp paper affirming voluntary donation without consideration or monetary exchange.',
      compliance: 'Section 19: Strict penalty of up to 10 years imprisonment for any commercial organ arrangement.',
      icon: FileCheck
    },
    {
      num: '04',
      title: 'Authorization Committee Video Hearing',
      subtitle: 'Hospital / State Ethics Panel',
      description: 'In-person interview of recipient and donor before the statutory committee. The proceeding is video-recorded as mandated by THOTA 2014 Rules.',
      compliance: 'Mandatory Record: Video recordings must be preserved by the hospital for a minimum of 10 years.',
      icon: Scale
    },
    {
      num: '05',
      title: 'Simultaneous Surgical Implantation',
      subtitle: 'Surgical Transplant Team',
      description: 'Simultaneous donor retrieval and recipient engraftment in accredited sterile operating suites. In swap donations, both operating rooms begin induction concurrently.',
      compliance: 'Facility License: Surgery can only take place in a center licensed under Section 14 of THOTA.',
      icon: Hospital
    },
    {
      num: '06',
      title: 'Lifelong Care & Immunosuppression',
      subtitle: 'Post-Transplant Outpatient Care',
      description: 'Routine trough-level blood monitoring (Tacrolimus/Cyclosporine) and enrolment into government medication assistance programs.',
      compliance: 'Financial Aid: Programs like AB-PMJAY and CGHS provide defined assistance for post-transplant immunosuppressants.',
      icon: Activity
    }
  ];

  const deceasedSteps = [
    {
      num: '01',
      title: 'Waitlist Registration at Empaneled Center',
      subtitle: 'Hospital Nodal Desk',
      description: 'Patient is enrolled into the official state/regional deceased donor waitlist (SOTTO / ROTTO / NOTTO) by an accredited transplant hospital.',
      compliance: 'No Public Self-Registration: Waitlist entries must be certified and submitted by an authorized hospital coordinator.',
      icon: Hospital
    },
    {
      num: '02',
      title: 'Statutory Allocation Queue',
      subtitle: 'Computerized Centralized Algorithm',
      description: 'Waitlist position is determined by objective parameters: seniority, immunological crossmatch, blood group compatibility, and medical urgency status.',
      compliance: 'Transparent Allocation: Organs cannot be purchased, prioritized, or routed outside statutory computerized allocation rules.',
      icon: Scale
    },
    {
      num: '03',
      title: 'Brain Stem Death Certification',
      subtitle: 'Board of 4 Medical Experts',
      description: 'Certification of irreversible brain stem death (Form 8) performed twice 6 hours apart, followed by legal consent from next-of-kin (Form 11).',
      compliance: 'Legal Consent: Retrieval requires explicit voluntary consent from legal heirs witnessed by independent observers.',
      icon: Clock
    },
    {
      num: '04',
      title: 'Emergency Allocation Call & Crossmatch',
      subtitle: '24/7 On-Call Coordinator',
      description: 'Hospital coordinator contacts the recipient immediately. Recipient reports to hospital within 2–4 hours for pre-operative physical crossmatch.',
      compliance: 'Cold Ischemia Limits: Kidneys (< 24 hrs), Livers (< 12 hrs), Hearts/Lungs (< 4-6 hrs).',
      icon: Compass
    },
    {
      num: '05',
      title: 'Green Corridor Transit & Engraftment',
      subtitle: 'Traffic Police & Surgical Retrieval Team',
      description: 'Police establish rapid green transit corridors between airports and hospitals for zero-delay organ transport.',
      compliance: 'Registry Reporting: Every organ retrieval and transplant is reported to the NOTTO national database.',
      icon: ShieldCheck
    }
  ];

  const currentSteps = selectedPathway === 'living' ? livingSteps : deceasedSteps;

  return (
    <div className="space-y-12 text-left max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
          <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Patient & Family Step-by-Step Navigation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
          How Organ Transplantation Works in India
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          The legal, medical, and administrative journey required under the Transplantation of Human Organs and Tissues Act (THOTA), 1994, and its 2014 statutory rules.
        </p>
      </div>

      {/* Pathway Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] font-heading">
            Choose Transplantation Pathway
          </h2>
          <p className="text-xs text-[#64748B]">
            Review sequential milestones for living related donation or the centralized deceased donor waitlist.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
          <button
            onClick={() => setSelectedPathway('living')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPathway === 'living'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Living Donor Pathway
          </button>
          <button
            onClick={() => setSelectedPathway('deceased')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPathway === 'deceased'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Deceased Donor Waitlist
          </button>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.num} className="hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#2563EB] font-heading">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0F172A] font-heading">
                    {step.title}
                  </h3>
                  <div className="text-xs text-[#1D4ED8] font-semibold mt-0.5">
                    Lead: {step.subtitle}
                  </div>
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/15 text-[11px] text-[#0F172A]">
                <strong className="text-[#2563EB]">Statutory Rule: </strong>
                {step.compliance}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Volunteer Saathi Role section */}
      <section id="volunteer" className="p-6 sm:p-8 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] space-y-5">
        <div className="space-y-1.5">
          <Badge variant="primary">Human Peer Accompaniment</Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            The Role of a Volunteer Saathi
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-3xl">
            A Volunteer Saathi is a trained, non-medical peer guide who helps transplant families navigate non-clinical hurdles during hospital visits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <h4 className="font-bold text-[#0F172A] text-sm">1. Document Organization</h4>
            <p className="text-[#64748B] leading-relaxed">
              Assisting families in assembling proof-of-relationship documents, affidavits, and Form 1/2/3 dossiers for the hospital ethics committee.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <h4 className="font-bold text-[#0F172A] text-sm">2. Hospital Wayfinding</h4>
            <p className="text-[#64748B] leading-relaxed">
              Guiding families through complex hospital campus layouts, Ayushman Bharat counters, blood banks, and diagnostic laboratory desks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <h4 className="font-bold text-[#0F172A] text-sm">3. Emotional Accompaniment</h4>
            <p className="text-[#64748B] leading-relaxed">
              Providing empathetic, reassuring support to anxious caregivers waiting outside operating theatres or committee chambers.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2563EB]/20">
          <p className="text-xs text-[#1D4ED8] font-medium">
            Volunteer Saathi services are 100% free, humanitarian, and non-commercial.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsSupportModalOpen(true)}
            leftIcon={<Heart className="w-4 h-4" />}
          >
            Request a Volunteer Saathi
          </Button>
        </div>
      </section>

      {/* Support Request Modal */}
      <RequestSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
