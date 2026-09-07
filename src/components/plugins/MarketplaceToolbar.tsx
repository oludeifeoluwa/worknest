import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Check, 
  Layers, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { PluginCategory } from '../../types';

export interface FilterState {
  searchQuery: string;
  category: string;
  status: 'all' | 'installed' | 'available' | 'updates' | 'custom';
  sortBy: 'recommended' | 'popular' | 'recent' | 'alphabetical';
}

interface MarketplaceToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  installedCount: number;
  updatesCount: number;
}

export const MARKETPLACE_CATEGORIES: { id: string; label: string }[] = [
  { id: 'All', label: 'All Categories' },
  { id: 'Productivity', label: 'Productivity' },
  { id: 'Communication', label: 'Communication' },
  { id: 'Storage', label: 'Storage & Files' },
  { id: 'Analytics', label: 'Analytics' },
  { id: 'Security', label: 'Security & Compliance' },
  { id: 'Developer Tools', label: 'Developer Tools' },
  { id: 'Notifications', label: 'Notifications' },
  { id: 'Workflow', label: 'Workflow' },
  { id: 'Other', label: 'Other' },
  { id: 'Custom', label: 'Custom Extensions' }
];

export const MarketplaceToolbar: React.FC<MarketplaceToolbarProps> = ({
  filters,
  onFilterChange,
  categoryCounts,
  totalCount,
  installedCount,
  updatesCount,
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top Search & Primary Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            id="marketplace-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={e => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search plugins, integrations, or tools..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111827] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF] shadow-xs"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Selector and Sort Dropdown */}
        <div className="flex items-center space-x-2">
          {/* Status Tabs on Desktop */}
          <div className="hidden sm:flex items-center p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => onFilterChange({ status: 'all' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.status === 'all'
                  ? 'bg-white dark:bg-stone-800 text-[#0062FF] dark:text-blue-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              All ({totalCount})
            </button>

            <button
              onClick={() => onFilterChange({ status: 'installed' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.status === 'installed'
                  ? 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Installed ({installedCount})
            </button>

            <button
              onClick={() => onFilterChange({ status: 'available' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.status === 'available'
                  ? 'bg-white dark:bg-stone-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Available ({totalCount - installedCount})
            </button>

            {updatesCount > 0 && (
              <button
                onClick={() => onFilterChange({ status: 'updates' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  filters.status === 'updates'
                    ? 'bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                <span>Updates</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={e => onFilterChange({ sortBy: e.target.value as any })}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111827] text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0062FF] cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Updated</option>
              <option value="alphabetical">Alphabetical (A–Z)</option>
            </select>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="sm:hidden p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111827] text-stone-700 dark:text-stone-300 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Category Pill Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {MARKETPLACE_CATEGORIES.map(cat => {
          const isSelected = filters.category === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-[#0062FF] text-white border-[#0062FF] shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Filter Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full bg-white dark:bg-[#111827] rounded-t-3xl p-6 space-y-5 max-h-[80vh] overflow-y-auto border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#0062FF]" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">Filter Marketplace</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Installation Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(['all', 'installed', 'available', 'updates'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => onFilterChange({ status: st })}
                    className={`p-2 rounded-xl text-xs font-bold border text-left capitalize transition-all cursor-pointer ${
                      filters.status === st
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-[#0062FF] text-[#0062FF]'
                        : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {st === 'all' ? 'All Integrations' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {MARKETPLACE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onFilterChange({ category: cat.id })}
                    className={`w-full p-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer ${
                      filters.category === cat.id
                        ? 'bg-[#0062FF] text-white font-bold'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[11px] opacity-80">{categoryCounts[cat.id] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-[#0062FF] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
