import { AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { SkeletonCard } from '../ui/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { currentUser, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4 space-y-4 text-left">
        <div className="h-8 w-48 bg-[#F4F8FF] rounded-lg animate-pulse" />
        <SkeletonCard count={2} />
      </div>
    );
  }

  // 1. Not Authenticated: Redirect to Login with return path
  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Role Not Authorized: Display Accessible Permission Denied State
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="py-12 max-w-xl mx-auto px-4 text-left space-y-6">
        <Card className="border-[#2563EB]/30 bg-[#F4F8FF]/50 shadow-sm">
          <CardContent className="space-y-5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white">
              <ShieldAlert className="w-6 h-6 text-[#2563EB]" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Restricted Institutional Workspace</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0F172A] font-heading">
                Access Restricted: Role Authorization Required
              </h2>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Your authenticated account (<strong>{currentUser.fullName}</strong>) has the role{' '}
              <span className="font-bold text-[#0F172A] capitalize">"{role.replace('_', ' ')}"</span>.
              This portal requires one of the following institutional privileges:{' '}
              <span className="font-bold text-[#1D4ED8]">
                {allowedRoles.map((r) => r.replace('_', ' ')).join(', ')}
              </span>.
            </p>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-xs space-y-2">
              <div className="font-semibold text-[#0F172A]">Need Institutional Access?</div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Hospital staff and volunteer accounts cannot be self-selected through public registration. Contact your institutional transplant directorate or state SOTTO coordinator for clearance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/patient">
                <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Go to Patient Workspace
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
