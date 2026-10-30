import { zodResolver } from '@hookform/resolvers/zod';
import { Compass, LogIn, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROFILES } from '../../lib/mockData';
import { UserProfile } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginAs, loginWithPassword, currentUser, sessionError } = useAuth();
  const [activeTab, setActiveTab] = useState<'credentials' | 'personas'>('credentials');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState('');

  // Check if redirected from a protected route or expired session
  const fromPath = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const isSessionExpired = searchParams.get('session') === 'expired' || Boolean(sessionError);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsEmailUnconfirmed(false);
    setLastAttemptedEmail(data.email);

    const result = await loginWithPassword(data.email, data.password);
    if (!result.success) {
      setAuthError(result.error || 'Authentication failed. Please verify your credentials.');
      if (result.isEmailUnconfirmed) {
        setIsEmailUnconfirmed(true);
      }
      return;
    }

    // Redirect to destination or default workspace
    if (fromPath) {
      navigate(fromPath);
    } else {
      navigate('/patient');
    }
  };

  const handleSelectPersona = (profile: UserProfile) => {
    loginAs(profile);
    if (profile.role === 'volunteer') navigate('/volunteer');
    else if (profile.role === 'hospital_staff') navigate('/hospital');
    else if (profile.role === 'admin') navigate('/admin');
    else navigate('/patient');
  };

  return (
    <div className="py-8 sm:py-12 max-w-md mx-auto text-left space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] font-heading">
          Sign In to Transplant Saathi
        </h1>
        <p className="text-xs text-[#64748B]">
          Access your personal journey tracker, legal checklists, and volunteer requests.
        </p>
      </div>

      {/* Notifications / Error states */}
      {isSessionExpired && (
        <Alert variant="danger" title="Session Expired">
          Your session has timed out. Please enter your credentials to resume your workspace.
        </Alert>
      )}

      {fromPath && !isSessionExpired && (
        <Alert variant="info" title="Authentication Required">
          Please sign in with your credentials to access this protected portal.
        </Alert>
      )}

      {authError && (
        <Alert variant="danger" title="Authentication Error">
          <div>{authError}</div>
          {isEmailUnconfirmed && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <Link
                to={`/auth/verify-email?email=${encodeURIComponent(lastAttemptedEmail)}`}
                className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Verify your email address now →</span>
              </Link>
            </div>
          )}
        </Alert>
      )}

      {/* Mode Switcher */}
      <div className="flex rounded-xl bg-[#F4F8FF] p-1 border border-[#E2E8F0]" role="tablist" aria-label="Authentication Method">
        <button
          role="tab"
          aria-selected={activeTab === 'credentials'}
          aria-controls="tab-panel-credentials"
          id="tab-credentials"
          onClick={() => setActiveTab('credentials')}
          className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'credentials'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Email &amp; Password
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'personas'}
          aria-controls="tab-panel-personas"
          id="tab-personas"
          onClick={() => setActiveTab('personas')}
          className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'personas'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Test Personas (RBAC)
        </button>
      </div>

      {/* Tab 1: Standard Credentials Form */}
      {activeTab === 'credentials' ? (
        <div role="tabpanel" id="tab-panel-credentials" aria-label="Credentials Login Panel">
        <Card>
          <CardContent className="space-y-4 pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between text-xs">
                <Link to="/auth/forgot-password" className="text-[#2563EB] hover:underline font-semibold">
                  Forgot your password?
                </Link>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
              Don't have an account yet?{' '}
              <Link to="/auth/register" className="text-[#2563EB] font-bold hover:underline">
                Create Patient Account
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      ) : (
        /* Tab 2: Test Personas for rapid verification */
        <div role="tabpanel" id="tab-panel-personas" aria-labelledby="tab-personas">
        <Card className="space-y-4">
          <div className="text-xs text-[#64748B]">
            Select an authenticated role to inspect features across different healthcare actors:
          </div>

          <div className="space-y-2">
            {DEMO_PROFILES.map((profile) => {
              const isCurrent = currentUser?.id === profile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelectPersona(profile)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#F4F8FF] border-[#2563EB]'
                      : 'bg-white border-[#E2E8F0] hover:border-[#2563EB]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0F172A]">
                        {profile.fullName}
                      </span>
                      <Badge
                        variant={
                          profile.role === 'admin'
                            ? 'navy'
                            : profile.role === 'hospital_staff'
                            ? 'primary'
                            : 'subtle'
                        }
                      >
                        {profile.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {profile.organization || profile.email}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#2563EB]">
                    {isCurrent ? 'Active' : 'Sign in →'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        </div>
      )}
    </div>
  );
};
