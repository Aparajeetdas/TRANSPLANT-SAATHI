import {
  ChevronDown,
  Compass,
  HeartHandshake,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PhoneCall,
  Scale,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RequestSupportModal } from '../../features/support/RequestSupportModal';
import { UserRole } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const PublicLayout: React.FC = () => {
  const { currentUser, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const moreNavRef = useRef<HTMLDivElement>(null);

  // Click outside and escape key handling for accessibility
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setRoleDropdownOpen(false);
      }
      if (moreNavRef.current && !moreNavRef.current.contains(target)) {
        setMoreNavOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRoleDropdownOpen(false);
        setMoreNavOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Primary 5 center navigation links
  const centerNavLinks = [
    { to: '/', label: 'Home' },
    { to: '/directory', label: 'Hospital Directory' },
    { to: '/resources', label: 'Official Resources' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about', label: 'About' },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
    if (newRole === 'volunteer') navigate('/volunteer');
    else if (newRole === 'hospital_staff') navigate('/hospital');
    else if (newRole === 'admin') navigate('/admin');
    else navigate('/patient');
  };

  const workspacePath =
    role === 'volunteer'
      ? '/volunteer'
      : role === 'hospital_staff'
      ? '/hospital'
      : role === 'admin'
      ? '/admin'
      : '/patient';

  const workspaceLabel =
    role === 'volunteer'
      ? 'Volunteer Portal'
      : role === 'hospital_staff'
      ? 'Staff Portal'
      : role === 'admin'
      ? 'Admin Console'
      : 'My Workspace';

  const getUserInitials = (name?: string): string => {
    if (!name) return 'RS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const displayName = currentUser?.fullName || 'Rajesh Sharma';
  const displayRole = (currentUser?.role || role || 'patient').replace('_', ' ');

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-[#2563EB]/15 selection:text-[#1D4ED8]">
      {/* 1. Permanent Statutory Compliance Header */}
      <div className="bg-[#0F172A] text-white border-b border-[#2563EB]/40 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2563EB] text-white font-bold text-[10px] tracking-wider uppercase">
              <Scale className="w-3 h-3" />
              THOTA 1994
            </span>
            <p className="text-white/90">
              Organ donation in India is strictly altruistic. Commercial trade is punishable with up to 10 years imprisonment.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/80 shrink-0">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>NOTTO 24/7 Helpline: </span>
              <a href="tel:1800114770" className="text-white font-bold hover:underline">
                1800-11-4770
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Redesigned Main Navigation Bar (80px height, clean blue & white) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left section: Logo & Brand */}
            <Link
              to="/"
              className="flex items-center gap-3 select-none group shrink-0"
              aria-label="Transplant Saathi Home"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1D4ED8] transition-colors shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold text-[#0F172A] tracking-tight font-heading leading-tight group-hover:text-[#2563EB] transition-colors">
                  Transplant Saathi
                </span>
                <span className="text-[11px] font-medium text-[#64748B] hidden sm:block leading-tight">
                  Compassionate Healthcare Navigation
                </span>
              </div>
            </Link>

            {/* Center section: Evenly spaced navigation links (Desktop full >= 1280px) */}
            <nav
              aria-label="Primary Navigation"
              className="hidden xl:flex items-center justify-center gap-1"
            >
              {centerNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-[#2563EB] bg-[#F4F8FF] font-bold border border-[#2563EB]/20 shadow-2xs'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF]/60'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Center section for 1024px-1279px (Tablet landscape: 3 core links + More menu) */}
            <nav
              aria-label="Tablet Navigation"
              className="hidden lg:flex xl:hidden items-center gap-1"
            >
              {centerNavLinks.slice(0, 3).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-[#2563EB] bg-[#F4F8FF] font-bold border border-[#2563EB]/20'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF]/60'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="relative" ref={moreNavRef}>
                <button
                  type="button"
                  onClick={() => setMoreNavOpen(!moreNavOpen)}
                  aria-expanded={moreNavOpen}
                  aria-haspopup="true"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF]/60 flex items-center gap-1 cursor-pointer"
                >
                  <span>More</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {moreNavOpen && (
                  <div className="absolute left-0 mt-1.5 w-44 rounded-xl bg-white shadow-lg border border-[#E2E8F0] py-1.5 z-50 text-left">
                    {centerNavLinks.slice(3).map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreNavOpen(false)}
                        className={({ isActive }) =>
                          `block px-3 py-2 text-xs font-medium ${
                            isActive
                              ? 'text-[#2563EB] bg-[#F4F8FF] font-bold'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF]/60'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right section: Organized account & primary actions */}
            <div className="hidden lg:flex items-center gap-2.5 shrink-0">
              {/* Primary action: Contact & Help */}
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-2xs transition-colors shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contact & Help</span>
              </Link>

              {/* Secondary action: Request Saathi */}
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1D4ED8] bg-[#F4F8FF] hover:bg-[#2563EB]/15 border border-[#2563EB]/25 transition-colors shrink-0 cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Request Saathi</span>
              </button>

              {/* Workspace Action: My Workspace */}
              {currentUser && (
                <Link
                  to={workspacePath}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F4F8FF] border border-[#E2E8F0] hover:border-[#2563EB]/40 transition-colors shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{workspaceLabel}</span>
                </Link>
              )}

              {/* Compact Patient Role Indicator & Switcher */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  aria-expanded={roleDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Simulate Persona / Role Switcher"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F4F8FF] text-xs font-medium text-[#0F172A] transition-colors cursor-pointer"
                  title="Simulate Persona / Role Switcher"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span className="capitalize font-semibold text-[11px] text-[#1D4ED8]">{role.replace('_', ' ')}</span>
                  <ChevronDown className="w-3 h-3 text-[#64748B]" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-[#E2E8F0] py-2 z-50 text-left">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E2E8F0]">
                      Switch Test Role (RBAC Simulation)
                    </div>
                    {(['patient', 'volunteer', 'hospital_staff', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F4F8FF] transition-colors cursor-pointer ${
                          role === r ? 'font-bold text-[#2563EB] bg-[#F4F8FF]/80' : 'text-[#0F172A]'
                        }`}
                      >
                        <span className="capitalize">{r.replace('_', ' ')}</span>
                        {role === r && <Badge variant="primary" size="sm">Active</Badge>}
                      </button>
                    ))}
                    <div className="border-t border-[#E2E8F0] mt-1 pt-1 px-3">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setRoleDropdownOpen(false);
                          navigate('/');
                        }}
                        className="text-[11px] text-[#64748B] hover:text-[#0F172A] py-1 block w-full text-left cursor-pointer"
                      >
                        Log out (Browse as Anonymous)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact User Profile Menu */}
              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getUserInitials(displayName)}
                    </div>
                    <div className="hidden 2xl:flex flex-col text-left leading-none">
                      <span className="text-xs font-semibold text-[#0F172A] truncate max-w-[110px]">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-[#64748B] capitalize">
                        {displayRole}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/auth/login');
                    }}
                    title="Log Out"
                    aria-label="Sign out of account"
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF] cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link to="/auth/login" className="pl-2 border-l border-[#E2E8F0]">
                  <Button variant="outline" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile & Tablet Toggle Controls (< 1024px) */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D4ED8] bg-[#F4F8FF] border border-[#2563EB]/25"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Request Saathi</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#0F172A] hover:bg-[#F4F8FF] border border-[#E2E8F0] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-menu"
            className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-3 pb-6 space-y-4 text-left shadow-lg"
          >
            {/* Center Navigation Links in mobile view */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3 py-1">
                Navigation
              </div>
              {centerNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between ${
                      isActive
                        ? 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30'
                        : 'text-[#64748B] hover:bg-[#F4F8FF]/50 hover:text-[#0F172A]'
                    }`
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}
              <NavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    isActive
                      ? 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30'
                      : 'text-[#64748B] hover:bg-[#F4F8FF]/50 hover:text-[#0F172A]'
                  }`
                }
              >
                <span>Contact & Help</span>
              </NavLink>
            </div>

            {/* Actions Section in mobile view */}
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsSupportModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full"
                leftIcon={<HeartHandshake className="w-4 h-4" />}
              >
                Request a Volunteer Saathi
              </Button>

              {currentUser ? (
                <div className="p-3 bg-[#F4F8FF] rounded-xl flex flex-col gap-3 border border-[#2563EB]/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {getUserInitials(displayName)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">{displayName}</div>
                        <div className="text-[10px] text-[#64748B] capitalize">{displayRole}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await logout();
                        setMobileMenuOpen(false);
                        navigate('/auth/login');
                      }}
                    >
                      Log Out
                    </Button>
                  </div>

                  <Link to={workspacePath} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                      {workspaceLabel}
                    </Button>
                  </Link>

                  {/* Mobile Role Switcher */}
                  <div className="pt-2 border-t border-[#E2E8F0]/80">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-[#2563EB]" />
                      <span>Switch Role Simulation:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['patient', 'volunteer', 'hospital_staff', 'admin'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleRoleChange(r)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium text-left capitalize transition-colors ${
                            role === r
                              ? 'bg-[#2563EB] text-white font-bold'
                              : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F4F8FF]'
                          }`}
                        >
                          {r.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. Main Outlet Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* 4. Comprehensive Statutory Footer */}
      <footer className="bg-[#0F172A] text-white border-t border-white/10 pt-14 pb-8 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight font-heading">Transplant Saathi</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                A public-interest healthcare navigation platform designed to empower transplant patients and families with transparent statutory guidelines, verified hospital directories, and peer coordination.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#F4F8FF] text-xs">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>Verified Independent Resource</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs text-white/75">
                <li><Link to="/" className="hover:text-white hover:underline">Platform Home</Link></li>
                <li><Link to="/directory" className="hover:text-white hover:underline">Hospital Directory</Link></li>
                <li><Link to="/resources" className="hover:text-white hover:underline">THOTA Legal Forms</Link></li>
                <li><Link to="/resources#schemes" className="hover:text-white hover:underline">Financial Aid Packages</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white hover:underline">How It Works</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                Policy & Governance
              </h4>
              <ul className="space-y-2 text-xs text-white/75">
                <li><Link to="/about" className="hover:text-white hover:underline">About the Platform</Link></li>
                <li><Link to="/privacy" className="hover:text-white hover:underline">Privacy Policy</Link></li>
                <li><Link to="/safety-and-limitations" className="hover:text-white hover:underline">Safety & Legal Boundaries</Link></li>
                <li><Link to="/contact" className="hover:text-white hover:underline">Contact & Helpdesk</Link></li>
                <li>
                  <a href="https://notto.mohfw.gov.in" target="_blank" rel="noreferrer" className="hover:text-white hover:underline">
                    NOTTO National Portal ↗
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                National 24/7 Helplines
              </h4>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                <div className="text-white/70">NOTTO National Toll-Free:</div>
                <div className="text-base font-bold text-white">1800-11-4770</div>
                <div className="text-[11px] text-white/50 pt-1 border-t border-white/10">
                  Ayushman Bharat Helpdesk: 14555
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-xs text-white/60 space-y-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 leading-relaxed text-[11px]">
              <strong className="text-white">Statutory Clinical Boundary: </strong>
              Transplant Saathi complies strictly with the Transplantation of Human Organs and Tissues Act (THOTA), 1994. The platform does not determine medical candidacy, evaluate patient eligibility, or allocate organs. Organ allocation is governed solely by registered hospital authorization committees and government nodal bodies (NOTTO / ROTTO / SOTTO).
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px]">
              <div>© 2026 Transplant Saathi. Built for public patient navigation in India.</div>
              <div className="flex items-center gap-3">
                <Link to="/privacy" className="hover:underline">Privacy</Link>
                <span>•</span>
                <Link to="/safety-and-limitations" className="hover:underline">Safety & Limitations</Link>
                <span>•</span>
                <Link to="/contact" className="hover:underline">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Support Request Modal */}
      <RequestSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
