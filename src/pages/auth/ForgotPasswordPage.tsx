import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Compass, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const { resetPasswordForEmail } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ForgotFormData) => {
    setErrorMessage(null);
    const result = await resetPasswordForEmail(data.email);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to dispatch reset email. Please try again.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="py-8 sm:py-12 max-w-md mx-auto text-left space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
          Recover Password
        </h1>
        <p className="text-xs text-[#64748B]">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-0">
          {errorMessage && (
            <Alert variant="danger" title="Recovery Request Failed">
              {errorMessage}
            </Alert>
          )}

          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                If an account exists for this email address, you will receive password reset instructions shortly.
              </p>
              <div className="pt-2">
                <Link to="/auth/login">
                  <Button variant="primary" size="sm" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                required
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Send Password Reset Link
              </Button>

              <div className="pt-3 text-center">
                <Link to="/auth/login" className="text-xs text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
