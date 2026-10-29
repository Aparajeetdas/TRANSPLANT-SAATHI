import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, id, className = '', required, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1 text-left">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-bold text-[#0F172A]">
            {label} {required && <span className="text-[#2563EB]">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={generatedId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
            className={`w-full py-2 text-xs rounded-xl border transition-all text-[#0F172A] placeholder-[#64748B] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-1 disabled:opacity-50 disabled:bg-[#F4F8FF] ${
              leftIcon ? 'pl-9' : 'pl-3'
            } ${rightIcon ? 'pr-9' : 'pr-3'} ${
              error ? 'border-[#2563EB] ring-1 ring-[#2563EB]' : 'border-[#E2E8F0] hover:border-[#2563EB]/40'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${generatedId}-error`} className="text-[11px] font-semibold text-[#1D4ED8]" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${generatedId}-helper`} className="text-[11px] text-[#64748B]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
