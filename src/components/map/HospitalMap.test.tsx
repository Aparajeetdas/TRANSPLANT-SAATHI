import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HospitalMap } from './HospitalMap';
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
  {
    id: 'hosp-2',
    name: 'Apollo Hospital Chennai',
    registrationNumber: 'NOTTO-TN-002',
    state: 'Tamil Nadu',
    city: 'Chennai',
    address: 'Greams Lane, Chennai, Tamil Nadu 600006',
    lat: 13.0604,
    lng: 80.2496,
    organsSupported: ['heart', 'lungs', 'liver'],
    accreditation: 'JCI & NABH Accredited',
    coordinatorName: 'Dr. K. Madhavan',
    coordinatorPhone: '+91-44-2829-0200',
    coordinatorEmail: 'transplant.coord@apollo.com',
    sourceUrl: 'https://transtan.tn.gov.in',
    sourceVerificationDate: '2026-03-20',
    isVerified: true,
    reviewStatus: 'verified',
  },
  {
    id: 'hosp-3-no-coords',
    name: 'District General Hospital Without GPS',
    registrationNumber: 'NOTTO-MH-999',
    state: 'Maharashtra',
    city: 'Pune',
    address: 'Station Road, Pune',
    lat: (undefined as unknown as number),
    lng: (undefined as unknown as number),
    organsSupported: ['cornea'],
    accreditation: 'State Verified',
    coordinatorName: 'Dr. Patil',
    coordinatorPhone: '+91-20-2612-0000',
    coordinatorEmail: 'nodal@punedgh.gov.in',
    sourceUrl: 'https://zttcmumbai.org',
    sourceVerificationDate: '2026-01-10',
    isVerified: true,
    reviewStatus: 'pending',
  },
];

describe('HospitalMap Component (Google Maps Integration)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
  });

  it('renders missing API key fallback gracefully without crashing', () => {
    render(
      <HospitalMap
        hospitals={mockHospitals}
        selectedHospital={null}
        onSelectHospital={vi.fn()}
      />
    );

    expect(screen.getByTestId('google-maps-missing-key-fallback')).toBeInTheDocument();
    expect(screen.getByText(/Google Maps API Key Required/i)).toBeInTheDocument();
    expect(screen.getByText(/VITE_GOOGLE_MAPS_API_KEY/i)).toBeInTheDocument();
  });

  it('displays verified coordinate badges and calculates valid vs unmapped centers', () => {
    render(
      <HospitalMap
        hospitals={mockHospitals}
        selectedHospital={null}
        onSelectHospital={vi.fn()}
      />
    );

    // 2 valid coordinates, 1 unmapped
    expect(screen.getByText(/2 centers mapped/i)).toBeInTheDocument();
    expect(screen.getByText(/1 pending coordinates in list view/i)).toBeInTheDocument();

    // Badges for mapped hospitals
    expect(screen.getByText(/New Delhi \(NOTTO-DL-001\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Chennai \(NOTTO-TN-002\)/i)).toBeInTheDocument();
  });

  it('triggers onSelectHospital when clicking a coordinate badge in fallback mode', () => {
    const handleSelect = vi.fn();
    render(
      <HospitalMap
        hospitals={mockHospitals}
        selectedHospital={null}
        onSelectHospital={handleSelect}
      />
    );

    const aiimsBadge = screen.getByRole('button', { name: /focus aiims new delhi coordinates/i });
    fireEvent.click(aiimsBadge);

    expect(handleSelect).toHaveBeenCalledWith(mockHospitals[0]);
  });

  it('triggers onViewList callback when "View in Accessible List" is clicked', () => {
    const handleViewList = vi.fn();
    render(
      <HospitalMap
        hospitals={mockHospitals}
        selectedHospital={null}
        onSelectHospital={vi.fn()}
        onViewList={handleViewList}
      />
    );

    const viewListButton = screen.getByRole('button', { name: /view in accessible list/i });
    fireEvent.click(viewListButton);

    expect(handleViewList).toHaveBeenCalledTimes(1);
  });

  it('renders APIProvider when apiKey is configured', () => {
    render(
      <HospitalMap
        hospitals={mockHospitals}
        selectedHospital={null}
        onSelectHospital={vi.fn()}
        apiKey="AIzaSyFakeTestKey12345"
      />
    );

    // Should not render the missing-key fallback
    expect(screen.queryByTestId('google-maps-missing-key-fallback')).not.toBeInTheDocument();
    expect(screen.getByTestId('google-maps-container')).toBeInTheDocument();
  });
});
