import { FileSearch } from 'lucide-react';
import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are no active records matching your criteria. Try adjusting your filters or check back later.',
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-white p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-2xs ${className}`}
      role="region"
      aria-label="Empty state notice"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB] mx-auto">
        {icon || <FileSearch className="w-7 h-7" />}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-heading">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
