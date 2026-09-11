import React, { useState, useEffect } from 'react';
import { 
  Channel, 
  DirectMessage, 
  Message, 
  FileItem, 
  FileFolder, 
  Member, 
  UserRole, 
  AuditLogEntry, 
  ActiveSection, 
  UserStatus, 
  Attachment, 
  VoiceNote, 
  EmailMessage, 
  MailFolder, 
  OrganizationSettings, 
  SharedEmailReference, 
  OrganizationEvent, 
  NotificationItem, 
  ApprovedDomain, 
  OrganizationInvitation,
  ChatPlugin,
  PluginExecutionResult,
  TaskItem,
  ProjectDeliverable,
  TaskStatus,
  WorkItem,
  WorkEvidence,
  WorkActivityLog
} from './types';
import { DEFAULT_PLUGINS } from './lib/pluginsData';
import { INITIAL_WORK_ITEMS, INITIAL_WORK_TASKS, SAMPLE_TEAM_MEMBERS } from './lib/workItemsData';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  fbSignOut, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from './lib/firebase';
import { 
  subscribeToOrganization, 
  updateOrganizationConfig, 
  subscribeToMembers, 
  updateUserRole, 
  updateUserApproval, 
  removeUser, 
  updateUserPresence, 
  subscribeToChannels, 
  createChannel, 
  deleteChannel, 
  subscribeToDirectMessages, 
  createOrGetDirectMessage, 
  subscribeToMessages, 
  sendMessage, 
  deleteMessage, 
  togglePinMessage, 
  addMessageReaction, 
  sendThreadReply, 
  subscribeToFiles, 
  deleteFileRecord, 
  subscribeToEmails, 
  sendOfficialEmail, 
  updateEmailStatus, 
  deleteEmail, 
  subscribeToAuditLogs, 
  logAuditEvent, 
  subscribeToNotifications, 
  markNotificationRead, 
  subscribeToApprovedDomains, 
  addApprovedDomain, 
  toggleApprovedDomainStatus, 
  removeApprovedDomain, 
  subscribeToInvitations, 
  createInvitation, 
  revokeInvitation,
  subscribeToTasks,
  createTaskItem,
  updateTaskStatus,
  updateTaskItem,
  deleteTaskItem,
  cleanForFirestore
} from './lib/firestoreService';

// Web Navigation Components
import { NavigationRail } from './components/NavigationRail';
import { ContextualSidebar } from './components/ContextualSidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WorkNestLogo } from './components/WorkNestLogo';

// View Components
import { HomeView } from './components/views/HomeView';
import { ChatView } from './components/views/ChatView';
import { TasksView } from './components/views/TasksView';
import { EmailView } from './components/views/EmailView';
import { FilesView } from './components/views/FilesView';
import { PeopleView } from './components/views/PeopleView';
import { SettingsView } from './components/views/SettingsView';
import { CalendarView } from './components/views/CalendarView';
import { MeetingsView } from './components/views/MeetingsView';
import { MeetingRoomView } from './components/views/MeetingRoomView';
import { PluginsView } from './components/views/PluginsView';

// Modals
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CreateWorkModal } from './components/CreateWorkModal';
import { WorkItemDetailModal } from './components/WorkItemDetailModal';
import { 
  CreateChannelModal, 
  CreateDMModal, 
  ComposeEmailModal, 
  FilePreviewModal,
  ChannelBrowserModal,
  QuickActionsModal
} from './components/Modals';
import { Loader2, WifiOff } from 'lucide-react';

export default function App() {
  // Connectivity state
  const [isConnected, setIsConnected] = useState<boolean>(navigator.onLine);

  // Default active institutional officer so the workspace always loads instantly without any splash/landing gate
  const DEFAULT_OFFICER: Member = {
    id: 'usr_officer_olude',
    name: 'Olude Ifeoluwa',
    email: 'ifeoluwa.olude@worknest.gov.ng',
    avatar: '',
    role: 'Member',
    status: 'online',
    department: 'Executive Operations',
    jobTitle: 'Senior Administrative Officer',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<Member>(DEFAULT_OFFICER);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Organization settings
  const [organization, setOrganization] = useState<OrganizationSettings>({
    id: 'org_worknest_main',
    name: 'WorkNest',
    logoText: 'WN',
    domain: '',
    accentColor: 'indigo',
    emailProvider: 'none',
    allowGuestInvites: false,
    retentionDays: 180,
    registrationApprovalMode: 'auto_approved_domains',
    requireGovDomain: true,
    organizationStateOrAgency: 'WorkNest Workspace',
    approvedDomains: []
  });

  // Navigation states
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [activeChannelId, setActiveChannelId] = useState<string>('chan_announcements');
  const [activeDMId, setActiveDMId] = useState<string>('');
  const [activeMailFolder, setActiveMailFolder] = useState<MailFolder>('inbox');
  const [activeFileFilter, setActiveFileFilter] = useState<string>('all');
  const [activeDepartmentFilter, setActiveDepartmentFilter] = useState<string>('All Departments');
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>('profile');
  const [activeHomeTab, setActiveHomeTab] = useState<string>('today');
  const [activeMeetingRoomId, setActiveMeetingRoomId] = useState<string | null>(null);

  // Tasks & Plugins filter navigation states
  const [activeTaskFilterTab, setActiveTaskFilterTab] = useState<'all' | 'my_tasks' | 'urgent'>('all');
  const [activeTaskDeliverableId, setActiveTaskDeliverableId] = useState<string>('all');
  const [activeTaskPriority, setActiveTaskPriority] = useState<string>('all');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [activePluginCategory, setActivePluginCategory] = useState<string>('All');

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Workspace Theme State
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    try {
      return (localStorage.getItem('worknest_theme') as 'dark' | 'light' | 'system') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Workspace Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('worknest_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Expandable / Collapsible Navigation Rail State (Icon-only vs Expanded)
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('worknest_nav_expanded') === 'true';
    } catch {
      return false;
    }
  });

  // Favorite Channels & DMs IDs
  const [favoriteChannelIds, setFavoriteChannelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('worknest_fav_channels');
      return saved ? JSON.parse(saved) : ['chan_announcements', 'chan_deliberations'];
    } catch {
      return ['chan_announcements', 'chan_deliberations'];
    }
  });

  const [favoriteDMIds, setFavoriteDMIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('worknest_fav_dms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavoriteChannel = (channelId: string) => {
    setFavoriteChannelIds(prev => {
      const next = prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId];
      try {
        localStorage.setItem('worknest_fav_channels', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleFavoriteDM = (dmId: string) => {
    setFavoriteDMIds(prev => {
      const next = prev.includes(dmId) ? prev.filter(id => id !== dmId) : [...prev, dmId];
      try {
        localStorage.setItem('worknest_fav_dms', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleNavExpand = () => {
    setIsNavExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('worknest_nav_expanded', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Sync theme with document element
  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    applyTheme();

    try {
      localStorage.setItem('worknest_theme', theme);
    } catch (e) {}

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('worknest_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Real-time Workspace Data State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([
    { id: 'fld_projects', name: 'Council Directives & Gazettes', fileCount: 0 },
    { id: 'fld_legal', name: 'NDPA 2023 Statutory Memos', fileCount: 0 },
    { id: 'fld_financial', name: 'Appropriation & Budget Filings', fileCount: 0 },
    { id: 'fld_hr', name: 'Public Service Executive Orders', fileCount: 0 }
  ]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [approvedDomains, setApprovedDomains] = useState<ApprovedDomain[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);

  // WORKNEST WORKFLOW-FIRST CORE ENGINE (WorkItems & Tasks)
  const [workItems, setWorkItems] = useState<WorkItem[]>(() => {
    try {
      const saved = localStorage.getItem('worknest_work_items');
      return saved ? JSON.parse(saved) : INITIAL_WORK_ITEMS;
    } catch {
      return INITIAL_WORK_ITEMS;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('worknest_tasks');
      return saved ? JSON.parse(saved) : INITIAL_WORK_TASKS;
    } catch {
      return INITIAL_WORK_TASKS;
    }
  });

  const [deliverables, setDeliverables] = useState<ProjectDeliverable[]>([]);

  // Persist workItems and tasks locally so changes are always reactive
  useEffect(() => {
    try {
      localStorage.setItem('worknest_work_items', JSON.stringify(workItems));
    } catch (e) {
      console.error('Failed to persist work items', e);
    }
  }, [workItems]);

  useEffect(() => {
    try {
      localStorage.setItem('worknest_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  }, [tasks]);

  // ChatGPT-Style Plugins State
  const [plugins, setPlugins] = useState<ChatPlugin[]>(() => {
    try {
      const saved = localStorage.getItem('worknest_plugins_config');
      return saved ? JSON.parse(saved) : DEFAULT_PLUGINS;
    } catch {
      return DEFAULT_PLUGINS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('worknest_plugins_config', JSON.stringify(plugins));
    } catch (e) {
      console.error('Failed to persist plugin config', e);
    }
  }, [plugins]);

  const handleTogglePluginEnabled = (pluginId: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        const nextEnabled = !p.isEnabled;
        logAction(nextEnabled ? 'Enabled Plugin' : 'Disabled Plugin', p.shortName, `Command triggers: ${p.commandTriggers?.join(', ')}`);
        return { ...p, isEnabled: nextEnabled };
      }
      return p;
    }));
  };

  const handleTogglePluginInstalled = (pluginId: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        const nextInstalled = !p.isInstalled;
        logAction(nextInstalled ? 'Installed Plugin' : 'Uninstalled Plugin', p.name, `Category: ${p.category}`);
        return { ...p, isInstalled: nextInstalled, isEnabled: nextInstalled ? true : false };
      }
      return p;
    }));
  };

  const handleSaveCustomPlugin = (newPlugin: Partial<ChatPlugin>) => {
    const created: ChatPlugin = {
      id: `plg_${Date.now()}`,
      name: newPlugin.name || 'Custom Extension',
      shortName: newPlugin.shortName || 'Custom',
      description: newPlugin.description || 'Custom institutional extension',
      category: newPlugin.category || 'Custom',
      version: '1.0.0',
      author: currentUser?.name || 'Public Officer',
      isInstalled: true,
      isEnabled: true,
      commandTriggers: newPlugin.commandTriggers || [`/${(newPlugin.shortName || 'custom').toLowerCase().replace(/\s+/g, '')}`],
      iconName: newPlugin.iconName || 'Puzzle',
      color: newPlugin.color || '#0062FF',
      capabilities: newPlugin.capabilities || [
        { id: 'cap_custom', name: 'Custom Execution', description: 'Executes user-defined prompt or webhook' }
      ],
      samplePrompts: newPlugin.samplePrompts || ['Test custom execution prompt'],
      endpointUrl: newPlugin.endpointUrl || '',
      authType: 'apiKey',
      config: newPlugin.config || {},
      parameters: newPlugin.parameters || [
        { name: 'query', label: 'Directive Query', type: 'string', required: true, description: 'Input text to process' }
      ]
    };
    setPlugins(prev => [...prev, created]);
    logAction('Created Custom AI Plugin', created.name, `Trigger: ${created.commandTriggers?.[0]}`);
  };

  const handleUpdatePluginConfig = (pluginId: string, config: Record<string, string>) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? { ...p, config: { ...p.config, ...config } } : p));
    logAction('Updated Plugin Credentials', pluginId, 'Saved authorization tokens');
  };

  // Thread side-panel state
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCreateWorkOpen, setIsCreateWorkOpen] = useState<boolean>(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [isWorkItemDetailOpen, setIsWorkItemDetailOpen] = useState<boolean>(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState<boolean>(false);
  const [isCreateDMOpen, setIsCreateDMOpen] = useState<boolean>(false);
  const [isComposeEmailOpen, setIsComposeEmailOpen] = useState<boolean>(false);
  const [isChannelBrowserOpen, setIsChannelBrowserOpen] = useState<boolean>(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [replyingToEmail, setReplyingToEmail] = useState<EmailMessage | null>(null);
  const [previewingFile, setPreviewingFile] = useState<FileItem | null>(null);
  const [selectedEmailIdToOpen, setSelectedEmailIdToOpen] = useState<string | null>(null);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Firebase Authentication State Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          let memberObj: Member;
          if (userSnap.exists()) {
            const data = userSnap.data();
            memberObj = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Official Officer',
              email: fbUser.email || data.email || '',
              avatar: data.avatar || fbUser.photoURL || '',
              role: data.role || 'Admin',
              status: 'online',
              department: data.department || 'Executive Operations',
              jobTitle: data.jobTitle || 'Public Sector Officer',
              isVerifiedGov: true,
              approvalStatus: data.approvalStatus || 'approved'
            };
          } else {
            // First time profile creation
            memberObj = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Official Officer',
              email: fbUser.email || '',
              avatar: fbUser.photoURL || '',
              role: 'Admin',
              status: 'online',
              department: 'Executive Operations',
              jobTitle: 'Senior Public Administrator',
              isVerifiedGov: true,
              approvalStatus: 'approved'
            };
            await setDoc(userDocRef, cleanForFirestore({
              ...memberObj,
              createdAt: serverTimestamp()
            }));
          }

          setCurrentUser(memberObj);
        } catch (err) {
          console.error('Error synchronizing Firebase user profile:', err);
        }
      } else {
        // Active institutional officer so the workspace & navbar load immediately
        setCurrentUser(DEFAULT_OFFICER);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-Time Firestore Data Subscriptions
  useEffect(() => {
    if (!currentUser) return;

    // A. Organization Settings
    const unsubOrg = subscribeToOrganization(setOrganization);

    // B. Channels
    const unsubChannels = subscribeToChannels((chList) => {
      setChannels(chList);
      if (chList.length > 0 && !activeChannelId) {
        setActiveChannelId(chList[0].id);
      }
    });

    // C. Direct Messages
    const unsubDMs = subscribeToDirectMessages(currentUser.id, (dmList) => {
      setDirectMessages(dmList);
      if (dmList.length > 0 && !activeDMId) {
        setActiveDMId(dmList[0].id);
      }
    });

    // D. Files & Cloud Storage Records
    const unsubFiles = subscribeToFiles(setFiles);

    // E. Official Government Emails
    const unsubEmails = subscribeToEmails(setEmails);

    // F. Members Directory
    const unsubMembers = subscribeToMembers(setMembers);

    // G. Audit Logs (NDPA 2023)
    const unsubLogs = subscribeToAuditLogs(setAuditLogs);

    // H. Notifications
    const unsubNotifs = subscribeToNotifications(currentUser.id, setNotifications);

    // I. Approved Domains
    const unsubDomains = subscribeToApprovedDomains(setApprovedDomains);

    // J. Invitations
    const unsubInvites = subscribeToInvitations(setInvitations);

    // K. Project Task Board Items
    const unsubTasks = subscribeToTasks(setTasks);

    return () => {
      unsubOrg();
      unsubChannels();
      unsubDMs();
      unsubFiles();
      unsubEmails();
      unsubMembers();
      unsubLogs();
      unsubNotifs();
      unsubDomains();
      unsubInvites();
      unsubTasks();
    };
  }, [currentUser]);

  // 3. Real-Time Conversation Messages Subscription
  const activeConversationId = activeSection === 'channels' ? activeChannelId : activeDMId;

  useEffect(() => {
    if (!currentUser || !activeConversationId) return;

    const unsubMessages = subscribeToMessages(activeConversationId, (msgs) => {
      setMessages(prev => ({
        ...prev,
        [activeConversationId]: msgs
      }));
    });

    return () => unsubMessages();
  }, [currentUser, activeConversationId]);

  // Helper: Append Audit Log to Firestore
  const logAction = async (action: string, target: string, details: string) => {
    if (!currentUser) return;
    await logAuditEvent(currentUser, action, target, details);
  };

  // Status handler
  const handleUpdateStatus = async (status: UserStatus) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, status } : null);
    await updateUserPresence(currentUser.id, status);
    await logAction('Updated Presence', 'Status Indicator', `Status set to ${status}`);
  };

  // Channel & DM Selection
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
    setActiveSection('channels');
    setActiveThreadMessage(null);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectDM = (dm: DirectMessage) => {
    setActiveDMId(dm.id);
    setActiveSection('messages');
    setActiveThreadMessage(null);
    setIsMobileSidebarOpen(false);
  };

  // Message Sending Handler (Channel or DM)
  const handleSendMessage = async (content: string, attachments?: Attachment[], voiceNote?: VoiceNote, pluginResult?: PluginExecutionResult) => {
    if (!currentUser) return;
    const conversationId = activeSection === 'channels' ? activeChannelId : activeDMId;

    const newMsg: Partial<Message> = {
      conversationId,
      sender: currentUser,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments || [],
      voiceNote,
      pluginResult,
      reactions: [],
      replies: []
    };

    await sendMessage(newMsg);
    await logAction('Dispatched Message', conversationId, pluginResult ? `[Plugin: ${pluginResult.pluginName}] ${content.substring(0, 30)}` : content.substring(0, 40));
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const conversationId = activeSection === 'channels' ? activeChannelId : activeDMId;
    const currentMsgs = messages[conversationId] || [];
    const msg = currentMsgs.find(m => m.id === messageId);
    if (!msg) return;

    await addMessageReaction(messageId, emoji, currentUser.name, msg.reactions);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const conversationId = activeSection === 'channels' ? activeChannelId : activeDMId;
    await deleteMessage(messageId);
    await logAction('Deleted Message', conversationId, `Message Ref ${messageId}`);
  };

  const handleTogglePinMessage = async (messageId: string) => {
    const conversationId = activeSection === 'channels' ? activeChannelId : activeDMId;
    const currentMsgs = messages[conversationId] || [];
    const msg = currentMsgs.find(m => m.id === messageId);
    if (!msg) return;

    await togglePinMessage(messageId, !!msg.isPinned);
    await logAction(!msg.isPinned ? 'Pinned Directive' : 'Unpinned Directive', conversationId, msg.content.substring(0, 30));
  };

  const handleSendThreadReply = async (parentMessageId: string, content: string) => {
    if (!currentUser) return;
    const conversationId = activeSection === 'channels' ? activeChannelId : activeDMId;
    const currentMsgs = messages[conversationId] || [];
    const msg = currentMsgs.find(m => m.id === parentMessageId);
    if (!msg) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      sender: currentUser,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    await sendThreadReply(parentMessageId, newReply, msg.replies || []);
  };

  // Bridge Official Email <-> Internal Council Chat
  const handleBridgeEmailToChat = async (targetId: string, isChannel: boolean, emailRef: SharedEmailReference) => {
    if (!currentUser) return;

    const bridgeMessage: Partial<Message> = {
      conversationId: targetId,
      sender: currentUser,
      content: `Bridged an official government dispatch into this channel:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sharedEmailRef: emailRef,
      reactions: []
    };

    await sendMessage(bridgeMessage);
    await logAction('Bridged Email to Channel', targetId, `Subject: ${emailRef.subject}`);
  };

  // Compose Email Handlers
  const handleSendEmail = async (emailData: Partial<EmailMessage>) => {
    if (!currentUser) return;
    const newEmail: Partial<EmailMessage> = {
      sender: {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      to: emailData.to || [{ name: 'Lagos State Ministry of Science & Tech', email: 'director@lagosstate.gov.ng' }],
      subject: emailData.subject || 'Official State Gazette Directive',
      snippet: emailData.snippet || emailData.body?.slice(0, 80) || '',
      body: emailData.body || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      folder: emailData.folder || 'sent',
      isRead: true,
      isStarred: false,
      tags: emailData.tags || ['Official Dispatch']
    };

    await sendOfficialEmail(newEmail);
    await logAction('Dispatched Official Email', newEmail.to ? newEmail.to[0]?.email : 'GovNet', `Subject: ${newEmail.subject}`);
  };

  // Start direct message
  const handleStartDM = async (recipient: Member) => {
    if (!currentUser) return;
    const dmId = await createOrGetDirectMessage(currentUser, recipient);
    if (dmId) {
      setActiveDMId(dmId);
      setActiveSection('messages');
    }
    setIsMobileSidebarOpen(false);
  };

  // Create Channel Handler
  const handleCreateChannel = async (channelData: Partial<Channel>) => {
    if (!currentUser) return;
    const channelId = await createChannel({
      name: channelData.name || 'new-channel',
      topic: channelData.topic || 'General Channel',
      description: channelData.description,
      category: channelData.category || 'Departments',
      isPrivate: !!channelData.isPrivate,
      members: [currentUser.id]
    });

    if (channelId) {
      setActiveChannelId(channelId);
      setActiveSection('channels');
      await logAction('Created Council Channel', `#${channelData.name}`, `Category: ${channelData.category}`);
    }
  };

  // Domain Management Handlers
  const handleAddDomain = async (domain: string, desc?: string) => {
    if (!currentUser) return;
    await addApprovedDomain(domain, desc || 'Official Public Sector Organization', currentUser.name);
    await logAction('Authorized .gov.ng Domain', `@${domain}`, desc || 'Added to allowlist');
  };

  const handleToggleDomainStatus = async (domainId: string) => {
    const dom = approvedDomains.find(d => d.id === domainId);
    if (!dom) return;
    await toggleApprovedDomainStatus(domainId, dom.status);
    await logAction('Updated Domain Status', `@${dom.domain}`, `Status toggled`);
  };

  const handleRemoveDomain = async (domainId: string) => {
    const target = approvedDomains.find(d => d.id === domainId);
    await removeApprovedDomain(domainId);
    if (target) {
      await logAction('Removed Authorized Domain', `@${target.domain}`, 'Revoked from allowlist');
    }
  };

  // Invitations Handlers
  const handleSendInvitation = async (invitation: { email: string; role: UserRole; department: string }) => {
    if (!currentUser) return;
    await createInvitation({
      email: invitation.email,
      role: invitation.role,
      department: invitation.department,
      invitedBy: currentUser.name,
      createdAt: 'Today',
      expiresAt: 'In 7 days'
    });
    await logAction('Issued Official Invitation', invitation.email, `Role: ${invitation.role}`);
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    await revokeInvitation(invitationId);
    await logAction('Revoked Invitation Token', invitationId, 'Cancelled pending enrollment');
  };

  // Task Deliverable Action Handlers
  const handleCreateTask = async (taskData: Partial<TaskItem>) => {
    if (!currentUser) return;
    const taskItem: Partial<TaskItem> = {
      ...taskData,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterAvatar: currentUser.avatar,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assigneeIds: taskData.assigneeIds || [currentUser.id],
      assignees: taskData.assignees || [currentUser],
      tags: taskData.tags || ['Project Deliverables']
    };
    const created = await createTaskItem(taskItem as any);
    await logAction('Created Project Task', taskData.title || 'New Task', `Deliverable: ${taskData.deliverableId || 'General'}, Priority: ${taskData.priority}`);
    return created.id;
  };

  const handleCreateWorkItem = (
    newWorkItem: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage' | 'tasksCount' | 'completedTasksCount' | 'inProgressTasksCount' | 'blockedTasksCount' | 'evidenceCount' | 'activityLogs'>,
    newTasks: Array<{ title: string; description?: string; assigneeId: string; dueDate: string; evidenceRequired?: boolean }>
  ) => {
    const workItemId = `work_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Create task items for this work item
    const createdTasks: TaskItem[] = newTasks.map((t, idx) => {
      const assigneeMember = (members.length > 0 ? members : Object.values(SAMPLE_TEAM_MEMBERS)).find(m => m.id === t.assigneeId) || currentUser || Object.values(SAMPLE_TEAM_MEMBERS)[0];
      return {
        id: `task_${Date.now()}_${idx}`,
        title: t.title,
        description: t.description || '',
        status: 'todo' as TaskStatus,
        priority: 'high',
        workItemId: workItemId,
        workItemTitle: newWorkItem.title,
        deliverableId: workItemId,
        deliverableTitle: newWorkItem.deliverable,
        assignee: assigneeMember,
        assigneeIds: [assigneeMember.id],
        assignees: [assigneeMember],
        reporterId: currentUser?.id || 'usr_officer_olude',
        reporterName: currentUser?.name || 'Olude Ifeoluwa',
        dueDate: t.dueDate,
        evidenceRequired: t.evidenceRequired,
        createdAt: now,
        updatedAt: now,
        tags: [newWorkItem.department || 'Operations', 'Work Item']
      };
    });

    const initialLog: WorkActivityLog = {
      id: `log_${Date.now()}`,
      userId: currentUser?.id || 'usr_officer_olude',
      userName: currentUser?.name || 'Olude Ifeoluwa',
      userAvatar: currentUser?.avatar || '',
      action: 'created',
      description: `Created work item: ${newWorkItem.title} with ${createdTasks.length} accountable tasks.`,
      timestamp: now
    };

    const fullWorkItem: WorkItem = {
      ...newWorkItem,
      id: workItemId,
      status: 'active',
      progressPercentage: 0,
      tasksCount: createdTasks.length,
      completedTasksCount: 0,
      inProgressTasksCount: 0,
      blockedTasksCount: 0,
      evidenceCount: 0,
      evidence: [],
      activityLogs: [initialLog],
      createdAt: now,
      updatedAt: now
    };

    setWorkItems(prev => [fullWorkItem, ...prev]);
    setTasks(prev => [...createdTasks, ...prev]);

    // Async sync to Firestore
    createdTasks.forEach(t => {
      createTaskItem(t as any).catch(() => {});
    });

    logAction('Created Work Item', newWorkItem.title, `Deliverable: ${newWorkItem.deliverable}, ${createdTasks.length} tasks`);
  };

  const handleUpdateWorkItem = (workItemId: string, updates: Partial<WorkItem>) => {
    setWorkItems(prev => prev.map(w => {
      if (w.id !== workItemId) return w;
      return {
        ...w,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }));
    if (selectedWorkItem && selectedWorkItem.id === workItemId) {
      setSelectedWorkItem(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  const handleSubmitEvidence = (
    workItemId: string, 
    evidenceData: { title: string; type: 'document' | 'link' | 'screenshot' | 'data'; url?: string; description: string; taskId?: string }
  ) => {
    const evidenceItem: WorkEvidence = {
      id: `ev_${Date.now()}`,
      workItemId,
      taskId: evidenceData.taskId,
      title: evidenceData.title,
      type: evidenceData.type,
      url: evidenceData.url,
      description: evidenceData.description,
      submittedBy: currentUser || Object.values(SAMPLE_TEAM_MEMBERS)[0],
      submittedAt: new Date().toISOString(),
      status: 'verified'
    };

    const newLog: WorkActivityLog = {
      id: `log_${Date.now()}`,
      userId: currentUser?.id || 'usr_officer_olude',
      userName: currentUser?.name || 'Olude Ifeoluwa',
      userAvatar: currentUser?.avatar || '',
      action: 'submitted_evidence',
      description: `Submitted evidence "${evidenceData.title}" for verification.`,
      timestamp: new Date().toISOString()
    };

    setWorkItems(prev => prev.map(w => {
      if (w.id !== workItemId) return w;
      const updatedEv = [...(w.evidence || []), evidenceItem];
      return {
        ...w,
        evidence: updatedEv,
        evidenceCount: updatedEv.length,
        activityLogs: [newLog, ...(w.activityLogs || [])],
        updatedAt: new Date().toISOString()
      };
    }));

    if (selectedWorkItem && selectedWorkItem.id === workItemId) {
      setSelectedWorkItem(prev => {
        if (!prev) return null;
        const updatedEv = [...(prev.evidence || []), evidenceItem];
        return {
          ...prev,
          evidence: updatedEv,
          evidenceCount: updatedEv.length,
          activityLogs: [newLog, ...(prev.activityLogs || [])],
          updatedAt: new Date().toISOString()
        };
      });
    }

    logAction('Submitted Evidence', evidenceData.title, `For deliverable ${workItemId}`);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    // 1. Immediately update local tasks state
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    }));

    // 2. Persist to Firestore
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {}

    // 3. Update parent WorkItem progress percentage
    const target = tasks.find(t => t.id === taskId);
    if (target && (target.workItemId || target.deliverableId)) {
      const parentId = target.workItemId || target.deliverableId;
      setWorkItems(prev => prev.map(w => {
        if (w.id !== parentId) return w;
        const itemTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t).filter(t => t.workItemId === parentId || t.deliverableId === parentId);
        const completed = itemTasks.filter(t => t.status === 'done').length;
        const inProgress = itemTasks.filter(t => t.status === 'in_progress').length;
        const blocked = itemTasks.filter(t => t.blockedReason).length;
        const total = itemTasks.length || 1;
        const pct = Math.round((completed / total) * 100);

        return {
          ...w,
          progressPercentage: pct,
          completedTasksCount: completed,
          inProgressTasksCount: inProgress,
          blockedTasksCount: blocked,
          status: pct === 100 ? 'completed' : w.status === 'completed' ? 'active' : w.status
        };
      }));
    }

    await logAction('Updated Task Status', target?.title || taskId, `Moved to ${newStatus.toUpperCase()}`);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<TaskItem>) => {
    await updateTaskItem(taskId, updates);
    const target = tasks.find(t => t.id === taskId);
    await logAction('Updated Task Details', target?.title || taskId, `Fields: ${Object.keys(updates).join(', ')}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    await deleteTaskItem(taskId);
    await logAction('Deleted Project Task', target?.title || taskId, `Task Ref ${taskId}`);
  };

  const handleLogout = async () => {
    sessionStorage.setItem('worknest_explicit_logged_out', 'true');
    try {
      if (currentUser) {
        logAction('User Logged Out', currentUser.email, 'Session terminated').catch(() => {});
      }
    } catch {}

    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Sign out error caught:', err);
    } finally {
      setCurrentUser(DEFAULT_OFFICER);
      setIsAuthLoading(false);
    }
  };

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0] || null;
  const activeDM = directMessages.find(dm => dm.id === activeDMId) || directMessages[0] || null;

  // Unread badge counters
  const totalUnreadChannels = channels.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalUnreadDMs = directMessages.reduce((acc, dm) => acc + (dm.unreadCount || 0), 0);
  const totalUnreadEmails = emails.filter(e => !e.isRead).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] dark:bg-[#0d0f12] text-stone-900 dark:text-stone-100">
      
      {/* Offline Status Banner */}
      {!isConnected && (
        <div className="absolute top-0 inset-x-0 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-1 flex items-center justify-center space-x-2 shadow-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are currently offline. Reconnecting to GovNet Gateway...</span>
        </div>
      )}

      {/* 1. Global Navigation Rail */}
      <NavigationRail
        activeSection={activeSection}
        onSelectSection={(section) => {
          setActiveSection(section);
          setIsMobileSidebarOpen(false);
        }}
        unreadChannelsCount={totalUnreadChannels}
        unreadDMsCount={totalUnreadDMs}
        unreadEmailsCount={totalUnreadEmails}
        currentUser={currentUser}
        organization={organization}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickActions={() => setIsQuickActionsOpen(true)}
        onOpenChannelBrowser={() => setIsChannelBrowserOpen(true)}
        onOpenNewChannel={() => setIsCreateChannelOpen(true)}
        onOpenNewDM={() => setIsCreateDMOpen(true)}
        onOpenComposeEmail={() => setIsComposeEmailOpen(true)}
        onLogout={handleLogout}
        onUpdateStatus={handleUpdateStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
        onChangeTheme={(newTheme) => setTheme(newTheme)}
        isNavExpanded={isNavExpanded}
        onToggleNavExpand={toggleNavExpand}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={toggleSidebarCollapse}
      />

      {/* 2. Contextual Sidebar */}
      <ContextualSidebar
        activeSection={activeSection}
        organization={organization}
        channels={channels}
        activeChannel={activeChannel}
        activeChannelId={activeChannelId}
        onSelectChannel={handleSelectChannel}
        onOpenNewChannel={() => setIsCreateChannelOpen(true)}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        onOpenChannelBrowser={() => setIsChannelBrowserOpen(true)}
        favoriteChannelIds={favoriteChannelIds}
        onToggleFavoriteChannel={toggleFavoriteChannel}
        directMessages={directMessages}
        activeDM={activeDM}
        activeDMId={activeDMId}
        onSelectDM={handleSelectDM}
        onOpenNewDM={() => setIsCreateDMOpen(true)}
        onOpenCreateDM={() => setIsCreateDMOpen(true)}
        favoriteDMIds={favoriteDMIds}
        onToggleFavoriteDM={toggleFavoriteDM}
        tasks={tasks}
        deliverables={deliverables}
        activeTaskFilterTab={activeTaskFilterTab}
        onSelectTaskFilterTab={setActiveTaskFilterTab}
        activeTaskDeliverableId={activeTaskDeliverableId}
        onSelectTaskDeliverableId={setActiveTaskDeliverableId}
        activeTaskPriority={activeTaskPriority}
        onSelectTaskPriority={setActiveTaskPriority}
        onOpenCreateTask={() => {
          setActiveSection('tasks');
          setIsCreateTaskModalOpen(true);
        }}
        activeHomeTab={activeHomeTab}
        onSelectHomeTab={setActiveHomeTab}
        plugins={plugins}
        activePluginCategory={activePluginCategory}
        onSelectPluginCategory={setActivePluginCategory}
        activeEmailFolder={activeMailFolder}
        onSelectEmailFolder={(folder) => setActiveMailFolder(folder)}
        onOpenComposeEmail={() => setIsComposeEmailOpen(true)}
        unreadEmailsCount={totalUnreadEmails}
        fileFolders={folders}
        activeFileFilter={activeFileFilter}
        onSelectFileFilter={(filter) => setActiveFileFilter(filter)}
        onOpenUploadFile={() => setActiveSection('files')}
        activeDepartmentFilter={activeDepartmentFilter}
        onSelectDepartmentFilter={(dept) => setActiveDepartmentFilter(dept)}
        members={members}
        currentUser={currentUser}
        activeSettingsTab={activeSettingsTab}
        onSelectSettingsTab={(tab) => setActiveSettingsTab(tab)}
        onOpenScheduleEvent={() => setActiveSection('calendar')}
        onOpenStartMeeting={() => {
          const newRoom = `chambers-${Date.now().toString(36)}`;
          setActiveMeetingRoomId(newRoom);
        }}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={toggleSidebarCollapse}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onNavigateToSection={(section) => setActiveSection(section)}
      />

      {/* 3. Main Operational Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white dark:bg-[#14171c]">
        
        {/* Dynamic Views */}
        <main className="flex-1 h-full overflow-hidden flex pb-16 md:pb-0">
          
          {/* ACTIVE VIDEO MEETING STAGE (Takes over workspace if in call) */}
          {activeMeetingRoomId ? (
            <MeetingRoomView
              meetingId={activeMeetingRoomId}
              currentUser={currentUser}
              onLeaveMeeting={() => setActiveMeetingRoomId(null)}
              onSaveChatToChannel={(chanId, content) => {
                sendMessage({
                  conversationId: chanId,
                  sender: currentUser,
                  content: `[Meeting Notes from Room ${activeMeetingRoomId}]:\n${content}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  reactions: []
                });
              }}
            />
          ) : (
            <>
              {/* A. EXECUTIVE HOME VIEW — WORK AT A GLANCE */}
              {activeSection === 'home' && (
                <HomeView
                  currentUser={currentUser}
                  members={members.length > 0 ? members : Object.values(SAMPLE_TEAM_MEMBERS)}
                  workItems={workItems}
                  tasks={tasks}
                  onOpenCreateWork={() => setIsCreateWorkOpen(true)}
                  onOpenWorkItem={(workItem) => {
                    setSelectedWorkItem(workItem);
                    setIsWorkItemDetailOpen(true);
                  }}
                  onToggleTaskStatus={handleUpdateTaskStatus}
                  onNavigate={(section, targetId) => {
                    if (section === 'work' || section === 'tasks') {
                      setActiveSection('tasks');
                    } else {
                      setActiveSection(section);
                    }
                    if (targetId) {
                      if (section === 'channels') setActiveChannelId(targetId);
                      if (section === 'messages') setActiveDMId(targetId);
                    }
                  }}
                />
              )}

              {/* A.1 PROJECT TASK BOARD & DELIVERABLES VIEW */}
              {activeSection === 'tasks' && (
                <TasksView
                  currentUser={currentUser}
                  members={members.length > 0 ? members : Object.values(SAMPLE_TEAM_MEMBERS)}
                  tasks={tasks}
                  deliverables={workItems.map(w => ({
                    id: w.id,
                    title: w.title,
                    code: w.deliverable,
                    department: w.department,
                    description: w.goal,
                    targetDate: w.deadline,
                    status: w.status === 'completed' ? 'completed' : w.blockedTasksCount > 0 ? 'at_risk' : 'on_track',
                    progressPercentage: w.progressPercentage
                  }))}
                  onCreateTask={handleCreateTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  activeFilterTab={activeTaskFilterTab}
                  onSelectFilterTab={setActiveTaskFilterTab}
                  selectedDeliverableId={activeTaskDeliverableId}
                  onSelectDeliverableId={setActiveTaskDeliverableId}
                  selectedPriority={activeTaskPriority}
                  onSelectPriority={setActiveTaskPriority}
                  isCreateModalOpen={isCreateTaskModalOpen}
                  onOpenCreateModal={() => setIsCreateTaskModalOpen(true)}
                  onCloseCreateModal={() => setIsCreateTaskModalOpen(false)}
                  onSendTaskToChat={(task) => {
                    if (activeChannelId) {
                      handleSendMessage(`📋 **Project Task Directive:** ${task.title}\n*Status:* ${task.status.toUpperCase()} | *Priority:* ${task.priority.toUpperCase()} | *Due:* ${task.dueDate || 'Unscheduled'}\n${task.description || ''}`);
                      setActiveSection('channels');
                    }
                  }}
                  onComposeTaskEmail={(task) => {
                    setReplyingToEmail({
                      id: `draft_${Date.now()}`,
                      subject: `Project Task Milestone: ${task.title}`,
                      body: `Deliverable: ${task.deliverableTitle || 'State Deliverable'}\nStatus: ${task.status.toUpperCase()}\nDue Date: ${task.dueDate || 'Not set'}\n\nTask Details:\n${task.description || ''}`,
                      snippet: (task.description || task.title).slice(0, 80),
                      sender: currentUser,
                      to: task.assignee ? [task.assignee] : [],
                      date: 'Today',
                      timestamp: 'Just now',
                      folder: 'drafts',
                      isRead: true,
                      isStarred: false,
                      tags: ['Project Deliverables', task.priority]
                    });
                    setIsComposeEmailOpen(true);
                  }}
                />
              )}

              {/* B. CHANNELS CHAT VIEW */}
              {activeSection === 'channels' && activeChannel && (
                <ChatView
                  conversationType="channel"
                  activeChannel={activeChannel}
                  activeDM={null}
                  currentUser={currentUser}
                  messages={messages[activeChannel.id] || []}
                  members={members}
                  installedPlugins={plugins}
                  onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
                  onTogglePluginEnabled={handleTogglePluginEnabled}
                  onNavigateToPlugins={() => setActiveSection('plugins')}
                  onSendMessage={handleSendMessage}
                  onAddReaction={handleAddReaction}
                  onDeleteMessage={handleDeleteMessage}
                  onTogglePinMessage={handleTogglePinMessage}
                  onOpenThread={(msg) => setActiveThreadMessage(msg)}
                  activeThreadMessage={activeThreadMessage}
                  onCloseThread={() => setActiveThreadMessage(null)}
                  onSendThreadReply={handleSendThreadReply}
                  onSendConversationToEmail={(content) => {
                    setReplyingToEmail({
                      id: `draft_${Date.now()}`,
                      subject: `Official Notes from #${activeChannel.name}`,
                      body: content,
                      snippet: content.slice(0, 80),
                      sender: currentUser,
                      to: [],
                      date: 'Today',
                      timestamp: 'Just now',
                      folder: 'drafts',
                      isRead: true,
                      isStarred: false,
                      tags: ['From Council Channel']
                    });
                    setIsComposeEmailOpen(true);
                  }}
                  onOpenEmailPreview={(emailId) => {
                    setSelectedEmailIdToOpen(emailId);
                    setActiveSection('email');
                  }}
                />
              )}

              {/* C. DIRECT MESSAGES CHAT VIEW */}
              {activeSection === 'messages' && (
                activeDM ? (
                  <ChatView
                    conversationType="dm"
                    activeChannel={null}
                    activeDM={activeDM}
                    currentUser={currentUser}
                    messages={messages[activeDM.id] || []}
                    members={members}
                    installedPlugins={plugins}
                    onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
                    onTogglePluginEnabled={handleTogglePluginEnabled}
                    onNavigateToPlugins={() => setActiveSection('plugins')}
                    onSendMessage={handleSendMessage}
                    onAddReaction={handleAddReaction}
                    onDeleteMessage={handleDeleteMessage}
                    onTogglePinMessage={handleTogglePinMessage}
                    onOpenThread={(msg) => setActiveThreadMessage(msg)}
                    activeThreadMessage={activeThreadMessage}
                    onCloseThread={() => setActiveThreadMessage(null)}
                    onSendThreadReply={handleSendThreadReply}
                    onSendConversationToEmail={(content) => {
                      setReplyingToEmail({
                        id: `draft_${Date.now()}`,
                        subject: `Direct Official Communication Memo`,
                        body: content,
                        snippet: content.slice(0, 80),
                        sender: currentUser,
                        to: [],
                        date: 'Today',
                        timestamp: 'Just now',
                        folder: 'drafts',
                        isRead: true,
                        isStarred: false,
                        tags: ['From Direct Line']
                      });
                      setIsComposeEmailOpen(true);
                    }}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-stone-50 dark:bg-[#080C14] text-stone-500">
                    <p className="text-sm font-semibold mb-2">Select an officer from the list to start messaging</p>
                    <button
                      onClick={() => setIsCreateDMOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#0062FF] text-white text-xs font-bold shadow-xs"
                    >
                      New Direct Message
                    </button>
                  </div>
                )
              )}

              {/* D. CHATGPT-STYLE PLUGINS & EXTENSIONS HUB */}
              {activeSection === 'plugins' && (
                <PluginsView
                  currentUser={currentUser}
                  plugins={plugins}
                  selectedCategory={activePluginCategory}
                  onSelectCategory={setActivePluginCategory}
                  onTogglePluginEnabled={handleTogglePluginEnabled}
                  onTogglePluginInstalled={handleTogglePluginInstalled}
                  onSaveCustomPlugin={handleSaveCustomPlugin}
                  onUpdatePluginConfig={handleUpdatePluginConfig}
                  onSendToChannel={(content) => {
                    if (activeChannelId) {
                      handleSendMessage(content);
                      setActiveSection('channels');
                    }
                  }}
                  onOpenComposeEmail={(subject, body) => {
                    setReplyingToEmail({
                      id: `draft_${Date.now()}`,
                      subject,
                      body,
                      snippet: body.slice(0, 80),
                      sender: currentUser,
                      to: [],
                      date: 'Today',
                      timestamp: 'Just now',
                      folder: 'drafts',
                      isRead: true,
                      isStarred: false,
                      tags: ['Plugin Dispatch']
                    });
                    setIsComposeEmailOpen(true);
                  }}
                />
              )}

              {/* D. MEETINGS DIRECTORY VIEW */}
              {activeSection === 'meetings' && (
                <MeetingsView
                  currentUser={currentUser}
                  members={members}
                  onJoinMeeting={(meetingId) => {
                    setActiveMeetingRoomId(meetingId);
                  }}
                  onNavigateToCalendar={() => setActiveSection('calendar')}
                />
              )}

              {/* E. ORGANIZATIONAL CALENDAR VIEW */}
              {activeSection === 'calendar' && (
                <CalendarView
                  currentUser={currentUser}
                  members={members}
                  onJoinMeeting={(meetingId) => {
                    setActiveMeetingRoomId(meetingId);
                  }}
                />
              )}

              {/* F. EMAIL VIEW */}
              {activeSection === 'email' && (
            <EmailView
              emails={emails}
              activeFolder={activeMailFolder}
              currentUser={currentUser}
              channels={channels}
              directMessages={directMessages}
              selectedEmailId={selectedEmailIdToOpen}
              onToggleStar={(id) => {
                const target = emails.find(e => e.id === id);
                if (target) updateEmailStatus(id, { isStarred: !target.isStarred });
              }}
              onArchiveEmail={(id) => {
                updateEmailStatus(id, { folder: 'archive' });
                logAction('Archived Email', id, 'Moved to statutory archive');
              }}
              onDeleteEmail={(id) => {
                deleteEmail(id);
                logAction('Deleted Email', id, 'Moved to trash');
              }}
              onMarkAsRead={(id, isRead) => {
                updateEmailStatus(id, { isRead });
              }}
              onOpenCompose={(replyTo) => {
                setReplyingToEmail(replyTo || null);
                setIsComposeEmailOpen(true);
              }}
              onBridgeEmailToChat={handleBridgeEmailToChat}
            />
          )}

          {/* E. SHARED FILES VAULT VIEW */}
          {activeSection === 'files' && (
            <FilesView
              files={files}
              folders={folders}
              activeFilter={activeFileFilter}
              currentUser={currentUser}
              onUploadFile={(newFile) => {
                logAction('Uploaded Statutory Document', newFile.name, `${newFile.size}`);
              }}
              onDeleteFile={(fileId, storagePath) => {
                const target = files.find(f => f.id === fileId);
                deleteFileRecord(fileId, storagePath);
                logAction('Removed File', target?.name || fileId, 'Deleted from repository');
              }}
              onSelectFilePreview={(file) => setPreviewingFile(file)}
            />
          )}

          {/* F. PEOPLE DIRECTORY VIEW */}
          {activeSection === 'people' && (
            <PeopleView
              members={members}
              activeDepartment={activeDepartmentFilter}
              currentUser={currentUser}
              onStartDM={handleStartDM}
              onSendEmailToMember={(member) => {
                setReplyingToEmail({
                  id: `temp_${Date.now()}`,
                  sender: currentUser,
                  to: [member],
                  subject: `Official Memorandum: ${member.department}`,
                  body: `Dear ${member.name.split(' ')[0]},\n\n`,
                  snippet: '',
                  date: 'Today',
                  timestamp: 'Just now',
                  folder: 'drafts',
                  isRead: true,
                  isStarred: false,
                  tags: ['Official Direct']
                });
                setIsComposeEmailOpen(true);
              }}
            />
          )}

          {/* G. GOVERNANCE & SETTINGS VIEW */}
          {activeSection === 'settings' && (
            <SettingsView
              organization={organization}
              onUpdateOrganization={(updated) => {
                updateOrganizationConfig(updated);
                logAction('Updated Organization Profile', organization.name, 'Updated visual & security settings');
              }}
              members={members}
              onAddMember={async (newMem) => {
                const uid = `usr_${Date.now()}`;
                const mem: Member = {
                  id: uid,
                  name: newMem.name || 'Public Officer',
                  email: newMem.email || 'officer@assembly.gov.ng',
                  avatar: newMem.avatar || '',
                  role: newMem.role || 'Member',
                  department: newMem.department || 'Administration & Finance',
                  status: 'offline',
                  jobTitle: newMem.jobTitle || 'Public Sector Officer',
                  isVerifiedGov: true,
                  approvalStatus: 'approved'
                };
                await setDoc(doc(db, 'users', uid), {
                  ...mem,
                  createdAt: serverTimestamp()
                });
                await logAction('Added Authorized Officer', mem.name, `Role: ${mem.role}`);
              }}
              onUpdateMemberRole={async (memberId, role) => {
                await updateUserRole(memberId, role);
                await logAction('Updated Access Tier', memberId, `New Role: ${role}`);
              }}
              onRemoveMember={async (memberId) => {
                await removeUser(memberId);
                await logAction('Revoked Officer Access', memberId, 'Removed from active roster');
              }}
              channels={channels}
              auditLogs={auditLogs}
              activeTab={activeSettingsTab}
              approvedDomains={approvedDomains}
              invitations={invitations}
              onAddDomain={handleAddDomain}
              onToggleDomainStatus={handleToggleDomainStatus}
              onRemoveDomain={handleRemoveDomain}
              onSendInvitation={handleSendInvitation}
              onRevokeInvitation={handleRevokeInvitation}
              isConnected={isConnected}
              onToggleConnection={() => {
                setIsConnected(prev => !prev);
                logAction('Toggled Network Connection', 'GovNet Gateway', `Connected: ${!isConnected}`);
              }}
              theme={theme}
              onSelectTheme={setTheme}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}
            </>
          )}

        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileBottomNav
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setIsMobileSidebarOpen(false);
        }}
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        unreadChannelsCount={totalUnreadChannels}
        unreadDMsCount={totalUnreadDMs}
        unreadEmailsCount={totalUnreadEmails}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* 4. Global Search & Command Modal (Ctrl+K / Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        directMessages={directMessages}
        members={members}
        files={files}
        emails={emails}
        onSelectChannel={(chan) => {
          setActiveChannelId(chan.id);
          setActiveSection('channels');
        }}
        onSelectDM={(dm) => {
          setActiveDMId(dm.id);
          setActiveSection('messages');
        }}
        onSelectFile={(file) => setPreviewingFile(file)}
        onSelectEmail={(email) => {
          setSelectedEmailIdToOpen(email.id);
          setActiveSection('email');
        }}
        onSelectMember={handleStartDM}
      />

      {/* 5. Action Modals */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={handleCreateChannel}
      />

      <CreateDMModal
        isOpen={isCreateDMOpen}
        onClose={() => setIsCreateDMOpen(false)}
        members={members}
        currentUser={currentUser}
        onStartDM={handleStartDM}
      />

      <ComposeEmailModal
        isOpen={isComposeEmailOpen}
        onClose={() => {
          setIsComposeEmailOpen(false);
          setReplyingToEmail(null);
        }}
        onSendEmail={handleSendEmail}
        replyTo={replyingToEmail}
        currentUser={currentUser}
      />

      <FilePreviewModal
        file={previewingFile}
        onClose={() => setPreviewingFile(null)}
      />

      <ChannelBrowserModal
        isOpen={isChannelBrowserOpen}
        onClose={() => setIsChannelBrowserOpen(false)}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={handleSelectChannel}
        onCreateNewChannel={() => {
          setIsChannelBrowserOpen(false);
          setIsCreateChannelOpen(true);
        }}
        favoriteChannelIds={favoriteChannelIds}
        onToggleFavorite={toggleFavoriteChannel}
      />

      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onSelectAction={(actionId) => {
          setIsQuickActionsOpen(false);
          switch (actionId) {
            case 'work':
            case 'create_work':
              setIsCreateWorkOpen(true);
              break;
            case 'message':
            case 'new_message':
              setIsCreateDMOpen(true);
              break;
            case 'channel':
            case 'new_channel':
              setIsCreateChannelOpen(true);
              break;
            case 'email':
            case 'compose_email':
              setIsComposeEmailOpen(true);
              break;
            case 'event':
            case 'schedule_event':
              setActiveSection('calendar');
              break;
            case 'meeting':
            case 'start_meeting': {
              const newRoom = `chambers-${Date.now().toString(36)}`;
              setActiveMeetingRoomId(newRoom);
              break;
            }
            case 'file':
            case 'upload_document':
              setActiveSection('files');
              break;
            default:
              break;
          }
        }}
      />

      {/* 4-STEP GUIDED CREATE WORK MODAL */}
      <CreateWorkModal
        isOpen={isCreateWorkOpen}
        onClose={() => setIsCreateWorkOpen(false)}
        currentUser={currentUser || Object.values(SAMPLE_TEAM_MEMBERS)[0]}
        members={members.length > 0 ? members : Object.values(SAMPLE_TEAM_MEMBERS)}
        onCreateWork={handleCreateWorkItem}
      />

      {/* COMPREHENSIVE WORK ITEM EXECUTION & ACCOUNTABILITY MODAL */}
      <WorkItemDetailModal
        isOpen={isWorkItemDetailOpen}
        onClose={() => {
          setIsWorkItemDetailOpen(false);
          setSelectedWorkItem(null);
        }}
        workItem={selectedWorkItem}
        tasks={tasks}
        currentUser={currentUser || Object.values(SAMPLE_TEAM_MEMBERS)[0]}
        members={members.length > 0 ? members : Object.values(SAMPLE_TEAM_MEMBERS)}
        onToggleTaskStatus={handleUpdateTaskStatus}
        onUpdateWorkItem={handleUpdateWorkItem}
        onSubmitEvidence={handleSubmitEvidence}
        onCreateTaskForWorkItem={(taskData) => {
          if (!selectedWorkItem) return;
          const assignedMember = (members.length > 0 ? members : Object.values(SAMPLE_TEAM_MEMBERS)).find(m => m.id === taskData.assigneeId) || currentUser || Object.values(SAMPLE_TEAM_MEMBERS)[0];
          const newTask: TaskItem = {
            id: `task_${Date.now()}`,
            title: taskData.title,
            description: taskData.description || '',
            status: 'todo',
            priority: 'high',
            workItemId: selectedWorkItem.id,
            workItemTitle: selectedWorkItem.title,
            deliverableId: selectedWorkItem.id,
            deliverableTitle: selectedWorkItem.deliverable,
            assignee: assignedMember,
            assigneeIds: [assignedMember.id],
            assignees: [assignedMember],
            reporterId: currentUser?.id || 'usr_officer_olude',
            reporterName: currentUser?.name || 'Olude Ifeoluwa',
            dueDate: taskData.dueDate,
            evidenceRequired: taskData.evidenceRequired,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [selectedWorkItem.department || 'Operations', 'Work Item']
          };
          setTasks(prev => [newTask, ...prev]);
          createTaskItem(newTask as any).catch(() => {});
        }}
      />

    </div>
  );
}
