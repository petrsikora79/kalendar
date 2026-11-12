import React, { useState } from 'react';
import { useCalendarData } from './hooks/useCalendarData.ts';
import { Header, CalendarViewType } from './components/Header.tsx';
import { BottomNavBar } from './components/BottomNavBar.tsx';
import { PWAInstallBanner } from './components/PWAInstallBanner.tsx';
import { MemberFilterBar } from './components/MemberFilterBar.tsx';
import { MonthView } from './components/MonthView.tsx';
import { WeekFamilyView } from './components/WeekFamilyView.tsx';
import { DayView } from './components/DayView.tsx';
import { AgendaView } from './components/AgendaView.tsx';
import { FamilyDashboard } from './components/FamilyDashboard.tsx';
import { EventModal } from './components/EventModal.tsx';
import { MemberSettingsModal } from './components/MemberSettingsModal.tsx';
import { ShareSyncModal } from './components/ShareSyncModal.tsx';
import { CalendarEvent } from './types/calendar.ts';
import { parseDate } from './utils/dateUtils.ts';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const {
    data,
    loading,
    error,
    isSyncing,
    refetch,
    addEvent,
    updateEvent,
    deleteEvent,
    updateMember,
    addTask,
    toggleTask,
    deleteTask,
    updateMeal
  } = useCalendarData();

  // Navigation & View state - ALWAYS DEFAULT TO WEEKLY VIEW AS REQUESTED
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 11)); // Nov 11, 2026 anchor

  // Member filter state
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [activeWriterId, setActiveWriterId] = useState<string>('tata');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>('2026-11-11');
  const [modalDefaultMemberId, setModalDefaultMemberId] = useState<string | undefined>(undefined);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Filter events based on selected family member
  const filteredEvents = (data?.events || []).filter((event) => {
    if (selectedMemberId === 'all') return true;
    return event.memberIds.includes(selectedMemberId) || event.memberIds.includes('all');
  });

  // Modal Open Handlers
  const handleOpenNewEvent = (dateStr?: string, memberId?: string) => {
    setEventToEdit(null);
    setModalDefaultDate(dateStr || '2026-11-11');
    setModalDefaultMemberId(memberId || (selectedMemberId !== 'all' ? selectedMemberId : activeWriterId));
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEventToEdit(event);
    setModalDefaultDate(event.startDate);
    setModalDefaultMemberId(event.memberIds[0] || 'all');
    setIsEventModalOpen(true);
  };

  const handleSelectDateFromMonth = (dateStr: string) => {
    setCurrentDate(parseDate(dateStr));
    setCurrentView('week'); // When clicking from month, take directly to that week
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    if (eventToEdit) {
      await updateEvent(eventToEdit.id, eventData);
    } else {
      await addEvent(eventData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Načítám rodinný kalendář...</h2>
        <p className="text-xs text-slate-500 mt-1">
          Připojuji se k online synchronizaci pro 4 členy rodiny
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Chyba připojení</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {error || 'Nepodařilo se navázat spojení se serverem kalendáře.'}
        </p>
        <button
          onClick={refetch}
          className="mt-4 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* PWA Mobile App Install prompt banner for phones */}
      <PWAInstallBanner />

      {/* Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewEvent={() => handleOpenNewEvent()}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        isSyncing={isSyncing}
      />

      {/* Member Filter Bar */}
      <MemberFilterBar
        members={data.members}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        events={data.events}
        activeWriterId={activeWriterId}
        onChangeWriter={setActiveWriterId}
      />

      {/* Main Content Area (extra bottom padding for mobile bottom bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-8">
        {currentView === 'week' && (
          <WeekFamilyView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            events={filteredEvents}
            members={data.members}
            onSelectEvent={handleEditEvent}
            onAddEvent={(d, m) => handleOpenNewEvent(d, m)}
            selectedMemberId={selectedMemberId}
          />
        )}

        {currentView === 'day' && (
          <DayView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            events={filteredEvents}
            members={data.members}
            onSelectEvent={handleEditEvent}
            onAddEvent={(d, t) => {
              setModalDefaultDate(d);
              setModalDefaultMemberId(selectedMemberId !== 'all' ? selectedMemberId : activeWriterId);
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
          />
        )}

        {currentView === 'month' && (
          <MonthView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            events={filteredEvents}
            members={data.members}
            onSelectEvent={handleEditEvent}
            onAddEventOnDate={(d) => handleOpenNewEvent(d)}
            onSelectDate={handleSelectDateFromMonth}
          />
        )}

        {currentView === 'agenda' && (
          <AgendaView
            events={filteredEvents}
            members={data.members}
            onSelectEvent={handleEditEvent}
            onDeleteEvent={deleteEvent}
            onOpenNewEvent={() => handleOpenNewEvent()}
          />
        )}

        {currentView === 'dashboard' && (
          <FamilyDashboard
            events={data.events}
            members={data.members}
            tasks={data.tasks}
            meals={data.meals}
            onToggleTask={toggleTask}
            onAddTask={(title, assignedMemberId) =>
              addTask({ title, assignedMemberId, dueDate: '2026-11-11' })
            }
            onDeleteTask={deleteTask}
            onUpdateMeal={(date, lunch, dinner, cookMemberId) =>
              updateMeal({ date, lunch, dinner, cookMemberId })
            }
            onSelectEvent={handleEditEvent}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNavBar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewEvent={() => handleOpenNewEvent()}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Event Add/Edit Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventToEdit={eventToEdit}
        defaultDate={modalDefaultDate}
        defaultMemberId={modalDefaultMemberId}
        members={data.members}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
      />

      {/* Member Settings Modal */}
      <MemberSettingsModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={data.members}
        onUpdateMember={updateMember}
      />

      {/* Share / Multi-device Sync Modal */}
      <ShareSyncModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Desktop clean footer (hidden on mobile to prevent clutter) */}
      <footer className="hidden md:block border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>
            Rodinný týdenní kalendář · 4 členové rodiny online
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              Správa členů
            </button>
            <span>·</span>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              Sdílet s rodinou
            </button>
            <span>·</span>
            <a
              href="/api/export/ics"
              className="hover:text-slate-700 transition-colors"
            >
              Export kalendáře (.ics)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
