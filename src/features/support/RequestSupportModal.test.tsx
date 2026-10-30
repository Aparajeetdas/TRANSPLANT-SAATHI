import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { AuthProvider } from '../../context/AuthContext';
import { DEMO_PROFILES } from '../../lib/mockData';
import * as storeModule from '../../lib/store';
import { setStoredUser } from '../../lib/store';
import { RequestSupportModal } from './RequestSupportModal';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('RequestSupportModal & Dialog Stacking Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    setStoredUser(DEMO_PROFILES[0]); // Patient
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
    vi.restoreAllMocks();
  });

  it('ensures modal dialog is rendered above the backdrop with correct stacking classes', () => {
    renderWithProviders(<RequestSupportModal isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const backdrop = screen.getByTestId('modal-backdrop');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass('backdrop-blur-xs');

    // Dialog card content must be above the backdrop with relative z-10 and pointer-events-auto
    const heading = screen.getByRole('heading', { name: /Request a Volunteer Saathi/i });
    const modalPanel = heading.closest('.bg-white');
    expect(modalPanel).not.toBeNull();
    expect(modalPanel).toHaveClass('relative');
    expect(modalPanel).toHaveClass('z-10');
    expect(modalPanel).toHaveClass('pointer-events-auto');
  });

  it('restores body overflow completely when closed via Cancel button', () => {
    const handleClose = vi.fn();
    const { rerender } = renderWithProviders(
      <RequestSupportModal isOpen={true} onClose={handleClose} />
    );

    expect(document.body.style.overflow).toBe('hidden');

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();

    // Rerender as closed
    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
          <MemoryRouter>
            <RequestSupportModal isOpen={false} onClose={handleClose} />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(document.body.style.overflow).toBe('unset');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('restores body overflow completely on component unmount', () => {
    const { unmount } = renderWithProviders(
      <RequestSupportModal isOpen={true} onClose={vi.fn()} />
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });

  it('submits a valid volunteer request and displays confirmation state', async () => {
    const handleSuccess = vi.fn();
    renderWithProviders(
      <RequestSupportModal
        isOpen={true}
        onClose={vi.fn()}
        defaultHospitalName="AIIMS Apex Transplant Center"
        onSuccess={handleSuccess}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /submit support request/i });
    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: /support request submitted successfully/i })
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(handleSuccess).toHaveBeenCalled();
  });

  it('handles API / persistence error gracefully and displays error banner without freezing or persistent blur', async () => {
    // Force saveStoredRequests to throw an error
    vi.spyOn(storeModule, 'saveStoredRequests').mockImplementation(() => {
      throw new Error('Database connection failed during request creation');
    });

    renderWithProviders(
      <RequestSupportModal
        isOpen={true}
        onClose={vi.fn()}
        defaultHospitalName="AIIMS Apex Transplant Center"
      />
    );

    const submitBtn = screen.getByRole('button', { name: /submit support request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/database connection failed during request creation/i)
      ).toBeInTheDocument();
    });

    // Modal remains fully interactive and accessible
    expect(submitBtn).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('triggers modal from navbar Request Saathi button and restores page on close', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<div data-testid="home">Home Content</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Click Request Saathi in navbar
    const requestBtn = screen.getAllByRole('button', { name: /request saathi/i })[0];
    fireEvent.click(requestBtn);

    expect(
      screen.getByRole('heading', { name: /Request a Volunteer Saathi/i })
    ).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    // Close with Escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(document.body.style.overflow).toBe('unset');
    expect(
      screen.queryByRole('heading', { name: /Request a Volunteer Saathi/i })
    ).not.toBeInTheDocument();
  });
});
