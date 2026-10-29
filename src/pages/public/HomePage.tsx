import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck,
  Hospital,
  IndianRupee,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { VERIFIED_HOSPITALS } from '../../lib/mockData';
import { OrganType } from '../../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgan, setSelectedOrgan] = useState<string>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedOrgan !== 'all') params.set('organ', selectedOrgan);
    navigate(`/directory?${params.toString()}`);
  };

  const organPills: { id: OrganType; label: string; desc: string }[] = [
    { id: 'kidney', label: 'Kidney (Renal)', desc: 'Living related, paired swap & SOTTO deceased waitlist' },
    { id: 'liver', label: 'Liver (Hepatic)', desc: 'Living donor partial graft & urgent deceased donor listing' },
    { id: 'heart', label: 'Heart (Cardiac)', desc: 'Deceased donor retrieval via NOTTO priority allocation' },
    { id: 'lungs', label: 'Lungs (Pulmonary)', desc: 'Deceased donor matching for end-stage respiratory failure' },
    { id: 'cornea', label: 'Cornea (Ocular)', desc: 'Tissue restoration through government-registered eye banks' },
    { id: 'bone_marrow', label: 'Bone Marrow (BMT)', desc: 'Autologous and allogeneic stem cell registries' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section with Prominent Hospital Search Action */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F4F8FF] border border-[#2563EB]/25 p-8 sm:p-14 text-left">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8]">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>National Healthcare Navigation Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight font-heading leading-tight">
            Compassionate Guidance Through Organ Transplantation in India
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-3xl">
            A verified public-interest navigation resource helping patients and families navigate hospital directories, statutory THOTA 1994 legal documentation, government financial schemes, and volunteer peer accompaniment.
          </p>

          {/* Prominent Hospital Search Box */}
          <form
            onSubmit={handleSearch}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#2563EB]" />
              <span>Search Verified Transplant Centers Across India</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Hospital className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter hospital name, city, or coordinator..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] placeholder-[#64748B] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedOrgan}
                  onChange={(e) => setSelectedOrgan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                >
                  <option value="all">All Organ Programs</option>
                  <option value="kidney">Kidney (Renal)</option>
                  <option value="liver">Liver (Hepatic)</option>
                  <option value="heart">Heart (Cardiac)</option>
                  <option value="lungs">Lungs (Pulmonary)</option>
                  <option value="cornea">Cornea (Tissue)</option>
                  <option value="bone_marrow">Bone Marrow / BMT</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <Button variant="primary" size="md" type="submit" className="w-full h-full py-2.5 text-xs">
                  Search Centers
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                Direct verification against NOTTO and state licensing gazettes
              </span>
              <Link to="/directory" className="font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>View Full Map & Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Core Pillars of Support */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <Badge variant="subtle">Comprehensive Navigation Pillars</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
            Four Essential Support Frameworks
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            From initial clinical diagnosis to post-surgical immunosuppression, we guide families through every administrative stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
            <CardContent className="space-y-3 pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                Verified Hospital Directory
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Accredited centers with transparent regulatory licensing IDs, nodal coordinator contacts, and quarterly verification audit dates.
              </p>
            </CardContent>
            <div className="pt-3 border-t border-[#E2E8F0]">
              <Link to="/directory" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Explore Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
            <CardContent className="space-y-3 pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB]">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                THOTA Legal Forms
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Clear checklists for Form 1 (Near Relative), Form 2 (Spouse), Form 3 (Authorization Committee), Form 11, and Form 18 (Swap).
              </p>
            </CardContent>
            <div className="pt-3 border-t border-[#E2E8F0]">
              <Link to="/resources#forms" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Checklist Guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
            <CardContent className="space-y-3 pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB]">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                Financial Aid Schemes
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Step-by-step guidance for Ayushman Bharat (AB-PMJAY), Rashtriya Arogya Nidhi (RAN), and State Chief Minister Relief Funds.
              </p>
            </CardContent>
            <div className="pt-3 border-t border-[#E2E8F0]">
              <Link to="/resources#schemes" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Welfare Schemes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
            <CardContent className="space-y-3 pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                Volunteer Saathi Support
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Compassionate non-medical peer volunteers to accompany families through hospital wayfinding, language help, and paperwork.
              </p>
            </CardContent>
            <div className="pt-3 border-t border-[#E2E8F0]">
              <Link to="/how-it-works#volunteer" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Request Support</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Organ Programs Pathway Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
              Organ & Tissue Programs
            </h2>
            <p className="text-xs text-[#64748B]">
              Explore statutory requirements and center availability by organ type under Indian clinical standards.
            </p>
          </div>
          <Link to="/directory" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
            <span>Browse All Programs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organPills.map((org) => (
            <Link
              key={org.id}
              to={`/directory?organ=${org.id}`}
              className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F4F8FF]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-sm font-bold text-[#0F172A] font-heading">{org.label}</span>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{org.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-xs font-semibold text-[#2563EB] flex items-center justify-between">
                <span>View Centers</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Government & Apex Centers */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
              Featured Apex & Regional Hubs
            </h2>
            <p className="text-xs text-[#64748B]">
              Registered national institutions. Displayed as demonstration records citing official NOTTO/SOTTO registry baselines.
            </p>
          </div>
          <Link to="/directory" className="text-xs font-bold text-[#2563EB] hover:underline">
            View All ({VERIFIED_HOSPITALS.length}) Hospitals →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VERIFIED_HOSPITALS.slice(0, 3).map((hospital) => (
            <Card key={hospital.id} className="hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="primary" size="sm">{hospital.registrationNumber}</Badge>
                    <Badge variant="subtle" size="sm">Demonstration Record</Badge>
                  </div>
                  <span className="text-[10px] text-[#64748B]">Verified: {hospital.sourceVerificationDate}</span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A] font-heading leading-tight">
                  {hospital.name}
                </h3>
                <p className="text-xs text-[#64748B] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>{hospital.city}, {hospital.state}</span>
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {hospital.organsSupported.map((org) => (
                    <span
                      key={org}
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/20"
                    >
                      {org}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#64748B]">Coordinator: {hospital.coordinatorPhone}</span>
                <Link
                  to={`/hospitals/${hospital.id}`}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  Full Profile →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Statutory Boundary & Helpline Callout */}
      <section className="p-8 sm:p-10 rounded-3xl bg-[#0F172A] text-white border border-[#2563EB]/30 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Strict Legal Protection (THOTA Section 19)</span>
            </div>
            <h2 className="text-2xl font-bold font-heading">
              Organ Donation in India is Strictly Altruistic & Voluntary
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Buying or selling human organs is a non-bailable criminal offense under the Transplantation of Human Organs and Tissues Act (THOTA), 1994, punishable with up to 10 years imprisonment and fines up to ₹1 Crore. Transplant Saathi does not allocate organs or determine clinical eligibility.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/safety-and-limitations">
              <Button variant="secondary" size="md">
                Safety & Legal Rules
              </Button>
            </Link>
            <a href="tel:1800114770">
              <Button variant="primary" size="md" leftIcon={<Phone className="w-4 h-4" />}>
                Call 1800-11-4770
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
