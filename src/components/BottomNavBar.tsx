import React from 'react';
import { Calendar, Clock, LayoutGrid, Utensils, Share2, Plus } from 'lucide-react';
import { CalendarViewType } from './Header.tsx';

interface BottomNavBarProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onOpenNewEvent: () => void;
  onOpenShareModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onViewChange,
  onOpenNewEvent,
  onOpenShareModal
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {/* Tab 1: Týden (Primary / Default) */}
        <button
          onClick={() => onViewChange('week')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentView === 'week' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Týden</span>
        </button>

        {/* Tab 2: Dnes */}
        <button
          onClick={() => onViewChange('day')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentView === 'day' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Dnes</span>
        </button>

        {/* Tab 3: Center FAB: + Zapsat */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenNewEvent}
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-md transition-transform"
            aria-label="Přidat aktivitu"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 4: Nástěnka */}
        <button
          onClick={() => onViewChange('dashboard')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentView === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Nástěnka</span>
        </button>

        {/* Tab 5: Měsíc / Sdílet */}
        <button
          onClick={() => onViewChange('month')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentView === 'month' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Měsíc</span>
        </button>
      </div>
    </nav>
  );
};
