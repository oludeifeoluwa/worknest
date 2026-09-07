import React, { useState, useMemo } from 'react';
import { 
  Hash, 
  Lock, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Inbox, 
  Star, 
  Send, 
  FileText, 
  Archive, 
  Trash2, 
  Users, 
  Calendar, 
  Video, 
  FileCheck,
  CheckCircle2,
  Globe,
  UserPlus,
  Radio,
  Building2,
  ShieldCheck,
  FolderKanban,
  X,
  MessageSquare,
  PanelLeftClose,
  SlidersHorizontal,
  Mail,
  Folder,
  Cloud,
  Compass,
  Clock,
  LayoutGrid,
  Filter,
  Check,
  ExternalLink,
  Layers,
  Palette,
  Bell,
  AlertTriangle,
  CheckSquare,
  ListTodo,
  Languages,
  Puzzle,
  TrendingUp,
  Briefcase,
  Activity
} from 'lucide-react';
import { 
  ActiveSection, 
  Channel, 
  DirectMessage, 
  Member, 
  MailFolder, 
  FileFolder, 
  OrganizationSettings,
  TaskItem,
  ProjectDeliverable,
  TaskStatus,
  TaskPriority
} from '../types';
import { UserAvatar } from './UserAvatar';

interface ContextualSidebarProps {
  activeSection: ActiveSection;
  organization?: OrganizationSettings;
  // Channels
  channels?: Channel[];
  activeChannel?: Channel | null;
  activeChannelId?: string;
  onSelectChannel?: (chan: Channel) => void;
  onOpenNewChannel?: () => void;
  onOpenCreateChannel?: () => void;
  onOpenChannelBrowser?: () => void;
  favoriteChannelIds?: string[];
  onToggleFavoriteChannel?: (channelId: string) => void;
  // Direct Messages
  directMessages?: DirectMessage[];
  activeDM?: DirectMessage | null;
  activeDMId?: string;
  onSelectDM?: (dm: DirectMessage) => void;
  onOpenNewDM?: () => void;
  onOpenCreateDM?: () => void;
  favoriteDMIds?: string[];
  onToggleFavoriteDM?: (dmId: string) => void;
  // Tasks
  tasks?: TaskItem[];
  deliverables?: ProjectDeliverable[];
  activeTaskFilterTab?: 'all' | 'my_tasks' | 'urgent';
  onSelectTaskFilterTab?: (tab: 'all' | 'my_tasks' | 'urgent') => void;
  activeTaskDeliverableId?: string;
  onSelectTaskDeliverableId?: (delivId: string) => void;
  activeTaskPriority?: string;
  onSelectTaskPriority?: (priority: string) => void;
  onOpenCreateTask?: () => void;
  // Home
  activeHomeTab?: string;
  onSelectHomeTab?: (tab: string) => void;
  // Plugins
  plugins?: any[];
  activePluginCategory?: string;
  onSelectPluginCategory?: (category: string) => void;
  // Email
  activeEmailFolder?: MailFolder;
  activeMailFolder?: MailFolder;
  onSelectEmailFolder?: (folder: MailFolder) => void;
  onSelectMailFolder?: (folder: MailFolder) => void;
  onOpenComposeEmail?: () => void;
  unreadEmailsCount?: number;
  // Files
  fileFolders?: FileFolder[];
  folders?: FileFolder[];
  activeFileFilter?: string;
  onSelectFileFilter?: (filter: string) => void;
  onOpenUploadFile?: () => void;
  // People
  activeDepartmentFilter?: string;
  onSelectDepartmentFilter?: (dept: string) => void;
  members?: Member[];
  currentUser?: Member | null;
  // Settings
  activeSettingsTab?: string;
  onSelectSettingsTab?: (tab: string) => void;
  // Calendar / Meetings sub-views
  activeCalendarView?: string;
  onSelectCalendarView?: (view: string) => void;
  onOpenScheduleEvent?: () => void;
  onOpenStartMeeting?: () => void;
  // Collapsing controls
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  // Mobile drawer controls
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onNavigateToSection?: (section: ActiveSection) => void;
}

export const ContextualSidebar: React.FC<ContextualSidebarProps> = ({
  activeSection,
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
  channels = [],
  activeChannel,
  activeChannelId,
  onSelectChannel,
  onOpenNewChannel,
  onOpenCreateChannel,
  onOpenChannelBrowser,
  favoriteChannelIds = [],
  onToggleFavoriteChannel,
  directMessages = [],
  activeDM,
  activeDMId,
  onSelectDM,
  onOpenNewDM,
  onOpenCreateDM,
  favoriteDMIds = [],
  onToggleFavoriteDM,
  tasks = [],
  deliverables = [],
  activeTaskFilterTab = 'all',
  onSelectTaskFilterTab,
  activeTaskDeliverableId = 'all',
  onSelectTaskDeliverableId,
  activeTaskPriority = 'all',
  onSelectTaskPriority,
  onOpenCreateTask,
  activeHomeTab = 'today',
  onSelectHomeTab,
  plugins = [],
  activePluginCategory = 'All',
  onSelectPluginCategory,
  activeEmailFolder,
  activeMailFolder,
  onSelectEmailFolder,
  onSelectMailFolder,
  onOpenComposeEmail,
  unreadEmailsCount = 0,
  fileFolders,
  folders = [],
  activeFileFilter = 'all',
  onSelectFileFilter,
  onOpenUploadFile,
  activeDepartmentFilter = 'All Departments',
  onSelectDepartmentFilter,
  members = [],
  currentUser,
  activeSettingsTab = 'profile',
  onSelectSettingsTab,
  activeCalendarView = 'calendar',
  onSelectCalendarView,
  onOpenScheduleEvent,
  onOpenStartMeeting,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  isOpenMobile = false,
  onCloseMobile,
  onNavigateToSection
}) => {
  // Local filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [messagesFilter, setMessagesFilter] = useState<'recent' | 'unread' | 'starred'>('recent');
  const [isMoreFoldersOpen, setIsMoreFoldersOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const safeChannels = Array.isArray(channels) ? channels : [];
  const safeDMs = Array.isArray(directMessages) ? directMessages : [];
  const safeMembers = Array.isArray(members) ? members : [];
  const currentMailFolder: MailFolder = activeEmailFolder || activeMailFolder || 'inbox';

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleCreateChannel = () => {
    if (onCloseMobile) onCloseMobile();
    if (onOpenCreateChannel) onOpenCreateChannel();
    else if (onOpenNewChannel) onOpenNewChannel();
  };

  const handleCreateDM = () => {
    if (onCloseMobile) onCloseMobile();
    if (onOpenCreateDM) onOpenCreateDM();
    else if (onOpenNewDM) onOpenNewDM();
  };

  const handleChannelSelect = (chan: Channel) => {
    if (onSelectChannel) onSelectChannel(chan);
    if (onCloseMobile) onCloseMobile();
  };

  const handleDMSelect = (dm: DirectMessage) => {
    if (onSelectDM) onSelectDM(dm);
    if (onCloseMobile) onCloseMobile();
  };

  const handleMailFolderSelect = (folder: MailFolder) => {
    if (onSelectEmailFolder) onSelectEmailFolder(folder);
    if (onSelectMailFolder) onSelectMailFolder(folder);
    if (onCloseMobile) onCloseMobile();
  };

  const handleFileFilterSelect = (filter: string) => {
    if (onSelectFileFilter) onSelectFileFilter(filter);
    if (onCloseMobile) onCloseMobile();
  };

  const handleDeptFilterSelect = (dept: string) => {
    if (onSelectDepartmentFilter) onSelectDepartmentFilter(dept);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSettingsTabSelect = (tab: string) => {
    if (onSelectSettingsTab) onSelectSettingsTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  // Group channels by category for Channels View
  const channelCategories = useMemo(() => {
    const groups: Record<string, Channel[]> = {
      'Organization': [],
      'Departments': [],
      'Projects': [],
      'General': []
    };

    safeChannels.forEach(chan => {
      if (!chan) return;
      const cat = chan.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(chan);
    });

    return groups;
  }, [safeChannels]);

  // Favorite and recent channels
  const favoriteChannels = useMemo(() => {
    return safeChannels.filter(c => favoriteChannelIds.includes(c.id));
  }, [safeChannels, favoriteChannelIds]);

  const recentChannels = useMemo(() => {
    return safeChannels.slice(0, 4);
  }, [safeChannels]);

  // Filtered DMs
  const filteredDMs = useMemo(() => {
    let result = safeDMs;
    if (searchQuery.trim()) {
      result = result.filter(dm => {
        const other = (dm.participants || []).find(p => p.id !== currentUser?.id) || dm.participants?.[0];
        return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    if (messagesFilter === 'unread') {
      result = result.filter(dm => (dm.unreadCount || 0) > 0);
    } else if (messagesFilter === 'starred') {
      result = result.filter(dm => favoriteDMIds.includes(dm.id));
    }
    return result;
  }, [safeDMs, searchQuery, messagesFilter, currentUser, favoriteDMIds]);

  const selectedChanId = activeChannel?.id || activeChannelId || safeChannels[0]?.id;
  const selectedDMId = activeDM?.id || activeDMId || safeDMs[0]?.id;

  // If user collapsed secondary sidebar and it's not mobile drawer, hide on desktop
  if (isSidebarCollapsed && !isOpenMobile) {
    return null;
  }

  // Home view does not need persistent secondary clutter on desktop unless on mobile
  if (activeSection === 'home' && !isOpenMobile && isSidebarCollapsed) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside 
        id="contextual-secondary-sidebar"
        aria-label="Secondary Navigation"
        className={`w-72 sm:w-64 md:w-60 lg:w-64 max-w-[85vw] h-full border-r bg-[#F8FAFC] dark:bg-[#0B101B] border-stone-200 dark:border-stone-800/80 flex flex-col select-none shrink-0 transition-transform duration-200 ease-in-out ${
          isOpenMobile 
            ? 'fixed inset-y-0 left-0 z-50 flex shadow-2xl md:relative md:shadow-none translate-x-0' 
            : 'hidden md:flex'
        }`}
      >
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F172A]">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#0062FF]" />
            <span className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
              {organization?.name || 'WorkNest'}
            </span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            1. MESSAGES VIEW (DIRECT LINES & DIRECT MESSAGES)
            ========================================================================= */}
        {activeSection === 'messages' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header & New DM Action */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between bg-white/60 dark:bg-[#0E1524]">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Direct Messages
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Staff communications</p>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  id="btn-sidebar-create-dm"
                  onClick={handleCreateDM}
                  className="p-1.5 rounded-lg bg-[#0062FF] text-white hover:bg-[#0048C6] transition-colors cursor-pointer"
                  title="New Direct Message"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {onToggleSidebarCollapse && (
                  <button
                    onClick={onToggleSidebarCollapse}
                    className="hidden md:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Collapse Sidebar"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs: Recent | Unread | Starred */}
            <div className="p-2 border-b border-stone-200/80 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-900/30 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search officers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                />
              </div>

              <div className="flex items-center space-x-1">
                {(['recent', 'unread', 'starred'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setMessagesFilter(tab)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer capitalize ${
                      messagesFilter === tab
                        ? 'bg-[#0062FF] text-white'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    {tab === 'recent' ? 'Recent' : tab === 'unread' ? 'Unread' : 'Starred'}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages List */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin">
              {filteredDMs.length === 0 ? (
                <div className="py-8 text-center text-stone-400 space-y-1">
                  <MessageSquare className="w-6 h-6 mx-auto text-stone-300 dark:text-stone-700" />
                  <p className="text-xs font-semibold">No direct messages</p>
                  <p className="text-[10px] text-stone-500">Click + above to start a conversation</p>
                </div>
              ) : (
                filteredDMs.map(dm => {
                  const participants = dm.participants || [];
                  const other = participants.find(p => p.id !== currentUser?.id) || participants[0] || { 
                    name: 'Staff Officer', 
                    status: 'offline', 
                    department: 'General' 
                  };
                  const isSelected = selectedDMId === dm.id;

                  return (
                    <button
                      key={dm.id}
                      id={`sidebar-dm-${dm.id}`}
                      onClick={() => handleDMSelect(dm)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-[#0062FF] text-white font-semibold shadow-2xs' 
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="relative shrink-0">
                          <UserAvatar 
                            member={other} 
                            size="sm" 
                            showStatus={true} 
                          />
                        </div>
                        <div className="truncate text-left">
                          <div className="truncate font-medium">{other.name}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-stone-400'}`}>
                            {other.department || 'Officer'}
                          </div>
                        </div>
                      </div>

                      {dm.unreadCount ? (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isSelected ? 'bg-white text-[#0062FF]' : 'bg-[#0062FF] text-white'
                        }`}>
                          {dm.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            2. CHANNELS VIEW (FAVORITES, RECENT, BROWSE GROUPS & BROWSE ALL)
            ========================================================================= */}
        {activeSection === 'channels' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header & Actions */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between bg-white/60 dark:bg-[#0E1524]">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Council Channels
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Institutional topics</p>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  id="btn-sidebar-create-channel"
                  onClick={handleCreateChannel}
                  className="p-1.5 rounded-lg bg-[#0062FF] text-white hover:bg-[#0048C6] transition-colors cursor-pointer"
                  title="New Channel"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {onToggleSidebarCollapse && (
                  <button
                    onClick={onToggleSidebarCollapse}
                    className="hidden md:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Collapse Sidebar"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Search */}
            <div className="p-2 border-b border-stone-200/80 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-900/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                />
              </div>
            </div>

            {/* Scrollable Channels Navigation */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 scrollbar-thin">
              
              {/* Favorites Section */}
              {favoriteChannels.length > 0 && (
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Favorites</span>
                  </div>
                  {favoriteChannels.map(chan => {
                    const isSelected = selectedChanId === chan.id;
                    return (
                      <button
                        key={chan.id}
                        id={`sidebar-fav-chan-${chan.id}`}
                        onClick={() => handleChannelSelect(chan)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-[#0062FF] text-white font-semibold shadow-2xs' 
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {chan.isPrivate ? (
                            <Lock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                          ) : (
                            <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                          )}
                          <span className="truncate">{chan.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Categorized Channel Groups */}
              {(Object.entries(channelCategories) as [string, Channel[]][]).map(([category, catChannels]) => {
                const visibleChannels = catChannels.filter(c => 
                  !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (visibleChannels.length === 0) return null;
                const isCollapsed = collapsedCategories[category];

                return (
                  <div key={category} className="space-y-0.5">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer group"
                    >
                      <span className="truncate">{category}</span>
                      <span className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300">
                        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </span>
                    </button>

                    {!isCollapsed && visibleChannels.map(chan => {
                      const isSelected = selectedChanId === chan.id;
                      return (
                        <button
                          key={chan.id}
                          id={`sidebar-channel-${chan.id}`}
                          onClick={() => handleChannelSelect(chan)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-[#0062FF] text-white font-semibold shadow-2xs' 
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            {chan.isPrivate ? (
                              <Lock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                            ) : (
                              <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                            )}
                            <span className="truncate">{chan.name}</span>
                          </div>

                          {chan.unreadCount ? (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isSelected ? 'bg-white text-[#0062FF]' : 'bg-[#0062FF] text-white'
                            }`}>
                              {chan.unreadCount}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

            </div>

            {/* View All Channels Button */}
            {onOpenChannelBrowser && (
              <div className="p-2 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30">
                <button
                  id="btn-sidebar-browse-channels"
                  onClick={onOpenChannelBrowser}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700/80 hover:border-[#0062FF] bg-white dark:bg-[#111726] text-stone-700 dark:text-stone-300 hover:text-[#0062FF] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Browse All Channels</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            3. CALENDAR VIEW (TODAY, UPCOMING, MY EVENTS, SCHEDULE)
            ========================================================================= */}
        {activeSection === 'calendar' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Institutional Calendar
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Events & Council Schedule</p>
              </div>
              {onOpenScheduleEvent && (
                <button
                  onClick={onOpenScheduleEvent}
                  className="p-1.5 rounded-lg bg-[#0062FF] text-white hover:bg-[#0048C6] transition-colors cursor-pointer"
                  title="Schedule Event"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
              {[
                { id: 'today', label: 'Today\'s Deliberations', icon: Clock },
                { id: 'upcoming', label: 'Upcoming Assemblies', icon: Calendar },
                { id: 'my_events', label: 'My Assigned Events', icon: Users },
                { id: 'calendar', label: 'Full Monthly Schedule', icon: LayoutGrid }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeCalendarView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectCalendarView?.(item.id)}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#0062FF] text-white font-semibold' 
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-stone-200/60 dark:border-stone-800/60 px-2 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Synced Integrations
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center space-x-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Google & Exchange Synced</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. MEETINGS VIEW (UPCOMING, PAST, INSTANT MEETING)
            ========================================================================= */}
        {activeSection === 'meetings' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Council Chambers
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Encrypted Video Rooms</p>
              </div>
              {onOpenStartMeeting && (
                <button
                  onClick={onOpenStartMeeting}
                  className="p-1.5 rounded-lg bg-[#0062FF] text-white hover:bg-[#0048C6] transition-colors cursor-pointer"
                  title="Instant Meeting"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
              {[
                { id: 'upcoming', label: 'Scheduled Deliberations', icon: Video },
                { id: 'my_meetings', label: 'Chambers I Host', icon: Users },
                { id: 'past', label: 'Past Minutes & Records', icon: Archive }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            5. EMAIL VIEW (DISPATCHES, INBOX, SENT, DRAFTS, ARCHIVE)
            ========================================================================= */}
        {activeSection === 'email' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80">
              <button
                id="sidebar-compose-email-btn"
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  if (onOpenComposeEmail) onOpenComposeEmail();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Compose Dispatch</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
              {/* Primary Core Folders */}
              {[
                { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadEmailsCount },
                { id: 'starred', label: 'Starred & Classified', icon: Star, count: 0 },
                { id: 'sent', label: 'Sent Dispatches', icon: Send, count: 0 },
                { id: 'drafts', label: 'Drafts', icon: FileText, count: 0 }
              ].map(folder => {
                const Icon = folder.icon;
                const isActive = currentMailFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    id={`sidebar-mail-folder-${folder.id}`}
                    onClick={() => handleMailFolderSelect(folder.id as MailFolder)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#0062FF] text-white font-semibold' 
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{folder.label}</span>
                    </div>
                    {folder.count && folder.count > 0 ? (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-[#0062FF]' : 'bg-[#0062FF] text-white'
                      }`}>
                        {folder.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {/* Collapsible More Section */}
              <div className="pt-2">
                <button
                  onClick={() => setIsMoreFoldersOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                >
                  <span>More Folders</span>
                  {isMoreFoldersOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {isMoreFoldersOpen && (
                  <div className="space-y-1 pl-2 pt-1">
                    {[
                      { id: 'archive', label: 'Archived Gazettes', icon: Archive },
                      { id: 'trash', label: 'Trash', icon: Trash2 }
                    ].map(folder => {
                      const Icon = folder.icon;
                      const isActive = currentMailFolder === folder.id;
                      return (
                        <button
                          key={folder.id}
                          id={`sidebar-mail-folder-${folder.id}`}
                          onClick={() => handleMailFolderSelect(folder.id as MailFolder)}
                          className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-[#0062FF] text-white font-semibold' 
                              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{folder.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. FILES VAULT VIEW (STATUTORY DOCUMENTS, RECENT, DRIVE)
            ========================================================================= */}
        {activeSection === 'files' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80">
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  if (onOpenUploadFile) onOpenUploadFile();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Vault Categories
              </div>

              {[
                { id: 'all', label: 'All Statutory Documents', icon: FolderKanban },
                { id: 'documents', label: 'Official Gazettes & Acts', icon: FileText },
                { id: 'spreadsheets', label: 'Financial & Budget Sheets', icon: FileCheck },
                { id: 'images', label: 'Evidence & Media Archives', icon: Globe }
              ].map(filter => {
                const Icon = filter.icon;
                const isActive = activeFileFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFileFilterSelect(filter.id)}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#0062FF] text-white font-semibold' 
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{filter.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-stone-200/60 dark:border-stone-800/60 px-2 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Cloud Connectors
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-center space-x-2 text-[11px] text-blue-800 dark:text-blue-300 font-medium">
                  <Cloud className="w-3.5 h-3.5 text-[#0062FF] shrink-0" />
                  <span>Google Drive & OneDrive</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. PEOPLE VIEW (STAFF DIRECTORY & DEPARTMENTS)
            ========================================================================= */}
        {activeSection === 'people' && (
          <div className="flex flex-col h-full">
            <div className="p-3.5 border-b border-stone-200 dark:border-stone-800/80">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Staff Roster & Departments
              </span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">Authorized personnel directory</p>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
              {[
                'All Departments',
                'Executive Leadership',
                'Administration & Finance',
                'Legal & Compliance',
                'Public Communications',
                'Information Technology'
              ].map(dept => {
                const isActive = activeDepartmentFilter === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => handleDeptFilterSelect(dept)}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#0062FF] text-white font-semibold' 
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="truncate">{dept}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            8. SETTINGS VIEW (ORGANIZATION, GOVERNANCE, AUDIT, ROLES)
            ========================================================================= */}
        {activeSection === 'settings' && (
          <div className="flex flex-col h-full">
            <div className="p-3.5 border-b border-stone-200 dark:border-stone-800/80">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Governance & Controls
              </span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">Institutional policies & roles</p>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
              {[
                { id: 'profile', label: 'Organization Profile', icon: Building2 },
                { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
                { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
                { id: 'domains', label: 'Domain Allowlist (.gov.ng)', icon: Globe },
                { id: 'members', label: 'Officer Access & Roles', icon: Users },
                { id: 'invitations', label: 'Pending Enrollments', icon: UserPlus },
                { id: 'audit', label: 'NDPA 2023 Audit Logs', icon: ShieldCheck }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeSettingsTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSettingsTabSelect(tab.id)}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#0062FF] text-white font-semibold' 
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            9. TASKS VIEW (MANDATES, DELIVERABLES, PRIORITY MATRIX & PROGRESS)
            ========================================================================= */}
        {activeSection === 'tasks' && (() => {
          const totalTasks = tasks.length;
          const myTasks = tasks.filter(t => (t.assigneeIds || []).includes(currentUser?.id || '') || (t as any).assignee?.id === currentUser?.id).length;
          const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
          const reviewTasks = tasks.filter(t => t.status === 'review').length;
          const doneTasks = tasks.filter(t => t.status === 'done').length;
          const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
          const todoTasks = tasks.filter(t => t.status === 'todo').length;
          const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          const deliverableList = deliverables && deliverables.length > 0
            ? [{ id: 'all', title: 'All Deliverables', code: 'ALL' }, ...deliverables]
            : [];

          return (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header & Quick Action */}
              <div className="p-3 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between bg-white/60 dark:bg-[#0E1524]">
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-1.5">
                    <span>Mandates & Tasks</span>
                  </span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Statutory deliverables</p>
                </div>

                <div className="flex items-center space-x-1">
                  {onOpenCreateTask && (
                    <button
                      id="btn-sidebar-create-task"
                      onClick={() => {
                        if (onCloseMobile) onCloseMobile();
                        onOpenCreateTask();
                      }}
                      className="p-1.5 rounded-lg bg-[#0062FF] text-white hover:bg-[#0048C6] transition-colors cursor-pointer"
                      title="New Task Mandate"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onToggleSidebarCollapse && (
                    <button
                      onClick={onToggleSidebarCollapse}
                      className="hidden md:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Collapse Sidebar"
                    >
                      <PanelLeftClose className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Task Board Navigation */}
              <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-3.5 scrollbar-thin">
                
                {/* Primary Scope Filters */}
                <div className="space-y-1">
                  <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Scope Filter
                  </div>

                  <button
                    id="sidebar-task-filter-all"
                    onClick={() => {
                      onSelectTaskFilterTab?.('all');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      activeTaskFilterTab === 'all'
                        ? 'bg-[#0062FF] text-white font-semibold shadow-2xs'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">All Deliverables</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTaskFilterTab === 'all' ? 'bg-white text-[#0062FF]' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}>
                      {totalTasks}
                    </span>
                  </button>

                  <button
                    id="sidebar-task-filter-my-tasks"
                    onClick={() => {
                      onSelectTaskFilterTab?.('my_tasks');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      activeTaskFilterTab === 'my_tasks'
                        ? 'bg-[#0062FF] text-white font-semibold shadow-2xs'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Assigned to Me</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTaskFilterTab === 'my_tasks' ? 'bg-white text-[#0062FF]' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                      {myTasks}
                    </span>
                  </button>

                  <button
                    id="sidebar-task-filter-urgent"
                    onClick={() => {
                      onSelectTaskFilterTab?.('urgent');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      activeTaskFilterTab === 'urgent'
                        ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                        : 'text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Urgent & High</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTaskFilterTab === 'urgent' ? 'bg-white text-rose-700' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {urgentTasks}
                    </span>
                  </button>
                </div>

                {/* Status Column Breakdown */}
                <div className="space-y-1">
                  <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Status Overview
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#111726] border border-stone-200/80 dark:border-stone-800">
                      <div className="text-[10px] text-stone-500">Backlog</div>
                      <div className="text-sm font-bold text-stone-800 dark:text-stone-200">{todoTasks}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">In Progress</div>
                      <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{inProgressTasks}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Review</div>
                      <div className="text-sm font-bold text-amber-700 dark:text-amber-300">{reviewTasks}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Delivered</div>
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{doneTasks}</div>
                    </div>
                  </div>
                </div>

                {/* Deliverable Projects Filter */}
                {deliverableList.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Deliverable Projects
                    </div>
                    {deliverableList.map(deliv => {
                      const isSelected = activeTaskDeliverableId === deliv.id;
                      return (
                        <button
                          key={deliv.id}
                          onClick={() => {
                            onSelectTaskDeliverableId?.(deliv.id);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#0062FF] text-white font-semibold'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <FolderKanban className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="truncate text-left">{deliv.title}</span>
                          </div>
                          {deliv.code && (
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/70 dark:bg-stone-800 text-stone-500'
                            }`}>
                              {deliv.code}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Priority Matrix Filter */}
                <div className="space-y-1">
                  <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Priority Filter
                  </div>
                  {[
                    { id: 'all', label: 'All Priorities', color: 'bg-stone-400' },
                    { id: 'urgent', label: 'Urgent Priority', color: 'bg-rose-500' },
                    { id: 'high', label: 'High Priority', color: 'bg-orange-500' },
                    { id: 'medium', label: 'Medium Priority', color: 'bg-blue-500' },
                    { id: 'low', label: 'Low Priority', color: 'bg-stone-400' }
                  ].map(p => {
                    const isSelected = activeTaskPriority === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectTaskPriority?.(p.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#0062FF] text-white font-semibold'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Institutional Milestone Tracker Card */}
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60">
                  <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">Execution Rate</span>
                      <span className="font-bold text-[#0062FF] dark:text-blue-400">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0062FF] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {doneTasks} of {totalTasks} deliverables delivered
                    </p>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* =========================================================================
            10. HOME VIEW (EXECUTIVE HQ, SHORTCUTS, METRICS & STATUS)
            ========================================================================= */}
        {activeSection === 'home' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between bg-white/60 dark:bg-[#0E1524]">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0062FF]" />
                  <span>Executive HQ</span>
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">{organization?.name || 'Council Workspace'}</p>
              </div>

              {onToggleSidebarCollapse && (
                <button
                  onClick={onToggleSidebarCollapse}
                  className="hidden md:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable HQ Content */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5 scrollbar-thin">
              
              {/* Executive Shortcuts */}
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Direct Navigation
                </div>
                {[
                  { id: 'tasks', label: 'Mandates & Tasks', icon: FolderKanban, count: tasks.filter(t => t.status !== 'done').length },
                  { id: 'channels', label: 'Council Channels', icon: Hash, count: safeChannels.length },
                  { id: 'messages', label: 'Direct Officer Lines', icon: MessageSquare, count: safeDMs.length },
                  { id: 'email', label: 'Official Dispatches', icon: Mail, count: unreadEmailsCount },
                  { id: 'calendar', label: 'Assemblies & Calendar', icon: Calendar },
                  { id: 'meetings', label: 'Encrypted Chambers', icon: Video },
                  { id: 'files', label: 'Statutory Gazette Vault', icon: Folder },
                  { id: 'people', label: 'Staff Roster', icon: Users, count: safeMembers.length }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigateToSection?.(item.id as ActiveSection);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Executive Actions Launcher */}
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Quick Actions
                </div>
                <div className="space-y-1.5 p-1">
                  <button
                    id="sidebar-home-action-compose"
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      onOpenComposeEmail?.();
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-700/80 hover:border-[#0062FF] text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0062FF]" />
                    <span>Draft Official Memo</span>
                  </button>

                  <button
                    id="sidebar-home-action-channel"
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      onOpenCreateChannel?.();
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-700/80 hover:border-[#0062FF] text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Hash className="w-3.5 h-3.5 text-[#0062FF]" />
                    <span>Create Topic Channel</span>
                  </button>

                  <button
                    id="sidebar-home-action-meeting"
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      onOpenStartMeeting?.();
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-700/80 hover:border-[#0062FF] text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-[#0062FF]" />
                    <span>Open Video Chambers</span>
                  </button>
                </div>
              </div>

              {/* Compliance & Sovereign State Banner */}
              <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center space-x-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NDPA 2023 Compliant</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center space-x-2 text-[11px] text-blue-800 dark:text-blue-300 font-medium">
                  <Globe className="w-4 h-4 text-[#0062FF] shrink-0" />
                  <span>Sovereign .gov.ng Active</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            11. PLUGINS VIEW (INTEGRATIONS, EXTENSIONS & CATEGORIES)
            ========================================================================= */}
        {(activeSection === 'plugins' || (activeSection as any) === 'translate') && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between bg-white/60 dark:bg-[#0E1524]">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-1.5">
                  <Languages className="w-3.5 h-3.5 text-[#0062FF]" />
                  <span>Language Translate</span>
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Multilateral neural engine</p>
              </div>

              {onToggleSidebarCollapse && (
                <button
                  onClick={onToggleSidebarCollapse}
                  className="hidden md:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable Translate Guide & Features */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-blue-900 dark:text-blue-300 font-semibold text-[11px]">
                  <Globe className="w-3.5 h-3.5 text-[#0062FF]" />
                  <span>Neural Engine Active</span>
                </div>
                <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed">
                  Translates across 50+ world languages with diplomatic protocol formality and voice pronunciation.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800/60 space-y-2">
                <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Chat Slash Command
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-stone-200/80 dark:border-stone-800 space-y-1.5 text-[11px]">
                  <code className="text-[11px] font-mono text-[#0062FF] dark:text-blue-400 block bg-stone-100 dark:bg-stone-900 px-2 py-1 rounded-md">
                    /translate [text] to [lang]
                  </code>
                  <p className="text-[10px] text-stone-500">
                    Auto-translates inside channels & direct messages with instant readout card.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </aside>
    </>
  );
};
