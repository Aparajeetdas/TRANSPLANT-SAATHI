import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROFILES } from '../../lib/mockData';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAs, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');

  const handleSelectDemoUser = (profile: UserProfile) => {
    loginAs(profile);
    onClose();
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Custom sign-in simulation with standard patient role (prevent self-assignment of privileged roles)
    const customUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: 'patient',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    loginAs(customUser);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Access Transplant Saathi"
      subtitle="Sign in to your patient account or select a verified test persona"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#F4F8FF] p-1 border border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('quick')}
            className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'quick'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Quick Persona Switch
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'credentials'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Email Login
          </button>
        </div>

        {activeTab === 'quick' ? (
          <div className="space-y-3">
            <div className="text-xs text-[#64748B]">
              Select a pre-configured role to inspect features across different healthcare actors:
            </div>

            <div className="space-y-2">
              {DEMO_PROFILES.map((profile) => {
                const isCurrent = currentUser?.id === profile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectDemoUser(profile)}
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

                    <div className="text-xs font-bold text-[#2563EB]">
                      {isCurrent ? 'Active' : 'Select →'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCredentialLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/25 text-[11px] text-[#1D4ED8]">
              <strong>Security Protocol: </strong>
              All new public logins default to the <em>Patient</em> role. Hospital Coordinator and Administrator privileges require institutional verification.
            </div>

            <Button variant="primary" size="md" type="submit" className="w-full">
              Sign In with Supabase Auth
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
