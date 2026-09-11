import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Hash, 
  MessageSquare, 
  Users, 
  FileText, 
  Mail, 
  X, 
  ArrowRight,
  FolderKanban
} from 'lucide-react';
import { 
  Channel, 
  DirectMessage, 
  Member, 
  FileItem, 
  EmailMessage, 
  Message 
} from '../types';
import { UserAvatar } from './UserAvatar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels?: Channel[];
  directMessages?: DirectMessage[];
  members?: Member[];
  files?: FileItem[];
  emails?: EmailMessage[];
  onSelectChannel?: (c: Channel) => void;
  onSelectDM?: (dm: DirectMessage) => void;
  onSelectFile?: (f: FileItem) => void;
  onSelectEmail?: (e: EmailMessage) => void;
  onSelectMember?: (m: Member) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  channels = [],
  directMessages = [],
  members = [],
  files = [],
  emails = [],
  onSelectChannel,
  onSelectDM,
  onSelectFile,
  onSelectEmail,
  onSelectMember
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeChannels = Array.isArray(channels) ? channels : [];
  const safeMembers = Array.isArray(members) ? members : [];
  const safeFiles = Array.isArray(files) ? files : [];
  const safeEmails = Array.isArray(emails) ? emails : [];

  const q = query.toLowerCase().trim();

  const matchingChannels = q 
    ? safeChannels.filter(c => c && ((c.name || '').toLowerCase().includes(q) || (c.topic || '').toLowerCase().includes(q))) 
    : safeChannels.slice(0, 3);

  const matchingMembers = q 
    ? safeMembers.filter(m => m && ((m.name || '').toLowerCase().includes(q) || (m.department || '').toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q))) 
    : safeMembers.slice(0, 3);

  const matchingFiles = q 
    ? safeFiles.filter(f => f && ((f.name || '').toLowerCase().includes(q) || (f.tags || []).some(t => (t || '').toLowerCase().includes(q)))) 
    : safeFiles.slice(0, 2);

  const matchingEmails = q 
    ? safeEmails.filter(e => e && ((e.subject || '').toLowerCase().includes(q) || (e.sender?.name || '').toLowerCase().includes(q) || (e.snippet || '').toLowerCase().includes(q))) 
    : safeEmails.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[84vh] animate-scale-in my-4">
        
        {/* Search Input Bar */}
        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center space-x-4 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search directives, staff, files, emails, channels..."
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none font-medium"
          />
          <div className="flex items-center space-x-2 shrink-0">
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono text-stone-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xs">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm scrollbar-thin">
          
          {/* Channels Group */}
          {matchingChannels.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-2 flex items-center space-x-1.5">
                <span>Council Channels</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0062FF]" />
              </div>
              <div className="space-y-1">
                {matchingChannels.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectChannel?.(c);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-[#0062FF] flex items-center justify-center shrink-0">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          #{c.name}
                        </span>
                        {c.topic && (
                          <span className="text-stone-400 ml-2 text-xs">
                            {c.topic}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Group */}
          {matchingMembers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-2 flex items-center space-x-1.5">
                <span>Staff Directory</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-1">
                {matchingMembers.map(m => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMember?.(m);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40"
                  >
                    <div className="flex items-center space-x-3">
                      <UserAvatar
                        member={m}
                        size="md"
                        shape="rounded"
                      />
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {m.name}
                        </span>
                        <span className="text-stone-400 ml-2 text-xs">
                          {m.role} • {m.department}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Group */}
          {matchingFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-2 flex items-center space-x-1.5">
                <span>Statutory Vault Files & Gazettes</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              </div>
              <div className="space-y-1">
                {matchingFiles.map(f => (
                  <div
                    key={f.id}
                    onClick={() => {
                      onSelectFile?.(f);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center shrink-0">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                        {f.name}
                      </span>
                      <span className="text-stone-400 text-xs shrink-0">
                        ({f.size})
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emails Group */}
          {matchingEmails.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-2 flex items-center space-x-1.5">
                <span>Official Dispatches</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <div className="space-y-1">
                {matchingEmails.map(e => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onSelectEmail?.(e);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                          {e.subject}
                        </span>
                        <span className="text-stone-400 ml-2 text-xs">
                          From: {e.sender.name}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search prompt */}
          {matchingChannels.length === 0 && matchingMembers.length === 0 && matchingFiles.length === 0 && matchingEmails.length === 0 && (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-stone-500">Try searching for task titles, staff names, documents, or channel names</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-stone-50/50 dark:bg-stone-900/40 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>WorkNest Unified Real-Time Index</span>
          </div>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
