import React, { useState, useRef, useEffect } from 'react';
import { 
  Hash, 
  Lock, 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal, 
  MessageSquare, 
  Share2, 
  Trash2, 
  Pin, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Mail, 
  Users, 
  Phone, 
  Search, 
  Check, 
  CornerDownRight, 
  Plus,
  ShieldCheck,
  FileCheck,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Loader2,
  Languages,
  Puzzle,
  Zap,
  Copy,
  FolderPlus,
  RefreshCw
} from 'lucide-react';
import { 
  Channel, 
  DirectMessage, 
  Member, 
  Message, 
  MessageReaction, 
  ThreadReply, 
  Attachment, 
  VoiceNote, 
  SharedEmailReference,
  WorkNestPlugin,
  PluginExecutionResult
} from '../../types';
import { uploadFileToStorage } from '../../lib/firestoreService';
import { runPluginExecution } from '../../lib/pluginsData';
import { UserAvatar } from '../UserAvatar';
import { AudioWaveformPlayer, AudioRecordingWaveform } from '../AudioWaveform';

interface ChatViewProps {
  conversationType: 'channel' | 'dm';
  activeChannel: Channel | null;
  activeDM: DirectMessage | null;
  currentUser: Member;
  messages: Message[];
  members: Member[];
  installedPlugins?: WorkNestPlugin[];
  onTogglePluginEnabled?: (pluginId: string) => void;
  onNavigateToPlugins?: () => void;
  onSendMessage: (content: string, attachments?: Attachment[], voiceNote?: VoiceNote, pluginResult?: PluginExecutionResult) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onTogglePinMessage?: (messageId: string) => void;
  onOpenThread: (message: Message) => void;
  activeThreadMessage: Message | null;
  onCloseThread: () => void;
  onSendThreadReply: (parentMessageId: string, content: string) => void;
  onBridgeEmailToChat?: (emailRef: SharedEmailReference) => void;
  onSendConversationToEmail?: (messageContent: string) => void;
  onOpenEmailPreview?: (emailId: string) => void;
  onSaveFileToVault?: (title: string, content: string) => void;
  onToggleSidebar?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversationType,
  activeChannel,
  activeDM,
  currentUser,
  messages,
  members,
  installedPlugins = [],
  onTogglePluginEnabled,
  onNavigateToPlugins,
  onSendMessage,
  onAddReaction,
  onDeleteMessage,
  onTogglePinMessage,
  onOpenThread,
  activeThreadMessage,
  onCloseThread,
  onSendThreadReply,
  onSendConversationToEmail,
  onOpenEmailPreview,
  onSaveFileToVault,
  onToggleSidebar
}) => {
  const [inputText, setInputText] = useState('');
  const [threadInputText, setThreadInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [emojiPickerMsgId, setEmojiPickerMsgId] = useState<string | null>(null);
  const [searchInChat, setSearchInChat] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);

  // Plugin UI States
  const [isPluginsDropdownOpen, setIsPluginsDropdownOpen] = useState(false);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [isPluginRunning, setIsPluginRunning] = useState(false);
  const [collapsedPluginCards, setCollapsedPluginCards] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<any>(null);

  const commonEmojis = ['✅', '👍', '🛡️', '🚀', '👀', '📋', '💼', '📌'];

  // Enabled plugins
  const enabledPlugins = installedPlugins.filter(p => p.isInstalled && p.isEnabled);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Handle Slash Command detection
  useEffect(() => {
    if (inputText.startsWith('/')) {
      const commandPart = inputText.slice(1).split(' ')[0].toLowerCase();
      setSlashFilter(commandPart);
      setIsSlashMenuOpen(true);
    } else {
      setIsSlashMenuOpen(false);
    }
  }, [inputText]);

  // Match slash commands against plugins
  const matchingSlashCommands = enabledPlugins.flatMap(plugin => {
    return (plugin.commandTriggers || []).map(trigger => ({
      trigger,
      plugin,
      cleanTrigger: trigger.replace('/', '')
    }));
  }).filter(item => {
    if (!slashFilter) return true;
    return item.cleanTrigger.toLowerCase().includes(slashFilter) || item.plugin.shortName.toLowerCase().includes(slashFilter);
  });

  const handleSelectSlashCommand = (trigger: string) => {
    setInputText(`${trigger} `);
    setIsSlashMenuOpen(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() && pendingAttachments.length === 0) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    setPendingAttachments([]);
    setIsSlashMenuOpen(false);

    // Check if message is a slash command
    if (textToSend.startsWith('/')) {
      const parts = textToSend.split(' ');
      const trigger = parts[0].toLowerCase();
      const promptQuery = parts.slice(1).join(' ');

      const matchedPlugin = enabledPlugins.find(p => 
        p.commandTriggers?.some(t => t.toLowerCase() === trigger)
      );

      if (matchedPlugin) {
        setIsPluginRunning(true);
        try {
          const pluginResult = await runPluginExecution(matchedPlugin, promptQuery || matchedPlugin.description, {
            userName: currentUser.name,
            conversationType
          });
          onSendMessage(textToSend, pendingAttachments.length > 0 ? pendingAttachments : undefined, undefined, pluginResult);
        } catch (e) {
          console.warn('Plugin execution failed:', e);
          onSendMessage(textToSend, pendingAttachments.length > 0 ? pendingAttachments : undefined);
        } finally {
          setIsPluginRunning(false);
        }
        return;
      }
    }

    onSendMessage(textToSend, pendingAttachments.length > 0 ? pendingAttachments : undefined);
  };

  const togglePluginCollapse = (msgId: string) => {
    setCollapsedPluginCards(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const triggerCopyToast = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleSendThreadReply = () => {
    if (!threadInputText.trim() || !activeThreadMessage) return;
    onSendThreadReply(activeThreadMessage.id, threadInputText.trim());
    setThreadInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleThreadKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendThreadReply();
    }
  };

  const handleFinishVoiceRecording = (recordedWaveform?: number[]) => {
    setIsRecordingVoice(false);
    const durationSecs = Math.max(1, recordingSeconds);
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    const finalWaveform = recordedWaveform && recordedWaveform.length > 0 
      ? recordedWaveform 
      : [30, 45, 60, 80, 50, 65, 90, 70, 40, 55, 75, 45, 60, 80, 55, 35];

    const newVoiceNote: VoiceNote = {
      duration: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
      waveform: finalWaveform
    };
    onSendMessage('🎤 Audio Note', undefined, newVoiceNote);
    setRecordingSeconds(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingAttachment(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await uploadFileToStorage(file, {
          updatedBy: currentUser,
          folderId: 'fld_projects',
          tags: ['Chat Attachment'],
          securityClassification: 'Official'
        });

        const newAtt: Attachment = {
          id: uploaded.id,
          name: uploaded.name,
          size: uploaded.size,
          type: uploaded.type === 'image' ? 'img' : uploaded.type === 'spreadsheet' ? 'doc' : 'pdf',
          url: uploaded.downloadUrl
        };
        setPendingAttachments(prev => [...prev, newAtt]);
      }
    } catch (err) {
      console.error('Chat attachment upload error:', err);
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Conversation title & subtitle
  const title = conversationType === 'channel' 
    ? (activeChannel ? `#${activeChannel.name}` : 'Channel') 
    : (activeDM?.participants?.find(p => p.id !== currentUser.id)?.name || 'Direct Line');
  
  const subtitle = conversationType === 'channel'
    ? (activeChannel?.topic || 'General discussions')
    : (`${activeDM?.participants?.find(p => p.id !== currentUser.id)?.jobTitle || 'Team Member'} • ${activeDM?.participants?.find(p => p.id !== currentUser.id)?.department || 'General'}`);

  const filteredMessages = messages.filter(m => {
    if (!searchInChat) return true;
    return m.content.toLowerCase().includes(searchInChat.toLowerCase()) || m.sender.name.toLowerCase().includes(searchInChat.toLowerCase());
  });

  return (
    <div className="flex-1 h-full flex overflow-hidden bg-white dark:bg-[#0F172A] select-none text-stone-800 dark:text-stone-100">
      
      {/* Main Conversation Stream */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Chat Top Header */}
        <div className="h-14 px-3 sm:px-6 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#0F172A]">
          <div className="flex items-center space-x-2 sm:space-x-3 truncate min-w-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer shrink-0"
                title="Browse Channels & Direct Lines"
              >
                <Hash className="w-4 h-4 text-[#0062FF]" />
              </button>
            )}

            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0062FF] dark:text-blue-400 shrink-0">
              {conversationType === 'channel' ? (
                activeChannel?.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />
              ) : (
                <Users className="w-4 h-4" />
              )}
            </div>
            <div className="truncate min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                  {title}
                </span>
                {conversationType === 'channel' && activeChannel?.isDefault && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold shrink-0">
                    Official
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-stone-400">
            {showSearchBox ? (
              <div className="flex items-center px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs">
                <input
                  type="text"
                  placeholder="Search in stream..."
                  value={searchInChat}
                  onChange={e => setSearchInChat(e.target.value)}
                  className="bg-transparent text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none w-28 sm:w-36"
                  autoFocus
                />
                <button onClick={() => { setSearchInChat(''); setShowSearchBox(false); }} className="text-stone-400 hover:text-stone-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchBox(true)}
                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400"
                title="Search conversation"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {filteredMessages.length === 0 ? (
            <div className="py-16 text-center space-y-2.5 max-w-sm mx-auto">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0062FF] dark:text-blue-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
                No messages to display
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Stay connected with your colleagues through direct conversations and team discussions. {conversationType === 'channel'
                  ? 'Send directives, updates, and gazettes to all channel members.'
                  : 'Start a confidential direct conversation with this colleague.'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              if (!msg) return null;
              const isCurrentUser = msg.sender?.id === currentUser?.id;
              const isHovered = hoveredMessageId === msg.id;
              const isEmojiOpen = emojiPickerMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  id={`message-${msg.id}`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => { setHoveredMessageId(null); setEmojiPickerMsgId(null); }}
                  className={`group relative flex items-start space-x-3 p-2 rounded-2xl transition-colors ${
                    msg.isPinned ? 'bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40' : 'hover:bg-stone-50 dark:hover:bg-stone-900/40'
                  }`}
                >
                  {/* Sender Avatar */}
                  <UserAvatar
                    member={msg.sender || { name: 'Officer', role: 'Member', status: 'online' }}
                    size="sm"
                    shape="rounded"
                  />

                  {/* Message Content Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {msg.sender?.name || 'Public Officer'}
                      </span>
                      {msg.sender?.role === 'Admin' && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300 text-[9px] font-bold">
                          Admin
                        </span>
                      )}
                      <span className="text-[10px] text-stone-400">
                        {msg.timestamp}
                      </span>
                      {msg.isPinned && (
                        <span className="flex items-center space-x-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap select-text">
                      {msg.content}
                    </div>

                    {/* Rich ChatGPT-Style Plugin Result Card */}
                    {msg.pluginResult && (
                      <div className="mt-2 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-[#0B132B]/80 overflow-hidden shadow-xs">
                        {/* Plugin Result Header */}
                        <div className="p-3 bg-blue-100/60 dark:bg-blue-950/60 border-b border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-[#0062FF] text-white flex items-center justify-center shrink-0">
                              <Puzzle className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-xs text-stone-900 dark:text-white truncate">
                              {msg.pluginResult.pluginName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Executed
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-stone-400">
                              {msg.pluginResult.timestamp}
                            </span>
                            <button
                              onClick={() => togglePluginCollapse(msg.id)}
                              className="p-1 rounded-md text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                              title={collapsedPluginCards[msg.id] ? 'Expand' : 'Collapse'}
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedPluginCards[msg.id] ? '-rotate-90' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Plugin Result Body (if not collapsed) */}
                        {!collapsedPluginCards[msg.id] && (
                          <div className="p-3.5 space-y-3 text-xs">
                            {/* Execution Steps */}
                            {msg.pluginResult.executionSteps && msg.pluginResult.executionSteps.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pb-1 border-b border-blue-200/40 dark:border-blue-900/40">
                                {msg.pluginResult.executionSteps.map((step, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-stone-900 text-[10px] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                                  >
                                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                                    <span>{step.name}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Detailed Output Payload */}
                            <div className="p-3 rounded-xl bg-white/90 dark:bg-[#0D1527] border border-blue-100 dark:border-stone-800 text-stone-800 dark:text-stone-200 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-72 overflow-y-auto">
                              {msg.pluginResult.detailedOutput}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                onClick={() => triggerCopyToast(msg.pluginResult?.detailedOutput || '')}
                                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-[11px] font-semibold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy Result</span>
                              </button>

                              {onSaveFileToVault && (
                                <button
                                  onClick={() => onSaveFileToVault(`Gazette - ${msg.pluginResult?.pluginName}`, msg.pluginResult?.detailedOutput || '')}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-[11px] font-semibold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                                >
                                  <FolderPlus className="w-3 h-3" />
                                  <span>Save to Files</span>
                                </button>
                              )}

                              {onSendConversationToEmail && (
                                <button
                                  onClick={() => onSendConversationToEmail(`[${msg.pluginResult?.pluginName}] Dispatch\n\n${msg.pluginResult?.detailedOutput}`)}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#0062FF] hover:bg-[#0048C6] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Draft Dispatch</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.attachments.map(att => (
                          <div
                            key={att.id}
                            className="flex items-center space-x-2 p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                          >
                            <FileText className="w-4 h-4 text-[#0062FF]" />
                            <div className="min-w-0">
                              {att.url ? (
                                <a 
                                  href={att.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="font-bold text-stone-800 dark:text-stone-200 hover:text-[#0062FF] truncate max-w-xs block underline"
                                >
                                  {att.name}
                                </a>
                              ) : (
                                <div className="font-bold text-stone-800 dark:text-stone-200 truncate max-w-xs">
                                  {att.name}
                                </div>
                              )}
                              <div className="text-[10px] text-stone-400">{att.size}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Voice Note Player */}
                    {msg.voiceNote && (
                      <div className="pt-1">
                        <AudioWaveformPlayer
                          voiceNote={msg.voiceNote}
                          isPlaying={playingVoiceId === msg.id}
                          onTogglePlay={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                        />
                      </div>
                    )}

                    {/* Reactions Pill Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.reactions.map(r => (
                          <button
                            key={r.emoji}
                            onClick={() => onAddReaction(msg.id, r.emoji)}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-[11px] hover:border-blue-400"
                          >
                            <span>{r.emoji}</span>
                            <span className="font-bold text-stone-600 dark:text-stone-300">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Thread Replies Trigger */}
                    {msg.replies && msg.replies.length > 0 && (
                      <button
                        onClick={() => onOpenThread(msg)}
                        className="inline-flex items-center space-x-1.5 pt-1 text-[11px] font-bold text-[#0062FF] dark:text-blue-400 hover:underline"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>{msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}</span>
                      </button>
                    )}
                  </div>

                  {/* Floating Action Menu for Message */}
                  {isHovered && (
                    <div className="absolute right-3 top-2 flex items-center space-x-1 p-1 rounded-xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-700 shadow-md text-stone-500 z-10">
                      
                      {/* Emoji Quick React */}
                      <button
                        onClick={() => setEmojiPickerMsgId(isEmojiOpen ? null : msg.id)}
                        className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800"
                        title="Add Reaction"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      {/* Reply in thread */}
                      <button
                        onClick={() => onOpenThread(msg)}
                        className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-[#0062FF]"
                        title="Reply in Thread"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Pin */}
                      {onTogglePinMessage && (
                        <button
                          onClick={() => onTogglePinMessage(msg.id)}
                          className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-amber-600"
                          title={msg.isPinned ? 'Unpin' : 'Pin to Channel'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${msg.isPinned ? 'fill-current text-amber-600' : ''}`} />
                        </button>
                      )}

                      {/* Delete */}
                      {onDeleteMessage && (isCurrentUser || currentUser.role === 'Admin') && (
                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-stone-500 hover:text-rose-600"
                          title="Delete Directive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Emoji Selector Bubble */}
                      {isEmojiOpen && (
                        <div className="absolute right-0 top-8 flex items-center space-x-1 p-1.5 rounded-xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-700 shadow-xl z-20">
                          {commonEmojis.map(e => (
                            <button
                              key={e}
                              onClick={() => {
                                onAddReaction(msg.id, e);
                                setEmojiPickerMsgId(null);
                              }}
                              className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-sm transition-transform hover:scale-125"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Attachment Previews */}
        {pendingAttachments.length > 0 && (
          <div className="px-4 py-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center space-x-2 overflow-x-auto">
            {pendingAttachments.map(att => (
              <div key={att.id} className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                <FileText className="w-3.5 h-3.5 text-[#0062FF]" />
                <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                <button onClick={() => removePendingAttachment(att.id)} className="text-stone-400 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#0F172A] pb-16 md:pb-4 relative">
          
          {/* Active Language Translation Bar */}
          <div className="mb-2 flex items-center justify-between">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPluginsDropdownOpen(prev => !prev)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#0062FF] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-[#0062FF] dark:text-blue-400" />
                <span>
                  Language Translate (Active)
                </span>
                <ChevronDown className="w-3 h-3 text-blue-500" />
              </button>

              {/* Translation Quick Popover */}
              {isPluginsDropdownOpen && (
                <div className="absolute bottom-8 left-0 w-72 rounded-2xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-800 shadow-2xl p-3 z-30 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-[#0062FF]" />
                      Universal Language Translate
                    </span>
                    {onNavigateToPlugins && (
                      <button
                        onClick={() => { setIsPluginsDropdownOpen(false); onNavigateToPlugins(); }}
                        className="text-[10px] font-bold text-[#0062FF] hover:underline"
                      >
                        Open Workspace
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Type <code className="text-[#0062FF] font-mono font-semibold">/translate [text] to [language]</code> directly in the chat box to post instant translated dispatches.
                  </p>

                  <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400">
                    Supported: French, Spanish, Arabic, German, Chinese, Hausa, Yoruba, Igbo, Swahili + 40 others.
                  </div>
                </div>
              )}
            </div>

            {/* Quick Slash Triggers Pills */}
            <div className="hidden sm:flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
              {enabledPlugins.slice(0, 3).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSlashCommand(p.commandTriggers?.[0] || `/${p.shortName.toLowerCase()}`)}
                  className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/80 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 text-[10px] font-mono transition-colors cursor-pointer"
                  title={p.description}
                >
                  {p.commandTriggers?.[0] || `/${p.shortName.toLowerCase()}`}
                </button>
              ))}
            </div>
          </div>

          {/* Slash Autocomplete Menu Popup */}
          {isSlashMenuOpen && matchingSlashCommands.length > 0 && (
            <div className="absolute bottom-24 left-4 right-4 sm:left-6 sm:right-auto sm:w-80 rounded-2xl bg-white dark:bg-[#111726] border border-stone-200 dark:border-stone-800 shadow-2xl p-2 z-30 space-y-1 animate-fade-in">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Matching Plugin Commands
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                {matchingSlashCommands.map(({ trigger, plugin }) => (
                  <button
                    key={`${plugin.id}-${trigger}`}
                    type="button"
                    onClick={() => handleSelectSlashCommand(trigger)}
                    className="w-full px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0062FF] dark:text-blue-300 font-mono text-[11px] font-bold">
                        {trigger}
                      </code>
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {plugin.shortName}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 group-hover:text-blue-600 truncate ml-2 max-w-[100px]">
                      {plugin.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plugin Execution Progress Banner */}
          {isPluginRunning && (
            <div className="mb-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center space-x-2 animate-pulse text-xs text-[#0062FF] dark:text-blue-300 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0062FF]" />
              <span>Executing WorkNest Plugin... Gathering references & formatting dispatch.</span>
            </div>
          )}

          {isRecordingVoice ? (
            <AudioRecordingWaveform
              recordingSeconds={recordingSeconds}
              onCancel={() => setIsRecordingVoice(false)}
              onFinish={(waveform) => handleFinishVoiceRecording(waveform)}
            />
          ) : (
            <div className="p-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 focus-within:border-blue-400 dark:focus-within:border-blue-600 transition-all space-y-2">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${title} or type /translate to translate...`}
                rows={2}
                className="w-full bg-transparent px-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
                <div className="flex items-center space-x-1 text-stone-500">
                  {/* File Upload Attachment */}
                  <label 
                    className={`p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 hover:text-[#0062FF] cursor-pointer transition-colors ${
                      isUploadingAttachment ? 'opacity-50 pointer-events-none' : ''
                    }`} 
                    title="Attach Official Document"
                  >
                    {isUploadingAttachment ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0062FF]" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploadingAttachment}
                    />
                  </label>

                  {/* Voice Note Trigger */}
                  <button
                    onClick={() => setIsRecordingVoice(true)}
                    className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 hover:text-[#0062FF] cursor-pointer"
                    title="Record Audio Note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Plugin Trigger Helper */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!inputText.startsWith('/')) {
                        setInputText('/' + inputText);
                      }
                      setIsSlashMenuOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-[#0062FF] text-stone-500 cursor-pointer"
                    title="Insert Plugin Slash Command"
                  >
                    <Puzzle className="w-4 h-4 text-[#0062FF]" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  id="chat-send-btn"
                  onClick={handleSend}
                  disabled={(!inputText.trim() && pendingAttachments.length === 0) || isPluginRunning}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-30 flex items-center space-x-1.5 cursor-pointer"
                  title="Dispatch Message (Enter)"
                >
                  <span>{isPluginRunning ? 'Running...' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Copy Toast */}
          {copiedToast && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center space-x-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Plugin result copied to clipboard</span>
            </div>
          )}
        </div>

      </div>

      {/* Right Slide-Over Thread Panel - Modal/Overlay on Mobile */}
      {activeThreadMessage && (
        <div className="fixed inset-0 z-40 md:relative md:w-80 lg:w-96 border-l border-stone-200 dark:border-stone-800/80 flex flex-col h-full bg-white dark:bg-[#0B101B] shrink-0 animate-fade-in shadow-2xl md:shadow-none">
          
          {/* Thread Header */}
          <div className="p-3.5 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between bg-white dark:bg-[#0F172A]">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#0062FF]" />
              <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                Discussion Thread
              </span>
            </div>
            <button
              onClick={onCloseThread}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              title="Close thread"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Parent Message Banner */}
          <div className="p-4 border-b border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#0F172A] space-y-2">
            <div className="flex items-center space-x-2">
              <UserAvatar
                member={activeThreadMessage.sender}
                size="xs"
                shape="rounded"
              />
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{activeThreadMessage.sender.name}</div>
                <div className="text-[10px] text-stone-400">{activeThreadMessage.timestamp}</div>
              </div>
            </div>
            <p className="text-xs text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
              {activeThreadMessage.content}
            </p>
            {activeThreadMessage.voiceNote && (
              <div className="pt-1">
                <AudioWaveformPlayer
                  voiceNote={activeThreadMessage.voiceNote}
                  isPlaying={playingVoiceId === `thread-${activeThreadMessage.id}`}
                  onTogglePlay={() => setPlayingVoiceId(playingVoiceId === `thread-${activeThreadMessage.id}` ? null : `thread-${activeThreadMessage.id}`)}
                />
              </div>
            )}
          </div>

          {/* Thread Replies List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {!activeThreadMessage.replies || activeThreadMessage.replies.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No replies in this thread yet.
              </div>
            ) : (
              (activeThreadMessage.replies || []).map(reply => (
                <div key={reply.id} className="p-3 rounded-xl bg-stone-50 dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      {reply.sender?.name || 'Public Officer'}
                    </span>
                    <span className="text-[10px] text-stone-400">{reply.timestamp}</span>
                  </div>
                  <p className="text-xs text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Thread Input Bar */}
          <div className="p-3 border-t border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#0F172A] pb-16 md:pb-3">
            <div className="flex items-center space-x-2 p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs">
              <input
                type="text"
                value={threadInputText}
                onChange={e => setThreadInputText(e.target.value)}
                onKeyDown={handleThreadKeyDown}
                placeholder="Reply in thread..."
                className="flex-1 bg-transparent px-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
              />
              <button
                onClick={handleSendThreadReply}
                disabled={!threadInputText.trim()}
                className="p-1.5 rounded-lg bg-[#0062FF] hover:bg-[#0048C6] text-white disabled:opacity-30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
