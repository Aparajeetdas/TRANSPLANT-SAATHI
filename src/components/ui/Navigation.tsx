import { Compass, Menu, PhoneCall, Scale, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface NavigationProps {
  brandName?: string;
  items?: NavItem[];
  userRole?: string;
  onRoleSwitch?: () => void;
  ctaButton?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  brandName = 'Transplant Saathi',
  items = [
    { label: 'Hospital Directory', href: '/directory' },
    { label: 'Official Resources', href: '/resources' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  userRole,
  onRoleSwitch,
  ctaButton,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full bg-white select-none">
      {/* Statutory THOTA Header */}
      <div className="bg-[#0F172A] text-white border-b border-[#2563EB]/40 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2563EB] text-white font-bold text-[10px] tracking-wider uppercase">
              <Scale className="w-3 h-3" />
              THOTA 1994
            </span>
            <p className="text-white/90 text-[11px] sm:text-xs">
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

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1D4ED8] transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-left flex flex-col">
                <span className="text-lg font-bold text-[#0F172A] tracking-tight font-heading leading-tight group-hover:text-[#2563EB] transition-colors">
                  {brandName}
                </span>
                <span className="text-[11px] font-medium text-[#64748B] hidden sm:block leading-tight">
                  Compassionate Healthcare Navigation
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    item.isActive
                      ? 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF]/50 border border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions & Role Indicator */}
            <div className="hidden lg:flex items-center gap-3">
              {userRole && (
                <button
                  onClick={onRoleSwitch}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] hover:bg-[#2563EB]/10 transition-colors"
                >
                  <span className="capitalize">{userRole.replace('_', ' ')}</span>
                  <span className="text-[10px] text-[#64748B] bg-white px-1 rounded border border-[#E2E8F0]">
                    Role
                  </span>
                </button>
              )}

              {ctaButton || (
                <Link to="/auth/login">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#0F172A] hover:bg-[#F4F8FF] border border-[#E2E8F0]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-3 pb-6 space-y-3 text-left">
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#F4F8FF] hover:text-[#0F172A]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {ctaButton && <div className="pt-2">{ctaButton}</div>}
          </div>
        )}
      </header>
    </div>
  );
};
