import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Plus, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Check, 
  Laptop,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  ActiveSection, 
  Channel,
  DirectMessage,
  Member, 
  OrganizationSettings, 
  UserStatus 
} from '../../types';
import { WorkNestLogo } from '../WorkNestLogo';
import { UserAvatar } from '../UserAvatar';
import { 
  getNavGroups, 
  NavItem, 
  NavigationCounts 
} from '../../config/navigation';

interface SidebarProps {
  activeSection: ActiveSection;
  activeTaskFilterTab?: 'all' | 'my_tasks' | 'urgent';
  onSelectSection: (section: ActiveSection, filterTab?: 'all' | 'my_tasks' | 'urgent') => void;
  currentUser?: Member | null;
  organization?: OrganizationSettings;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenQuickActions?: () => void;
  counts?: NavigationCounts;
  channels?: Channel[];
  activeChannel?: Channel | null;
  onSelectChannel?: (channel: Channel) => void;
  onOpenCreateChannel?: () => void;
  directMessages?: DirectMessage[];
  activeDM?: DirectMessage | null;
  onSelectDM?: (dm: DirectMessage) => void;
  onOpenCreateDM?: () => void;
  theme?: 'dark' | 'light' | 'system';
  onToggleTheme?: () => void;
  onChangeTheme?: (theme: 'dark' | 'light' | 'system') => void;
  onUpdateStatus?: (status: UserStatus) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  activeTaskFilterTab = 'all',
  onSelectSection,
  currentUser,
  organization,
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
  onOpenQuickActions,
  counts = {},
  channels = [],
  activeChannel = null,
  onSelectChannel,
  onOpenCreateChannel,
  directMessages = [],
  activeDM = null,
  onSelectDM,
  onOpenCreateDM,
  theme = 'dark',
  onToggleTheme,
  onChangeTheme,
  onUpdateStatus,
  onLogout
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
        setShowAppearanceMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setShowAppearanceMenu(false);
        if (isOpenMobile && onCloseMobile) {
          onCloseMobile();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpenMobile, onCloseMobile]);

  // Lock body scroll on mobile drawer open
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpenMobile]);

  // Authenticated user data fallback
  const user = currentUser || {
    id: 'usr_default',
    name: 'System Administrator',
    email: 'admin@worknest.internal',
    role: 'Admin',
    department: 'Administration',
    avatar: '',
    status: 'online' as UserStatus,
    isVerifiedGov: true
  };

  // Compute navigation groups with RBAC and counts
  const navGroups = useMemo(() => {
    return getNavGroups(user.role, counts);
  }, [user.role, counts]);

  const handleNavItemClick = (item: NavItem) => {
    onSelectSection(item.section, item.filterTab);
    if (isOpenMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.id === 'my_work') {
      return activeSection === 'tasks' && activeTaskFilterTab === 'my_tasks';
    }
    if (item.id === 'work') {
      return (activeSection === 'tasks' && activeTaskFilterTab !== 'my_tasks') || (activeSection as string) === 'work';
    }
    return activeSection === item.section;
  };

  const renderBadge = (badge: number | string | null | undefined, variant: string = 'neutral') => {
    if (!badge && badge !== 0) return null;
    if (typeof badge === 'number' && badge <= 0) return null;

    let badgeClasses = 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800';
    if (variant === 'primary') {
      badgeClasses = 'text-white bg-[#0062FF] font-bold';
    } else if (variant === 'warning') {
      badgeClasses = 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 font-semibold';
    } else if (variant === 'live') {
      badgeClasses = 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 font-bold uppercase tracking-wider animate-pulse';
    }

    return (
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono shrink-0 ml-auto ${badgeClasses}`}>
        {badge}
      </span>
    );
  };

  // Sidebar content (shared across desktop expanded/collapsed and mobile drawer)
  const sidebarContent = (
    <div className="flex flex-col h-full w-full justify-between select-none overflow-hidden">
      
      {/* Top Header & New Action */}
      <div className="p-3 sm:p-4 shrink-0 space-y-3 sm:space-y-4">
        {/* Workspace Brand / Collapse Header */}
        <div className={`flex items-center justify-between min-h-[42px] ${isCollapsed && !isOpenMobile ? 'justify-center' : ''}`}>
          {(!isCollapsed || isOpenMobile) ? (
            <div className="flex items-center space-x-2.5 min-w-0">
              <WorkNestLogo size="sm" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-[15px] tracking-tight truncate">
                    WorkNest
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wide uppercase bg-[#0062FF] text-white">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 font-normal truncate">
                  Digital Workspace
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center" title="WorkNest PRO Digital Workspace">
              <WorkNestLogo size="sm" />
            </div>
          )}

          {/* Desktop Collapse / Expand Button */}
          {!isOpenMobile && onToggleCollapse && (
            <button
              id="sidebar-collapse-toggle-btn"
              data-testid="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0 ${
                isCollapsed ? 'mt-2' : ''
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4.5 h-4.5 stroke-[1.8]" />
              ) : (
                <PanelLeftClose className="w-4.5 h-4.5 stroke-[1.8]" />
              )}
            </button>
          )}

          {/* Mobile Drawer Close Button */}
          {isOpenMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              title="Close navigation drawer"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary "+ New Action" Button */}
        {(!isCollapsed || isOpenMobile) ? (
          <button
            id="sidebar-new-action-btn"
            data-testid="sidebar-new-action-btn"
            onClick={onOpenQuickActions}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0062FF] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0062FF]/50"
            title="Create New Action (Work, Task, Deliverable, Milestone)"
            aria-label="Create New Action"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Action</span>
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              id="sidebar-new-action-icon-btn"
              data-testid="sidebar-new-action-icon-btn"
              onClick={onOpenQuickActions}
              className="w-10 h-10 rounded-xl bg-[#0062FF] hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0062FF]/50"
              title="New Action"
              aria-label="New Action"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Groups List (Independently Scrollable) */}
      <nav 
        aria-label="Workspace Navigation"
        className="flex-1 overflow-y-auto px-2 sm:px-3 py-1 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800"
      >
        {navGroups.map((group) => {
          if (group.items.length === 0) return null;

          return (
            <div key={group.id} className="space-y-0.5">
              {/* Group Title */}
              {(!isCollapsed || isOpenMobile) && (
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 select-none">
                  {group.label}
                </div>
              )}

              {/* Group Nav Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;

                  if (isCollapsed && !isOpenMobile) {
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        data-testid={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavItemClick(item)}
                        className={`w-full h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer relative group ${
                          active
                            ? 'bg-[#EBF3FF] dark:bg-blue-950/50 text-[#0062FF] dark:text-blue-400 font-semibold'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                        title={item.label}
                        aria-label={item.label}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className={`w-5 h-5 stroke-[1.8] ${active ? 'text-[#0062FF] dark:text-blue-400' : ''}`} />
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0062FF]" />
                        )}
                      </button>
                    );
                  }

                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        id={`sidebar-nav-${item.id}`}
                        data-testid={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavItemClick(item)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[13px] sm:text-sm font-medium transition-all cursor-pointer text-left ${
                          active
                            ? 'bg-[#EBF3FF] dark:bg-blue-950/50 text-[#0062FF] dark:text-blue-400 font-medium'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className={`w-4.5 h-4.5 shrink-0 stroke-[1.8] ${
                          active ? 'text-[#0062FF] dark:text-blue-400' : 'text-stone-500 dark:text-stone-400'
                        }`} />
                        <span className="truncate">{item.label}</span>
                        {renderBadge(item.badge, item.badgeVariant)}
                      </button>

                      {/* Contextual Sub-channels List */}
                      {item.id === 'channels' && activeSection === 'channels' && channels.length > 0 && (
                        <div className="pl-6 pr-1 py-1 space-y-0.5 animate-in fade-in duration-150">
                          {channels.slice(0, 8).map((chan) => (
                            <button
                              key={chan.id}
                              onClick={() => {
                                if (onSelectChannel) onSelectChannel(chan);
                                if (isOpenMobile && onCloseMobile) onCloseMobile();
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer truncate ${
                                activeChannel?.id === chan.id
                                  ? 'bg-blue-100/70 dark:bg-blue-900/40 text-[#0062FF] dark:text-blue-300 font-semibold'
                                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900'
                              }`}
                            >
                              <span className="truncate">#{chan.name}</span>
                              {chan.unreadCount && chan.unreadCount > 0 ? (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0062FF] text-white font-mono shrink-0 ml-1">
                                  {chan.unreadCount}
                                </span>
                              ) : null}
                            </button>
                          ))}
                          {onOpenCreateChannel && (
                            <button
                              onClick={onOpenCreateChannel}
                              className="w-full flex items-center space-x-1.5 px-2.5 py-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>New Channel</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Contextual Sub-DMs List */}
                      {item.id === 'messages' && activeSection === 'messages' && directMessages.length > 0 && (
                        <div className="pl-6 pr-1 py-1 space-y-0.5 animate-in fade-in duration-150">
                          {directMessages.slice(0, 8).map((dm) => {
                            const other = dm.participants?.find(p => p.id !== user.id) || dm.participants?.[0] || { name: 'Officer' };
                            return (
                              <button
                                key={dm.id}
                                onClick={() => {
                                  if (onSelectDM) onSelectDM(dm);
                                  if (isOpenMobile && onCloseMobile) onCloseMobile();
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer truncate ${
                                  activeDM?.id === dm.id
                                    ? 'bg-blue-100/70 dark:bg-blue-900/40 text-[#0062FF] dark:text-blue-300 font-semibold'
                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900'
                                }`}
                              >
                                <span className="truncate">@{other.name}</span>
                                {dm.unreadCount && dm.unreadCount > 0 ? (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0062FF] text-white font-mono shrink-0 ml-1">
                                    {dm.unreadCount}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                          {onOpenCreateDM && (
                            <button
                              onClick={onOpenCreateDM}
                              className="w-full flex items-center space-x-1.5 px-2.5 py-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>New Message</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom User Profile Section & Compact Menu */}
      <div className="p-2 sm:p-3 border-t border-stone-200 dark:border-stone-800 shrink-0 relative" ref={profileMenuRef}>
        <button
          id="sidebar-user-profile-btn"
          data-testid="sidebar-user-profile-btn"
          onClick={() => setIsProfileMenuOpen(prev => !prev)}
          className={`w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors cursor-pointer text-left focus:outline-none ${
            isCollapsed && !isOpenMobile ? 'justify-center p-1' : ''
          }`}
          title={`${user.name} (${user.role}) - Click for profile & settings`}
          aria-label="User Profile and Settings"
          aria-expanded={isProfileMenuOpen}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="shrink-0">
              <UserAvatar
                user={user}
                size="md"
                showStatus={true}
                shape="rounded"
              />
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <div className="flex flex-col min-w-0 truncate">
                <span className="font-semibold text-stone-900 dark:text-stone-100 text-[13px] truncate">
                  {user.name}
                </span>
                <div className="flex items-center space-x-1.5 text-[11px] text-stone-400 dark:text-stone-500 font-normal">
                  <span className="capitalize">{user.role || 'Member'}</span>
                  <span>•</span>
                  <span className="capitalize text-emerald-600 dark:text-emerald-400 font-medium">{user.status || 'online'}</span>
                </div>
              </div>
            )}
          </div>

          {(!isCollapsed || isOpenMobile) && (
            <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" />
          )}
        </button>

        {/* Compact User Menu Popover */}
        {isProfileMenuOpen && (
          <div 
            id="sidebar-user-menu-popover"
            data-testid="sidebar-user-menu-popover"
            className={`absolute bottom-full mb-2 w-64 rounded-2xl bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800 shadow-xl z-50 py-1.5 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150 ${
              isCollapsed && !isOpenMobile ? 'left-2' : 'left-2 right-2'
            }`}
          >
            {/* Header / Identity Info */}
            <div className="px-3.5 py-2.5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30">
              <p className="font-bold text-stone-900 dark:text-stone-100 truncate text-[13px]">{user.name}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
              <div className="mt-1.5 flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-[#0062FF] dark:text-blue-400">
                  {user.role} Tier
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  GovNet Verified
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={() => {
                  onSelectSection('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-left"
              >
                <span>Governance & Settings</span>
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => setShowAppearanceMenu(prev => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-left"
              >
                <span>Appearance & Theme</span>
                <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform ${showAppearanceMenu ? 'rotate-90' : ''}`} />
              </button>

              {/* Nested Theme Selector */}
              {showAppearanceMenu && (
                <div className="px-3.5 py-1.5 bg-stone-50 dark:bg-stone-900/50 space-y-1">
                  <button
                    onClick={() => {
                      if (onChangeTheme) onChangeTheme('light');
                      else if (onToggleTheme) onToggleTheme();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      theme === 'light' ? 'bg-stone-200/80 dark:bg-stone-800 text-[#0062FF] font-semibold' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </div>
                    {theme === 'light' && <Check className="w-3.5 h-3.5 text-[#0062FF]" />}
                  </button>

                  <button
                    onClick={() => {
                      if (onChangeTheme) onChangeTheme('dark');
                      else if (onToggleTheme) onToggleTheme();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      theme === 'dark' ? 'bg-stone-200/80 dark:bg-stone-800 text-[#0062FF] font-semibold' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </div>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5 text-[#0062FF]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Sign Out */}
            {onLogout && (
              <div className="pt-1 border-t border-stone-100 dark:border-stone-800/80">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of WorkNest</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside
        id="desktop-global-sidebar"
        data-testid="desktop-global-sidebar"
        className={`hidden md:flex flex-col h-full bg-white dark:bg-[#0B101B] border-r border-stone-200 dark:border-stone-800 shrink-0 z-30 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
        aria-label="Desktop Global Navigation Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* 2. Responsive Mobile Off-Canvas Drawer */}
      {isOpenMobile && (
        <div 
          id="mobile-drawer-portal"
          data-testid="mobile-drawer-portal"
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Canvas */}
          <div 
            className="relative flex-1 flex flex-col max-w-[300px] w-full bg-white dark:bg-[#0B101B] border-r border-stone-200 dark:border-stone-800 shadow-2xl z-10 transition-transform duration-200"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
