import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useHospital, useHospitals } from './useHospitals';
import { useOfficialResources } from './useResources';

const createWrapper = () => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
};

describe('Phase 3: TanStack Query Hooks & Data Pipeline', () => {
  it('useHospitals fetches all verified hospitals when no filters are set', async () => {
    const { result } = renderHook(() => useHospitals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(result.current.data?.[0]).toHaveProperty('registrationNumber');
  });

  it('useHospitals filters correctly by organ program', async () => {
    const { result } = renderHook(() => useHospitals({ organ: 'liver' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.every((h) => h.organsSupported.includes('liver'))).toBe(true);
  });

  it('useHospital retrieves a single hospital by ID', async () => {
    const { result } = renderHook(() => useHospital('hosp-001'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.id).toBe('hosp-001');
    expect(result.current.data?.name).toContain('All India Institute of Medical Sciences');
  });

  it('useOfficialResources returns statutory documents and accredited regulatory portals', async () => {
    const { result } = renderHook(() => useOfficialResources(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.documents.length).toBeGreaterThan(0);
    expect(result.current.data?.schemes.length).toBeGreaterThan(0);
    expect(result.current.data?.agencies.length).toBeGreaterThan(0);
    expect(result.current.data?.agencies[0].name).toContain('NOTTO');
  });
});
