import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl' | '7xl' | 'full';
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  badge,
  headerActions,
  maxWidth = '7xl',
  children,
  className = '',
  ...props
}) => {
  const maxWidthMap = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-2xl',
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-left ${maxWidthMap[maxWidth]} ${className}`}
      {...props}
    >
      {(title || subtitle || badge || headerActions) && (
        <header className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              {badge && <div className="mb-2">{badge}</div>}
              {title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-heading">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && <div className="flex items-center gap-3 shrink-0">{headerActions}</div>}
          </div>
          <div className="h-px w-full bg-[#E2E8F0]" />
        </header>
      )}
      <main>{children}</main>
    </div>
  );
};
