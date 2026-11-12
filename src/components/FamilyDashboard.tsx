import React, { useState } from 'react';
import { CalendarEvent, FamilyMember, FamilyTask, DailyMeal } from '../types/calendar.ts';
import { formatDateCzech, getTodayStr, getWeekDays } from '../utils/dateUtils.ts';
import { Utensils, CheckSquare, Car, Download, Printer, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface FamilyDashboardProps {
  events: CalendarEvent[];
  members: FamilyMember[];
  tasks: FamilyTask[];
  meals: Record<string, DailyMeal>;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, assignedMemberId: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateMeal: (date: string, lunch: string, dinner: string, cookMemberId: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  events,
  members,
  tasks,
  meals,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateMeal,
  onSelectEvent
}) => {
  const todayStr = getTodayStr();
  const currentWeekDays = getWeekDays(todayStr);

  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMember, setNewTaskMember] = useState(members[0]?.id || 'all');

  // Meal edit state
  const [editingMealDate, setEditingMealDate] = useState<string | null>(null);
  const [mealLunch, setMealLunch] = useState('');
  const [mealDinner, setMealDinner] = useState('');
  const [mealCook, setMealCook] = useState('mama');

  const startEditMeal = (dateStr: string) => {
    const existing = meals[dateStr] || { date: dateStr, lunch: '', dinner: '', cookMemberId: 'mama' };
    setMealLunch(existing.lunch || '');
    setMealDinner(existing.dinner || '');
    setMealCook(existing.cookMemberId || 'mama');
    setEditingMealDate(dateStr);
  };

  const saveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMealDate) return;
    onUpdateMeal(editingMealDate, mealLunch, mealDinner, mealCook);
    setEditingMealDate(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskMember);
    setNewTaskTitle('');
  };

  // Today's events
  const todayEvents = events.filter(
    (e) => e.startDate <= todayStr && e.endDate >= todayStr
  );

  // Today's rides/transports
  const todayTransports = todayEvents.filter((e) => e.transport?.note || e.transport?.driverId);

  return (
    <div className="space-y-6">
      {/* Top Banner: Today's Family Quick Highlights */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
              Dnešní rodinný přehled
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              {formatDateCzech(todayStr)}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Dnes jsou naplánovány <strong className="text-white">{todayEvents.length} aktivity</strong> a{' '}
              <strong className="text-white">{todayTransports.length} odvozy kroužků</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/ics"
              download="rodinny-kalendar.ics"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
              title="Stáhnout kalendář pro synchronizaci s telefonem"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .iCal</span>
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
              title="Vytisknout přehled na lednici"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Tisk na lednici</span>
            </button>
          </div>
        </div>

        {/* Transportation cards */}
        {todayTransports.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayTransports.map((e) => {
              const driver = members.find((m) => m.id === e.transport?.driverId);
              return (
                <div
                  key={e.id}
                  onClick={() => onSelectEvent(e)}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-xs p-3 rounded-xl border border-white/10 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                    <Car className="w-3.5 h-3.5" />
                    <span>{e.title}</span>
                    <span className="font-mono text-slate-300 ml-auto tabular-nums">{e.startTime}</span>
                  </div>
                  <div className="text-xs text-white mt-1 leading-snug">
                    {e.transport?.note || `Odvoz zajišťuje ${driver?.name || 'rodina'}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-Column Split: Meals & Chores/Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Weekly Family Meals (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Týdenní rodinný jídelníček
                </h3>
                <span className="text-[11px] text-slate-500">
                  Co vaříme tento týden k obědu a večeři
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {currentWeekDays.map((day) => {
              const meal = meals[day.dateStr] || { date: day.dateStr, lunch: '', dinner: '', cookMemberId: '' };
              const cook = members.find((m) => m.id === meal.cookMemberId);
              const isToday = day.dateStr === todayStr;

              return (
                <div
                  key={day.dateStr}
                  className={`p-3.5 sm:px-5 flex items-start justify-between gap-3 transition-colors ${
                    isToday ? 'bg-indigo-50/25' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-24 shrink-0">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                      {day.dayNameShort} {day.dayNumber}.
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-indigo-600 font-bold block">
                        Dnes
                      </span>
                    )}
                  </div>

                  <div className="flex-1 text-xs space-y-1">
                    <div>
                      <span className="text-slate-400 font-medium mr-1.5">Oběd:</span>
                      <span className="text-slate-800 font-medium">
                        {meal.lunch || <span className="text-slate-400 italic">Neuvedeno</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium mr-1.5">Večeře:</span>
                      <span className="text-slate-800 font-medium">
                        {meal.dinner || <span className="text-slate-400 italic">Neuvedeno</span>}
                      </span>
                    </div>
                    {cook && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span>Šéfkuchař:</span>
                        <span>{cook.avatar} {cook.name}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => startEditMeal(day.dateStr)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 self-center"
                  >
                    Upravit
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Family Tasks & Chores (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rodinné úkoly & služby
                </h3>
                <span className="text-[11px] text-slate-500">
                  Kdo má dnes vyvenčit psa, vyklidit myčku...
                </span>
              </div>
            </div>
          </div>

          {/* Quick add task form */}
          <form onSubmit={handleCreateTask} className="p-3.5 bg-slate-50/75 border-b border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Nový úkol (např. vynést koš)..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newTaskMember}
              onChange={(e) => setNewTaskMember(e.target.value)}
              aria-label="Přiřadit úkol členovi rodiny"
              className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">Všichni</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shrink-0"
              title="Přidat úkol"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Tasks list */}
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Žádné aktivní rodinné úkoly. Skvělá práce!
              </div>
            ) : (
              tasks.map((task) => {
                const assigned = members.find((m) => m.id === task.assignedMemberId);

                return (
                  <div
                    key={task.id}
                    className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                      task.isCompleted ? 'bg-slate-50/40 text-slate-400' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          task.isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-indigo-600 bg-white'
                        }`}
                      >
                        {task.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <span
                          className={`text-xs block truncate ${
                            task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          {assigned ? (
                            <span>{assigned.avatar} {assigned.name}</span>
                          ) : (
                            <span>👨‍👩‍👧‍👦 Celá rodina</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors shrink-0"
                      title="Smazat úkol"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Meal edit modal */}
      {editingMealDate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Upravit jídelníček: {formatDateCzech(editingMealDate)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Zapište plánovaný oběd a večeři pro rodinu.
            </p>

            <form onSubmit={saveMeal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Oběd
                </label>
                <input
                  type="text"
                  value={mealLunch}
                  onChange={(e) => setMealLunch(e.target.value)}
                  placeholder="např. Kuřecí vývar a rizoto"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Večeře
                </label>
                <input
                  type="text"
                  value={mealDinner}
                  onChange={(e) => setMealDinner(e.target.value)}
                  placeholder="např. Pečené brambory se sýrem"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kdo vaří / má na starosti
                </label>
                <select
                  value={mealCook}
                  onChange={(e) => setMealCook(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Společně / Objednávka</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.avatar} {m.name} ({m.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMealDate(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Uložit jídelníček
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
