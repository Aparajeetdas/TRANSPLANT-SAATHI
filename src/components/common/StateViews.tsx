import { AlertCircle, AlertTriangle, FileQuestion, Loader2, Lock } from 'lucide-react';
import React from 'react';
import { Button } from './Button';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading verified clinical navigation records...'
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-[#F4F8FF] border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] mb-4">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
    <h4 className="text-base font-semibold text-[#0F172A]">{message}</h4>
    <p className="text-xs text-[#64748B] mt-1 max-w-sm">
      Connecting to encrypted registry data store...
    </p>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <FileQuestion className="w-8 h-8 text-[#2563EB]" />
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F4F8FF]/30">
    <div className="w-14 h-14 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/20 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h4 className="text-base font-bold text-[#0F172A]">{title}</h4>
    <p className="text-sm text-[#64748B] mt-1 max-w-md">{description}</p>
    {actionText && onAction && (
      <Button variant="primary" size="sm" onClick={onAction} className="mt-4">
        {actionText}
      </Button>
    )}
  </div>
);

export const ErrorMessage: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  isPermissionDenied?: boolean;
}> = ({
  title = 'An error occurred',
  message,
  onRetry,
  isPermissionDenied = false
}) => (
  <div className="rounded-xl border border-[#2563EB]/30 bg-[#F4F8FF] p-6 text-left my-4">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-white border border-[#2563EB]/20 text-[#1D4ED8] shrink-0">
        {isPermissionDenied ? (
          <Lock className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-[#0F172A]">
          {isPermissionDenied ? 'Access Restricted (Role Check Failed)' : title}
        </h4>
        <p className="text-xs text-[#64748B] mt-1">{message}</p>
        {isPermissionDenied && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#1D4ED8] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#2563EB]" />
            <span>
              This section requires verified coordinator or administrator authorization under statutory compliance rules.
            </span>
          </div>
        )}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            Retry Operation
          </Button>
        )}
      </div>
    </div>
  </div>
);
