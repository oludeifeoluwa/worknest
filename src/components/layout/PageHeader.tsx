import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { PageActions } from './PageActions';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  breadcrumbs?: (string | BreadcrumbItem)[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  className = '',
}) => {
  return (
    <div className={`border-b border-stone-200 dark:border-stone-800/80 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-xs px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${className}`}>
      <div className="min-w-0 space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-1.5">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <div className="flex items-center space-x-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 truncate">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-normal line-clamp-1 sm:line-clamp-none max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <PageActions>
          {actions}
        </PageActions>
      )}
    </div>
  );
};
