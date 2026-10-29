import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import { DirectoryPage } from './DirectoryPage';
import { HomePage } from './HomePage';
import { HowItWorksPage } from './HowItWorksPage';
import { NotFoundPage } from './NotFoundPage';
import { PrivacyPage } from './PrivacyPage';
import { ResourcesPage } from './ResourcesPage';
import { SafetyLimitationsPage } from './SafetyLimitationsPage';

const renderWithProviders = (ui: React.ReactElement) => {
  const testClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={testClient}>
      <MemoryRouter>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Public Pages & Responsive Layout Suite', () => {
  it('renders HomePage with prominent hospital search action', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/compassionate guidance through organ transplantation in india/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter hospital name, city, or coordinator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search centers/i })).toBeInTheDocument();
  });

  it('renders DirectoryPage with search and filtering controls', () => {
    renderWithProviders(<DirectoryPage />);
    expect(screen.getByText(/verified transplant center directory/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by hospital name, city, registration number/i)).toBeInTheDocument();
  });

  it('renders ResourcesPage with statutory forms and official portals', () => {
    renderWithProviders(<ResourcesPage />);
    expect(screen.getByRole('heading', { level: 1, name: /official resources/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /legal forms/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /financial assistance/i })).toBeInTheDocument();
  });

  it('renders HowItWorksPage with living and deceased donor journeys', () => {
    renderWithProviders(<HowItWorksPage />);
    expect(screen.getByText(/how organ transplantation works in india/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /living donor pathway/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deceased donor waitlist/i })).toBeInTheDocument();
  });

  it('renders AboutPage with mission and ethical boundaries', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/human-centered healthcare navigation for transplant families/i)).toBeInTheDocument();
    expect(screen.getByText(/what transplant saathi never does/i)).toBeInTheDocument();
  });

  it('renders SafetyLimitationsPage with THOTA Section 19 warnings', () => {
    renderWithProviders(<SafetyLimitationsPage />);
    expect(screen.getByText(/safety, legal boundaries & platform limitations/i)).toBeInTheDocument();
    expect(screen.getByText(/criminal prohibition of commercial organ trade/i)).toBeInTheDocument();
  });

  it('renders ContactPage with national toll-free helplines and inquiry form', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByText(/contact transplant saathi/i)).toBeInTheDocument();
    expect(screen.getByText('1800-11-4770')).toBeInTheDocument();
    expect(screen.getByLabelText(/your full name/i)).toBeInTheDocument();
  });

  it('renders PrivacyPage with data protection standards', () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByText(/minimum necessary information standard/i)).toBeInTheDocument();
    expect(screen.getByText(/database authorization & row level security/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage with 404 message and navigation recovery shortcuts', () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByText(/this healthcare route does not exist/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /platform home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /hospital directory/i })).toBeInTheDocument();
  });

  it('renders HomePage with demonstration data labels on sample hospital records', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getAllByText(/Demonstration Record/i).length).toBeGreaterThan(0);
  });
});

