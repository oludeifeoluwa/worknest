import React from 'react';
import { 
  X, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Download, 
  Settings, 
  Play, 
  RefreshCw, 
  Layers, 
  Zap, 
  Mail, 
  FileText, 
  Calendar, 
  Folder, 
  Code2, 
  Globe, 
  Terminal,
  HelpCircle,
  Share2,
  Trash2
} from 'lucide-react';
import { WorkNestPlugin } from '../../types';

interface PluginDetailsDrawerProps {
  plugin: WorkNestPlugin | null;
  onClose: () => void;
  onInstall: (plugin: WorkNestPlugin) => void;
  onOpenPlayground: (plugin: WorkNestPlugin) => void;
  onConfigure: (plugin: WorkNestPlugin) => void;
  onUpdate: (plugin: WorkNestPlugin) => void;
  onUninstall: (plugin: WorkNestPlugin) => void;
}

export const PluginDetailsDrawer: React.FC<PluginDetailsDrawerProps> = ({
  plugin,
  onClose,
  onInstall,
  onOpenPlayground,
  onConfigure,
  onUpdate,
  onUninstall,
}) => {
  if (!plugin) return null;

  const isConnected = plugin.connectionStatus === 'connected' || (plugin.isInstalled && plugin.isEnabled);
  const hasUpdate = plugin.updateAvailable;

  const renderIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'Calendar': return <Calendar className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'Folder': return <Folder className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Code2': return <Code2 className={className} />;
      default: return <Layers className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/60 backdrop-blur-xs select-none animate-in fade-in">
      <div className="w-full max-w-xl h-full bg-white dark:bg-[#111827] border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>Marketplace</span>
            <span>/</span>
            <span className="text-stone-900 dark:text-white font-bold">{plugin.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          {/* Main Hero Header */}
          <div className="flex items-start space-x-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: plugin.color || '#0062FF' }}
            >
              {renderIcon(plugin.iconName, "w-8 h-8")}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white leading-tight">
                  {plugin.name}
                </h2>
                {plugin.isVerified && (
                  <span title="Verified Enterprise Provider">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Developed by <span className="text-stone-700 dark:text-stone-300 font-semibold">{plugin.provider || plugin.author}</span>
              </p>
              <div className="flex items-center space-x-3 text-[11px] text-stone-400 pt-1">
                <span>Version {plugin.version}</span>
                <span>•</span>
                <span>Updated {plugin.lastUpdated || 'Recently'}</span>
                <span>•</span>
                <span>{plugin.installCount ? `${plugin.installCount.toLocaleString()} installs` : 'Featured'}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs in Header */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Status</div>
              <div className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 flex items-center space-x-1.5">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400">Installed & Active</span>
                  </>
                ) : hasUpdate ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">Update Available ({plugin.newVersion})</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    <span>Not Installed</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <button
                    onClick={() => {
                      onOpenPlayground(plugin);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#0062FF] dark:text-blue-400 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Open in Playground</span>
                  </button>

                  <button
                    onClick={() => {
                      onConfigure(plugin);
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>
                </>
              ) : hasUpdate ? (
                <button
                  onClick={() => {
                    onUpdate(plugin);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update to v{plugin.newVersion}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onInstall(plugin);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Integration</span>
                </button>
              )}
            </div>
          </div>

          {/* Overview Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Overview
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {plugin.description}
            </p>
          </div>

          {/* Key Features Checklist */}
          {plugin.features && plugin.features.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Key Features & Capabilities
              </h3>
              <div className="space-y-2 bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
                {plugin.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-stone-700 dark:text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicit Permissions List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Required Scopes & Permissions
              </h3>
              <span className="text-[10px] text-stone-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0062FF]" />
                <span>Zero-Trust Compliance</span>
              </span>
            </div>

            <div className="space-y-2 bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
              {(plugin.permissions && plugin.permissions.length > 0 ? plugin.permissions : [
                'Read authorized channel messages and dispatches',
                'Transmit authenticated outbound webhooks',
                'Synchronize organizational items with end-to-end encryption'
              ]).map((perm, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-stone-700 dark:text-stone-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0062FF] shrink-0" />
                  <span className="font-mono text-[11px]">{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Command Triggers */}
          {plugin.commandTriggers && plugin.commandTriggers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Slash Commands & Triggers
              </h3>
              <div className="flex flex-wrap gap-2">
                {plugin.commandTriggers.map((trig, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 font-mono text-xs font-bold border border-blue-200 dark:border-blue-900">
                    {trig}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications & Links */}
          <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Technical Information & Support
            </h3>

            <div className="grid grid-cols-2 gap-3 text-stone-600 dark:text-stone-300">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block">Compatibility</span>
                <span className="font-semibold">{plugin.compatibility || 'WorkNest Web & Mobile v2.0+'}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block">Authentication</span>
                <span className="font-semibold">{plugin.authType === 'none' ? 'Public API' : 'OAuth 2.0 / Bearer'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-1">
              {plugin.documentationUrl && (
                <a 
                  href={plugin.documentationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0062FF] hover:underline flex items-center space-x-1"
                >
                  <span>Official Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {plugin.supportEmail && (
                <span className="text-xs text-stone-400">
                  Support: <a href={`mailto:${plugin.supportEmail}`} className="text-stone-600 dark:text-stone-300 hover:underline">{plugin.supportEmail}</a>
                </span>
              )}
            </div>
          </div>

          {/* Destructive Disconnect Action if Installed */}
          {isConnected && (
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  onUninstall(plugin);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect & Uninstall Integration</span>
              </button>
            </div>
          )}

        </div>

        {/* Drawer Bottom Bar */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
