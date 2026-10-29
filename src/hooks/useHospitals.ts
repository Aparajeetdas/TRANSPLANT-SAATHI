import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStoredHospitals, recordAuditLog, saveStoredHospitals } from '../lib/store';
import { OrganType, UserProfile, VerifiedHospital } from '../types';

export interface HospitalFilterParams {
  searchQuery?: string;
  organ?: string;
  country?: string;
  state?: string;
  city?: string;
  verifiedOnly?: boolean;
  reviewStatus?: string;
  sortBy?: 'name' | 'date' | 'beds';
  sortOrder?: 'asc' | 'desc';
}

export const useHospitals = (params?: HospitalFilterParams) => {
  return useQuery({
    queryKey: ['hospitals', params],
    queryFn: async (): Promise<VerifiedHospital[]> => {
      // Fetch from persistent store / Supabase
      const allHospitals = getStoredHospitals();

      let result = [...allHospitals];

      if (params?.searchQuery) {
        const q = params.searchQuery.toLowerCase().trim();
        result = result.filter(
          (h) =>
            h.name.toLowerCase().includes(q) ||
            h.city.toLowerCase().includes(q) ||
            h.state.toLowerCase().includes(q) ||
            h.registrationNumber.toLowerCase().includes(q) ||
            h.coordinatorName.toLowerCase().includes(q) ||
            h.organsSupported.some((org) => org.toLowerCase().includes(q))
        );
      }

      if (params?.organ && params.organ !== 'all') {
        const organTokens = params.organ
          .toLowerCase()
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        const normalizedTokens = organTokens.map((raw) =>
          raw === 'lung' ? 'lungs' : raw === 'hsct' ? 'bone_marrow' : raw
        );
        result = result.filter((h) =>
          normalizedTokens.some((tok) => h.organsSupported.includes(tok as OrganType))
        );
      }

      if (params?.country && params.country !== 'all') {
        if (params.country.toLowerCase() !== 'india') {
          result = [];
        }
      }

      if (params?.state && params.state !== 'all') {
        result = result.filter((h) => h.state.toLowerCase() === params.state!.toLowerCase());
      }

      if (params?.city && params.city !== 'all') {
        result = result.filter((h) => h.city.toLowerCase() === params.city!.toLowerCase());
      }

      if (params?.verifiedOnly) {
        result = result.filter((h) => h.reviewStatus === 'verified' && h.isVerified);
      }

      if (params?.reviewStatus && params.reviewStatus !== 'all') {
        result = result.filter((h) => h.reviewStatus === params.reviewStatus);
      }

      const order = params?.sortOrder || (params?.sortBy === 'name' ? 'asc' : 'desc');

      if (params?.sortBy === 'name') {
        result.sort((a, b) =>
          order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
      } else if (params?.sortBy === 'date') {
        result.sort((a, b) =>
          order === 'asc'
            ? a.sourceVerificationDate.localeCompare(b.sourceVerificationDate)
            : b.sourceVerificationDate.localeCompare(a.sourceVerificationDate)
        );
      } else if (params?.sortBy === 'beds') {
        result.sort((a, b) => {
          const capA = a.bedCapacityEstimate || 0;
          const capB = b.bedCapacityEstimate || 0;
          return order === 'asc' ? capA - capB : capB - capA;
        });
      }

      return result;
    },
  });
};

export const useHospital = (id?: string) => {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: async (): Promise<VerifiedHospital | null> => {
      if (!id) return null;
      const all = getStoredHospitals();
      const match = all.find((h) => h.id === id);
      return match || null;
    },
    enabled: Boolean(id),
  });
};

export const useReverifyHospitalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hospitalId,
      actor,
    }: {
      hospitalId: string;
      actor: UserProfile;
    }) => {
      const all = getStoredHospitals();
      const today = new Date().toISOString().split('T')[0];

      const updated = all.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            sourceVerificationDate: today,
            isVerified: true,
          };
        }
        return h;
      });

      saveStoredHospitals(updated);

      const target = all.find((h) => h.id === hospitalId);
      recordAuditLog(actor, 'HOSPITAL_DIRECTORY_REVERIFIED', 'verified_hospitals', hospitalId, {
        hospitalName: target?.name,
        registrationNumber: target?.registrationNumber,
        verifiedDate: today,
      });

      return { success: true, hospitalId, verifiedDate: today };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['hospital'] });
    },
  });
};
