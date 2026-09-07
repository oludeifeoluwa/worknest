import React, { useState } from 'react';
import { 
  X, 
  Hash, 
  Lock, 
  Send, 
  Paperclip, 
  FileText, 
  Download, 
  Users, 
  Mail, 
  Check, 
  Image as ImageIcon,
  ShieldCheck,
  Building2,
  FileCheck,
  ExternalLink,
  FolderKanban,
  Folder,
  FolderCheck,
  Search,
  Star,
  Plus,
  Calendar,
  Video,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { 
  Channel, 
  Member, 
  FileItem, 
  EmailMessage, 
  ChannelCategory 
} from '../types';
import { SAMPLE_CLOUD_FILES, CloudDriveFile } from '../lib/pluginsData';

/* =========================================================================
   1. CREATE CHANNEL MODAL
   ========================================================================= */
interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channel: Partial<Channel>) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel
}) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChannelCategory>('Departments');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateChannel({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      topic,
      description,
      category,
      isPrivate
    });

    setName('');
    setTopic('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 space-y-4">
        
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-[#0062FF]" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Create Channel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Channel Identifier
            </label>
            <div className="flex items-center px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
              <span className="text-stone-400 mr-1 font-mono">#</span>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. general-operations"
                className="w-full bg-transparent text-xs text-stone-900 dark:text-stone-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ChannelCategory)}
              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              <option value="General">General</option>
              <option value="Departments">Departments</option>
              <option value="Projects">Projects</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Topic / Purpose
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Operational logistics and directives"
              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="private-chan-check"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-[#0062FF] focus:ring-0"
            />
            <label htmlFor="private-chan-check" className="text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
              Restricted (Private access only)
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white font-bold shadow-xs"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   2. CREATE DIRECT MESSAGE MODAL
   ========================================================================= */
interface CreateDMModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentUser: Member;
  onCreateDM: (selectedMemberId: string) => void;
}

export const CreateDMModal: React.FC<CreateDMModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUser,
  onCreateDM
}) => {
  const [selectedId, setSelectedId] = useState<string>('');

  if (!isOpen) return null;

  const eligibleMembers = (members || []).filter(m => m && m.id !== currentUser?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    onCreateDM(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 space-y-4">
        
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#0062FF]" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Start Direct Staff Line
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Select Colleague
            </label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              <option value="">Choose a staff member...</option>
              {eligibleMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department} — {m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedId}
              className="px-4 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white font-bold shadow-xs disabled:opacity-40"
            >
              Open Direct Line
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   3. COMPOSE EMAIL MODAL
   ========================================================================= */
interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (email: Partial<EmailMessage>) => void;
  replyTo?: EmailMessage | null;
  members: Member[];
  currentUser: Member;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  isOpen,
  onClose,
  onSendEmail,
  replyTo,
  members,
  currentUser
}) => {
  const [toEmail, setToEmail] = useState(replyTo ? replyTo.sender.email : '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [attachedCloudFiles, setAttachedCloudFiles] = useState<CloudDriveFile[]>([]);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [driveProvider, setDriveProvider] = useState<'gdrive' | 'onedrive'>('gdrive');

  if (!isOpen) return null;

  const handleToggleAttachFile = (file: CloudDriveFile) => {
    if (attachedCloudFiles.some(f => f.id === file.id)) {
      setAttachedCloudFiles(attachedCloudFiles.filter(f => f.id !== file.id));
    } else {
      setAttachedCloudFiles([...attachedCloudFiles, file]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail || !subject || !body) return;

    let enrichedBody = body;
    if (attachedCloudFiles.length > 0) {
      enrichedBody += '\n\n---\n📎 Attached Cloud Documents:\n' + attachedCloudFiles.map(f => `• ${f.name} (${f.size}) - [${f.provider === 'gdrive' ? 'Google Drive' : 'OneDrive'}]`).join('\n');
    }

    onSendEmail({
      to: [{
        name: toEmail.split('@')[0],
        email: toEmail.trim()
      }],
      subject,
      body: enrichedBody,
      folder: 'sent',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-[#0062FF]" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Compose Official Dispatch
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs flex-1 overflow-y-auto pr-1">
          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              required
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              placeholder="e.g. officer@agency.gov.ng"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Subject Line
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Quarterly Budget Allocation Directive"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none font-semibold"
            />
          </div>

          {/* Cloud Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">
                Institutional Cloud Attachments
              </label>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => { setDriveProvider('gdrive'); setIsDrivePickerOpen(!isDrivePickerOpen); }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0062FF] dark:text-blue-400 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Folder className="w-3 h-3 text-emerald-600" />
                  <span>Google Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setDriveProvider('onedrive'); setIsDrivePickerOpen(!isDrivePickerOpen); }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <FolderCheck className="w-3 h-3 text-[#0078D4]" />
                  <span>OneDrive</span>
                </button>
              </div>
            </div>

            {/* Cloud Picker Accordion */}
            {isDrivePickerOpen && (
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 mb-2 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                  <span>Select documents from {driveProvider === 'gdrive' ? 'Google Drive' : 'Microsoft OneDrive'}:</span>
                  <button type="button" onClick={() => setIsDrivePickerOpen(false)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {SAMPLE_CLOUD_FILES.filter(f => f.provider === driveProvider).length === 0 ? (
                    <div className="p-3 text-center text-xs text-stone-500 dark:text-stone-400">
                      No cloud files connected. Authorize {driveProvider === 'gdrive' ? 'Google Drive' : 'Microsoft OneDrive'} in Integrations to browse cloud archives.
                    </div>
                  ) : (
                    SAMPLE_CLOUD_FILES.filter(f => f.provider === driveProvider).map(f => {
                      const isSelected = attachedCloudFiles.some(att => att.id === f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleToggleAttachFile(f)}
                          className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-[#0062FF]'
                              : 'bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{f.name}</span>
                            <span className="text-[10px] text-stone-400">({f.size})</span>
                          </div>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-[#0062FF] text-white' : 'border border-stone-300'}`}>
                            {isSelected && '✓'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Selected files pills */}
            {attachedCloudFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {attachedCloudFiles.map(f => (
                  <span
                    key={f.id}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-[#0062FF] dark:text-blue-400"
                  >
                    <span>{f.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAttachFile(f)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Official Body
            </label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Type official communication..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   4. FILE PREVIEW MODAL
   ========================================================================= */
interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file
}) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2.5 truncate">
            <FileCheck className="w-5 h-5 text-[#0062FF]" />
            <div className="truncate">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {file.name}
              </h3>
              <p className="text-[11px] text-stone-400">
                {file.size} • Uploaded by {file.updatedBy.name} on {file.updatedAt}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Viewer / Image / Document placeholder */}
        <div className="flex-1 min-h-[250px] bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col items-center justify-center text-center space-y-3 overflow-hidden">
          {file.type === 'image' && file.downloadUrl ? (
            <img 
              src={file.downloadUrl} 
              alt={file.name} 
              className="max-h-[350px] object-contain rounded-lg shadow-xs" 
            />
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-800 dark:text-stone-200">{file.name}</div>
                <div className="text-[11px] text-stone-500 font-mono mt-1">
                  Classification: {file.securityClassification || 'Official'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="text-[11px] text-stone-400">
            NDPA 2023 Verified
          </div>

          <div className="flex items-center space-x-2">
            {file.downloadUrl && (
              <a
                href={file.downloadUrl}
                target="_blank"
                rel="noreferrer"
                download={file.name}
                className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* =========================================================================
   5. CHANNEL BROWSER MODAL (Browse, Search, Filter & Favorite Channels)
   ========================================================================= */
interface ChannelBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onSelectChannel: (chan: Channel) => void;
  onOpenCreateChannel: () => void;
  favoriteChannelIds?: string[];
  onToggleFavoriteChannel?: (channelId: string) => void;
  currentUser?: Member | null;
}

export const ChannelBrowserModal: React.FC<ChannelBrowserModalProps> = ({
  isOpen,
  onClose,
  channels = [],
  onSelectChannel,
  onOpenCreateChannel,
  favoriteChannelIds = [],
  onToggleFavoriteChannel,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = ['all', 'Organization', 'Projects', 'Departments', 'General'];

  const filteredChannels = (channels || []).filter(c => {
    if (!c) return false;
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.topic && c.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      (c.category && c.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center">
              <Hash className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Channel Directory & Council Rooms
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Explore, favorite, and join authorized institutional channels
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

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search channels by name, topic, or description..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
            />
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenCreateChannel();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Channel</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer capitalize shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0062FF] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat === 'all' ? 'All Channels' : cat}
            </button>
          ))}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80 pr-1 max-h-[50vh] space-y-1">
          {filteredChannels.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Hash className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700" />
              <p className="text-xs font-semibold">No channels match your search filter</p>
              <p className="text-[11px] text-stone-500">Try adjusting your keywords or create a new channel</p>
            </div>
          ) : (
            filteredChannels.map(chan => {
              const isFav = favoriteChannelIds.includes(chan.id);
              return (
                <div
                  key={chan.id}
                  className="py-2.5 px-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                      {chan.isPrivate ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Hash className="w-4 h-4 text-[#0062FF]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          #{chan.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {chan.category || 'General'}
                        </span>
                        {chan.isPrivate && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {chan.topic || chan.description || 'Public institutional channel'}
                      </p>
                      <div className="flex items-center space-x-3 text-[10px] text-stone-400 mt-1">
                        <span>{chan.members?.length || 1} members</span>
                        <span>•</span>
                        <span>Official Archive</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {onToggleFavoriteChannel && (
                      <button
                        onClick={() => onToggleFavoriteChannel(chan.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isFav 
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' 
                            : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectChannel(chan);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#0062FF] hover:text-white dark:bg-stone-800 dark:hover:bg-[#0062FF] text-stone-700 dark:text-stone-200 text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <span className="text-[11px] text-stone-400">
            Total {channels.length} channels available in council workspace
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

/* =========================================================================
   6. QUICK ACTIONS CREATE MODAL / POPUP
   ========================================================================= */
interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (actionType: 'message' | 'channel' | 'event' | 'meeting' | 'file' | 'email') => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onAction
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'message' as const,
      label: 'New Direct Message',
      description: 'Start a direct communication line with a staff officer',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60'
    },
    {
      id: 'channel' as const,
      label: 'New Council Channel',
      description: 'Create a topic-specific workspace channel',
      icon: Hash,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      id: 'event' as const,
      label: 'Schedule Calendar Event',
      description: 'Book institutional deliberations or milestone deadline',
      icon: Calendar,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'meeting' as const,
      label: 'Start / Schedule Video Meeting',
      description: 'Launch an encrypted council video conference chamber',
      icon: Video,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60'
    },
    {
      id: 'email' as const,
      label: 'Compose Official Dispatch',
      description: 'Draft and dispatch formal memorandum or correspondence',
      icon: Mail,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
    },
    {
      id: 'file' as const,
      label: 'Upload Vault Document',
      description: 'Upload statutory circulars, gazettes, or receipts',
      icon: FileText,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 space-y-4">
        
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#0062FF] text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Quick Action Directives
              </h3>
              <p className="text-[11px] text-stone-400">
                Create new communications, meetings, or statutory records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {actions.map(act => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onClose();
                  onAction(act.id);
                }}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-[#0062FF] dark:hover:border-blue-500 bg-white dark:bg-stone-900/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition-all flex flex-col justify-between space-y-2 group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0062FF] dark:group-hover:text-blue-400 truncate">
                    {act.label}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  {act.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
