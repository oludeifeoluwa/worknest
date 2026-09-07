import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Filter, 
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Target
} from 'lucide-react';

export interface DeliverableItem {
  id: string;
  name: string;
  department: string;
  leadOfficer: string;
  completionPercentage: number;
  status: 'completed' | 'in_progress' | 'review' | 'pending';
  priority: 'critical' | 'high' | 'medium';
  dueDate: string;
  category: string;
}

const DEFAULT_DELIVERABLES: DeliverableItem[] = [];

const STATUS_COLORS: Record<string, { fill: string; bg: string; text: string; label: string }> = {
  completed: { fill: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Completed (>90%)' },
  in_progress: { fill: '#0062FF', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'On Track (50-89%)' },
  review: { fill: '#8B5CF6', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', label: 'Under Review' },
  pending: { fill: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Pending / Initial (<50%)' }
};

interface DeliverablesProgressChartProps {
  deliverables?: DeliverableItem[];
  onSelectDeliverable?: (item: DeliverableItem) => void;
  onNavigateToProjects?: () => void;
}

export const DeliverablesProgressChart: React.FC<DeliverablesProgressChartProps> = ({
  deliverables = DEFAULT_DELIVERABLES,
  onSelectDeliverable,
  onNavigateToProjects
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Filtered deliverables list
  const filteredDeliverables = useMemo(() => {
    return deliverables.filter(item => {
      const matchesCategory = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesCategory && matchesStatus;
    });
  }, [deliverables, filterCategory, selectedStatus]);

  // Calculate overall average completion percentage
  const avgCompletion = useMemo(() => {
    if (deliverables.length === 0) return 0;
    const total = deliverables.reduce((acc, curr) => acc + curr.completionPercentage, 0);
    return Math.round(total / deliverables.length);
  }, [deliverables]);

  // Aggregate data for Recharts Donut
  const chartData = useMemo(() => {
    const counts = {
      completed: 0,
      in_progress: 0,
      review: 0,
      pending: 0
    };

    deliverables.forEach(d => {
      if (counts[d.status] !== undefined) {
        counts[d.status] += 1;
      }
    });

    return [
      { name: 'Completed', value: counts.completed, status: 'completed', color: STATUS_COLORS.completed.fill },
      { name: 'On Track', value: counts.in_progress, status: 'in_progress', color: STATUS_COLORS.in_progress.fill },
      { name: 'Under Review', value: counts.review, status: 'review', color: STATUS_COLORS.review.fill },
      { name: 'Pending Initial', value: counts.pending, status: 'pending', color: STATUS_COLORS.pending.fill }
    ].filter(item => item.value > 0);
  }, [deliverables]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(deliverables.map(d => d.category)));
    return ['all', ...unique];
  }, [deliverables]);

  return (
    <div 
      id="team-deliverables-completion-widget"
      className="bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Target className="w-4 h-4" />
            <span>Active Deliverables & Team Project Completion</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Real-time delivery milestones tracked across cabinet departments.
          </p>
        </div>

        {/* Filter Pills */}
        {deliverables.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setSelectedStatus(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {cat === 'all' ? 'All Deliverables' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {deliverables.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center mx-auto text-stone-400">
            <Target className="w-5 h-5 text-stone-400 dark:text-stone-500" />
          </div>
          <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            No Active Project Deliverables
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 max-w-sm mx-auto">
            All project deliverables have been cleared from this workspace.
          </p>
        </div>
      ) : (
        /* Analytics Stage: Donut Chart on Left, Progress Breakdown on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Recharts Donut Visualizer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/70">
          
          <div className="relative w-full h-48 sm:h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-lg shadow-lg text-xs">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">{data.name}: </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{data.value} Project{Number(data.value) > 1 ? 's' : ''}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={900}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() => {
                        setSelectedStatus(prev => prev === entry.status ? null : entry.status);
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Key Metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                {avgCompletion}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Avg Complete
              </span>
            </div>
          </div>

          {/* Interactive Legend Tags */}
          <div className="grid grid-cols-2 gap-2 w-full mt-2 pt-2 border-t border-stone-200/60 dark:border-stone-800">
            {chartData.map(item => {
              const isSelected = selectedStatus === item.status;
              return (
                <button
                  key={item.status}
                  onClick={() => setSelectedStatus(prev => prev === item.status ? null : item.status)}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-stone-200 dark:bg-stone-800 font-bold text-stone-900 dark:text-white' 
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate flex-1">{item.name}</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">({item.value})</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: High-Precision Progress Bars & Milestones (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pb-1">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Active Deliverables ({filteredDeliverables.length})
            </span>
            {selectedStatus && (
              <button 
                onClick={() => setSelectedStatus(null)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear status filter
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {filteredDeliverables.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                No deliverables match the selected category or status.
              </div>
            ) : (
              filteredDeliverables.map(deliv => {
                const statusMeta = STATUS_COLORS[deliv.status] || STATUS_COLORS.in_progress;
                
                // Color ramp for progress bar
                let barColor = 'bg-blue-600';
                if (deliv.completionPercentage >= 90) barColor = 'bg-emerald-500';
                else if (deliv.completionPercentage >= 65) barColor = 'bg-blue-600';
                else if (deliv.completionPercentage >= 45) barColor = 'bg-purple-600';
                else barColor = 'bg-amber-500';

                return (
                  <div
                    key={deliv.id}
                    onClick={() => onSelectDeliverable && onSelectDeliverable(deliv)}
                    className="p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-blue-300 dark:hover:border-blue-800/80 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {deliv.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                          <span>{deliv.department}</span>
                          <span>•</span>
                          <span>{deliv.leadOfficer}</span>
                        </div>
                      </div>

                      {/* Percentage & Status Badge */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
                          {deliv.status === 'completed' ? 'Completed' : `${deliv.completionPercentage}%`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                          style={{ width: `${deliv.completionPercentage}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>Due {deliv.dueDate}</span>
                        </span>
                        <span className="capitalize font-medium text-stone-500 dark:text-stone-400">
                          Priority: {deliv.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        </div>
      )}
    </div>
  );
};
