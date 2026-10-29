import { Compass, ExternalLink, PhoneCall, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-white/10 pt-14 pb-8 text-left selection:bg-[#2563EB]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          {/* Col 1: Identity & Legal Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight font-heading">
                Transplant Saathi
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              India&apos;s dedicated non-commercial healthcare navigation platform. Empowering organ recipients, living donors, and caregiver families with transparent statutory guidance under THOTA 1994.
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/80 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#2563EB]" />
                Section 19 THOTA 1994 Notice
              </div>
              <p className="text-white/60">
                Commercial organ trade carries up to 10 years imprisonment and ₹1 Crore fines.
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link to="/directory" className="hover:text-white hover:underline transition-colors">
                  Hospital Directory
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white hover:underline transition-colors">
                  Statutory Forms & Acts
                </Link>
              </li>
              <li>
                <Link to="/resources#schemes" className="hover:text-white hover:underline transition-colors">
                  PM-JAY & Financial Schemes
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white hover:underline transition-colors">
                  Living & Deceased Pathways
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal Disclosures */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
              Statutory Governance
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link to="/safety-and-limitations" className="hover:text-white hover:underline transition-colors">
                  Safety & Clinical Limitations
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white hover:underline transition-colors">
                  Privacy Policy (DPDP Act 2023)
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white hover:underline transition-colors">
                  About the Initiative
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white hover:underline transition-colors">
                  Grievances & Official Contacts
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Authorities & Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
              National Helplines
            </h4>
            <div className="p-3 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#2563EB]" />
                <span className="font-bold text-white">NOTTO Toll-Free 24x7</span>
              </div>
              <div className="text-lg font-black tracking-wide text-white font-heading">
                1800-11-4770
              </div>
              <p className="text-[10px] text-white/60">
                Ministry of Health & Family Welfare, Nirman Bhawan, New Delhi
              </p>
            </div>

            <div className="pt-2 text-[11px] text-white/60 space-y-1">
              <a
                href="https://notto.mohfw.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>NOTTO National Portal</span>
                <ExternalLink className="w-3 h-3 text-[#2563EB]" />
              </a>
              <a
                href="https://pmjay.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>National Health Authority (PM-JAY)</span>
                <ExternalLink className="w-3 h-3 text-[#2563EB]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Transplant Saathi. Educational and non-clinical administrative navigation prototype.</p>
          <p className="text-[11px] text-white/40 max-w-xl text-center md:text-right">
            Disclaimers: Transplant Saathi is an educational platform and does not provide clinical diagnoses, medical clearance, or organ matching.
          </p>
        </div>
      </div>
    </footer>
  );
};
