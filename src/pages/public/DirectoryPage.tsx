import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Hospital,
  Layers,
  List,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { HospitalMap } from '../../components/map/HospitalMap';
import { useHospitals } from '../../hooks/useHospitals';
import { getStoredHospitals } from '../../lib/store';
import type { VerifiedHospital } from '../../types';

export const DirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, filter, sort state from URL params or local defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedOrgan, setSelectedOrgan] = useState(searchParams.get('organ') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'all');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState(searchParams.get('status') || 'all');
  const [sortKey, setSortKey] = useState<'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'beds-desc' | 'beds-asc'>('name-asc');
  const [selectedHospital, setSelectedHospital] = useState<VerifiedHospital | null>(null);
  
  // View mode: on desktop 'both' | 'list' | 'map'; on mobile, tabs toggle between 'list' and 'map'
  const [desktopViewMode, setDesktopViewMode] = useState<'both' | 'list' | 'map'>('both');
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [sortBy, sortOrder] = useMemo(() => {
    switch (sortKey) {
      case 'name-asc':
        return ['name', 'asc'] as const;
      case 'name-desc':
        return ['name', 'desc'] as const;
      case 'date-asc':
        return ['date', 'asc'] as const;
      case 'date-desc':
        return ['date', 'desc'] as const;
      case 'beds-asc':
        return ['beds', 'asc'] as const;
      case 'beds-desc':
        return ['beds', 'desc'] as const;
      default:
        return ['name', 'asc'] as const;
    }
  }, [sortKey]);

  // TanStack Query integration
  const {
    data: filteredAndSortedHospitals = [],
    isLoading,
    isError,
    refetch
  } = useHospitals({
    searchQuery,
    organ: selectedOrgan,
    state: selectedState,
    reviewStatus: selectedReviewStatus,
    sortBy,
    sortOrder
  });

  const allHospitalsForStates = useMemo(() => getStoredHospitals(), []);
  const states = useMemo(() => {
    const list = Array.from(new Set(allHospitalsForStates.map((h) => h.state)));
    return ['all', ...list];
  }, [allHospitalsForStates]);

  // Pagination calculation
  const totalItems = filteredAndSortedHospitals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedHospitals = filteredAndSortedHospitals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedOrgan('all');
    setSelectedState('all');
    setSelectedReviewStatus('all');
    setSortKey('name-asc');
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedOrgan !== 'all' ||
    selectedState !== 'all' ||
    selectedReviewStatus !== 'all'
  );

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Official Government Registry Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
            Verified Transplant Center Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
            Directory of licensed Indian organ transplantation hospitals verified against NOTTO, ROTTO, and state SOTTO gazette registries. Includes source URLs, audit dates, and review statuses.
          </p>
        </div>

        {/* Desktop View Mode Toggle */}
        <div className="hidden lg:inline-flex p-1 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
          <button
            onClick={() => setDesktopViewMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              desktopViewMode === 'both' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Split View (Map + List)</span>
          </button>
          <button
            onClick={() => setDesktopViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              desktopViewMode === 'list' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Only (Accessible)</span>
          </button>
          <button
            onClick={() => setDesktopViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              desktopViewMode === 'map' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map Only</span>
          </button>
        </div>
      </div>

      {/* Mobile View Mode Tabs (< lg) */}
      <div className="lg:hidden flex rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] p-1">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'list' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B]'
          }`}
          aria-label="Show list view"
        >
          <List className="w-4 h-4" />
          <span>List View ({totalItems})</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'map' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B]'
          }`}
          aria-label="Show interactive map view"
        >
          <MapPin className="w-4 h-4" />
          <span>Map View ({totalItems})</span>
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search verified hospitals"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange('q', e.target.value);
              }}
              placeholder="Search by hospital name, city, registration number, coordinator..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] placeholder-[#64748B] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleFilterChange('q', '');
                }}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Organ Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by organ program"
              value={selectedOrgan}
              onChange={(e) => {
                setSelectedOrgan(e.target.value);
                handleFilterChange('organ', e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
            >
              <option value="all">All Organ Programs</option>
              <option value="kidney">Kidney (Renal)</option>
              <option value="liver">Liver (Hepatic)</option>
              <option value="heart">Heart (Cardiac)</option>
              <option value="lungs">Lungs (Pulmonary)</option>
              <option value="cornea">Cornea (Ocular)</option>
              <option value="bone_marrow">Bone Marrow / BMT</option>
              <option value="pancreas">Pancreas</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                handleFilterChange('state', e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
            >
              <option value="all">All States</option>
              {states
                .filter((s) => s !== 'all')
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          {/* Review Status Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by review status"
              value={selectedReviewStatus}
              onChange={(e) => {
                setSelectedReviewStatus(e.target.value);
                handleFilterChange('status', e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
            >
              <option value="all">All Review Statuses</option>
              <option value="verified">Verified by NOTTO/SOTTO</option>
              <option value="pending">Pending Periodic Audit</option>
              <option value="flagged">Flagged for Verification</option>
            </select>
          </div>

          {/* Sort By & Order */}
          <div className="md:col-span-2">
            <select
              aria-label="Sort hospitals by"
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value as typeof sortKey);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
            >
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="date-desc">Sort: Audit Date (Newest)</option>
              <option value="date-asc">Sort: Audit Date (Oldest)</option>
              <option value="beds-desc">Sort: Bed Capacity (High)</option>
              <option value="beds-asc">Sort: Bed Capacity (Low)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & ARIA Live announcement */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
          <div aria-live="polite">
            Showing <span className="font-bold text-[#0F172A]">{paginatedHospitals.length}</span> of{' '}
            <span className="font-bold text-[#0F172A]">{totalItems}</span> matching centers (Page {currentPage} of {totalPages})
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/20 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
          <p className="text-xs font-semibold text-[#0F172A]">Loading verified hospital registry records...</p>
        </div>
      )}

      {isError && (
        <div className="p-6 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/40 flex items-center justify-between">
          <p className="text-xs text-[#0F172A]">Failed to load directory records from the local store.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Query
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {!isLoading && !isError && totalItems === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F4F8FF]/30 space-y-3">
          <Hospital className="w-10 h-10 text-[#2563EB] mx-auto" />
          <h3 className="text-base font-bold text-[#0F172A]">No Verified Transplant Centers Found</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            No registered hospital matched your search and filter criteria. Try clearing filters or checking other organ programs.
          </p>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Reset Filters
          </Button>
        </div>
      )}

      {!isLoading && !isError && totalItems > 0 && (
        <div className="space-y-6">
          {/* Map View: visible on desktop when not in list-only, or on mobile when mobileTab is 'map' */}
          {((desktopViewMode !== 'list' && window.innerWidth >= 1024) || mobileTab === 'map') && (
            <div className={desktopViewMode === 'both' ? 'hidden lg:block' : 'block'}>
              <HospitalMap
                hospitals={filteredAndSortedHospitals}
                selectedHospital={selectedHospital}
                onSelectHospital={(h) => setSelectedHospital(h)}
                onViewList={() => {
                  setDesktopViewMode('list');
                  setMobileTab('list');
                }}
              />
            </div>
          )}

          {/* Cards Grid: visible on desktop when not in map-only, or on mobile when mobileTab is 'list' */}
          {((desktopViewMode !== 'map' && window.innerWidth >= 1024) || mobileTab === 'list') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedHospitals.map((hospital) => {
                const isVerified = hospital.reviewStatus === 'verified';
                const isPending = hospital.reviewStatus === 'pending';
                const isSelected = selectedHospital?.id === hospital.id;

                return (
                  <Card
                    key={hospital.id}
                    className={`transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/30 bg-[#F4F8FF]/30 shadow-md'
                        : 'hover:border-[#2563EB]/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="primary" size="sm">
                            {hospital.registrationNumber}
                          </Badge>
                          <Badge
                            variant={isVerified ? 'primary' : isPending ? 'subtle' : 'outline'}
                            size="sm"
                          >
                            {isVerified ? 'Verified by NOTTO/SOTTO' : isPending ? 'Pending Audit' : 'Flagged'}
                          </Badge>
                          <Badge variant="subtle" size="sm">
                            Demonstration Record
                          </Badge>
                        </div>
                        <span className="text-[11px] text-[#64748B] shrink-0">
                          Audit: {hospital.sourceVerificationDate}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#0F172A] font-heading leading-tight">
                          {hospital.name}
                        </h3>
                        <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span>{hospital.address}</span>
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/15 text-xs text-[#0F172A] space-y-1">
                        <div className="font-semibold text-[#1D4ED8]">{hospital.accreditation}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                          <Phone className="w-3 h-3 text-[#2563EB]" />
                          <span>Nodal Desk: {hospital.coordinatorPhone} ({hospital.coordinatorName})</span>
                        </div>
                      </div>

                      {/* Organ Services Supported */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-[#64748B]">
                          Statutory Licensed Programs ({hospital.organsSupported.length}):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {hospital.organsSupported.map((org) => {
                            const sourceCitation = hospital.sources?.find((s) => s.organType === org);
                            return (
                              <span
                                key={org}
                                title={sourceCitation ? `${sourceCitation.sourceAuthority} (${sourceCitation.citationReference})` : 'Licensed under THOTA'}
                                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-[#1D4ED8] border border-[#E2E8F0] flex items-center gap-1"
                              >
                                <span>{org.replace('_', ' ')}</span>
                                {sourceCitation?.reviewStatus === 'verified' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" title="Verified program citation" />
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <a
                          href={hospital.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1"
                        >
                          <span>Official Source</span>
                          <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHospital(hospital);
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                              setMobileTab('map');
                            } else if (desktopViewMode === 'list') {
                              setDesktopViewMode('both');
                            }
                          }}
                          className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
                          title="Center and view marker on map"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Locate on Map</span>
                        </button>
                      </div>
                      <Link to={`/hospitals/${hospital.id}`}>
                        <Button variant="primary" size="sm">
                          View Hospital Dossier →
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination Navigation"
              className="flex items-center justify-between border-t border-[#E2E8F0] pt-4"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
                aria-label="Go to previous page"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-[#64748B] hover:bg-[#F4F8FF] hover:text-[#0F172A]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                aria-label="Go to next page"
              >
                Next
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
};
