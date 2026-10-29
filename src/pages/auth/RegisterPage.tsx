import { zodResolver } from '@hookform/resolvers/zod';
import { Compass, ShieldAlert, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Please enter your full legal name'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
    role: z.enum(['patient', 'family'], {
      message: 'Please select whether you are a patient or a family caregiver'
    }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'patient',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    setSuccessNotice(null);

    // Call Supabase auth signup with explicit public role constraint
    const result = await signUpWithEmail(
      data.email,
      data.password,
      data.fullName,
      data.role,
      data.phone
    );

    if (!result.success) {
      setAuthError(result.error || 'Failed to create account. Please check your information.');
      return;
    }

    if (result.requiresEmailVerification) {
      navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      return;
    }

    setSuccessNotice('Account created successfully! Loading your personal patient workspace...');
    setTimeout(() => {
      navigate('/patient');
    }, 1200);
  };

  return (
    <div className="py-8 sm:py-12 max-w-md mx-auto text-left space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
          Create Patient & Family Account
        </h1>
        <p className="text-xs text-[#64748B]">
          Register for secure administrative navigation, checklist tracking, and expense planning.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#2563EB]/25 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#0F172A]">Strict Public Role Governance</div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Public accounts are strictly restricted to <strong>Patients</strong> and <strong>Family Caregivers</strong>. Hospital staff, coordinators, and volunteers require administrative authorization and cannot be self-selected.
          </p>
        </div>
      </div>

      {authError && (
        <Alert variant="danger" title="Registration Error">
          {authError}
        </Alert>
      )}

      {successNotice && (
        <Alert variant="contrast" title="Registration Completed">
          {successNotice}
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Legal Name"
              required
              placeholder="e.g. Ananya Sharma"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mobile Phone Number"
              type="tel"
              required
              placeholder="98765 43210"
              error={errors.phone?.message}
              {...register('phone')}
            />

            {/* Public Role Choice (strictly patient or family) */}
            <div className="space-y-1.5">
              <label htmlFor="role-select" className="block text-xs font-semibold text-[#0F172A]">
                Account Type <span className="text-[#2563EB]">*</span>
              </label>
              <select
                id="role-select"
                aria-label="Select account type"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                {...register('role')}
              >
                <option value="patient">Patient (Organ Recipient / Transplant Candidate)</option>
                <option value="family">Family Member / Primary Caregiver</option>
              </select>
              {errors.role && (
                <p className="text-[11px] font-semibold text-red-600">{errors.role.message}</p>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              required
              placeholder="Minimum 6 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="space-y-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-[#64748B]">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                  {...register('agreeTerms')}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/privacy" className="text-[#2563EB] font-bold hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and acknowledge that Transplant Saathi provides non-clinical navigation only.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-[11px] font-semibold text-[#1D4ED8]">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[#2563EB] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
