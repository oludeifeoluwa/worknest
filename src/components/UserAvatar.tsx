import React, { useState } from 'react';
import { Member, UserRole, UserStatus } from '../types';

interface UserAvatarProps {
  member?: Partial<Member> | null;
  name?: string;
  avatarUrl?: string;
  role?: UserRole | string;
  status?: UserStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  shape?: 'rounded' | 'square' | 'circle';
}

const colorPalettes = [
  { bg: 'bg-blue-600 dark:bg-blue-600', text: 'text-white' },
  { bg: 'bg-emerald-600 dark:bg-emerald-600', text: 'text-white' },
  { bg: 'bg-indigo-600 dark:bg-indigo-600', text: 'text-white' },
  { bg: 'bg-cyan-700 dark:bg-cyan-600', text: 'text-white' },
  { bg: 'bg-teal-700 dark:bg-teal-600', text: 'text-white' },
  { bg: 'bg-amber-600 dark:bg-amber-600', text: 'text-white' },
  { bg: 'bg-violet-600 dark:bg-violet-600', text: 'text-white' },
  { bg: 'bg-rose-600 dark:bg-rose-600', text: 'text-white' },
  { bg: 'bg-stone-700 dark:bg-stone-700', text: 'text-white' },
];

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'PO';
  const clean = name.replace(/^(Dr\.|Hon\.|Barr\.|Mr\.|Mrs\.|Ms\.|Engr\.|Prof\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name?: string) {
  if (!name) return colorPalettes[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalettes.length;
  return colorPalettes[index];
}

const sizeConfig = {
  xs: {
    container: 'w-6 h-6 text-[10px]',
    dot: 'w-1.5 h-1.5',
    rounded: 'rounded-md',
  },
  sm: {
    container: 'w-8 h-8 text-xs',
    dot: 'w-2 h-2',
    rounded: 'rounded-lg',
  },
  md: {
    container: 'w-10 h-10 text-xs sm:text-sm',
    dot: 'w-2.5 h-2.5',
    rounded: 'rounded-xl',
  },
  lg: {
    container: 'w-12 h-12 text-sm sm:text-base font-bold',
    dot: 'w-3 h-3',
    rounded: 'rounded-xl',
  },
  xl: {
    container: 'w-16 h-16 text-lg sm:text-xl font-bold',
    dot: 'w-3.5 h-3.5',
    rounded: 'rounded-2xl',
  },
};

const statusColors: Record<UserStatus, string> = {
  online: 'bg-emerald-500',
  busy: 'bg-rose-500',
  away: 'bg-amber-500',
  offline: 'bg-stone-400',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  member,
  name: propName,
  avatarUrl: propAvatar,
  role: propRole,
  status: propStatus,
  size = 'sm',
  className = '',
  showStatus = false,
  shape = 'rounded',
}) => {
  const [imgError, setImgError] = useState(false);

  const displayName = propName || member?.name || 'Public Officer';
  const avatar = propAvatar || member?.avatar;
  const status = propStatus || member?.status || 'online';
  
  // Filter out any unsplash stock photos if present
  const isStockPhoto = typeof avatar === 'string' && avatar.includes('images.unsplash.com');
  const validAvatar = !isStockPhoto && avatar && avatar.trim().length > 0;

  const initials = getInitials(displayName);
  const palette = getPalette(displayName);
  const cfg = sizeConfig[size];
  
  const shapeClass = shape === 'circle' ? 'rounded-full' : cfg.rounded;

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      <div
        className={`${cfg.container} ${shapeClass} flex items-center justify-center font-bold tracking-tight overflow-hidden shadow-2xs ${palette.bg} ${palette.text} ring-1 ring-black/5 dark:ring-white/10`}
      >
        {validAvatar && !imgError ? (
          <img
            src={avatar}
            alt={displayName}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${cfg.dot} rounded-full border-2 border-white dark:border-[#0F172A] ${statusColors[status]}`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
