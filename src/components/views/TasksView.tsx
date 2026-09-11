import React, { useState, useMemo } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Users, 
  Tag, 
  MoreVertical, 
  X, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Square, 
  ChevronRight, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  GripVertical, 
  ListFilter,
  Columns,
  List,
  ExternalLink,
  MessageSquare,
  Mail,
  FileCheck
} from 'lucide-react';
import { 
  TaskItem, 
  TaskStatus, 
  TaskPriority, 
  ProjectDeliverable, 
  Member, 
  TaskChecklistItem 
} from '../../types';
import { UserAvatar } from '../UserAvatar';

interface TasksViewProps {
  currentUser: Member | null;
  tasks: TaskItem[];
  deliverables?: ProjectDeliverable[];
  members: Member[];
  onCreateTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => Promise<any> | void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<any> | void;
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => Promise<any> | void;
  onDeleteTask: (taskId: string) => Promise<any> | void;
  onNavigateToChannel?: (channelId: string) => void;
  onOpenComposeEmail?: (subject: string, body: string) => void;
  onSendTaskToChat?: (task: TaskItem) => void;
  onComposeTaskEmail?: (task: TaskItem) => void;
  activeFilterTab?: 'all' | 'my_tasks' | 'urgent';
  onSelectFilterTab?: (tab: 'all' | 'my_tasks' | 'urgent') => void;
  selectedDeliverableId?: string;
  onSelectDeliverableId?: (id: string) => void;
  selectedPriority?: string;
  onSelectPriority?: (priority: string) => void;
  isCreateModalOpen?: boolean;
  onOpenCreateModal?: () => void;
  onCloseCreateModal?: () => void;
}

const COLUMNS: { id: TaskStatus; title: string; subtitle: string; color: string; badgeBg: string; borderTop: string }[] = [
  { 
    id: 'todo', 
    title: 'Backlog & Assigned', 
    subtitle: 'Deliverables pending initiation', 
    color: 'text-stone-700 dark:text-stone-300',
    badgeBg: 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
    borderTop: 'border-t-stone-400 dark:border-t-stone-500'
  },
  { 
    id: 'in_progress', 
    title: 'In Deliberation & Active', 
    subtitle: 'Under execution & drafting', 
    color: 'text-[#0062FF] dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    borderTop: 'border-t-[#0062FF]'
  },
  { 
    id: 'review', 
    title: 'Statutory Review', 
    subtitle: 'Quality & legal compliance verification', 
    color: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    borderTop: 'border-t-amber-500'
  },
  { 
    id: 'done', 
    title: 'Delivered & Dispatched', 
    subtitle: 'Statutory deliverables fulfilled', 
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    borderTop: 'border-t-emerald-500'
  }
];

export const TasksView: React.FC<TasksViewProps> = ({
  currentUser,
  tasks,
  deliverables = [],
  members,
  onCreateTask,
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onNavigateToChannel,
  onOpenComposeEmail,
  onSendTaskToChat,
  onComposeTaskEmail,
  activeFilterTab: controlledFilterTab,
  onSelectFilterTab,
  selectedDeliverableId: controlledDeliverableId,
  onSelectDeliverableId,
  selectedPriority: controlledPriority,
  onSelectPriority,
  isCreateModalOpen: controlledCreateModalOpen,
  onOpenCreateModal,
  onCloseCreateModal
}) => {
  // View states
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  const [internalFilterTab, setInternalFilterTab] = useState<'all' | 'my_tasks' | 'urgent'>('all');
  const activeFilterTab = controlledFilterTab !== undefined ? controlledFilterTab : internalFilterTab;
  const setActiveFilterTab = (tab: 'all' | 'my_tasks' | 'urgent') => {
    setInternalFilterTab(tab);
    onSelectFilterTab?.(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  
  const [internalDeliverableId, setInternalDeliverableId] = useState<string>('all');
  const selectedDeliverableId = controlledDeliverableId !== undefined ? controlledDeliverableId : internalDeliverableId;
  const setSelectedDeliverableId = (id: string) => {
    setInternalDeliverableId(id);
    onSelectDeliverableId?.(id);
  };

  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');
  
  const [internalPriority, setInternalPriority] = useState<string>('all');
  const selectedPriority = controlledPriority !== undefined ? controlledPriority : internalPriority;
  const setSelectedPriority = (p: string) => {
    setInternalPriority(p);
    onSelectPriority?.(p);
  };
  
  // Drag & drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Modals / Drawers
  const [internalCreateModalOpen, setInternalCreateModalOpen] = useState(false);
  const isCreateModalOpen = controlledCreateModalOpen !== undefined ? controlledCreateModalOpen : internalCreateModalOpen;
  const setIsCreateModalOpen = (open: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof open === 'function' ? open(isCreateModalOpen) : open;
    setInternalCreateModalOpen(nextVal);
    if (nextVal) onOpenCreateModal?.();
    else onCloseCreateModal?.();
  };
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskItem | null>(null);
  const [initialCreateStatus, setInitialCreateStatus] = useState<TaskStatus>('todo');

  // Form state for task creation / editing
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [formDueTime, setFormDueTime] = useState('17:00');
  const [formAssigneeIds, setFormAssigneeIds] = useState<string[]>([]);
  const [formDeliverableId, setFormDeliverableId] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');
  const [formEstimatedHours, setFormEstimatedHours] = useState<number>(4);
  const [formChecklist, setFormChecklist] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Deliverables
  const effectiveDeliverables = useMemo(() => {
    if (deliverables && deliverables.length > 0) return deliverables;
    return [];
  }, [deliverables]);

  // Open Create Modal
  const handleOpenCreateModal = (defaultStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setInitialCreateStatus(defaultStatus);
    setFormTitle('');
    setFormDescription('');
    setFormStatus(defaultStatus);
    setFormPriority('medium');
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setFormDueDate(d.toISOString().split('T')[0]);
    setFormDueTime('17:00');
    setFormAssigneeIds(currentUser ? [currentUser.id] : []);
    setFormDeliverableId('');
    setFormTags('Statutory, Directive');
    setFormEstimatedHours(4);
    setFormChecklist([
      { id: `chk_${Date.now()}_1`, text: 'Initial deliberation & memo drafting', completed: false },
      { id: `chk_${Date.now()}_2`, text: 'Statutory officer review', completed: false }
    ]);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setFormDueTime(task.dueTime || '17:00');
    setFormAssigneeIds(task.assigneeIds || []);
    setFormDeliverableId(task.deliverableId || '');
    setFormTags(task.tags ? task.tags.join(', ') : '');
    setFormEstimatedHours(task.estimatedHours || 4);
    setFormChecklist(task.checklist || []);
    setIsCreateModalOpen(true);
  };

  // Save Task Form Handler
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const selectedDel = effectiveDeliverables.find(d => d.id === formDeliverableId);
    const parsedTags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const taskPayload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      status: formStatus,
      priority: formPriority,
      dueDate: formDueDate,
      dueTime: formDueTime,
      assigneeIds: formAssigneeIds,
      reporterId: currentUser?.id || 'usr_officer',
      reporterName: currentUser?.name || 'Public Officer',
      reporterAvatar: currentUser?.avatar || '',
      tags: parsedTags,
      deliverableId: formDeliverableId,
      deliverableTitle: selectedDel?.title || '',
      checklist: formChecklist,
      estimatedHours: Number(formEstimatedHours) || 0
    };

    if (editingTask) {
      await onUpdateTask(editingTask.id, taskPayload);
      if (selectedTaskDetail && selectedTaskDetail.id === editingTask.id) {
        setSelectedTaskDetail({
          ...selectedTaskDetail,
          ...taskPayload
        });
      }
    } else {
      await onCreateTask(taskPayload);
    }

    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving the column boundary
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      await onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  // Toggle Checklist Item
  const handleToggleChecklist = async (task: TaskItem, checkId: string) => {
    const updatedList = (task.checklist || []).map(item => {
      if (item.id === checkId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    await onUpdateTask(task.id, { checklist: updatedList });
    if (selectedTaskDetail && selectedTaskDetail.id === task.id) {
      setSelectedTaskDetail({
        ...selectedTaskDetail,
        checklist: updatedList
      });
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Primary Tab Filter (All Deliverables vs My Tasks vs Urgent)
      if (activeFilterTab === 'my_tasks') {
        if (!currentUser || !task.assigneeIds.includes(currentUser.id)) return false;
      } else if (activeFilterTab === 'urgent') {
        if (task.priority !== 'urgent' && task.priority !== 'high') return false;
      }

      // Deliverable filter
      if (selectedDeliverableId !== 'all' && task.deliverableId !== selectedDeliverableId) {
        return false;
      }
      // Assignee filter
      if (selectedAssigneeId === 'me') {
        if (!currentUser || !task.assigneeIds.includes(currentUser.id)) return false;
      } else if (selectedAssigneeId !== 'all') {
        if (!task.assigneeIds.includes(selectedAssigneeId)) return false;
      }
      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        const matchesTags = task.tags?.some(t => t.toLowerCase().includes(q));
        const matchesDeliverable = (task.deliverableTitle || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesDeliverable) return false;
      }
      return true;
    });
  }, [tasks, activeFilterTab, selectedDeliverableId, selectedAssigneeId, selectedPriority, searchQuery, currentUser]);

  // Statistics & Tab Counts
  const totalTasksCount = tasks.length;
  const myTasksCount = useMemo(() => {
    if (!currentUser) return 0;
    return tasks.filter(t => t.assigneeIds.includes(currentUser.id)).length;
  }, [tasks, currentUser]);
  const urgentTasksCount = useMemo(() => {
    return tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
  }, [tasks]);

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const reviewCount = tasks.filter(t => t.status === 'review').length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const overallProgress = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Helper for relative due date calculation
  const getDueDateInfo = (dueDateStr: string) => {
    if (!dueDateStr) return { text: 'No date', isOverdue: false, isDueToday: false, isDueSoon: false };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        text: `Overdue by ${Math.abs(diffDays)}d`, 
        isOverdue: true, 
        isDueToday: false, 
        isDueSoon: false 
      };
    }
    if (diffDays === 0) {
      return { text: 'Due Today', isOverdue: false, isDueToday: true, isDueSoon: true };
    }
    if (diffDays === 1) {
      return { text: 'Due Tomorrow', isOverdue: false, isDueToday: false, isDueSoon: true };
    }
    if (diffDays <= 3) {
      return { text: `Due in ${diffDays}d`, isOverdue: false, isDueToday: false, isDueSoon: true };
    }
    return { 
      text: new Date(dueDateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), 
      isOverdue: false, 
      isDueToday: false, 
      isDueSoon: false 
    };
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Urgent</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-[#0062FF] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
            Low
          </span>
        );
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-stone-50 dark:bg-[#080C14] text-stone-900 dark:text-stone-100 flex flex-col">
      
      {/* 1. Header & Deliverable Overview */}
      <div className="border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-md sticky top-0 z-20 px-3.5 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto space-y-3">
          
          {/* Main Title & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0062FF] text-white flex items-center justify-center shadow-xs shrink-0">
                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center flex-wrap gap-1.5 sm:gap-2">
                  <span className="truncate">Project Task Board</span>
                  <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0062FF] dark:text-blue-300 text-[10px] sm:text-[11px] font-bold border border-blue-200 dark:border-blue-800/60">
                    Kanban Workflow
                  </span>
                </h1>
                <p className="hidden sm:block text-xs text-stone-500 dark:text-stone-400 max-w-2xl truncate">
                  Track and organize your team's work across projects and milestones.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              {/* View Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'kanban' 
                      ? 'bg-white dark:bg-stone-800 text-[#0062FF] dark:text-blue-400 shadow-2xs font-bold' 
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                  }`}
                  title="Kanban Board View"
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-stone-800 text-[#0062FF] dark:text-blue-400 shadow-2xs font-bold' 
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                  }`}
                  title="List & Deliverables Matrix"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Task Button */}
              <button
                id="create-task-main-btn"
                type="button"
                onClick={() => handleOpenCreateModal('todo')}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">New Task</span>
                <span className="xs:hidden">Task</span>
              </button>
            </div>
          </div>

          {/* Quick Scope Filter Tabs (All Deliverables, My Tasks, Urgent) */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800/60">
            <div 
              id="tasks-scope-filter-tabs" 
              className="flex items-center p-1 rounded-2xl bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 gap-1 overflow-x-auto scrollbar-none"
            >
              {/* Tab 1: All Deliverables */}
              <button
                id="filter-tab-all-deliverables"
                type="button"
                onClick={() => setActiveFilterTab('all')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'all'
                    ? 'bg-white dark:bg-stone-800 text-[#0062FF] dark:text-blue-400 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>All Deliverables</span>
                <span 
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeFilterTab === 'all'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-[#0062FF] dark:text-blue-300'
                      : 'bg-stone-200 dark:bg-stone-700/80 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {totalTasksCount}
                </span>
              </button>

              {/* Tab 2: My Tasks */}
              <button
                id="filter-tab-my-tasks"
                type="button"
                onClick={() => setActiveFilterTab('my_tasks')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'my_tasks'
                    ? 'bg-white dark:bg-stone-800 text-[#0062FF] dark:text-blue-400 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>My Tasks</span>
                <span 
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeFilterTab === 'my_tasks'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-[#0062FF] dark:text-blue-300'
                      : 'bg-stone-200 dark:bg-stone-700/80 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {myTasksCount}
                </span>
              </button>

              {/* Tab 3: Urgent */}
              <button
                id="filter-tab-urgent"
                type="button"
                onClick={() => setActiveFilterTab('urgent')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'urgent'
                    ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Urgent</span>
                <span 
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeFilterTab === 'urgent'
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {urgentTasksCount}
                </span>
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-2 text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 shrink-0 font-medium ml-auto">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{overallProgress}% Delivered</span>
              <span>•</span>
              <span>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} shown</span>
            </div>
          </div>

          {/* Quick Deliverable Status Summary Bar */}
          {effectiveDeliverables.length > 0 && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800/60 text-xs">
              <div className="flex items-center space-x-3 overflow-x-auto scrollbar-none py-0.5 min-w-0">
                <span className="font-semibold text-stone-500 dark:text-stone-400 shrink-0">Deliverables:</span>
                <div className="flex items-center gap-2 shrink-0">
                  {effectiveDeliverables.map(del => (
                    <button
                      key={del.id}
                      type="button"
                      onClick={() => setSelectedDeliverableId(selectedDeliverableId === del.id ? 'all' : del.id)}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0 border ${
                        selectedDeliverableId === del.id
                          ? 'bg-blue-50 dark:bg-blue-950/80 border-[#0062FF] text-[#0062FF] dark:text-blue-300 font-bold'
                          : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-stone-400">{del.code}</span>
                      <span className="truncate max-w-[130px]">{del.title}</span>
                      {del.progressPercentage !== undefined && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-700 text-[10px] font-bold">
                          {del.progressPercentage}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 shrink-0 font-medium ml-auto">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{overallProgress}% Delivered</span>
                <span>•</span>
                <span>{tasks.length} tasks</span>
              </div>
            </div>
          )}

          {/* Dynamic Search & Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search tasks, deliverables, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0062FF] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
              
              {/* Assignee Filter */}
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Assignees</option>
                <option value="me">Assigned to Me</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Clear filters */}
              {(searchQuery || selectedDeliverableId !== 'all' || selectedAssigneeId !== 'all' || selectedPriority !== 'all' || activeFilterTab !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDeliverableId('all');
                    setSelectedAssigneeId('all');
                    setSelectedPriority('all');
                    setActiveFilterTab('all');
                  }}
                  className="px-2 py-1.5 text-xs text-[#0062FF] hover:underline font-medium whitespace-nowrap cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 flex-1 w-full pb-28 sm:pb-20">
        
        {viewMode === 'kanban' ? (
          /* Kanban Columns Board */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
            {COLUMNS.map(column => {
              const columnTasks = filteredTasks.filter(t => t.status === column.id);
              const isOver = dragOverColumn === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`flex flex-col rounded-2xl bg-stone-100/70 dark:bg-[#0E1526]/80 border transition-all duration-200 ${
                    isOver 
                      ? 'border-[#0062FF] ring-2 ring-[#0062FF]/20 bg-blue-50/40 dark:bg-blue-950/20' 
                      : 'border-stone-200/90 dark:border-stone-800/80'
                  } ${column.borderTop} border-t-4 shadow-2xs min-h-[480px]`}
                >
                  
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${column.color}`}>
                        {column.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${column.badgeBg}`}>
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(column.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title={`Add task to ${column.title}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tasks Container */}
                  <div className="p-2.5 sm:p-3 space-y-3 flex-1 overflow-y-auto">
                    {columnTasks.length === 0 ? (
                      <div className="py-10 text-center space-y-1.5 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-4 text-stone-400 text-xs">
                        <p>No tasks in this stage</p>
                        <button
                          type="button"
                          onClick={() => handleOpenCreateModal(column.id)}
                          className="text-[#0062FF] dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer"
                        >
                          + Add a task
                        </button>
                      </div>
                    ) : (
                      columnTasks.map(task => {
                        const dueDateInfo = getDueDateInfo(task.dueDate);
                        const completedChecks = task.checklist?.filter(c => c.completed).length || 0;
                        const totalChecks = task.checklist?.length || 0;
                        const taskAssignees = members.filter(m => task.assigneeIds?.includes(m.id));

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => setSelectedTaskDetail(task)}
                            className={`group relative p-3.5 rounded-xl bg-white dark:bg-[#111726] border border-stone-200/90 dark:border-stone-800/90 shadow-2xs hover:shadow-md hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all cursor-grab active:cursor-grabbing ${
                              draggedTaskId === task.id ? 'opacity-40 scale-[0.98]' : ''
                            }`}
                          >
                            {/* Drag Handle & Priority */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center space-x-1.5">
                                <GripVertical className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {getPriorityBadge(task.priority)}
                              </div>

                              {/* Deliverable Code Tag */}
                              {task.deliverableTitle && (
                                <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 truncate max-w-[110px]" title={task.deliverableTitle}>
                                  {task.deliverableTitle}
                                </span>
                              )}
                            </div>

                            {/* Task Title */}
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug mb-1.5">
                              {task.title}
                            </h4>

                            {/* Description Snippet */}
                            {task.description && (
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-2.5">
                                {task.description}
                              </p>
                            )}

                            {/* Tags Chips */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2.5">
                                {task.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800/90 text-stone-600 dark:text-stone-400 text-[10px] font-medium"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {task.tags.length > 3 && (
                                  <span className="text-[9px] text-stone-400 self-center">
                                    +{task.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Checklist Progress Bar */}
                            {totalChecks > 0 && (
                              <div className="space-y-1 mb-3 pt-1 border-t border-stone-100 dark:border-stone-800/60">
                                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
                                  <span className="flex items-center space-x-1">
                                    <CheckSquare className="w-3 h-3 text-stone-400" />
                                    <span>Checklist</span>
                                  </span>
                                  <span className="font-semibold">{completedChecks}/{totalChecks}</span>
                                </div>
                                <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-[#0062FF] h-full transition-all duration-300 rounded-full"
                                    style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Card Footer: Due Date & Assignees */}
                            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/70 text-xs">
                              
                              {/* Due Date Indicator */}
                              <div className="flex items-center space-x-1">
                                <Calendar className={`w-3.5 h-3.5 ${
                                  dueDateInfo.isOverdue 
                                    ? 'text-rose-500' 
                                    : (dueDateInfo.isDueToday ? 'text-amber-500' : 'text-stone-400')
                                }`} />
                                <span className={`text-[10px] font-semibold ${
                                  dueDateInfo.isOverdue 
                                    ? 'text-rose-600 dark:text-rose-400 font-bold' 
                                    : (dueDateInfo.isDueToday ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400')
                                }`}>
                                  {dueDateInfo.text}
                                </span>
                              </div>

                              {/* Multi-Assignee Avatars */}
                              <div className="flex items-center -space-x-1.5 overflow-hidden">
                                {taskAssignees.slice(0, 3).map((assignee) => (
                                  <div key={assignee.id} title={assignee.name} className="ring-1 ring-white dark:ring-[#111726] rounded-full">
                                    <UserAvatar member={assignee} size="xs" />
                                  </div>
                                ))}
                                {taskAssignees.length === 0 && (
                                  <span className="text-[10px] text-stone-400 italic">Unassigned</span>
                                )}
                              </div>

                            </div>

                            {/* Quick Status Action Controls (Hover Menu) */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-stone-800 rounded-lg shadow-xs border border-stone-200 dark:border-stone-700 flex items-center p-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(task);
                                }}
                                className="p-1 hover:text-[#0062FF] rounded text-stone-500 cursor-pointer"
                                title="Edit Task"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTask(task.id);
                                }}
                                className="p-1 hover:text-rose-600 rounded text-stone-500 cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Column Bottom Add Button */}
                  <div className="p-2 border-t border-stone-200/60 dark:border-stone-800/60">
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(column.id)}
                      className="w-full py-1.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-blue-400 text-stone-500 hover:text-[#0062FF] dark:text-stone-400 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* List & Deliverables Matrix View */
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                <ListFilter className="w-4 h-4 text-[#0062FF]" />
                <span>Deliverables Matrix & Task Inventory ({filteredTasks.length} items)</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-4">Task Deliverable</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Assignees</th>
                    <th className="py-3 px-4">Checklist</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400 text-xs">
                        No tasks match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => {
                      const dueDateInfo = getDueDateInfo(task.dueDate);
                      const completedChecks = task.checklist?.filter(c => c.completed).length || 0;
                      const totalChecks = task.checklist?.length || 0;
                      const taskAssignees = members.filter(m => task.assigneeIds?.includes(m.id));

                      return (
                        <tr 
                          key={task.id}
                          onClick={() => setSelectedTaskDetail(task)}
                          className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                              {task.title}
                            </div>
                            {task.deliverableTitle && (
                              <div className="text-[11px] text-stone-400 truncate">
                                {task.deliverableTitle}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[11px] font-semibold cursor-pointer"
                            >
                              <option value="todo">Backlog</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Delivered</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[11px] font-medium ${dueDateInfo.isOverdue ? 'text-rose-600 font-bold' : 'text-stone-600 dark:text-stone-300'}`}>
                              {dueDateInfo.text}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center -space-x-1.5">
                              {taskAssignees.map(a => (
                                <div key={a.id} title={a.name} className="ring-1 ring-white dark:ring-stone-900 rounded-full">
                                  <UserAvatar member={a} size="xs" />
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {totalChecks > 0 ? (
                              <span className="text-[11px] text-stone-600 dark:text-stone-400">
                                {completedChecks}/{totalChecks} checks
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-[#0062FF] cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 3. Task Detail Modal */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-6 animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">Task Deliverable</span>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                    {selectedTaskDetail.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(selectedTaskDetail);
                    setSelectedTaskDetail(null);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTaskDetail(null)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 sm:px-8 py-6 overflow-y-auto space-y-6 text-sm flex-1">
              
              {/* Status and Priority Badges */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800/70">
                <div className="flex items-center space-x-4">
                  <div className="space-y-1">
                    <span className="text-xs text-stone-400 uppercase font-bold block">Stage</span>
                    <div>
                      <select
                        value={selectedTaskDetail.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as TaskStatus;
                          await onUpdateTaskStatus(selectedTaskDetail.id, newStatus);
                          setSelectedTaskDetail({ ...selectedTaskDetail, status: newStatus });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        <option value="todo">Backlog & Assigned</option>
                        <option value="in_progress">In Deliberation & Active</option>
                        <option value="review">Statutory Review</option>
                        <option value="done">Delivered & Dispatched</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-stone-400 uppercase font-bold block">Priority</span>
                    <div>
                      {getPriorityBadge(selectedTaskDetail.priority)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-xs text-stone-400 uppercase font-bold block">Fulfillment Target</span>
                  <div className="flex items-center space-x-2 font-bold text-stone-800 dark:text-stone-200 text-sm">
                    <Calendar className="w-4 h-4 text-[#0062FF]" />
                    <span>{selectedTaskDetail.dueDate} ({selectedTaskDetail.dueTime || '17:00'})</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-600 dark:text-stone-400 uppercase text-xs tracking-wider">
                  Scope & Directives
                </h4>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap bg-stone-50/50 dark:bg-stone-900/40 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800/60 text-sm">
                  {selectedTaskDetail.description || 'No specific directive scope provided.'}
                </p>
              </div>

              {/* Deliverable info */}
              {selectedTaskDetail.deliverableTitle && (
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-600 dark:text-stone-400 uppercase text-xs tracking-wider">
                    Associated Project Deliverable
                  </h4>
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0062FF] text-white flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{selectedTaskDetail.deliverableTitle}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignees */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-600 dark:text-stone-400 uppercase text-xs tracking-wider">
                  Assigned Personnel ({selectedTaskDetail.assigneeIds?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {members
                    .filter(m => selectedTaskDetail.assigneeIds?.includes(m.id))
                    .map(m => (
                      <div key={m.id} className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                        <UserAvatar member={m} size="xs" />
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100 text-xs">{m.name}</div>
                          <div className="text-[11px] text-stone-400">{m.role} • {m.department}</div>
                        </div>
                      </div>
                    ))}
                  {(!selectedTaskDetail.assigneeIds || selectedTaskDetail.assigneeIds.length === 0) && (
                    <span className="text-stone-400 italic text-sm">No assigned personnel yet.</span>
                  )}
                </div>
              </div>

              {/* Checklist verification items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-600 dark:text-stone-400 uppercase text-xs tracking-wider">
                    Verification Checklist
                  </h4>
                  <span className="text-xs font-semibold text-stone-500">
                    {selectedTaskDetail.checklist?.filter(c => c.completed).length || 0}/{selectedTaskDetail.checklist?.length || 0} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {(selectedTaskDetail.checklist || []).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleChecklist(selectedTaskDetail, item.id)}
                      className={`w-full flex items-center space-x-3 p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                        item.completed 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-stone-500 dark:text-stone-400 line-through' 
                          : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400 shrink-0" />
                      )}
                      <span className="flex-1 font-medium text-sm">{item.text}</span>
                    </button>
                  ))}

                  {(!selectedTaskDetail.checklist || selectedTaskDetail.checklist.length === 0) && (
                    <p className="text-stone-400 italic text-sm">No checklist items specified.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions (Email Memo / Channel) */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-3">
                {onOpenComposeEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenComposeEmail(
                        `Deliverable Update: ${selectedTaskDetail.title}`,
                        `Official Status Briefing on Deliverable: ${selectedTaskDetail.title}\n\nStage: ${selectedTaskDetail.status.toUpperCase()}\nDue Date: ${selectedTaskDetail.dueDate}\n\nDirectives:\n${selectedTaskDetail.description || 'N/A'}`
                      );
                      setSelectedTaskDetail(null);
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer transition-colors text-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Dispatch Email Memo</span>
                  </button>
                )}
                {onNavigateToChannel && selectedTaskDetail.channelId && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToChannel(selectedTaskDetail.channelId!);
                      setSelectedTaskDetail(null);
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#0062FF] dark:text-blue-300 font-semibold cursor-pointer transition-colors text-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Discuss in #{selectedTaskDetail.channelName || 'Council'}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await onDeleteTask(selectedTaskDetail.id);
                  setSelectedTaskDetail(null);
                }}
                className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer transition-colors"
              >
                Delete Deliverable
              </button>

              <button
                type="button"
                onClick={() => setSelectedTaskDetail(null)}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Create / Edit Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-6 animate-scale-in">
            
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                    {editingTask ? 'Edit Task Deliverable' : 'Create Task Deliverable'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Assign statutory responsibilities and target fulfillment deadlines.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingTask(null);
                }}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTask} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="px-6 sm:px-8 py-6 overflow-y-auto space-y-6 text-sm flex-1">
                
                {/* Task Title */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finalize Cross-Border Cloud Compliance Filing"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] font-semibold text-sm transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                    Deliverable Scope & Directives
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed breakdown of requirements, statutory references, and expected outcomes..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] text-sm resize-none leading-relaxed transition-all"
                  />
                </div>

                {/* Associated Deliverable */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                    Project Deliverable Program
                  </label>
                  <select
                    value={formDeliverableId}
                    onChange={(e) => setFormDeliverableId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer text-sm"
                  >
                    <option value="">-- General Operational Deliverable --</option>
                    {effectiveDeliverables.map(del => (
                      <option key={del.id} value={del.id}>
                        [{del.code}] {del.title} ({del.department || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stage & Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                      Initial Stage
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer font-medium text-sm"
                    >
                      <option value="todo">Backlog & Assigned</option>
                      <option value="in_progress">In Deliberation & Active</option>
                      <option value="review">Statutory Review</option>
                      <option value="done">Delivered & Dispatched</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer font-medium text-sm"
                    >
                      <option value="urgent">Urgent (Immediate Mandate)</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low (Standard Cadence)</option>
                    </select>
                  </div>
                </div>

                {/* Due Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                      Due Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                      Target Time
                    </label>
                    <input
                      type="time"
                      value={formDueTime}
                      onChange={(e) => setFormDueTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Assignees Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                    Assign Personnel
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-3 rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 scrollbar-thin">
                    {members.map(member => {
                      const isSelected = formAssigneeIds.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormAssigneeIds(prev => prev.filter(id => id !== member.id));
                            } else {
                              setFormAssigneeIds(prev => [...prev, member.id]);
                            }
                          }}
                          className={`flex items-center space-x-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900/60' 
                              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <UserAvatar member={member} size="xs" />
                          <span className="truncate text-xs">{member.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Statutory, NDPA 2023, Treasury, Urgent"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none text-sm"
                  />
                </div>

                {/* Checklist Builder */}
                <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
                    Verification Checklist Items
                  </label>
                  
                  <div className="space-y-2">
                    {formChecklist.map((item, idx) => (
                      <div key={item.id} className="flex items-center space-x-2.5">
                        <span className="w-5 text-center text-stone-400 font-mono text-xs">{idx + 1}.</span>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...formChecklist];
                            updated[idx].text = e.target.value;
                            setFormChecklist(updated);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-900 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormChecklist(prev => prev.filter(c => c.id !== item.id));
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center space-x-2.5 pt-1">
                      <input
                        type="text"
                        placeholder="Add sub-task or checklist verification..."
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newChecklistText.trim()) {
                              setFormChecklist(prev => [...prev, { id: `chk_${Date.now()}`, text: newChecklistText.trim(), completed: false }]);
                              setNewChecklistText('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newChecklistText.trim()) {
                            setFormChecklist(prev => [...prev, { id: `chk_${Date.now()}`, text: newChecklistText.trim(), completed: false }]);
                            setNewChecklistText('');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Action Buttons */}
              <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-sm font-bold shadow-xs cursor-pointer transition-all"
                >
                  {editingTask ? 'Save Changes' : 'Create Task Deliverable'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
