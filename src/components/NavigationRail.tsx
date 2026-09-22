import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Plus, 
  FileText, 
  Users, 
  Puzzle, 
  Bell, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Laptop, 
  Check, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen,
  Target,
  Video,
  Hash,
  Mail
} from 'lucide-react';
import { ActiveSection, Member, OrganizationSettings, UserStatus } from '../types';
import { WorkNestLogo } from './WorkNestLogo';
import { UserAvatar } from './UserAvatar';

interface NavigationRailProps {
  activeSection: ActiveSection;
  onSelectSection: (sec: ActiveSection) => void;
  organization?: OrganizationSettings;
  currentUser?: Member | null;
  activeMeetingRoomId?: string | null;
  unreadChannelsCount?: number;
  unreadDMsCount?: number;
  unreadEmailsCount?: number;
  unreadNotificationsCount?: number;
  theme?: 'dark' | 'light' | 'system';
  onToggleTheme?: () => void;
  onChangeTheme?: (theme: 'dark' | 'light' | 'system') => void;
  isNavExpanded?: boolean;
  onToggleNavExpanded?: () => void;
  onToggleNavExpand?: () => void;
  onOpenQuickActions?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onUpdateStatus?: (status: UserStatus) => void;
  onLogout?: () => void;
  onOpenChannelBrowser?: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeSection,
  onSelectSection,
  organization = { 
    id: 'org_worknest_main', 
    name: 'WorkNest', 
    logoText: 'WN', 
    domain: '', 
    accentColor: 'indigo', 
    emailProvider: 'none', 
    allowGuestInvites: false, 
    retentionDays: 180,
    registrationApprovalMode: 'auto_approved_domains',
    approvedDomains: [],
    requireGovDomain: true
  },
  currentUser,
  activeMeetingRoomId = null,
  unreadChannelsCount = 0,
  unreadDMsCount = 0,
  unreadEmailsCount = 0,
  unreadNotificationsCount = 0,
  theme = 'dark',
  onToggleTheme,
  onChangeTheme,
  isNavExpanded = false,
  onToggleNavExpanded,
  onToggleNavExpand,
  onOpenQuickActions,
  onOpenSearch,
  onOpenNotifications,
  onUpdateStatus,
  onLogout,
  onOpenChannelBrowser
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showAppearanceSubmenu, setShowAppearanceSubmenu] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        setShowAppearanceSubmenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setShowAppearanceSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const user = currentUser || { 
    id: 'usr_default',
    name: 'Staff Officer', 
    email: 'officer@agency.gov.ng', 
    role: 'Member', 
    department: 'Administration', 
    avatar: '', 
    status: 'online' as UserStatus,
    isVerifiedGov: true
  };

  const statusColors: Record<UserStatus, string> = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
    offline: 'bg-stone-400'
  };

  // Core Primary Navigation Items
  const primaryNavItems = [
    {
      id: 'home' as ActiveSection,
      label: 'Home',
      icon: Home,
      badge: null,
      isActive: activeSection === 'home'
    },
    {
      id: 'tasks' as ActiveSection,
      label: 'Work & Tasks',
      icon: Target,
      badge: null,
      isActive: activeSection === 'tasks' || activeSection === 'work'
    },
    {
      id: 'channels' as ActiveSection,
      label: 'Channels',
      icon: Hash,
      badge: unreadChannelsCount > 0 ? unreadChannelsCount : null,
      isActive: activeSection === 'channels'
    },
    {
      id: 'messages' as ActiveSection,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadDMsCount > 0 ? unreadDMsCount : null,
      isActive: activeSection === 'messages'
    },
    {
      id: 'meetings' as ActiveSection,
      label: 'Video Call',
      icon: Video,
      badge: activeMeetingRoomId ? 'Live' : null,
      isActive: activeSection === 'meetings' || Boolean(activeMeetingRoomId)
    },
    {
      id: 'calendar' as ActiveSection,
      label: 'Calendar',
      icon: Calendar,
      badge: null,
      isActive: activeSection === 'calendar'
    },
    {
      id: 'email' as ActiveSection,
      label: 'Email',
      icon: Mail,
      badge: unreadEmailsCount > 0 ? unreadEmailsCount : null,
      isActive: activeSection === 'email'
    }
  ];

  // Secondary Tools
  const secondaryNavItems = [
    {
      id: 'files' as ActiveSection,
      label: 'Files',
      icon: FileText,
      badge: null,
      isActive: activeSection === 'files'
    },
    {
      id: 'people' as ActiveSection,
      label: 'People',
      icon: Users,
      badge: null,
      isActive: activeSection === 'people'
    },
    {
      id: 'plugins' as ActiveSection,
      label: 'Integrations',
      icon: Puzzle,
      badge: null,
      isActive: activeSection === 'plugins'
    }
  ];

  // Utilities
  const utilityNavItems = [
    {
      id: 'settings' as ActiveSection,
      label: 'Settings',
      icon: Settings,
      badge: null,
      isActive: activeSection === 'settings'
    }
  ];

  const handleSelectNav = (sec: ActiveSection) => {
    onSelectSection(sec);
    setIsProfileMenuOpen(false);
  };

  const handleSetTheme = (newTheme: 'dark' | 'light' | 'system') => {
    if (onChangeTheme) {
      onChangeTheme(newTheme);
    } else if (onToggleTheme) {
      onToggleTheme();
    }
  };

  const renderNavItem = (item: {
    id: ActiveSection;
    label: string;
    icon: any;
    badge?: number | string | null;
    isActive: boolean;
  }) => {
    const Icon = item.icon;
    const isLiveMeeting = item.id === 'meetings' && Boolean(activeMeetingRoomId);

    return (
      <button
        key={item.id}
        id={`nav-item-${item.id}`}
        data-testid={`nav-item-${item.id}`}
        onClick={() => handleSelectNav(item.id)}
        className={`transition-all relative group cursor-pointer ${
          isNavExpanded 
            ? 'w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs' 
            : 'w-full py-2 px-1 rounded-xl flex flex-col items-center justify-center space-y-1'
        } ${
          item.isActive 
            ? 'bg-blue-50 text-[#0062FF] dark:bg-blue-950/80 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-800/60 shadow-xs' 
            : 'text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/80 font-medium'
        }`}
        title={item.label}
        aria-label={item.label}
        aria-current={item.isActive ? 'page' : undefined}
      >
        <div className={`flex ${isNavExpanded ? 'items-center space-x-3 min-w-0' : 'flex-col items-center justify-center space-y-1 w-full'}`}>
          <div className="relative shrink-0 flex items-center justify-center">
            <Icon className={`${isNavExpanded ? 'w-4.5 h-4.5' : 'w-5 h-5'} ${item.isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]'}`} />
            {isLiveMeeting && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0B101B] animate-pulse" />
            )}
          </div>
          <span 
            data-testid={`nav-label-${item.id}`}
            className={`tracking-tight ${
              isNavExpanded 
                ? 'truncate text-xs font-semibold' 
                : 'text-[10px] font-semibold text-center leading-tight truncate max-w-full px-0.5'
            }`}
          >
            {item.label}
          </span>
        </div>

        {/* Badge: String (e.g. 'Live') or Number (Unread count) */}
        {item.badge !== null && item.badge !== undefined && (
          typeof item.badge === 'string' ? (
            <span className={`px-1.5 py-0.5 rounded-full bg-rose-600 text-[9px] font-bold text-white uppercase tracking-wider flex items-center space-x-1 shrink-0 ${
              !isNavExpanded ? 'absolute top-1 right-1 shadow-xs' : ''
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {isNavExpanded && <span>{item.badge}</span>}
            </span>
          ) : (
            typeof item.badge === 'number' && item.badge > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full bg-[#0062FF] text-[10px] font-bold text-white flex items-center justify-center shrink-0 ${
                !isNavExpanded ? 'absolute top-1 right-1 min-w-3.5 h-3.5 text-[9px]' : ''
              }`}>
                {item.badge}
              </span>
            )
          )
        )}

        {/* Active Indicator Bar */}
        {item.isActive && (
          <span className={`absolute bg-[#0062FF] dark:bg-blue-400 rounded-full ${
            isNavExpanded ? 'left-0 top-2 bottom-2 w-1' : 'left-0 top-1.5 bottom-1.5 w-1'
          }`} />
        )}
      </button>
    );
  };

  return (
    <aside 
      id="primary-navigation-rail"
      data-testid="navbar"
      aria-label="Primary Navigation"
      className={`hidden md:flex flex-col justify-between h-full max-h-screen py-3 pb-3 border-r bg-white dark:bg-[#0B101B] border-stone-200 dark:border-stone-800/90 select-none shrink-0 z-30 transition-all duration-200 ease-in-out overflow-hidden shadow-xs ${
        isNavExpanded ? 'w-60 px-3' : 'w-[82px] px-2 items-center'
      }`}
    >
      {/* =========================================================================
          TOP SECTION: BRAND & ESSENTIAL NAV ICONS (SCROLLABLE IF HEIGHT LIMITED)
          ========================================================================= */}
      <div className="flex flex-col space-y-3 w-full min-h-0 flex-1 overflow-y-auto scrollbar-none pb-2">
        
        {/* Brand Header & Toggle */}
        <div className={`flex items-center ${isNavExpanded ? 'justify-between px-1' : 'flex-col space-y-1.5 justify-center'} w-full`}>
          {isNavExpanded ? (
            <button
              id="nav-org-brand-btn"
              data-testid="nav-brand-button"
              onClick={() => handleSelectNav('home')}
              className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity cursor-pointer group text-left min-w-0"
              title={`${organization?.name || 'WorkNest'} - Home`}
            >
              <div className="h-9 w-auto flex items-center justify-center shrink-0">
                <WorkNestLogo size="sm" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                  {organization?.name || 'WorkNest'}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  Institutional Workspace
                </span>
              </div>
            </button>
          ) : (
            <button
              id="nav-org-monogram-btn"
              data-testid="nav-brand-button"
              onClick={() => handleSelectNav('home')}
              className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-[#111726] hover:bg-stone-100 dark:hover:bg-[#182238] flex flex-col items-center justify-center shadow-xs border border-stone-200 dark:border-stone-800 transition-transform active:scale-95 group relative p-1 cursor-pointer"
              title={`${organization?.name || 'WorkNest'} - Home`}
            >
              <WorkNestLogo size="xs" variant="icon" />
              <span className="text-[9px] font-bold text-stone-700 dark:text-stone-300 mt-0.5 tracking-tight leading-none truncate max-w-full">
                WorkNest
              </span>
            </button>
          )}

          {/* Nav Rail Expand/Collapse Toggle */}
          {(onToggleNavExpanded || onToggleNavExpand) && (
            <button
              id="nav-toggle-expand-btn"
              data-testid="nav-toggle-expand"
              onClick={onToggleNavExpanded || onToggleNavExpand}
              className={`p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0 ${
                !isNavExpanded ? 'w-full py-1.5 flex items-center justify-center text-[10px] space-x-1 border border-stone-200/80 dark:border-stone-800 rounded-lg mt-1' : ''
              }`}
              title={isNavExpanded ? "Collapse navigation" : "Expand navigation"}
              aria-label={isNavExpanded ? "Collapse navigation" : "Expand navigation"}
            >
              {isNavExpanded ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold">Expand</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Global Quick Action Button (+) */}
        {onOpenQuickActions && (
          <button
            id="nav-quick-actions-btn"
            data-testid="nav-quick-action"
            onClick={onOpenQuickActions}
            className={`rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer ${
              isNavExpanded 
                ? 'w-full py-2 px-3 space-x-2 text-xs' 
                : 'w-full py-1.5 px-1 flex-col space-y-0.5'
            }`}
            title="Create New (Message, Channel, Event, Meeting, Dispatch)"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className={isNavExpanded ? 'text-xs' : 'text-[10px] leading-none font-bold'}>
              {isNavExpanded ? 'New Action' : '+ New'}
            </span>
          </button>
        )}

        <div className={`h-px bg-stone-200/70 dark:bg-stone-800/70 ${isNavExpanded ? 'mx-1' : 'w-10 mx-auto'}`} />

        {/* Clean Hierarchical Navigation */}
        <nav className="flex flex-col space-y-1 w-full" aria-label="Main Navigation">
          {/* Section Header */}
          {isNavExpanded && (
            <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Workspace
            </div>
          )}
          {/* Primary Navigation */}
          {primaryNavItems.map(renderNavItem)}

          {/* Divider */}
          <div className={`h-px bg-stone-200/70 dark:bg-stone-800/70 my-1.5 ${isNavExpanded ? 'mx-1' : 'w-10 mx-auto'}`} />

          {isNavExpanded && (
            <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Directories & Tools
            </div>
          )}
          {/* Secondary Tools */}
          {secondaryNavItems.map(renderNavItem)}

          {/* Divider */}
          <div className={`h-px bg-stone-200/70 dark:bg-stone-800/70 my-1.5 ${isNavExpanded ? 'mx-1' : 'w-10 mx-auto'}`} />

          {isNavExpanded && (
            <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              System
            </div>
          )}
          {/* Utility / Settings */}
          {utilityNavItems.map(renderNavItem)}
        </nav>
      </div>

      {/* =========================================================================
          3. BOTTOM SECTION: ONLY PROFILE (NOTHING ELSE)
          ========================================================================= */}
      <div className="flex flex-col items-center w-full pt-2 pb-1 border-t border-stone-200/80 dark:border-stone-800 shrink-0" ref={profileMenuRef}>
        
        {/* User Avatar Button */}
        <div className="relative w-full">
          <button
            id="nav-user-avatar-btn"
            data-testid="nav-user-profile"
            onClick={() => {
              setIsProfileMenuOpen(prev => !prev);
              setShowAppearanceSubmenu(false);
            }}
            className={`rounded-xl transition-all flex items-center cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800/80 ${
              isNavExpanded 
                ? 'w-full p-2 space-x-2.5 justify-between text-left' 
                : 'w-full py-1.5 px-1 flex-col items-center justify-center space-y-1'
            }`}
            title={`${user.name} (${user.role}) - Open Profile Menu`}
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen}
          >
            <div className={`flex ${isNavExpanded ? 'items-center space-x-2.5 min-w-0' : 'flex-col items-center space-y-0.5'}`}>
              <UserAvatar
                member={user}
                size={isNavExpanded ? "sm" : "xs"}
                showStatus={true}
                shape="rounded"
              />
              <span className={`font-bold text-stone-900 dark:text-stone-100 truncate ${
                isNavExpanded ? 'text-xs' : 'text-[9.5px] text-center max-w-[70px] leading-tight'
              }`}>
                {isNavExpanded ? user.name : (user.name.split(' ')[0] || 'Profile')}
              </span>
              {isNavExpanded && (
                <span className="text-[10px] text-stone-400 truncate">
                  {user.role} • {user.status}
                </span>
              )}
            </div>
            {isNavExpanded && (
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            )}
          </button>

          {/* CLEAN PROFILE & SETTINGS POPOVER MENU - FIXED POSITIONING */}
          {isProfileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[0.5px]"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setShowAppearanceSubmenu(false);
                }}
              />
              <div 
                id="profile-dropdown-menu"
                style={{
                  left: isNavExpanded ? '248px' : '74px',
                  bottom: '16px'
                }}
                className="fixed rounded-2xl bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800 shadow-2xl py-2 z-50 text-xs w-64 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* User Header */}
                <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800/80">
                  <div className="font-bold text-stone-900 dark:text-stone-100 truncate">{user.name}</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{user.email}</div>
                  <div className="inline-flex items-center space-x-1 mt-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{user.role} ({user.department || 'Staff'})</span>
                  </div>
                </div>

                {/* 1. Presence Status */}
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Presence Status
                  </div>
                  {(['online', 'busy', 'away', 'offline'] as UserStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        if (onUpdateStatus) onUpdateStatus(status);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left capitalize text-stone-700 dark:text-stone-300 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                        <span>{status}</span>
                      </div>
                      {user.status === status && <Check className="w-3.5 h-3.5 text-[#0062FF]" />}
                    </button>
                  ))}
                </div>

                {/* 2. Appearance / Theme */}
                <div className="py-1 border-t border-stone-100 dark:border-stone-800/80">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Appearance
                  </div>
                  <div className="px-3 py-1 flex items-center space-x-1">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'Auto', icon: Laptop }
                    ].map(t => {
                      const Icon = t.icon;
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSetTheme(t.id as 'dark' | 'light' | 'system')}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-[#0062FF] text-white shadow-2xs' 
                              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Account & Governance Settings */}
                <div className="py-1 border-t border-stone-100 dark:border-stone-800/80">
                  <button
                    onClick={() => {
                      handleSelectNav('settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="w-3.5 h-3.5 text-stone-400" />
                      <span>Account & Settings</span>
                    </div>
                  </button>

                  {onOpenNotifications && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenNotifications();
                      }}
                      className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left text-stone-700 dark:text-stone-300 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <Bell className="w-3.5 h-3.5 text-stone-400" />
                        <span>Notifications</span>
                      </div>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-bold text-white">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* 4. Sign Out */}
                <div className="pt-1 border-t border-stone-100 dark:border-stone-800/80">
                  <button
                    id="btn-profile-signout"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full px-3.5 py-1.5 flex items-center space-x-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </aside>
  );
};
