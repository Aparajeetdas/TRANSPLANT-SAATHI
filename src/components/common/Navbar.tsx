import {
  Compass,
  FileText,
  HeartHandshake,
  Hospital,
  IndianRupee,
  Menu,
  PhoneCall,
  ShieldAlert,
  UserCheck,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRequestSupport: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRequestSupport,
  onOpenAuth
}) => {
  const { currentUser, role, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'roadmap', label: 'Transplant Roadmap', icon: Compass },
    { id: 'directory', label: 'Verified Centers & Map', icon: Hospital },
    { id: 'checklist', label: 'THOTA Legal Forms', icon: FileText },
    { id: 'schemes', label: 'Financial Schemes', icon: IndianRupee },
    { id: 'volunteer-portal', label: 'Volunteer Saathi', icon: HeartHandshake, roleRestricted: false },
    { id: 'hospital-portal', label: 'Hospital Coordinator', icon: Hospital, roleRestricted: true, minRole: 'hospital_staff' },
    { id: 'admin-portal', label: 'Admin Oversight', icon: ShieldAlert, roleRestricted: true, minRole: 'admin' }
  ];

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
    if (newRole === 'volunteer') setActiveTab('volunteer-portal');
    else if (newRole === 'hospital_staff') setActiveTab('hospital-portal');
    else if (newRole === 'admin') setActiveTab('admin-portal');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
      {/* Top utility sub-bar */}
      <div className="bg-[#F4F8FF] border-b border-[#E2E8F0] px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
              NOTTO 24/7 National Toll-Free:
              <a href="tel:1800114770" className="text-[#2563EB] font-bold hover:underline">
                1800-11-4770
              </a>
            </span>
            <span className="hidden sm:inline-block text-[#64748B]">|</span>
            <span className="hidden sm:inline-block text-[#64748B]">
              Standardized Navigation Framework
            </span>
          </div>

          {/* Quick Role Switcher for prototype validation */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748B] font-medium hidden md:inline">
              Simulate Persona:
            </span>
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] hover:bg-[#F4F8FF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                aria-expanded={roleDropdownOpen}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="capitalize">{role.replace('_', ' ')}</span>
                <span className="text-[10px] text-[#64748B] bg-[#F4F8FF] px-1 py-0.2 rounded border border-[#E2E8F0]">
                  Switch
                </span>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-60 rounded-xl bg-white shadow-xl border border-[#E2E8F0] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E2E8F0]">
                    Select Test Role (Prototype RBAC)
                  </div>
                  {(['patient', 'family', 'volunteer', 'hospital_staff', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F4F8FF] transition-colors ${
                        role === r ? 'font-bold text-[#2563EB] bg-[#F4F8FF]/80' : 'text-[#0F172A]'
                      }`}
                    >
                      <span className="capitalize">{r.replace('_', ' ')}</span>
                      {role === r && <Badge variant="primary">Active</Badge>}
                    </button>
                  ))}
                  <div className="border-t border-[#E2E8F0] mt-1 pt-1 px-3">
                    <button
                      onClick={() => {
                        logout();
                        setRoleDropdownOpen(false);
                      }}
                      className="text-[11px] text-[#64748B] hover:text-[#0F172A] py-1 block w-full text-left"
                    >
                      Log out (Browse as Guest)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('roadmap')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm shadow-[#2563EB]/25 group-hover:bg-[#1D4ED8] transition-colors">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#0F172A] tracking-tight font-heading">
                  Transplant Saathi
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30">
                  National Guide
                </span>
              </div>
              <p className="text-xs text-[#64748B] hidden sm:block">
                Compassionate Navigation for Patients & Families
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30 shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestSupport}
              leftIcon={<HeartHandshake className="w-4 h-4 text-[#2563EB]" />}
            >
              Request a Saathi
            </Button>
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#0F172A] leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-[#64748B] capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-[#1D4ED8] flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={onOpenAuth}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 xl:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestSupport}
              className="text-xs px-2.5 py-1.5"
            >
              Request Saathi
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#0F172A] hover:bg-[#F4F8FF] border border-[#E2E8F0]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-[#E2E8F0] px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                    isActive
                      ? 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30'
                      : 'text-[#64748B] hover:bg-[#F4F8FF]/50 text-left'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                    {item.label}
                  </span>
                  {item.roleRestricted && (
                    <span className="text-[10px] text-[#64748B] uppercase font-bold px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0]">
                      Staff
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onRequestSupport();
                setMobileMenuOpen(false);
              }}
              className="w-full"
              leftIcon={<HeartHandshake className="w-4 h-4" />}
            >
              Request a Saathi (Volunteer Peer Guide)
            </Button>
            <a
              href="tel:1800114770"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30 text-sm font-semibold text-center"
            >
              <PhoneCall className="w-4 h-4" />
              Call NOTTO Helpline: 1800-11-4770
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
