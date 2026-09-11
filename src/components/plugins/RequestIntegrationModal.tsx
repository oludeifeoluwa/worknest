import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Globe, 
  FileText, 
  Layers, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Member } from '../../types';

interface RequestIntegrationModalProps {
  currentUser: Member | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const RequestIntegrationModal: React.FC<RequestIntegrationModalProps> = ({
  currentUser,
  onClose,
  onSubmitSuccess,
}) => {
  const [integrationName, setIntegrationName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!integrationName.trim() || !description.trim()) {
      setErrorMsg('Please provide the tool name and a brief use case description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/plugins/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationName: integrationName.trim(),
          websiteUrl: websiteUrl.trim(),
          category,
          description: description.trim(),
          priority,
          requestedByEmail: contactEmail || currentUser?.email || 'officer@digital.gov.ng',
          requestedByName: currentUser?.name || 'WorkNest Officer'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record integration request.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSubmitSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Integration request error:', err);
      setErrorMsg('Could not submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col my-6 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-tight">
                Request an Integration
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Can't find what you need? Tell us which tool to connect.
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

        {isSuccess ? (
          <div className="px-6 sm:px-8 py-12 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-white">
              Integration Request Submitted!
            </h4>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              Thank you! Our engineering team has received your request for <strong className="text-stone-800 dark:text-stone-200">{integrationName}</strong> and will evaluate its API connectivity.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            
            <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-5 overflow-y-auto flex-1">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center space-x-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                  Tool / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={integrationName}
                  onChange={e => setIntegrationName(e.target.value)}
                  placeholder="e.g. Asana, Figma, Salesforce, Miro, Trello..."
                  className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all cursor-pointer"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Communication">Communication</option>
                    <option value="Storage">Storage & Cloud</option>
                    <option value="Analytics">Analytics & Data</option>
                    <option value="Security">Security & Compliance</option>
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="Workflow">Workflow Automation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                    Urgency / Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all cursor-pointer"
                  >
                    <option value="low">Low (Nice to have)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Departmental Need)</option>
                    <option value="urgent">Urgent (Blocking Project)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                  Official Website or API Docs URL (Optional)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://asana.com or https://developer.salesforce.com"
                  className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                  Why does your team need this integration? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your workflows, what tasks you want to automate, or what data you need synchronized with WorkNest..."
                  className="w-full px-4 py-3 text-sm rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] resize-none transition-all"
                />
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-end space-x-3 shrink-0">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] active:bg-[#003EA0] text-white text-sm font-bold shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
