import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  banner?: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  sidebar,
  header,
  children,
  banner,
  bottomNav,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#0B101B] text-stone-900 dark:text-stone-100 antialiased font-sans">
      {/* Optional Top Warning / Reconnect Banner */}
      {banner}

      {/* 1. Global Navigation Sidebar (Desktop Persistent & Mobile Drawer) */}
      {sidebar}

      {/* 2. Main Area: Top Header + Page Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-stone-50/50 dark:bg-[#10141E]">
        {/* Global Unified Top Header */}
        {header}

        {/* Dynamic Page Content Stage */}
        <main className="flex-1 h-full overflow-hidden flex flex-col relative min-w-0 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation (Visible on mobile screens) */}
      {bottomNav}
    </div>
  );
};
