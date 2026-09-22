import { 
  Home, 
  CheckSquare, 
  Target, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Hash, 
  MessageSquare, 
  Video, 
  Mail, 
  Sparkles,
  LucideIcon 
} from 'lucide-react';
import { ActiveSection, UserRole } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section: ActiveSection;
  breadcrumbTitle: string;
  group: 'workflow' | 'operations' | 'communication';
  requiredRoles?: UserRole[];
  badge?: number | string | null;
  badgeVariant?: 'primary' | 'warning' | 'neutral' | 'live';
  filterTab?: 'all' | 'my_tasks' | 'urgent';
}

export interface NavGroup {
  id: 'workflow' | 'operations' | 'communication';
  label: string;
  items: NavItem[];
}

export interface NavigationCounts {
  myTasks?: number;
  activeWork?: number;
  unreadChannels?: number;
  unreadDMs?: number;
  unreadEmails?: number;
  activeMeetings?: number;
  totalFiles?: number;
}

/**
 * Base navigation schema for WorkNest.
 * Fully configurable, supports role-based access control (RBAC), dynamic badges, and deep section routing.
 */
export const BASE_NAV_ITEMS: NavItem[] = [
  // 1. WORKFLOW
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    section: 'home',
    breadcrumbTitle: 'Executive Overview & Briefings',
    group: 'workflow',
  },
  {
    id: 'my_work',
    label: 'My Work',
    icon: CheckSquare,
    section: 'tasks',
    filterTab: 'my_tasks',
    breadcrumbTitle: 'My Work & Directives',
    group: 'workflow',
  },
  {
    id: 'work',
    label: 'Work & Deliverables',
    icon: Target,
    section: 'tasks',
    filterTab: 'all',
    breadcrumbTitle: 'Active Work & Deliverables',
    group: 'workflow',
  },
  {
    id: 'people',
    label: 'People & Accountability',
    icon: Users,
    section: 'people',
    breadcrumbTitle: 'People & Accountability',
    group: 'workflow',
  },

  // 2. OPERATIONS
  {
    id: 'calendar',
    label: 'Calendar & Milestones',
    icon: Calendar,
    section: 'calendar',
    breadcrumbTitle: 'Calendar & Milestones',
    group: 'operations',
  },
  {
    id: 'files',
    label: 'Vault & Evidence',
    icon: FileText,
    section: 'files',
    breadcrumbTitle: 'Vault & Evidence',
    group: 'operations',
  },
  {
    id: 'settings',
    label: 'Governance & Settings',
    icon: Settings,
    section: 'settings',
    breadcrumbTitle: 'Governance & Settings',
    group: 'operations',
    requiredRoles: ['Owner', 'Admin', 'Manager'],
  },

  // 3. COMMUNICATION
  {
    id: 'channels',
    label: 'Channels & Gazettes',
    icon: Hash,
    section: 'channels',
    breadcrumbTitle: 'Official Channels & Gazettes',
    group: 'communication',
  },
  {
    id: 'messages',
    label: 'Direct Messages',
    icon: MessageSquare,
    section: 'messages',
    breadcrumbTitle: 'Direct Communication',
    group: 'communication',
  },
  {
    id: 'meetings',
    label: 'Chambers & Meetings',
    icon: Video,
    section: 'meetings',
    breadcrumbTitle: 'Chambers & Deliberations',
    group: 'communication',
  },
  {
    id: 'email',
    label: 'Official Email',
    icon: Mail,
    section: 'email',
    breadcrumbTitle: 'Official Dispatch & Mail',
    group: 'communication',
  },
  {
    id: 'plugins',
    label: 'Plugins & AI',
    icon: Sparkles,
    section: 'plugins',
    breadcrumbTitle: 'Plugins & Ecosystem',
    group: 'communication',
  },
];

/**
 * Filter navigation groups based on current user role and attach dynamic real-time badges.
 */
export function getNavGroups(
  userRole?: UserRole | null,
  counts: NavigationCounts = {}
): NavGroup[] {
  const groups: Record<'workflow' | 'operations' | 'communication', NavItem[]> = {
    workflow: [],
    operations: [],
    communication: [],
  };

  for (const item of BASE_NAV_ITEMS) {
    // RBAC check: if requiredRoles is defined, ensure current user's role is permitted
    if (item.requiredRoles && userRole && !item.requiredRoles.includes(userRole)) {
      continue;
    }

    // Attach contextual badge counts if available
    let badge: number | string | null = null;
    let badgeVariant: 'primary' | 'warning' | 'neutral' | 'live' = 'neutral';

    if (item.id === 'my_work' && counts.myTasks && counts.myTasks > 0) {
      badge = counts.myTasks;
      badgeVariant = 'warning';
    } else if (item.id === 'work' && counts.activeWork && counts.activeWork > 0) {
      badge = counts.activeWork;
      badgeVariant = 'primary';
    } else if (item.id === 'channels' && counts.unreadChannels && counts.unreadChannels > 0) {
      badge = counts.unreadChannels;
      badgeVariant = 'primary';
    } else if (item.id === 'messages' && counts.unreadDMs && counts.unreadDMs > 0) {
      badge = counts.unreadDMs;
      badgeVariant = 'primary';
    } else if (item.id === 'email' && counts.unreadEmails && counts.unreadEmails > 0) {
      badge = counts.unreadEmails;
      badgeVariant = 'neutral';
    } else if (item.id === 'meetings' && counts.activeMeetings && counts.activeMeetings > 0) {
      badge = 'Live';
      badgeVariant = 'live';
    }

    groups[item.group].push({
      ...item,
      badge,
      badgeVariant,
    });
  }

  return [
    { id: 'workflow', label: 'WORKFLOW', items: groups.workflow },
    { id: 'operations', label: 'OPERATIONS', items: groups.operations },
    { id: 'communication', label: 'COMMUNICATION', items: groups.communication },
  ];
}

/**
 * Resolve the dynamic breadcrumb label based on activeSection and optional context.
 */
export function getBreadcrumbForSection(
  activeSection: ActiveSection,
  context?: {
    activeChannelName?: string;
    activeDMName?: string;
    activeTaskFilter?: 'all' | 'my_tasks' | 'urgent' | string;
  }
): string {
  if (activeSection === 'channels' && context?.activeChannelName) {
    return `#${context.activeChannelName}`;
  }
  if (activeSection === 'messages' && context?.activeDMName) {
    return `@${context.activeDMName}`;
  }
  if (activeSection === 'tasks' && context?.activeTaskFilter === 'my_tasks') {
    return 'My Work & Directives';
  }
  if (activeSection === 'tasks' || (activeSection as string) === 'work') {
    return 'Active Work & Deliverables';
  }

  const matched = BASE_NAV_ITEMS.find((item) => item.section === activeSection);
  return matched ? matched.breadcrumbTitle : 'Executive Overview & Briefings';
}
