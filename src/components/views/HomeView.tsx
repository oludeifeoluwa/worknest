import React from 'react';
import { 
  MessageSquare, 
  Hash, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Pin, 
  Clock, 
  CheckCircle2, 
  Users, 
  Mail, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  Building2, 
  FileCheck, 
  AlertCircle, 
  FolderKanban,
  Video,
  Radio
} from 'lucide-react';
import { 
  Member, 
  Channel, 
  DirectMessage, 
  OrganizationEvent, 
  FileItem, 
  EmailMessage, 
  Message, 
  OrganizationSettings,
  ActiveSection
} from '../../types';
import { DeliverablesProgressChart } from '../DeliverablesProgressChart';

interface HomeViewProps {
  organization?: OrganizationSettings;
  currentUser?: Member | null;
  members?: Member[];
  channels?: Channel[];
  directMessages?: DirectMessage[];
  events?: OrganizationEvent[];
  files?: FileItem[];
  emails?: EmailMessage[];
  recentMessages?: Message[];
  onSelectChannel?: (chan: Channel) => void;
  onSelectDM?: (dm: DirectMessage) => void;
  onSelectFile?: (file: FileItem) => void;
  onNavigateToSection?: (section: 'channels' | 'messages' | 'email' | 'files' | 'people' | 'settings') => void;
  onNavigate?: (section: ActiveSection, targetId?: string) => void;
  onOpenComposeEmail?: () => void;
  onOpenCreateChannel?: () => void;
  onOpenCreateDM?: () => void;
  onOpenUploadFile?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  organization = { 
    id: 'org_worknest_main', 
    name: 'WorkNest', 
    logoText: 'WN', 
    domain: '', 
    accentColor: 'indigo', 
    emailProvider: 'none', 
    allowGuestInvites: false, 
    retentionDays: 180,
    registrationApprovalMode: 'auto_approved_domains',
    approvedDomains: [],
    requireGovDomain: true
  },
  currentUser,
  members = [],
  channels = [],
  directMessages = [],
  events = [],
  files = [],
  emails = [],
  onSelectChannel,
  onSelectDM,
  onSelectFile,
  onNavigateToSection,
  onNavigate,
  onOpenComposeEmail,
  onOpenCreateChannel,
  onOpenCreateDM,
  onOpenUploadFile
}) => {
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const safeChannels = Array.isArray(channels) ? channels : [];
  const safeDMs = Array.isArray(directMessages) ? directMessages : [];
  const safeEmails = Array.isArray(emails) ? emails : [];
  const safeFiles = Array.isArray(files) ? files : [];

  const handleGoToSection = (section: 'channels' | 'messages' | 'email' | 'files' | 'people' | 'settings', targetId?: string) => {
    if (onNavigate) {
      onNavigate(section as ActiveSection, targetId);
    } else if (onNavigateToSection) {
      onNavigateToSection(section);
    }
  };

  const handleChannelClick = (channel: Channel) => {
    if (onSelectChannel) {
      onSelectChannel(channel);
    } else if (onNavigate) {
      onNavigate('channels', channel.id);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (onSelectFile) {
      onSelectFile(file);
    } else if (onNavigate) {
      onNavigate('files', file.id);
    }
  };

  const displayName = currentUser?.name || 'Officer';
  const orgName = organization?.name || 'WorkNest';

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#080C14] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 select-none scrollbar-thin">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Executive Greeting Header */}
        <section className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4 text-[#0062FF]" />
                <span>Executive Digital Briefing • {orgName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
                {getGreetingTime()}, {displayName}.
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {currentUser?.jobTitle || 'Public Sector Officer'} • {currentUser?.department || 'Operations'}
              </p>
            </div>

            {/* Quick Action Triggers - fully responsive on small screens */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                onClick={() => onNavigate && onNavigate('meetings')}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Video Meeting</span>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('calendar')}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-stone-700 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#0062FF]" />
                <span className="whitespace-nowrap">Calendar</span>
              </button>

              <button
                onClick={onOpenComposeEmail}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Send Dispatch</span>
              </button>
            </div>
          </div>
        </section>

        {/* Operational Overview Metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div 
            onClick={() => handleGoToSection('channels')}
            className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Channels</span>
              <Hash className="w-4 h-4 text-[#0062FF]" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-2">
              {safeChannels.length}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Active discussion lines
            </div>
          </div>

          <div 
            onClick={() => handleGoToSection('messages')}
            className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Direct Lines</span>
              <MessageSquare className="w-4 h-4 text-[#0062FF]" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-2">
              {safeDMs.length}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Peer conversations
            </div>
          </div>

          <div 
            onClick={() => handleGoToSection('email')}
            className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Dispatches</span>
              <Mail className="w-4 h-4 text-[#0062FF]" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-2">
              {safeEmails.length}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Official records
            </div>
          </div>

          <div 
            onClick={() => handleGoToSection('files')}
            className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Gazettes & Files</span>
              <FolderKanban className="w-4 h-4 text-[#0062FF]" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-2">
              {safeFiles.length}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Statutory documents
            </div>
          </div>
        </section>

        {/* Deliverables & Projects Completion Analytics */}
        <DeliverablesProgressChart 
          onNavigateToProjects={() => handleGoToSection('channels')}
        />

        {/* 3-Column Executive Operational Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Column 1: Council Feeds */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <Hash className="w-4 h-4 text-[#0062FF]" />
                <span>Council Feeds</span>
              </div>
              <button 
                onClick={() => handleGoToSection('channels')}
                className="text-[11px] text-[#0062FF] dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2 flex-1">
              {safeChannels.length === 0 ? (
                <div className="py-8 text-center text-stone-400 space-y-2">
                  <Hash className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700" />
                  <p className="text-xs text-stone-500 dark:text-stone-400">No channels created yet. Start a channel to begin team discussions.</p>
                  {onOpenCreateChannel && (
                    <button
                      onClick={onOpenCreateChannel}
                      className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300 font-semibold"
                    >
                      + Create First Channel
                    </button>
                  )}
                </div>
              ) : (
                safeChannels.slice(0, 4).map(chan => (
                  <button
                    key={chan.id}
                    onClick={() => handleChannelClick(chan)}
                    className="w-full p-2.5 rounded-xl border border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 text-left transition-colors flex items-start justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        #{chan.name}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {chan.topic || 'General Channel'}
                      </div>
                    </div>
                    {(chan.unreadCount || 0) > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#0062FF] text-white text-[10px] font-bold">
                        {chan.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Official Dispatches */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <Mail className="w-4 h-4 text-[#0062FF]" />
                <span>Official Dispatches</span>
              </div>
              <button 
                onClick={() => handleGoToSection('email')}
                className="text-[11px] text-[#0062FF] dark:text-blue-400 hover:underline"
              >
                Inbox ({safeEmails.length})
              </button>
            </div>

            <div className="space-y-2 flex-1">
              {safeEmails.length === 0 ? (
                <div className="py-8 text-center text-stone-400 space-y-2">
                  <Mail className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700" />
                  <p className="text-xs text-stone-500 dark:text-stone-400">No official dispatches yet. Access and send dispatches from your connected mailbox.</p>
                  {onOpenComposeEmail && (
                    <button
                      onClick={onOpenComposeEmail}
                      className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300 font-semibold"
                    >
                      + Compose Dispatch
                    </button>
                  )}
                </div>
              ) : (
                safeEmails.slice(0, 3).map(email => (
                  <button
                    key={email.id}
                    onClick={() => handleGoToSection('email')}
                    className="w-full p-2.5 rounded-xl border border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-900 dark:text-stone-100 truncate">
                        {email.sender.name}
                      </span>
                      <span className="text-stone-400 shrink-0 text-[10px]">{email.date}</span>
                    </div>
                    <div className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">
                      {email.subject}
                    </div>
                    <div className="text-[11px] text-stone-500 line-clamp-1">
                      {email.snippet}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Recent Gazettes & Files */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <FolderKanban className="w-4 h-4 text-[#0062FF]" />
                <span>Statutory Vault</span>
              </div>
              <button 
                onClick={() => handleGoToSection('files')}
                className="text-[11px] text-[#0062FF] dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2 flex-1">
              {safeFiles.length === 0 ? (
                <div className="py-8 text-center text-stone-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700" />
                  <p className="text-xs text-stone-500 dark:text-stone-400">No files in the vault yet. Upload documents or memos to share with your team.</p>
                  {onOpenUploadFile && (
                    <button
                      onClick={onOpenUploadFile}
                      className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300 font-semibold"
                    >
                      + Upload Document
                    </button>
                  )}
                </div>
              ) : (
                safeFiles.slice(0, 3).map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="w-full p-2.5 rounded-xl border border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-900 dark:text-stone-100 truncate">
                        {file.name}
                      </span>
                      <span className="text-stone-400 shrink-0 text-[10px]">{file.size}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center justify-between">
                      <span>{file.securityClassification || 'Official'}</span>
                      <span>{file.updatedAt}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
