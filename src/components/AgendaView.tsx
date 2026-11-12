import React, { useState } from 'react';
import { CalendarEvent, FamilyMember, EventCategory } from '../types/calendar.ts';
import { formatDateCzech, formatDayTitle, getTodayStr } from '../utils/dateUtils.ts';
import { CATEGORIES } from '../utils/categories.ts';
import { Search, MapPin, Clock, Car, Trash2, Edit3, Filter } from 'lucide-react';

interface AgendaViewProps {
  events: CalendarEvent[];
  members: FamilyMember[];
  onSelectEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onOpenNewEvent: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  members,
  onSelectEvent,
  onDeleteEvent,
  onOpenNewEvent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const todayStr = getTodayStr();

  // Filter events
  const filteredEvents = events
    .filter((e) => {
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        e.title.toLowerCase().includes(term) ||
        (e.description && e.description.toLowerCase().includes(term)) ||
        (e.location && e.location.toLowerCase().includes(term)) ||
        (e.transport?.note && e.transport.note.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      const dateCmp = a.startDate.localeCompare(b.startDate);
      if (dateCmp !== 0) return dateCmp;
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });

  // Group by date
  const groupedEvents: Record<string, CalendarEvent[]> = {};
  for (const event of filteredEvents) {
    if (!groupedEvents[event.startDate]) {
      groupedEvents[event.startDate] = [];
    }
    groupedEvents[event.startDate].push(event);
  }

  const dateKeys = Object.keys(groupedEvents).sort();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Search & Category Filter toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Hledat aktivitu, kroužek, místo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Všechny kategorie</option>
            {Object.entries(CATEGORIES).map(([catKey, cat]) => (
              <option key={catKey} value={catKey}>
                {cat.label}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 tabular-nums shrink-0 ml-auto sm:ml-0">
            Celkem: {filteredEvents.length}
          </span>
        </div>
      </div>

      {/* Agenda list */}
      {dateKeys.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <p className="text-sm">Nenalezeny žádné aktivity odpovídající zadaným kritériím.</p>
          <button
            onClick={onOpenNewEvent}
            className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-block"
          >
            + Vytvořit novou aktivitu
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {dateKeys.map((dateStr) => {
            const dayList = groupedEvents[dateStr];
            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr} className="p-4 sm:p-6">
                {/* Date Heading */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {formatDayTitle(dateStr)}
                  </h3>
                  {isToday && (
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Dnes
                    </span>
                  )}
                </div>

                {/* Event items for this date */}
                <div className="space-y-3">
                  {dayList.map((event) => {
                    const isFamilyWide = event.memberIds.includes('all');
                    const eventMembers = isFamilyWide
                      ? members
                      : members.filter((m) => event.memberIds.includes(m.id));
                    const primaryColor = isFamilyWide
                      ? '#4F46E5'
                      : eventMembers[0]?.color || '#64748B';
                    const categoryMeta = CATEGORIES[event.category] || CATEGORIES.volny_cas;

                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 group"
                        style={{ borderLeft: `4px solid ${primaryColor}` }}
                      >
                        <div className="space-y-1.5 flex-1">
                          {/* Time & Category line */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 font-mono font-medium text-slate-800 tabular-nums">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {event.isAllDay
                                ? 'Celodenní událost'
                                : `${event.startTime} – ${event.endTime}`}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className={`font-medium ${categoryMeta.textColor}`}>
                              {categoryMeta.label}
                            </span>
                            {event.repeat && event.repeat !== 'none' && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="text-slate-500">
                                  Opakování: {event.repeat === 'weekly' ? 'Každý týden' : event.repeat}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-base font-semibold text-slate-900 leading-snug">
                            {event.title}
                          </h4>

                          {/* Description */}
                          {event.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {event.description}
                            </p>
                          )}

                          {/* Location & Transport */}
                          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            {event.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{event.location}</span>
                              </span>
                            )}

                            {event.transport && (
                              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Car className="w-3.5 h-3.5 text-amber-600" />
                                <span>{event.transport.note || 'Odvoz zajištěn'}</span>
                              </span>
                            )}
                          </div>

                          {/* Assigned family members */}
                          <div className="pt-2 flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium mr-1">
                              Účastní se:
                            </span>
                            {isFamilyWide ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                👨‍👩‍👧‍👦 Celá rodina
                              </span>
                            ) : (
                              eventMembers.map((m) => (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border"
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

                        {/* Action buttons (Edit & Delete) */}
                        <div className="flex items-center gap-1.5 self-end md:self-start shrink-0">
                          <button
                            onClick={() => onSelectEvent(event)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Upravit aktivitu"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Opravdu chcete smazat aktivitu "${event.title}"?`)) {
                                onDeleteEvent(event.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Smazat aktivitu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
