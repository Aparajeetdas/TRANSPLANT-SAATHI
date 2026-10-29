import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Dna,
  ExternalLink,
  Eye,
  GitMerge,
  Globe,
  Heart,
  Hospital,
  Layers,
  List,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Wind,
  X,
  XCircle,
  Zap
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { HospitalMap } from '../../components/map/HospitalMap';
import { useHospitals } from '../../hooks/useHospitals';
import { getStoredHospitals } from '../../lib/store';
import type { OrganType, VerifiedHospital } from '../../types';

// Organ filter definitions matching statutory Indian transplant registries
interface OrganDefinition {
  id: string; // 'all' or OrganType
  label: string;
  badgeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const ORGAN_OPTIONS: OrganDefinition[] = [
  {
    id: 'all',
    label: 'All Organs',
    badgeLabel: 'All Programs',
    icon: Layers,
    description: 'All statutory organ & tissue transplantation programs'
  },
  {
    id: 'kidney',
    label: 'Kidney',
    badgeLabel: 'Kidney (Renal)',
    icon: Activity,
    description: 'Renal transplantation programs licensed under THOTA'
  },
  {
    id: 'liver',
    label: 'Liver',
    badgeLabel: 'Liver (Hepatic)',
    icon: Shield,
    description: 'Living & deceased donor hepatic transplantation'
  },
  {
    id: 'heart',
    label: 'Heart',
    badgeLabel: 'Heart (Cardiac)',
    icon: Heart,
    description: 'Thoracic cardiac retrieval & transplantation'
  },
  {
    id: 'lungs',
    label: 'Lung',
    badgeLabel: 'Lungs (Pulmonary)',
    icon: Wind,
    description: 'Pulmonary single/bilateral lung transplantation'
  },
  {
    id: 'pancreas',
    label: 'Pancreas',
    badgeLabel: 'Pancreas',
    icon: Zap,
    description: 'Simultaneous pancreas-kidney & isolated pancreas'
  },
  {
    id: 'intestine',
    label: 'Intestine',
    badgeLabel: 'Intestine (Gastrointestinal)',
    icon: GitMerge,
    description: 'Composite small bowel & multivisceral transplantation'
  },
  {
    id: 'cornea',
    label: 'Cornea',
    badgeLabel: 'Cornea (Ocular)',
    icon: Eye,
    description: 'Licensed eye banking & corneal grafting units'
  },
  {
    id: 'bone_marrow',
    label: 'Bone Marrow / HSCT',
    badgeLabel: 'Bone Marrow / HSCT',
    icon: Dna,
    description: 'Hematopoietic stem cell transplantation & marrow registries'
  }
];

export const DirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, filter, and location state from URL params or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedOrgan, setSelectedOrgan] = useState(searchParams.get('organ') || 'all');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified_only') === 'true');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState(searchParams.get('status') || 'all');
  const [sortKey, setSortKey] = useState<'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'beds-desc' | 'beds-asc'>('name-asc');
  
  // Selection & UI state
  const [selectedHospital, setSelectedHospital] = useState<VerifiedHospital | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState(false);

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

  // Master hospital data for populating location dropdowns and organ counts
  const allHospitals = useMemo(() => getStoredHospitals(), []);

  // Countries: in statutory dataset all centers belong to India
  const countries = useMemo(() => ['all', 'India'], []);

  // Dynamic States from stored hospitals
  const states = useMemo(() => {
    const list = Array.from(new Set(allHospitals.map((h) => h.state))).sort();
    return ['all', ...list];
  }, [allHospitals]);

  // Dynamic Cities based on selected state
  const availableCities = useMemo(() => {
    const scoped = selectedState === 'all'
      ? allHospitals
      : allHospitals.filter((h) => h.state.toLowerCase() === selectedState.toLowerCase());
    const list = Array.from(new Set(scoped.map((h) => h.city))).sort();
    return ['all', ...list];
  }, [allHospitals, selectedState]);

  // Organ count mapping from current hospital store
  const organCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allHospitals.length };
    ORGAN_OPTIONS.forEach((opt) => {
      if (opt.id === 'all') return;
      const normalized = opt.id === 'lung' ? 'lungs' : opt.id === 'hsct' ? 'bone_marrow' : opt.id;
      counts[opt.id] = allHospitals.filter((h) =>
        h.organsSupported.includes(normalized as OrganType)
      ).length;
    });
    return counts;
  }, [allHospitals]);

  // Query hook integration
  const {
    data: filteredAndSortedHospitals = [],
    isLoading,
    isError,
    refetch
  } = useHospitals({
    searchQuery,
    organ: selectedOrgan,
    country: selectedCountry,
    state: selectedState,
    city: selectedCity,
    verifiedOnly,
    reviewStatus: selectedReviewStatus,
    sortBy,
    sortOrder
  });

  // Pagination calculation
  const totalItems = filteredAndSortedHospitals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedHospitals = filteredAndSortedHospitals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || !value || value === 'false') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleOrganSelect = (organId: string) => {
    setSelectedOrgan(organId);
    updateSearchParam('organ', organId);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    updateSearchParam('country', country);
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setSelectedCity('all');
    const newParams = new URLSearchParams(searchParams);
    if (state === 'all' || !state) {
      newParams.delete('state');
    } else {
      newParams.set('state', state);
    }
    newParams.delete('city');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    updateSearchParam('city', city);
  };

  const handleVerifiedOnlyToggle = (enabled: boolean) => {
    setVerifiedOnly(enabled);
    updateSearchParam('verified_only', enabled ? 'true' : 'false');
  };

  const handleReviewStatusSelect = (status: string) => {
    setSelectedReviewStatus(status);
    updateSearchParam('status', status);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedOrgan('all');
    setSelectedCountry('all');
    setSelectedState('all');
    setSelectedCity('all');
    setVerifiedOnly(false);
    setSelectedReviewStatus('all');
    setSortKey('name-asc');
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedOrgan !== 'all') count++;
    if (selectedCountry !== 'all') count++;
    if (selectedState !== 'all') count++;
    if (selectedCity !== 'all') count++;
    if (verifiedOnly) count++;
    if (selectedReviewStatus !== 'all') count++;
    return count;
  }, [searchQuery, selectedOrgan, selectedCountry, selectedState, selectedCity, verifiedOnly, selectedReviewStatus]);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-5 text-left py-2">
      {/* Directory Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4F8FF] border border-[#E2E8F0] text-xs font-semibold text-[#1D4ED8] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Official Government Registry Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Verified Transplant Center Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 max-w-2xl">
            Licensed Indian organ transplantation hospitals verified against NOTTO, ROTTO, and state SOTTO gazette registries.
          </p>
        </div>

        {/* Desktop View Mode Toggle */}
        <div className="hidden lg:inline-flex p-1 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
          <button
            onClick={() => setDesktopViewMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              desktopViewMode === 'both' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Split View (Map + List)</span>
          </button>
          <button
            onClick={() => setDesktopViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              desktopViewMode === 'list' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Only</span>
          </button>
          <button
            onClick={() => setDesktopViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'list' ? 'bg-[#2563EB] text-white' : 'text-[#64748B]'
          }`}
          aria-label="Show list view"
        >
          <List className="w-3.5 h-3.5" />
          <span>List View ({totalItems})</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'map' ? 'bg-[#2563EB] text-white' : 'text-[#64748B]'
          }`}
          aria-label="Show interactive map view"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Map View ({totalItems})</span>
        </button>
      </div>

      {/* Organ Filters Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Filter by Organ Program
          </label>
          {selectedOrgan !== 'all' && (
            <button
              onClick={() => handleOrganSelect('all')}
              className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Show All Organs</span>
            </button>
          )}
        </div>

        {/* Compact Organ Buttons Scroll/Bar */}
        <div
          role="toolbar"
          aria-label="Organ filters"
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth"
        >
          {ORGAN_OPTIONS.map((organ) => {
            const Icon = organ.icon;
            const isSelected = selectedOrgan === organ.id;
            const count = organCounts[organ.id] ?? 0;

            return (
              <button
                key={organ.id}
                onClick={() => handleOrganSelect(organ.id)}
                type="button"
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                    : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#F4F8FF] hover:border-[#2563EB]/40'
                }`}
                title={organ.description}
                aria-pressed={isSelected}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#2563EB]'}`} />
                <span>{organ.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F4F8FF] text-[#64748B] border border-[#E2E8F0]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Accessible hidden/synchronized select for test automation & screen readers */}
        <select
          aria-label="Filter by organ program"
          value={selectedOrgan}
          onChange={(e) => handleOrganSelect(e.target.value)}
          className="sr-only"
        >
          {ORGAN_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.badgeLabel}
            </option>
          ))}
        </select>
      </div>

      {/* Search, Location, and Filter Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E2E8F0] space-y-3">
        {/* Top Search Bar & Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Text Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search verified hospitals"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateSearchParam('q', e.target.value);
              }}
              placeholder="Search by hospital name, city, registration number, coordinator..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#2563EB] focus-visible:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  updateSearchParam('q', '');
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button (< lg) */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileFilterDrawerOpen(true)}
              aria-label="Open filter drawer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-[#F4F8FF] text-xs font-semibold text-[#0F172A] hover:border-[#2563EB] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-[#2563EB] text-white text-[10px] font-bold rounded-full px-1.5 py-0.2">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Filter Row (>= lg) */}
        <div className="hidden lg:grid grid-cols-12 gap-2.5 pt-1">
          {/* Country Selector */}
          <div className="col-span-2">
            <div className="relative">
              <select
                aria-label="Filter by country"
                value={selectedCountry}
                onChange={(e) => handleCountrySelect(e.target.value)}
                className="w-full pl-2.5 pr-6 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus-visible:outline-none cursor-pointer"
              >
                <option value="all">All Countries</option>
                {countries
                  .filter((c) => c !== 'all')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* State Selector */}
          <div className="col-span-2">
            <select
              aria-label="Filter by state"
              value={selectedState}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus-visible:outline-none cursor-pointer"
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

          {/* City Selector */}
          <div className="col-span-2">
            <select
              aria-label="Filter by city"
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus-visible:outline-none cursor-pointer"
            >
              <option value="all">
                {selectedState === 'all' ? 'All Cities' : `All Cities in ${selectedState}`}
              </option>
              {availableCities
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Verified-Only Toggle */}
          <div className="col-span-2 flex items-center">
            <button
              type="button"
              onClick={() => handleVerifiedOnlyToggle(!verifiedOnly)}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                verifiedOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A] hover:border-[#CBD5E1]'
              }`}
              aria-label="Filter verified only"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-emerald-600' : 'text-[#64748B]'}`} />
              <span>Verified Only</span>
            </button>
          </div>

          {/* Review Status Selector */}
          <div className="col-span-2">
            <select
              aria-label="Filter by review status"
              value={selectedReviewStatus}
              onChange={(e) => handleReviewStatusSelect(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus-visible:outline-none cursor-pointer"
            >
              <option value="all">All Review Statuses</option>
              <option value="verified">Verified by NOTTO/SOTTO</option>
              <option value="pending">Pending Periodic Audit</option>
              <option value="flagged">Flagged for Verification</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="col-span-2">
            <select
              aria-label="Sort hospitals by"
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value as typeof sortKey);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus-visible:outline-none cursor-pointer"
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

        {/* Filter Summary & Reset Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
          <div aria-live="polite" className="flex items-center gap-1.5 flex-wrap">
            <span>
              Showing <strong className="text-[#0F172A]">{paginatedHospitals.length}</strong> of{' '}
              <strong className="text-[#0F172A]">{totalItems}</strong> matching centers (Page {currentPage} of {totalPages})
            </span>
            {selectedOrgan !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F8FF] border border-[#E2E8F0] text-[#1D4ED8] font-medium text-[11px]">
                Organ: {ORGAN_OPTIONS.find((o) => o.id === selectedOrgan)?.label}
                <button
                  onClick={() => handleOrganSelect('all')}
                  className="hover:text-rose-600 cursor-pointer ml-0.5"
                  aria-label="Remove organ filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F8FF] border border-[#E2E8F0] text-[#1D4ED8] font-medium text-[11px]">
                State: {selectedState}
                <button
                  onClick={() => handleStateSelect('all')}
                  className="hover:text-rose-600 cursor-pointer ml-0.5"
                  aria-label="Remove state filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {selectedCity !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F8FF] border border-[#E2E8F0] text-[#1D4ED8] font-medium text-[11px]">
                City: {selectedCity}
                <button
                  onClick={() => handleCitySelect('all')}
                  className="hover:text-rose-600 cursor-pointer ml-0.5"
                  aria-label="Remove city filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-[11px]">
                Verified Only
                <button
                  onClick={() => handleVerifiedOnlyToggle(false)}
                  className="hover:text-rose-600 cursor-pointer ml-0.5"
                  aria-label="Remove verified only filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Modal (< lg) */}
      {isMobileFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Hospital Filters"
            className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
                  <h2 className="text-sm font-bold text-[#0F172A]">Filter Hospital Directory</h2>
                </div>
                <button
                  onClick={() => setIsMobileFilterDrawerOpen(false)}
                  className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF] cursor-pointer"
                  aria-label="Close filters drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Country</label>
                <select
                  aria-label="Mobile filter by country"
                  value={selectedCountry}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="all">All Countries</option>
                  {countries
                    .filter((c) => c !== 'all')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">State</label>
                <select
                  aria-label="Mobile filter by state"
                  value={selectedState}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] cursor-pointer"
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

              {/* City */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">City</label>
                <select
                  aria-label="Mobile filter by city"
                  value={selectedCity}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="all">
                    {selectedState === 'all' ? 'All Cities' : `All Cities in ${selectedState}`}
                  </option>
                  {availableCities
                    .filter((c) => c !== 'all')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              {/* Verified Only */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleVerifiedOnlyToggle(!verifiedOnly)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    verifiedOnly
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-[#0F172A] border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${verifiedOnly ? 'text-emerald-600' : 'text-[#64748B]'}`} />
                    <span>NOTTO / SOTTO Verified Only</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${verifiedOnly ? 'bg-emerald-500' : 'bg-[#E2E8F0]'}`} />
                </button>
              </div>

              {/* Review Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Registry Review Status</label>
                <select
                  aria-label="Mobile filter by review status"
                  value={selectedReviewStatus}
                  onChange={(e) => handleReviewStatusSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="all">All Review Statuses</option>
                  <option value="verified">Verified by NOTTO/SOTTO</option>
                  <option value="pending">Pending Periodic Audit</option>
                  <option value="flagged">Flagged for Verification</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Sort Results By</label>
                <select
                  aria-label="Mobile sort hospitals by"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="date-desc">Audit Date (Newest)</option>
                  <option value="date-asc">Audit Date (Oldest)</option>
                  <option value="beds-desc">Bed Capacity (High)</option>
                  <option value="beds-asc">Bed Capacity (Low)</option>
                </select>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F4F8FF] flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex-1 text-xs"
              >
                Reset All
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsMobileFilterDrawerOpen(false)}
                className="flex-1 text-xs"
              >
                Show Results ({totalItems})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-10 text-center rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#2563EB] mx-auto" />
          <p className="text-xs font-semibold text-[#0F172A]">Loading verified hospital registry records...</p>
        </div>
      )}

      {/* Error State with Retry Action */}
      {isError && (
        <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#0F172A]">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Failed to load directory records from the registry store.</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Query
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && totalItems === 0 && (
        <div className="p-10 text-center rounded-xl border border-[#E2E8F0] bg-[#F4F8FF]/30 space-y-3">
          <Hospital className="w-8 h-8 text-[#2563EB] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0F172A]">No Verified Transplant Centers Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              No registered hospital matched your search criteria. In accordance with statutory guidelines, we do not list centers without verified accreditation records.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Reset Filters
          </Button>
        </div>
      )}

      {/* Main Results View (List + Map) */}
      {!isLoading && !isError && totalItems > 0 && (
        <div className="space-y-6">
          {/* Synchronized Google Maps View */}
          {((desktopViewMode !== 'list' && (typeof window === 'undefined' || window.innerWidth >= 1024)) || mobileTab === 'map') && (
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

          {/* Hospital Cards Grid */}
          {((desktopViewMode !== 'map' && (typeof window === 'undefined' || window.innerWidth >= 1024)) || mobileTab === 'list') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedHospitals.map((hospital) => {
                const isVerified = hospital.reviewStatus === 'verified';
                const isPending = hospital.reviewStatus === 'pending';
                const isSelected = selectedHospital?.id === hospital.id;

                return (
                  <Card
                    key={hospital.id}
                    className={`p-5 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#2563EB] ring-1 ring-[#2563EB] bg-[#F4F8FF]/30'
                        : 'hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges: Registration code & Verification with date */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-[#F4F8FF] px-2 py-0.5 rounded border border-[#2563EB]/20">
                            {hospital.registrationNumber}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                              isVerified
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isVerified ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : isPending ? (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            <span>{isVerified ? 'NOTTO Verified' : isPending ? 'Pending Audit' : 'Flagged'}</span>
                            {hospital.sourceVerificationDate && (
                              <span className="font-normal opacity-80">
                                ({hospital.sourceVerificationDate})
                              </span>
                            )}
                          </span>
                        </div>
                        <Badge variant="subtle" size="sm">
                          Demonstration Record
                        </Badge>
                      </div>

                      {/* Hospital Title and Location */}
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                          {hospital.name}
                        </h3>
                        <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span>{hospital.address}</span>
                        </p>
                      </div>

                      {/* Official Nodal Contact & Coordinator Desk */}
                      <div className="p-3 rounded-lg bg-[#F4F8FF] text-xs text-[#0F172A] space-y-1.5 border border-[#E2E8F0]/60">
                        <div className="font-semibold text-[#1D4ED8] flex items-center justify-between text-[11px]">
                          <span>{hospital.accreditation}</span>
                          <span className="text-[#64748B] font-normal">~{hospital.bedCapacityEstimate || 30} Beds</span>
                        </div>
                        <div className="text-[11px] text-[#0F172A] font-medium">
                          Nodal Desk: {hospital.coordinatorName}
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748B] pt-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3 h-3 text-[#2563EB] shrink-0" />
                            <a
                              href={`tel:${hospital.coordinatorPhone}`}
                              className="truncate hover:text-[#2563EB] hover:underline"
                            >
                              {hospital.coordinatorPhone}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            {hospital.coordinatorEmail && (
                              <a
                                href={`mailto:${hospital.coordinatorEmail}`}
                                className="text-[10px] text-[#64748B] hover:text-[#2563EB] p-1 rounded hover:bg-white"
                                title={`Email ${hospital.coordinatorEmail}`}
                              >
                                <Mail className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(hospital.coordinatorPhone);
                                setCopiedPhoneId(hospital.id);
                                setTimeout(() => setCopiedPhoneId(null), 2000);
                              }}
                              className="text-[10px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-white px-2 py-0.5 rounded border border-[#E2E8F0] shrink-0 flex items-center gap-1 cursor-pointer"
                              title="Copy coordinator phone"
                            >
                              {copiedPhoneId === hospital.id ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Organ Services Offered */}
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                          Licensed Transplant Services
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hospital.organsSupported.map((org) => {
                            const isMatchingOrgan =
                              selectedOrgan !== 'all' &&
                              (selectedOrgan === org ||
                                (selectedOrgan === 'lung' && org === 'lungs') ||
                                (selectedOrgan === 'hsct' && org === 'bone_marrow'));

                            return (
                              <span
                                key={org}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                                  isMatchingOrgan
                                    ? 'bg-[#2563EB] text-white ring-1 ring-[#1D4ED8]'
                                    : 'bg-white text-[#1D4ED8] border border-[#E2E8F0]'
                                }`}
                              >
                                {org === 'bone_marrow'
                                  ? 'BMT / HSCT'
                                  : org === 'lungs'
                                  ? 'Lung'
                                  : org.charAt(0).toUpperCase() + org.slice(1)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <a
                          href={hospital.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1 font-medium"
                        >
                          <Globe className="w-3 h-3 text-[#2563EB]" />
                          <span>Official Source</span>
                          <ExternalLink className="w-3 h-3 text-[#64748B]" />
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
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Locate on Map</span>
                        </button>
                      </div>
                      <Link to={`/hospitals/${hospital.id}`}>
                        <Button variant="primary" size="sm" className="text-xs py-1.5">
                          View Hospital Dossier →
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Accessible Pagination Navigation */}
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
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
