import React from 'react';
import { VerifiedHospital } from '../../types';

// Helper to validate geographic coordinates
export const isValidCoordinate = (lat?: number | null, lng?: number | null): boolean => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
};

export interface HospitalMapProps {
  hospitals: VerifiedHospital[];
  selectedHospital?: VerifiedHospital | null;
  onSelectHospital?: (hospital: VerifiedHospital) => void;
  onViewList?: () => void;
  apiKey?: string;
  className?: string;
}

/**
 * HospitalMap — embedded Google Maps is not available without a Google Maps API key.
 * Hospital locations are accessible via direct Google Maps search links on each card.
 * This component renders nothing; it is kept as a typed placeholder for future integration.
 */
export const HospitalMap: React.FC<HospitalMapProps> = () => null;
