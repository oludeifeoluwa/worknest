import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Key, 
  Globe, 
  Clock, 
  Check, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Radio, 
  HelpCircle,
  Save
} from 'lucide-react';
import { WorkNestPlugin, Member } from '../../types';

interface PluginConfigModalProps {
  plugin: WorkNestPlugin | null;
  currentUser: Member | null;
  onClose: () => void;
  onSave: (pluginId: string, updatedConfig: any) => void;
}

export const PluginConfigModal: React.FC<PluginConfigModalProps> = ({
  plugin,
  currentUser,
  onClose,
  onSave,
}) => {
  if (!plugin) return null;

  const [apiKey, setApiKey] = useState(plugin.userConfig?.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(plugin.userConfig?.webhookUrl || '');
  const [syncFrequency, setSyncFrequency] = useState(plugin.userConfig?.syncFrequency || 'realtime');
  const [enabledInChannels, setEnabledInChannels] = useState(plugin.userConfig?.enabledInChannels ?? true);
  const [enabledInDMs, setEnabledInDMs] = useState(plugin.userConfig?.enabledInDMs ?? true);
  const [customPrompt, setCustomPrompt] = useState(plugin.userConfig?.customInstructions || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(plugin.id, {
      apiKey,
      webhookUrl,
      syncFrequency,
      enabledInChannels,
      enabledInDMs,
      customInstructions: customPrompt,
      configuredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col my-6 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div 
              className="w-11 h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: plugin.color || '#0062FF' }}
            >
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-tight">
                {plugin.shortName || plugin.name} Settings
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Manage credentials, sync schedule, and channel triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6 overflow-y-auto flex-1">
            {/* Sync Frequency */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Data Synchronization Frequency
              </label>
              <select
                value={syncFrequency}
                onChange={e => setSyncFrequency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all cursor-pointer"
              >
                <option value="realtime">Real-time Webhook Push (Recommended)</option>
                <option value="hourly">Hourly Scheduled Sync</option>
                <option value="daily">Daily Midnight Sync</option>
                <option value="manual">Manual On-Demand Sync</option>
              </select>
            </div>

            {/* Connected Account Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Authorized Account Identity
              </label>
              <input
                type="text"
                readOnly
                value={plugin.connectedAccountEmail || currentUser?.email || 'officer@digital.gov.ng'}
                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/80 text-sm text-stone-500 font-mono"
              />
            </div>

            {/* API Key / Token (Optional for custom integrations) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Custom API Key / Secret Token (Optional)
                </label>
                <span className="text-[11px] text-stone-400">Encrypted at rest</span>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk_live_..."
                  className="w-full pl-4 pr-11 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Webhook Endpoint URL */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Inbound Notification Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://api.worknest.gov.ng/webhooks/v1/..."
                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all"
              />
            </div>

            {/* Permission & Trigger Toggles */}
            <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800/80">
              <span className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Workspace Triggers
              </span>

              <label className="flex items-center space-x-3.5 p-3.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-900/70 border border-stone-200/60 dark:border-stone-800/60 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enabledInChannels}
                  onChange={e => setEnabledInChannels(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0062FF] cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-stone-800 dark:text-stone-200 block">Enable in Public & Private Channels</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Allows team members to use slash triggers like {plugin.commandTriggers?.[0] || '/run'}</span>
                </div>
              </label>

              <label className="flex items-center space-x-3.5 p-3.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-900/70 border border-stone-200/60 dark:border-stone-800/60 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enabledInDMs}
                  onChange={e => setEnabledInDMs(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0062FF] cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-stone-800 dark:text-stone-200 block">Enable in Direct Messages</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Allows private assistant consultations</span>
                </div>
              </label>
            </div>

            {/* Custom Prompt Instructions Override */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Custom Prompt Directive / Behavior (Optional)
              </label>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="e.g. Always format executive summaries using the 3-point briefing template..."
                className="w-full px-4 py-3 text-sm rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] resize-none transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-sm font-bold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
