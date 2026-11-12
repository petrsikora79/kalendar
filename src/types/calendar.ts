export interface FamilyMember {
  id: string; // 'tata' | 'mama' | 'syn' | 'dcera'
  name: string;
  roleTitle: string; // např. "Táta", "Máma", "Syn", "Dcera"
  color: string; // hex color code
  bgLight: string; // tailwind class or hex
  textColor: string;
  avatar: string; // emoji or icon
  initials: string;
  email?: string;
  phone?: string;
}

export type EventCategory = 
  | 'skola'
  | 'sport'
  | 'prace'
  | 'zdravi'
  | 'volny_cas'
  | 'domacnost'
  | 'oslava';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  isAllDay: boolean;
  memberIds: string[]; // ['tata'] or ['syn', 'dcera'] or ['all']
  category: EventCategory;
  transport?: {
    driverId?: string; // who drives / picks up
    note?: string; // e.g. "Vyzvednout před školou"
  };
  reminderMinutes?: number; // e.g. 30, 60
  repeat?: 'none' | 'weekly' | 'biweekly' | 'monthly';
  createdAt: string;
}

export interface FamilyTask {
  id: string;
  title: string;
  assignedMemberId: string; // member id or 'all'
  dueDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  category?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface DailyMeal {
  date: string; // YYYY-MM-DD
  lunch?: string;
  dinner?: string;
  cookMemberId?: string; // who cooks
}

export interface FamilyCalendarData {
  members: FamilyMember[];
  events: CalendarEvent[];
  tasks: FamilyTask[];
  meals: Record<string, DailyMeal>; // date => meal
}
