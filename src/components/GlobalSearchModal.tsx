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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center space-x-3">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search directives, staff, files, emails..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-400 border border-stone-200 dark:border-stone-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin">
          
          {/* Channels Group */}
          {matchingChannels.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2">
                Channels
              </div>
              {matchingChannels.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectChannel?.(c);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Hash className="w-4 h-4 text-[#0062FF]" />
                    <div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        #{c.name}
                      </span>
                      <span className="text-stone-400 ml-2 text-[11px]">
                        {c.topic}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
              ))}
            </div>
          )}

          {/* Members Group */}
          {matchingMembers.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2">
                Staff Directory
              </div>
              {matchingMembers.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMember?.(m);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <UserAvatar
                      member={m}
                      size="sm"
                      shape="rounded"
                    />
                    <div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {m.name}
                      </span>
                      <span className="text-stone-400 ml-2 text-[11px]">
                        {m.role} • {m.department}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
              ))}
            </div>
          )}

          {/* Files Group */}
          {matchingFiles.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2">
                Statutory Files & Gazettes
              </div>
              {matchingFiles.map(f => (
                <div
                  key={f.id}
                  onClick={() => {
                    onSelectFile?.(f);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FolderKanban className="w-4 h-4 text-[#0062FF] shrink-0" />
                    <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                      {f.name}
                    </span>
                    <span className="text-stone-400 text-[11px] shrink-0">
                      ({f.size})
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Emails Group */}
          {matchingEmails.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2">
                Dispatches
              </div>
              {matchingEmails.map(e => (
                <div
                  key={e.id}
                  onClick={() => {
                    onSelectEmail?.(e);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Mail className="w-4 h-4 text-[#0062FF] shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                        {e.subject}
                      </span>
                      <span className="text-stone-400 ml-2 text-[11px]">
                        From: {e.sender.name}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
              ))}
            </div>
          )}

          {/* Empty search prompt */}
          {matchingChannels.length === 0 && matchingMembers.length === 0 && matchingFiles.length === 0 && matchingEmails.length === 0 && (
            <div className="py-12 text-center text-stone-400 text-xs">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400 px-4">
          <div className="flex items-center space-x-1">
            <span>WorkNest Unified Index</span>
          </div>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
