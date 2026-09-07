import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  ChevronRight, 
  Check, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeftOpen,
  Plus,
  Home,
  MessageSquare,
  Calendar,
  Video,
  CheckSquare,
  Hash,
  FileText,
  Mail
} from 'lucide-react';
import { 
  ActiveSection, 
  Channel, 
  DirectMessage, 
  Member, 
  NotificationItem, 
  OrganizationSettings, 
  UserStatus 
} from '../types';
import { WorkNestLogo } from './WorkNestLogo';
import { UserAvatar } from './UserAvatar';

interface TopHeaderProps {
  organization?: OrganizationSettings;
  activeSection?: ActiveSection;
  activeChannel?: Channel | null;
  activeDM?: DirectMessage | null;
  activeEmailFolder?: string;
  activeSettingsTab?: string;
  currentUser?: Member | null;
  notifications?: NotificationItem[];
  unreadNotifications?: NotificationItem[];
  isConnected?: boolean;
  theme?: 'dark' | 'light' | 'system';
  onToggleTheme?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onToggleConnection?: () => void;
  onOpenSearch?: () => void;
  onOpenQuickActions?: () => void;
  onClearNotifications?: () => void;
  onToggleMobileMenu?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileMenuOpen?: boolean;
  onUpdateUserStatus?: (status: UserStatus) => void;
  onUpdateStatus?: (status: UserStatus) => void;
  onSelectNotification?: (notif: NotificationItem) => void;
  onMarkAllNotificationsRead?: () => void;
  onSignOut?: () => void;
  onLogout?: () => void;
  onSelectSection?: (sec: ActiveSection) => void;
  unreadChannelsCount?: number;
  unreadDMsCount?: number;
  unreadEmailsCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
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
  activeSection = 'home',
  activeChannel = null,
  activeDM = null,
  currentUser,
  notifications = [],
  unreadNotifications = [],
  isConnected = true,
  theme = 'dark',
  onToggleTheme,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onOpenSearch,
  onOpenQuickActions,
  onClearNotifications,
  onToggleMobileMenu,
  onToggleMobileSidebar,
  isMobileMenuOpen = false,
  onUpdateUserStatus,
  onUpdateStatus,
  onSelectNotification,
  onMarkAllNotificationsRead,
  onSignOut,
  onLogout,
  onSelectSection,
  unreadChannelsCount = 0,
  unreadDMsCount = 0,
  unreadEmailsCount = 0
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const topNavTabs: { id: ActiveSection; label: string; icon: any; badge?: number }[] = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'channels', label: 'Channels', icon: Hash, badge: unreadChannelsCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadDMsCount },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'files', label: 'Vault', icon: FileText },
    { id: 'email', label: 'Dispatches', icon: Mail, badge: unreadEmailsCount },
  ];

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleStatusChange = (status: UserStatus) => {
    if (onUpdateUserStatus) onUpdateUserStatus(status);
    if (onUpdateStatus) onUpdateStatus(status);
  };

  const handleMobileToggle = () => {
    if (onToggleMobileSidebar) onToggleMobileSidebar();
    if (onToggleMobileMenu) onToggleMobileMenu();
  };

  const handleLogoutAction = () => {
    setShowUserMenu(false);
    if (onLogout) onLogout();
    if (onSignOut) onSignOut();
  };

  const getBreadcrumb = () => {
    switch (activeSection) {
      case 'home':
        return 'Executive Overview & Briefings';
      case 'tasks':
        return 'Tasks & Deliverables';
      case 'channels':
        return activeChannel ? `#${activeChannel.name}` : 'Council Channels';
      case 'messages':
        if (activeDM) {
          const participants = activeDM.participants || [];
          const other = participants.find(p => p.id !== currentUser?.id) || participants[0] || { name: 'Staff Member' };
          return `@${other.name}`;
        }
        return 'Direct Staff Lines';
      case 'calendar':
        return 'Calendar & Deliberations';
      case 'meetings':
        return 'Video Calls & Council Chambers';
      case 'email':
        return 'Official Government Email';
      case 'plugins':
        return 'Integrations & Extensions';
      case 'files':
        return 'Statutory Gazettes & Vault';
      case 'people':
        return 'Staff Directory';
      case 'settings':
        return 'Organization Governance & Settings';
      default:
        return 'Workspace';
    }
  };

  const statusColors: Record<UserStatus, string> = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
    offline: 'bg-stone-400'
  };

  const safeNotifications = Array.isArray(notifications) && notifications.length > 0
    ? notifications
    : (Array.isArray(unreadNotifications) ? unreadNotifications : []);
  const unreadCount = safeNotifications.filter(n => n && !n.isRead).length;

  return (
    <header 
      id="top-header"
      className="h-14 w-full border-b bg-white dark:bg-[#0F172A] border-stone-200 dark:border-stone-800/80 px-2 sm:px-4 flex items-center justify-between select-none shrink-0 z-20 transition-colors gap-1.5 sm:gap-3 relative"
    >
      {/* Left: Mobile Drawer Trigger, Desktop Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0 shrink">
        
        {/* Mobile menu burger */}
        <button
          id="mobile-nav-toggle-btn"
          onClick={handleMobileToggle}
          className="md:hidden p-1.5 -ml-1 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-none shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop Sidebar Collapse / Expand Toggle Button */}
        {onToggleSidebarCollapse && (
          <button
            id="topbar-sidebar-toggle-btn"
            onClick={onToggleSidebarCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? "Expand side navigation" : "Collapse side navigation (focus mode)"}
            aria-label={isSidebarCollapsed ? "Expand side navigation" : "Collapse side navigation"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4.5 h-4.5" />
            ) : (
              <PanelLeftClose className="w-4.5 h-4.5" />
            )}
          </button>
        )}

        {/* Mobile WorkNest Logo */}
        <div className="md:hidden flex items-center shrink-0">
          <WorkNestLogo size="xs" />
        </div>

        {/* Workspace Title & Current View Path */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0 text-xs truncate">
          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate hidden md:inline">
            {organization?.name || 'WorkNest'}
          </span>
          <span className="text-stone-400 hidden md:inline">/</span>
          <span className="font-medium text-[#0062FF] dark:text-blue-400 truncate text-[11px] sm:text-xs">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Primary Horizontal Navbar (for xl+ screens: all 8 items; for lg screens: top items) */}
      {onSelectSection && (
        <nav 
          id="top-horizontal-navbar" 
          aria-label="Top Primary Navigation" 
          className="hidden xl:flex items-center space-x-1 shrink-0 ml-1 mr-2"
        >
          {topNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                id={`top-nav-tab-${tab.id}`}
                onClick={() => onSelectSection(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0062FF] text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                }`}
                title={tab.label}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#0062FF] text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Compact Switcher for lg screens */}
      {onSelectSection && (
        <nav 
          id="top-compact-navbar" 
          aria-label="Compact Horizontal Navigation" 
          className="hidden lg:flex xl:hidden items-center space-x-1 shrink-0 ml-1 mr-2"
        >
          {topNavTabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                id={`top-compact-tab-${tab.id}`}
                onClick={() => onSelectSection(tab.id)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0062FF] text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                }`}
                title={tab.label}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-3 min-w-0 flex justify-center">
        <button
          id="global-search-trigger"
          onClick={onOpenSearch}
          className="w-full max-w-sm flex items-center justify-between px-2 sm:px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900/60 dark:hover:bg-stone-800/80 text-stone-500 dark:text-stone-400 text-xs transition-colors shadow-2xs min-w-0 cursor-pointer"
          title="Search messages, channels, gazettes, or staff (Cmd+K)"
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 truncate min-w-0">
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate hidden sm:inline">Search WorkNest directives, files, staff...</span>
            <span className="truncate sm:hidden text-[11px]">Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0 ml-1">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action, Dark Mode Toggle, Notifications, Gateway Badge, Profile */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        
        {/* Global Quick Action Create Button */}
        {onOpenQuickActions && (
          <button
            id="topbar-quick-action-btn"
            onClick={onOpenQuickActions}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 sm:space-x-1.5 cursor-pointer shrink-0"
            title="Create New..."
            aria-label="Create New Action"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        )}

        {/* Dark Mode Toggle Button */}
        {onToggleTheme && (
          <button
            id="topbar-theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-xl text-stone-500 hover:text-amber-500 dark:hover:text-amber-300 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-600" />
            )}
          </button>
        )}

        {/* Notifications Dropdown Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-dropdown-btn"
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-1.5 sm:p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative cursor-pointer shrink-0"
            title="Notifications & Directives"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0062FF] ring-2 ring-white dark:ring-[#0F172A]" />
            )}
          </button>

          {/* Notifications Modal Popup */}
          {showNotifications && (
            <div className="fixed inset-x-2 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 md:w-96 rounded-2xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-800 shadow-2xl z-50 overflow-hidden text-xs max-h-[80vh] flex flex-col">
              <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/40 shrink-0">
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                  <span>Directives & Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {onClearNotifications && safeNotifications.length > 0 && (
                  <button
                    onClick={() => {
                      onClearNotifications();
                      if (onMarkAllNotificationsRead) onMarkAllNotificationsRead();
                    }}
                    className="text-[11px] text-[#0062FF] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80 p-1">
                {safeNotifications.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 space-y-1">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-stone-300 dark:text-stone-600" />
                    <p className="text-xs">No pending directives or notifications.</p>
                  </div>
                ) : (
                  safeNotifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (onSelectNotification) onSelectNotification(notif);
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer space-y-1 ${
                        !notif.isRead ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {notif.title}
                        </span>
                        <span className="text-stone-400 text-[10px]">{notif.timestamp}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                        {notif.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar Button */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="topbar-user-avatar-btn"
            onClick={() => setShowUserMenu(prev => !prev)}
            className="flex items-center space-x-1 p-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus:outline-none cursor-pointer shrink-0"
            title={`${currentUser?.name || 'Officer'} Profile`}
            aria-label="User Profile"
            aria-expanded={showUserMenu}
          >
            <UserAvatar
              member={currentUser}
              size="sm"
              showStatus={true}
              shape="rounded"
            />
            <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
          </button>

          {/* User Quick Modal */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 sm:w-56 max-w-[calc(100vw-1rem)] rounded-2xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-800 shadow-2xl py-2 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800">
                <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                  {currentUser?.name || 'Public Officer'}
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  {currentUser?.email || ''}
                </div>
                <div className="inline-flex items-center space-x-1 mt-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{currentUser?.role || 'Admin'}</span>
                </div>
              </div>

              <div className="py-1">
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Status
                </div>
                {(['online', 'busy', 'away', 'offline'] as UserStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      handleStatusChange(status);
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left capitalize text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                      <span>{status}</span>
                    </div>
                    {currentUser?.status === status && <Check className="w-3.5 h-3.5 text-[#0062FF]" />}
                  </button>
                ))}
              </div>

              {onToggleTheme && (
                <div className="py-1 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => {
                      onToggleTheme();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-600" />}
                      <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                    </div>
                  </button>
                </div>
              )}

              <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={handleLogoutAction}
                  className="w-full px-3.5 py-2 flex items-center space-x-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
