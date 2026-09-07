import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  Hash, 
  Mail, 
  Menu, 
  FileText, 
  Calendar, 
  Languages, 
  Users, 
  Settings, 
  X, 
  Sun, 
  Moon, 
  Video,
  CheckSquare,
  LogOut
} from 'lucide-react';
import { ActiveSection } from '../types';

interface MobileBottomNavProps {
  activeSection: ActiveSection;
  onSelectSection: (sec: ActiveSection) => void;
  onToggleSidebar?: () => void;
  unreadChannelsCount?: number;
  unreadDMsCount?: number;
  unreadEmailsCount?: number;
  activeMeetingCount?: number;
  theme?: 'dark' | 'light' | 'system';
  onToggleTheme?: () => void;
  onLogout?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onSelectSection,
  unreadChannelsCount = 0,
  unreadDMsCount = 0,
  unreadEmailsCount = 0,
  theme = 'dark',
  onToggleTheme,
  onLogout
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMoreMenuOpen) {
        setIsMoreMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoreMenuOpen]);

  // Primary 4 Mobile Navigation Items + 1 More Drawer Button
  const primaryItems = [
    {
      id: 'home' as ActiveSection,
      label: 'Home',
      icon: Home,
      badge: 0,
      matches: (s: ActiveSection) => s === 'home'
    },
    {
      id: 'messages' as ActiveSection,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadDMsCount,
      matches: (s: ActiveSection) => s === 'messages'
    },
    {
      id: 'calendar' as ActiveSection,
      label: 'Calendar',
      icon: Calendar,
      badge: 0,
      matches: (s: ActiveSection) => s === 'calendar'
    },
    {
      id: 'meetings' as ActiveSection,
      label: 'Meetings',
      icon: Video,
      badge: 0,
      matches: (s: ActiveSection) => s === 'meetings'
    }
  ];

  // Secondary items in the "More" Drawer
  const secondaryItems = [
    {
      id: 'channels' as ActiveSection,
      label: 'Council Channels',
      description: 'Public, private, and department group channels',
      icon: Hash,
      badge: unreadChannelsCount
    },
    {
      id: 'email' as ActiveSection,
      label: 'Official Email & Dispatches',
      description: 'Formal institutional correspondence and gazettes',
      icon: Mail,
      badge: unreadEmailsCount
    },
    {
      id: 'tasks' as ActiveSection,
      label: 'Project Tasks & Deliverables',
      description: 'Track state deliverables, milestones & task directives',
      icon: CheckSquare,
      badge: 0
    },
    {
      id: 'files' as ActiveSection,
      label: 'Statutory Files Vault',
      description: 'Official state circulars, gazettes & documents',
      icon: FileText,
      badge: 0
    },
    {
      id: 'people' as ActiveSection,
      label: 'Staff Directory',
      description: 'Public sector officers, roles and agency departments',
      icon: Users,
      badge: 0
    },
    {
      id: 'plugins' as ActiveSection,
      label: 'Language Translate',
      description: 'Multilateral neural translation & diplomatic speech',
      icon: Languages,
      badge: 0
    },
    {
      id: 'settings' as ActiveSection,
      label: 'Governance & Settings',
      description: 'Institutional security, domain allowlist & audit logs',
      icon: Settings,
      badge: 0
    }
  ];

  return (
    <>
      {/* 1. Dedicated Mobile Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-navigation"
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-1.5 py-1 flex items-center justify-around shadow-2xl transition-colors select-none"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matches(activeSection);
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => {
                onSelectSection(item.id);
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
                isActive 
                  ? 'text-[#0062FF] dark:text-blue-400 font-bold' 
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#0062FF] text-[9px] font-bold text-white flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium truncate">{item.label}</span>
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          id="mobile-nav-more"
          onClick={() => setIsMoreMenuOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
            isMoreMenuOpen 
              ? 'text-[#0062FF] dark:text-blue-400 font-bold' 
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">More</span>
        </button>
      </nav>

      {/* 2. Full Drawer Modal for Additional Sections */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-stone-950/70 backdrop-blur-xs">
          <div 
            onClick={() => setIsMoreMenuOpen(false)}
            className="flex-1"
          />
          <div className="bg-white dark:bg-[#0F172A] rounded-t-3xl border-t border-stone-200 dark:border-stone-800 p-4 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Council Workspace Navigation
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Institutional Modules & Services</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {onToggleTheme && (
                  <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-xl text-stone-500 hover:text-amber-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Toggle Theme"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
                  </button>
                )}
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-drawer-${item.id}`}
                    onClick={() => {
                      onSelectSection(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-colors text-left cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800' 
                        : 'bg-stone-50 dark:bg-[#141B2D] hover:bg-stone-100 dark:hover:bg-[#1A2238] border border-transparent'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isActive 
                        ? 'bg-[#0062FF] text-white' 
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-2xs'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {item.label}
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#0062FF] text-[9px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {onLogout && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  id="mobile-drawer-signout"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 transition-colors text-left font-semibold text-xs cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div>Sign Out Session</div>
                    <div className="text-[10px] opacity-75 font-normal">Terminate current login credentials</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
