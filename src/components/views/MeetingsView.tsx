import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Copy, 
  Share2, 
  Radio, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { MeetingRoom, Member } from '../../types';
import { subscribeToMeetings, createMeetingRoom, endMeetingRoom } from '../../lib/firestoreService';

interface MeetingsViewProps {
  currentUser: Member;
  members: Member[];
  onJoinMeeting: (meetingId: string, title?: string) => void;
  onNavigateToCalendar?: () => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  currentUser,
  members,
  onJoinMeeting,
  onNavigateToCalendar
}) => {
  const [meetings, setMeetings] = useState<MeetingRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'active'>('all');
  
  // Instant Meeting Creation modal / state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [instantTitle, setInstantTitle] = useState('');
  const [instantDescription, setInstantDescription] = useState('');
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToMeetings(
      (list) => {
        setMeetings(list);
      },
      currentUser.id,
      currentUser.department
    );
    return () => unsub();
  }, [currentUser.id, currentUser.department]);

  const handleStartInstant = async () => {
    try {
      setIsSubmitting(true);
      const room = await createMeetingRoom({
        title: instantTitle.trim() || `${currentUser.name}'s Quick Consultation`,
        description: instantDescription.trim(),
        hostId: currentUser.id,
        hostName: currentUser.name,
        hostEmail: currentUser.email,
        status: 'active',
        isWaitingRoomEnabled: isWaitingRoom,
        isPrivate: isPrivate,
        invitedUserIds: invitedUsers
      });

      setIsCreateModalOpen(false);
      onJoinMeeting(room.id, room.title);
    } catch (e) {
      console.error('Failed to create instant meeting:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const cleanCode = joinCodeInput.trim().replace(/^.*meet\//, '');
    onJoinMeeting(cleanCode);
  };

  const filteredMeetings = meetings.filter(m => {
    if (filterMode === 'mine' && m.hostId !== currentUser.id) return false;
    if (filterMode === 'active' && m.status !== 'active') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.hostName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div id="meetings-directory-view" className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#080C14] overflow-y-auto select-none p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 scrollbar-thin">
      <div className="max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
        
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0062FF] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
              <span>Browser-Native High-Fidelity Audio & Video</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              WorkNest Video Consultations
            </h1>
            
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Start or join secure WorkNest video meetings. Connect instantly with team members, conduct briefings, and collaborate with real-time screen sharing and active speaker detection.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="start-instant-meeting-btn"
                onClick={() => {
                  setInstantTitle(`${currentUser.name}'s Consultation`);
                  setIsCreateModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-[#0062FF] hover:bg-blue-50 active:bg-blue-100 font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Start Instant Meeting</span>
              </button>

              {onNavigateToCalendar && (
                <button
                  onClick={onNavigateToCalendar}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Schedule in Calendar</span>
                </button>
              )}
            </div>
          </div>

          {/* Abstract decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
            <Video className="w-64 h-64" />
          </div>
        </div>

        {/* Quick Join By Code Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-white">Join with a Room Code</h3>
              <p className="text-[11px] text-stone-500">Enter a meeting identifier to enter directly</p>
            </div>
          </div>

          <form onSubmit={handleJoinByCode} className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. wn-meet-9382"
              value={joinCodeInput}
              onChange={e => setJoinCodeInput(e.target.value)}
              className="flex-1 sm:w-56 p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#0062FF]"
            />
            <button
              type="submit"
              disabled={!joinCodeInput.trim()}
              className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
            >
              <span>Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Directory Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          
          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-stone-200/60 dark:bg-stone-900 p-1 rounded-xl w-fit">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-white dark:bg-[#0F172A] text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              All Meetings ({meetings.length})
            </button>
            <button
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'active' ? 'bg-white dark:bg-[#0F172A] text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Live Rooms ({meetings.filter(m => m.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterMode('mine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'mine' ? 'bg-white dark:bg-[#0F172A] text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Hosted by Me
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:border-[#0062FF] text-stone-900 dark:text-white w-full sm:w-56"
            />
          </div>

        </div>

        {/* Meetings List */}
        <div className="space-y-3">
          {filteredMeetings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800/80 space-y-3">
              <Video className="w-10 h-10 mx-auto text-stone-400" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">No upcoming meetings</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Start or join secure WorkNest video meetings. No active or scheduled calls found.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0062FF] text-white text-xs font-bold shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Start Meeting</span>
              </button>
            </div>
          ) : (
            filteredMeetings.map(room => {
              const isLive = room.status === 'active';
              const isHost = room.hostId === currentUser.id;

              return (
                <div
                  key={room.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-stone-200 dark:border-stone-800/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Live Active Room</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-bold">
                          Scheduled
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-stone-400">
                        {room.id}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 dark:text-white tracking-tight">
                      {room.title}
                    </h3>

                    {room.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                        {room.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-0.5">
                      <span>Host: <strong className="text-stone-700 dark:text-stone-300">{room.hostName}</strong></span>
                      <span>Created: {new Date(room.createdAt).toLocaleDateString()}</span>
                      {room.isWaitingRoomEnabled && (
                        <span className="flex items-center space-x-1 text-blue-500">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Waiting Room Protected</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => onJoinMeeting(room.id, room.title)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>{isLive ? 'Enter Room' : 'Join Call'}</span>
                    </button>

                    {isHost && (
                      <button
                        onClick={() => endMeetingRoom(room.id)}
                        className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="End / Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* CREATE INSTANT MEETING MODAL */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Launch Instant Video Meeting
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">Meeting Topic / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ad-hoc Architecture Review"
                  value={instantTitle}
                  onChange={e => setInstantTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-[#0062FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">Agenda / Context (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short note on what this meeting is about..."
                  value={instantDescription}
                  onChange={e => setInstantDescription(e.target.value)}
                  className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Enable Waiting Room</span>
                  <input
                    type="checkbox"
                    checked={isWaitingRoom}
                    onChange={e => setIsWaitingRoom(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0062FF]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Private Meeting</span>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0062FF]"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleStartInstant}
                  className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>{isSubmitting ? 'Starting...' : 'Enter Video Room'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
