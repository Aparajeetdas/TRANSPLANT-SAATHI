import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { VERIFIED_HOSPITALS } from '../../lib/mockData';
import { saveStoredHospitals } from '../../lib/store';
import { DirectoryPage } from '../../pages/public/DirectoryPage';
import { HospitalDetailPage } from '../../pages/public/HospitalDetailPage';

const renderDirectoryWithQuery = (initialPath = '/directory') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
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

describe('Organ-Based Hospital Discovery & Verification System', () => {
  beforeEach(() => {
    localStorage.clear();
    saveStoredHospitals(VERIFIED_HOSPITALS);
    vi.restoreAllMocks();
  });

  describe('1. Organ Program Single Dropdown Selection', () => {
    it('renders a single compact Filter by Organ Program dropdown button containing all organ options', async () => {
      renderDirectoryWithQuery();

      const dropdownBtn = screen.getByRole('button', { name: /filter by organ program/i });
      expect(dropdownBtn).toBeInTheDocument();

      // Open the dropdown menu
      fireEvent.click(dropdownBtn);

      expect(screen.getByRole('menuitem', { name: 'All Organ Programs' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Kidney' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Liver' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Heart' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Lung' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Pancreas' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Intestine' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Cornea' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Bone Marrow/i })).toBeInTheDocument();
    });

    it('filters centers by selecting Heart from the organ dropdown and displays selected organ value', async () => {
      renderDirectoryWithQuery();

      const dropdownBtn = screen.getByRole('button', { name: /filter by organ program/i });
      fireEvent.click(dropdownBtn);

      const heartOption = screen.getByRole('menuitem', { name: 'Heart' });
      fireEvent.click(heartOption);

      await waitFor(() => {
        // AIIMS and Madras Medical College support Heart
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
        expect(screen.getByText(/Madras Medical College/i)).toBeInTheDocument();
        // PGIMER and ILBS do not support heart in our dataset
        expect(screen.queryByText(/Institute of Liver and Biliary Sciences/i)).not.toBeInTheDocument();
      });

      // Selected organ value should be displayed inside the dropdown button
      expect(dropdownBtn).toHaveTextContent(/Heart/i);
    });

    it('allows users to select an organ and clear the filter with All Organ Programs', async () => {
      renderDirectoryWithQuery();

      const dropdownBtn = screen.getByRole('button', { name: /filter by organ program/i });
      fireEvent.click(dropdownBtn);

      const heartOption = screen.getByRole('menuitem', { name: 'Heart' });
      fireEvent.click(heartOption);

      await waitFor(() => {
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
        // PGIMER does not support Heart
        expect(screen.queryByText(/Postgraduate Institute of Medical Education/i)).not.toBeInTheDocument();
      });

      // Clear filter by opening dropdown and selecting "All Organ Programs"
      fireEvent.click(dropdownBtn);
      const allOption = screen.getByRole('menuitem', { name: 'All Organ Programs' });
      fireEvent.click(allOption);

      await waitFor(() => {
        // Clearing filter displays ILBS and KEM on page 1
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
        expect(screen.getByText(/Institute of Liver and Biliary Sciences/i)).toBeInTheDocument();
      });
    });

    it('filters centers by Intestine from dropdown and shows verified statutory license citation', async () => {
      renderDirectoryWithQuery();

      const dropdownBtn = screen.getByRole('button', { name: /filter by organ program/i });
      fireEvent.click(dropdownBtn);

      const intestineOption = screen.getByRole('menuitem', { name: 'Intestine' });
      fireEvent.click(intestineOption);

      await waitFor(() => {
        // AIIMS has verified statutory intestine license
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
        expect(screen.queryByText(/King Edward Memorial/i)).not.toBeInTheDocument();
      });
    });

    it('highlights the selected organ service badge on matching hospital cards', async () => {
      renderDirectoryWithQuery('/directory?organ=liver');

      await waitFor(() => {
        expect(screen.getByText(/Institute of Liver and Biliary Sciences/i)).toBeInTheDocument();
      });

      // The active organ filter summary badge should be visible
      expect(screen.getByText(/Organ: Liver/i)).toBeInTheDocument();
    });
  });

  describe('2. Search & Location Filters (Without Country)', () => {
    it('searches hospitals by name', async () => {
      renderDirectoryWithQuery();

      const searchInput = screen.getByLabelText(/search verified hospitals/i);
      fireEvent.change(searchInput, { target: { value: 'Postgraduate Institute' } });

      await waitFor(() => {
        expect(screen.getByText(/Postgraduate Institute of Medical Education/i)).toBeInTheDocument();
        expect(screen.queryByText(/All India Institute of Medical Sciences/i)).not.toBeInTheDocument();
      });
    });

    it('searches hospitals by city', async () => {
      renderDirectoryWithQuery();

      const searchInput = screen.getByLabelText(/search verified hospitals/i);
      fireEvent.change(searchInput, { target: { value: 'Chennai' } });

      await waitFor(() => {
        expect(screen.getByText(/Madras Medical College/i)).toBeInTheDocument();
        expect(screen.queryByText(/King Edward Memorial/i)).not.toBeInTheDocument();
      });
    });

    it('filters by state and dynamically populates state-scoped cities', async () => {
      renderDirectoryWithQuery();

      const stateSelect = screen.getByLabelText(/filter by state/i);
      fireEvent.change(stateSelect, { target: { value: 'Delhi' } });

      await waitFor(() => {
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
        expect(screen.getByText(/Institute of Liver and Biliary Sciences/i)).toBeInTheDocument();
        expect(screen.queryByText(/King Edward Memorial/i)).not.toBeInTheDocument();
      });

      // City select should now offer cities in Delhi
      const citySelect = screen.getByLabelText(/filter by city/i);
      expect(citySelect).toHaveTextContent(/All Cities in Delhi/i);
      expect(citySelect).toHaveTextContent(/New Delhi/i);
    });

    it('completely removes the country filter UI since India is the sole supported country', () => {
      renderDirectoryWithQuery();

      expect(screen.queryByLabelText(/filter by country/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/mobile filter by country/i)).not.toBeInTheDocument();
    });
  });

  describe('3. Combined Filters & Verified-Only', () => {
    it('combines organ, state, and verified-only filters', async () => {
      renderDirectoryWithQuery();

      // Filter by Cornea via dropdown
      const dropdownBtn = screen.getByRole('button', { name: /filter by organ program/i });
      fireEvent.click(dropdownBtn);
      const corneaOption = screen.getByRole('menuitem', { name: 'Cornea' });
      fireEvent.click(corneaOption);

      // Filter by State Karnataka
      const stateSelect = screen.getByLabelText(/filter by state/i);
      fireEvent.change(stateSelect, { target: { value: 'Karnataka' } });

      await waitFor(() => {
        // NIMHANS is in Karnataka and supports Cornea (reviewStatus: pending)
        expect(screen.getByText(/National Institute of Mental Health and Neurosciences/i)).toBeInTheDocument();
      });

      // Now toggle Verified Only
      const verifiedOnlyBtn = screen.getByRole('button', { name: /verified only/i });
      fireEvent.click(verifiedOnlyBtn);

      await waitFor(() => {
        // Since NIMHANS is pending audit, it should now be excluded
        expect(screen.queryByText(/National Institute of Mental Health and Neurosciences/i)).not.toBeInTheDocument();
        expect(screen.getByText(/no verified transplant centers found/i)).toBeInTheDocument();
      });
    });

    it('clears all active filters when Clear filters is clicked', async () => {
      renderDirectoryWithQuery('/directory?organ=heart&state=Delhi&verified_only=true');

      await waitFor(() => {
        expect(screen.getByText(/Organ: Heart/i)).toBeInTheDocument();
      });

      const clearBtn = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Organ: Heart/i)).not.toBeInTheDocument();
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
        expect(screen.getByText(/King Edward Memorial/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Mobile Layout & Filter Drawer', () => {
    it('opens and closes the mobile filter drawer without any country filter', async () => {
      renderDirectoryWithQuery();

      // Mobile filter trigger button
      const mobileFilterBtn = screen.getByRole('button', { name: /open filter drawer/i });
      fireEvent.click(mobileFilterBtn);

      // Drawer should be open
      expect(screen.getByRole('dialog', { name: /hospital filters/i })).toBeInTheDocument();
      expect(screen.getByText(/Filter Hospital Directory/i)).toBeInTheDocument();

      // Verify no country filter in drawer
      expect(screen.queryByLabelText(/mobile filter by country/i)).not.toBeInTheDocument();

      // Close button inside drawer
      const closeBtn = screen.getByLabelText(/close filters drawer/i);
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /hospital filters/i })).not.toBeInTheDocument();
      });
    });

    it('resets filters from inside the mobile filter drawer', async () => {
      renderDirectoryWithQuery('/directory?q=AIIMS');

      const mobileFilterBtn = screen.getByRole('button', { name: /open filter drawer/i });
      fireEvent.click(mobileFilterBtn);

      const resetAllBtn = screen.getByRole('button', { name: /reset all/i });
      fireEvent.click(resetAllBtn);

      const applyBtn = screen.getByRole('button', { name: /show results/i });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(screen.getByText(/Institute of Liver and Biliary Sciences/i)).toBeInTheDocument();
      });
    });
  });

  describe('5. Verified Official Contact & Details', () => {
    it('renders official nodal coordinator phone, email and copy feedback', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      renderDirectoryWithQuery();

      await waitFor(() => {
        expect(screen.getByText(/\+91-11-26588500/i)).toBeInTheDocument();
      });

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      expect(writeTextMock).toHaveBeenCalledWith('+91-11-26588500');
      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('displays official verification status with verification date and demonstration badge', async () => {
      renderDirectoryWithQuery();

      await waitFor(() => {
        expect(screen.getAllByText(/NOTTO Verified/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/\(2026-03-15\)/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Demonstration Record/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('6. Empty and Error States', () => {
    it('renders empty state when no centers match combined filters and allows reset', async () => {
      renderDirectoryWithQuery();

      const searchInput = screen.getByLabelText(/search verified hospitals/i);
      fireEvent.change(searchInput, { target: { value: 'NON_EXISTENT_CLINIC_9999' } });

      await waitFor(() => {
        expect(screen.getByText(/no verified transplant centers found/i)).toBeInTheDocument();
        expect(screen.getByText(/In accordance with statutory guidelines, we do not list centers without verified accreditation records/i)).toBeInTheDocument();
      });

      const resetBtn = screen.getByRole('button', { name: /reset filters/i });
      fireEvent.click(resetBtn);

      await waitFor(() => {
        expect(screen.getByText(/All India Institute of Medical Sciences/i)).toBeInTheDocument();
      });
    });
  });
});
