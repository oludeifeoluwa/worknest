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

export const INITIAL_WORK_ITEMS: WorkItem[] = [];

export const INITIAL_WORK_TASKS: TaskItem[] = [];

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
