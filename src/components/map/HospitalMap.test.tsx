import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HospitalMap, isValidCoordinate } from './HospitalMap';
import type { VerifiedHospital } from '../../types';

const mockHospitals: VerifiedHospital[] = [
  {
    id: 'hosp-1',
    name: 'AIIMS New Delhi',
    registrationNumber: 'NOTTO-DL-001',
    state: 'Delhi',
    city: 'New Delhi',
    address: 'Ansari Nagar East, New Delhi, Delhi 110029',
    lat: 28.5672,
    lng: 77.2100,
    organsSupported: ['kidney', 'liver', 'heart'],
    accreditation: 'NABH Accredited & National Apex Apex Center',
    coordinatorName: 'Dr. Aarti Vij',
    coordinatorPhone: '+91-11-2659-3200',
    coordinatorEmail: 'coordinator.orbo@aiims.edu',
    sourceUrl: 'https://notto.mohfw.gov.in',
    sourceVerificationDate: '2026-04-15',
    isVerified: true,
    reviewStatus: 'verified',
  },
];

describe('HospitalMap Component', () => {
  it('renders nothing (returns null) — map is not displayed without a Google Maps API key', () => {
    const { container } = render(
      <HospitalMap
        hospitals={mockHospitals}
        selectedHospital={null}
        onSelectHospital={vi.fn()}
      />
    );
    // Component always returns null; no warning panel, no placeholder
    expect(screen.queryByText(/Google Maps API Key Required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Google Maps Integration Configured/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/VITE_GOOGLE_MAPS_API_KEY/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('google-maps-missing-key-fallback')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing even when an apiKey is provided (embedded map is disabled)', () => {
    const { container } = render(
      <HospitalMap
        hospitals={mockHospitals}
        selectedHospital={null}
        onSelectHospital={vi.fn()}
        apiKey="AIzaSyFakeTestKey12345"
      />
    );
    // No embedded map — hospital locations are accessed via direct Google Maps links on cards
    expect(screen.queryByText(/Google Maps API Key Required/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('google-maps-container')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});

describe('isValidCoordinate helper', () => {
  it('returns true for valid Indian coordinates', () => {
    expect(isValidCoordinate(28.5672, 77.21)).toBe(true);
    expect(isValidCoordinate(13.0604, 80.2496)).toBe(true);
  });

  it('returns false for null or undefined coordinates', () => {
    expect(isValidCoordinate(null, null)).toBe(false);
    expect(isValidCoordinate(undefined, undefined)).toBe(false);
  });

  it('returns false for the null-island (0, 0)', () => {
    expect(isValidCoordinate(0, 0)).toBe(false);
  });

  it('returns false for out-of-range coordinates', () => {
    expect(isValidCoordinate(200, 200)).toBe(false);
    expect(isValidCoordinate(-100, 50)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidCoordinate(NaN, 77)).toBe(false);
  });
});
