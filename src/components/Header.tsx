import React from 'react';
import { Calendar, Plus, Share2, Users, RefreshCw } from 'lucide-react';

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda' | 'dashboard';

interface HeaderProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onOpenNewEvent: () => void;
  onOpenShareModal: () => void;
  onOpenMembersModal: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenNewEvent,
  onOpenShareModal,
  onOpenMembersModal,
  isSyncing
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-14 sm:h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Rodinný kalendář
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
                4 členové online
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onViewChange('week')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentView === 'week'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Týden rodiny
            </button>
            <button
              onClick={() => onViewChange('day')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentView === 'day'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Den & odvozy
            </button>
            <button
              onClick={() => onViewChange('month')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentView === 'month'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Měsíc
            </button>
            <button
              onClick={() => onViewChange('agenda')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentView === 'agenda'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => onViewChange('dashboard')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentView === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Nástěnka & obědy
            </button>
          </nav>

          {/* Zone 3: Primary Action + Utility Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isSyncing && (
              <span className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 tabular-nums">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span className="hidden sm:inline">Ukládání...</span>
              </span>
            )}

            <button
              onClick={onOpenMembersModal}
              title="Nastavit členy rodiny"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Users className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenShareModal}
              title="Sdílet s rodinou (mobilní odkaz & QR)"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap min-h-[40px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sdílet</span>
            </button>

            <button
              onClick={onOpenNewEvent}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-xs whitespace-nowrap min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Nová aktivita</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
