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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                Request an Integration
              </h3>
              <p className="text-[11px] text-stone-400">
                Can't find what you need? Tell us which tool to connect.
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

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-stone-900 dark:text-white">
              Integration Request Submitted!
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Thank you! Our engineering team has received your request for <strong>{integrationName}</strong> and will evaluate its API connectivity.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tool / Service Name *
              </label>
              <input
                type="text"
                required
                value={integrationName}
                onChange={e => setIntegrationName(e.target.value)}
                placeholder="e.g. Asana, Figma, Salesforce, Miro, Trello..."
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
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
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                >
                  <option value="low">Low (Nice to have)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Departmental Need)</option>
                  <option value="urgent">Urgent (Blocking Project)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Official Website or API Docs URL (Optional)
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://asana.com or https://developer.salesforce.com"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Why does your team need this integration? *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your workflows, what tasks you want to automate, or what data you need synchronized with WorkNest..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF] resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] active:bg-[#003EA0] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
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
