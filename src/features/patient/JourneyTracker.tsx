import { CheckCircle2, Clock, FileCheck2, Info, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { JourneyStage, PatientJourneyStep } from '../../types';

const JOURNEY_STEPS: PatientJourneyStep[] = [
  {
    id: 'step-eval',
    stage: 'evaluation',
    title: 'Clinical & Living Donor Evaluation',
    description: 'Preliminary tissue typing, ABO blood compatibility, HLA cross-matching, and donor psychological evaluation.',
    status: 'completed',
    mandatoryDocuments: [
      'Recipient & Donor Government Photo IDs (Aadhaar/Passport)',
      'ABO Blood Group Verification Reports from NABL Accredited Lab',
      'HLA Tissue Cross-Match & Donor DTPA Scan'
    ],
    statutoryNotes: 'Mandatory clinical viability screening prior to legal clearance.'
  },
  {
    id: 'step-legal',
    stage: 'legal_clearance',
    title: 'THOTA 1994 Statutory Clearance',
    description: 'Submission of Form 1 (Near Relative) or Form 2 (Spouse) / Form 3 (Other living donor) to the State Authorization Committee.',
    status: 'in_progress',
    mandatoryDocuments: [
      'Joint Affidavit by Donor & Recipient on Non-Judicial Stamp Paper',
      'Tehsildar / Competent Authority Family Tree Certificate',
      'Photographs depicting relationship timeline',
      'Bank Statements (for non-related donor authorization hearings)'
    ],
    statutoryNotes: 'Strict Section 19 THOTA compliance. Commercial organ trading carries up to 10 years imprisonment.'
  },
  {
    id: 'step-preop',
    stage: 'pre_transplant',
    title: 'Pre-Transplant Final Clearance & Logistics',
    description: 'Anesthesia risk evaluation, hospital admission schedule, cross-matching re-confirmation within 48h, and lodging coordination.',
    status: 'upcoming',
    mandatoryDocuments: [
      'Authorization Committee No Objection Certificate (NOC)',
      'Hospital Admission & Package Advance Deposit / Scheme Sanction',
      'Negative Infectious Serology Clearance'
    ],
    statutoryNotes: 'Verification of hospital NABH transplant bed capacity & coordinator assignment.'
  },
  {
    id: 'step-surgery',
    stage: 'surgery',
    title: 'Inpatient Surgery & Immediate ICU Care',
    description: 'Organ harvesting and transplantation surgery in twin sterile modular operation theaters, followed by isolated ICU monitoring.',
    status: 'upcoming',
    mandatoryDocuments: [
      'Surgical Informed Consent Form (Recipient & Donor)',
      'Emergency Next-of-Kin Contact Authorization'
    ],
    statutoryNotes: 'Living donor safety and post-donation follow-up guaranteed under THOTA guidelines.'
  },
  {
    id: 'step-post',
    stage: 'post_discharge',
    title: 'Post-Discharge Recovery & Lifelong Maintenance',
    description: 'Sterile home care protocols, strict daily immunosuppressive dosing (Tacrolimus/Mycophenolate), and regular trough blood tests.',
    status: 'upcoming',
    mandatoryDocuments: [
      'Hospital Discharge Summary & Drug Chart',
      'Emergency 24x7 Transplant Coordinator Contact Card',
      'Bi-Weekly Serum Creatinine / LFT Monitoring Schedule'
    ],
    statutoryNotes: 'Compliance with infection prevention protocols and drug therapeutic range maintenance.'
  }
];

export const JourneyTracker: React.FC = () => {
  const [activeStage, setActiveStage] = useState<JourneyStage>('legal_clearance');

  const selectedStep = JOURNEY_STEPS.find((s) => s.stage === activeStage) || JOURNEY_STEPS[1];

  return (
    <div className="space-y-6 text-left">
      {/* Progress Stepper Bar */}
      <Card className="p-4 sm:p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              Transplant Navigation Journey
            </h2>
            <p className="text-xs text-[#64748B]">
              Standardized administrative milestones under the Transplantation of Human Organs and Tissues Act (THOTA).
            </p>
          </div>
          <Badge variant="neutral">
            Current Stage: <strong className="ml-1 text-[#2563EB]">{selectedStep.title}</strong>
          </Badge>
        </div>

        {/* Horizontal Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {JOURNEY_STEPS.map((step, idx) => {
            const isSelected = activeStage === step.stage;
            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'in_progress';

            return (
              <button
                key={step.id}
                onClick={() => setActiveStage(step.stage)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#F4F8FF] ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'border-[#E2E8F0] bg-white hover:border-[#64748B]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Step 0{idx + 1}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-[#1D4ED8] animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
                  )}
                </div>
                <div className="text-xs font-bold text-[#0F172A] line-clamp-1">{step.title}</div>
                <div className="text-[10px] text-[#64748B] mt-0.5 capitalize">
                  {step.status.replace('_', ' ')}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Active Stage Detailed Breakdown */}
      <Card className="border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        <div className="bg-[#F4F8FF] px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Stage Details
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">{selectedStep.title}</h3>
          </div>
          <Badge variant={selectedStep.status === 'completed' ? 'primary' : 'neutral'}>
            Status: {selectedStep.status.toUpperCase().replace('_', ' ')}
          </Badge>
        </div>

        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-[#0F172A] leading-relaxed">{selectedStep.description}</p>

          {/* Mandatory Documents Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
              Mandatory Statutory Documentation & Filings
            </h4>
            <div className="space-y-2">
              {selectedStep.mandatoryDocuments.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#F4F8FF]/50 border border-[#E2E8F0] text-xs text-[#0F172A]"
                >
                  <div className="w-4 h-4 rounded-full border border-[#2563EB] text-[#2563EB] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Safety Note */}
          {selectedStep.statutoryNotes && (
            <div className="p-4 rounded-xl bg-white border border-[#2563EB]/30 flex items-start gap-3 shadow-xs">
              <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="text-xs text-[#0F172A] leading-relaxed">
                <strong className="text-[#2563EB] block mb-0.5">Statutory & Clinical Notice</strong>
                {selectedStep.statutoryNotes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
