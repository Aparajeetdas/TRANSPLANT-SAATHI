import { AlertCircle, Scale, ShieldCheck } from 'lucide-react';
import React from 'react';

export const StatutoryBanner: React.FC = () => {
  return (
    <div className="bg-[#0F172A] text-white border-b border-[#2563EB]/40 px-4 py-2.5 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2563EB] text-white font-semibold text-[11px] tracking-wide uppercase">
            <Scale className="w-3.5 h-3.5" />
            THOTA 1994 Compliance
          </span>
          <p className="text-white/90">
            Organ donation in India is strictly altruistic. Buying or selling human organs is a punishable non-bailable offense under Section 19.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/80 shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            Official Directory Verified
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-white/60">
            <AlertCircle className="w-3.5 h-3.5" />
            No Autonomous Clinical Matching
          </span>
        </div>
      </div>
    </div>
  );
};
