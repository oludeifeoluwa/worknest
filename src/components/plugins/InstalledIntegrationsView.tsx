import React from 'react';
import { 
  CheckCircle2, 
  Settings, 
  Play, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Layers, 
  Zap, 
  Plus, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  Search
} from 'lucide-react';
import { WorkNestPlugin } from '../../types';

interface InstalledIntegrationsViewProps {
  installedPlugins: WorkNestPlugin[];
  onOpenDetails: (plugin: WorkNestPlugin) => void;
  onOpenPlayground: (plugin: WorkNestPlugin) => void;
  onConfigure: (plugin: WorkNestPlugin) => void;
  onToggleEnabled: (pluginId: string) => void;
  onUninstall: (plugin: WorkNestPlugin) => void;
  onBrowseMarketplace: () => void;
}

export const InstalledIntegrationsView: React.FC<InstalledIntegrationsViewProps> = ({
  installedPlugins,
  onOpenDetails,
  onOpenPlayground,
  onConfigure,
  onToggleEnabled,
  onUninstall,
  onBrowseMarketplace,
}) => {
  if (installedPlugins.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-8 max-w-lg mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] flex items-center justify-center mx-auto">
          <Layers className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-stone-900 dark:text-white">
            No plugins installed yet
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
            Connect your first integration to extend what WorkNest can do. Connect Google Workspace, Microsoft 365, GitHub, and developer tools.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={onBrowseMarketplace}
            className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Integrations</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white tracking-tight">
            Installed Integrations ({installedPlugins.length})
          </h2>
        </div>
        <button
          onClick={onBrowseMarketplace}
          className="text-xs font-bold text-[#0062FF] hover:underline cursor-pointer flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add More Integrations</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {installedPlugins.map(plugin => {
          const isEnabled = plugin.isEnabled;

          return (
            <div
              key={plugin.id}
              className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: isEnabled ? '#10B981' : '#94A3B8' }}
              />

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: plugin.color || '#0062FF' }}
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 
                          onClick={() => onOpenDetails(plugin)}
                          className="text-sm font-bold text-stone-900 dark:text-white hover:text-[#0062FF] cursor-pointer"
                        >
                          {plugin.shortName || plugin.name}
                        </h3>
                        {plugin.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400">
                        {plugin.provider || plugin.author} • v{plugin.version}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onToggleEnabled(plugin.id)}
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                      title={isEnabled ? "Disable Integration" : "Enable Integration"}
                    >
                      {isEnabled ? (
                        <ToggleRight className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-stone-400" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                  {plugin.description}
                </p>

                {/* Account & Sync Metadata */}
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-100 dark:border-stone-800 space-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>Last sync: {plugin.lastSyncedAt || 'Active'}</span>
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">{plugin.userConfig?.syncFrequency || 'Real-time push'}</span>
                  </div>
                  {plugin.connectedAccountEmail && (
                    <div className="truncate text-stone-600 dark:text-stone-300 font-mono text-[10px]">
                      Account: {plugin.connectedAccountEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenPlayground(plugin)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0062FF] dark:text-blue-400 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Playground</span>
                  </button>

                  <button
                    onClick={() => onConfigure(plugin)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>
                </div>

                <button
                  onClick={() => onUninstall(plugin)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Remove / Disconnect Integration"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
