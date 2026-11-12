import { EventCategory } from '../types/calendar.ts';

export interface CategoryMeta {
  id: EventCategory;
  label: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}

export const CATEGORIES: Record<EventCategory, CategoryMeta> = {
  skola: {
    id: 'skola',
    label: 'Škola & kroužky',
    badgeBg: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
    dotColor: '#0284c7'
  },
  sport: {
    id: 'sport',
    label: 'Sport & tréninky',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: '#16a34a'
  },
  prace: {
    id: 'prace',
    label: 'Práce & schůzky',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    dotColor: '#475569'
  },
  zdravi: {
    id: 'zdravi',
    label: 'Lékař & zdraví',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: '#e11d48'
  },
  volny_cas: {
    id: 'volny_cas',
    label: 'Volný čas & výlety',
    badgeBg: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    dotColor: '#9333ea'
  },
  domacnost: {
    id: 'domacnost',
    label: 'Domácnost & nákup',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: '#d97706'
  },
  oslava: {
    id: 'oslava',
    label: 'Oslavy & rodina',
    badgeBg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    dotColor: '#4f46e5'
  }
};
