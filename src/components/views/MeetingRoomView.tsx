import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Hand, 
  MessageSquare, 
  Users, 
  PhoneOff, 
  Settings, 
  MoreVertical, 
  Pin, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Check, 
  X, 
  Send, 
  Copy, 
  Share2, 
  Radio, 
  Wifi, 
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react';
import { 
  MeetingRoom, 
  MeetingParticipantState, 
  MeetingChatMessage, 
  Member 
} from '../../types';
import { 
  WorkNestMeetingEngine, 
  DeviceInfo 
} from '../../lib/webrtcService';
import { 
  getMeetingById, 
  updateMeetingRoom, 
  endMeetingRoom, 
  subscribeToMeetingRoom,
  subscribeToMeetingParticipants, 
  updateParticipantState, 
  removeParticipantFromMeeting, 
  admitParticipantFromWaitingRoom, 
  rejectParticipantFromWaitingRoom, 
  subscribeToMeetingSignals, 
  subscribeToMeetingChat, 
  sendMeetingChatMessage 
} from '../../lib/firestoreService';

interface MeetingRoomViewProps {
  meetingId: string;
  currentUser: Member;
  onLeaveMeeting: () => void;
  onSaveChatToChannel?: (channelId: string, content: string) => void;
}

export const MeetingRoomView: React.FC<MeetingRoomViewProps> = ({
  meetingId,
  currentUser,
  onLeaveMeeting,
  onSaveChatToChannel
}) => {
  // Pre-join state
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [meetingData, setMeetingData] = useState<MeetingRoom | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Audio / Video device states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'reconnecting'>('excellent');

  // Devices
  const [devices, setDevices] = useState<{ audioInputs: DeviceInfo[]; videoInputs: DeviceInfo[]; audioOutputs: DeviceInfo[] }>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: []
  });
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Participants & Remote Streams
  const [participants, setParticipants] = useState<MeetingParticipantState[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [waitingRoomStatus, setWaitingRoomStatus] = useState<'admitted' | 'waiting' | 'rejected'>('admitted');

  // Side panels
  const [activeSidePanel, setActiveSidePanel] = useState<'none' | 'chat' | 'participants'>('none');
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Modals & Toast State
  const [showEndMeetingModal, setShowEndMeetingModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const engineRef = useRef<WorkNestMeetingEngine | null>(null);

  const isHost = meetingData?.hostId === currentUser.id;

  // 1. Initial Meeting Room fetch and WebRTC Engine Initialization
  useEffect(() => {
    let isMounted = true;

    async function initRoom() {
      const room = await getMeetingById(meetingId);
      if (!isMounted) return;

      if (room) {
        setMeetingData(room);
        if (room.isWaitingRoomEnabled && room.hostId !== currentUser.id) {
          setWaitingRoomStatus('waiting');
        } else {
          setWaitingRoomStatus('admitted');
        }
      }

      // Initialize Engine
      const engine = new WorkNestMeetingEngine(meetingId, currentUser.id);
      engineRef.current = engine;

      // Event handlers
      engine.onRemoteStreamAdded = (peerId, stream) => {
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.set(peerId, stream);
          return next;
        });
      };

      engine.onRemoteStreamRemoved = (peerId) => {
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.delete(peerId);
          return next;
        });
      };

      engine.onActiveSpeakerChange = (speakerId) => {
        setActiveSpeakerId(speakerId);
      };

      engine.onConnectionQualityChange = (peerId, quality) => {
        setConnectionQuality(quality);
      };

      engine.onScreenShareEnded = () => {
        setIsScreenSharing(false);
      };

      // Query devices
      try {
        const devs = await engine.getMediaDevices();
        if (isMounted) {
          setDevices(devs);
          if (devs.audioInputs[0]) setSelectedAudioInput(devs.audioInputs[0].deviceId);
          if (devs.videoInputs[0]) setSelectedVideoInput(devs.videoInputs[0].deviceId);
        }
      } catch (e) {
        console.warn('Device enumeration failed', e);
      }

      // Start pre-join camera preview
      try {
        const stream = await engine.startLocalMedia(!isAudioMuted, !isVideoOff);
        if (previewVideoRef.current && isMounted) {
          previewVideoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        if (isMounted) {
          setPermissionError('Camera or microphone access was declined. You can still join in listen-only mode.');
          setIsVideoOff(true);
        }
      }
    }

    initRoom();

    return () => {
      isMounted = false;
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, [meetingId, currentUser.id]);

  // 2. Real-time Subscriptions (Meeting Room Status, Participants, Signals, Chat)
  useEffect(() => {
    if (!meetingId) return;

    // Room Status
    const unsubRoom = subscribeToMeetingRoom(meetingId, (room) => {
      if (room) {
        setMeetingData(room);
        if (room.status === 'ended') {
          // The meeting was ended by the host
          if (engineRef.current) {
            engineRef.current.cleanup();
          }
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
          }
          if (previewVideoRef.current) {
            previewVideoRef.current.srcObject = null;
          }
          onLeaveMeeting();
        }
      }
    });

    // Participants
    const unsubParticipants = subscribeToMeetingParticipants(meetingId, (list) => {
      setParticipants(list);

      // Check current user status
      const myState = list.find(p => p.userId === currentUser.id);
      if (myState?.waitingRoomStatus) {
        setWaitingRoomStatus(myState.waitingRoomStatus);
      }

      // Initiate WebRTC peer connections to all other admitted participants
      if (engineRef.current && isInMeeting && waitingRoomStatus === 'admitted') {
        list.forEach(p => {
          if (p.userId !== currentUser.id && p.waitingRoomStatus === 'admitted') {
            engineRef.current?.initiateConnectionToPeer(p.userId);
          }
        });
      }
    });

    // Signals
    const unsubSignals = subscribeToMeetingSignals(meetingId, currentUser.id, (signal) => {
      if (engineRef.current) {
        engineRef.current.handleIncomingSignal(signal);
      }
    });

    // Chat
    const unsubChat = subscribeToMeetingChat(meetingId, (messages) => {
      setChatMessages(messages);
      if (activeSidePanel !== 'chat' && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.senderId !== currentUser.id) {
          setUnreadChatCount(prev => prev + 1);
        }
      }
    });

    return () => {
      unsubRoom();
      unsubParticipants();
      unsubSignals();
      unsubChat();
    };
  }, [meetingId, currentUser.id, isInMeeting, waitingRoomStatus, activeSidePanel, onLeaveMeeting]);

  // Attach local stream when joining meeting
  useEffect(() => {
    if (isInMeeting && localVideoRef.current && engineRef.current) {
      const stream = engineRef.current.getLocalStream();
      if (stream) {
        localVideoRef.current.srcObject = stream;
      }
    }
  }, [isInMeeting, isVideoOff]);

  // 3. User Actions
  const handleJoinMeeting = async () => {
    try {
      setIsInMeeting(true);

      const participantState: MeetingParticipantState = {
        userId: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: isHost ? 'host' : 'participant',
        joinedAt: new Date().toISOString(),
        isAudioMuted,
        isVideoOff,
        isScreenSharing: false,
        isHandRaised: false,
        waitingRoomStatus: waitingRoomStatus === 'waiting' ? 'waiting' : 'admitted',
        connectionQuality: 'excellent',
        deviceState: {
          hasMic: !isAudioMuted,
          hasCam: !isVideoOff
        }
      };

      await updateParticipantState(meetingId, participantState);

      // Connect to preview / local video stream
      if (localVideoRef.current && engineRef.current) {
        const stream = engineRef.current.getLocalStream();
        if (stream) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.error('Error joining meeting:', err);
    }
  };

  const handleToggleAudio = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    if (engineRef.current) {
      engineRef.current.setAudioEnabled(!nextState);
    }
    updateParticipantState(meetingId, {
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: isHost ? 'host' : 'participant',
      joinedAt: new Date().toISOString(),
      isAudioMuted: nextState,
      isVideoOff,
      isScreenSharing,
      isHandRaised,
      waitingRoomStatus
    });
  };

  const handleToggleVideo = async () => {
    const nextState = !isVideoOff;
    setIsVideoOff(nextState);
    if (engineRef.current) {
      engineRef.current.setVideoEnabled(!nextState);
    }
    updateParticipantState(meetingId, {
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: isHost ? 'host' : 'participant',
      joinedAt: new Date().toISOString(),
      isAudioMuted,
      isVideoOff: nextState,
      isScreenSharing,
      isHandRaised,
      waitingRoomStatus
    });
  };

  const handleToggleScreenShare = async () => {
    if (!engineRef.current) return;

    if (isScreenSharing) {
      engineRef.current.stopScreenShare();
      setIsScreenSharing(false);
      updateParticipantState(meetingId, {
        userId: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: isHost ? 'host' : 'participant',
        joinedAt: new Date().toISOString(),
        isAudioMuted,
        isVideoOff,
        isScreenSharing: false,
        isHandRaised,
        waitingRoomStatus
      });
    } else {
      const screenStream = await engineRef.current.startScreenShare();
      if (screenStream) {
        setIsScreenSharing(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        updateParticipantState(meetingId, {
          userId: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: isHost ? 'host' : 'participant',
          joinedAt: new Date().toISOString(),
          isAudioMuted,
          isVideoOff,
          isScreenSharing: true,
          isHandRaised,
          waitingRoomStatus
        });
      }
    }
  };

  const handleToggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    updateParticipantState(meetingId, {
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: isHost ? 'host' : 'participant',
      joinedAt: new Date().toISOString(),
      isAudioMuted,
      isVideoOff,
      isScreenSharing,
      isHandRaised: nextState,
      waitingRoomStatus
    });
  };

  const handleLeaveMeeting = async () => {
    try {
      setShowEndMeetingModal(false);
      setIsExiting(true);
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = null;
      }
      await removeParticipantFromMeeting(meetingId, currentUser.id);
    } catch (e) {
      console.warn('Error during leave meeting:', e);
    } finally {
      onLeaveMeeting();
    }
  };

  const handleEndMeetingForAll = async () => {
    try {
      setShowEndMeetingModal(false);
      setIsExiting(true);
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = null;
      }
      await removeParticipantFromMeeting(meetingId, currentUser.id);
      await endMeetingRoom(meetingId);
    } catch (e) {
      console.warn('Error during end meeting for all:', e);
    } finally {
      onLeaveMeeting();
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      await sendMeetingChatMessage({
        meetingId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: chatInput.trim()
      });
      setChatInput('');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const handleCopyMeetingLink = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // -------------------------------------------------------------
  // PRE-JOIN SCREEN (Google Meet Class Preview)
  // -------------------------------------------------------------
  if (!isInMeeting) {
    return (
      <div id="meeting-preview-screen" className="flex-1 flex flex-col items-center justify-center bg-[#0B101B] text-white p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6 animate-fade-in">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0062FF]">
              WorkNest Secure Video
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {meetingData?.title || 'Team Consultation & Briefing'}
            </h1>
            <p className="text-xs text-stone-400">
              Room Code: <span className="font-mono text-stone-300">{meetingId}</span>
            </p>
          </div>

          {/* Camera Preview Card */}
          <div className="relative aspect-video rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {isVideoOff ? (
              <div className="flex flex-col items-center space-y-2 text-stone-400">
                <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-xl font-bold text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold">Camera is turned off</span>
              </div>
            ) : (
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            )}

            {/* Bottom floating preview controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-3">
              <button
                onClick={handleToggleAudio}
                className={`p-3 rounded-full transition-all cursor-pointer shadow-lg ${
                  isAudioMuted 
                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                    : 'bg-stone-800/90 hover:bg-stone-700 text-white backdrop-blur-md'
                }`}
                title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleToggleVideo}
                className={`p-3 rounded-full transition-all cursor-pointer shadow-lg ${
                  isVideoOff 
                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                    : 'bg-stone-800/90 hover:bg-stone-700 text-white backdrop-blur-md'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowDeviceSettings(prev => !prev)}
                className="p-3 rounded-full bg-stone-800/90 hover:bg-stone-700 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
                title="Audio & Video Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Device Settings Panel */}
          {showDeviceSettings && (
            <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold pb-1 border-b border-stone-800">
                <span>Hardware Device Configuration</span>
                <button onClick={() => setShowDeviceSettings(false)} className="text-stone-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-400">Microphone</label>
                  <select
                    value={selectedAudioInput}
                    onChange={e => setSelectedAudioInput(e.target.value)}
                    className="w-full p-2 rounded-lg bg-stone-800 border border-stone-700 text-white"
                  >
                    {devices.audioInputs.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-stone-400">Camera</label>
                  <select
                    value={selectedVideoInput}
                    onChange={e => setSelectedVideoInput(e.target.value)}
                    className="w-full p-2 rounded-lg bg-stone-800 border border-stone-700 text-white"
                  >
                    {devices.videoInputs.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Permission Notice / Warning */}
          {permissionError && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{permissionError}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 text-xs text-stone-400">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready to enter as <strong className="text-white">{currentUser.name}</strong> ({currentUser.department || 'Officer'})</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleLeaveMeeting}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="join-meeting-confirm-btn"
                onClick={handleJoinMeeting}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-bold shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                Join Now
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // WAITING ROOM SCREEN (If host hasn't admitted user yet)
  // -------------------------------------------------------------
  if (waitingRoomStatus === 'waiting') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B101B] text-white p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-stone-900/80 border border-stone-800 text-center space-y-4 shadow-2xl animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-blue-950/80 border border-blue-500/50 flex items-center justify-center mx-auto text-[#0062FF]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold">Waiting to be admitted...</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            The meeting host (<strong>{meetingData?.hostName || 'Host'}</strong>) has been notified. You will be admitted once they approve your request.
          </p>
          <button
            onClick={handleLeaveMeeting}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
          >
            Leave Waiting Room
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE IN-MEETING VIDEO STAGE
  // -------------------------------------------------------------
  const admittedParticipants = participants.filter(p => p.waitingRoomStatus === 'admitted');
  const waitingParticipants = participants.filter(p => p.waitingRoomStatus === 'waiting');
  const totalCount = Math.max(1, admittedParticipants.length);

  return (
    <div id="active-meeting-stage" className="flex-1 flex flex-col h-full bg-[#080C14] text-white overflow-hidden select-none relative">
      
      {/* 1. Top Mini Stage Header */}
      <div className="px-4 py-2.5 bg-[#0B101B]/80 backdrop-blur-md border-b border-stone-800/80 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[200px] sm:max-w-md">
              {meetingData?.title || 'WorkNest Consultation Room'}
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-400 hidden sm:inline">
            {meetingId}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection Quality Pill */}
          <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[10px] text-stone-300">
            <Wifi className={`w-3 h-3 ${connectionQuality === 'excellent' ? 'text-emerald-400' : connectionQuality === 'good' ? 'text-blue-400' : 'text-amber-400'}`} />
            <span className="capitalize hidden sm:inline">{connectionQuality}</span>
          </div>

          {/* Copy Meeting Link */}
          <button
            onClick={handleCopyMeetingLink}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 transition-colors cursor-pointer"
            title="Copy Meeting Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Host Waiting Room Banner Alert */}
      {isHost && waitingParticipants.length > 0 && (
        <div className="px-4 py-2 bg-blue-950/80 border-b border-blue-900/60 flex items-center justify-between text-xs z-20">
          <div className="flex items-center space-x-2 text-blue-200">
            <Users className="w-4 h-4 text-blue-400" />
            <span><strong>{waitingParticipants.length}</strong> officer(s) in waiting room</span>
          </div>
          <div className="flex items-center space-x-2">
            {waitingParticipants.map(wp => (
              <div key={wp.userId} className="flex items-center space-x-1">
                <span className="text-[11px] text-stone-300 font-semibold">{wp.name}</span>
                <button
                  onClick={() => admitParticipantFromWaitingRoom(meetingId, wp.userId)}
                  className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                >
                  Admit
                </button>
                <button
                  onClick={() => rejectParticipantFromWaitingRoom(meetingId, wp.userId)}
                  className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                >
                  Deny
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Stage Video Canvas & Sidebar Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Adaptive Video Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex items-center justify-center">
          <div className={`w-full h-full max-w-6xl mx-auto grid gap-3 items-center justify-center ${
            totalCount === 1 
              ? 'grid-cols-1 max-w-4xl' 
              : totalCount === 2 
                ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl' 
                : totalCount <= 4 
                  ? 'grid-cols-2 max-w-5xl' 
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}>
            
            {/* Local Video Card */}
            <div className={`relative aspect-video rounded-2xl bg-stone-900 border overflow-hidden shadow-xl flex items-center justify-center transition-all ${
              activeSpeakerId === currentUser.id 
                ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-950/40' 
                : 'border-stone-800/80'
            }`}>
              {isVideoOff && !isScreenSharing ? (
                <div className="flex flex-col items-center space-y-2 text-stone-400">
                  <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-xl font-bold text-white">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold">{currentUser.name} (You)</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isScreenSharing ? '' : 'mirror'}`}
                />
              )}

              {/* Status badges overlay */}
              <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                {isAudioMuted && (
                  <span className="p-1 rounded-md bg-rose-600/90 text-white" title="Microphone muted">
                    <MicOff className="w-3.5 h-3.5" />
                  </span>
                )}
                {isHandRaised && (
                  <span className="p-1 rounded-md bg-amber-500 text-white animate-bounce" title="Hand raised">
                    <Hand className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Bottom tag */}
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white flex items-center space-x-1.5">
                <span>{currentUser.name} (You)</span>
                {isScreenSharing && <span className="text-blue-400 text-[10px] font-bold">• Presenting</span>}
              </div>
            </div>

            {/* Remote Participants Cards */}
            {admittedParticipants.filter(p => p.userId !== currentUser.id).map(peer => {
              const remoteStream = remoteStreams.get(peer.userId);
              const isSpeaker = activeSpeakerId === peer.userId;

              return (
                <div
                  key={peer.userId}
                  className={`relative aspect-video rounded-2xl bg-stone-900 border overflow-hidden shadow-xl flex items-center justify-center transition-all ${
                    isSpeaker 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-950/40' 
                      : 'border-stone-800/80'
                  }`}
                >
                  {peer.isVideoOff || !remoteStream ? (
                    <div className="flex flex-col items-center space-y-2 text-stone-400">
                      <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-xl font-bold text-white">
                        {peer.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold">{peer.name}</span>
                    </div>
                  ) : (
                    <RemoteVideoPlayer stream={remoteStream} />
                  )}

                  {/* Remote Status Badges */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                    {peer.isAudioMuted && (
                      <span className="p-1 rounded-md bg-rose-600/90 text-white" title="Microphone muted">
                        <MicOff className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {peer.isHandRaised && (
                      <span className="p-1 rounded-md bg-amber-500 text-white animate-bounce" title="Hand raised">
                        <Hand className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Bottom tag */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white flex items-center space-x-1.5">
                    <span>{peer.name}</span>
                    {peer.role === 'host' && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-600 text-[9px] font-bold">Host</span>
                    )}
                    {peer.isScreenSharing && (
                      <span className="text-blue-400 text-[10px] font-bold">• Presenting</span>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* 3. In-Meeting Slide-over Panels (Chat or Participants) */}
        {activeSidePanel === 'chat' && (
          <div className="fixed inset-0 sm:relative sm:inset-auto w-full sm:w-80 md:w-96 bg-[#0B101B] border-l border-stone-800 flex flex-col h-full z-50 sm:z-30 shrink-0 animate-slide-in">
            <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-[#0062FF]" />
                <span>In-Call Messages</span>
              </div>
              <button
                onClick={() => setActiveSidePanel('none')}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {chatMessages.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  Messages sent here are visible only to participants in this video call.
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-stone-400 text-[11px]">
                      <span className="font-bold text-stone-200">{msg.senderName}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-stone-800 flex items-center space-x-2 pb-16 sm:pb-3">
              <input
                type="text"
                placeholder="Send a message to everyone..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-[#0062FF]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {activeSidePanel === 'participants' && (
          <div className="fixed inset-0 sm:relative sm:inset-auto w-full sm:w-80 md:w-96 bg-[#0B101B] border-l border-stone-800 flex flex-col h-full z-50 sm:z-30 shrink-0 animate-slide-in">
            <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-xs">
                <Users className="w-4 h-4 text-[#0062FF]" />
                <span>Participants ({admittedParticipants.length})</span>
              </div>
              <button
                onClick={() => setActiveSidePanel('none')}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-16 sm:pb-3 scrollbar-thin">
              {admittedParticipants.map(p => (
                <div key={p.userId} className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-stone-200 block truncate">
                        {p.name} {p.userId === currentUser.id ? '(You)' : ''}
                      </span>
                      <span className="text-[10px] text-stone-500 capitalize">{p.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {p.isAudioMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-stone-400" />}
                    {p.isVideoOff ? <VideoOff className="w-3.5 h-3.5 text-rose-500" /> : <VideoIcon className="w-3.5 h-3.5 text-stone-400" />}
                    
                    {/* Host Kick Action */}
                    {isHost && p.userId !== currentUser.id && (
                      <button
                        onClick={() => removeParticipantFromMeeting(meetingId, p.userId)}
                        className="p-1 rounded text-stone-500 hover:text-rose-400 cursor-pointer"
                        title="Remove participant"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. Bottom Video Meeting Control Bar */}
      <div className="px-2 sm:px-4 py-2.5 sm:py-3 bg-[#0B101B] border-t border-stone-800/80 flex items-center justify-between gap-2 z-30 shrink-0">
        
        {/* Left Side: Room Time / ID Info */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-stone-400">
          <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>|</span>
          <span className="font-medium truncate max-w-[150px]">{meetingData?.title || 'Meeting'}</span>
        </div>

        {/* Center: Core Audio, Video & Sharing Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 mx-auto">
          {/* Mute Audio */}
          <button
            id="meeting-mic-toggle-btn"
            onClick={handleToggleAudio}
            className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer shadow-md ${
              isAudioMuted 
                ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-500/50' 
                : 'bg-stone-800 hover:bg-stone-700 text-white'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            id="meeting-cam-toggle-btn"
            onClick={handleToggleVideo}
            className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer shadow-md ${
              isVideoOff 
                ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-500/50' 
                : 'bg-stone-800 hover:bg-stone-700 text-white'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Screen Share */}
          <button
            id="meeting-screen-toggle-btn"
            onClick={handleToggleScreenShare}
            className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer shadow-md ${
              isScreenSharing 
                ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-500/50' 
                : 'bg-stone-800 hover:bg-stone-700 text-white'
            }`}
            title={isScreenSharing ? 'Stop presenting' : 'Share your screen'}
          >
            {isScreenSharing ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Raise Hand */}
          <button
            id="meeting-hand-toggle-btn"
            onClick={handleToggleHandRaise}
            className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer shadow-md ${
              isHandRaised 
                ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-500/50' 
                : 'bg-stone-800 hover:bg-stone-700 text-white'
            }`}
            title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Leave / End Call */}
          <button
            id="meeting-leave-btn"
            onClick={() => {
              if (isHost) {
                setShowEndMeetingModal(true);
              } else {
                handleLeaveMeeting();
              }
            }}
            className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
            title={isHost ? 'End call or leave options' : 'Leave meeting'}
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">{isHost ? 'End Call' : 'Leave'}</span>
          </button>
        </div>

        {/* Right Side: Panel Toggles */}
        <div className="flex items-center space-x-2">
          {/* In-Call Chat */}
          <button
            id="meeting-chat-toggle-btn"
            onClick={() => {
              setActiveSidePanel(prev => prev === 'chat' ? 'none' : 'chat');
              setUnreadChatCount(0);
            }}
            className={`p-2.5 rounded-full transition-all relative cursor-pointer ${
              activeSidePanel === 'chat' ? 'bg-[#0062FF] text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
            title="Chat with participants"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Participants */}
          <button
            id="meeting-participants-toggle-btn"
            onClick={() => setActiveSidePanel(prev => prev === 'participants' ? 'none' : 'participants')}
            className={`p-2.5 rounded-full transition-all relative cursor-pointer ${
              activeSidePanel === 'participants' ? 'bg-[#0062FF] text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
            title="View participants"
          >
            <Users className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full bg-stone-700 text-white text-[9px] font-bold flex items-center justify-center">
              {admittedParticipants.length}
            </span>
          </button>
        </div>

      </div>

      {/* Copy Link Toast */}
      {copiedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Meeting invitation link copied to clipboard</span>
        </div>
      )}

      {/* Host End Meeting / Leave Choice Modal */}
      {showEndMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <PhoneOff className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Leave or End Meeting?</h3>
              <p className="text-xs text-stone-400">
                As the host, you can end this session for everyone or leave other participants in the room.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                id="modal-end-for-all-btn"
                onClick={handleEndMeetingForAll}
                disabled={isExiting}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isExiting ? 'Ending Session...' : 'End Meeting for All'}
              </button>

              <button
                id="modal-leave-only-btn"
                onClick={handleLeaveMeeting}
                disabled={isExiting}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 font-semibold text-xs transition-colors cursor-pointer border border-stone-700"
              >
                {isExiting ? 'Leaving...' : 'Leave Meeting (Keep Room Open)'}
              </button>

              <button
                onClick={() => setShowEndMeetingModal(false)}
                disabled={isExiting}
                className="w-full py-2 px-4 rounded-xl text-stone-400 hover:text-white disabled:opacity-50 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Internal helper for remote video rendering
const RemoteVideoPlayer: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
};
