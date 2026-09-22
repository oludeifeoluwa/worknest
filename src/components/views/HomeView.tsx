import React, { useState, useMemo } from 'react';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  CheckSquare,
  Plus
} from 'lucide-react';
import { Member, WorkItem, TaskItem, TaskStatus, ActiveSection } from '../../types';
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
  const currentUserId = currentUser?.id || 'usr_sysadmin';
  const fullName = currentUser?.name || 'System Administrator';

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

  // Today's tasks for current user
  const todayTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return tasks.filter(t => {
      const isAssigned = t.assigneeIds?.includes(currentUserId) || t.assignees?.some(a => a.id === currentUserId);
      if (!isAssigned) return false;
      return t.dueDate === todayStr || (t.dueDate <= todayStr && t.status !== 'done');
    });
  }, [tasks, currentUserId]);

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
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B101B] p-4 sm:p-6 lg:p-8 select-none scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP CARD: WORK AT A GLANCE · WORKNEST */}
        <section className="bg-white dark:bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-[#0062FF] dark:text-blue-400 font-bold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              <span>WORK AT A GLANCE · WORKNEST</span>
            </div>

            <button
              id="home-my-work-btn"
              data-testid="home-my-work-btn"
              onClick={() => onNavigate?.('tasks')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#0062FF]" />
              <span>My Work</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-3">
            {getGreetingTime()}, {fullName}.
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 font-normal">
            <span>{metrics.deliverablesNeedingAttention} deliverables need attention</span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <span>{metrics.tasksOverdue} tasks are overdue</span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <span>{metrics.tasksDueThisWeek} tasks scheduled this week</span>
          </div>
        </section>

        {/* 2. MAIN TWO-COLUMN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: ACTIVE WORK & DELIVERABLES */}
          <section className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-xs tracking-wider text-stone-900 dark:text-stone-100 uppercase">
                <Target className="w-4.5 h-4.5 text-[#0062FF]" />
                <span>ACTIVE WORK & DELIVERABLES ({workItems.length})</span>
              </div>

              <button
                id="home-view-all-work-btn"
                data-testid="home-view-all-work-btn"
                onClick={() => onNavigate?.('tasks')}
                className="text-[#0062FF] hover:underline text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>View all work</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Container Card */}
            {workItems.length === 0 ? (
              <div className="bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800 rounded-2xl min-h-[220px] flex flex-col items-center justify-center p-8 shadow-xs text-center space-y-3">
                <Target className="w-9 h-9 text-stone-300 dark:text-stone-600 stroke-[1.5]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">No active work yet</h3>
                  <p className="text-stone-400 dark:text-stone-500 text-xs font-normal max-w-sm">
                    Create your first work item to begin tracking deliverables.
                  </p>
                </div>
                <button
                  id="home-empty-create-work-btn"
                  data-testid="home-empty-create-work-btn"
                  onClick={onOpenCreateWork}
                  className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Work</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workItems.map((work) => {
                  const itemTasks = tasks.filter(t => t.workItemId === work.id || t.deliverableId === work.id);
                  const total = itemTasks.length || work.tasksCount;
                  const completed = itemTasks.length > 0 ? itemTasks.filter(t => t.status === 'done').length : work.completedTasksCount;
                  const progressPct = total > 0 ? Math.round((completed / total) * 100) : work.progressPercentage;

                  return (
                    <div
                      key={work.id}
                      onClick={() => onOpenWorkItem(work)}
                      className="bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0062FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded truncate max-w-[70%]">
                            {work.deliverable}
                          </span>
                          <span className="text-xs font-mono text-stone-500 shrink-0">
                            Due {formatDeadline(work.deadline)}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-snug group-hover:text-[#0062FF] transition-colors">
                          {work.title}
                        </h3>

                        <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                          <div
                            className="h-full bg-[#0062FF] rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                        <span>{completed} of {total} completed</span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Column: ATTENTION REQUIRED & MY TASKS TODAY */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* 1. ATTENTION REQUIRED */}
            <section className="bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs tracking-wider uppercase">
                <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                <span>ATTENTION REQUIRED</span>
              </div>

              {metrics.attentionItems.length === 0 ? (
                <div className="mt-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-3.5 flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200 leading-snug">
                    All active deliverables and tasks are on schedule!
                  </span>
                </div>
              ) : (
                <div className="mt-3.5 space-y-2.5">
                  {metrics.attentionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onNavigate?.('tasks')}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-rose-100 dark:border-rose-950/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. MY TASKS TODAY */}
            <section className="bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-stone-900 dark:text-stone-100 font-bold text-xs tracking-wider uppercase">
                  <CheckSquare className="w-4 h-4 text-[#0062FF]" />
                  <span>MY TASKS TODAY</span>
                </div>

                <button
                  id="home-go-to-my-work-btn"
                  data-testid="home-go-to-my-work-btn"
                  onClick={() => onNavigate?.('tasks')}
                  className="text-[#0062FF] hover:underline text-xs font-semibold cursor-pointer"
                >
                  Go to My Work
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <p className="text-stone-400 dark:text-stone-500 text-xs font-normal mt-3.5">
                  No urgent tasks assigned for today.
                </p>
              ) : (
                <div className="mt-3.5 space-y-2">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-2.5 py-1.5 border-b border-stone-100 dark:border-stone-800/80 last:border-0"
                    >
                      <button
                        onClick={() => onToggleTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          task.status === 'done' 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-stone-300 dark:border-stone-700 hover:border-[#0062FF]'
                        }`}
                      >
                        {task.status === 'done' && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className={`text-xs truncate ${task.status === 'done' ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};
