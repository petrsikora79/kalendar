import React from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Clock, MapPin, Car } from 'lucide-react';
import { CalendarEvent, FamilyMember } from '../types/calendar.ts';
import { formatDayTitle, parseDate, toDateString, CZECH_NAMEDAYS } from '../utils/dateUtils.ts';
import { CATEGORIES } from '../utils/categories.ts';

interface DayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  members: FamilyMember[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEvent: (dateStr: string, timeStr?: string) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  onDateChange,
  events,
  members,
  onSelectEvent,
  onAddEvent
}) => {
  const currentDateStr = toDateString(currentDate);

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  const goToToday = () => {
    onDateChange(new Date(2026, 10, 11)); // Nov 11, 2026
  };

  const dayEvents = events
    .filter((e) => e.startDate <= currentDateStr && e.endDate >= currentDateStr)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  // Namedays
  const key = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const nameday = CZECH_NAMEDAYS[key];

  // Conflict detection
  const conflicts: string[] = [];
  for (let i = 0; i < dayEvents.length; i++) {
    for (let j = i + 1; j < dayEvents.length; j++) {
      const e1 = dayEvents[i];
      const e2 = dayEvents[j];
      if (e1.isAllDay || e2.isAllDay || !e1.startTime || !e2.startTime) continue;

      const overlap =
        (e1.startTime <= (e2.endTime || '23:59') && (e1.endTime || '23:59') >= e2.startTime);

      if (overlap) {
        // check shared members
        const commonMembers = e1.memberIds.filter(
          (m) => e2.memberIds.includes(m) || e1.memberIds.includes('all') || e2.memberIds.includes('all')
        );
        if (commonMembers.length > 0) {
          const names = commonMembers.map((id) => members.find((m) => m.id === id)?.name || 'Všichni').join(', ');
          conflicts.push(`Časový překryv (${names}): "${e1.title}" a "${e2.title}"`);
        }
      }
    }
  }

  // Hours array from 07:00 to 20:00
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Day header controls */}
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Denní časová osa
            </span>
            {nameday && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-medium">
                Svátek: {nameday}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            {formatDayTitle(currentDateStr)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            Dnes
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevDay}
              aria-label="Předchozí den"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextDay}
              aria-label="Následující den"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onAddEvent(currentDateStr)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Přidat</span>
          </button>
        </div>
      </div>

      {/* Conflicts warning alert */}
      {conflicts.length > 0 && (
        <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Pozor na možnou kolizi v rodinném rozvrhu:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {conflicts.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Hourly timeline */}
      <div className="divide-y divide-slate-100">
        {hours.map((hour) => {
          const hourStr = `${String(hour).padStart(2, '0')}:00`;
          const nextHourStr = `${String(hour + 1).padStart(2, '0')}:00`;

          const hourEvents = dayEvents.filter((e) => {
            if (e.isAllDay) return hour === 8; // show all-day at top
            if (!e.startTime) return false;
            return e.startTime >= hourStr && e.startTime < nextHourStr;
          });

          return (
            <div
              key={hour}
              className="group flex items-start hover:bg-slate-50/50 transition-colors min-h-[64px]"
            >
              {/* Hour label */}
              <div className="w-20 sm:w-24 p-3 text-right font-mono text-xs text-slate-400 tabular-nums shrink-0 border-r border-slate-100">
                {hourStr}
              </div>

              {/* Event slot */}
              <div className="flex-1 p-2 sm:p-3 relative flex flex-wrap gap-2 items-center">
                {hourEvents.length === 0 ? (
                  <button
                    onClick={() => onAddEvent(currentDateStr, hourStr)}
                    className="opacity-0 group-hover:opacity-100 text-[11px] text-slate-400 hover:text-indigo-600 inline-flex items-center gap-1 transition-opacity py-1 px-2 rounded hover:bg-slate-100"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Přidat aktivitu v {hourStr}</span>
                  </button>
                ) : (
                  hourEvents.map((event) => {
                    const isFamilyWide = event.memberIds.includes('all');
                    const eventMembers = isFamilyWide
                      ? members
                      : members.filter((m) => event.memberIds.includes(m.id));
                    const primaryColor = isFamilyWide ? '#4F46E5' : eventMembers[0]?.color || '#64748B';
                    const categoryMeta = CATEGORIES[event.category] || CATEGORIES.volny_cas;

                    return (
                      <div
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex-1 min-w-[260px] max-w-xl text-left"
                        style={{ borderLeft: `4px solid ${primaryColor}` }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-xs text-slate-900">
                            {event.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                            {event.isAllDay
                              ? 'Celodenní'
                              : `${event.startTime} – ${event.endTime}`}
                          </span>
                        </div>

                        {/* Participants avatars and role */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <div className="flex items-center -space-x-1">
                            {eventMembers.map((m) => (
                              <span
                                key={m.id}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-slate-100 border border-white"
                                title={m.name}
                              >
                                {m.avatar}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-600 font-medium">
                            {isFamilyWide
                              ? 'Celá rodina'
                              : eventMembers.map((m) => m.name).join(', ')}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className={`text-[11px] ${categoryMeta.textColor}`}>
                            {categoryMeta.label}
                          </span>
                        </div>

                        {/* Transport if set */}
                        {event.transport && (
                          <div className="mt-2 text-[11px] bg-amber-50 text-amber-900 px-2 py-1 rounded flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{event.transport.note || 'Odvoz zajištěn'}</span>
                          </div>
                        )}

                        {/* Location */}
                        {event.location && (
                          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
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
    </div>
  );
};
