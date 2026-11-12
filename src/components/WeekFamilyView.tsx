import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Car, Clock, MapPin, Users, Calendar, Filter } from 'lucide-react';
import { CalendarEvent, FamilyMember } from '../types/calendar.ts';
import { getWeekDays, formatDateCzech, parseDate, toDateString, CZECH_DAYS_FULL, getTodayStr } from '../utils/dateUtils.ts';
import { CATEGORIES } from '../utils/categories.ts';

interface WeekFamilyViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  members: FamilyMember[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEvent: (dateStr: string, memberId?: string) => void;
  selectedMemberId: string | 'all';
}

export const WeekFamilyView: React.FC<WeekFamilyViewProps> = ({
  currentDate,
  onDateChange,
  events,
  members,
  onSelectEvent,
  onAddEvent,
  selectedMemberId
}) => {
  const currentDateStr = toDateString(currentDate);
  const weekDays = getWeekDays(currentDateStr);
  const todayStr = getTodayStr();

  // Active highlighted day in the week
  const [activeDayDateStr, setActiveDayDateStr] = useState<string>(() => {
    // If today is within this week, highlight today, else highlight first day of week
    const isTodayInWeek = weekDays.some((w) => w.dateStr === todayStr);
    return isTodayInWeek ? todayStr : weekDays[0].dateStr;
  });

  // Week view modes tailored for mobile:
  // 'days-flow': All 7 days laid out vertically in clear, high-legibility cards (Best for mobile)
  // 'by-members': 4 cards for 4 members summarizing their week
  // 'selected-day-focus': Focus on one day with big cards
  const [mobileMode, setMobileMode] = useState<'days-flow' | 'by-members'>('days-flow');

  const dayCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync activeDay if week changes
  useEffect(() => {
    const isDayInWeek = weekDays.some((w) => w.dateStr === activeDayDateStr);
    if (!isDayInWeek) {
      const isTodayInWeek = weekDays.some((w) => w.dateStr === todayStr);
      setActiveDayDateStr(isTodayInWeek ? todayStr : weekDays[0].dateStr);
    }
  }, [currentDateStr]);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  };

  const goToToday = () => {
    onDateChange(new Date(2026, 10, 11)); // Nov 11, 2026
    setActiveDayDateStr('2026-11-11');
  };

  const scrollToDay = (dateStr: string) => {
    setActiveDayDateStr(dateStr);
    const target = dayCardRefs.current[dateStr];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to get member details
  const getMember = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="space-y-4">
      {/* 1. Mobile-First Week Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                Týdenní kalendář
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {selectedMemberId === 'all'
                  ? 'Celá rodina (4 členové)'
                  : `Jen pro: ${getMember(selectedMemberId)?.name || selectedMemberId}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
              {formatDateCzech(weekDays[0].dateStr)} – {formatDateCzech(weekDays[6].dateStr)}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              onClick={goToToday}
              className="px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-xl transition-colors min-h-[44px] flex items-center justify-center shadow-2xs"
            >
              Tento týden
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevWeek}
                aria-label="Předchozí týden"
                className="w-11 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextWeek}
                aria-label="Následující týden"
                className="w-11 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Horizontal Mobile 7-Day Quick Touch Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((day) => {
              const isSelected = day.dateStr === activeDayDateStr;
              const isToday = day.dateStr === todayStr;
              const dayEvents = events.filter(
                (e) => e.startDate <= day.dateStr && e.endDate >= day.dateStr
              );

              // Gather unique participating members for color dots
              const participantMemberIds = new Set<string>();
              dayEvents.forEach((e) => {
                if (e.memberIds.includes('all')) {
                  members.forEach((m) => participantMemberIds.add(m.id));
                } else {
                  e.memberIds.forEach((id) => participantMemberIds.add(id));
                }
              });

              return (
                <button
                  key={day.dateStr}
                  onClick={() => scrollToDay(day.dateStr)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all min-h-[58px] relative border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102'
                      : isToday
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-semibold'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-slate-300' : isToday ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  >
                    {day.dayNameShort}
                  </span>

                  <span
                    className={`text-sm sm:text-base font-bold tabular-nums mt-0.5 leading-none ${
                      isSelected ? 'text-white' : isToday ? 'text-indigo-700 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Member activity dots indicator */}
                  <div className="flex items-center gap-0.5 mt-1.5 h-1.5">
                    {dayEvents.length === 0 ? (
                      <span className="w-1 h-1 rounded-full bg-slate-300 opacity-40" />
                    ) : (
                      Array.from(participantMemberIds).slice(0, 4).map((memberId) => {
                        const m = getMember(memberId);
                        return (
                          <span
                            key={memberId}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: m?.color || '#6366F1' }}
                            title={m?.name}
                          />
                        );
                      })
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* View mode switcher */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMobileMode('days-flow')}
              className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] ${
                mobileMode === 'days-flow'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Dny v týdnu (Po – Ne)
            </button>
            <button
              onClick={() => setMobileMode('by-members')}
              className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] ${
                mobileMode === 'by-members'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👨‍👩‍👧‍👦 4 členové rodiny
            </button>
          </div>

          <button
            onClick={() => onAddEvent(activeDayDateStr)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Přidat aktivitu</span>
            <span className="sm:hidden">Zapsat</span>
          </button>
        </div>
      </div>

      {/* 3. MODE A: HIGHLY LEGIBLE DAY-BY-DAY FLOW (Optimized for Mobile Screens) */}
      {mobileMode === 'days-flow' && (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const isToday = day.dateStr === todayStr;
            const isSelected = day.dateStr === activeDayDateStr;
            const dayEvents = events
              .filter((e) => e.startDate <= day.dateStr && e.endDate >= day.dateStr)
              .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

            return (
              <div
                key={day.dateStr}
                ref={(el) => {
                  dayCardRefs.current[day.dateStr] = el;
                }}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isToday
                    ? 'border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                    : isSelected
                    ? 'border-slate-300 shadow-xs'
                    : 'border-slate-200 shadow-2xs'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between ${
                    isToday
                      ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950'
                      : 'bg-slate-50/75 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm tabular-nums shrink-0 ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      {day.dayNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base leading-tight">
                          {day.dayNameFull}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            Dnes
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {formatDateCzech(day.dateStr)} {day.nameday ? `· svátek má ${day.nameday}` : ''}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddEvent(day.dateStr)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title={`Přidat aktivitu na ${day.dayNameFull}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Day Activities List */}
                <div className="p-3 sm:p-4 space-y-2.5">
                  {dayEvents.length === 0 ? (
                    <div className="py-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">
                        Zatím žádné zapsané aktivity
                      </p>
                      <button
                        onClick={() => onAddEvent(day.dateStr)}
                        className="mt-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline min-h-[36px] inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Zapsat první aktivitu</span>
                      </button>
                    </div>
                  ) : (
                    dayEvents.map((event) => {
                      const isFamilyWide = event.memberIds.includes('all');
                      const eventMembers = isFamilyWide
                        ? members
                        : members.filter((m) => event.memberIds.includes(m.id));
                      const primaryColor = isFamilyWide
                        ? '#4F46E5'
                        : eventMembers[0]?.color || '#2563EB';
                      const categoryMeta = CATEGORIES[event.category] || CATEGORIES.volny_cas;

                      return (
                        <div
                          key={event.id}
                          onClick={() => onSelectEvent(event)}
                          className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 active:scale-[0.99] transition-all cursor-pointer shadow-xs text-left"
                          style={{
                            borderLeft: `5px solid ${primaryColor}`
                          }}
                        >
                          {/* Top row: Time + Category */}
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900 tabular-nums">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {event.isAllDay
                                ? 'Celodenní událost'
                                : `${event.startTime || '12:00'} – ${event.endTime || '13:00'}`}
                            </span>
                            <span className={`text-[11px] font-semibold ${categoryMeta.textColor}`}>
                              {categoryMeta.label}
                            </span>
                          </div>

                          {/* Activity Title - BIG and CLEAR */}
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {event.title}
                          </h4>

                          {/* Description if present */}
                          {event.description && (
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {event.description}
                            </p>
                          )}

                          {/* Odvoz / Transport banner if exists */}
                          {event.transport && (
                            <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                              <Car className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block text-amber-900">
                                  Zajištěný odvoz:
                                </span>
                                <span className="text-[11px] leading-tight">
                                  {event.transport.note || 'Odvoz zajištěn'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Location */}
                          {event.location && (
                            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {/* Participants Pill-free badges */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium mr-1">
                              Účast:
                            </span>
                            {isFamilyWide ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                👨‍👩‍👧‍👦 Celá rodina
                              </span>
                            ) : (
                              eventMembers.map((m) => (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border"
                                  style={{
                                    backgroundColor: `${m.color}15`,
                                    borderColor: `${m.color}40`,
                                    color: m.color
                                  }}
                                >
                                  <span>{m.avatar}</span>
                                  <span>{m.name}</span>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODE B: 4 FAMILY MEMBERS CARDS (Compare who is doing what this week) */}
      {mobileMode === 'by-members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const memberEvents = events
              .filter(
                (e) =>
                  e.startDate >= weekDays[0].dateStr &&
                  e.endDate <= weekDays[6].dateStr &&
                  (e.memberIds.includes(member.id) || e.memberIds.includes('all'))
              )
              .sort((a, b) => a.startDate.localeCompare(b.startDate));

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Member Card Header */}
                <div
                  className="p-4 border-b flex items-center justify-between"
                  style={{ backgroundColor: `${member.color}10`, borderColor: `${member.color}30` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{member.avatar}</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {member.name}
                      </h3>
                      <span className="text-xs text-slate-600 font-medium">
                        {member.roleTitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {memberEvents.length} akt. v týdnu
                  </span>
                </div>

                {/* Member's events this week */}
                <div className="p-3 space-y-2">
                  {memberEvents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Tento týden nemá zapsané žádné povinnosti
                    </div>
                  ) : (
                    memberEvents.map((evt) => {
                      const dayName = CZECH_DAYS_FULL[parseDate(evt.startDate).getDay()];
                      return (
                        <div
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                            <span className="font-bold text-slate-800">
                              {dayName} {evt.startDate.split('-')[2]}.
                            </span>
                            <span className="font-mono tabular-nums text-slate-600 font-medium">
                              {evt.isAllDay ? 'Celý den' : evt.startTime}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-900">
                            {evt.title}
                          </div>
                          {evt.transport && (
                            <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                              <Car className="w-3 h-3 text-amber-600" />
                              <span>{evt.transport.note}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
