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
  ArrowRight,
  Target
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col my-8 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Create Council Channel
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Establish an authorized communication line or project space
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6 text-sm">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Channel Identifier <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 focus-within:border-[#0062FF] focus-within:ring-2 focus-within:ring-[#0062FF]/20 transition-all">
                <span className="text-stone-400 mr-2 font-mono font-bold text-base">#</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. general-operations"
                  className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 focus:outline-none font-mono"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5">
                Names are lowercase and hyphenated automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ChannelCategory)}
                  className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all"
                >
                  <option value="General">General</option>
                  <option value="Departments">Departments</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                  Topic / Mandate
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Operational logistics"
                  className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Detailed Purpose (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain the scope and mandate of this room..."
                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all resize-none"
              />
            </div>

            <div className="p-4 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-start space-x-3.5 cursor-pointer">
              <input
                type="checkbox"
                id="private-chan-check"
                checked={isPrivate}
                onChange={e => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded text-[#0062FF] focus:ring-0 mt-1 cursor-pointer"
              />
              <label htmlFor="private-chan-check" className="flex-1 cursor-pointer">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Restricted Access (Private Channel)</span>
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5 leading-relaxed">
                  Only explicitly invited officers and department heads will be permitted to view discussions and directives in this room.
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-sm font-bold shadow-xs disabled:opacity-40 transition-all flex items-center space-x-2"
            >
              <Hash className="w-4 h-4" />
              <span>Create Channel</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col my-8 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Start Direct Staff Line
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Open a direct, private communication channel with a colleague
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6 text-sm">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Select Institutional Colleague <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all"
              >
                <option value="">Choose an officer or team member...</option>
                {eligibleMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.department} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Colleague preview if selected */}
            {selectedId && (() => {
              const selectedMember = eligibleMembers.find(m => m.id === selectedId);
              if (!selectedMember) return null;
              return (
                <div className="p-4 rounded-xl sm:rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-center space-x-3.5 animate-in fade-in">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                      {selectedMember.name}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {selectedMember.department} • {selectedMember.jobTitle || selectedMember.role}
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5 truncate">
                      {selectedMember.email}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="p-4 rounded-xl sm:rounded-2xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Direct messages are strictly restricted between you and the designated staff officer, encrypted under WorkNest institutional security protocols.
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedId}
              className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-sm font-bold shadow-xs disabled:opacity-40 transition-all flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Open Direct Line</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-6 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Compose Official Dispatch
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Official institutional correspondence with recorded audit trail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6 flex-1 overflow-y-auto text-sm">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Recipient Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="e.g. officer@agency.gov.ng"
                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Subject Line <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Quarterly Budget Allocation Directive"
                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all"
              />
            </div>

            {/* Cloud Attachments Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Institutional Cloud Attachments
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => { setDriveProvider('gdrive'); setIsDrivePickerOpen(!isDrivePickerOpen); }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      isDrivePickerOpen && driveProvider === 'gdrive'
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-[#0062FF]'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Drive</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDriveProvider('onedrive'); setIsDrivePickerOpen(!isDrivePickerOpen); }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      isDrivePickerOpen && driveProvider === 'onedrive'
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-[#0062FF]'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <FolderCheck className="w-3.5 h-3.5 text-[#0078D4]" />
                    <span>OneDrive</span>
                  </button>
                </div>
              </div>

              {/* Cloud Picker Drawer/Accordion */}
              {isDrivePickerOpen && (
                <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-400">
                    <span>Select archives from {driveProvider === 'gdrive' ? 'Google Drive' : 'Microsoft OneDrive'}:</span>
                    <button type="button" onClick={() => setIsDrivePickerOpen(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {SAMPLE_CLOUD_FILES.filter(f => f.provider === driveProvider).length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-500 dark:text-stone-400">
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
                            className={`w-full p-3 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-[#0062FF]'
                                : 'bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                              <span className="truncate font-medium">{f.name}</span>
                              <span className="text-[11px] text-stone-400 shrink-0">({f.size})</span>
                            </div>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-[#0062FF] text-white shadow-xs' : 'border border-stone-300 dark:border-stone-700'}`}>
                              {isSelected ? '✓' : ''}
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
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedCloudFiles.map(f => (
                    <span
                      key={f.id}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-[#0062FF] dark:text-blue-400 shadow-xs"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAttachFile(f)}
                        className="hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-2">
                Official Memorandum Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={7}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Draft formal dispatch, directives, or council minutes..."
                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-sm font-bold shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-6 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-4">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center space-x-2 truncate">
                <span>{file.size}</span>
                <span>•</span>
                <span>Uploaded by {file.updatedBy.name}</span>
                <span>•</span>
                <span>{file.updatedAt}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer / Image / Document placeholder */}
        <div className="p-6 sm:p-8 flex-1 min-h-[300px] flex flex-col items-center justify-center overflow-hidden bg-stone-50/50 dark:bg-stone-900/40">
          {file.type === 'image' && file.downloadUrl ? (
            <div className="relative max-h-[440px] overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
              <img 
                src={file.downloadUrl} 
                alt={file.name} 
                className="max-h-[420px] w-auto object-contain rounded-xl" 
              />
            </div>
          ) : (
            <div className="w-full max-w-md p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0E131F] border border-stone-200 dark:border-stone-800 shadow-lg text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/40 shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <div className="text-base font-bold text-stone-900 dark:text-stone-100 break-words">{file.name}</div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-mono text-stone-600 dark:text-stone-300 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Security Classification: {file.securityClassification || 'Official'}</span>
                </div>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                This document is catalogued under WorkNest institutional records. Direct viewing is rendered in compliant sandbox mode.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2 text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">Institutional Governance & NDPA Compliant</span>
          </div>

          <div className="flex items-center space-x-3">
            {file.downloadUrl && (
              <a
                href={file.downloadUrl}
                target="_blank"
                rel="noreferrer"
                download={file.name}
                className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-sm font-bold shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-semibold transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-6 animate-scale-in">
        
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Channel Directory & Council Rooms
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Explore, favorite, and join authorized institutional channels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-6 sm:px-8 pt-6 pb-2 space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search channels by name, topic, or description..."
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 transition-all placeholder:text-stone-400"
              />
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCreateChannel();
              }}
              className="px-5 py-3 rounded-xl sm:rounded-2xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-sm font-bold shadow-xs flex items-center justify-center space-x-2 shrink-0 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Channel</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer capitalize shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#0062FF] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {cat === 'all' ? 'All Channels' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Channels List */}
        <div className="px-6 sm:px-8 py-4 flex-1 overflow-y-auto space-y-3">
          {filteredChannels.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                <Hash className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No channels match your search filter</p>
              <p className="text-xs text-stone-500">Try adjusting your keywords or create a new dedicated channel</p>
            </div>
          ) : (
            filteredChannels.map(chan => {
              const isFav = favoriteChannelIds.includes(chan.id);
              return (
                <div
                  key={chan.id}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-stone-900/40 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex items-center justify-between gap-4 group shadow-xs hover:shadow-sm"
                >
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 mt-0.5 border border-stone-200/60 dark:border-stone-700/60">
                      {chan.isPrivate ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Hash className="w-4 h-4 text-[#0062FF]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          #{chan.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {chan.category || 'General'}
                        </span>
                        {chan.isPrivate && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-1 leading-relaxed">
                        {chan.topic || chan.description || 'Public institutional channel'}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-stone-400 mt-2">
                        <span className="font-medium text-stone-500 dark:text-stone-400">{chan.members?.length || 1} members</span>
                        <span>•</span>
                        <span>Institutional Archive</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0">
                    {onToggleFavoriteChannel && (
                      <button
                        onClick={() => onToggleFavoriteChannel(chan.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isFav 
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800' 
                            : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
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
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-[#0062FF] hover:text-white dark:bg-stone-800 dark:hover:bg-[#0062FF] text-stone-700 dark:text-stone-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-between text-xs shrink-0">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Total {channels.length} channels available in council workspace
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold cursor-pointer text-sm transition-colors"
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
  onAction: (actionType: 'work' | 'message' | 'channel' | 'event' | 'meeting' | 'file' | 'email') => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onAction
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'work' as const,
      label: 'Create Work (Outcome & Deliverable)',
      description: 'Define an institutional goal, tangible deliverable, and break into accountable tasks with execution tracking.',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/50',
      badge: 'Core Workflow',
      featured: true
    },
    {
      id: 'message' as const,
      label: 'New Direct Message',
      description: 'Start a direct bilateral communication line with a staff officer or team member.',
      icon: MessageSquare,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900/50'
    },
    {
      id: 'channel' as const,
      label: 'New Council Channel',
      description: 'Create an organized, topic-specific workspace channel for team deliberation.',
      icon: Hash,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900/50'
    },
    {
      id: 'event' as const,
      label: 'Schedule Calendar Event',
      description: 'Schedule institutional deliberations, statutory hearings, or milestone deadlines.',
      icon: Calendar,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/50'
    },
    {
      id: 'meeting' as const,
      label: 'Start Video Conference',
      description: 'Launch an encrypted council video chamber with recording and transcription.',
      icon: Video,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900/50'
    },
    {
      id: 'email' as const,
      label: 'Compose Official Dispatch',
      description: 'Draft and dispatch formal memorandums, official letters, and directives.',
      icon: Mail,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/50'
    },
    {
      id: 'file' as const,
      label: 'Upload Vault Document',
      description: 'Deposit statutory circulars, gazettes, audit reports, or signed agreements.',
      icon: FileText,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-900/50'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-6 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-[#0062FF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#0062FF]/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Action Directives
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Initiate deliverables, communications, chambers, or statutory records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Options List */}
        <div className="px-6 sm:px-8 py-6 space-y-3.5 flex-1 overflow-y-auto">
          {actions.map(act => {
            const Icon = act.icon;
            if (act.featured) {
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    onClose();
                    onAction(act.id);
                  }}
                  className="w-full p-5 rounded-2xl sm:rounded-3xl border-2 border-[#0062FF]/30 dark:border-[#0062FF]/40 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-blue-50/20 dark:from-blue-950/40 dark:via-[#111726] dark:to-blue-950/20 hover:border-[#0062FF] dark:hover:border-[#0062FF] transition-all flex items-start space-x-4 text-left group cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${act.color} shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0062FF] dark:group-hover:text-blue-400 transition-colors">
                        {act.label}
                      </span>
                      {act.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0062FF] text-white shadow-xs tracking-wide">
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                  <div className="self-center w-8 h-8 rounded-xl bg-white dark:bg-stone-800 text-stone-400 group-hover:text-[#0062FF] group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 flex items-center justify-center shrink-0 transition-all border border-stone-200/60 dark:border-stone-700/60">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={act.id}
                onClick={() => {
                  onClose();
                  onAction(act.id);
                }}
                className="w-full p-4 rounded-2xl border border-stone-200 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900/40 hover:bg-stone-50/80 dark:hover:bg-stone-800/60 text-left transition-all flex items-center space-x-4 group cursor-pointer shadow-xs hover:shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0062FF] dark:group-hover:text-blue-400 transition-colors block truncate">
                    {act.label}
                  </span>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                    {act.description}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg text-stone-300 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-300 flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
