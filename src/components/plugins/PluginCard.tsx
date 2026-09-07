import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  CheckCircle2, 
  Settings, 
  Play, 
  MoreVertical, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Info, 
  ToggleLeft, 
  ToggleRight,
  Zap,
  Calendar,
  Mail,
  Folder,
  FolderCheck,
  MessageSquare,
  Video,
  Calculator,
  GitBranch,
  Languages,
  Code2,
  Globe,
  FileText,
  Sliders,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { WorkNestPlugin } from '../../types';

interface PluginCardProps {
  plugin: WorkNestPlugin;
  installingState?: 'idle' | 'installing' | 'error';
  onOpenDetails: (plugin: WorkNestPlugin) => void;
  onInstall: (plugin: WorkNestPlugin) => void;
  onOpenPlayground: (plugin: WorkNestPlugin) => void;
  onConfigure: (plugin: WorkNestPlugin) => void;
  onUpdate: (plugin: WorkNestPlugin) => void;
  onToggleEnabled: (pluginId: string) => void;
  onUninstall: (plugin: WorkNestPlugin) => void;
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  installingState = 'idle',
  onOpenDetails,
  onInstall,
  onOpenPlayground,
  onConfigure,
  onUpdate,
  onToggleEnabled,
  onUninstall,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isConnected = plugin.connectionStatus === 'connected' || (plugin.isInstalled && plugin.isEnabled);
  const isInstalled = plugin.isInstalled;
  const isEnabled = plugin.isEnabled;
  const hasUpdate = plugin.updateAvailable;
  const isError = plugin.connectionStatus === 'install_error' || installingState === 'error';
  const isInstalling = installingState === 'installing' || plugin.connectionStatus === 'connecting';

  // Icon Resolver
  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Calendar': return <Calendar className={className} />;
      case 'Folder': return <Folder className={className} />;
      case 'FolderCheck': return <FolderCheck className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'MessageSquare': return <MessageSquare className={className} />;
      case 'Video': return <Video className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Calculator': return <Calculator className={className} />;
      case 'GitBranch': return <GitBranch className={className} />;
      case 'Languages': return <Languages className={className} />;
      case 'Code2': return <Code2 className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sliders': return <Sliders className={className} />;
      default: return <Layers className={className} />;
    }
  };

  return (
    <div
      id={`plugin-card-${plugin.id}`}
      className="group relative rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-600"
    >
      {/* Top Accent Brand Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-colors"
        style={{ backgroundColor: isConnected ? '#10B981' : plugin.color || '#0062FF' }}
      />

      <div className="space-y-3 pt-1">
        {/* Card Header: Icon, Titles, Badges, Context Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-3">
            <div 
              onClick={() => onOpenDetails(plugin)}
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white cursor-pointer transform group-hover:scale-105 transition-transform"
              style={{ backgroundColor: plugin.color || '#0062FF' }}
            >
              {renderIcon(plugin.iconName, "w-5 h-5")}
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 
                  onClick={() => onOpenDetails(plugin)}
                  className="text-sm font-bold text-stone-900 dark:text-white leading-tight hover:text-[#0062FF] dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {plugin.shortName || plugin.name}
                </h3>
                {plugin.isVerified && (
                  <span title="Verified Enterprise Integration">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                <span>{plugin.provider || plugin.author}</span>
                <span>•</span>
                <span className="font-mono">v{plugin.version}</span>
              </div>
            </div>
          </div>

          {/* Status Badge & Dropdown Trigger */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {isInstalling ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-[#0062FF] dark:text-blue-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Installing...</span>
              </span>
            ) : isConnected ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Installed</span>
              </span>
            ) : hasUpdate ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                <span>Update</span>
              </span>
            ) : isError ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span>Error</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-600 dark:text-stone-400">
                Available
              </span>
            )}

            {/* Context Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#1E293B] border border-stone-200 dark:border-slate-700 shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDetails(plugin);
                    }}
                    className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-stone-400" />
                    <span>View Integration Details</span>
                  </button>

                  {isConnected && (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onConfigure(plugin);
                        }}
                        className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-stone-400" />
                        <span>Configure Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenPlayground(plugin);
                        }}
                        className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-[#0062FF]" />
                        <span>Run in Playground</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onToggleEnabled(plugin.id);
                        }}
                        className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer"
                      >
                        {isEnabled ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Disable Extension</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5 text-stone-400" />
                            <span>Enable Extension</span>
                          </>
                        )}
                      </button>

                      <div className="border-t border-stone-100 dark:border-slate-700 my-1" />

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onUninstall(plugin);
                        }}
                        className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Disconnect / Remove</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Body */}
        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
          {plugin.description}
        </p>

        {/* Slash Command Triggers Pills */}
        {plugin.commandTriggers && plugin.commandTriggers.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 pt-0.5">
            {plugin.commandTriggers.slice(0, 3).map(trigger => (
              <span 
                key={trigger}
                className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-mono font-bold text-[#0062FF] dark:text-blue-400"
              >
                {trigger}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Footer: Category, Last sync */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 pt-1">
          <span className="px-2 py-0.5 rounded-md bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-[10px] font-semibold text-stone-600 dark:text-stone-400">
            {plugin.category}
          </span>

          {isConnected && plugin.lastSyncedAt ? (
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Synced {plugin.lastSyncedAt}</span>
            </span>
          ) : (
            <span>{plugin.installCount ? `${plugin.installCount.toLocaleString()} installs` : 'New'}</span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetails(plugin)}
          className="text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <span>Details</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>

        <div className="flex items-center space-x-1.5">
          {isInstalling ? (
            <button
              disabled
              className="px-4 py-1.5 rounded-xl bg-blue-500/10 text-[#0062FF] text-xs font-bold flex items-center space-x-1.5 cursor-not-allowed"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Installing...</span>
            </button>
          ) : isConnected ? (
            <>
              <button
                onClick={() => onOpenPlayground(plugin)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0062FF] dark:text-blue-400 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>
              <button
                onClick={() => onConfigure(plugin)}
                className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Configure Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </>
          ) : hasUpdate ? (
            <button
              onClick={() => onUpdate(plugin)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update</span>
            </button>
          ) : isError ? (
            <button
              onClick={() => onInstall(plugin)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          ) : (
            <button
              onClick={() => onInstall(plugin)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] active:bg-[#003EA0] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
