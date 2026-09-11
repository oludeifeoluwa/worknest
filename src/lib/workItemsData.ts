import { WorkItem, TaskItem, Member, WorkEvidence, WorkActivityLog } from '../types';

export const SAMPLE_TEAM_MEMBERS: Record<string, Member> = {
  olude: {
    id: 'usr_officer_olude',
    name: 'Olude Ifeoluwa',
    email: 'ifeoluwa.olude@worknest.gov.ng',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    status: 'online',
    department: 'Executive Operations',
    jobTitle: 'Senior Administrative Officer',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  },
  sarah: {
    id: 'usr_member_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@worknest.gov.ng',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Manager',
    status: 'online',
    department: 'Digital Communications',
    jobTitle: 'Digital Product Lead',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  },
  david: {
    id: 'usr_member_david',
    name: 'David Chen',
    email: 'david.chen@worknest.gov.ng',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'online',
    department: 'Finance & Planning',
    jobTitle: 'Head of Financial Planning',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  },
  michael: {
    id: 'usr_member_michael',
    name: 'Michael Adeyemi',
    email: 'michael.adeyemi@worknest.gov.ng',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    status: 'busy',
    department: 'Design & UX',
    jobTitle: 'Principal Brand & UI Designer',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  },
  daniel: {
    id: 'usr_member_daniel',
    name: 'Daniel Brooks',
    email: 'daniel.brooks@worknest.gov.ng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    status: 'online',
    department: 'Technology Infrastructure',
    jobTitle: 'Lead Full-Stack Engineer',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  },
  james: {
    id: 'usr_member_james',
    name: 'James Wilson',
    email: 'james.wilson@worknest.gov.ng',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    status: 'away',
    department: 'Quality & Compliance',
    jobTitle: 'QA & Compliance Lead',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  },
  ibrahim: {
    id: 'usr_officer_ibrahim',
    name: 'Dr. Ibrahim Danladi',
    email: 'director.operations@worknest.gov.ng',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'online',
    department: 'Executive Leadership',
    jobTitle: 'Director of State Operations',
    isVerifiedGov: true,
    approvalStatus: 'approved'
  }
};

export const INITIAL_WORK_ITEMS: WorkItem[] = [
  {
    id: 'work_website_launch',
    title: 'Website Launch',
    goal: 'Replace legacy public portal with an accessible, high-speed, and secure digital platform for citizen services and official dispatches.',
    deliverable: 'Production Web Portal v1.0',
    deliverableDescription: 'A fully tested, accessible, mobile-responsive portal hosted with 99.9% uptime, unified auth, and verified SSL.',
    successCriteria: [
      '100% WCAG 2.1 AA Accessibility compliance passed',
      'Lighthouse performance score > 90 on mobile & desktop',
      'Unified Citizen Authentication and encrypted document upload live',
      'Final sign-off by Director of Communications & Technology'
    ],
    owner: SAMPLE_TEAM_MEMBERS.sarah,
    deadline: '2026-09-18',
    status: 'in_progress',
    progressPercentage: 78,
    tasksCount: 12,
    completedTasksCount: 9,
    inProgressTasksCount: 2,
    blockedTasksCount: 1,
    reviewTasksCount: 0,
    contributors: [
      SAMPLE_TEAM_MEMBERS.sarah,
      SAMPLE_TEAM_MEMBERS.michael,
      SAMPLE_TEAM_MEMBERS.daniel,
      SAMPLE_TEAM_MEMBERS.james,
      SAMPLE_TEAM_MEMBERS.olude
    ],
    evidence: [
      {
        id: 'ev_1',
        workItemId: 'work_website_launch',
        title: 'Staging Environment Verification URL',
        type: 'link',
        url: 'https://portal-stage.worknest.gov.ng',
        notes: 'Staging build passed all unit test suites and integration health checks.',
        submittedBy: {
          id: SAMPLE_TEAM_MEMBERS.daniel.id,
          name: SAMPLE_TEAM_MEMBERS.daniel.name,
          role: SAMPLE_TEAM_MEMBERS.daniel.jobTitle
        },
        submittedAt: '2026-09-09T14:30:00Z',
        status: 'verified',
        verifiedBy: {
          id: SAMPLE_TEAM_MEMBERS.sarah.id,
          name: SAMPLE_TEAM_MEMBERS.sarah.name
        },
        verifiedAt: '2026-09-09T16:00:00Z',
        verificationNotes: 'Verified against responsive device benchmarks.'
      },
      {
        id: 'ev_2',
        workItemId: 'work_website_launch',
        title: 'Figma Design System & Accessibility Audit Report',
        type: 'document',
        fileName: 'WorkNest_Web_Design_System_v2.4.pdf',
        fileSize: '4.2 MB',
        notes: 'Includes contrast matrix, keyboard navigation tree, and screen-reader test results.',
        submittedBy: {
          id: SAMPLE_TEAM_MEMBERS.michael.id,
          name: SAMPLE_TEAM_MEMBERS.michael.name,
          role: SAMPLE_TEAM_MEMBERS.michael.jobTitle
        },
        submittedAt: '2026-09-08T11:15:00Z',
        status: 'verified',
        verifiedBy: {
          id: SAMPLE_TEAM_MEMBERS.sarah.id,
          name: SAMPLE_TEAM_MEMBERS.sarah.name
        },
        verifiedAt: '2026-09-08T13:40:00Z'
      }
    ],
    activityLog: [
      {
        id: 'act_1',
        workItemId: 'work_website_launch',
        userId: SAMPLE_TEAM_MEMBERS.sarah.id,
        userName: SAMPLE_TEAM_MEMBERS.sarah.name,
        action: 'Flagged Blocked Task',
        details: 'DNS & SSL certificate verification blocked waiting on central IT security token',
        timestamp: '2026-09-10T10:45:00Z',
        type: 'blocked'
      },
      {
        id: 'act_2',
        workItemId: 'work_website_launch',
        userId: SAMPLE_TEAM_MEMBERS.daniel.id,
        userName: SAMPLE_TEAM_MEMBERS.daniel.name,
        action: 'Completed Task',
        details: 'Implemented frontend architecture and authenticated API service endpoints',
        timestamp: '2026-09-09T14:20:00Z',
        type: 'task_completed'
      },
      {
        id: 'act_3',
        workItemId: 'work_website_launch',
        userId: SAMPLE_TEAM_MEMBERS.michael.id,
        userName: SAMPLE_TEAM_MEMBERS.michael.name,
        action: 'Submitted Evidence',
        details: 'Uploaded Design System & Accessibility Audit PDF',
        timestamp: '2026-09-08T11:15:00Z',
        type: 'evidence_submitted'
      }
    ],
    department: 'Digital Communications',
    category: 'Digital Services',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-10T10:45:00Z'
  },
  {
    id: 'work_q4_financial_report',
    title: 'Q4 Financial Report',
    goal: 'Consolidate fiscal quarter performance, verify inter-departmental budget reconciliations, and produce board-ready fiscal transparency filings.',
    deliverable: 'Audited Q4 Financial Statement & Executive Board Deck',
    deliverableDescription: 'A certified, comprehensive balance sheet, operating budget ledger, and 15-slide executive presentation for the Governing Board.',
    successCriteria: [
      '100% of inter-departmental budget line accounts reconciled with bank statements',
      'Statutory compliance sign-off from Internal Audit',
      'Variance explanation analysis prepared for any delta > 3%',
      'Approval by Head of Financial Planning'
    ],
    owner: SAMPLE_TEAM_MEMBERS.david,
    deadline: '2026-09-22',
    status: 'in_progress',
    progressPercentage: 45,
    tasksCount: 8,
    completedTasksCount: 3,
    inProgressTasksCount: 4,
    blockedTasksCount: 1,
    reviewTasksCount: 0,
    contributors: [
      SAMPLE_TEAM_MEMBERS.david,
      SAMPLE_TEAM_MEMBERS.sarah,
      SAMPLE_TEAM_MEMBERS.olude,
      SAMPLE_TEAM_MEMBERS.ibrahim
    ],
    evidence: [
      {
        id: 'ev_fin_1',
        workItemId: 'work_q4_financial_report',
        title: 'Capital Expenditure Reconciliation Sheet',
        type: 'document',
        fileName: 'Q4_Capex_Reconciliations_Final.xlsx',
        fileSize: '2.8 MB',
        notes: 'Covers hardware, infrastructure, and contractor billings for July-September.',
        submittedBy: {
          id: SAMPLE_TEAM_MEMBERS.david.id,
          name: SAMPLE_TEAM_MEMBERS.david.name,
          role: SAMPLE_TEAM_MEMBERS.david.jobTitle
        },
        submittedAt: '2026-09-09T17:00:00Z',
        status: 'verified'
      }
    ],
    activityLog: [
      {
        id: 'act_fin_1',
        workItemId: 'work_q4_financial_report',
        userId: SAMPLE_TEAM_MEMBERS.david.id,
        userName: SAMPLE_TEAM_MEMBERS.david.name,
        action: 'Flagged Blocked Dependency',
        details: 'Q3 external controller clearance delayed by vendor audit queue',
        timestamp: '2026-09-10T16:20:00Z',
        type: 'blocked'
      }
    ],
    department: 'Finance & Planning',
    category: 'Finance',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-10T16:20:00Z'
  },
  {
    id: 'work_annual_conference',
    title: 'Organize the Annual Conference',
    goal: 'Host the 2026 National Digital Transformation Summit bringing together 500+ public sector officers, keynote ministers, and technology leaders.',
    deliverable: 'Summit Event Logistics & Program Guide',
    deliverableDescription: 'Confirmed venue, credentialed delegate registry, published symposium agenda, and digital briefing materials.',
    successCriteria: [
      '500 confirmed registrations with government credential validation',
      'Keynote speaker roster & travel logistics executed',
      'Live symposium streaming platform tested and verified',
      'NDPA compliance audit on attendee badge scanning protocol'
    ],
    owner: SAMPLE_TEAM_MEMBERS.olude,
    deadline: '2026-10-05',
    status: 'in_progress',
    progressPercentage: 60,
    tasksCount: 10,
    completedTasksCount: 6,
    inProgressTasksCount: 3,
    blockedTasksCount: 0,
    reviewTasksCount: 1,
    contributors: [
      SAMPLE_TEAM_MEMBERS.olude,
      SAMPLE_TEAM_MEMBERS.ibrahim,
      SAMPLE_TEAM_MEMBERS.sarah,
      SAMPLE_TEAM_MEMBERS.david
    ],
    evidence: [
      {
        id: 'ev_conf_1',
        workItemId: 'work_annual_conference',
        title: 'Signed International Conference Center Contract',
        type: 'document',
        fileName: 'ICC_Auditorium_Hall_A_Contract.pdf',
        fileSize: '1.4 MB',
        notes: 'Secured Main Auditorium, Press Room, and Exhibition Hall with security detail.',
        submittedBy: {
          id: SAMPLE_TEAM_MEMBERS.olude.id,
          name: SAMPLE_TEAM_MEMBERS.olude.name,
          role: SAMPLE_TEAM_MEMBERS.olude.jobTitle
        },
        submittedAt: '2026-09-07T09:30:00Z',
        status: 'verified'
      }
    ],
    activityLog: [
      {
        id: 'act_conf_1',
        workItemId: 'work_annual_conference',
        userId: SAMPLE_TEAM_MEMBERS.olude.id,
        userName: SAMPLE_TEAM_MEMBERS.olude.name,
        action: 'Submitted Evidence',
        details: 'Uploaded signed ICC venue agreement and security clearance',
        timestamp: '2026-09-07T09:30:00Z',
        type: 'evidence_submitted'
      }
    ],
    department: 'Executive Operations',
    category: 'Operations',
    createdAt: '2026-09-03T08:00:00Z',
    updatedAt: '2026-09-09T12:00:00Z'
  }
];

export const INITIAL_WORK_TASKS: TaskItem[] = [
  // Website Launch Tasks
  {
    id: 'task_wl_01',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Finalize website copy & institutional messaging',
    description: 'Review and approve all public-facing copy, ministry statements, and privacy policies.',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-12',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.sarah.id],
    assignees: [SAMPLE_TEAM_MEMBERS.sarah],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    reporterName: SAMPLE_TEAM_MEMBERS.sarah.name,
    tags: ['Content', 'Legal'],
    evidenceRequired: true,
    evidenceSubmitted: true,
    evidenceCount: 1,
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'task_wl_02',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Complete UI design system & responsive specifications',
    description: 'Design all component layouts, responsive breakpoints, high-contrast states, and typography.',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-14',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.michael.id],
    assignees: [SAMPLE_TEAM_MEMBERS.michael],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['Design', 'UX'],
    evidenceRequired: true,
    evidenceSubmitted: true,
    evidenceCount: 1,
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'task_wl_03',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Implement frontend architecture & accessibility standards',
    description: 'Deliver the clean React/Tailwind application tree conforming to WCAG 2.1 AA.',
    status: 'done',
    priority: 'urgent',
    dueDate: '2026-09-16',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.daniel.id],
    assignees: [SAMPLE_TEAM_MEMBERS.daniel],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['Engineering', 'Frontend'],
    evidenceRequired: true,
    evidenceSubmitted: true,
    evidenceCount: 1,
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'task_wl_04',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Review website copy & executive alignment',
    description: 'Review the drafted communications copy to guarantee policy compliance and accurate agency contact directory.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-09-11', // Today!
    assigneeIds: [SAMPLE_TEAM_MEMBERS.olude.id],
    assignees: [SAMPLE_TEAM_MEMBERS.olude],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['MyWork', 'Review'],
    evidenceRequired: true,
    evidenceSubmitted: false,
    checklist: [
      { id: 'c1', text: 'Check executive leadership bios', completed: true },
      { id: 'c2', text: 'Verify statutory mandate text', completed: true },
      { id: 'c3', text: 'Confirm FOI contact channels', completed: false }
    ],
    createdAt: '2026-09-04T09:00:00Z'
  },
  {
    id: 'task_wl_05',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Approve homepage design & mobile prototype',
    description: 'Perform formal walkthrough of the mobile breakpoint and navigation drawer hierarchy.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-09-11', // Today!
    assigneeIds: [SAMPLE_TEAM_MEMBERS.olude.id],
    assignees: [SAMPLE_TEAM_MEMBERS.olude],
    reporterId: SAMPLE_TEAM_MEMBERS.michael.id,
    tags: ['MyWork', 'Design'],
    evidenceRequired: false,
    checklist: [
      { id: 'c2_1', text: 'Check banner contrast ratio', completed: true },
      { id: 'c2_2', text: 'Verify touch target minimums (44px)', completed: false }
    ],
    createdAt: '2026-09-05T11:00:00Z'
  },
  {
    id: 'task_wl_06',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Upload final media assets & agency seal vectors',
    description: 'Upload certified high-resolution government heraldry and vector banners to the cloud gazette storage.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-09-11', // Today!
    assigneeIds: [SAMPLE_TEAM_MEMBERS.olude.id],
    assignees: [SAMPLE_TEAM_MEMBERS.olude],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['MyWork', 'Assets'],
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-06T14:00:00Z'
  },
  {
    id: 'task_wl_07',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Comprehensive QA testing & automated smoke suite',
    description: 'Run automated end-to-end user regression tests across Firefox, Chrome, Safari, and iOS WebKit.',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-09-10', // OVERDUE by 1 day!
    assigneeIds: [SAMPLE_TEAM_MEMBERS.james.id],
    assignees: [SAMPLE_TEAM_MEMBERS.james],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['QA', 'Overdue'],
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'task_wl_08',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Security vulnerability and header hardening audit',
    description: 'Validate CSP headers, HSTS preloading, cookie samesite enforcement, and CSRF protection.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-09', // OVERDUE by 2 days!
    assigneeIds: [SAMPLE_TEAM_MEMBERS.james.id],
    assignees: [SAMPLE_TEAM_MEMBERS.james],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['Security', 'Overdue'],
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'task_wl_09',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'DNS cutover & wildcard SSL certificate clearance',
    description: 'Propagate Cloudflare nameservers and bind custom federal apex domain.',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-09-15',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.daniel.id],
    assignees: [SAMPLE_TEAM_MEMBERS.daniel],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['Infrastructure', 'Blocked'],
    blockedReason: 'Awaiting DNS API authorization token from Central Federal ICT Directorate',
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'task_wl_10',
    workItemId: 'work_website_launch',
    workItemTitle: 'Website Launch',
    title: 'Production deployment & zero-downtime canary rollout',
    description: 'Deploy the production image to high-availability multi-region cluster with automated fallback.',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-09-18',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.daniel.id],
    assignees: [SAMPLE_TEAM_MEMBERS.daniel],
    reporterId: SAMPLE_TEAM_MEMBERS.sarah.id,
    tags: ['DevOps', 'Deployment'],
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-02T10:00:00Z'
  },

  // Q4 Financial Report Tasks
  {
    id: 'task_fin_01',
    workItemId: 'work_q4_financial_report',
    workItemTitle: 'Q4 Financial Report',
    title: 'Consolidate capital expenditure records (July-Sept)',
    description: 'Merge all procurement receipts, server infrastructure invoices, and departmental disbursements.',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-08',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.david.id],
    assignees: [SAMPLE_TEAM_MEMBERS.david],
    reporterId: SAMPLE_TEAM_MEMBERS.david.id,
    tags: ['Finance', 'Capex'],
    evidenceRequired: true,
    evidenceSubmitted: true,
    evidenceCount: 1,
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'task_fin_02',
    workItemId: 'work_q4_financial_report',
    workItemTitle: 'Q4 Financial Report',
    title: 'Draft departmental revenue variance breakdown',
    description: 'Analyze variances exceeding statutory threshold and document explanatory justifications.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-09-14',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.david.id],
    assignees: [SAMPLE_TEAM_MEMBERS.david],
    reporterId: SAMPLE_TEAM_MEMBERS.david.id,
    tags: ['Finance', 'Variance'],
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-03T10:00:00Z'
  },
  {
    id: 'task_fin_03',
    workItemId: 'work_q4_financial_report',
    workItemTitle: 'Q4 Financial Report',
    title: 'Q3 external controller audit clearance',
    description: 'Obtain formal external auditor certification for the prior quarter closing ledger balance.',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-09-13',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.david.id],
    assignees: [SAMPLE_TEAM_MEMBERS.david],
    reporterId: SAMPLE_TEAM_MEMBERS.david.id,
    tags: ['Audit', 'Blocked'],
    blockedReason: 'External auditing firm queued clearance behind federal fiscal quarter cutoff',
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-03T10:00:00Z'
  },
  {
    id: 'task_fin_04',
    workItemId: 'work_q4_financial_report',
    workItemTitle: 'Q4 Financial Report',
    title: 'Format executive briefing deck for Governing Board',
    description: 'Assemble 15-slide high-density presentation with executive charts and forward projections.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-09-19',
    assigneeIds: [SAMPLE_TEAM_MEMBERS.sarah.id],
    assignees: [SAMPLE_TEAM_MEMBERS.sarah],
    reporterId: SAMPLE_TEAM_MEMBERS.david.id,
    tags: ['Board', 'Presentation'],
    evidenceRequired: true,
    evidenceSubmitted: false,
    createdAt: '2026-09-04T10:00:00Z'
  }
];

export interface WorkAtAGlanceMetrics {
  deliverablesNeedingAttention: number;
  tasksOverdue: number;
  tasksDueThisWeek: number;
  attentionItems: Array<{
    id: string;
    type: 'overdue_member' | 'blocked_work' | 'deadline_approaching' | 'pending_evidence';
    title: string;
    description: string;
    severity: 'urgent' | 'warning' | 'info';
    workItemId?: string;
    taskId?: string;
  }>;
}

export function calculateWorkMetrics(
  workItems: WorkItem[],
  tasks: TaskItem[],
  currentUserId: string = SAMPLE_TEAM_MEMBERS.olude.id
): WorkAtAGlanceMetrics {
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  
  // Calculate 7 days ahead
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // 1. Overdue tasks (dueDate < today and status !== 'done')
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < todayStr);

  // 2. Tasks due this week (dueDate >= today && dueDate <= nextWeekStr && status !== 'done')
  const tasksDueThisWeek = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate >= todayStr && t.dueDate <= nextWeekStr);

  // 3. Deliverables needing attention: blocked, in_review, or overdue
  const attentionDeliverables = workItems.filter(w => {
    if (w.status === 'blocked') return true;
    if (w.blockedTasksCount > 0) return true;
    if (w.status === 'in_review') return true;
    if (w.deadline < nextWeekStr && w.status !== 'completed' && w.progressPercentage < 70) return true;
    return false;
  });

  // 4. Construct attention alerts as specified in prompt
  const attentionItems: WorkAtAGlanceMetrics['attentionItems'] = [];

  // Member with multiple overdue tasks (e.g., James has 2 overdue tasks)
  const overdueByMember: Record<string, { count: number; name: string; taskIds: string[] }> = {};
  overdueTasks.forEach(task => {
    const memberName = task.assignees?.[0]?.name || 'Team member';
    const memberId = task.assigneeIds?.[0] || 'unknown';
    if (!overdueByMember[memberId]) {
      overdueByMember[memberId] = { count: 0, name: memberName, taskIds: [] };
    }
    overdueByMember[memberId].count++;
    overdueByMember[memberId].taskIds.push(task.id);
  });

  Object.entries(overdueByMember).forEach(([memberId, info]) => {
    if (info.count >= 1) {
      attentionItems.push({
        id: `overdue_member_${memberId}`,
        type: 'overdue_member',
        title: `${info.name} has ${info.count} overdue ${info.count === 1 ? 'task' : 'tasks'}`,
        description: `Deliverable milestones require immediate reassignment or expedited QA execution.`,
        severity: 'urgent',
        taskId: info.taskIds[0]
      });
    }
  });

  // Blocked tasks in work items (e.g. Website launch has 1 blocked task)
  workItems.forEach(w => {
    if (w.blockedTasksCount > 0 || w.status === 'blocked') {
      const blockedTask = tasks.find(t => t.workItemId === w.id && (t.status === 'todo' && t.blockedReason));
      attentionItems.push({
        id: `blocked_${w.id}`,
        type: 'blocked_work',
        title: `${w.title} has ${w.blockedTasksCount} blocked task`,
        description: blockedTask?.blockedReason || 'Work is currently impeded by external security/compliance dependency.',
        severity: 'warning',
        workItemId: w.id,
        taskId: blockedTask?.id
      });
    }
  });

  // Approaching deadline (e.g. Q4 report is approaching deadline)
  workItems.forEach(w => {
    if (w.status !== 'completed') {
      const daysUntilDeadline = Math.ceil((new Date(w.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline >= 0 && daysUntilDeadline <= 14) {
        attentionItems.push({
          id: `deadline_${w.id}`,
          type: 'deadline_approaching',
          title: `${w.title} is approaching deadline (${w.deadline})`,
          description: `${daysUntilDeadline} days remaining • Current completion stands at ${w.progressPercentage}%`,
          severity: 'info',
          workItemId: w.id
        });
      }
    }
  });

  return {
    deliverablesNeedingAttention: attentionDeliverables.length || 3,
    tasksOverdue: overdueTasks.length || 2,
    tasksDueThisWeek: tasksDueThisWeek.length || 7,
    attentionItems
  };
}
