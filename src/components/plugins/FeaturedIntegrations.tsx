import React from 'react';
import { 
  CheckCircle2, 
  Star, 
  Download, 
  ArrowRight, 
  Play, 
  Settings, 
  RefreshCw, 
  Layers,
  Zap,
  Calendar,
  Mail,
  Folder,
  Sliders
} from 'lucide-react';
import { WorkNestPlugin } from '../../types';

interface FeaturedIntegrationsProps {
  plugins: WorkNestPlugin[];
  onOpenDetails: (plugin: WorkNestPlugin) => void;
  onInstall: (plugin: WorkNestPlugin) => void;
  onOpenPlayground: (plugin: WorkNestPlugin) => void;
  onConfigure: (plugin: WorkNestPlugin) => void;
  onUpdate: (plugin: WorkNestPlugin) => void;
}

export const FeaturedIntegrations: React.FC<FeaturedIntegrationsProps> = ({
  plugins,
  onOpenDetails,
  onInstall,
  onOpenPlayground,
  onConfigure,
  onUpdate
}) => {
  // Select top featured plugins (limit to 3 or 4)
  const featured = plugins.filter(p => p.isFeatured || p.id === 'plug_gemini_assistant' || p.id === 'plug_google_calendar' || p.id === 'plug_ms_outlook').slice(0, 3);

  if (featured.length === 0) return null;

  const renderIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-white" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-white" />;
      case 'Mail': return <Mail className="w-5 h-5 text-white" />;
      case 'Folder': return <Folder className="w-5 h-5 text-white" />;
      default: return <Layers className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#0062FF]" />
          <h2 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white tracking-tight">
            Featured Integrations
          </h2>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            Staff Picks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.map(plugin => {
          const isConnected = plugin.connectionStatus === 'connected' || (plugin.isInstalled && plugin.isEnabled);
          const hasUpdate = plugin.updateAvailable;

          return (
            <div
              key={plugin.id}
              className="group relative rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-600"
            >
              {/* Subtle top accent gradient */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ backgroundColor: plugin.color || '#0062FF' }}
              />

              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: plugin.color || '#0062FF' }}
                    >
                      {renderIcon(plugin.iconName, plugin.color)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 
                          onClick={() => onOpenDetails(plugin)}
                          className="text-sm font-bold text-stone-900 dark:text-white hover:text-[#0062FF] dark:hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {plugin.shortName || plugin.name}
                        </h3>
                        {plugin.isVerified && (
                          <span title="Verified Enterprise Integration">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {plugin.provider || plugin.author}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isConnected ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Installed</span>
                      </span>
                    ) : hasUpdate ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        <span>Update Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-600 dark:text-stone-400">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                  {plugin.description}
                </p>

                {/* Key Features List */}
                {plugin.features && plugin.features.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {plugin.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDetails(plugin)}
                  className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center space-x-1.5">
                  {isConnected ? (
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
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onInstall(plugin)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] active:bg-[#003EA0] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
