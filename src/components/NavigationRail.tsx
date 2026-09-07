import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Video, 
  Grid, 
  Plus, 
  Hash, 
  Mail, 
  FileText, 
  Users, 
  Puzzle, 
  Languages, 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Laptop, 
  Check, 
  ChevronRight, 
  PanelLeftClose, 
  Menu,
  ExternalLink,
  X
} from 'lucide-react';
import { ActiveSection, Member, OrganizationSettings, UserStatus } from '../types';
import { WorkNestLogo } from './WorkNestLogo';
import { UserAvatar } from './UserAvatar';

interface NavigationRailProps {
  activeSection: ActiveSection;
  onSelectSection: (sec: ActiveSection) => void;
  organization?: OrganizationSettings;
  currentUser?: Member | null;
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showAppearanceSubmenu, setShowAppearanceSubmenu] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        setShowAppearanceSubmenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreMenuOpen(false);
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

  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin' || user.role === 'Director';

  const statusColors: Record<UserStatus, string> = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
    offline: 'bg-stone-400'
  };

  // 4 Core Permanent Visible Destinations
  const primaryNavItems = [
    {
      id: 'home' as ActiveSection,
      label: 'Home',
      icon: Home,
      badge: null,
      isActive: activeSection === 'home'
    },
    {
      id: 'messages' as ActiveSection,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadDMsCount > 0 ? unreadDMsCount : null,
      isActive: activeSection === 'messages'
    },
    {
      id: 'calendar' as ActiveSection,
      label: 'Calendar',
      icon: Calendar,
      badge: null,
      isActive: activeSection === 'calendar'
    },
    {
      id: 'meetings' as ActiveSection,
      label: 'Meetings',
      icon: Video,
      badge: null,
      isActive: activeSection === 'meetings'
    }
  ];

  // Secondary items accessed exclusively through MORE
  const isSecondaryActive = ['channels', 'email', 'files', 'people', 'plugins', 'settings', 'tasks'].includes(activeSection);
  const secondaryUnreadTotal = unreadChannelsCount + unreadEmailsCount;

  const handleSelectNav = (sec: ActiveSection) => {
    onSelectSection(sec);
    setIsMoreMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleSetTheme = (newTheme: 'dark' | 'light' | 'system') => {
    if (onChangeTheme) {
      onChangeTheme(newTheme);
    } else if (onToggleTheme) {
      onToggleTheme();
    }
  };

  return (
    <aside 
      id="primary-navigation-rail"
      aria-label="Primary Navigation"
      className={`hidden md:flex flex-col justify-between h-full max-h-screen py-3 pb-3 border-r bg-white dark:bg-[#0B101B] border-stone-200 dark:border-stone-800 select-none shrink-0 z-30 transition-all duration-200 ease-in-out overflow-hidden ${
        isNavExpanded ? 'w-60 px-3' : 'w-[68px] px-2 items-center'
      }`}
    >
      {/* =========================================================================
          TOP SECTION: BRAND & ESSENTIAL NAV ICONS (SCROLLABLE IF HEIGHT LIMITED)
          ========================================================================= */}
      <div className="flex flex-col space-y-3 w-full min-h-0 flex-1 overflow-y-auto scrollbar-none pb-2">
        
        {/* Brand Header */}
        <div className={`flex items-center ${isNavExpanded ? 'justify-between px-1' : 'justify-center'} w-full`}>
          {isNavExpanded ? (
            <button
              id="nav-org-brand-btn"
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
                <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                  Institutional Workspace
                </span>
              </div>
            </button>
          ) : (
            <button
              id="nav-org-monogram-btn"
              onClick={() => handleSelectNav('home')}
              className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-[#111726] hover:bg-stone-100 dark:hover:bg-[#182238] flex items-center justify-center shadow-xs border border-stone-200/80 dark:border-stone-800 transition-transform active:scale-95 group relative p-1 cursor-pointer"
              title={`${organization?.name || 'WorkNest'} - Home`}
            >
              <WorkNestLogo size="xs" variant="icon" />
              <span className="sr-only">{organization?.name || 'WorkNest'}</span>
            </button>
          )}

          {/* Nav Rail Expand/Collapse Toggle */}
          {(onToggleNavExpanded || onToggleNavExpand) && (
            <button
              id="nav-toggle-expand-btn"
              onClick={onToggleNavExpanded || onToggleNavExpand}
              className={`p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors cursor-pointer ${
                !isNavExpanded ? 'hidden' : ''
              }`}
              title={isNavExpanded ? "Collapse navigation" : "Expand navigation"}
              aria-label={isNavExpanded ? "Collapse navigation" : "Expand navigation"}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Quick Action Button (+) */}
        {onOpenQuickActions && (
          <button
            id="nav-quick-actions-btn"
            onClick={onOpenQuickActions}
            className={`rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer ${
              isNavExpanded 
                ? 'w-full py-2 px-3 space-x-2 text-xs' 
                : 'w-10 h-10 mx-auto'
            }`}
            title="Create New (Message, Channel, Event, Meeting, Dispatch)"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isNavExpanded && <span>New Action</span>}
          </button>
        )}

        <div className={`h-px bg-stone-200/70 dark:bg-stone-800/70 ${isNavExpanded ? 'mx-1' : 'w-7 mx-auto'}`} />

        {/* 1. ESSENTIAL PRIMARY NAVIGATION (HOME, MESSAGES, CALENDAR, MEETINGS) */}
        <nav className="flex flex-col space-y-1 w-full" aria-label="Main Navigation">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelectNav(item.id)}
                className={`flex items-center transition-all relative group cursor-pointer ${
                  isNavExpanded 
                    ? 'w-full px-3 py-2 rounded-xl space-x-3 text-xs justify-between' 
                    : 'w-10 h-10 mx-auto rounded-xl justify-center'
                } ${
                  item.isActive 
                    ? 'bg-blue-50 text-[#0062FF] dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs' 
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60 font-medium'
                }`}
                title={!isNavExpanded ? item.label : undefined}
                aria-current={item.isActive ? 'page' : undefined}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`shrink-0 ${isNavExpanded ? 'w-4 h-4' : 'w-4.5 h-4.5'} ${item.isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]'}`} />
                  {isNavExpanded && (
                    <span className="truncate text-xs tracking-tight">
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Unread Badge */}
                {item.badge !== null && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full bg-[#0062FF] text-[10px] font-bold text-white flex items-center justify-center shrink-0 ${
                    !isNavExpanded ? 'absolute top-1 right-1 min-w-3.5 h-3.5' : ''
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Bar when collapsed */}
                {!isNavExpanded && item.isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-[#0062FF] dark:bg-blue-400" />
                )}
              </button>
            );
          })}

          {/* 2. THE SINGLE "MORE" DESTINATION BUTTON */}
          <div className="relative" ref={moreMenuRef}>
            <button
              id="nav-item-more"
              onClick={() => setIsMoreMenuOpen(prev => !prev)}
              className={`flex items-center transition-all relative group cursor-pointer ${
                isNavExpanded 
                  ? 'w-full px-3 py-2 rounded-xl space-x-3 text-xs justify-between' 
                  : 'w-10 h-10 mx-auto rounded-xl justify-center'
              } ${
                isSecondaryActive || isMoreMenuOpen
                  ? 'bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 font-bold' 
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60 font-medium'
              }`}
              title={!isNavExpanded ? "More Workspaces & Tools" : undefined}
              aria-haspopup="true"
              aria-expanded={isMoreMenuOpen}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Grid className={`shrink-0 ${isNavExpanded ? 'w-4 h-4' : 'w-4.5 h-4.5'} stroke-[1.75px]`} />
                {isNavExpanded && (
                  <span className="truncate text-xs tracking-tight">
                    More
                  </span>
                )}
              </div>

              {secondaryUnreadTotal > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full bg-[#0062FF] text-[10px] font-bold text-white flex items-center justify-center shrink-0 ${
                  !isNavExpanded ? 'absolute top-1 right-1 min-w-3.5 h-3.5' : ''
                }`}>
                  {secondaryUnreadTotal}
                </span>
              )}
            </button>

            {/* ORGANIZED MORE POPUP PANEL - FIXED POSITIONING OUTSIDE OVERFLOW BOUNDARIES */}
            {isMoreMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[0.5px]"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div 
                  id="more-navigation-panel"
                  style={{
                    left: isNavExpanded ? '248px' : '74px',
                    top: '64px'
                  }}
                  className="fixed rounded-2xl bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800 shadow-2xl p-3 z-50 text-xs w-72 max-h-[calc(100vh-6rem)] flex flex-col animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-stone-100 dark:border-stone-800/80 shrink-0">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Workspace Navigation
                    </span>
                    <button 
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto pr-1 scrollbar-thin flex-1 min-h-0">
                    
                    {/* Category 1: Communication */}
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Communication
                      </div>
                      
                      <button
                        id="more-item-channels"
                        onClick={() => handleSelectNav('channels')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                          activeSection === 'channels' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-semibold' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Hash className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>Council Channels</span>
                        </div>
                        {unreadChannelsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#0062FF] text-[9px] font-bold text-white">
                            {unreadChannelsCount}
                          </span>
                        )}
                      </button>

                      <button
                        id="more-item-email"
                        onClick={() => handleSelectNav('email')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                          activeSection === 'email' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-semibold' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>Official Dispatches & Email</span>
                        </div>
                        {unreadEmailsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#0062FF] text-[9px] font-bold text-white">
                            {unreadEmailsCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Category 2: Workspace */}
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Workspace
                      </div>

                      <button
                        id="more-item-tasks"
                        onClick={() => handleSelectNav('tasks')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                          activeSection === 'tasks' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-semibold' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Check className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>Project Tasks & Deliverables</span>
                        </div>
                      </button>

                      <button
                        id="more-item-files"
                        onClick={() => handleSelectNav('files')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                          activeSection === 'files' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-semibold' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <FileText className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>Statutory Documents Vault</span>
                        </div>
                      </button>

                      <button
                        id="more-item-people"
                        onClick={() => handleSelectNav('people')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                          activeSection === 'people' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-semibold' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Users className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>Staff Directory & Roster</span>
                        </div>
                      </button>
                    </div>

                    {/* Category 3: Tools */}
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Tools
                      </div>

                      <button
                        id="more-item-translate"
                        onClick={() => handleSelectNav('plugins')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                          activeSection === 'plugins' || (activeSection as any) === 'translate'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-semibold' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Languages className="w-4 h-4 text-[#0062FF] shrink-0" />
                          <span>Language Translate</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-medium">
                          Neural
                        </span>
                      </button>

                      {onOpenSearch && (
                        <button
                          id="more-item-search"
                          onClick={() => {
                            setIsMoreMenuOpen(false);
                            onOpenSearch();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Search className="w-4 h-4 text-stone-500 shrink-0" />
                            <span>Global Workspace Search</span>
                          </div>
                          <span className="text-[10px] text-stone-400">⌘K</span>
                        </button>
                      )}
                    </div>

                    {/* Category 4: System */}
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        System
                      </div>

                      {onOpenNotifications && (
                        <button
                          id="more-item-notifications"
                          onClick={() => {
                            setIsMoreMenuOpen(false);
                            onOpenNotifications();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Bell className="w-4 h-4 text-stone-500 shrink-0" />
                            <span>Notifications & Alerts</span>
                          </div>
                          {unreadNotificationsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-bold text-white">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </button>
                      )}

                      <button
                        id="more-item-settings"
                        onClick={() => handleSelectNav('settings')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                          activeSection === 'settings' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-semibold' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Settings className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>Settings & Governance</span>
                        </div>
                      </button>
                    </div>

                    {/* Category 5: Administration (if authorized) */}
                    {isAdmin && (
                      <div className="pt-1 border-t border-stone-100 dark:border-stone-800/80 space-y-1">
                        <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Administration
                        </div>

                        <button
                          id="more-item-admin"
                          onClick={() => handleSelectNav('settings')}
                          className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left text-stone-700 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="font-semibold text-xs">Admin Governance Panel</span>
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* =========================================================================
          3. BOTTOM SECTION: ONLY PROFILE (NOTHING ELSE)
          ========================================================================= */}
      <div className="flex flex-col items-center w-full pt-2.5 pb-1 border-t border-stone-200/80 dark:border-stone-800 shrink-0" ref={profileMenuRef}>
        
        {/* User Avatar Button */}
        <div className="relative w-full">
          <button
            id="nav-user-avatar-btn"
            onClick={() => {
              setIsProfileMenuOpen(prev => !prev);
              setShowAppearanceSubmenu(false);
            }}
            className={`rounded-xl transition-all flex items-center cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800/80 ${
              isNavExpanded 
                ? 'w-full p-2 space-x-2.5 justify-between text-left' 
                : 'w-10 h-10 mx-auto justify-center'
            }`}
            title={`${user.name} (${user.role}) - Open Profile Menu`}
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <UserAvatar
                member={user}
                size={isNavExpanded ? "sm" : "md"}
                showStatus={true}
                shape="rounded"
              />
              {isNavExpanded && (
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-stone-400 truncate">
                    {user.role} • {user.status}
                  </span>
                </div>
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
