import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'subtle' | 'outline' | 'navy';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'subtle',
  className = '',
  icon
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors';

  const variants = {
    primary: 'bg-[#2563EB] text-white',
    subtle: 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/20',
    outline: 'bg-white text-[#0F172A] border border-[#E2E8F0]',
    navy: 'bg-[#0F172A] text-white'
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
