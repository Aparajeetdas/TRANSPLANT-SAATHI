import { AlertCircle, Lock } from 'lucide-react';
import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  isPermissionDenied?: boolean;
  retryText?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  isPermissionDenied = false,
  retryText,
  onRetry,
  className = '',
}) => {
  const defaultTitle = isPermissionDenied
    ? 'Access Restricted — Authorized Personnel Only'
    : 'System Communication Notice';

  const defaultMessage = isPermissionDenied
    ? 'You do not have the required statutory credentials to view this clinical or administrative dataset. Please sign in with an authorized account or switch your role.'
    : 'An error occurred while loading this healthcare record. Please verify your connection or try again.';

  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-2xs ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
        {isPermissionDenied ? (
          <Lock className="w-7 h-7" />
        ) : (
          <AlertCircle className="w-7 h-7" />
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-heading">
          {title || defaultTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-md mx-auto">
          {message || defaultMessage}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onRetry}>
            {retryText || (isPermissionDenied ? 'Request Access' : 'Retry Request')}
          </Button>
        </div>
      )}
    </div>
  );
};
