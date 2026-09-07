import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  X, 
  HelpCircle, 
  Trash2, 
  Edit3, 
  Filter, 
  Search,
  Bell,
  Lock,
  Building2,
  CalendarCheck2,
  List,
  Grid,
  CalendarDays,
  ExternalLink,
  Share2,
  AlertCircle
} from 'lucide-react';
import { CalendarEvent, Member, RSVPStatus, CalendarEventVisibility, EventRecurrence } from '../../types';
import { 
  subscribeToCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent, 
  updateEventRSVP,
  createMeetingRoom 
} from '../../lib/firestoreService';

interface CalendarViewProps {
  currentUser: Member;
  members: Member[];
  onStartMeeting?: (meetingId: string, title: string) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentUser,
  members,
  onStartMeeting
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('agenda');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | CalendarEventVisibility>('all');
  
  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formLocation, setFormLocation] = useState('');
  const [formVisibility, setFormVisibility] = useState<CalendarEventVisibility>('organization');
  const [formDepartment, setFormDepartment] = useState(currentUser.department || 'General');
  const [formHasMeeting, setFormHasMeeting] = useState(true);
  const [formReminder, setFormReminder] = useState<number>(15);
  const [formRecurrence, setFormRecurrence] = useState<EventRecurrence>('none');
  const [formSelectedParticipants, setFormSelectedParticipants] = useState<string[]>([]);
  const [formColorTag, setFormColorTag] = useState('#0062FF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default view based on screen width on initial load
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setViewMode('month');
    } else {
      setViewMode('agenda');
    }
  }, []);

  // Real-time Firestore Calendar sync
  useEffect(() => {
    const unsubscribe = subscribeToCalendarEvents(
      (realEvents) => {
        setEvents(realEvents);
      },
      currentUser.id,
      currentUser.department
    );
    return () => unsubscribe();
  }, [currentUser.id, currentUser.department]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Visibility Filter
      if (visibilityFilter !== 'all' && evt.visibility !== visibilityFilter) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = (evt.description || '').toLowerCase().includes(q);
        const matchesLoc = (evt.location || '').toLowerCase().includes(q);
        const matchesCreator = evt.creatorName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesCreator) {
          return false;
        }
      }
      return true;
    });
  }, [events, visibilityFilter, searchQuery]);

  // Reset / Open Event Creation Form
  const handleOpenCreateModal = (prefillDate?: string) => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDescription('');
    const targetDate = prefillDate || new Date().toISOString().split('T')[0];
    setFormStartDate(targetDate);
    setFormEndDate(targetDate);
    setFormStartTime('10:00');
    setFormEndTime('11:00');
    setFormLocation('');
    setFormVisibility('organization');
    setFormDepartment(currentUser.department || 'General');
    setFormHasMeeting(true);
    setFormReminder(15);
    setFormRecurrence('none');
    setFormSelectedParticipants([]);
    setFormColorTag('#0062FF');
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (evt: CalendarEvent) => {
    setEditingEventId(evt.id);
    setFormTitle(evt.title);
    setFormDescription(evt.description || '');
    setFormStartDate(evt.startDate);
    setFormEndDate(evt.endDate || evt.startDate);
    setFormStartTime(evt.startTime);
    setFormEndTime(evt.endTime);
    setFormLocation(evt.location || '');
    setFormVisibility(evt.visibility);
    setFormDepartment(evt.department || currentUser.department || 'General');
    setFormHasMeeting(!!evt.hasMeeting);
    setFormReminder(evt.reminderMinutes || 15);
    setFormRecurrence(evt.recurrence || 'none');
    setFormSelectedParticipants((evt.participants || []).map(p => p.userId));
    setFormColorTag(evt.colorTag || '#0062FF');
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      setIsSubmitting(true);

      const participantsList = formSelectedParticipants.map(uid => {
        const mem = members.find(m => m.id === uid);
        return {
          userId: uid,
          name: mem?.name || 'Officer',
          email: mem?.email || '',
          avatar: mem?.avatar,
          status: (uid === currentUser.id ? 'accepted' : 'pending') as RSVPStatus
        };
      });

      // Always include creator as accepted
      if (!participantsList.some(p => p.userId === currentUser.id)) {
        participantsList.push({
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          status: 'accepted'
        });
      }

      let meetingId = '';
      if (formHasMeeting) {
        // Create an attached WorkNest video room
        const room = await createMeetingRoom({
          title: formTitle.trim(),
          description: formDescription.trim(),
          hostId: currentUser.id,
          hostName: currentUser.name,
          hostEmail: currentUser.email,
          scheduledStartTime: `${formStartDate}T${formStartTime}:00`,
          scheduledEndTime: `${formEndDate}T${formEndTime}:00`,
          isPrivate: formVisibility === 'private',
          allowedDepartment: formVisibility === 'department' ? formDepartment : '',
          invitedUserIds: formSelectedParticipants
        });
        meetingId = room.id;
      }

      if (editingEventId) {
        await updateCalendarEvent(editingEventId, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          startDate: formStartDate,
          startTime: formStartTime,
          endDate: formEndDate,
          endTime: formEndTime,
          location: formLocation.trim(),
          visibility: formVisibility,
          department: formDepartment,
          participants: participantsList,
          hasMeeting: formHasMeeting,
          meetingId: meetingId || undefined,
          reminderMinutes: formReminder,
          recurrence: formRecurrence,
          colorTag: formColorTag
        });
      } else {
        await createCalendarEvent({
          title: formTitle.trim(),
          description: formDescription.trim(),
          startDate: formStartDate,
          startTime: formStartTime,
          endDate: formEndDate,
          endTime: formEndTime,
          location: formLocation.trim(),
          visibility: formVisibility,
          department: formDepartment,
          creatorId: currentUser.id,
          creatorName: currentUser.name,
          creatorEmail: currentUser.email,
          participants: participantsList,
          hasMeeting: formHasMeeting,
          meetingId: meetingId,
          reminderMinutes: formReminder,
          recurrence: formRecurrence,
          colorTag: formColorTag
        });
      }

      setIsEventModalOpen(false);
    } catch (err) {
      console.error('Failed to save calendar event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to remove this calendar event?')) return;
    try {
      await deleteCalendarEvent(eventId);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleRSVP = async (eventId: string, status: RSVPStatus) => {
    try {
      await updateEventRSVP(eventId, currentUser.id, status);
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedParticipants = (selectedEvent.participants || []).map(p => 
          p.userId === currentUser.id ? { ...p, status } : p
        );
        setSelectedEvent({ ...selectedEvent, participants: updatedParticipants });
      }
    } catch (err) {
      console.error('Failed to update RSVP:', err);
    }
  };

  // Date Navigation Helpers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const headerTitle = useMemo(() => {
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    if (viewMode === 'month') return `${month} ${year}`;
    if (viewMode === 'day') return `${currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
    return `${month} ${year}`;
  }, [currentDate, viewMode]);

  // Render Month Grid
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: true });
    }
    // Trailing days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: false });
    }
    return days;
  }, [currentDate]);

  return (
    <div id="calendar-view" className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#080C14] overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <div className="px-3 sm:px-6 py-3 bg-white dark:bg-[#0F172A] border-b border-stone-200 dark:border-stone-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0">
        
        {/* Title & Navigation */}
        <div className="flex items-center justify-between md:justify-start space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 dark:text-white tracking-tight truncate">
              {headerTitle}
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
              Keep your organizational schedule in one place.
            </p>
          </div>
        </div>

        {/* Right Controls: View Switcher & Action */}
        <div className="flex items-center justify-between md:justify-end space-x-2 overflow-x-auto scrollbar-none">
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filter events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:border-[#0062FF] text-stone-900 dark:text-stone-100 w-32 sm:w-40"
            />
          </div>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={e => setVisibilityFilter(e.target.value as any)}
            className="text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-2 py-1.5 text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer shrink-0"
          >
            <option value="all">All Events</option>
            <option value="organization">Organization</option>
            <option value="department">Department</option>
            <option value="private">Private</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200 dark:border-stone-800 shrink-0">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                viewMode === 'agenda' 
                  ? 'bg-white dark:bg-[#0F172A] text-[#0062FF] shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="Agenda List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agenda</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                viewMode === 'day' 
                  ? 'bg-white dark:bg-[#0F172A] text-[#0062FF] shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="Day View"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Day</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                viewMode === 'month' 
                  ? 'bg-white dark:bg-[#0F172A] text-[#0062FF] shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="Month Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Month</span>
            </button>
          </div>

          {/* New Event Button */}
          <button
            id="calendar-add-event-btn"
            onClick={() => handleOpenCreateModal()}
            className="px-3 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-semibold shadow-xs flex items-center space-x-1 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Canvas */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pb-24 md:pb-6 scrollbar-thin">
        
        {/* VIEW 1: AGENDA / LIST VIEW (Mobile Default & High Efficiency) */}
        {viewMode === 'agenda' && (
          <div className="max-w-4xl mx-auto space-y-5">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800/80 space-y-3">
                <CalendarIcon className="w-10 h-10 mx-auto text-stone-400" />
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">No upcoming events</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Keep your organizational schedule in one place. Schedule department reviews, stakeholder briefings, or inter-agency meetings.
                </p>
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-semibold shadow-xs inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Event</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map(evt => {
                  const isCreator = evt.creatorId === currentUser.id;
                  const myRSVP = (evt.participants || []).find(p => p.userId === currentUser.id)?.status || 'pending';
                  const isToday = evt.startDate === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={evt.id}
                      id={`event-card-${evt.id}`}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border transition-all hover:shadow-md cursor-pointer relative overflow-hidden ${
                        isToday 
                          ? 'border-[#0062FF]/50 ring-1 ring-[#0062FF]/20 dark:ring-[#0062FF]/30' 
                          : 'border-stone-200 dark:border-stone-800/80'
                      }`}
                    >
                      {/* Left color bar */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: evt.colorTag || '#0062FF' }}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 pl-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              {evt.startDate} • {evt.startTime} - {evt.endTime}
                            </span>
                            {isToday && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0062FF] dark:text-blue-400">
                                Today
                              </span>
                            )}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 capitalize">
                              {evt.visibility}
                            </span>
                            {evt.hasMeeting && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                                <Video className="w-3 h-3" />
                                <span>Video Meeting</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-stone-900 dark:text-white tracking-tight">
                            {evt.title}
                          </h3>

                          {evt.description && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                              {evt.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                            {evt.location && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                <span>{evt.location}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <Users className="w-3.5 h-3.5 text-stone-400" />
                              <span>{(evt.participants || []).length} participants</span>
                            </span>
                            <span className="text-[11px] text-stone-400">
                              By {evt.creatorName}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons on card */}
                        <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                          {evt.hasMeeting && (
                            <button
                              id={`join-meeting-btn-${evt.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onStartMeeting) {
                                  onStartMeeting(evt.meetingId || evt.id, evt.title);
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Meeting</span>
                            </button>
                          )}

                          {/* Quick RSVP if invited */}
                          <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleRSVP(evt.id, 'accepted')}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                myRSVP === 'accepted'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                                  : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100'
                              }`}
                              title="Accept invitation"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRSVP(evt.id, 'declined')}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                myRSVP === 'declined'
                                  ? 'bg-rose-100 dark:bg-rose-950 border-rose-300 text-rose-700 dark:text-rose-300'
                                  : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100'
                              }`}
                              title="Decline invitation"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: MONTH GRID VIEW */}
        {viewMode === 'month' && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800/80 overflow-hidden shadow-xs">
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-stone-200 dark:border-stone-800 text-center text-xs font-bold text-stone-500 dark:text-stone-400 py-2.5 bg-stone-50/50 dark:bg-stone-900/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-200 dark:divide-stone-800/80">
              {monthDays.map((cell, idx) => {
                const dayEvents = filteredEvents.filter(e => e.startDate === cell.dateStr);
                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenCreateModal(cell.dateStr)}
                    className={`min-h-[64px] sm:min-h-[110px] p-1 sm:p-2 transition-colors cursor-pointer group flex flex-col justify-between ${
                      cell.isCurrentMonth 
                        ? 'bg-white dark:bg-[#0F172A] hover:bg-blue-50/30 dark:hover:bg-blue-950/20' 
                        : 'bg-stone-50/40 dark:bg-stone-900/20 text-stone-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                        isToday 
                          ? 'bg-[#0062FF] text-white' 
                          : cell.isCurrentMonth ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'
                      }`}>
                        {cell.dayNumber}
                      </span>
                      {cell.isCurrentMonth && (
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-400 hover:text-[#0062FF] transition-opacity hidden sm:block"
                          title="Add event on this date"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Mobile: Compact Event Dots */}
                    <div className="flex sm:hidden flex-wrap gap-1 justify-center mt-1">
                      {dayEvents.slice(0, 3).map(evt => (
                        <span 
                          key={evt.id} 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: evt.colorTag || '#0062FF' }} 
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-stone-400">+{dayEvents.length - 3}</span>
                      )}
                    </div>

                    {/* Desktop: Full Day Events Pills */}
                    <div className="hidden sm:block space-y-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map(evt => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          style={{ borderLeftColor: evt.colorTag || '#0062FF' }}
                          className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-stone-100 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 truncate border-l-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer flex items-center space-x-1"
                        >
                          {evt.hasMeeting && <Video className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
                          <span className="truncate">{evt.startTime} {evt.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] font-bold text-stone-400 pl-1 block">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: DAY VIEW */}
        {viewMode === 'day' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800/80 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                Events for {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button
                onClick={() => handleOpenCreateModal(currentDate.toISOString().split('T')[0])}
                className="px-3 py-1 text-xs font-semibold rounded-xl bg-[#0062FF] text-white hover:bg-[#0048C6] cursor-pointer"
              >
                + Add for this Day
              </button>
            </div>

            {filteredEvents.filter(e => e.startDate === currentDate.toISOString().split('T')[0]).length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                No events scheduled for this date.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.filter(e => e.startDate === currentDate.toISOString().split('T')[0]).map(evt => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-100/60 dark:hover:bg-stone-900 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {evt.startTime} - {evt.endTime}
                        </span>
                        {evt.hasMeeting && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                            Video Meeting
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                        {evt.title}
                      </h4>
                      {evt.location && (
                        <p className="text-xs text-stone-500">{evt.location}</p>
                      )}
                    </div>

                    {evt.hasMeeting && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onStartMeeting) onStartMeeting(evt.meetingId || evt.id, evt.title);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* EVENT DETAILS DRAWER / MODAL */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 space-y-5 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {selectedEvent.startDate} • {selectedEvent.startTime} - {selectedEvent.endTime}
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <p className="text-xs text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                {selectedEvent.description}
              </p>
            )}

            {/* Meta details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Visibility</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                  {selectedEvent.visibility} {selectedEvent.department ? `(${selectedEvent.department})` : ''}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Location</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {selectedEvent.location || 'Online'}
                </span>
              </div>
            </div>

            {/* Participants list & RSVP status */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Participants ({(selectedEvent.participants || []).length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                {(selectedEvent.participants || []).map(p => (
                  <div key={p.userId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60">
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {p.name} {p.userId === currentUser.id ? '(You)' : ''}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      p.status === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                      p.status === 'declined' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' :
                      'bg-stone-200 dark:bg-stone-800 text-stone-600'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Meeting Callout */}
            {selectedEvent.hasMeeting && (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-[#0062FF]" />
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 dark:text-white">WorkNest Video Room Attached</h5>
                    <p className="text-[10px] text-stone-500">Room: {selectedEvent.meetingId || selectedEvent.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onStartMeeting) {
                      onStartMeeting(selectedEvent.meetingId || selectedEvent.id, selectedEvent.title);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Enter Room</span>
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              {/* Creator Edit/Delete */}
              {selectedEvent.creatorId === currentUser.id ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedEvent)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-stone-400">
                  Organized by {selectedEvent.creatorName}
                </div>
              )}

              {/* RSVP controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRSVP(selectedEvent.id, 'accepted')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRSVP(selectedEvent.id, 'declined')}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT FORM MODAL */}
      {isEventModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setIsEventModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 space-y-4 my-8 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                {editingEventId ? 'Edit Calendar Event' : 'Schedule Event / Meeting'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quarterly Strategic Briefing"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-[#0062FF]"
                />
              </div>

              {/* Date & Time Range */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">End Date</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">End Time</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* WorkNest Video Room Toggle */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-[#0062FF]" />
                  <div>
                    <span className="font-bold text-stone-900 dark:text-white block">
                      Attach Built-in WorkNest Video Meeting
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Creates an instant encrypted browser-based meeting room for all participants
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formHasMeeting}
                  onChange={e => setFormHasMeeting(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0062FF] focus:ring-[#0062FF] cursor-pointer"
                />
              </div>

              {/* Location & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Physical Location / Room (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Conference Room A or Online"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Visibility & Permissions</label>
                  <select
                    value={formVisibility}
                    onChange={e => setFormVisibility(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="organization">Organization-Wide</option>
                    <option value="department">Department Only ({formDepartment})</option>
                    <option value="private">Private (Invited Only)</option>
                  </select>
                </div>
              </div>

              {/* Invite Participants Multi-Select */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Invite Participants ({formSelectedParticipants.length} selected)
                </label>
                <div className="max-h-28 overflow-y-auto p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-1.5 scrollbar-thin">
                  {members.filter(m => m.id !== currentUser.id).map(mem => {
                    const isSelected = formSelectedParticipants.includes(mem.id);
                    return (
                      <button
                        key={mem.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormSelectedParticipants(prev => prev.filter(id => id !== mem.id));
                          } else {
                            setFormSelectedParticipants(prev => [...prev, mem.id]);
                          }
                        }}
                        className={`p-1.5 rounded-lg text-left text-xs flex items-center space-x-2 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-100 dark:bg-blue-900/60 text-[#0062FF] font-semibold' : 'hover:bg-stone-200/50 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${
                          isSelected ? 'bg-[#0062FF] border-[#0062FF] text-white' : 'border-stone-400'
                        }`}>
                          {isSelected && '✓'}
                        </span>
                        <span className="truncate">{mem.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">Description & Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Outline key meeting goals, agenda items, or notes..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              {/* Reminder & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Notification Reminder</label>
                  <select
                    value={formReminder}
                    onChange={e => setFormReminder(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Color Tag</label>
                  <div className="flex items-center space-x-2 pt-1">
                    {['#0062FF', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColorTag(color)}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                          formColorTag === color ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formTitle.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white shadow-xs disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer"
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : editingEventId ? 'Update Event' : 'Save Event'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
