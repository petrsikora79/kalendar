// Czech calendar utilities

export const CZECH_DAYS_FULL = [
  'Neděle',
  'Pondělí',
  'Úterý',
  'Středa',
  'Čtvrtek',
  'Pátek',
  'Sobota'
];

export const CZECH_DAYS_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
export const CZECH_DAYS_WORK_FIRST = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

export const CZECH_MONTHS = [
  'Leden',
  'Únor',
  'Březen',
  'Duben',
  'Květen',
  'Červen',
  'Červenec',
  'Srpen',
  'Září',
  'Říjen',
  'Listopad',
  'Prosinec'
];

export const CZECH_MONTHS_GENITIVE = [
  'ledna',
  'února',
  'března',
  'dubna',
  'května',
  'června',
  'července',
  'srpna',
  'září',
  'října',
  'listopadu',
  'prosince'
];

// Selected Czech namedays / holidays for helpful family context
export const CZECH_NAMEDAYS: Record<string, string> = {
  '11-01': 'Felix',
  '11-02': 'Památka zesnulých',
  '11-03': 'Hubert',
  '11-04': 'Karel',
  '11-05': 'Miriam',
  '11-06': 'Libuše',
  '11-07': 'Bohumír',
  '11-08': 'Bohumil',
  '11-09': 'Bohdan',
  '11-10': 'Evžen',
  '11-11': 'Martin',
  '11-12': 'Benedikt',
  '11-13': 'Tibor',
  '11-14': 'Sáva',
  '11-15': 'Leopold',
  '11-16': 'Otmar',
  '11-17': 'Den boje za svobodu',
  '11-18': 'Romana',
  '11-19': 'Alžběta',
  '11-20': 'Nikola',
  '11-21': 'Albert',
  '11-22': 'Cecílie',
  '11-23': 'Klement',
  '11-24': 'Emílie',
  '11-25': 'Kateřina',
  '11-26': 'Artur',
  '11-27': 'Xenie',
  '11-28': 'René',
  '11-29': 'Radka',
  '11-30': 'Ondřej',
  '12-05': 'Mikuláš',
  '12-24': 'Štědrý den',
  '12-25': '1. svátek vánoční',
  '12-26': '2. svátek vánoční',
  '12-31': 'Silvestr'
};

export function formatDateCzech(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return `${day}. ${CZECH_MONTHS_GENITIVE[month - 1]} ${year}`;
}

export function formatDayTitle(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  const dayName = CZECH_DAYS_FULL[d.getDay()];
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${dayName} ${day}. ${CZECH_MONTHS_GENITIVE[month - 1]} ${year}`;
}

export function getTodayStr(): string {
  // Use anchor date 2026-11-11 or current browser date
  const now = new Date();
  const year = now.getFullYear();
  // Default to 2026-11-11 if matching year 2026
  if (year === 2026) {
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
  return '2026-11-11';
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00');
}

export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate 42 days for 6-row month grid (starting on Monday)
export function getMonthGrid(year: number, monthIndex: number): {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  nameday?: string;
}[] {
  const firstDay = new Date(year, monthIndex, 1);
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  
  // Monday is 1, Sunday is 0 -> in Czech Monday is first (index 0)
  let firstDayOfWeek = firstDay.getDay(); // 0 is Sun, 1 is Mon...
  const startingOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const cells = [];
  const todayStr = getTodayStr();

  // Previous month trailing days
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();
  for (let i = startingOffset - 1; i >= 0; i--) {
    const dNum = prevMonthTotalDays - i;
    const prevDate = new Date(year, monthIndex - 1, dNum);
    const dateStr = toDateString(prevDate);
    const key = `${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: dNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      nameday: CZECH_NAMEDAYS[key]
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, monthIndex, d);
    const dateStr = toDateString(curDate);
    const key = `${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      nameday: CZECH_NAMEDAYS[key]
    });
  }

  // Next month leading days to complete 35 or 42 grid
  const remaining = (7 - (cells.length % 7)) % 7;
  const targetTotal = cells.length + remaining < 35 ? 35 : cells.length + remaining;
  const needed = targetTotal - cells.length;
  for (let d = 1; d <= needed; d++) {
    const nextDate = new Date(year, monthIndex + 1, d);
    const dateStr = toDateString(nextDate);
    const key = `${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      nameday: CZECH_NAMEDAYS[key]
    });
  }

  return cells;
}

// Get the Monday-Sunday week array for any given date
export function getWeekDays(referenceDateStr: string): {
  dateStr: string;
  dayNumber: number;
  dayNameShort: string;
  dayNameFull: string;
  isToday: boolean;
  nameday?: string;
}[] {
  const d = parseDate(referenceDateStr);
  const day = d.getDay(); // 0 is Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const todayStr = getTodayStr();
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const dateStr = toDateString(cur);
    const key = `${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;

    weekDays.push({
      dateStr,
      dayNumber: cur.getDate(),
      dayNameShort: CZECH_DAYS_WORK_FIRST[i],
      dayNameFull: CZECH_DAYS_FULL[cur.getDay()],
      isToday: dateStr === todayStr,
      nameday: CZECH_NAMEDAYS[key]
    });
  }

  return weekDays;
}
