import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-[#E2E8F0]/80 rounded-md';

  if (variant === 'circular') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width: width || '2.5rem', height: height || width || '2.5rem', ...style }}
        {...props}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div
        className={`${baseClasses} h-4 w-full rounded-sm ${className}`}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4 ${className}`}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#E2E8F0] animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 rounded-sm bg-[#E2E8F0] animate-pulse" />
            <div className="h-3 w-1/2 rounded-sm bg-[#E2E8F0] animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full rounded-sm bg-[#E2E8F0] animate-pulse" />
          <div className="h-3 w-5/6 rounded-sm bg-[#E2E8F0] animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded-lg bg-[#E2E8F0] animate-pulse pt-2" />
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`flex items-center gap-4 py-3 px-4 border-b border-[#E2E8F0] bg-white ${className}`} {...props}>
        <div className="h-4 w-1/4 rounded-sm bg-[#E2E8F0] animate-pulse" />
        <div className="h-4 w-1/3 rounded-sm bg-[#E2E8F0] animate-pulse" />
        <div className="h-4 w-1/6 rounded-sm bg-[#E2E8F0] animate-pulse" />
        <div className="h-4 w-1/6 rounded-sm bg-[#E2E8F0] animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};

export const SkeletonCard = ({ count = 1, className = '' }: { count?: number; className?: string }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
    {Array.from({ length: count }).map((_, idx) => (
      <Skeleton key={idx} variant="card" />
    ))}
  </div>
);
