import {
  Bookmark,
  CheckSquare,
  Compass,
  FileText,
  HelpCircle,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { AdministrativeChecklist } from '../../features/patient/AdministrativeChecklist';
import { AppointmentNotesLogger } from '../../features/patient/AppointmentNotesLogger';
import { ExpensePlanner } from '../../features/patient/ExpensePlanner';
import { JourneyTracker } from '../../features/patient/JourneyTracker';
import { PrivacySettings } from '../../features/patient/PrivacySettings';
import { SavedHospitalsAndResources } from '../../features/patient/SavedHospitalsAndResources';
import { SupportRequestTracker } from '../../features/patient/SupportRequestTracker';

export const PatientDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'journey' | 'checklist' | 'notes' | 'support' | 'expenses' | 'saved' | 'privacy'
  >('journey');

  return (
    <div className="py-6 sm:py-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      {/* Patient Welcome Hero */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary">
                {currentUser?.role === 'family' ? 'Family Caregiver Workspace' : 'Patient Workspace'}
              </Badge>
              <Badge variant="neutral">Organ: KIDNEY / RENAL</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
              Welcome back, {currentUser?.fullName || 'Transplant Saathi Patient'}
            </h1>
            <p className="text-sm text-[#64748B] max-w-2xl">
              Track your THOTA administrative milestones, organize statutory filings, prepare doctor visit notes, and coordinate peer volunteer navigation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-center sm:text-right">
              <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
                Emergency 24x7 NOTTO Helpline
              </div>
              <div className="text-base font-extrabold text-[#2563EB] font-heading">
                1800-11-4770
              </div>
              <div className="text-[10px] text-[#64748B]">Toll Free Statutory Assistance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Non-Clinical Governance Notice */}
      <Alert
        variant="statutory"
        title="Statutory Non-Clinical Scope Notice"
      >
        Transplant Saathi provides non-clinical administrative preparation, logistical wayfinding, and statutory filing navigation only. We do not make clinical decisions, assess medical organ suitability, or match donors. Living donor clearances and cadaveric waitlist allocations are conducted exclusively by authorized hospital transplant coordinators and State Authorization Committees pursuant to the Transplantation of Human Organs and Tissues Act (THOTA) 1994.
      </Alert>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E2E8F0]">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
          {[
            { id: 'journey', label: 'Journey Tracker', icon: Compass },
            { id: 'checklist', label: 'Administrative Checklist', icon: CheckSquare },
            { id: 'notes', label: 'Doctor Notes', icon: FileText },
            { id: 'support', label: 'Volunteer Requests', icon: HelpCircle },
            { id: 'expenses', label: 'Expense Planner', icon: IndianRupee },
            { id: 'saved', label: 'Saved Hospitals', icon: Bookmark },
            { id: 'privacy', label: 'Privacy & Consents', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'journey' && <JourneyTracker />}
        {activeTab === 'checklist' && <AdministrativeChecklist />}
        {activeTab === 'notes' && <AppointmentNotesLogger />}
        {activeTab === 'support' && <SupportRequestTracker />}
        {activeTab === 'expenses' && <ExpensePlanner />}
        {activeTab === 'saved' && <SavedHospitalsAndResources />}
        {activeTab === 'privacy' && <PrivacySettings />}
      </div>
    </div>
  );
};
