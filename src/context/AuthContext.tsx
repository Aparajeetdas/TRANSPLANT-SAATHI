import React, { createContext, useContext, useEffect, useState } from 'react';
import { generatePublicUserId } from '../lib/identity';
import { DEMO_PROFILES } from '../lib/mockData';
import { getStoredUser, recordAuditLog, setStoredUser, updateUserProfile as storeUpdateUserProfile } from '../lib/store';
import { getAppBaseUrl, isSupabaseConfigured, supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

export interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isSupabaseLive: boolean;
  sessionError: string | null;
  clearSessionError: () => void;
  switchRole: (role: UserRole) => void;
  loginAs: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
  loginWithPassword: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; isEmailUnconfirmed?: boolean }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    role?: 'patient' | 'family' | 'donor',
    phone?: string
  ) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<boolean>;
  isPatient: boolean;
  isFamily: boolean;
  isVolunteer: boolean;
  isHospitalStaff: boolean;
  isAdmin: boolean;
  isDonor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createUniqueUserId(): string {
  return `usr-${Date.now()}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(() => isSupabaseConfigured);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Synchronize state with local storage
  useEffect(() => {
    setStoredUser(currentUser);
  }, [currentUser]);

  // Supabase session listener & token refresh management
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        setSessionError(error.message);
      } else if (session?.user) {
        const canonical = DEMO_PROFILES.find((p) => p.id === session.user.id || p.email === session.user.email);
        const profile: UserProfile = {
          id: session.user.id,
          publicId: session.user.user_metadata?.public_id || canonical?.publicId || generatePublicUserId(),
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: (session.user.user_metadata?.role as UserRole) || 'patient',
          phone: session.user.user_metadata?.phone,
          isActive: true,
          createdAt: session.user.created_at
        };
        setCurrentUserState(profile);
        setSessionError(null);
      }
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const canonical = DEMO_PROFILES.find((p) => p.id === session.user.id || p.email === session.user.email);
          const profile: UserProfile = {
            id: session.user.id,
            publicId: session.user.user_metadata?.public_id || canonical?.publicId || generatePublicUserId(),
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role: (session.user.user_metadata?.role as UserRole) || 'patient',
            phone: session.user.user_metadata?.phone,
            isActive: true,
            createdAt: session.user.created_at
          };
          setCurrentUserState(profile);
          setSessionError(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserState(null);
        setStoredUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearSessionError = () => {
    setSessionError(null);
  };

  const switchRole = (newRole: UserRole) => {
    const matchedProfile = DEMO_PROFILES.find((p) => p.role === newRole) || {
      id: createUniqueUserId(),
      publicId: generatePublicUserId(),
      email: `${newRole}@transplantsaathi.org`,
      fullName: `Authorized ${newRole.replace('_', ' ').toUpperCase()}`,
      role: newRole,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (currentUser) {
      recordAuditLog(currentUser, 'ROLE_SWITCH_SIMULATION', 'profiles', matchedProfile.id, {
        previousRole: currentUser.role,
        switchedToRole: newRole
      });
    }

    setCurrentUserState(matchedProfile);
  };

  const loginAs = (profile: UserProfile | null) => {
    if (profile) {
      recordAuditLog(profile, 'USER_AUTHENTICATED', 'profiles', profile.id, {
        role: profile.role
      });
    }
    setCurrentUserState(profile);
    setSessionError(null);
  };

  const logout = async () => {
    if (currentUser) {
      recordAuditLog(currentUser, 'USER_LOGOUT', 'profiles', currentUser.id);
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Silently catch network errors during signout
      }
    }
    setStoredUser(null);
    setCurrentUserState(null);
    setSessionError(null);
  };

  const loginWithPassword = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; isEmailUnconfirmed?: boolean }> => {
    setSessionError(null);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        const isEmailUnconfirmed =
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('unconfirmed');
        return {
          success: false,
          error: error.message,
          isEmailUnconfirmed
        };
      }
      if (data.user) {
        const canonical = DEMO_PROFILES.find((p) => p.id === data.user.id || p.email === data.user.email);
        const profile: UserProfile = {
          id: data.user.id,
          publicId: data.user.user_metadata?.public_id || canonical?.publicId || generatePublicUserId(),
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          role: (data.user.user_metadata?.role as UserRole) || 'patient',
          phone: data.user.user_metadata?.phone,
          isActive: true,
          createdAt: data.user.created_at
        };
        loginAs(profile);
        return { success: true };
      }
    }

    // Mock Mode Verification
    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail.includes('unverified')) {
      return {
        success: false,
        error: 'Email address not verified. Please verify your email before logging in.',
        isEmailUnconfirmed: true
      };
    }

    if (pass === 'wrong-password' || pass === 'invalid') {
      return {
        success: false,
        error: 'Invalid login credentials. Please check your email and password.'
      };
    }

    const matchedDemo = DEMO_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail);
    if (matchedDemo) {
      loginAs(matchedDemo);
      return { success: true };
    }

    // New mock authenticated patient
    const fallbackProfile: UserProfile = {
      id: createUniqueUserId(),
      publicId: generatePublicUserId(),
      email: cleanEmail,
      fullName: cleanEmail.split('@')[0].toUpperCase(),
      role: 'patient',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    loginAs(fallbackProfile);
    return { success: true };
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    role?: 'patient' | 'family' | 'donor',
    phone?: string
  ): Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }> => {
    // SECURITY GUARD: Never allow public users to self-select privileged roles (volunteer, hospital_staff, admin)
    // Cast to check for any malicious attempt to pass a privileged role
    const attemptedRole = role as string | undefined;
    if (attemptedRole && attemptedRole !== 'patient' && attemptedRole !== 'family' && attemptedRole !== 'donor') {
      return {
        success: false,
        error:
          'Security Policy Violation: Public registration is strictly restricted to Patients, Family Caregivers, and Organ Donors. Privileged roles (Admin, Hospital Staff, Volunteer) cannot be self-selected and must be authorized by institutional administrators.'
      };
    }

    const safeRole: UserRole = role === 'family' ? 'family' : role === 'donor' ? 'donor' : 'patient';
    const assignedPublicId = generatePublicUserId();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
            role: safeRole,
            public_id: assignedPublicId
          },
          emailRedirectTo: `${getAppBaseUrl()}/auth/verify-email`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if Supabase requires email verification (identities empty or session null)
      if (data.user && !data.session) {
        return { success: true, requiresEmailVerification: true };
      }

      if (data.user) {
        const newProfile: UserProfile = {
          id: data.user.id,
          publicId: assignedPublicId,
          email: data.user.email || email,
          fullName,
          phone,
          role: safeRole,
          isActive: true,
          createdAt: data.user.created_at || new Date().toISOString()
        };
        loginAs(newProfile);
        return { success: true };
      }
    }

    // Mock Mode Registration
    const newProfile: UserProfile = {
      id: createUniqueUserId(),
      publicId: assignedPublicId,
      email,
      fullName,
      phone,
      role: safeRole,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    loginAs(newProfile);
    return { success: true };
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Authentication required to update profile settings.' };
    }
    const res = storeUpdateUserProfile(currentUser.id, updates, currentUser);
    if (res.success && res.profile) {
      setCurrentUserState(res.profile);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update profile' };
  };

  const resetPasswordForEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const redirectTo = `${getAppBaseUrl()}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    // Mock mode
    return { success: true };
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    // Mock mode
    return { success: true };
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${getAppBaseUrl()}/auth/verify-email`
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    // Mock mode
    return { success: true };
  };

  const refreshSession = async (): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        setSessionError('Session expired. Please sign in again.');
        setCurrentUserState(null);
        setStoredUser(null);
        return false;
      }
      setSessionError(null);
      return true;
    }

    // Mock mode
    if (currentUser) {
      return true;
    }
    setSessionError('Session expired. Please sign in again.');
    return false;
  };

  const role: UserRole = currentUser?.role || 'patient';

  const value: AuthContextType = {
    currentUser,
    role,
    isLoading,
    isSupabaseLive: isSupabaseConfigured,
    sessionError,
    clearSessionError,
    switchRole,
    loginAs,
    logout,
    loginWithPassword,
    signUpWithEmail,
    updateProfile,
    resetPasswordForEmail,
    updatePassword,
    resendVerificationEmail,
    refreshSession,
    isPatient: role === 'patient',
    isFamily: role === 'family',
    isVolunteer: role === 'volunteer',
    isHospitalStaff: role === 'hospital_staff',
    isAdmin: role === 'admin',
    isDonor: role === 'donor'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
