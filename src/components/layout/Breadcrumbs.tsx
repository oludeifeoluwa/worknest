import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: (string | BreadcrumbItem)[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm select-none ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = typeof item === 'string' ? item : item.label;
        const onClick = typeof item === 'object' ? item.onClick : undefined;
        const isActive = typeof item === 'object' ? item.active : isLast;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-stone-300 dark:text-stone-600 font-normal">/</span>
            )}
            {onClick && !isLast ? (
              <button
                type="button"
                onClick={onClick}
                className="font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
              >
                {label}
              </button>
            ) : (
              <span
                className={`truncate ${
                  isActive
                    ? 'font-medium text-[#0062FF] dark:text-blue-400'
                    : 'font-semibold text-stone-900 dark:text-stone-100'
                }`}
              >
                {label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
