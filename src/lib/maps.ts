import { VerifiedHospital } from '../types';

export const isValidCoordinate = (lat?: number | null, lng?: number | null): boolean => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
};

/**
 * Returns a direct Google Maps URL for a hospital using its verified address or coordinates.
 * Strictly adheres to requirement:
 * - URL format: https://www.google.com/maps/search/?api=1&query=...
 * - Prefers verified address or coordinates from the database.
 * - If neither verified address nor coordinates exist, returns null (does not invent locations).
 */
export const getHospitalGoogleMapsUrl = (
  hospital?: Partial<VerifiedHospital> | {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    lat?: number | null;
    lng?: number | null;
  } | null
): string | null => {
  if (!hospital) return null;

  // 1. Prefer verified address from the existing database
  if (hospital.address && hospital.address.trim().length > 0) {
    const parts = [hospital.name, hospital.address, hospital.city, hospital.state, 'India']
      .filter(Boolean)
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter((s) => s.length > 0);
    const query = parts.join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  // 2. Fall back to verified coordinates if address is absent
  if (isValidCoordinate(hospital.lat, hospital.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.lat},${hospital.lng}`)}`;
  }

  // 3. No verified address or coordinates: do not invent location
  return null;
};
