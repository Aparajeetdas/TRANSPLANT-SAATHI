import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  useMap
} from '@vis.gl/react-google-maps';
import {
  AlertCircle,
  ExternalLink,
  Info,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { VerifiedHospital } from '../../types';

// Helper to validate geographic coordinates for map placement
const isValidCoordinate = (lat?: number | null, lng?: number | null): boolean => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
};

// SVG pin data URIs styled with Transplant Saathi's brand palette
const BLUE_PIN_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0C7.16344 0 0 7.16344 0 16C0 27.5 16 40 16 40C16 40 32 27.5 32 16C32 7.16344 24.8366 0 16 0Z" fill="#2563EB"/>
  <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
</svg>
`)}`;

const ACTIVE_PIN_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 0C8.05887 0 0 8.05887 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#0F172A"/>
  <path d="M18 2C9.16344 2 2 9.16344 2 18C2 29.5 18 43 18 43C18 43 34 29.5 34 18C34 9.16344 26.8366 2 18 2Z" fill="#1D4ED8"/>
  <circle cx="18" cy="18" r="7" fill="#FFFFFF"/>
  <circle cx="18" cy="18" r="3" fill="#2563EB"/>
</svg>
`)}`;

const getMarkerIcon = (isActive: boolean) => {
  if (typeof google === 'undefined' || !google.maps) {
    return isActive ? ACTIVE_PIN_SVG : BLUE_PIN_SVG;
  }
  return {
    url: isActive ? ACTIVE_PIN_SVG : BLUE_PIN_SVG,
    scaledSize: isActive ? new google.maps.Size(36, 46) : new google.maps.Size(32, 40),
    anchor: isActive ? new google.maps.Point(18, 46) : new google.maps.Point(16, 40)
  };
};

// Sub-component that automatically handles viewport fitting and pans
const MapBoundsUpdater: React.FC<{
  hospitals: VerifiedHospital[];
  selectedHospital: VerifiedHospital | null;
}> = ({ hospitals, selectedHospital }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (typeof google === 'undefined' || !google.maps) return;

    if (selectedHospital && isValidCoordinate(selectedHospital.lat, selectedHospital.lng)) {
      map.panTo({ lat: selectedHospital.lat, lng: selectedHospital.lng });
      map.setZoom(12);
      return;
    }

    const valid = hospitals.filter((h) => isValidCoordinate(h.lat, h.lng));
    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.panTo({ lat: valid[0].lat, lng: valid[0].lng });
      map.setZoom(11);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    valid.forEach((h) => {
      bounds.extend({ lat: h.lat, lng: h.lng });
    });
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [map, hospitals, selectedHospital]);

  return null;
};

export interface HospitalMapProps {
  hospitals: VerifiedHospital[];
  selectedHospital?: VerifiedHospital | null;
  onSelectHospital?: (hospital: VerifiedHospital) => void;
  onViewList?: () => void;
  apiKey?: string;
  className?: string;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  hospitals,
  selectedHospital = null,
  onSelectHospital,
  onViewList,
  apiKey,
  className = ''
}) => {
  const rawKey =
    apiKey ??
    (typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined)
      : undefined);
  const activeApiKey = (typeof rawKey === 'string' ? rawKey : '').trim();

  // Internal marker selection state to support both controlled and uncontrolled usage
  const [internalSelected, setInternalSelected] = useState<VerifiedHospital | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Active hospital for InfoWindow & Bottom Card
  const activeHospital = selectedHospital || internalSelected;

  // Filter hospitals with verified geographic coordinates
  const validHospitals = useMemo(
    () => hospitals.filter((h) => isValidCoordinate(h.lat, h.lng)),
    [hospitals]
  );
  const unmappedCount = hospitals.length - validHospitals.length;

  const handleMarkerClick = (hospital: VerifiedHospital) => {
    setInternalSelected(hospital);
    onSelectHospital?.(hospital);
  };

  const handleCloseInfoWindow = () => {
    setInternalSelected(null);
  };

  // State 1: Missing Google Maps API Key Fallback
  if (!activeApiKey) {
    return (
      <div
        className={`relative w-full h-[450px] lg:h-[520px] rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F4F8FF] p-6 sm:p-8 flex flex-col justify-between shadow-xs ${className}`}
        data-testid="google-maps-missing-key-fallback"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8]">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Google Maps Integration Configured</span>
            </div>
            <div className="text-[11px] font-bold text-[#64748B]">
              {validHospitals.length} GPS Coordinates Verified
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-heading">
            Google Maps API Key Required
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl leading-relaxed">
            Transplant Saathi utilizes the official Google Maps JavaScript API with{' '}
            <code className="text-[#2563EB] bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">
              @vis.gl/react-google-maps
            </code>
            . To activate live satellite, terrain, and street mapping, set your{' '}
            <code className="text-[#2563EB] bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">
              VITE_GOOGLE_MAPS_API_KEY
            </code>{' '}
            in <code className="text-[#2563EB] bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
          </p>
        </div>

        {/* Center: Setup guide & coordinate previews */}
        <div className="my-4 p-4 rounded-xl bg-white border border-[#2563EB]/20 shadow-2xs space-y-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#0F172A]">API Configuration Step:</span>
              <p className="text-[#64748B]">
                Create a project in the Google Cloud Console, enable the <strong>Maps JavaScript API</strong>, and add your restricted key to <code className="bg-[#F4F8FF] px-1 py-0.5 rounded text-[#1D4ED8] font-mono">.env.local</code>.
              </p>
            </div>
          </div>

          {/* Quick coordinate badges of verified hospitals */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center justify-between">
              <span>Verified Facility Locations ({validHospitals.length} centers mapped):</span>
              {unmappedCount > 0 && (
                <span className="text-amber-600 font-semibold lowercase">
                  ({unmappedCount} pending coordinates in list view)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {validHospitals.map((h) => (
                <button
                  key={h.id}
                  onClick={() => onSelectHospital?.(h)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4F8FF] hover:bg-[#2563EB]/10 border border-[#2563EB]/25 text-[11px] text-[#0F172A] transition-colors text-left cursor-pointer"
                  title={`View details for ${h.name}`}
                  aria-label={`Focus ${h.name} coordinates`}
                >
                  <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
                  <span className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                    {h.city} ({h.registrationNumber})
                  </span>
                  <span className="text-[#64748B] text-[10px]">
                    [{h.lat.toFixed(2)}, {h.lng.toFixed(2)}]
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-[#64748B]">
            All hospital records, phone numbers, and licensing citations remain accessible below.
          </span>
          {onViewList && (
            <button
              onClick={onViewList}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>View in Accessible List</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // State 2: Google Maps API Error State
  if (apiError) {
    return (
      <div
        className={`relative w-full h-[450px] lg:h-[520px] rounded-2xl overflow-hidden border border-red-200 bg-red-50/40 p-6 sm:p-8 flex flex-col justify-between shadow-xs ${className}`}
        data-testid="google-maps-api-error"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Google Maps API Notice</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-heading">
            Unable to Load Google Maps
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl leading-relaxed">
            The Google Maps JavaScript API encountered an error: <span className="font-mono text-red-600">{apiError}</span>. Please verify that the Maps JavaScript API is enabled for your Google Cloud project and that HTTP referrer restrictions include this domain.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-red-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#0F172A]">Directory Still Accessible:</span>
          <p className="text-xs text-[#64748B]">
            All {hospitals.length} verified transplant centers can be inspected via the accessible list and grid views below.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setApiError(null)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F4F8FF] text-xs font-bold text-[#0F172A] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Retry Map</span>
          </button>
          {onViewList && (
            <button
              onClick={onViewList}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Switch to List View
            </button>
          )}
        </div>
      </div>
    );
  }

  // State 3: Live Interactive Google Map
  return (
    <div
      className={`relative w-full h-[450px] lg:h-[520px] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-xs bg-[#F4F8FF] ${className}`}
      data-testid="google-maps-container"
    >
      <APIProvider
        apiKey={activeApiKey}
        onError={(err) => {
          const message = err instanceof Error ? err.message : 'Authentication or network error';
          setApiError(message);
        }}
      >
        <Map
          id="transplant-saathi-google-map"
          defaultCenter={{ lat: 22.5937, lng: 78.9629 }}
          defaultZoom={5}
          gestureHandling="cooperative"
          zoomControl={true}
          fullscreenControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          className="w-full h-full z-10"
        >
          {/* Automatic Viewport Bounds Fitting */}
          <MapBoundsUpdater
            hospitals={validHospitals}
            selectedHospital={activeHospital}
          />

          {/* Hospital Markers for valid coordinates */}
          {validHospitals.map((hospital) => {
            const isSelected = activeHospital?.id === hospital.id;
            return (
              <Marker
                key={hospital.id}
                position={{ lat: hospital.lat, lng: hospital.lng }}
                title={hospital.name}
                icon={getMarkerIcon(isSelected)}
                onClick={() => handleMarkerClick(hospital)}
              />
            );
          })}

          {/* Marker InfoWindow */}
          {activeHospital && isValidCoordinate(activeHospital.lat, activeHospital.lng) && (
            <InfoWindow
              position={{ lat: activeHospital.lat, lng: activeHospital.lng }}
              onCloseClick={handleCloseInfoWindow}
              headerContent={
                <div className="flex items-center gap-1.5 text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{activeHospital.registrationNumber}</span>
                </div>
              }
            >
              <div className="p-1 min-w-[240px] max-w-[280px] text-left">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      activeHospital.reviewStatus === 'verified'
                        ? 'bg-[#F4F8FF] text-[#1D4ED8] border border-[#2563EB]/30'
                        : 'bg-[#F4F8FF] text-[#0F172A] border border-[#E2E8F0]'
                    }`}
                  >
                    {activeHospital.reviewStatus === 'verified' ? 'Verified by NOTTO/SOTTO' : 'Pending Audit'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#0F172A] leading-tight mb-1">
                  {activeHospital.name}
                </h4>

                <p className="text-xs text-[#64748B] mb-2 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2563EB] mt-0.5" />
                  <span>{activeHospital.city}, {activeHospital.state}</span>
                </p>

                <div className="border-t border-[#E2E8F0] pt-2 mt-2 space-y-1">
                  <div className="text-[11px] text-[#0F172A] font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#2563EB]" />
                    <span>{activeHospital.coordinatorPhone}</span>
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Coordinator: {activeHospital.coordinatorName}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B]">
                    Audit: {activeHospital.sourceVerificationDate}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeHospital.sourceUrl && (
                      <a
                        href={activeHospital.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-0.5"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <Link
                      to={`/hospitals/${activeHospital.id}`}
                      className="text-[11px] text-[#2563EB] font-bold hover:underline"
                    >
                      Dossier →
                    </Link>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating map controls indicator */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-[#E2E8F0] shadow-md flex items-center gap-2 text-xs font-medium text-[#0F172A]">
        <Info className="w-4 h-4 text-[#2563EB]" />
        <span>
          Google Maps — Showing {validHospitals.length} Government & Apex Centers
          {unmappedCount > 0 && ` (${unmappedCount} in list view without GPS)`}
        </span>
      </div>

      {/* Selected facility drawer at bottom of map */}
      {activeHospital && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-20 bg-white p-4 rounded-xl border border-[#2563EB]/40 shadow-xl animate-in slide-in-from-bottom-2 text-left">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge variant="subtle" className="mb-1">
                Selected Facility
              </Badge>
              <h5 className="text-sm font-bold text-[#0F172A] leading-snug">
                {activeHospital.name}
              </h5>
              <p className="text-xs text-[#64748B] mt-0.5">
                {activeHospital.address}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {activeHospital.organsSupported.map((org) => (
              <span
                key={org}
                className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-[#F4F8FF] text-[#1D4ED8] rounded border border-[#2563EB]/20"
              >
                {org}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
