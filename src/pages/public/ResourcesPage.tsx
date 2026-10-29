import {
  BookOpen,
  Building2,
  ExternalLink,
  FileText,
  IndianRupee,
  Phone
} from 'lucide-react';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DocumentChecklist } from '../../features/navigation/DocumentChecklist';
import { SchemeGuide } from '../../features/navigation/SchemeGuide';
import { RequestSupportModal } from '../../features/support/RequestSupportModal';
import { useOfficialResources } from '../../hooks/useResources';

export const ResourcesPage: React.FC = () => {
  const location = useLocation();
  const initialTab = location.hash === '#schemes' ? 'schemes' : location.hash === '#portals' ? 'portals' : 'forms';
  const [activeTab, setActiveTab] = useState<'forms' | 'schemes' | 'portals'>(initialTab);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // TanStack Query integration
  const { data: resources, isLoading } = useOfficialResources();
  const regulatoryPortals = resources?.agencies || [];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
          <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Statutory Guidelines & Official Aid</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
          Official Resources & Regulatory Directory
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
          Verified central and state government resources, statutory Indian forms under the Transplantation of Human Organs and Tissues Rules (THOTA) 2014, and public welfare assistance packages.
        </p>
      </div>

      {/* Distinction Notice (Section L Requirement) */}
      <Alert variant="statutory" title="Financial Estimates vs Official Sanctions Disclosure">
        <strong>Important Financial Distinction:</strong> Hospital cost sheets represent approximate non-binding clinical estimates. Government welfare aid (such as AB-PMJAY pre-authorizations or Rashtriya Arogya Nidhi grants) constitutes confirmed funding only upon issuance of an official written sanction letter by the state health authority.
      </Alert>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-2 pb-2">
        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>THOTA Legal Forms & Checklists</span>
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'schemes'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Financial Assistance Schemes</span>
        </button>

        <button
          onClick={() => setActiveTab('portals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'portals'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Statutory Authorities & Helplines</span>
        </button>
      </div>

      {/* Tab 1: Forms */}
      {activeTab === 'forms' && (
        <DocumentChecklist onRequestAssistance={() => setIsSupportModalOpen(true)} />
      )}

      {/* Tab 2: Schemes */}
      {activeTab === 'schemes' && (
        <SchemeGuide onRequestAssistance={() => setIsSupportModalOpen(true)} />
      )}

      {/* Tab 3: Regulatory Portals */}
      {activeTab === 'portals' && (
        <div className="space-y-6">
          {isLoading && (
            <div className="p-8 text-center text-xs text-[#64748B]">
              Loading verified regulatory portals...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regulatoryPortals.map((portal) => (
              <div
                key={portal.name}
                className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="subtle">{portal.role}</Badge>
                    <span className="text-[10px] text-[#64748B]">Audited: {portal.lastAuditedDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] font-heading leading-tight">
                    {portal.name}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {portal.description}
                  </p>
                  <div className="pt-2 text-xs text-[#0F172A] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                      <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{portal.tollFreeHelpline}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">{portal.email}</span>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold font-heading">
                Need Guidance Approaching Statutory Desks?
              </h4>
              <p className="text-xs text-white/70 mt-1">
                Volunteer Saathis can help you compile your hospital application package for the State Authorization Committee.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSupportModalOpen(true)}
              className="shrink-0"
            >
              Request Peer Saathi
            </Button>
          </div>
        </div>
      )}

      <RequestSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
