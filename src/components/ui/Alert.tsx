import { AlertCircle, Info, Scale, ShieldCheck } from 'lucide-react';
import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'statutory' | 'warning' | 'contrast' | 'danger' | 'error';
  title?: string;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  icon,
  className = '',
  ...props
}) => {
  const styles = {
    info: {
      container: 'bg-[#F4F8FF] border-[#2563EB]/25 text-[#0F172A]',
      icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
      titleColor: 'text-[#1D4ED8]',
    },
    statutory: {
      container: 'bg-[#F4F8FF] border-[#2563EB]/40 text-[#0F172A]',
      icon: <Scale className="w-5 h-5 text-[#2563EB] shrink-0" />,
      titleColor: 'text-[#0F172A]',
    },
    warning: {
      container: 'bg-[#F4F8FF] border-[#2563EB]/50 text-[#0F172A]',
      icon: <AlertCircle className="w-5 h-5 text-[#1D4ED8] shrink-0" />,
      titleColor: 'text-[#1D4ED8]',
    },
    danger: {
      container: 'bg-[#F4F8FF] border-[#2563EB]/60 text-[#0F172A]',
      icon: <AlertCircle className="w-5 h-5 text-[#1D4ED8] shrink-0" />,
      titleColor: 'text-[#1D4ED8]',
    },
    error: {
      container: 'bg-[#F4F8FF] border-[#2563EB]/60 text-[#0F172A]',
      icon: <AlertCircle className="w-5 h-5 text-[#1D4ED8] shrink-0" />,
      titleColor: 'text-[#1D4ED8]',
    },
    contrast: {
      container: 'bg-[#0F172A] border-[#2563EB]/40 text-white',
      icon: <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0" />,
      titleColor: 'text-white',
    },
  };

  const current = styles[variant] || styles.info;

  return (
    <div
      role="region"
      aria-label={title || 'Notice'}
      className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 transition-all ${current.container} ${className}`}
      {...props}
    >
      <div className="mt-0.5">{icon || current.icon}</div>
      <div className="flex-1 space-y-1 text-xs leading-relaxed">
        {title && <h5 className={`font-bold font-heading text-sm ${current.titleColor}`}>{title}</h5>}
        <div className="text-inherit opacity-90">{children}</div>
      </div>
    </div>
  );
};
