import { BookOpen, Compass, ExternalLink, Mail, Phone, ShieldCheck } from 'lucide-react';
import React from 'react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-[#E2E8F0]/10 mt-20 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight font-heading">Transplant Saathi</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              A public-interest healthcare navigation platform designed to empower transplant recipients, prospective donors, and their families with transparent statutory guidelines, verified hospital directories, and peer coordination.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#F4F8FF] text-xs">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Independent Navigation Resource</span>
            </div>
          </div>

          {/* Col 2: Navigation Shortcuts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
              Healthcare Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Step-by-Step Transplant Journey
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('directory')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Verified Hospital Registry & Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checklist')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  THOTA Statutory Form 1, 2, 3 Checklists
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Ayushman Bharat & CMRF Financial Aid
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('volunteer-portal')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Volunteer Saathi Peer Support Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Regulatory Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
              Statutory Indian Authorities
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <a
                  href="https://notto.mohfw.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>NOTTO (National Organ & Tissue Org)</span>
                  <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                </a>
              </li>
              <li>
                <a
                  href="https://main.mohfw.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Ministry of Health & Family Welfare (MoHFW)</span>
                  <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>National Health Authority (AB-PMJAY)</span>
                  <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                </a>
              </li>
              <li>
                <a
                  href="https://transtan.tn.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>TRANSTAN / SOTTO State Registries</span>
                  <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts & Boundary */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
              National Helplines
            </h4>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs text-white">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="font-semibold">NOTTO National Toll-Free:</span>
              </div>
              <p className="text-sm font-bold text-white tracking-wide">1800-11-4770 (24x7)</p>
              <div className="flex items-center gap-2 text-xs text-white/70 pt-1 border-t border-white/10">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>dir-notto@nic.in</span>
              </div>
            </div>
            <p className="text-[11px] text-white/60">
              Emergency medical escalation: Dial 112 or contact the nearest registered Government Medical College hospital.
            </p>
          </div>
        </div>

        {/* Legal boundaries */}
        <div className="pt-8 text-xs text-white/60 space-y-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <BookOpen className="w-4 h-4 text-[#2563EB]" />
              <span>Statutory Legal & Clinical Boundary Disclaimer</span>
            </div>
            <p className="leading-relaxed">
              Transplant Saathi operates in strict accordance with the Transplantation of Human Organs and Tissues Act (THOTA), 1994, and its 2014 Rules. This platform does not determine clinical eligibility, evaluate medical candidacy, match recipients with donors, or allocate organs. Organ allocation in India is governed solely by state and national statutory bodies (NOTTO, ROTTO, SOTTO) and accredited hospital ethics committees. Commercial dealing in human organs is illegal under Indian law.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px]">
            <p>© 2026 Transplant Saathi Initiative. Designed for patient navigation and public education.</p>
            <div className="flex items-center gap-4 text-white/80">
              <span>Verified Directory Standards</span>
              <span>•</span>
              <span>Non-Commercial Framework</span>
              <span>•</span>
              <span>Strict RLS Data Security</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
