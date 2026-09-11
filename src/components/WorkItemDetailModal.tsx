import React, { useState } from 'react';
import { 
  X, 
  Target, 
  FileCheck, 
  Calendar, 
  User, 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Link as LinkIcon, 
  FileText, 
  Plus, 
  ExternalLink, 
  Check, 
  ChevronRight,
  TrendingUp,
  Activity,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';
import { WorkItem, TaskItem, Member, WorkEvidence, WorkItemStatus, TaskStatus } from '../types';
import { UserAvatar } from './UserAvatar';

interface WorkItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem: WorkItem | null;
  tasks: TaskItem[];
  currentUser: Member | null;
  members: Member[];
  onUpdateWorkItem: (workItemId: string, updates: Partial<WorkItem>) => void;
  onToggleTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTaskToWorkItem: (workItemId: string, taskData: {
    title: string;
    assigneeId: string;
    dueDate: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    evidenceRequired: boolean;
  }) => void;
  onSubmitEvidence: (workItemId: string, evidenceData: {
    taskId?: string;
    title: string;
    type: 'link' | 'document' | 'code' | 'metric' | 'note';
    url?: string;
    notes?: string;
  }) => void;
  onFlagTaskBlocked: (taskId: string, reason: string) => void;
}

export const WorkItemDetailModal: React.FC<WorkItemDetailModalProps> = ({
  isOpen,
  onClose,
  workItem,
  tasks,
  currentUser,
  members,
  onUpdateWorkItem,
  onToggleTaskStatus,
  onAddTaskToWorkItem,
  onSubmitEvidence,
  onFlagTaskBlocked
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'evidence' | 'accountability' | 'review'>('tasks');
  
  // New task inline state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState(currentUser?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [newTaskEvidenceRequired, setNewTaskEvidenceRequired] = useState(true);

  // Submit evidence inline modal state
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<'link' | 'document' | 'code' | 'metric' | 'note'>('link');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceTaskId, setEvidenceTaskId] = useState<string>('');

  // Flag blocked task state
  const [blockingTaskId, setBlockingTaskId] = useState<string | null>(null);
  const [blockingReason, setBlockingReason] = useState('');

  // Formal sign-off notes
  const [signOffNotes, setSignOffNotes] = useState('');
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});

  if (!isOpen || !workItem) return null;

  // Filter tasks belonging to this work item
  const workItemTasks = tasks.filter(t => t.workItemId === workItem.id || t.deliverableId === workItem.id);

  // Dynamic calculations
  const totalTasks = workItemTasks.length;
  const completedTasks = workItemTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = workItemTasks.filter(t => t.status === 'in_progress').length;
  const blockedTasks = workItemTasks.filter(t => t.blockedReason || (t.status === 'todo' && t.tags?.includes('Blocked'))).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : workItem.progressPercentage;

  // Contributor accountability calculations
  const contributorStats = workItem.contributors.map(c => {
    const memberTasks = workItemTasks.filter(t => t.assigneeIds?.includes(c.id) || t.assignees?.some(a => a.id === c.id));
    const memberCompleted = memberTasks.filter(t => t.status === 'done').length;
    const memberEvidence = (workItem.evidence || []).filter(e => e.submittedBy?.id === c.id).length;
    const completionRate = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 100;
    return {
      member: c,
      tasksCount: memberTasks.length,
      completedCount: memberCompleted,
      completionRate,
      evidenceCount: memberEvidence,
      tasks: memberTasks
    };
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTaskToWorkItem(workItem.id, {
      title: newTaskTitle.trim(),
      assigneeId: newTaskAssigneeId || currentUser?.id || members[0]?.id || '',
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      evidenceRequired: newTaskEvidenceRequired
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) return;
    onSubmitEvidence(workItem.id, {
      title: evidenceTitle.trim(),
      type: evidenceType,
      url: evidenceUrl.trim(),
      notes: evidenceNotes.trim(),
      taskId: evidenceTaskId || undefined
    });
    setEvidenceTitle('');
    setEvidenceUrl('');
    setEvidenceNotes('');
    setEvidenceTaskId('');
    setIsAddingEvidence(false);
  };

  const handleApplyBlock = (taskId: string) => {
    if (!blockingReason.trim()) return;
    onFlagTaskBlocked(taskId, blockingReason.trim());
    setBlockingTaskId(null);
    setBlockingReason('');
  };

  const handleSignOffCompletion = () => {
    onUpdateWorkItem(workItem.id, {
      status: 'completed',
      completionSignOff: {
        signedBy: currentUser?.name || 'Verified Officer',
        signedAt: new Date().toISOString(),
        notes: signOffNotes.trim() || 'All deliverables verified according to official standards.'
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-[#0F172A] w-full max-w-4xl lg:max-w-5xl rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        role="dialog"
        aria-labelledby="workitem-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-[#111726]/70 shrink-0">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0062FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
                  Deliverable Execution
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Target Due: <strong className="text-stone-700 dark:text-stone-300">{workItem.deadline}</strong>
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <div className="inline-flex items-center space-x-1.5">
                  <span className="text-xs text-stone-400">Status:</span>
                  <select
                    value={workItem.status}
                    onChange={(e) => onUpdateWorkItem(workItem.id, { status: e.target.value as WorkItemStatus })}
                    className="text-xs font-bold px-3 py-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 cursor-pointer outline-none shadow-2xs"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <h1 id="workitem-modal-title" className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight leading-snug">
                {workItem.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                <div className="flex items-center space-x-2">
                  <span className="text-stone-400">Owner:</span>
                  <div className="flex items-center space-x-1.5 font-bold text-stone-900 dark:text-stone-100">
                    <UserAvatar user={workItem.owner} size="xs" />
                    <span>{workItem.owner.name}</span>
                  </div>
                </div>

                <span className="text-stone-300 dark:text-stone-700">•</span>

                <div className="flex items-center space-x-2">
                  <span className="text-stone-400">Deliverable:</span>
                  <span className="font-semibold text-[#0062FF] dark:text-blue-300">
                    {workItem.deliverable}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Goal Statement Box */}
          <div className="mt-5 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-xs sm:text-sm leading-relaxed shadow-2xs">
            <span className="font-bold text-stone-900 dark:text-stone-100 mr-1.5">Outcome Objective:</span>
            <span className="text-stone-600 dark:text-stone-300">{workItem.goal}</span>
          </div>

          {/* High-Impact Visual Progress Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <div className="flex items-center space-x-2">
                <span className="text-stone-900 dark:text-stone-100 font-bold">Execution Progress:</span>
                <span className="text-stone-500 dark:text-stone-400 font-normal">
                  {completedTasks} of {totalTasks} Tasks Complete
                </span>
              </div>
              <span className="font-mono font-bold text-sm text-[#0062FF] dark:text-blue-400">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
              <div 
                className="h-full bg-[#0062FF] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 sm:px-8 border-b border-stone-200 dark:border-stone-800 flex items-center space-x-6 sm:space-x-8 shrink-0 bg-white dark:bg-[#0F172A] text-xs sm:text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks' 
                ? 'border-[#0062FF] text-[#0062FF] dark:text-blue-400' 
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Tasks & Breakdown</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800">
              {totalTasks}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'evidence' 
                ? 'border-[#0062FF] text-[#0062FF] dark:text-blue-400' 
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Evidence & Output</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800">
              {(workItem.evidence || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('accountability')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'accountability' 
                ? 'border-[#0062FF] text-[#0062FF] dark:text-blue-400' 
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Who Did What</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'review' 
                ? 'border-[#0062FF] text-[#0062FF] dark:text-blue-400' 
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Review & Certification</span>
            {workItem.status === 'completed' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                Certified
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 scrollbar-thin space-y-7">
          
          {/* TAB 1: TASKS & EXECUTION */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Accountable Task Execution
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    Check off tasks as completed or flag dependencies to resolve bottlenecks quickly.
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => setIsAddingEvidence(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#0062FF]" />
                    <span>Submit Evidence</span>
                  </button>

                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* Inline Add Task Form */}
              {isAddingTask && (
                <form onSubmit={handleCreateTask} className="p-5 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                      New Task for Deliverable
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingTask(false)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Task title (e.g., Conduct compliance audit, Finalize report copy)..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0062FF]"
                    autoFocus
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={newTaskAssigneeId}
                      onChange={e => setNewTaskAssigneeId(e.target.value)}
                      className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none"
                    />

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#0062FF] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#0048C6] transition-colors shadow-2xs"
                      >
                        Save Task
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-3">
                {workItemTasks.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 text-sm border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                    <ListTodo className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-700" />
                    No tasks currently mapped to this deliverable. Click "Add Task" to create one.
                  </div>
                ) : (
                  workItemTasks.map((task) => {
                    const isDone = task.status === 'done';
                    const isBlocked = !!task.blockedReason || (task.status === 'todo' && task.tags?.includes('Blocked'));
                    const assignee = task.assignees?.[0] || members.find(m => task.assigneeIds?.includes(m.id));

                    return (
                      <div
                        key={task.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isDone 
                            ? 'bg-stone-50/80 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/60 opacity-80' 
                            : isBlocked
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-3.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleTaskStatus(task.id, isDone ? 'todo' : 'done')}
                              className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isDone 
                                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                                  : 'border-stone-300 dark:border-stone-700 hover:border-[#0062FF]'
                              }`}
                            >
                              {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>

                            <div className="min-w-0 space-y-1">
                              <p className={`text-sm sm:text-base font-bold leading-snug ${
                                isDone ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                              }`}>
                                {task.title}
                              </p>

                              {task.description && (
                                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {isBlocked && task.blockedReason && (
                                <div className="mt-2 p-3 rounded-xl bg-rose-100/70 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                                  <span><strong>Blocked:</strong> {task.blockedReason}</span>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-stone-500 dark:text-stone-400">
                                <span className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                                  <User className="w-3.5 h-3.5 text-[#0062FF]" />
                                  <span>
                                    {assignee?.name || 'Unassigned'}
                                  </span>
                                </span>

                                <span>•</span>
                                <span>Target Due: {task.dueDate}</span>

                                {task.evidenceRequired && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      Evidence Required
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {!isDone && (
                              <button
                                type="button"
                                onClick={() => setBlockingTaskId(task.id)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                Flag Blocked
                              </button>
                            )}

                            <select
                              value={task.status}
                              onChange={(e) => onToggleTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 outline-none"
                            >
                              <option value="todo">Todo</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>

                        {/* Modal to flag blocked reason */}
                        {blockingTaskId === task.id && (
                          <div className="mt-3 p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 space-y-3">
                            <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                              State Blocked Dependency:
                            </span>
                            <input
                              type="text"
                              value={blockingReason}
                              onChange={e => setBlockingReason(e.target.value)}
                              placeholder="e.g. Awaiting central IT clearance / Vendor audit delay..."
                              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-stone-900 outline-none"
                              autoFocus
                            />
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setBlockingTaskId(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyBlock(task.id)}
                                className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg"
                              >
                                Mark as Blocked
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE & OUTPUT (WHAT PROVES THE WORK IS DONE?) */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Deliverable Evidence & Proof of Completion
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    Tangible artifacts, test reports, URLs, and files proving actual deliverable completion.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingEvidence(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Evidence</span>
                </button>
              </div>

              {/* Submit Evidence Form */}
              {isAddingEvidence && (
                <form onSubmit={handleCreateEvidence} className="p-5 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                      Submit Concrete Evidence Artifact
                    </span>
                    <button type="button" onClick={() => setIsAddingEvidence(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={evidenceTitle}
                    onChange={e => setEvidenceTitle(e.target.value)}
                    placeholder="Evidence Title (e.g. Production URL, Final Audit Report PDF, Security Certificate)"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 outline-none focus:ring-2 focus:ring-[#0062FF]"
                    autoFocus
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={evidenceType}
                      onChange={e => setEvidenceType(e.target.value as any)}
                      className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                    >
                      <option value="link">URL / Live Link</option>
                      <option value="document">Document / PDF</option>
                      <option value="metric">Metric / Performance Benchmark</option>
                      <option value="note">Written Proof & Compliance Sign-off</option>
                    </select>

                    <input
                      type="text"
                      value={evidenceUrl}
                      onChange={e => setEvidenceUrl(e.target.value)}
                      placeholder="URL or file link..."
                      className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>

                  <textarea
                    value={evidenceNotes}
                    onChange={e => setEvidenceNotes(e.target.value)}
                    rows={3}
                    placeholder="Provide verification notes, compliance reference, or test results..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 outline-none leading-relaxed"
                  />

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingEvidence(false)}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0062FF] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs"
                    >
                      Submit for Verification
                    </button>
                  </div>
                </form>
              )}

              {/* Evidence Items */}
              <div className="space-y-4">
                {(workItem.evidence || []).length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400 text-sm">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-700" />
                    No evidence submitted yet. Click "Submit Evidence" to attach proof of deliverable execution.
                  </div>
                ) : (
                  (workItem.evidence || []).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 shrink-0 mt-0.5">
                            {ev.type === 'link' ? <LinkIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                              <span>{ev.title}</span>
                              {ev.url && (
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#0062FF] hover:underline inline-flex items-center gap-1 text-xs font-semibold"
                                >
                                  <span>View Artifact</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </h4>

                            {ev.notes && (
                              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                                {ev.notes}
                              </p>
                            )}

                            <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 pt-1">
                              <span>Submitted by: <strong>{ev.submittedBy?.name}</strong></span>
                              <span>•</span>
                              <span>{new Date(ev.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNTABILITY (WHO DID WHAT) */}
          {activeTab === 'accountability' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Accountability Matrix & Audit Trail
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  Visually monitor exactly who is responsible and what has been executed.
                </p>
              </div>

              {/* Contributor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contributorStats.map(({ member, tasksCount, completedCount, completionRate, evidenceCount }) => (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <UserAvatar user={member} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-stone-900 dark:text-white truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {member.jobTitle || member.role}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50">
                        <p className="text-sm font-mono font-bold text-stone-900 dark:text-white">
                          {completedCount}/{tasksCount}
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase font-semibold mt-0.5">Tasks Done</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50">
                        <p className="text-sm font-mono font-bold text-[#0062FF] dark:text-blue-400">
                          {completionRate}%
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase font-semibold mt-0.5">Delivery</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50">
                        <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {evidenceCount}
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase font-semibold mt-0.5">Proof</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity Log Audit Timeline */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0062FF]" />
                  Execution Audit Trail
                </h4>

                <div className="space-y-3.5">
                  {(workItem.activityLog || []).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3.5 text-xs sm:text-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0062FF] mt-1.5 shrink-0 shadow-2xs" />
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-stone-800 dark:text-stone-200">
                          <strong>{log.userName}</strong>: {log.action}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {log.details}
                        </p>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERABLE REVIEW & COMPLETION */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Formal Deliverable Review & Certification
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  Verify that all success criteria are met before applying formal administrative completion sign-off.
                </p>
              </div>

              {/* Success criteria verification */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Success Criteria Verification:
                </h4>

                <div className="space-y-2.5">
                  {workItem.successCriteria.map((criterion, idx) => {
                    const isChecked = checkedCriteria[idx] ?? (workItem.status === 'completed' || progressPercent >= 70);
                    return (
                      <label
                        key={idx}
                        className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-white dark:bg-[#111726] border border-stone-200/80 dark:border-stone-800 text-xs sm:text-sm cursor-pointer hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => setCheckedCriteria(prev => ({ ...prev, [idx]: e.target.checked }))}
                          className="w-4 h-4 rounded text-[#0062FF]"
                        />
                        <span className="text-stone-800 dark:text-stone-200 font-medium">
                          {criterion}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Formal Sign-off Section */}
              {workItem.completionSignOff ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Deliverable Formally Certified and Completed</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-200">
                    Signed off by <strong>{workItem.completionSignOff.signedBy}</strong> on{' '}
                    {new Date(workItem.completionSignOff.signedAt).toLocaleString()}.
                  </p>
                  {workItem.completionSignOff.notes && (
                    <p className="text-xs sm:text-sm italic text-emerald-700 dark:text-emerald-400">
                      "{workItem.completionSignOff.notes}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Sign-Off Certification
                  </h4>
                  <textarea
                    value={signOffNotes}
                    onChange={e => setSignOffNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter sign-off comments or official compliance audit confirmation..."
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 outline-none leading-relaxed"
                  />

                  <button
                    type="button"
                    onClick={handleSignOffCompletion}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Certify & Complete Deliverable</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
