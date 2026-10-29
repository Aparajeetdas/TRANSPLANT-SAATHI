import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { VERIFIED_HOSPITALS } from '../../lib/mockData';
import { saveStoredHospitals } from '../../lib/store';
import { DirectoryPage } from './DirectoryPage';
import { HospitalDetailPage } from './HospitalDetailPage';

const renderDirectory = (initialPath = '/directory') => {
  const testClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={testClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Hospital Directory & Statutory Source Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    saveStoredHospitals(VERIFIED_HOSPITALS);
  });

  it('renders directory header, search, filters, and demonstration badges', async () => {
    renderDirectory();

    expect(screen.getByText(/verified transplant center directory/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search verified hospitals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by organ program/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by review status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort hospitals by/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/demonstration record/i).length).toBeGreaterThan(0);
    });
  });

  it('filters hospitals by text search (name, city, coordinator)', async () => {
    renderDirectory();

    const searchInput = screen.getByLabelText(/search verified hospitals/i);

    // Search by hospital name
    fireEvent.change(searchInput, { target: { value: 'AIIMS' } });
    await waitFor(() => {
      expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
      expect(screen.queryByText(/Postgraduate Institute of Medical Education/i)).not.toBeInTheDocument();
    });

    // Search by city
    fireEvent.change(searchInput, { target: { value: 'Mumbai' } });
    await waitFor(() => {
      expect(screen.getByText(/King Edward Memorial/i)).toBeInTheDocument();
      expect(screen.queryByText(/All India Institute of Medical Sciences/i)).not.toBeInTheDocument();
    });

    // Search by coordinator name
    fireEvent.change(searchInput, { target: { value: 'Harpreet' } });
    await waitFor(() => {
      expect(screen.getByText(/Postgraduate Institute of Medical Education/i)).toBeInTheDocument();
    });
  });

  it('filters hospitals by organ program', async () => {
    renderDirectory();

    const organSelect = screen.getByLabelText(/filter by organ program/i);

    // Filter by liver
    fireEvent.change(organSelect, { target: { value: 'liver' } });
    await waitFor(() => {
      expect(screen.getByText(/Institute of Liver and Biliary Sciences/i)).toBeInTheDocument();
      // NIMHANS only supports cornea and bone_marrow, should not be displayed
      expect(screen.queryByText(/National Institute of Mental Health and Neurosciences/i)).not.toBeInTheDocument();
    });
  });

  it('filters hospitals by review status', async () => {
    renderDirectory();

    const statusSelect = screen.getByLabelText(/filter by review status/i);

    // Filter by pending audit
    fireEvent.change(statusSelect, { target: { value: 'pending' } });
    await waitFor(() => {
      expect(screen.getByText(/National Institute of Mental Health and Neurosciences/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Audit/i)).toBeInTheDocument();
      expect(screen.queryByText(/All India Institute of Medical Sciences/i)).not.toBeInTheDocument();
    });
  });

  it('handles empty results and resets filters gracefully', async () => {
    renderDirectory();

    const searchInput = screen.getByLabelText(/search verified hospitals/i);
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_HOSPITAL_XYZ_999' } });

    await waitFor(() => {
      expect(screen.getByText(/no verified transplant centers found/i)).toBeInTheDocument();
    });

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
      expect(screen.queryByText(/no verified transplant centers found/i)).not.toBeInTheDocument();
    });
  });

  it('paginates results across pages with Next and Previous buttons', async () => {
    renderDirectory();

    // 6 total hospitals, pageSize is 4 -> Page 1 has 4 items
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /go to next page/i });
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /go to previous page/i });
    expect(prevButton).not.toBeDisabled();

    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    });
  });

  it('renders mobile view tabs and allows switching views', async () => {
    renderDirectory();

    const listTab = screen.getByRole('button', { name: /show list view/i });
    const mapTab = screen.getByRole('button', { name: /show interactive map view/i });

    expect(listTab).toBeInTheDocument();
    expect(mapTab).toBeInTheDocument();

    fireEvent.click(mapTab);
    expect(mapTab.className).toContain('bg-[#2563EB]');

    fireEvent.click(listTab);
    expect(listTab.className).toContain('bg-[#2563EB]');
  });

  it('renders HospitalDetailPage with granular statutory source citations table', async () => {
    renderDirectory('/hospitals/hosp-001');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /All India Institute of Medical Sciences/i })).toBeInTheDocument();
      expect(screen.getByText(/Supported Programs & Statutory Source Verifications/i)).toBeInTheDocument();
    });

    // Check statutory notice
    expect(
      screen.getByText(/Transplant Saathi enforces strict source integrity: we never claim a hospital currently offers an organ transplant service unless supported by an official gazette citation/i)
    ).toBeInTheDocument();

    // Check program citations
    expect(screen.getByText(/NOTTO National Apex Registry/i)).toBeInTheDocument();
    expect(screen.getByText(/MoHFW Gazette Notif. No. T-12014\/05\/2024-NOTTO/i)).toBeInTheDocument();
    expect(screen.getByText(/NOTTO National Liver Allocation Hub/i)).toBeInTheDocument();

    // Check Nodal office details
    expect(screen.getByText(/Dr. V. K. Sharma \(Transplant Nodal Office\)/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91-11-26588500/i)).toBeInTheDocument();
  });
});
