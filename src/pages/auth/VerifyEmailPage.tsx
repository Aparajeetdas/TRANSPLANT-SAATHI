import { ArrowLeft, CheckCircle2, Compass, Mail, RefreshCw, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { resendVerificationEmail } = useAuth();
  const [emailToResend, setEmailToResend] = useState(searchParams.get('email') || '');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const hasTokenInHash = typeof window !== 'undefined' && Boolean(window.location.hash && window.location.hash.includes('access_token'));

  const [isVerifying, setIsVerifying] = useState(() => Boolean(tokenHash && type === 'signup'));
  const [asyncVerified, setAsyncVerified] = useState(false);

  const verificationSuccess = hasTokenInHash || asyncVerified;

  // Check if URL contains Supabase verification token_hash
  useEffect(() => {
    if (tokenHash && type === 'signup') {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: 'signup' })
        .then(({ error }) => {
          setIsVerifying(false);
          if (!error) {
            setAsyncVerified(true);
          } else {
            setResendError(error.message);
          }
        })
        .catch(() => {
          setIsVerifying(false);
          setResendError('Could not verify email token. The link may have expired.');
        });
    }
  }, [tokenHash, type]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToResend) return;

    setResendLoading(true);
    setResendError(null);
    setResendSuccess(false);

    const res = await resendVerificationEmail(emailToResend);
    setResendLoading(false);

    if (res.success) {
      setResendSuccess(true);
    } else {
      setResendError(res.error || 'Failed to resend confirmation email.');
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-md mx-auto text-left space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
          Email Verification
        </h1>
        <p className="text-xs text-[#64748B]">
          Confirm your email address to activate your Transplant Saathi account.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-0">
          {isVerifying ? (
            <div className="text-center py-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#0F172A]">
                Verifying your email token with official registry...
              </p>
            </div>
          ) : verificationSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                Email Address Confirmed!
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Your account is now fully verified. You can sign in and start navigating official transplant resources and checklists.
              </p>
              <div className="pt-2">
                <Link to="/auth/login">
                  <Button variant="primary" size="sm" className="w-full">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-2 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] font-heading">
                  Check Your Inbox
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  We sent a confirmation link to your email address. Click the link to verify your account and begin your journey.
                </p>
              </div>

              {resendSuccess && (
                <Alert variant="contrast" title="Verification Link Sent">
                  A fresh verification email has been dispatched. Please check your spam folder if it does not arrive within 2 minutes.
                </Alert>
              )}

              {resendError && (
                <Alert variant="danger" title="Verification Error">
                  {resendError}
                </Alert>
              )}

              <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <div className="text-xs font-semibold text-[#0F172A]">
                  Didn't receive the email?
                </div>
                <Input
                  label="Email to Resend"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailToResend}
                  onChange={(e) => setEmailToResend(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  isLoading={resendLoading}
                  className="w-full"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Resend Verification Email
                </Button>
              </form>

              <div className="pt-3 text-center">
                <Link
                  to="/auth/login"
                  className="text-xs text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
