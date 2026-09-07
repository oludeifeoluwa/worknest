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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: plugin.color || '#0062FF' }}
            >
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                {plugin.shortName || plugin.name} Settings
              </h3>
              <p className="text-[11px] text-stone-400">
                Manage credentials, sync schedule, and channel triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Sync Frequency */}
          <div className="space-y-1.5">
            <label className="block font-bold text-stone-700 dark:text-stone-300">
              Data Synchronization Frequency
            </label>
            <select
              value={syncFrequency}
              onChange={e => setSyncFrequency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
            >
              <option value="realtime">Real-time Webhook Push (Recommended)</option>
              <option value="hourly">Hourly Scheduled Sync</option>
              <option value="daily">Daily Midnight Sync</option>
              <option value="manual">Manual On-Demand Sync</option>
            </select>
          </div>

          {/* Connected Account Email */}
          <div className="space-y-1.5">
            <label className="block font-bold text-stone-700 dark:text-stone-300">
              Authorized Account Identity
            </label>
            <input
              type="text"
              readOnly
              value={plugin.connectedAccountEmail || currentUser?.email || 'officer@digital.gov.ng'}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/80 text-xs text-stone-500 font-mono"
            />
          </div>

          {/* API Key / Token (Optional for custom integrations) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-stone-700 dark:text-stone-300">
                Custom API Key / Secret Token (Optional)
              </label>
              <span className="text-[10px] text-stone-400">Encrypted at rest</span>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk_live_..."
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Webhook Endpoint URL */}
          <div className="space-y-1.5">
            <label className="block font-bold text-stone-700 dark:text-stone-300">
              Inbound Notification Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://api.worknest.gov.ng/webhooks/v1/..."
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
            />
          </div>

          {/* Permission & Trigger Toggles */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Workspace Triggers
            </span>

            <label className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={enabledInChannels}
                onChange={e => setEnabledInChannels(e.target.checked)}
                className="w-4 h-4 rounded text-[#0062FF] cursor-pointer"
              />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200 block">Enable in Public & Private Channels</span>
                <span className="text-[11px] text-stone-400">Allows team members to use slash triggers like {plugin.commandTriggers?.[0] || '/run'}</span>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={enabledInDMs}
                onChange={e => setEnabledInDMs(e.target.checked)}
                className="w-4 h-4 rounded text-[#0062FF] cursor-pointer"
              />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200 block">Enable in Direct Messages</span>
                <span className="text-[11px] text-stone-400">Allows private assistant consultations</span>
              </div>
            </label>
          </div>

          {/* Custom Prompt Instructions Override */}
          <div className="space-y-1.5 pt-1">
            <label className="block font-bold text-stone-700 dark:text-stone-300">
              Custom Prompt Directive / Behavior (Optional)
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="e.g. Always format executive summaries using the 3-point briefing template..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
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
