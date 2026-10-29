import {
  CheckSquare,
  Download,
  Filter,
  Printer,
  RefreshCw,
  ShieldAlert,
  Square
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { JourneyStage } from '../../types';
import { usePatientChecklist } from './usePatientData';

export const AdministrativeChecklist: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo-patient';
  const { items, isLoading, isError, refetch, toggleItem, isToggling } = usePatientChecklist();
  const [selectedStage, setSelectedStage] = useState<JourneyStage | 'all'>('all');

  const handleToggle = (id: string) => {
    toggleItem(id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `TRANSPLANT SAATHI - PATIENT ADMINISTRATIVE CHECKLIST
Generated for: ${currentUser?.fullName || 'Patient'}
Date: ${new Date().toLocaleDateString('en-IN')}

${items
  .map(
    (item, idx) =>
      `${idx + 1}. [${item.isCompleted ? 'COMPLETED' : 'PENDING'}] ${item.title}\n   Stage: ${item.stage.toUpperCase()}\n   Statutory Ref: ${item.statutoryReference || 'Standard Protocol'}\n   ${item.notes ? `Notes: ${item.notes}\n` : ''}`
  )
  .join('\n')}

DISCLAIMER: Non-clinical administrative preparation record. Official organ clearance rests solely with the competent State Authorization Committee under THOTA 1994.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transplant_saathi_checklist_${userId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems = selectedStage === 'all'
    ? items
    : items.filter((i) => i.stage === selectedStage);

  const completedCount = items.filter((i) => i.isCompleted).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 text-left">
      {/* Header and Progress Card */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#2563EB]" />
              Administrative & Document Readiness
            </h2>
            <p className="text-xs text-[#64748B]">
              Track statutory forms, joint affidavits, and hospital paperwork required before surgery.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#0F172A] font-medium">
            <span>Overall Readiness Progress</span>
            <span className="font-bold text-[#2563EB]">
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#F4F8FF] rounded-full overflow-hidden border border-[#E2E8F0]">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Stage Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
        {(
          [
            ['all', 'All Requirements'],
            ['evaluation', 'Evaluation'],
            ['legal_clearance', 'Legal Clearance (THOTA)'],
            ['pre_transplant', 'Pre-Transplant'],
            ['surgery', 'Surgery'],
            ['post_discharge', 'Post-Discharge']
          ] as const
        ).map(([stage, label]) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
              selectedStage === stage
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F4F8FF]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading, Error, and Items */}
      {isLoading ? (
        <SkeletonCard count={4} />
      ) : isError ? (
        <Card className="p-6 text-center bg-white border-[#E2E8F0] space-y-3">
          <p className="text-xs text-[#64748B]">Could not load administrative checklist from the database.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Load
          </Button>
        </Card>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No Checklist Items for this Stage"
          description="Select another stage filter to view statutory filing milestones."
          actionText="View All Requirements"
          onAction={() => setSelectedStage('all')}
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`p-4 border transition-all ${
                item.isCompleted
                  ? 'bg-white border-[#E2E8F0] opacity-90'
                  : 'bg-white border-[#2563EB]/40 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(item.id)}
                  disabled={isToggling}
                  aria-label={`Toggle item ${item.title}`}
                  className="mt-0.5 text-[#2563EB] hover:text-[#1D4ED8] focus:outline-hidden cursor-pointer"
                >
                  {item.isCompleted ? (
                    <CheckSquare className="w-5 h-5 fill-[#2563EB] text-white" />
                  ) : (
                    <Square className="w-5 h-5 text-[#64748B]" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        item.isCompleted ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.isMandatory && (
                      <Badge variant="navy" className="text-[10px]">
                        Mandatory
                      </Badge>
                    )}
                    {item.statutoryReference && (
                      <Badge variant="neutral" className="text-[10px]">
                        {item.statutoryReference}
                      </Badge>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-[#64748B] italic">
                      Note: {item.notes}
                    </p>
                  )}

                  {item.completedAt && (
                    <p className="text-[10px] text-[#2563EB]">
                      Verified on {new Date(item.completedAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Non-Clinical Advisory Notice */}
      <Card className="p-4 bg-[#F4F8FF] border border-[#2563EB]/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="text-xs text-[#0F172A] space-y-1">
            <span className="font-bold">Administrative Guidance Only:</span>
            <p className="text-[#64748B] leading-relaxed">
              Completing checklist items organizes personal documentation. Final legal and clinical approval rests with the hospital's Competent Authority and the State Authorization Committee under the Transplantation of Human Organs and Tissues Act (THOTA) 1994.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
