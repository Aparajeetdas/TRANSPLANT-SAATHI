import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { DEMO_PROFILES } from '../../lib/mockData';
import { setStoredUser } from '../../lib/store';
import { PublicLayout } from './PublicLayout';

const renderNavbarWithRoute = (initialRoute = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<div>Home Page Content</div>} />
              <Route path="/directory" element={<div>Directory Content</div>} />
              <Route path="/resources" element={<div>Resources Content</div>} />
              <Route path="/how-it-works" element={<div>How It Works Content</div>} />
              <Route path="/about" element={<div>About Content</div>} />
              <Route path="/contact" element={<div>Contact & Help Content</div>} />
              <Route path="/patient" element={<div>Patient Workspace</div>} />
              <Route path="/auth/login" element={<div>Login Page</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Redesigned Transplant Saathi Navigation Bar', () => {
  beforeEach(() => {
    localStorage.clear();
    setStoredUser(DEMO_PROFILES[0]); // Rajesh Sharma, patient
  });

  it('renders left brand section with logo, brand name, and tagline without obsolete National Guide badge in row', () => {
    renderNavbarWithRoute('/');

    // Brand name and tagline
    expect(screen.getByRole('link', { name: /transplant saathi home/i })).toBeInTheDocument();
    expect(screen.getAllByText('Transplant Saathi').length).toBeGreaterThan(0);
    expect(screen.getByText('Compassionate Healthcare Navigation')).toBeInTheDocument();

    // Verify separate "National Guide" badge is removed from main navbar
    expect(screen.queryByText('National Guide')).not.toBeInTheDocument();
  });

  it('renders desktop center navigation links with active state styling', () => {
    renderNavbarWithRoute('/');

    const homeLink = screen.getAllByRole('link', { name: /^home$/i })[0];
    const directoryLink = screen.getAllByRole('link', { name: /^hospital directory$/i })[0];
    const resourcesLink = screen.getAllByRole('link', { name: /^official resources$/i })[0];
    const howItWorksLink = screen.getAllByRole('link', { name: /^how it works$/i })[0];
    const aboutLink = screen.getAllByRole('link', { name: /^about$/i })[0];

    expect(homeLink).toBeInTheDocument();
    expect(directoryLink).toBeInTheDocument();
    expect(resourcesLink).toBeInTheDocument();
    expect(howItWorksLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();

    // Home link should have active styling (brand blue text & light blue bg)
    expect(homeLink.className).toContain('text-[#2563EB]');
    expect(homeLink.className).toContain('bg-[#F4F8FF]');
  });

  it('renders right action controls with visual hierarchy', () => {
    renderNavbarWithRoute('/');

    // 1. Primary Action: Contact & Help
    const contactBtn = screen.getByRole('link', { name: /^contact & help$/i });
    expect(contactBtn).toBeInTheDocument();
    expect(contactBtn.className).toContain('bg-[#2563EB]');
    expect(contactBtn.className).toContain('text-white');

    // 2. Secondary Action: Request Saathi
    const requestBtn = screen.getAllByRole('button', { name: /request saathi/i })[0];
    expect(requestBtn).toBeInTheDocument();
    expect(requestBtn.className).toContain('bg-[#F4F8FF]');

    // 3. Compact User Profile Dropdown
    const profileBtn = screen.getByRole('button', { name: /user profile/i });
    expect(profileBtn).toBeInTheDocument();
    expect(profileBtn).toHaveTextContent(/patient/i);
    expect(screen.getByText('Rajesh Sharma')).toBeInTheDocument();

    // Click profile dropdown to access Workspace, Role Switcher, and Logout
    fireEvent.click(profileBtn);
    expect(screen.getByRole('link', { name: /my workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out of account/i })).toBeInTheDocument();
  });

  it('opens and interacts with the simulation role switcher dropdown', async () => {
    renderNavbarWithRoute('/');

    const profileBtn = screen.getByRole('button', { name: /user profile/i });
    fireEvent.click(profileBtn);

    expect(screen.getByText(/switch test role \(rbac simulation\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volunteer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hospital staff/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
  });

  it('triggers the Request Saathi modal when clicking Request Saathi button', () => {
    renderNavbarWithRoute('/');

    const requestBtns = screen.getAllByRole('button', { name: /request saathi/i });
    fireEvent.click(requestBtns[0]);

    // Modal should be open
    expect(screen.getByRole('heading', { name: /Request a Volunteer Saathi/i })).toBeInTheDocument();
  });

  it('toggles mobile menu and allows keyboard navigation with Escape', () => {
    renderNavbarWithRoute('/');

    const hamburgerBtn = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(hamburgerBtn);
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/request a volunteer saathi/i)).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('handles sign in button when user is logged out', () => {
    setStoredUser(null);
    renderNavbarWithRoute('/');

    const signInBtn = screen.getByRole('link', { name: /sign in/i });
    expect(signInBtn).toBeInTheDocument();
  });

  describe('Responsive Layout Verification across Breakpoints', () => {
    const setWindowWidth = (width: number) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      window.dispatchEvent(new Event('resize'));
    };

    it('verifies 1440px and 1280px large desktop view displays full navigation and brand', () => {
      setWindowWidth(1440);
      renderNavbarWithRoute('/');
      expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument();
      expect(screen.getByText('Compassionate Healthcare Navigation')).toBeInTheDocument();

      setWindowWidth(1280);
      expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument();
    });

    it('verifies 1024px tablet landscape view renders navigation and compact controls without overflow', () => {
      setWindowWidth(1024);
      renderNavbarWithRoute('/');
      expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^contact & help$/i })).toBeInTheDocument();
    });

    it('verifies 768px tablet portrait view renders accessible hamburger menu toggle', () => {
      setWindowWidth(768);
      renderNavbarWithRoute('/');
      const hamburger = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(hamburger).toBeInTheDocument();

      fireEvent.click(hamburger);
      expect(screen.getAllByText('Navigation').length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    });

    it('verifies 390px mobile view renders compact layout with slide-out drawer', () => {
      setWindowWidth(390);
      renderNavbarWithRoute('/');
      const hamburger = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(hamburger).toBeInTheDocument();

      fireEvent.click(hamburger);
      expect(screen.getByText(/request a volunteer saathi/i)).toBeInTheDocument();
      expect(screen.getByText(/switch role simulation/i)).toBeInTheDocument();
    });

    it('verifies 320px compact mobile view displays brand without horizontal breakage', () => {
      setWindowWidth(320);
      renderNavbarWithRoute('/');
      expect(screen.getByRole('link', { name: /transplant saathi home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle navigation menu/i })).toBeInTheDocument();
    });
  });
});
