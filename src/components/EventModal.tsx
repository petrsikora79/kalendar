import React, { useState, useEffect } from 'react';
import { CalendarEvent, FamilyMember, EventCategory } from '../types/calendar.ts';
import { CATEGORIES } from '../utils/categories.ts';
import { X, Clock, MapPin, Car, AlertTriangle, Users, Trash2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: CalendarEvent | null;
  defaultDate?: string;
  defaultMemberId?: string;
  members: FamilyMember[];
  onSave: (eventData: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  defaultDate,
  defaultMemberId,
  members,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('15:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(['all']);
  const [category, setCategory] = useState<EventCategory>('volny_cas');
  const [hasTransport, setHasTransport] = useState(false);
  const [driverId, setDriverId] = useState('tata');
  const [transportNote, setTransportNote] = useState('');
  const [repeat, setRepeat] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setLocation(eventToEdit.location || '');
      setStartDate(eventToEdit.startDate);
      setStartTime(eventToEdit.startTime || '12:00');
      setEndDate(eventToEdit.endDate || eventToEdit.startDate);
      setEndTime(eventToEdit.endTime || '13:00');
      setIsAllDay(Boolean(eventToEdit.isAllDay));
      setSelectedMemberIds(eventToEdit.memberIds || ['all']);
      setCategory(eventToEdit.category || 'volny_cas');
      if (eventToEdit.transport) {
        setHasTransport(true);
        setDriverId(eventToEdit.transport.driverId || 'tata');
        setTransportNote(eventToEdit.transport.note || '');
      } else {
        setHasTransport(false);
        setDriverId('tata');
        setTransportNote('');
      }
      setRepeat(eventToEdit.repeat || 'none');
    } else {
      // New event
      const initialDate = defaultDate || '2026-11-11';
      setTitle('');
      setDescription('');
      setLocation('');
      setStartDate(initialDate);
      setStartTime('15:00');
      setEndDate(initialDate);
      setEndTime('16:00');
      setIsAllDay(false);
      setSelectedMemberIds(defaultMemberId && defaultMemberId !== 'all' ? [defaultMemberId] : ['all']);
      setCategory('skola');
      setHasTransport(false);
      setDriverId('tata');
      setTransportNote('');
      setRepeat('none');
    }
    setError(null);
  }, [eventToEdit, defaultDate, defaultMemberId, isOpen]);

  if (!isOpen) return null;

  const toggleMember = (memberId: string) => {
    if (memberId === 'all') {
      setSelectedMemberIds(['all']);
      return;
    }

    let next = selectedMemberIds.filter((id) => id !== 'all');
    if (next.includes(memberId)) {
      next = next.filter((id) => id !== memberId);
    } else {
      next.push(memberId);
    }

    if (next.length === 0) {
      setSelectedMemberIds(['all']);
    } else {
      setSelectedMemberIds(next);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vyplňte prosím název aktivity');
      return;
    }
    if (!startDate) {
      setError('Vyplňte prosím datum začátku');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        startDate,
        startTime: isAllDay ? undefined : startTime,
        endDate: endDate || startDate,
        endTime: isAllDay ? undefined : endTime,
        isAllDay,
        memberIds: selectedMemberIds,
        category,
        transport: hasTransport
          ? {
              driverId,
              note: transportNote.trim() || undefined
            }
          : undefined,
        repeat
      });
      onClose();
    } catch {
      setError('Nastala chyba při ukládání aktivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToEdit || !onDelete) return;
    if (confirm(`Opravdu chcete smazat aktivitu "${eventToEdit.title}"?`)) {
      setIsSubmitting(true);
      try {
        await onDelete(eventToEdit.id);
        onClose();
      } catch {
        setError('Chyba při mazání.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {eventToEdit ? 'Upravit aktivitu' : 'Nová rodinná aktivita'}
            </h3>
            <span className="text-xs text-slate-500">
              Online zápis pro synchronizaci celé rodiny
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Název aktivity *
            </label>
            <input
              type="text"
              required
              placeholder="např. Trénink florbalu, Klavír, Zubař, Společný nákup..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Member Multi-Select Avatars */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Kdo se účastní?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => toggleMember('all')}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  selectedMemberIds.includes('all')
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Celá rodina</span>
              </button>

              {members.map((m) => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all text-left ${
                      isSelected
                        ? 'shadow-2xs text-white border-transparent'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    style={{
                      backgroundColor: isSelected ? m.color : undefined
                    }}
                  >
                    <span>{m.avatar}</span>
                    <span className="truncate">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Datum začátku *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || endDate < e.target.value) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Datum konce
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 tabular-nums"
              />
            </div>
          </div>

          {/* All day toggle & time inputs */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Celodenní aktivita (bez konkrétního času)</span>
              </label>
            </div>

            {!isAllDay && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Čas začátku</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Čas konce</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category & Repeat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Kategorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Opakování
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="none">Jednorázová aktivita</option>
                <option value="weekly">Každý týden (stejný den)</option>
                <option value="biweekly">Každé 2 týdny</option>
                <option value="monthly">Každý měsíc</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Místo konání
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="např. ZŠ hala, ZUŠ učebna 12, Poliklinika..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Transportation Accordion / Section */}
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-2">
            <label className="text-xs font-semibold text-amber-900 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasTransport}
                onChange={(e) => setHasTransport(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <Car className="w-3.5 h-3.5 text-amber-700" />
              <span>Potřebuje odvoz / vyzvednutí dětí</span>
            </label>

            {hasTransport && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-amber-900 block mb-1 font-medium">Kdo veze / vyzvedává</span>
                    <select
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-amber-300 bg-white text-slate-800"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.avatar} {m.name} ({m.roleTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-900 block mb-1 font-medium">Poznámka k odvozu</span>
                    <input
                      type="text"
                      placeholder="např. Odveze v 15:15 před halu"
                      value={transportNote}
                      onChange={(e) => setTransportNote(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-amber-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description / Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Poznámka / Co vzít s sebou
            </label>
            <textarea
              rows={2}
              placeholder="např. Vzít s sebou sálovou obuv, pití a 200 Kč na členský příspěvek..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {eventToEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Smazat</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-xs"
              >
                {isSubmitting ? 'Ukládám...' : eventToEdit ? 'Uložit změny' : 'Zapsat do kalendáře'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
