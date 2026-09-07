import {
  Member,
  Channel,
  DirectMessage,
  Message,
  EmailMessage,
  FileItem,
  FileFolder,
  OrganizationEvent,
  NotificationItem,
  AuditLogEntry,
  OrganizationSettings,
  ApprovedDomain,
  OrganizationInvitation,
  ProjectDeliverable,
  TaskItem
} from './types';

export const createInitialWorkspaceData = () => {
  const approvedDomains: ApprovedDomain[] = [];
  const invitations: OrganizationInvitation[] = [];

  const organization: OrganizationSettings = {
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
    organizationStateOrAgency: 'WorkNest Enterprise Workspace',
    approvedDomains: []
  };

  const members: Member[] = [];
  const channels: Channel[] = [];
  const directMessages: DirectMessage[] = [];
  const messages: Record<string, Message[]> = {};
  const emails: EmailMessage[] = [];
  const files: FileItem[] = [];
  const folders: FileFolder[] = [
    { id: 'fld_general', name: 'General Documents', fileCount: 0 },
    { id: 'fld_official', name: 'Official Gazettes & Memos', fileCount: 0 },
    { id: 'fld_finance', name: 'Budgets & Financial Filings', fileCount: 0 },
    { id: 'fld_legal', name: 'Statutory & Regulatory Records', fileCount: 0 }
  ];
  const events: OrganizationEvent[] = [];
  const notifications: NotificationItem[] = [];
  const auditLogs: AuditLogEntry[] = [];
  const deliverables: ProjectDeliverable[] = [];
  const tasks: TaskItem[] = [];

  return {
    organization,
    members,
    channels,
    directMessages,
    messages,
    emails,
    files,
    folders,
    events,
    notifications,
    auditLogs,
    approvedDomains,
    invitations,
    deliverables,
    tasks
  };
};

const defaultInitialData = createInitialWorkspaceData();
export const INITIAL_DELIVERABLES: ProjectDeliverable[] = defaultInitialData.deliverables;
export const INITIAL_TASKS: TaskItem[] = defaultInitialData.tasks;
