import React, { useState } from 'react';
import { 
  Inbox, 
  Bookmark, 
  Send, 
  FileText, 
  Archive, 
  Trash2, 
  Search, 
  Reply, 
  Forward, 
  Share2, 
  Tag, 
  MoreVertical, 
  Paperclip, 
  Mail, 
  ArrowLeft, 
  Check, 
  Hash, 
  MessageSquare, 
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { 
  EmailMessage, 
  MailFolder, 
  Member, 
  Channel, 
  DirectMessage, 
  SharedEmailReference 
} from '../../types';
import { UserAvatar } from '../UserAvatar';

interface EmailViewProps {
  emails: EmailMessage[];
  activeFolder: MailFolder;
  currentUser: Member;
  channels: Channel[];
  directMessages: DirectMessage[];
  onToggleStar: (emailId: string) => void;
  onArchiveEmail: (emailId: string) => void;
  onDeleteEmail: (emailId: string) => void;
  onMarkAsRead: (emailId: string, isRead: boolean) => void;
  onOpenCompose: (replyTo?: EmailMessage) => void;
  onBridgeEmailToChat: (targetId: string, isChannel: boolean, emailRef: SharedEmailReference) => void;
  selectedEmailId?: string | null;
}

export const EmailView: React.FC<EmailViewProps> = ({
  emails = [],
  activeFolder,
  currentUser,
  channels = [],
  directMessages = [],
  onToggleStar,
  onArchiveEmail,
  onDeleteEmail,
  onMarkAsRead,
  onOpenCompose,
  onBridgeEmailToChat,
  selectedEmailId: initialSelectedId
}) => {
  const safeEmails = Array.isArray(emails) ? emails : [];
  const safeChannels = Array.isArray(channels) ? channels : [];

  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(() => {
    return safeEmails.find(e => e.id === initialSelectedId) || safeEmails.filter(e => e.folder === activeFolder)[0] || safeEmails[0] || null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTargetType, setShareTargetType] = useState<'channel' | 'dm'>('channel');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(safeChannels[0]?.id || '');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Keep selected email updated if selectedEmailId prop changes or if current selection is missing
  React.useEffect(() => {
    if (initialSelectedId) {
      const match = safeEmails.find(e => e.id === initialSelectedId);
      if (match) {
        setSelectedEmail(match);
        return;
      }
    }
    if (selectedEmail && !safeEmails.some(e => e.id === selectedEmail.id)) {
      setSelectedEmail(safeEmails.filter(e => e.folder === activeFolder)[0] || safeEmails[0] || null);
    }
  }, [initialSelectedId, safeEmails, activeFolder]);

  const folderEmails = safeEmails.filter(e => {
    if (!e) return false;
    if (activeFolder === 'starred') return e.isStarred;
    return e.folder === activeFolder;
  }).filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.subject || '').toLowerCase().includes(q) ||
      (e.sender?.name || '').toLowerCase().includes(q) ||
      (e.snippet || '').toLowerCase().includes(q) ||
      (e.body || '').toLowerCase().includes(q)
    );
  });

  const handleSelectEmail = (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      onMarkAsRead(email.id, true);
    }
  };

  const handleExecuteBridgeShare = () => {
    if (!selectedEmail) return;

    const emailRef: SharedEmailReference = {
      emailId: selectedEmail.id,
      subject: selectedEmail.subject,
      senderName: selectedEmail.sender.name,
      senderEmail: selectedEmail.sender.email,
      snippet: selectedEmail.snippet,
      date: selectedEmail.date
    };

    onBridgeEmailToChat(selectedTargetId, shareTargetType === 'channel', emailRef);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShowShareModal(false);
    }, 1200);
  };

  return (
    <div className="flex-1 h-full flex overflow-hidden bg-white dark:bg-[#0F172A] select-none text-stone-800 dark:text-stone-100">
      
      {/* Email List Column */}
      <div className={`w-full sm:w-80 md:w-96 border-r border-stone-200 dark:border-stone-800/80 flex flex-col h-full shrink-0 ${selectedEmail ? 'hidden sm:flex' : 'flex'}`}>
        
        {/* Search & Folder Header */}
        <div className="p-3.5 border-b border-stone-200 dark:border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 capitalize">
              {activeFolder} ({folderEmails.length})
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300">
              Dispatches
            </span>
          </div>
          <p className="text-[11px] text-stone-400">
            Access your connected organizational email.
          </p>

          <div className="flex items-center px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-xs">
            <Search className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search official dispatches..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Email Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80 scrollbar-thin pb-20 md:pb-0">
          {folderEmails.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400 space-y-1">
              <div className="font-semibold text-stone-600 dark:text-stone-300">No messages to display.</div>
              <p className="text-[11px] text-stone-400">No messages found in this folder.</p>
            </div>
          ) : (
            folderEmails.map(email => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`p-3.5 cursor-pointer transition-colors space-y-1 ${
                    isSelected 
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-[#0062FF]' 
                      : 'hover:bg-stone-50 dark:hover:bg-stone-900/40'
                  } ${!email.isRead ? 'font-semibold' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 truncate">
                      {!email.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0062FF] shrink-0" />
                      )}
                      <span className="text-stone-900 dark:text-stone-100 truncate font-semibold">
                        {email.sender.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0">{email.date}</span>
                  </div>

                  <div className="text-xs text-stone-800 dark:text-stone-200 truncate">
                    {email.subject}
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {email.snippet}
                  </p>

                  {/* Tags */}
                  {email.tags && email.tags.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {email.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Email Reader Column */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${!selectedEmail ? 'hidden sm:flex items-center justify-center' : 'flex'}`}>
        {!selectedEmail ? (
          <div className="text-center text-stone-400 space-y-2 p-8 max-w-sm mx-auto">
            <Mail className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700" />
            <div className="text-sm font-semibold text-stone-700 dark:text-stone-300">Select an official dispatch to read</div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Access your connected organizational email. Choose a message from the list to view its full details and attachments.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="p-3.5 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#0F172A]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="sm:hidden p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Official Communication
                </span>
              </div>

              <div className="flex items-center space-x-1">
                {/* Bridge to Internal Channel Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-950 text-[#0062FF] dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-900 transition-colors"
                  title="Bridge to Channel"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bridge to Channel</span>
                  <span className="sm:hidden">Bridge</span>
                </button>

                <button
                  onClick={() => onToggleStar(selectedEmail.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedEmail.isStarred ? 'text-blue-600 dark:text-blue-400' : 'text-stone-400 hover:text-stone-700'
                  }`}
                  title="Bookmark Message"
                >
                  <Bookmark className={`w-4 h-4 ${selectedEmail.isStarred ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => onArchiveEmail(selectedEmail.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  title="Archive Record"
                >
                  <Archive className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteEmail(selectedEmail.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600"
                  title="Delete Message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 scrollbar-thin bg-white dark:bg-[#0F172A] pb-24 md:pb-8">
              
              {/* Subject & Metadata */}
              <div className="space-y-4 pb-4 border-b border-stone-200 dark:border-stone-800/80">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {selectedEmail.subject}
                </h1>

                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      member={selectedEmail.sender}
                      size="md"
                      shape="rounded"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {selectedEmail.sender.name}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        &lt;{selectedEmail.sender?.email || 'unknown@gov.ng'}&gt;
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        To: {((selectedEmail.to || (selectedEmail as any).recipients || []) as any[]).map((r: any) => {
                          if (typeof r === 'string') return r;
                          return r?.name || r?.email || 'Officer';
                        }).join(', ') || 'Council Members'}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-stone-400 shrink-0">
                    {selectedEmail.date}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap select-text">
                {selectedEmail.body}
              </div>

              {/* Attachments Section */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="pt-6 border-t border-stone-200 dark:border-stone-800/80 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Official Attachments ({selectedEmail.attachments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedEmail.attachments || []).map(att => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <FileText className="w-5 h-5 text-[#0062FF] shrink-0" />
                          <div className="truncate">
                            <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                              {att.name}
                            </div>
                            <div className="text-[10px] text-stone-400">{att.size}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Reply & Forward Actions */}
              <div className="pt-4 flex items-center space-x-2">
                <button
                  onClick={() => onOpenCompose(selectedEmail)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Share / Bridge Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col my-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                    Bridge Email to Channel
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Dispatch correspondence into an active team channel
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowShareModal(false)} 
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-8 py-6 space-y-5 text-sm">
              <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800/70 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Dispatching formal reference for <strong className="text-stone-900 dark:text-stone-100">"{selectedEmail?.subject}"</strong> into a collaborative channel deliberation.
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                  Target Channel
                </label>
                <select
                  value={selectedTargetId}
                  onChange={e => setSelectedTargetId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] cursor-pointer transition-all"
                >
                  {(channels || []).map(chan => (
                    <option key={chan.id} value={chan.id}>#{chan.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-end space-x-3 shrink-0">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBridgeShare}
                disabled={shareSuccess}
                className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-sm font-bold shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Dispatched!</span>
                  </>
                ) : (
                  <span>Bridge to Channel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
