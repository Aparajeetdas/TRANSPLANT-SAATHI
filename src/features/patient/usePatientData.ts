import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAppointmentNote as deleteStoredNote,
  getStoredAppointmentNotes,
  getStoredExpensePlan,
  getStoredPatientChecklist,
  getStoredRequests,
  recordAuditLog,
  saveAppointmentNote as saveStoredNote,
  saveStoredExpensePlan,
  saveStoredRequests,
  toggleChecklistItem as toggleStoredChecklist
} from '../../lib/store';
import { supabase } from '../../lib/supabase';
import {
  AppointmentNote,
  AssistanceRequest,
  ConsentRecord,
  ExpenseItem,
  ExpensePlan,
  PatientChecklistItem,
  RequestStatus
} from '../../types';

// ==============================================================================
// 1. ADMINISTRATIVE CHECKLIST HOOK (PostgreSQL: user_checklist_items / RLS)
// ==============================================================================
export const usePatientChecklist = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo-patient';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['patient-checklist', userId],
    initialData: () => getStoredPatientChecklist(userId),
    queryFn: async (): Promise<PatientChecklistItem[]> => {
      // 1. Attempt PostgreSQL Supabase fetch (RLS: auth.uid() = user_id)
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('user_checklist_items')
            .select('*')
            .eq('user_id', currentUser.id);

          if (!error && data && data.length > 0) {
            return data.map((d) => ({
              id: d.id,
              userId: d.user_id,
              title: d.custom_title || 'Administrative Verification',
              stage: 'legal_clearance',
              statutoryReference: 'THOTA 1994',
              isMandatory: true,
              isCompleted: d.is_completed,
              notes: d.notes,
              completedAt: d.completed_at
            }));
          }
        } catch {
          // Fall back gracefully to resilient local store
        }
      }

      // 2. Fallback to resilient local storage
      return getStoredPatientChecklist(userId);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // Attempt PostgreSQL update
      if (currentUser?.id) {
        try {
          const currentItem = query.data?.find((i) => i.id === itemId);
          const nextCompleted = !currentItem?.isCompleted;
          await supabase
            .from('user_checklist_items')
            .update({
              is_completed: nextCompleted,
              completed_at: nextCompleted ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .eq('user_id', currentUser.id); // RLS ownership enforcement
        } catch {
          // Graceful fallback
        }
      }

      // Update local storage
      return toggleStoredChecklist(itemId, userId);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['patient-checklist', userId], updated);
    }
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleItem: toggleMutation.mutate,
    isToggling: toggleMutation.isPending
  };
};

// ==============================================================================
// 2. APPOINTMENT NOTES HOOK (PostgreSQL: appointment_notes / RLS)
// ==============================================================================
export const useAppointmentNotes = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo-patient';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['appointment-notes', userId],
    initialData: () => getStoredAppointmentNotes(userId),
    queryFn: async (): Promise<AppointmentNote[]> => {
      // 1. Attempt PostgreSQL fetch
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('appointment_notes')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map((d) => ({
              id: d.id,
              userId: d.user_id,
              doctorOrDepartment: d.doctor_or_department || d.doctorOrDepartment,
              hospitalName: d.hospital_name || d.hospitalName,
              appointmentDate: d.appointment_date || d.appointmentDate,
              keyDiscussionPoints: d.key_discussion_points || d.keyDiscussionPoints,
              prescribedTestsOrNextSteps: d.prescribed_tests || d.prescribedTestsOrNextSteps || '',
              questionsForNextVisit: d.questions_for_next_visit || d.questionsForNextVisit || '',
              createdAt: d.created_at || d.createdAt
            }));
          }
        } catch {
          // Resilient fallback
        }
      }

      // 2. Local fallback
      return getStoredAppointmentNotes(userId);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (newNote: AppointmentNote) => {
      if (currentUser?.id) {
        try {
          await supabase.from('appointment_notes').insert({
            id: newNote.id,
            user_id: currentUser.id, // Enforce authenticated ownership
            doctor_or_department: newNote.doctorOrDepartment,
            hospital_name: newNote.hospitalName,
            appointment_date: newNote.appointmentDate,
            key_discussion_points: newNote.keyDiscussionPoints,
            prescribed_tests: newNote.prescribedTestsOrNextSteps,
            questions_for_next_visit: newNote.questionsForNextVisit,
            created_at: newNote.createdAt
          });
        } catch {
          // Graceful fallback
        }
      }

      return saveStoredNote(newNote);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['appointment-notes', userId], updated);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (currentUser?.id) {
        try {
          await supabase
            .from('appointment_notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', currentUser.id); // RLS ownership enforcement
        } catch {
          // Graceful fallback
        }
      }

      return deleteStoredNote(noteId, userId);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['appointment-notes', userId], updated);
    }
  });

  return {
    notes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    saveNote: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    deleteNote: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
};

// ==============================================================================
// 3. SUPPORT REQUESTS HOOK (PostgreSQL: assistance_requests / RLS)
// ==============================================================================
export const usePatientSupportRequests = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo-patient';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['patient-requests', userId],
    initialData: () => {
      const all = getStoredRequests();
      return all.filter((r) => r.patientId === userId || r.patientId === 'demo-patient');
    },
    queryFn: async (): Promise<AssistanceRequest[]> => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('assistance_requests')
            .select('*')
            .eq('patient_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map((d) => ({
              id: d.id,
              patientId: d.patient_id,
              patientName: d.patient_name,
              contactPhone: d.contact_phone,
              organCategory: d.organ_category,
              hospitalName: d.hospital_name,
              supportType: d.support_type,
              notes: d.notes,
              status: d.status,
              assignedVolunteerId: d.assigned_volunteer_id,
              assignedVolunteerName: d.assigned_volunteer_name,
              createdAt: d.created_at,
              updatedAt: d.updated_at
            }));
          }
        } catch {
          // Resilient fallback
        }
      }

      const all = getStoredRequests();
      return all.filter((r) => r.patientId === userId || r.patientId === 'demo-patient');
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (req: AssistanceRequest) => {
      if (currentUser?.id) {
        try {
          await supabase.from('assistance_requests').insert({
            id: req.id,
            patient_id: currentUser.id,
            patient_name: req.patientName,
            contact_phone: req.contactPhone,
            organ_category: req.organCategory,
            hospital_name: req.hospitalName,
            support_type: req.supportType,
            notes: req.notes,
            status: req.status
          });
        } catch {
          // Graceful fallback
        }
      }

      const all = getStoredRequests();
      const updated = [req, ...all];
      saveStoredRequests(updated);
      return updated.filter((r) => r.patientId === userId || r.patientId === 'demo-patient');
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['patient-requests', userId], updated);
    }
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      if (currentUser?.id) {
        try {
          await supabase
            .from('assistance_requests')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .eq('patient_id', currentUser.id); // RLS enforcement
        } catch {
          // Graceful fallback
        }
      }

      const all = getStoredRequests();
      const updated = all.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'cancelled' as RequestStatus,
              updatedAt: new Date().toISOString()
            }
          : r
      );
      saveStoredRequests(updated);

      if (currentUser) {
        recordAuditLog(
          currentUser,
          'REQUEST_CANCELLED_BY_PATIENT',
          'assistance_requests',
          requestId,
          { cancellationReason: reason || 'Patient requested withdrawal' }
        );
      }

      return updated.filter((r) => r.patientId === userId || r.patientId === 'demo-patient');
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['patient-requests', userId], updated);
    }
  });

  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      newStatus,
      notes
    }: {
      requestId: string;
      newStatus: RequestStatus;
      notes?: string;
    }) => {
      if (currentUser?.id) {
        try {
          await supabase
            .from('assistance_requests')
            .update({
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId);
        } catch {
          // Fallback
        }
      }

      const all = getStoredRequests();
      const updated = all.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: newStatus,
              notes: notes ? `${r.notes || ''}\n[Status Change]: ${notes}` : r.notes,
              updatedAt: new Date().toISOString()
            }
          : r
      );
      saveStoredRequests(updated);

      if (currentUser) {
        recordAuditLog(
          currentUser,
          'REQUEST_STATUS_UPDATED',
          'assistance_requests',
          requestId,
          { newStatus, notes }
        );
      }

      return updated.filter((r) => r.patientId === userId || r.patientId === 'demo-patient');
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['patient-requests', userId], updated);
    }
  });

  return {
    requests: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createRequest: createRequestMutation.mutate,
    isCreating: createRequestMutation.isPending,
    cancelRequest: cancelRequestMutation.mutate,
    isCancelling: cancelRequestMutation.isPending,
    updateRequestStatus: updateRequestStatusMutation.mutate,
    isUpdatingStatus: updateRequestStatusMutation.isPending
  };
};

// ==============================================================================
// 4. EXPENSE PLANNER HOOK (PostgreSQL: expense_plans, expense_items / RLS)
// ==============================================================================
export const usePatientExpensePlan = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo-patient';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['patient-expense-plan', userId],
    initialData: () => getStoredExpensePlan(userId),
    queryFn: async (): Promise<ExpensePlan> => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('expense_plans')
            .select('*, items:expense_items(*)')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (!error && data) {
            return {
              id: data.id,
              userId: data.user_id,
              organCategory: data.organ_type,
              targetHospital: data.hospital_name || 'All India Institute of Medical Sciences (AIIMS)',
              targetBudget: Number(data.target_budget) || 450000,
              hasGovernmentScheme: data.has_government_scheme,
              schemeName: data.scheme_name,
              sanctionedAmount: Number(data.sanctioned_amount) || 0,
              items: (data.items || []).map((i: {
                id: string;
                plan_id: string;
                category: ExpenseItem['category'];
                item_description: string;
                estimated_amount: number;
                actual_amount?: number;
                is_paid?: boolean;
                receipt_reference?: string;
              }) => ({
                id: i.id,
                planId: i.plan_id,
                category: i.category,
                categoryLabel: i.category,
                description: i.item_description,
                estimatedAmount: Number(i.estimated_amount) || 0,
                actualAmount: Number(i.actual_amount) || 0,
                isPaid: Boolean(i.is_paid),
                receiptReference: i.receipt_reference
              })),
              updatedAt: data.updated_at || new Date().toISOString()
            };
          }
        } catch {
          // Fallback
        }
      }

      return getStoredExpensePlan(userId);
    }
  });

  const savePlanMutation = useMutation({
    mutationFn: async (updatedPlan: ExpensePlan) => {
      if (currentUser?.id) {
        try {
          await supabase
            .from('expense_plans')
            .upsert({
              id: updatedPlan.id,
              user_id: currentUser.id,
              organ_type: updatedPlan.organCategory,
              hospital_name: updatedPlan.targetHospital,
              target_budget: updatedPlan.targetBudget,
              has_government_scheme: updatedPlan.hasGovernmentScheme,
              scheme_name: updatedPlan.schemeName,
              sanctioned_amount: updatedPlan.sanctionedAmount,
              updated_at: new Date().toISOString()
            });
        } catch {
          // Graceful fallback
        }
      }

      saveStoredExpensePlan(updatedPlan);
      return updatedPlan;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['patient-expense-plan', userId], updated);
    }
  });

  return {
    plan: query.data || getStoredExpensePlan(userId),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    savePlan: savePlanMutation.mutate,
    isSaving: savePlanMutation.isPending
  };
};

// ==============================================================================
// 5. PRIVACY & CONSENT RECORDS HOOK (PostgreSQL: consent_records / DPDP Act)
// ==============================================================================
const DEFAULT_CONSENTS: ConsentRecord[] = [
  {
    id: 'c-1',
    userId: 'demo-patient',
    consentType: 'thota_section19_warning',
    purpose: 'Section 19 THOTA Anti-Trafficking acknowledgement and strict anti-commercialization warning',
    hasConsented: true,
    version: '2026.1',
    consentedAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'c-2',
    userId: 'demo-patient',
    consentType: 'non_clinical_boundary',
    purpose: 'Non-clinical boundary acknowledgment: Transplant Saathi provides administrative guidance and is not a medical provider',
    hasConsented: true,
    version: '2026.1',
    consentedAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'c-3',
    userId: 'demo-patient',
    consentType: 'volunteer_wayfinding',
    purpose: 'Permission to share contact details with verified volunteer navigators for wayfinding assistance',
    hasConsented: true,
    version: '2026.1',
    consentedAt: '2026-03-22T14:00:00Z'
  },
  {
    id: 'c-4',
    userId: 'demo-patient',
    consentType: 'dpdp_privacy',
    purpose: 'Digital Personal Data Protection Act 2023 administrative processing consent',
    hasConsented: true,
    version: '2026.1',
    consentedAt: '2026-03-20T10:00:00Z'
  }
];

export const usePatientConsents = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo-patient';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['patient-consents', userId],
    initialData: () => {
      const stored = localStorage.getItem(`transplant_saathi_consents_${userId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall through
        }
      }
      return DEFAULT_CONSENTS;
    },
    queryFn: async (): Promise<ConsentRecord[]> => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('consent_records')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('consented_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map((d) => ({
              id: d.id,
              userId: d.user_id,
              consentType: d.consent_type,
              purpose: d.purpose,
              hasConsented: d.has_consented,
              ipHash: d.ip_hash,
              version: d.version,
              consentedAt: d.consented_at,
              revokedAt: d.revoked_at
            }));
          }
        } catch {
          // Fallback
        }
      }

      const stored = localStorage.getItem(`transplant_saathi_consents_${userId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall through
        }
      }
      return DEFAULT_CONSENTS;
    }
  });

  const toggleConsentMutation = useMutation({
    mutationFn: async (consentType: string) => {
      const currentList = query.data || DEFAULT_CONSENTS;
      const target = currentList.find((c: ConsentRecord) => c.consentType === consentType);
      const nextConsented = target ? !target.hasConsented : true;

      if (currentUser?.id) {
        try {
          await supabase.from('consent_records').upsert({
            user_id: currentUser.id,
            consent_type: consentType,
            purpose: target?.purpose || 'Statutory Consent',
            has_consented: nextConsented,
            version: '2026.1',
            consented_at: nextConsented ? new Date().toISOString() : target?.consentedAt,
            revoked_at: !nextConsented ? new Date().toISOString() : null
          });
        } catch {
          // Graceful fallback
        }
      }

      const updated = currentList.map((c: ConsentRecord) =>
        c.consentType === consentType
          ? {
              ...c,
              hasConsented: nextConsented,
              revokedAt: !nextConsented ? new Date().toISOString() : undefined
            }
          : c
      );

      localStorage.setItem(`transplant_saathi_consents_${userId}`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['patient-consents', userId], updated);
    }
  });

  return {
    consents: query.data || DEFAULT_CONSENTS,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleConsent: toggleConsentMutation.mutate,
    isToggling: toggleConsentMutation.isPending
  };
};
