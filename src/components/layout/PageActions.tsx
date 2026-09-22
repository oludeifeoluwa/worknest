import React from 'react';

interface PageActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const PageActions: React.FC<PageActionsProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center flex-wrap gap-2 sm:gap-3 shrink-0 ${className}`}>
      {children}
    </div>
  );
};
