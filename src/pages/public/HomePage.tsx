import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck,
  Heart,
  Hospital,
  IndianRupee,
  MapPin,
  Phone,
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

  const organPrograms: { id: OrganType; label: string; desc: string }[] = [
    { id: 'kidney', label: 'Kidney (Renal)', desc: 'Living related, paired swap & SOTTO deceased waitlist' },
    { id: 'liver', label: 'Liver (Hepatic)', desc: 'Living donor partial graft & urgent deceased donor listing' },
    { id: 'heart', label: 'Heart (Cardiac)', desc: 'Deceased donor retrieval via NOTTO priority allocation' },
    { id: 'lungs', label: 'Lungs (Pulmonary)', desc: 'Deceased donor matching for respiratory failure' },
    { id: 'cornea', label: 'Cornea (Tissue)', desc: 'Tissue restoration through government-registered eye banks' },
    { id: 'bone_marrow', label: 'Bone Marrow (BMT)', desc: 'Autologous and allogeneic stem cell registries' },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* 1. Clean, Focused Hero Section */}
      <section className="rounded-2xl bg-[#F4F8FF] border border-[#E2E8F0] p-8 sm:p-12 text-left">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1D4ED8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>National Healthcare Navigation Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Compassionate Guidance Through Organ Transplantation in India
          </h1>

          <p className="text-base text-[#64748B] leading-relaxed">
            A verified public-interest navigation resource helping patients and families navigate hospital directories, statutory THOTA 1994 legal documentation, government financial schemes, and volunteer peer accompaniment.
          </p>

          {/* Simple Search Box */}
          <form
            onSubmit={handleSearch}
            className="pt-2"
          >
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6 relative">
                  <Hospital className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="hospital-search-query"
                    aria-label="Search hospitals by name, city, or coordinator"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter hospital name, city, or coordinator..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#2563EB] focus-visible:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    id="hospital-search-organ"
                    aria-label="Filter by organ transplant program"
                    value={selectedOrgan}
                    onChange={(e) => setSelectedOrgan(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus-visible:outline-none cursor-pointer"
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
                  <Button variant="primary" size="sm" type="submit" className="w-full py-2 text-xs">
                    Search Centers
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  Direct verification against NOTTO and state licensing gazettes
                </span>
                <Link to="/directory" className="font-semibold text-[#2563EB] hover:underline flex items-center gap-1 text-[11px]">
                  <span>View Full Map & Directory</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Four Core Pillars */}
      <section className="space-y-6 text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Core Support Frameworks
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Structured administrative assistance for patients and family caregivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col justify-between p-5 hover:border-[#CBD5E1] transition-colors">
            <CardContent className="p-0 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Verified Hospitals</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Accredited centers with licensing registration numbers, nodal coordinators, and audit dates.
              </p>
            </CardContent>
            <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
              <Link to="/directory" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Search Centers</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5 hover:border-[#CBD5E1] transition-colors">
            <CardContent className="p-0 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">THOTA Legal Forms</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Clear checklists for Form 1 (Near Relative), Form 2 (Spouse), and Form 3 (Ethics Committee).
              </p>
            </CardContent>
            <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
              <Link to="/resources#forms" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>View Checklists</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5 hover:border-[#CBD5E1] transition-colors">
            <CardContent className="p-0 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Financial Schemes</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Step-by-step guidance for Ayushman Bharat (AB-PMJAY), RAN, and State Relief Funds.
              </p>
            </CardContent>
            <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
              <Link to="/resources#schemes" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Explore Schemes</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5 hover:border-[#CBD5E1] transition-colors">
            <CardContent className="p-0 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Volunteer Saathi</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Free peer volunteers to accompany families through hospital wayfinding and paperwork.
              </p>
            </CardContent>
            <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
              <Link to="/how-it-works#volunteer" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Request Support</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Organ Programs */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Organ Programs
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Available programs under Indian clinical and statutory standards.
            </p>
          </div>
          <Link to="/directory" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
            <span>All Programs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {organPrograms.map((org) => (
            <Link
              key={org.id}
              to={`/directory?organ=${org.id}`}
              className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F4F8FF]/50 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {org.label}
                </span>
                <p className="text-xs text-[#64748B] mt-0.5">{org.desc}</p>
              </div>
              <span className="text-xs font-bold text-[#2563EB] ml-3 shrink-0">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Government & Apex Centers */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Featured Centers
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Demonstration records citing official NOTTO/SOTTO registry baselines.
            </p>
          </div>
          <Link to="/directory" className="text-xs font-semibold text-[#2563EB] hover:underline">
            View All ({VERIFIED_HOSPITALS.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VERIFIED_HOSPITALS.slice(0, 3).map((hospital) => (
            <Card key={hospital.id} className="p-5 flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="primary" size="sm">{hospital.registrationNumber}</Badge>
                  <Badge variant="subtle" size="sm">Demonstration Record</Badge>
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
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
                      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F4F8FF] text-[#1D4ED8]"
                    >
                      {org}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#64748B]">Coord: {hospital.coordinatorPhone}</span>
                <Link
                  to={`/hospitals/${hospital.id}`}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  View Profile →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Organ Donor Registration Callout */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-left">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Pledge as an Organ Donor in India
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Record voluntary organ donation interest under the DPDP Act 2023. Receive an immutable, pseudonymous Public Donor ID (<span className="font-mono text-[#1D4ED8] font-bold">TS-DNR-XXXX-XXXX</span>), download your donor card, and review official NOTTO Form 7 statutory guidance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/donor/register" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full justify-center" leftIcon={<Heart className="w-3.5 h-3.5 fill-current" />}>
                Register as an Organ Donor
              </Button>
            </Link>
            <Link to="/how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full justify-center">
                How Donation Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Statutory Boundary & Emergency Callout */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] text-white space-y-4 text-left">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#2563EB] text-white text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>THOTA 1994 Section 19</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Organ Donation in India is Strictly Altruistic
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Buying or selling human organs is a non-bailable criminal offense under the Transplantation of Human Organs and Tissues Act (THOTA), 1994, punishable with up to 10 years imprisonment. Transplant Saathi does not allocate organs or determine clinical eligibility.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <Link to="/safety-and-limitations">
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-transparent">
                Safety Rules
              </Button>
            </Link>
            <a href="tel:1800114770">
              <Button variant="primary" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                1800-11-4770
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
