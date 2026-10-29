import {
  Compass,
  Heart,
  Scale
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 text-left max-w-5xl mx-auto">
      {/* Hero */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8]">
          <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>About Transplant Saathi</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] font-heading leading-tight">
          Human-Centered Healthcare Navigation for Transplant Families
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-3xl">
          Transplant Saathi was conceived to solve the overwhelming administrative, legal, and logistical labyrinth that vulnerable patients and caregivers confront when facing life-saving organ transplantation in India.
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB]">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] font-heading">
            Our Purpose
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            In organ transplantation, clinical care is provided by expert surgeons and hospital teams. However, the non-clinical journey—obtaining judicial affidavits, decoding statutory THOTA Form 1/2/3 rules, navigating Ayushman Bharat pre-authorizations, and managing travel logistics—often causes devastating delays. We provide structured, verified guidance to eliminate non-medical barriers.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB]">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] font-heading">
            Our Ethical Commitment
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            We operate in strict obedience to the Transplantation of Human Organs and Tissues Act (THOTA), 1994. We stand for pure altruism in donation, zero commercial exploitation, total transparency of directory citations, and patient data privacy.
          </p>
        </Card>
      </div>

      {/* Non-Negotiable Boundaries */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#0F172A] text-white space-y-5">
        <div className="space-y-1.5">
          <Badge variant="primary">Statutory Integrity</Badge>
          <h2 className="text-xl sm:text-2xl font-bold">
            What Transplant Saathi NEVER Does
          </h2>
          <p className="text-xs text-white/70">
            Clear healthcare and regulatory boundaries are the bedrock of our platform:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <h4 className="font-bold text-[#F4F8FF]">1. Never Allocates Organs</h4>
            <p className="text-white/60 text-[11px] leading-relaxed">
              Organ allocation is governed exclusively by statutory computerized waitlists managed by NOTTO, ROTTO, and SOTTO. No software or private entity can allocate organs.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <h4 className="font-bold text-[#F4F8FF]">2. Never Brokering or Matching</h4>
            <p className="text-white/60 text-[11px] leading-relaxed">
              Under Section 19 of THOTA 1994, buying, selling, or paid matching of organs carries up to 10 years rigorous imprisonment. We prohibit all commercial arrangements.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <h4 className="font-bold text-[#F4F8FF]">3. Never Makes Clinical Decisions</h4>
            <p className="text-white/60 text-[11px] leading-relaxed">
              Medical workup, donor crossmatching, and candidate eligibility belong exclusively to registered transplant specialists and hospital authorization committees.
            </p>
          </div>
        </div>
      </section>

      {/* Stakeholders & Collaboration */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Who We Serve
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            A unified ecosystem bringing transparency to patients, families, volunteers, and clinical desks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] space-y-1">
            <span className="font-bold text-[#0F172A]">Patients</span>
            <p className="text-[#64748B]">Clear milestone roadmaps, document checklists, and expense planning.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] space-y-1">
            <span className="font-bold text-[#0F172A]">Caregiver Families</span>
            <p className="text-[#64748B]">Step-by-step guidance through legal affidavits and welfare applications.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] space-y-1">
            <span className="font-bold text-[#0F172A]">Volunteer Saathis</span>
            <p className="text-[#64748B]">Trained peer supporters assisting with hospital wayfinding and translation.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] space-y-1">
            <span className="font-bold text-[#0F172A]">Hospital Desks</span>
            <p className="text-[#64748B]">Verified public directory listings, coordinator contacts, and compliance transparency.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] font-heading">
            Explore Verified Hospital Directory
          </h3>
          <p className="text-xs text-[#64748B]">
            Find government-registered centers with active transplantation programs across India.
          </p>
        </div>
        <Link to="/directory">
          <Button variant="primary" size="md">
            View Hospital Directory →
          </Button>
        </Link>
      </div>
    </div>
  );
};
