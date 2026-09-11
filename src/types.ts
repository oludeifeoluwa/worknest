export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Member' | 'Guest';
export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  statusMessage?: string;
  department: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  joinedDate?: string;
  isVerifiedGov?: boolean;
  approvalStatus?: 'approved' | 'pending_approval' | 'rejected';
}

export type User = Member;

export type ChannelCategory = 'Organization' | 'Projects' | 'Departments' | string;

export interface Channel {
  id: string;
  name: string;
  topic: string;
  description: string;
  category: ChannelCategory;
  isPrivate: boolean;
  members: string[]; // Member IDs
  unreadCount?: number;
  isPinned?: boolean;
}

export interface DirectMessage {
  id: string;
  participants: Member[];
  lastMessageSnippet?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isStarred?: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'sheet' | 'img' | 'code' | 'audio' | 'zip';
  url?: string;
  dataUrl?: string;
  mimeType?: string;
}

export interface ThreadReply {
  id: string;
  sender: Member;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface VoiceNote {
  duration: string;
  dataUrl?: string;
  waveform?: number[];
}

export interface SharedEmailReference {
  emailId: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  snippet: string;
  date: string;
}

export interface Message {
  id: string;
  conversationId: string; // channel id or dm id
  sender: Member;
  content: string;
  timestamp: string;
  createdMillis?: number;
  reactions: MessageReaction[];
  attachments?: Attachment[];
  voiceNote?: VoiceNote;
  sharedEmailRef?: SharedEmailReference;
  isPinned?: boolean;
  replies?: ThreadReply[];
  pluginResult?: PluginExecutionResult;
}

export type MailFolder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'trash';

export interface EmailMessage {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
    role?: UserRole;
  };
  to: {
    name: string;
    email: string;
    avatar?: string;
  }[];
  cc?: {
    name: string;
    email: string;
  }[];
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  date: string;
  folder: MailFolder;
  isRead: boolean;
  isStarred: boolean;
  isImportant?: boolean;
  tags: string[];
  attachments?: Attachment[];
}

export interface FileItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'spreadsheet' | 'presentation' | 'code' | 'pdf' | 'archive';
  size: string;
  updatedAt: string;
  updatedBy: Member;
  folderId?: string;
  channelId?: string;
  isSharedWithMe?: boolean;
  tags: string[];
  previewContent?: string;
  downloadUrl?: string;
  dataUrl?: string;
  storagePath?: string;
  mimeType?: string;
  securityClassification?: 'Official' | 'Confidential' | 'Restricted' | 'Public';
}

export interface FileFolder {
  id: string;
  name: string;
  fileCount: number;
}

export interface OrganizationEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendeesCount: number;
  category: 'Meeting' | 'Milestone' | 'Community' | 'Deadline';
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'mention' | 'message' | 'email' | 'event' | 'system' | 'meeting_invite' | 'meeting_reminder' | 'calendar_event';
  targetId?: string;
  targetType?: 'channel' | 'dm' | 'email' | 'event' | 'meeting';
}

export type CalendarEventVisibility = 'organization' | 'department' | 'channel' | 'private';
export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RSVPStatus = 'accepted' | 'declined' | 'tentative' | 'pending';

export interface EventParticipant {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  status: RSVPStatus;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  timezone?: string;
  isAllDay?: boolean;
  location?: string;
  visibility: CalendarEventVisibility;
  department?: string;
  channelId?: string;
  creatorId: string;
  creatorName: string;
  creatorEmail?: string;
  participants: EventParticipant[];
  meetingId?: string; // Attached WorkNest meeting room ID
  meetingUrl?: string;
  hasMeeting?: boolean;
  reminderMinutes?: number; // 5, 10, 15, 30, 60, 1440
  recurrence?: EventRecurrence;
  attachments?: Attachment[];
  colorTag?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MeetingStatus = 'scheduled' | 'waiting' | 'active' | 'ended';
export type ParticipantRole = 'host' | 'co-host' | 'participant' | 'guest';

export interface MeetingParticipantState {
  userId: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  joinedAt: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  waitingRoomStatus?: 'admitted' | 'waiting' | 'rejected';
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'reconnecting';
  streamId?: string;
  deviceState?: {
    hasMic: boolean;
    hasCam: boolean;
  };
}

export interface MeetingChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  savedToChannelId?: string;
}

export interface MeetingRoom {
  id: string; // e.g. "wn-meet-xxx" or secure random
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  hostEmail: string;
  status: MeetingStatus;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  endedAt?: string;
  channelId?: string;
  dmId?: string;
  calendarEventId?: string;
  isWaitingRoomEnabled: boolean;
  isPrivate: boolean;
  allowedDepartment?: string;
  invitedUserIds: string[];
  activeParticipantsCount: number;
  activeScreenShareUserId?: string;
  createdAt: string;
}

export interface MeetingSignal {
  id?: string;
  meetingId: string;
  from: string; // userId
  to: string;   // userId
  type: 'offer' | 'answer' | 'ice-candidate' | 'hand-raise' | 'mute-request' | 'kick' | 'reaction';
  payload: any;
  timestamp: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  createdMillis?: number;
  actor: Member;
  action: string;
  target: string;
  details: string;
  status: 'success' | 'flagged';
  ipAddress?: string;
}

export type ThemeAccentColor = 'emerald' | 'slate' | 'indigo' | 'navy' | 'amber';

export interface ApprovedDomain {
  id: string;
  domain: string;
  addedBy: string;
  addedDate: string;
  status: 'active' | 'disabled';
  description?: string;
}

export type RegistrationApprovalMode = 'admin_approval' | 'auto_approved_domains' | 'invite_only';

export interface OrganizationInvitation {
  id: string;
  email: string;
  invitedBy: string;
  role: UserRole;
  department: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
}

export interface OrganizationSettings {
  id: string;
  name: string;
  logoText: string;
  domain: string;
  accentColor: ThemeAccentColor;
  customLogoUrl?: string;
  emailProvider: 'google' | 'microsoft' | 'imap' | 'none';
  connectedEmailAddress?: string;
  allowGuestInvites: boolean;
  retentionDays: number;
  registrationApprovalMode: RegistrationApprovalMode;
  approvedDomains: ApprovedDomain[];
  requireGovDomain: boolean;
  organizationStateOrAgency?: string;
}

export type ActiveSection = 
  | 'home'
  | 'work'
  | 'messages'
  | 'channels'
  | 'tasks'
  | 'calendar'
  | 'meetings'
  | 'email'
  | 'files'
  | 'plugins'
  | 'translate'
  | 'people'
  | 'settings';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  code: string;
  department?: string;
  description?: string;
  targetDate?: string;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  progressPercentage?: number;
}

export type WorkItemStatus = 'planning' | 'in_progress' | 'active' | 'in_review' | 'completed' | 'blocked';

export interface WorkEvidence {
  id: string;
  workItemId: string;
  taskId?: string;
  taskTitle?: string;
  title: string;
  type: 'link' | 'document' | 'code' | 'metric' | 'note' | 'data' | 'screenshot';
  url?: string;
  notes?: string;
  description?: string;
  fileName?: string;
  fileSize?: string;
  submittedBy: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  submittedAt: string;
  status: 'pending_review' | 'verified' | 'rejected';
  verifiedBy?: {
    id: string;
    name: string;
  };
  verifiedAt?: string;
  verificationNotes?: string;
}

export interface WorkActivityLog {
  id: string;
  workItemId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  details?: string;
  description?: string;
  timestamp: string;
  type?: 'task_completed' | 'evidence_submitted' | 'status_change' | 'review_signed' | 'task_created' | 'blocked' | 'created';
}

export interface WorkItem {
  id: string;
  title: string; // e.g., "Launch the new website", "Prepare the Q4 financial report"
  goal: string; // What are we trying to accomplish?
  deliverable: string; // What tangible result must exist when complete?
  deliverableDescription?: string;
  successCriteria: string[]; // Success criteria checklist
  owner: Member; // Who is ultimately accountable?
  deadline: string; // When must it be completed?
  status: WorkItemStatus;
  progressPercentage: number;
  tasksCount: number;
  completedTasksCount: number;
  inProgressTasksCount: number;
  blockedTasksCount: number;
  evidenceCount?: number;
  reviewTasksCount?: number;
  contributors: Member[]; // Who is participating?
  evidence: WorkEvidence[]; // What proves work has actually been completed?
  activityLog?: WorkActivityLog[];
  activityLogs?: WorkActivityLog[];
  department?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  completionSignOff?: {
    signedBy: string;
    signedAt: string;
    notes?: string;
  };
}

export interface TaskItem {
  id: string;
  organizationId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  assigneeIds: string[];
  assignees?: Member[];
  assignee?: Member;
  reporterId: string;
  reporterName?: string;
  reporterAvatar?: string;
  tags: string[];
  deliverableId?: string;
  deliverableTitle?: string;
  workItemId?: string;
  workItemTitle?: string;
  evidenceRequired?: boolean;
  evidenceSubmitted?: boolean;
  evidenceCount?: number;
  blockedReason?: string;
  channelId?: string;
  channelName?: string;
  checklist?: TaskChecklistItem[];
  attachmentsCount?: number;
  commentsCount?: number;
  estimatedHours?: number;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

export type PluginCategory = 
  | 'All'
  | 'Productivity'
  | 'Communication'
  | 'Storage'
  | 'Analytics'
  | 'Security'
  | 'Developer Tools'
  | 'Notifications'
  | 'Workflow'
  | 'Calendar'
  | 'Files'
  | 'Email'
  | 'Meetings'
  | 'Legal & Compliance'
  | 'Executive & Productivity'
  | 'Data & Finance'
  | 'Development & Security'
  | 'Translation & Comms'
  | 'Media & Visuals'
  | 'Other'
  | 'Custom';

export type IntegrationStatus = 'available' | 'connecting' | 'connected' | 'needs_attention' | 'disabled' | 'update_available' | 'install_error';
export type IntegrationScope = 'organization' | 'user';

export interface PluginCapability {
  id: string;
  name: string;
  description: string;
  commandTrigger?: string; // e.g. "/legal-audit"
  parameters?: Record<string, any>;
}

export interface WorkNestPlugin {
  id: string;
  name: string;
  shortName: string;
  description: string;
  version: string;
  author: string;
  provider?: string;
  category: PluginCategory;
  integrationType?: 'calendar' | 'email' | 'files' | 'meetings' | 'communication' | 'productivity' | 'compliance' | 'security' | 'storage' | 'analytics' | 'developer' | 'notifications' | 'workflow' | 'custom';
  iconName: string;
  color: string;
  isEnabled: boolean;
  isInstalled: boolean;
  isOfficial?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  isCustom?: boolean;
  updateAvailable?: boolean;
  newVersion?: string;
  rating?: number;
  installCount?: number;
  connectionStatus?: IntegrationStatus;
  scope?: IntegrationScope;
  connectedAccountEmail?: string;
  connectedAt?: string;
  installedAt?: string;
  lastSyncedAt?: string;
  lastUpdated?: string;
  syncItemCount?: number;
  tags?: string[];
  features?: string[];
  permissions?: string[];
  documentationUrl?: string;
  supportEmail?: string;
  compatibility?: string;
  capabilities: PluginCapability[];
  systemPrompt?: string;
  samplePrompts: string[];
  commandTriggers: string[]; // e.g. ["/legal", "/audit"]
  endpointUrl?: string;
  authType?: 'none' | 'apiKey' | 'oauth2' | 'bearer';
  config?: Record<string, any>;
  parameters?: {
    name: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    required: boolean;
    description?: string;
    options?: string[];
  }[];
  settingsSchema?: {
    apiKeyRequired?: boolean;
    apiEndpoint?: string;
    customInstructions?: string;
    strictMode?: boolean;
    syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
    autoTriggerOnKeywords?: string[];
    [key: string]: any;
  };
  userConfig?: {
    apiKey?: string;
    customInstructions?: string;
    strictMode?: boolean;
    syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
    enabledInChannels?: boolean;
    enabledInDMs?: boolean;
    syncCalendarEvents?: boolean;
    autoAttachDriveFiles?: boolean;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IntegrationRequest {
  id: string;
  toolName: string;
  websiteUrl?: string;
  category: string;
  useCase: string;
  requestedBy: string;
  userEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'under_review' | 'planned' | 'completed';
  createdAt: string;
}

export type ChatPlugin = WorkNestPlugin;

export interface PluginExecutionStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
}

export interface PluginExecutionResult {
  id: string;
  pluginId: string;
  pluginName: string;
  pluginIcon: string;
  pluginColor: string;
  timestamp: string;
  inputPrompt: string;
  status: 'running' | 'success' | 'failed';
  summary: string;
  detailedOutput: string;
  executionSteps?: PluginExecutionStep[];
  structuredData?: Record<string, any>;
  actionButtons?: { 
    label: string; 
    action: 'copy' | 'save_gazette' | 'compose_dispatch' | 'insert_chat'; 
    payload?: any;
  }[];
}

export interface TranslationRecord {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  sourceLangName: string;
  targetLang: string;
  targetLangName: string;
  formality: string;
  timestamp: string;
  phoneticGuide?: string | null;
  nuanceNote?: string | null;
}

