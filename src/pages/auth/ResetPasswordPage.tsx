import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Compass, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your new password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    const res = await updatePassword(data.password);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update password. Your reset link may have expired.');
      return;
    }
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/auth/login');
    }, 2500);
  };

  return (
    <div className="py-8 sm:py-12 max-w-md mx-auto text-left space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
          Set New Password
        </h1>
        <p className="text-xs text-[#64748B]">
          Choose a secure password for your Transplant Saathi account.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-0">
          {errorMessage && (
            <Alert variant="danger" title="Password Reset Error">
              {errorMessage}
            </Alert>
          )}

          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                Password Successfully Updated
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Your new password has been verified and saved. Redirecting to sign in...
              </p>
              <div className="pt-2">
                <Link to="/auth/login">
                  <Button variant="primary" size="sm" className="w-full">
                    Proceed to Sign In Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                required
                placeholder="At least 6 characters"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                placeholder="Repeat your new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Update Password
              </Button>

              <div className="pt-3 text-center">
                <Link
                  to="/auth/login"
                  className="text-xs text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
