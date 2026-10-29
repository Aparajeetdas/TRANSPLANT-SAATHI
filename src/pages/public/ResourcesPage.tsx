import {
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  IndianRupee,
  Info,
  Phone,
  ShieldAlert
} from 'lucide-react';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RequestSupportModal } from '../../features/support/RequestSupportModal';
import { useOfficialResources } from '../../hooks/useResources';
import { FINANCIAL_SCHEMES, STATUTORY_DOCUMENTS } from '../../lib/mockData';

export const ResourcesPage: React.FC = () => {
  const location = useLocation();
  const initialTab =
    location.hash === '#schemes' ? 'schemes' : location.hash === '#portals' ? 'portals' : 'forms';

  const [activeTab, setActiveTab] = useState<'forms' | 'schemes' | 'portals'>(initialTab);
  const [expandedForms, setExpandedForms] = useState<Record<string, boolean>>({ 'Form 1': true });
  const [expandedSchemes, setExpandedSchemes] = useState<Record<string, boolean>>({ 'scheme-pmjay': true });
  const [completedDocs, setCompletedDocs] = useState<Record<string, boolean>>({});
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // TanStack Query integration for regulatory agencies
  const { data: resources, isLoading } = useOfficialResources();
  const regulatoryPortals = resources?.agencies || [];

  const toggleFormExpand = (formNumber: string) => {
    setExpandedForms((prev) => ({ ...prev, [formNumber]: !prev[formNumber] }));
  };

  const toggleSchemeExpand = (schemeId: string) => {
    setExpandedSchemes((prev) => ({ ...prev, [schemeId]: !prev[schemeId] }));
  };

  const toggleDocumentCheck = (key: string) => {
    setCompletedDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto py-2">
      {/* 1. Compact Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading tracking-tight">
          Official Resources
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Statutory THOTA 1994 legal forms, government financial assistance schemes, and verified helpline directories.
        </p>
      </div>

      {/* 2. Compact, Subtle Disclaimer Notice */}
      <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#F4F8FF] border border-[#2563EB]/20 text-xs text-[#1D4ED8]">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Important Notice:</strong> Hospital cost sheets represent approximate non-binding estimates. Government welfare aid (AB-PMJAY / RAN) constitutes confirmed funding only upon issuance of an official written sanction letter by the state health authority.
        </span>
      </div>

      {/* 3. Simple, Evenly Spaced Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-6 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('forms')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'forms'
              ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Legal Forms
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schemes')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'schemes'
              ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Financial Assistance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('portals')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'portals'
              ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Authorities & Helplines
        </button>
      </div>

      {/* 4. Tab 1: Legal Forms */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">THOTA Statutory Forms</h2>
              <p className="text-xs text-[#64748B]">
                Mandatory legal applications and required documentation checklists under THOTA Rules 2014.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
            >
              Need help with paperwork?
            </button>
          </div>

          {/* Simple Rows */}
          <div className="space-y-2.5">
            {STATUTORY_DOCUMENTS.map((doc) => {
              const isExpanded = !!expandedForms[doc.formNumber];
              return (
                <div
                  key={doc.formNumber}
                  className="rounded-xl border border-[#E2E8F0] bg-white transition-all overflow-hidden"
                >
                  {/* Row Header */}
                  <div
                    onClick={() => toggleFormExpand(doc.formNumber)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F4F8FF]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                            {doc.formNumber}: {doc.title}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">
                          {doc.applicability}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-[#2563EB] hidden sm:inline">
                        {isExpanded ? 'Hide Details' : 'View Checklist'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#64748B]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#64748B]" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Content (Only when chosen) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#E2E8F0] bg-[#F8FAFC]/50 space-y-3 text-xs">
                      <div className="text-[11px] text-[#64748B]">
                        <strong>Statutory Reference:</strong> {doc.actReference}
                      </div>

                      {/* Required Documents Checklist */}
                      <div>
                        <div className="font-bold text-[#0F172A] mb-2">
                          Required Documents ({doc.requiredDocuments.length}):
                        </div>
                        <ul className="space-y-1.5">
                          {doc.requiredDocuments.map((item) => {
                            const key = `${doc.formNumber}-${item}`;
                            const isChecked = !!completedDocs[key];
                            return (
                              <li
                                key={item}
                                onClick={() => toggleDocumentCheck(key)}
                                className="flex items-start gap-2 cursor-pointer text-[#0F172A] hover:text-[#2563EB] transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                                />
                                <span className={isChecked ? 'line-through text-[#64748B]' : ''}>
                                  {item}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Subtle Warning */}
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{doc.statutoryWarning}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Financial Assistance Schemes */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Government Healthcare Schemes</h2>
              <p className="text-xs text-[#64748B]">
                Central and state welfare packages providing financial assistance for surgical and medication costs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
            >
              Need assistance applying?
            </button>
          </div>

          {/* Simple Rows */}
          <div className="space-y-2.5">
            {FINANCIAL_SCHEMES.map((scheme) => {
              const isExpanded = !!expandedSchemes[scheme.id];
              return (
                <div
                  key={scheme.id}
                  className="rounded-xl border border-[#E2E8F0] bg-white transition-all overflow-hidden"
                >
                  {/* Row Header */}
                  <div
                    onClick={() => toggleSchemeExpand(scheme.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F4F8FF]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center shrink-0">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate block">
                          {scheme.title}
                        </span>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">
                          {scheme.authority}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-[#2563EB] hidden sm:inline">
                        {isExpanded ? 'Hide Details' : 'View Scheme'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#64748B]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#64748B]" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Content (Only when chosen) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#E2E8F0] bg-[#F8FAFC]/50 space-y-3 text-xs text-[#0F172A]">
                      <div>
                        <strong>Eligibility:</strong> {scheme.eligibility}
                      </div>

                      <div>
                        <strong>Coverage Details:</strong> {scheme.coverageDetails}
                      </div>

                      {/* Application Steps */}
                      <div>
                        <strong>Application Steps:</strong>
                        <ol className="list-decimal list-inside space-y-1 mt-1 text-[#64748B]">
                          {scheme.applicationProcess.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
                        <span className="text-[11px] text-[#64748B]">
                          Verified: {scheme.lastVerifiedDate}
                        </span>
                        <a
                          href={scheme.officialPortalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#2563EB] hover:underline"
                        >
                          <span>Visit Official Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Statutory Authorities & Helplines */}
      {activeTab === 'portals' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Statutory Authorities & Helplines</h2>
            <p className="text-xs text-[#64748B]">
              National and regional coordination organizations overseeing organ retrieval and allocation in India.
            </p>
          </div>

          {isLoading && (
            <div className="p-6 text-center text-xs text-[#64748B]">
              Loading verified regulatory portals...
            </div>
          )}

          {/* Simple Rows */}
          <div className="space-y-2.5">
            {regulatoryPortals.map((portal) => (
              <div
                key={portal.name}
                className="p-3.5 sm:p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#2563EB]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F8FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] text-sm truncate">{portal.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 shrink-0">
                        {portal.role}
                      </span>
                    </div>
                    <p className="text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
                      {portal.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 font-mono text-[11px] text-[#64748B]">
                      <span className="flex items-center gap-1 font-bold text-[#2563EB]">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${portal.tollFreeHelpline.replace(/[^0-9]/g, '')}`} className="hover:underline">
                          {portal.tollFreeHelpline}
                        </a>
                      </span>
                      <span>&bull;</span>
                      <span>{portal.email}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F4F8FF] text-[#1D4ED8] hover:bg-[#2563EB]/15 border border-[#2563EB]/20 transition-colors"
                  >
                    <span>View Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Modal */}
      <RequestSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
