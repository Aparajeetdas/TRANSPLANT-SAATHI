import {
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/StateViews';
import { getHospitalGoogleMapsUrl } from '../../lib/maps';
import { getStoredHospitals } from '../../lib/store';
import { OrganType, VerifiedHospital } from '../../types';
import { HospitalDetailModal } from './HospitalDetailModal';

interface HospitalDirectoryProps {
  onRequestAssistance: (hospitalName?: string) => void;
}

export const HospitalDirectory: React.FC<HospitalDirectoryProps> = ({ onRequestAssistance }) => {
  const [hospitals] = useState<VerifiedHospital[]>(() => getStoredHospitals());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgan, setSelectedOrgan] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [activeHospitalModal, setActiveHospitalModal] = useState<VerifiedHospital | null>(null);

  const states = useMemo(() => {
    const list = Array.from(new Set(hospitals.map((h) => h.state)));
    return ['all', ...list];
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.coordinatorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOrgan =
        selectedOrgan === 'all' || h.organsSupported.includes(selectedOrgan as OrganType);

      const matchesState = selectedState === 'all' || h.state === selectedState;

      return matchesSearch && matchesOrgan && matchesState;
    });
  }, [hospitals, searchQuery, selectedOrgan, selectedState]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedOrgan('all');
    setSelectedState('all');
  };

  return (
    <div className="space-y-8">
      {/* Directory Title & Verification Guarantee */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Government Registered & Nodal Centers</span>
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] font-heading">
            Verified Transplant Centers & Regional Hubs
          </h2>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Each listing is verified against official NOTTO / ROTTO / SOTTO notifications and state licensing registries. All directory information includes citation sources and verification audit dates.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital name, city, registration number, coordinator..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#64748B] focus:border-[#2563EB] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Organ Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedOrgan}
              onChange={(e) => setSelectedOrgan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All Organs / Tissues</option>
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
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All States / UTs</option>
              {states
                .filter((s) => s !== 'all')
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Active filter count & clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
          <div>
            Showing <span className="font-bold text-[#0F172A]">{filteredHospitals.length}</span> of{' '}
            {hospitals.length} verified transplant centers
          </div>
          {(searchQuery || selectedOrgan !== 'all' || selectedState !== 'all') && (
            <button
              onClick={clearFilters}
              className="font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Content (Map & Cards) */}
      {filteredHospitals.length === 0 ? (
        <EmptyState
          title="No Verified Hospitals Found"
          description="We couldn't find any transplant centers matching your search criteria. Try removing some filters or searching for another city/state."
          actionText="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-6">
          {/* Hospital Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="subtle">
                        {hospital.registrationNumber}
                      </Badge>
                      <span className="text-[10px] text-[#64748B]">
                        Verified: {hospital.sourceVerificationDate}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#0F172A] font-heading leading-tight">
                        {hospital.name}
                      </h4>
                      <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2563EB]" />
                        <span>{hospital.city}, {hospital.state}</span>
                      </p>
                    </div>

                    <div className="text-[11px] font-medium text-[#0F172A] bg-[#F4F8FF] px-2.5 py-1.5 rounded-lg border border-[#2563EB]/20">
                      {hospital.accreditation}
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {hospital.organsSupported.map((org) => (
                        <span
                          key={org}
                          className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-[#1D4ED8] border border-[#E2E8F0]"
                        >
                          {org.replace('_', ' ')}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
                      <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Nodal Desk: {hospital.coordinatorPhone}</span>
                      </div>
                      <div className="text-[11px]">
                        Liaison: {hospital.coordinatorName}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                    {(() => {
                      const mapUrl = getHospitalGoogleMapsUrl(hospital);
                      if (mapUrl) {
                        return (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>View on Google Maps</span>
                          </a>
                        );
                      }
                      return (
                        <span className="text-xs text-[#94A3B8] inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#CBD5E1]" />
                          <span>Location Unmapped</span>
                        </span>
                      );
                    })()}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRequestAssistance(hospital.name)}
                      className="text-xs"
                    >
                      Request Saathi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {/* Hospital Detail Modal */}
      <HospitalDetailModal
        hospital={activeHospitalModal}
        isOpen={Boolean(activeHospitalModal)}
        onClose={() => setActiveHospitalModal(null)}
        onRequestAssistance={(hospName) => onRequestAssistance(hospName)}
      />
    </div>
  );
};
