import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Calendar, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  Filter,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Member, WorkItem, TaskItem, TaskStatus, ActiveSection } from '../../types';
import { UserAvatar } from '../UserAvatar';
import { calculateWorkMetrics } from '../../lib/workItemsData';

interface HomeViewProps {
  currentUser?: Member | null;
  members?: Member[];
  workItems: WorkItem[];
  tasks: TaskItem[];
  onOpenCreateWork: () => void;
  onOpenWorkItem: (workItem: WorkItem) => void;
  onToggleTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onNavigate?: (section: ActiveSection, targetId?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  members = [],
  workItems = [],
  tasks = [],
  onOpenCreateWork,
  onOpenWorkItem,
  onToggleTaskStatus,
  onNavigate
}) => {
  const [myWorkFilter, setMyWorkFilter] = useState<'today' | 'week' | 'all'>('today');

  const currentUserId = currentUser?.id || 'usr_officer_olude';
  const displayName = currentUser?.name?.split(' ')[0] || 'Olude';

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Compute live metrics across all Work Items & Tasks
  const metrics = useMemo(() => {
    return calculateWorkMetrics(workItems, tasks, currentUserId);
  }, [workItems, tasks, currentUserId]);

  // My Tasks calculation
  const myTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return tasks.filter(t => {
      const isAssigned = t.assigneeIds?.includes(currentUserId) || t.assignees?.some(a => a.id === currentUserId);
      if (!isAssigned) return false;

      if (myWorkFilter === 'today') {
        return t.dueDate === todayStr || (t.dueDate <= todayStr && t.status !== 'done');
      } else if (myWorkFilter === 'week') {
        return t.dueDate <= nextWeekStr;
      }
      return true;
    });
  }, [tasks, currentUserId, myWorkFilter]);

  // Format date helper
  const formatDeadline = (deadlineStr: string) => {
    try {
      const [year, month, day] = deadlineStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return deadlineStr;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#080C14] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 1. EXECUTIVE WORKFLOW STATUS & GREETING */}
        <section className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0062FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md">
                  WorkNest Execution Platform
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {currentUser?.department || 'Executive Operations'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white">
                {getGreetingTime()}, {displayName}.
              </h1>

              {/* Status at a glance statement */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-stone-600 dark:text-stone-300">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <strong>{metrics.deliverablesNeedingAttention} deliverables</strong> need attention
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <strong>{metrics.tasksOverdue} tasks</strong> are overdue
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-stone-600 dark:text-stone-400">
                  <strong>{metrics.tasksDueThisWeek} tasks</strong> due this week
                </span>
              </div>
            </div>

            {/* Prominent + Create Work Action Button */}
            <div className="shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={onOpenCreateWork}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="text-sm font-bold tracking-tight">+ Create Work</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. ATTENTION REQUIRED (Actionable Bottlenecks & Alerts) */}
        {metrics.attentionItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Attention Required
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                {metrics.attentionItems.length} Milestones Impeded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {metrics.attentionItems.map((item) => {
                const matchedWork = item.workItemId ? workItems.find(w => w.id === item.workItemId) : null;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (matchedWork) onOpenWorkItem(matchedWork);
                      else if (onNavigate) onNavigate('tasks');
                    }}
                    className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-rose-200/80 dark:border-rose-900/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {item.type === 'overdue_member' && 'Overdue Contributor'}
                          {item.type === 'blocked_work' && 'Blocked Milestone'}
                          {item.type === 'deadline_approaching' && 'Imminent Deadline'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-colors" />
                      </div>

                      <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">Resolve Bottleneck</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. ACTIVE WORK (High-Impact Work Item Execution Cards) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0062FF]" />
                <span>Active Work & Deliverables</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Outcome-driven deliverables broken down into accountable tasks.
              </p>
            </div>

            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              {workItems.length} Active {workItems.length === 1 ? 'Deliverable' : 'Deliverables'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workItems.map((work) => {
              // Calculate live task counts for this work item
              const itemTasks = tasks.filter(t => t.workItemId === work.id || t.deliverableId === work.id);
              const total = itemTasks.length || work.tasksCount;
              const completed = itemTasks.length > 0 ? itemTasks.filter(t => t.status === 'done').length : work.completedTasksCount;
              const inProgress = itemTasks.length > 0 ? itemTasks.filter(t => t.status === 'in_progress').length : work.inProgressTasksCount;
              const blocked = itemTasks.length > 0 ? itemTasks.filter(t => t.blockedReason || (t.status === 'todo' && t.tags?.includes('Blocked'))).length : work.blockedTasksCount;
              const progressPct = total > 0 ? Math.round((completed / total) * 100) : work.progressPercentage;

              return (
                <div
                  key={work.id}
                  className="bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    {/* Header line: Deliverable tag & Due date */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0062FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded truncate max-w-[65%]">
                        {work.deliverable}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 shrink-0">
                        Due {formatDeadline(work.deadline)}
                      </span>
                    </div>

                    {/* Title and Goal */}
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-stone-900 dark:text-white tracking-tight leading-snug">
                        {work.title}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {work.goal}
                      </p>
                    </div>

                    {/* High-Impact Visual Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-stone-600 dark:text-stone-400 font-medium">Progress</span>
                        <span className="font-mono font-bold text-[#0062FF] dark:text-blue-400">
                          {progressPct}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div
                          className="h-full bg-[#0062FF] rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Accountable Owner & Contributors */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <div className="flex items-center space-x-2">
                        <UserAvatar user={work.owner} size="xs" />
                        <div>
                          <p className="text-[11px] text-stone-400 font-semibold leading-none">Accountable</p>
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                            {work.owner.name}
                          </p>
                        </div>
                      </div>

                      {/* Contributor Avatar Stacks */}
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {work.contributors.slice(0, 3).map((c, i) => (
                          <div key={c.id || i} className="ring-2 ring-white dark:ring-stone-900 rounded-full">
                            <UserAvatar user={c} size="xs" />
                          </div>
                        ))}
                        {work.contributors.length > 3 && (
                          <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300 flex items-center justify-center ring-2 ring-white dark:ring-stone-900">
                            +{work.contributors.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Task Breakdown Pill Summary */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-stone-600 dark:text-stone-300 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800">
                        {total} Tasks
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {completed} Done
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {inProgress} Active
                      </span>
                      {blocked > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold">
                          {blocked} Blocked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open Work Execution Action */}
                  <div className="p-3 bg-stone-50/70 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800/80">
                    <button
                      type="button"
                      onClick={() => onOpenWorkItem(work)}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold shadow-2xs hover:border-[#0062FF] hover:text-[#0062FF] transition-all cursor-pointer"
                    >
                      <span>Open Work</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. MY WORK (Personal Accountability & Execution) */}
        <section className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>My Accountable Tasks</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Actions assigned directly to you requiring deliverable execution or proof.
              </p>
            </div>

            {/* Filter Tabs: Today / This Week / All */}
            <div className="flex items-center space-x-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMyWorkFilter('today')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  myWorkFilter === 'today'
                    ? 'bg-white dark:bg-stone-900 text-[#0062FF] dark:text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setMyWorkFilter('week')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  myWorkFilter === 'week'
                    ? 'bg-white dark:bg-stone-900 text-[#0062FF] dark:text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setMyWorkFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  myWorkFilter === 'all'
                    ? 'bg-white dark:bg-stone-900 text-[#0062FF] dark:text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                All Assigned
              </button>
            </div>
          </div>

          {/* My Tasks Checklist */}
          <div className="space-y-2.5">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 border border-dashed rounded-xl">
                No active tasks assigned to you in this view.
              </div>
            ) : (
              myTasks.map((task) => {
                const isDone = task.status === 'done';
                const parentWork = workItems.find(w => w.id === task.workItemId || w.id === task.deliverableId);

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isDone 
                        ? 'bg-stone-50/60 dark:bg-stone-900/30 border-stone-200/60 dark:border-stone-800/60 opacity-70' 
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleTaskStatus(task.id, isDone ? 'todo' : 'done')}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isDone 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-stone-300 dark:border-stone-700 hover:border-[#0062FF]'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <p className={`text-xs font-bold leading-snug truncate ${
                          isDone ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'
                        }`}>
                          {task.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-500">
                          {parentWork && (
                            <button
                              type="button"
                              onClick={() => onOpenWorkItem(parentWork)}
                              className="text-[#0062FF] dark:text-blue-400 font-semibold hover:underline"
                            >
                              {parentWork.title}
                            </button>
                          )}
                          <span>•</span>
                          <span>Due {task.dueDate}</span>
                          {task.evidenceRequired && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                Evidence Required
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.status === 'done' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>

                      {parentWork && (
                        <button
                          type="button"
                          onClick={() => onOpenWorkItem(parentWork)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="View deliverable"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
