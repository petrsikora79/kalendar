import React, { useState } from 'react';
import { FamilyMember } from '../types/calendar.ts';
import { X, Check } from 'lucide-react';

interface MemberSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onUpdateMember: (id: string, updates: Partial<FamilyMember>) => Promise<FamilyMember>;
}

const COLOR_OPTIONS = [
  '#2563EB', // Blue
  '#DB2777', // Pink/Rose
  '#16A34A', // Green
  '#EA580C', // Orange
  '#7C3AED', // Purple
  '#0D9488', // Teal
  '#0284C7', // Sky
  '#DC2626'  // Red
];

const EMOJI_OPTIONS = ['👨‍💼', '👩‍🏫', '👦', '👧', '👨', '👩', '🧑', '⚽', '🎨', '🎸', '🎮', '🏊', '🚴'];

export const MemberSettingsModal: React.FC<MemberSettingsModalProps> = ({
  isOpen,
  onClose,
  members,
  onUpdateMember
}) => {
  const [editingId, setEditingId] = useState<string>(members[0]?.id || 'tata');
  const activeMember = members.find((m) => m.id === editingId) || members[0];

  const [name, setName] = useState(activeMember?.name || '');
  const [roleTitle, setRoleTitle] = useState(activeMember?.roleTitle || '');
  const [avatar, setAvatar] = useState(activeMember?.avatar || '👨‍💼');
  const [color, setColor] = useState(activeMember?.color || '#2563EB');
  const [phone, setPhone] = useState(activeMember?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const switchMember = (m: FamilyMember) => {
    setEditingId(m.id);
    setName(m.name);
    setRoleTitle(m.roleTitle);
    setAvatar(m.avatar);
    setColor(m.color);
    setPhone(m.phone || '');
    setSavedSuccess(false);
  };

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onUpdateMember(editingId, {
        name: name.trim(),
        roleTitle: roleTitle.trim(),
        avatar,
        color,
        phone: phone.trim() || undefined
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Nastavení členů rodiny
            </h3>
            <span className="text-xs text-slate-500">
              Upravte jména, barvy a avatary pro 4 členy rodiny
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member selector tabs */}
        <div className="flex gap-2 my-4 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {members.map((m) => {
            const isCurrent = m.id === editingId;
            return (
              <button
                key={m.id}
                onClick={() => switchMember(m)}
                className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{m.avatar}</span>
                <span className="truncate">{m.name}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Jméno člena
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Role / Popisek
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="např. Táta, Máma, Syn, Dcera..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Avatar selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Avatar (ikona)
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setAvatar(em)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-transform ${
                    avatar === em
                      ? 'border-indigo-600 bg-indigo-50 scale-110 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Color selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Barva v kalendáři
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Telefon (pro rychlé volání odvozu)
            </label>
            <input
              type="text"
              placeholder="+420 777 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-medium">
                ✓ Uloženo pro všechny
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Změny se ihned projeví u všech 4 členů
              </span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Zavřít
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                {isSaving ? 'Ukládám...' : 'Uložit člena'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
