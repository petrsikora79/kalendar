import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarEvent, FamilyMember } from '../types/calendar.ts';
import { CZECH_DAYS_WORK_FIRST, CZECH_MONTHS, getMonthGrid } from '../utils/dateUtils.ts';

interface MonthViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  members: FamilyMember[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEventOnDate: (dateStr: string) => void;
  onSelectDate: (dateStr: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  onDateChange,
  events,
  members,
  onSelectEvent,
  onAddEventOnDate,
  onSelectDate
}) => {
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const daysGrid = getMonthGrid(year, monthIndex);

  const prevMonth = () => {
    onDateChange(new Date(year, monthIndex - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, monthIndex + 1, 1));
  };

  const goToToday = () => {
    onDateChange(new Date(2026, 10, 11)); // Nov 11, 2026
  };

  const getMemberById = (id: string) => {
    return members.find((m) => m.id === id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Month Header controls */}
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {CZECH_MONTHS[monthIndex]} <span className="text-slate-500 font-normal tabular-nums">{year}</span>
          </h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            Dnes
          </button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={prevMonth}
            aria-label="Předchozí měsíc"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Následující měsíc"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers: Po Út St Čt Pá So Ne */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/75 text-center text-xs font-semibold text-slate-600">
        {CZECH_DAYS_WORK_FIRST.map((day, idx) => {
          const isWeekend = idx >= 5;
          return (
            <div
              key={day}
              className={`py-2.5 ${isWeekend ? 'text-amber-800 bg-amber-50/40' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Calendar 7x5 or 7x6 Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {daysGrid.map((day, idx) => {
          const dayEvents = events.filter(
            (e) => e.startDate <= day.dateStr && e.endDate >= day.dateStr
          );
          const isWeekend = idx % 7 === 5 || idx % 7 === 6;

          return (
            <div
              key={day.dateStr}
              className={`min-h-[110px] md:min-h-[135px] p-2 flex flex-col justify-between transition-colors group relative ${
                !day.isCurrentMonth
                  ? 'bg-slate-50/60 text-slate-400'
                  : isWeekend
                  ? 'bg-amber-50/15'
                  : 'bg-white'
              } hover:bg-indigo-50/20`}
            >
              {/* Day number & nameday */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectDate(day.dateStr)}
                      className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full tabular-nums transition-transform ${
                        day.isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : day.isCurrentMonth
                          ? 'text-slate-800 hover:bg-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.dayNumber}
                    </button>
                    {day.nameday && (
                      <span className="hidden xl:inline text-[10px] text-slate-400 truncate max-w-[85px]">
                        {day.nameday}
                      </span>
                    )}
                  </div>

                  {/* Add button on hover */}
                  <button
                    onClick={() => onAddEventOnDate(day.dateStr)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-opacity"
                    title={`Přidat aktivitu na ${day.dayNumber}. ${CZECH_MONTHS[monthIndex]}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day events list */}
                <div className="mt-1.5 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const isAllFamily = event.memberIds.includes('all');
                    const primaryMember = isAllFamily
                      ? null
                      : getMemberById(event.memberIds[0]);

                    const badgeColor = isAllFamily
                      ? '#4F46E5'
                      : primaryMember?.color || '#64748B';

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="text-left w-full px-1.5 py-0.5 rounded text-[11px] truncate cursor-pointer transition-all hover:brightness-95 flex items-center gap-1.5 shadow-2xs"
                        style={{
                          backgroundColor: `${badgeColor}15`,
                          borderLeft: `3px solid ${badgeColor}`
                        }}
                        title={`${event.title} (${event.startTime || 'Celý den'})`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: badgeColor }}
                        />
                        {event.startTime && !event.isAllDay && (
                          <span className="font-mono text-[10px] text-slate-600 tabular-nums shrink-0">
                            {event.startTime}
                          </span>
                        )}
                        <span className="truncate font-medium text-slate-800">
                          {event.title}
                        </span>
                      </div>
                    );
                  })}

                  {dayEvents.length > 3 && (
                    <button
                      onClick={() => onSelectDate(day.dateStr)}
                      className="text-[10px] font-semibold text-indigo-600 hover:underline pt-0.5 block"
                    >
                      +{dayEvents.length - 3} další
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile nameday snippet */}
              {day.nameday && (
                <div className="xl:hidden text-[9px] text-slate-400 truncate mt-1">
                  {day.nameday}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
