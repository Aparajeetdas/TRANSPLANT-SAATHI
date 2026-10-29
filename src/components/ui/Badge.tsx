import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'subtle' | 'outline' | 'navy' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'subtle',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseClasses =
    size === 'sm'
      ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide select-none transition-colors'
      : 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide select-none transition-colors';

  const variants = {
    primary: 'bg-[#2563EB] text-white',
    subtle: 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/25',
    neutral: 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/25',
    outline: 'bg-white text-[#0F172A] border border-[#E2E8F0]',
    navy: 'bg-[#0F172A] text-white',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
