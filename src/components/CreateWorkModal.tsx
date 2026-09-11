import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Target, 
  FileCheck2, 
  ListTodo, 
  CheckCircle2, 
  User, 
  Calendar, 
  Sparkles, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Member, WorkItem, TaskItem } from '../types';
import { UserAvatar } from './UserAvatar';

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Member | null;
  members: Member[];
  onCreateWorkItem: (
    workItem: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage' | 'tasksCount' | 'completedTasksCount' | 'inProgressTasksCount' | 'blockedTasksCount' | 'reviewTasksCount' | 'evidence' | 'activityLog'>,
    tasks: Array<{
      title: string;
      assigneeId: string;
      dueDate: string;
      priority: 'urgent' | 'high' | 'medium' | 'low';
      evidenceRequired: boolean;
    }>
  ) => Promise<void> | void;
}

interface TemplateTask {
  title: string;
  roleHint: string;
  daysFromNow: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  evidenceRequired: boolean;
}

interface WorkTemplate {
  name: string;
  title: string;
  goal: string;
  deliverable: string;
  deliverableDescription: string;
  successCriteria: string[];
  daysToDeadline: number;
  tasks: TemplateTask[];
}

const WORK_TEMPLATES: WorkTemplate[] = [
  {
    name: 'Website Launch',
    title: 'Launch the new website',
    goal: 'Replace legacy public portal with an accessible, high-speed, and secure digital platform for citizen services.',
    deliverable: 'Production Web Portal v1.0',
    deliverableDescription: 'A fully tested, accessible, mobile-responsive portal hosted with 99.9% uptime, unified auth, and verified SSL.',
    successCriteria: [
      '100% WCAG 2.1 AA Accessibility standards achieved',
      'Lighthouse Performance & Core Web Vitals score > 90',
      'Official encrypted citizen document intake live',
      'Formal executive sign-off from Department Director'
    ],
    daysToDeadline: 14,
    tasks: [
      { title: 'Finalize website content & statutory copy', roleHint: 'Sarah', daysFromNow: 3, priority: 'high', evidenceRequired: true },
      { title: 'Complete UI design system & responsive layout', roleHint: 'Michael', daysFromNow: 5, priority: 'high', evidenceRequired: true },
      { title: 'Implement frontend architecture & API integration', roleHint: 'Daniel', daysFromNow: 8, priority: 'urgent', evidenceRequired: true },
      { title: 'Cross-browser QA testing & automated regression', roleHint: 'James', daysFromNow: 11, priority: 'high', evidenceRequired: true },
      { title: 'Production deployment & DNS cutover', roleHint: 'Daniel', daysFromNow: 14, priority: 'urgent', evidenceRequired: true }
    ]
  },
  {
    name: 'Financial Report',
    title: 'Prepare the Q4 financial report',
    goal: 'Consolidate fiscal quarter balance sheets, verify inter-departmental allocations, and produce audited board decks.',
    deliverable: 'Audited Q4 Financial Statement & Executive Board Deck',
    deliverableDescription: 'A certified, comprehensive operating balance sheet and 15-slide executive presentation for the Governing Board.',
    successCriteria: [
      '100% of inter-departmental budget accounts balanced with bank records',
      'Statutory compliance sign-off from Internal Audit',
      'Variance explanation analysis prepared for any delta > 3%',
      'Approval by Head of Financial Planning'
    ],
    daysToDeadline: 12,
    tasks: [
      { title: 'Consolidate Q3-Q4 departmental disbursement ledgers', roleHint: 'David', daysFromNow: 3, priority: 'high', evidenceRequired: true },
      { title: 'Perform bank reconciliation & voucher verification', roleHint: 'David', daysFromNow: 6, priority: 'urgent', evidenceRequired: true },
      { title: 'Draft budget variance explanation notes', roleHint: 'David', daysFromNow: 9, priority: 'high', evidenceRequired: true },
      { title: 'Assemble 15-slide Executive Board presentation deck', roleHint: 'Sarah', daysFromNow: 12, priority: 'urgent', evidenceRequired: true }
    ]
  },
  {
    name: 'Statutory Procurement',
    title: 'Complete the procurement process',
    goal: 'Conduct transparent tender evaluation and contract execution for agency cloud infrastructure.',
    deliverable: 'Awarded Infrastructure Procurement Contract & Audit Dossier',
    deliverableDescription: 'Fully executed vendor agreements, competitive tender matrix, and compliance certificates.',
    successCriteria: [
      'Minimum of 3 qualified vendor proposals evaluated',
      'Bureau of Public Procurement compliance verification certificate',
      'Approved financial liability clearance by legal counsel'
    ],
    daysToDeadline: 18,
    tasks: [
      { title: 'Publish Request for Proposal (RFP) documentation', roleHint: 'Olude', daysFromNow: 4, priority: 'high', evidenceRequired: true },
      { title: 'Technical bid evaluation and vendor scoring matrix', roleHint: 'Daniel', daysFromNow: 9, priority: 'high', evidenceRequired: true },
      { title: 'Legal review and terms of service negotiation', roleHint: 'Ibrahim', daysFromNow: 14, priority: 'urgent', evidenceRequired: true },
      { title: 'Execute contract signatures and deposit escrow', roleHint: 'Ibrahim', daysFromNow: 18, priority: 'urgent', evidenceRequired: true }
    ]
  }
];

export const CreateWorkModal: React.FC<CreateWorkModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  members,
  onCreateWorkItem
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Outcome
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [ownerId, setOwnerId] = useState(currentUser?.id || members[0]?.id || '');

  // Step 2: Deliverable
  const [deliverable, setDeliverable] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [successCriteria, setSuccessCriteria] = useState<string[]>([
    'All core functionality verified and tested',
    'Executive sign-off obtained'
  ]);
  const [newCriterion, setNewCriterion] = useState('');

  // Step 3: Tasks
  const [tasks, setTasks] = useState<Array<{
    id: string;
    title: string;
    assigneeId: string;
    dueDate: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    evidenceRequired: boolean;
  }>>([]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState(currentUser?.id || members[0]?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [newTaskEvidence, setNewTaskEvidence] = useState(true);

  if (!isOpen) return null;

  // Template autofill handler
  const handleApplyTemplate = (tpl: WorkTemplate) => {
    setTitle(tpl.title);
    setGoal(tpl.goal);
    const d = new Date();
    d.setDate(d.getDate() + tpl.daysToDeadline);
    setDeadline(d.toISOString().split('T')[0]);

    setDeliverable(tpl.deliverable);
    setDeliverableDescription(tpl.deliverableDescription);
    setSuccessCriteria([...tpl.successCriteria]);

    // Map tasks to closest member match or current user
    const mappedTasks = tpl.tasks.map((t, idx) => {
      const taskDue = new Date();
      taskDue.setDate(taskDue.getDate() + t.daysFromNow);
      
      // Find matching member by role hint or name
      const matchedMember = members.find(m => 
        m.name.toLowerCase().includes(t.roleHint.toLowerCase()) ||
        m.jobTitle?.toLowerCase().includes(t.roleHint.toLowerCase())
      ) || currentUser || members[0];

      return {
        id: `tpl_task_${idx}_${Date.now()}`,
        title: t.title,
        assigneeId: matchedMember?.id || currentUser?.id || '',
        dueDate: taskDue.toISOString().split('T')[0],
        priority: t.priority,
        evidenceRequired: t.evidenceRequired
      };
    });

    setTasks(mappedTasks);
  };

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    setSuccessCriteria(prev => [...prev, newCriterion.trim()]);
    setNewCriterion('');
  };

  const handleRemoveCriterion = (index: number) => {
    setSuccessCriteria(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [
      ...prev,
      {
        id: `custom_task_${Date.now()}`,
        title: newTaskTitle.trim(),
        assigneeId: newTaskAssigneeId,
        dueDate: newTaskDueDate,
        priority: newTaskPriority,
        evidenceRequired: newTaskEvidence
      }
    ]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const selectedOwner = members.find(m => m.id === ownerId) || currentUser || members[0];

  // Contributor mapping for Step 4
  const contributorMapping = members.filter(m => 
    m.id === ownerId || tasks.some(t => t.assigneeId === m.id)
  ).map(m => {
    const assignedTasks = tasks.filter(t => t.assigneeId === m.id);
    const responsibilities = assignedTasks.map(t => t.title).join(', ');
    return {
      member: m,
      tasks: assignedTasks,
      responsibilities: responsibilities || (m.id === ownerId ? 'Overall Accountable Owner' : 'Contributor')
    };
  });

  const handleFinalSubmit = async () => {
    if (!title.trim() || !deliverable.trim()) return;
    setIsSubmitting(true);
    try {
      // Create work item object
      const newWorkItem = {
        title: title.trim(),
        goal: goal.trim() || title.trim(),
        deliverable: deliverable.trim(),
        deliverableDescription: deliverableDescription.trim(),
        successCriteria: successCriteria.length > 0 ? successCriteria : ['Deliverable submitted and reviewed'],
        owner: selectedOwner,
        deadline,
        status: 'in_progress' as const,
        contributors: contributorMapping.map(c => c.member)
      };

      await onCreateWorkItem(newWorkItem, tasks);
      onClose();
    } catch (err) {
      console.error('Failed to create work item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-[#0F172A] w-full max-w-3xl lg:max-w-4xl rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto"
        role="dialog"
        aria-labelledby="create-work-title"
      >
        {/* Modal Header & Progress Stepper */}
        <div className="px-6 sm:px-8 py-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-stone-900/40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0062FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                Structured Workflow
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Step {currentStep} of 4
              </span>
            </div>
            <h2 id="create-work-title" className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {currentStep === 1 && 'Step 1 — Define the Outcome'}
              {currentStep === 2 && 'Step 2 — Define the Deliverable'}
              {currentStep === 3 && 'Step 3 — Break It into Accountable Tasks'}
              {currentStep === 4 && 'Step 4 — Review & Accountability Matrix'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Step Progress Bar with 4 distinct segments */}
        <div className="grid grid-cols-4 gap-1.5 px-6 sm:px-8 py-3 bg-stone-50 dark:bg-stone-900/20 border-b border-stone-100 dark:border-stone-800/80">
          {[
            { step: 1, label: 'Outcome & Goal' },
            { step: 2, label: 'Deliverable' },
            { step: 3, label: 'Task Plan' },
            { step: 4, label: 'Accountability' }
          ].map((item) => (
            <div key={item.step} className="space-y-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${currentStep >= item.step ? 'bg-[#0062FF]' : 'bg-stone-200 dark:bg-stone-800'}`} />
              <p className={`text-[10px] font-semibold truncate hidden sm:block ${currentStep >= item.step ? 'text-[#0062FF] dark:text-blue-400' : 'text-stone-400'}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Body with Generous Breathing Room */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 space-y-7 scrollbar-thin">
          
          {/* STEP 1: DEFINE OUTCOME */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Quick Template Suggester */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0062FF]" />
                    Quick Suggestion Templates:
                  </span>
                  <span className="text-[11px] text-blue-700/70 dark:text-blue-400/70 hidden sm:inline">
                    Click to auto-populate deliverables and tasks
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {WORK_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-blue-200 dark:border-blue-800 hover:border-[#0062FF] hover:text-[#0062FF] transition-all shadow-xs cursor-pointer"
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  What needs to be accomplished? (Work title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='e.g., "Launch the new customer portal", "Publish Q4 statutory audit report"'
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#0062FF] outline-none shadow-2xs"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  What is the desired outcome? (Goal)
                </label>
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  rows={3}
                  placeholder="Explain the tangible business outcome, operational milestone, or problem this work solves..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0062FF] outline-none leading-relaxed shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0062FF]" />
                    Target Completion Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0062FF] outline-none shadow-2xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#0062FF]" />
                    Accountable Owner
                  </label>
                  <select
                    value={ownerId}
                    onChange={e => setOwnerId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0062FF] outline-none shadow-2xs cursor-pointer"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.jobTitle || m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DEFINE DELIVERABLE */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  What tangible result must exist when complete? (Deliverable) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliverable}
                  onChange={e => setDeliverable(e.target.value)}
                  placeholder='e.g., "Production Web Portal v1.0", "Audited Q4 Financial Statement"'
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#0062FF] outline-none shadow-2xs"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Deliverable Specifications & Formats
                </label>
                <textarea
                  value={deliverableDescription}
                  onChange={e => setDeliverableDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail the deliverable specifications, expected format (PDF, URL, API endpoint), or compliance criteria..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0062FF] outline-none leading-relaxed shadow-2xs"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Success Criteria & Quality Standards
                  </label>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Specific verification conditions required to certify this deliverable as completed.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {successCriteria.map((crit, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 dark:bg-[#111726] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-stone-800 dark:text-stone-200 font-medium">{crit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800"
                        title="Remove criterion"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="text"
                      value={newCriterion}
                      onChange={e => setNewCriterion(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCriterion(); } }}
                      placeholder="Add another success criterion condition..."
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0062FF]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      className="px-5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BREAK INTO TASKS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Tasks Required to Produce Deliverable
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Every task must have an assigned owner, target deadline, and evidence standard.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300">
                  {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>

              {/* Task list with airy spacing */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {tasks.length === 0 ? (
                  <div className="p-10 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                    <ListTodo className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">No tasks defined yet</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Use the builder below to add key execution tasks for this deliverable.
                    </p>
                  </div>
                ) : (
                  tasks.map((task, idx) => {
                    const assignee = members.find(m => m.id === task.assigneeId);
                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-stone-50 dark:bg-[#111726] border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <span className="font-mono text-stone-400 font-bold text-xs w-6 shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0 space-y-1">
                            <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                              <span className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                                <User className="w-3.5 h-3.5 text-[#0062FF]" />
                                {assignee?.name || 'Unassigned'}
                              </span>
                              <span>•</span>
                              <span>Due: {task.dueDate}</span>
                              {task.evidenceRequired && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                    Evidence Required
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTask(task.id)}
                          className="p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title="Remove task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Task Form with Comfortable Inputs */}
              <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/40 space-y-4">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0062FF]" />
                  Add Task to Deliverable:
                </span>
                
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); } }}
                  placeholder="Task title (e.g. Conduct compliance audit, Draft architecture doc)"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0062FF]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newTaskAssigneeId}
                    onChange={e => setNewTaskAssigneeId(e.target.value)}
                    className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white outline-none cursor-pointer"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111726] text-stone-900 dark:text-white outline-none cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-4 py-2.5 bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & ACCOUNTABILITY */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#111726] border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
                    Deliverable Plan Summary
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">
                    Due: {deadline}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                    {title || 'Untitled Work Item'}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">Goal:</span> {goal || title}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm">
                  <span className="font-bold text-[#0062FF]">Deliverable Target:</span> {deliverable || title}
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-stone-200/80 dark:border-stone-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-stone-500">Accountable Owner:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {selectedOwner.name}
                    </span>
                  </div>
                  <div className="text-stone-500 font-medium">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{tasks.length}</span> Tasks •{' '}
                    <span className="font-bold text-stone-900 dark:text-stone-100">{contributorMapping.length}</span> Contributors
                  </div>
                </div>
              </div>

              {/* Contributor Responsibility Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Accountability Matrix (Who is doing what)
                </h4>
                <div className="space-y-3">
                  {contributorMapping.map(({ member, tasks: memberTasks, responsibilities }) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <UserAvatar user={member} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                            {member.jobTitle || member.role}
                          </p>
                        </div>
                      </div>

                      <div className="text-right pl-3 max-w-[50%]">
                        <span className="text-xs font-bold text-[#0062FF] dark:text-blue-400">
                          {memberTasks.length} {memberTasks.length === 1 ? 'Task' : 'Tasks'}
                        </span>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {responsibilities}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 sm:px-8 py-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => (prev - 1) as any)}
                className="flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !title.trim()) return;
                  if (currentStep === 2 && !deliverable.trim()) {
                    setDeliverable(title);
                  }
                  setCurrentStep(prev => (prev + 1) as any);
                }}
                disabled={currentStep === 1 && !title.trim()}
                className="flex items-center space-x-2 px-6 py-2.5 bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || !title.trim()}
                className="flex items-center space-x-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating...' : 'Launch Work Item'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
