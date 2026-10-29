import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const UnauthorizedPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const location = useLocation();
  const requiredRoles = (location.state as { requiredRoles?: string[] } | null)?.requiredRoles;

  return (
    <div className="py-12 max-w-lg mx-auto px-4 text-left space-y-6">
      <Card className="border-[#2563EB]/30 bg-[#F4F8FF]/50 shadow-sm">
        <CardContent className="space-y-5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white">
            <ShieldAlert className="w-6 h-6 text-[#2563EB]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
              Access Restricted
            </h1>
            <p className="text-xs text-[#64748B]">
              You do not have the institutional clearance required to access this portal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Logged in account:</span>
              <span className="font-bold text-[#0F172A]">{currentUser?.fullName || 'Anonymous User'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Current role:</span>
              <span className="font-bold text-[#2563EB] capitalize">{role.replace('_', ' ')}</span>
            </div>
            {requiredRoles && requiredRoles.length > 0 && (
              <div className="flex justify-between border-t border-[#E2E8F0] pt-2">
                <span className="text-[#64748B]">Required clearance:</span>
                <span className="font-bold text-[#1D4ED8] capitalize">{requiredRoles.join(', ')}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            In compliance with THOTA 1994 data governance and patient confidentiality regulations, medical record modules, volunteer matching, and directorate consoles require validated credentials.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/patient">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Go to Patient Workspace
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" leftIcon={<Home className="w-4 h-4" />}>
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
