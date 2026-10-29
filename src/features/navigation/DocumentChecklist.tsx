import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileCheck,
  Info,
  Scale,
  ShieldAlert
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { STATUTORY_DOCUMENTS } from '../../lib/mockData';

interface DocumentChecklistProps {
  onRequestAssistance: () => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ onRequestAssistance }) => {
  const [selectedFormIndex, setSelectedFormIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const activeForm = STATUTORY_DOCUMENTS[selectedFormIndex];

  const toggleItem = (key: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const totalItemsForActiveForm = activeForm.requiredDocuments.length;
  const completedCount = activeForm.requiredDocuments.filter(
    (doc) => completedItems[`${activeForm.formNumber}-${doc}`]
  ).length;

  const progressPercent = Math.round((completedCount / totalItemsForActiveForm) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
          <Scale className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Statutory Compliance Documentation</span>
        </div>
        <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
          THOTA Statutory Forms & Verification Checklists
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
          Under the Transplantation of Human Organs and Tissues Rules (THOTA) 2014, hospital authorization committees require exhaustive documentation to establish biological ties or voluntary consent.
        </p>
      </div>

      {/* Statutory Section 19 Warning Box */}
      <div className="rounded-2xl border border-[#2563EB]/40 bg-[#F4F8FF] p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-[#2563EB]/30 text-[#1D4ED8] shrink-0">
            <ShieldAlert className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0F172A]">
              Statutory Prohibition on Commercial Dealing (THOTA Section 19)
            </h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Any person who makes or receives any payment for the supply of human organs, or seeks to find a person willing to supply an organ for payment, shall be punishable with rigorous imprisonment for a term between 5 and 10 years, and fine between ₹20 Lakhs and ₹1 Crore.
            </p>
          </div>
        </div>
      </div>

      {/* Form Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-4">
        {STATUTORY_DOCUMENTS.map((form, idx) => {
          const isSelected = selectedFormIndex === idx;
          return (
            <button
              key={form.formNumber}
              onClick={() => setSelectedFormIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/25'
                  : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
              }`}
            >
              <span className="mr-1">{form.formNumber}:</span>
              <span>{form.title.split('-')[1]?.trim() || form.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Form Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Info & Checklist */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
              <div>
                <Badge variant="primary" className="mb-1">
                  {activeForm.formNumber}
                </Badge>
                <h3 className="text-xl font-bold text-[#0F172A] font-heading">
                  {activeForm.title}
                </h3>
                <p className="text-xs text-[#1D4ED8] font-semibold mt-0.5">
                  {activeForm.actReference}
                </p>
              </div>

              {/* Progress Circle / Badge */}
              <div className="flex items-center gap-2 bg-[#F4F8FF] px-3 py-1.5 rounded-xl border border-[#2563EB]/25">
                <FileCheck className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-bold text-[#0F172A]">
                  {completedCount} of {totalItemsForActiveForm} Ready ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* Applicability */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Who Must Submit This Form?
              </span>
              <p className="text-sm font-medium text-[#0F172A] bg-[#F4F8FF]/60 p-3 rounded-xl border border-[#E2E8F0]">
                {activeForm.applicability}
              </p>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Required Documents Checklist
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Check each item as you compile it
                </span>
              </div>

              <div className="space-y-2.5">
                {activeForm.requiredDocuments.map((doc, docIdx) => {
                  const itemKey = `${activeForm.formNumber}-${doc}`;
                  const isChecked = Boolean(completedItems[itemKey]);

                  return (
                    <div
                      key={docIdx}
                      onClick={() => toggleItem(itemKey)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-[#F4F8FF] border-[#2563EB]/40'
                          : 'bg-white border-[#E2E8F0] hover:border-[#2563EB]/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="mt-0.5 w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                      <div className="text-xs">
                        <span
                          className={`font-semibold ${
                            isChecked ? 'text-[#1D4ED8] line-through' : 'text-[#0F172A]'
                          }`}
                        >
                          {doc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specific Warning for this form */}
            <div className="p-4 rounded-xl bg-[#0F172A] text-white text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#F4F8FF]">
                <AlertTriangle className="w-4 h-4 text-[#2563EB]" />
                <span>Statutory Committee Prerequisite</span>
              </div>
              <p className="text-white/75 leading-relaxed text-[11px]">
                {activeForm.statutoryWarning}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Templates, Guidance & Assistance CTA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Volunteer Guidance Callout */}
          <div className="bg-[#F4F8FF] rounded-2xl border border-[#2563EB]/30 p-6 space-y-4">
            <h4 className="text-base font-bold text-[#0F172A] font-heading">
              Need Help Organizing Documents?
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Hospital paperwork can be daunting. Request a trained Volunteer Saathi to review your checklist format before meeting the Hospital Ethics Committee.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onRequestAssistance}
              className="w-full"
            >
              Request Checklist Assistance
            </Button>
          </div>

          {/* Reference Templates Info */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Standardized Guidelines
            </h4>
            <div className="space-y-3 text-xs text-[#0F172A]">
              <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F4F8FF]/30">
                <div className="font-bold flex items-center gap-1.5 text-[#2563EB]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Magistrate Affidavit Format</span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Must be attested on non-judicial stamp paper by a Judicial Magistrate First Class (JMFC) or Metropolitan Magistrate.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F4F8FF]/30">
                <div className="font-bold flex items-center gap-1.5 text-[#2563EB]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>HLA DNA Typing Standards</span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  DNA HLA compatibility reports must originate from an NABL/EFI accredited histocompatibility laboratory.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F4F8FF]/30">
                <div className="font-bold flex items-center gap-1.5 text-[#2563EB]">
                  <Info className="w-3.5 h-3.5" />
                  <span>Audio-Video Recording Mandate</span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Rule 7(3) of THOTA 2014 mandates that the entire interview by the Authorization Committee must be video recorded and archived for 10 years.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
