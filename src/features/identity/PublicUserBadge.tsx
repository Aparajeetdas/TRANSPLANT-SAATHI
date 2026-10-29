import { Check, Copy, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import { UserRole } from '../../types';

interface PublicUserBadgeProps {
  publicId: string;
  role?: UserRole;
  avatarSeed?: string;
  organCategory?: string;
  showCopy?: boolean;
  className?: string;
}

export const PublicUserBadge: React.FC<PublicUserBadgeProps> = ({
  publicId,
  role = 'patient',
  avatarSeed,
  organCategory,
  showCopy = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicId);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const seed = avatarSeed || publicId.replace(/[^A-Z0-9]/g, '').slice(0, 4);

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/20 text-xs font-medium text-[#0F172A] ${className}`}
      title={`Anonymous Public User: ${publicId}`}
    >
      {/* Generic avatar glyph */}
      <div className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-[10px] shrink-0 uppercase">
        {seed.slice(0, 2) || <User className="w-3.5 h-3.5" />}
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#0F172A]">{publicId}</span>
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-[#64748B] hover:text-[#2563EB] transition-colors p-0.5 rounded cursor-pointer"
              aria-label={`Copy public ID ${publicId}`}
              title="Copy Public ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#1D4ED8]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <span className="capitalize">{role.replace('_', ' ')}</span>
          {organCategory && (
            <>
              <span>•</span>
              <span className="uppercase">{organCategory}</span>
            </>
          )}
          <span>•</span>
          <span className="flex items-center text-[#2563EB] font-semibold">
            <Shield className="w-2.5 h-2.5 mr-0.5" />
            Pseudonymous
          </span>
        </div>
      </div>
    </div>
  );
};
