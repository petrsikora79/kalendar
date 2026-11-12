import React from 'react';
import { FamilyMember, CalendarEvent } from '../types/calendar.ts';
import { Users, Check } from 'lucide-react';

interface MemberFilterBarProps {
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onSelectMember: (id: string | 'all') => void;
  events: CalendarEvent[];
  activeWriterId: string;
  onChangeWriter: (id: string) => void;
}

export const MemberFilterBar: React.FC<MemberFilterBarProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  events,
  activeWriterId,
  onChangeWriter
}) => {
  // Count events for each member
  const getEventCount = (memberId: string | 'all') => {
    if (memberId === 'all') return events.length;
    return events.filter((e) => e.memberIds.includes(memberId) || e.memberIds.includes('all')).length;
  };

  return (
    <div className="bg-white border-b border-slate-200 py-2.5 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Filter by family member with 44px touch targets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {/* All members option */}
          <button
            onClick={() => onSelectMember('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border min-h-[44px] ${
              selectedMemberId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 active:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Celá rodina</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                selectedMemberId === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {getEventCount('all')}
            </span>
          </button>

          {/* Individual 4 members */}
          {members.map((member) => {
            const isSelected = selectedMemberId === member.id;
            const count = getEventCount(member.id);

            return (
              <button
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border min-h-[44px] ${
                  isSelected
                    ? 'shadow-xs border-transparent text-white'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isSelected ? member.color : undefined,
                  borderColor: isSelected ? member.color : undefined
                }}
              >
                <span className="text-base leading-none">{member.avatar}</span>
                <span>{member.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                    isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Active user selector (Kdo zrovna zapisuje) */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 text-xs">
          <span className="text-slate-500 whitespace-nowrap text-[11px] font-medium">
            Právě píše:
          </span>
          <div className="relative inline-block">
            <select
              value={activeWriterId}
              onChange={(e) => onChangeWriter(e.target.value)}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 pl-2.5 pr-7 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none min-h-[36px]"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name} ({m.roleTitle})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <Check className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
