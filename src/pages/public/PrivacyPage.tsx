import { Lock, ShieldCheck } from 'lucide-react';
import React from 'react';
import { Card } from '../../components/ui/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="space-y-12 text-left max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
          <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Data Protection & Patient Confidentiality</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
          Last updated: October 2026. How Transplant Saathi collects, uses, and safeguards patient and caregiver information under Indian healthcare data protection principles.
        </p>
      </div>

      <div className="space-y-8 text-xs leading-relaxed text-[#0F172A]">
        {/* Section 1: Core Principles */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
            <span>1. Minimum Necessary Information Standard</span>
          </h2>
          <p className="text-[#64748B]">
            Transplant Saathi collects solely the minimum necessary personal data required to deliver navigation guidance, connect families with volunteer peer guides, and verify institutional affiliations. We never harvest or sell personal data.
          </p>
        </Card>

        {/* Section 2: Categories of Data */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading">
            2. Categories of Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-[#64748B] pl-2">
            <li>
              <strong className="text-[#0F172A]">Account & Contact Information:</strong> Name, phone number, and email address provided during authentication or volunteer request submission.
            </li>
            <li>
              <strong className="text-[#0F172A]">Navigation Preferences:</strong> Selected organ category (Kidney, Liver, Heart, etc.), target hospital or city, and general logistical support requirements.
            </li>
            <li>
              <strong className="text-[#0F172A]">Administrative Checklist Progress:</strong> Records of documents you tick off on your personal administrative tracker. These are tied to your personal account via Row Level Security.
            </li>
            <li>
              <strong className="text-[#0F172A]">Institutional Staff Identifiers:</strong> Professional institutional emails and affiliations for verified hospital coordinators and administrators.
            </li>
          </ul>
        </section>

        {/* Section 3: Anonymous User Identity System */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading">
            3. Anonymous User Identity System (Permanent Public ID)
          </h2>
          <p className="text-[#64748B]">
            To protect patient confidentiality and prevent social stigma or unsolicited contact, every registered patient and family caregiver is automatically assigned a permanent, unique, pseudonymous Public Identifier (e.g. <strong className="text-[#0F172A] font-mono">TS-7K9P-X4QM</strong>).
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-[#64748B] pl-2">
            <li>
              <strong className="text-[#0F172A]">Default-Deny Privacy:</strong> Ordinary users and unassigned peer navigators see only your Public ID and general non-identifying preferences. Your real name, contact phone number, email address, and personal notes are never exposed.
            </li>
            <li>
              <strong className="text-[#0F172A]">Immutability:</strong> The Public ID is cryptographically generated and immutable after registration, preventing impersonation or identifier manipulation.
            </li>
            <li>
              <strong className="text-[#0F172A]">Clinical Separation:</strong> Official clinical decisions, HLA cross-matching, and THOTA Form clearances are conducted exclusively by accredited hospital nodal desks and statutory Authorization Committees.
            </li>
          </ul>
        </section>

        {/* Section 4: Data Security & RLS */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading">
            4. Database Authorization & Row Level Security (RLS)
          </h2>
          <p className="text-[#64748B]">
            All user data stored in PostgreSQL is protected by Row Level Security (RLS) policies. Each patient can only read and write their own records. Volunteers receive access solely to assigned non-clinical assistance requests. Service-role keys are never exposed in client code.
          </p>
        </section>

        {/* Section 4: Clinical Confidentiality */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading">
            4. Clinical Records & Document Protection
          </h2>
          <p className="text-[#64748B]">
            Transplant Saathi is not an Electronic Health Record (EHR) system. Any administrative checklists, affidavits, or notes uploaded or entered by users are encrypted in private storage buckets accessible only by the verified patient and authorized hospital teams assigned to the case.
          </p>
        </section>

        {/* Section 5: Rights */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A] font-heading">
            5. Your Data Rights & Deletion
          </h2>
          <p className="text-[#64748B]">
            You retain full ownership of your data. You may request the export or irreversible deletion of your account and associated assistance logs at any time by contacting{' '}
            <a href="mailto:privacy@transplantsaathi.org" className="text-[#2563EB] font-bold hover:underline">
              privacy@transplantsaathi.org
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};
