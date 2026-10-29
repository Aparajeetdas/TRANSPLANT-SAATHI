import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, HeartHandshake, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { getStoredRequests, recordAuditLog, saveStoredRequests } from '../../lib/store';
import { AssistanceRequest, OrganType } from '../../types';

const requestSchema = z.object({
  patientName: z.string().min(3, 'Please enter the patient or caregiver full name'),
  contactPhone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
  organCategory: z.enum(['kidney', 'liver', 'heart', 'lungs', 'cornea', 'pancreas', 'bone_marrow']),
  hospitalName: z.string().min(3, 'Please specify the registered hospital or city'),
  supportType: z.enum([
    'Paperwork (Form 1/2/3)',
    'Wayfinding & Logistics',
    'Language Help',
    'Financial Scheme Guidance'
  ]),
  notes: z.string().optional()
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHospitalName?: string;
  onRequestSubmitted?: () => void;
  onSuccess?: () => void;
}

export const RequestSupportModal: React.FC<RequestSupportModalProps> = ({
  isOpen,
  onClose,
  defaultHospitalName = '',
  onRequestSubmitted,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patientName: currentUser?.fullName || '',
      contactPhone: currentUser?.phone || '',
      organCategory: 'kidney',
      hospitalName: defaultHospitalName,
      supportType: 'Paperwork (Form 1/2/3)',
      notes: ''
    }
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate network persistence
      await new Promise((resolve) => setTimeout(resolve, 400));

      const newRequest: AssistanceRequest = {
        id: `req-${Date.now()}`,
        patientId: currentUser?.id || `anon-${Date.now()}`,
        patientName: data.patientName,
        contactPhone: data.contactPhone,
        organCategory: data.organCategory as OrganType,
        hospitalName: data.hospitalName,
        supportType: data.supportType,
        notes: data.notes,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existing = getStoredRequests();
      saveStoredRequests([newRequest, ...existing]);

      // Record audit log
      if (currentUser) {
        recordAuditLog(currentUser, 'ASSISTANCE_REQUEST_CREATED', 'assistance_requests', newRequest.id, {
          organ: data.organCategory,
          hospital: data.hospitalName,
          supportType: data.supportType
        });
      }

      setIsSuccess(true);
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
      if (onSuccess) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request a Volunteer Saathi (Peer Guide)"
      subtitle="Free non-medical navigation, paperwork organization, and emotional support"
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-[#0F172A] font-heading">
            Support Request Submitted Successfully
          </h4>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
            Your request has been routed to our verified Volunteer Saathi network. A volunteer coordinator will review your request and connect via phone shortly.
          </p>

          <div className="p-3 bg-[#F4F8FF] rounded-xl border border-[#2563EB]/20 text-xs text-[#1D4ED8] max-w-sm mx-auto text-left space-y-1">
            <span className="font-bold">Next Steps:</span>
            <ul className="list-disc list-inside text-[11px] text-[#64748B] space-y-0.5">
              <li>Keep copies of existing medical prescriptions ready.</li>
              <li>You can view status in the Volunteer Desk or your dashboard.</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Statutory Boundary Notice */}
          <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-[11px] text-[#1D4ED8] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              Volunteers provide logistical and emotional accompaniment only. Volunteers do not provide medical advice, arrange clinical donors, or influence organ allocation.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient/Caregiver Name */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Patient / Family Name *
              </label>
              <input
                type="text"
                {...register('patientName')}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              {errors.patientName && (
                <p className="text-[11px] text-[#2563EB] font-medium mt-1">
                  {errors.patientName.message}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                {...register('contactPhone')}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              {errors.contactPhone && (
                <p className="text-[11px] text-[#2563EB] font-medium mt-1">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Organ Category */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Organ / Tissue Program *
              </label>
              <select
                {...register('organCategory')}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
              >
                <option value="kidney">Kidney (Renal)</option>
                <option value="liver">Liver (Hepatic)</option>
                <option value="heart">Heart (Cardiac)</option>
                <option value="lungs">Lungs (Pulmonary)</option>
                <option value="cornea">Cornea (Ocular)</option>
                <option value="pancreas">Pancreas</option>
                <option value="bone_marrow">Bone Marrow / BMT</option>
              </select>
            </div>

            {/* Hospital Name */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Hospital or Target City *
              </label>
              <input
                type="text"
                {...register('hospitalName')}
                placeholder="e.g. AIIMS New Delhi or PGIMER"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              {errors.hospitalName && (
                <p className="text-[11px] text-[#2563EB] font-medium mt-1">
                  {errors.hospitalName.message}
                </p>
              )}
            </div>
          </div>

          {/* Support Type */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Primary Assistance Needed *
            </label>
            <select
              {...register('supportType')}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
            >
              <option value="Paperwork (Form 1/2/3)">Paperwork & THOTA Form Checklist (Form 1/2/3)</option>
              <option value="Financial Scheme Guidance">Financial Scheme Guidance (PM-JAY / RAN / CMRF)</option>
              <option value="Wayfinding & Logistics">Hospital Wayfinding & Logistics Accompaniment</option>
              <option value="Language Help">Language & Local Translation Assistance</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Provide any specific context (e.g. upcoming authorization committee date, questions about affidavits)..."
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<HeartHandshake className="w-4 h-4" />}
            >
              Submit Support Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
