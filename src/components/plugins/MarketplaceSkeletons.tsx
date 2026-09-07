import React from 'react';
import { Search, X, Plus } from 'lucide-react';

export const MarketplaceSkeletons: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div 
          key={i} 
          className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-stone-200 dark:bg-stone-800" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 rounded-md bg-stone-200 dark:bg-stone-800" />
                <div className="w-16 h-3 rounded-md bg-stone-100 dark:bg-stone-800/80" />
              </div>
            </div>
            <div className="w-14 h-5 rounded-full bg-stone-100 dark:bg-stone-800" />
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-md bg-stone-100 dark:bg-stone-800" />
            <div className="w-5/6 h-3 rounded-md bg-stone-100 dark:bg-stone-800" />
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
            <div className="w-16 h-3 rounded-md bg-stone-100 dark:bg-stone-800" />
            <div className="w-20 h-7 rounded-xl bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface MarketplaceEmptyStateProps {
  searchQuery: string;
  category: string;
  onClearFilters: () => void;
  onRequestIntegration: () => void;
}

export const MarketplaceEmptyState: React.FC<MarketplaceEmptyStateProps> = ({
  searchQuery,
  category,
  onClearFilters,
  onRequestIntegration,
}) => {
  return (
    <div className="py-16 text-center space-y-4 bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-8 max-w-lg mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
        <Search className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-stone-900 dark:text-white">
          No integrations found
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
          {searchQuery 
            ? `No plugins matched "${searchQuery}"${category !== 'All' ? ` in ${category}` : ''}. Try broadening your search terms or request a new integration.`
            : `There are currently no integrations under ${category}.`}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
        >
          Clear All Filters
        </button>

        <button
          onClick={onRequestIntegration}
          className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request this Integration</span>
        </button>
      </div>
    </div>
  );
};
