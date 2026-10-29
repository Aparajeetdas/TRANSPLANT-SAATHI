import { ArrowLeft, Compass, FileText, Home, Hospital } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 text-center max-w-lg mx-auto space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB] mx-auto shadow-xs">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Error 404 — Page Not Found
        </span>
        <h1 className="text-3xl font-extrabold text-[#0F172A] font-heading">
          This Healthcare Route Does Not Exist
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
          The page or document reference you were looking for might have been moved, updated, or does not exist. Use the verified shortcuts below to continue navigating:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
        <Link
          to="/"
          className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F4F8FF]/50 transition-all flex items-center gap-3"
        >
          <Home className="w-4 h-4 text-[#2563EB] shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-[#0F172A]">Platform Home</div>
            <div className="text-[#64748B]">Return to main navigation</div>
          </div>
        </Link>

        <Link
          to="/directory"
          className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F4F8FF]/50 transition-all flex items-center gap-3"
        >
          <Hospital className="w-4 h-4 text-[#2563EB] shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-[#0F172A]">Hospital Directory</div>
            <div className="text-[#64748B]">Search verified centers</div>
          </div>
        </Link>

        <Link
          to="/resources"
          className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F4F8FF]/50 transition-all flex items-center gap-3"
        >
          <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-[#0F172A]">Official Resources</div>
            <div className="text-[#64748B]">THOTA forms & aid schemes</div>
          </div>
        </Link>

        <Link
          to="/contact"
          className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F4F8FF]/50 transition-all flex items-center gap-3"
        >
          <Compass className="w-4 h-4 text-[#2563EB] shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-[#0F172A]">Helpdesk & Contacts</div>
            <div className="text-[#64748B]">24/7 national helplines</div>
          </div>
        </Link>
      </div>

      <div className="pt-4">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
