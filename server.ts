import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { FamilyCalendarData, CalendarEvent, FamilyMember, FamilyTask, DailyMeal } from './src/types/calendar.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'calendar-data.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial 4 family members + realistic events around November 2026
const initialData: FamilyCalendarData = {
  members: [
    {
      id: 'tata',
      name: 'Petr',
      roleTitle: 'Táta',
      color: '#2563EB', // Blue
      bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
      textColor: 'text-blue-700',
      avatar: '👨‍💼',
      initials: 'PS',
      email: 'petr.sikora@zstrikop.cz',
      phone: '+420 777 123 456'
    },
    {
      id: 'mama',
      name: 'Jana',
      roleTitle: 'Máma',
      color: '#DB2777', // Pink/Rose
      bgLight: 'bg-pink-50 text-pink-700 border-pink-200',
      textColor: 'text-pink-700',
      avatar: '👩‍🏫',
      initials: 'JS',
      email: 'jana@rodina.cz',
      phone: '+420 777 654 321'
    },
    {
      id: 'syn',
      name: 'Tomáš',
      roleTitle: 'Syn (12 let)',
      color: '#16A34A', // Green
      bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      textColor: 'text-emerald-700',
      avatar: '👦',
      initials: 'TS',
      email: 'tomas@rodina.cz'
    },
    {
      id: 'dcera',
      name: 'Eliška',
      roleTitle: 'Dcera (9 let)',
      color: '#EA580C', // Amber / Orange
      bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
      textColor: 'text-amber-700',
      avatar: '👧',
      initials: 'ES',
      email: 'eliska@rodina.cz'
    }
  ],
  events: [
    {
      id: 'evt-1',
      title: 'Svatomartinská rodinná večeře',
      description: 'Pečená husa se zelím a bramborovým knedlíkem, svatomartinské rohlíčky',
      location: 'Doma - jídelna',
      startDate: '2026-11-11',
      startTime: '18:30',
      endDate: '2026-11-11',
      endTime: '20:00',
      isAllDay: false,
      memberIds: ['all'],
      category: 'oslava',
      reminderMinutes: 30,
      createdAt: '2026-11-01T10:00:00Z'
    },
    {
      id: 'evt-2',
      title: 'Trénink florbalu',
      description: 'Vzít si sálovky a dres, lahev na pití',
      location: 'Sportovní hala ZŠ',
      startDate: '2026-11-11',
      startTime: '15:30',
      endDate: '2026-11-11',
      endTime: '17:00',
      isAllDay: false,
      memberIds: ['syn'],
      category: 'sport',
      transport: {
        driverId: 'mama',
        note: 'Máma odveze v 15:15, vyzvedne táta po práci'
      },
      reminderMinutes: 60,
      repeat: 'weekly',
      createdAt: '2026-11-02T08:00:00Z'
    },
    {
      id: 'evt-3',
      title: 'Klavír - hudební nauka ZUŠ',
      description: 'Zopakovat etudu a noty z minulé lekce',
      location: 'Základní umělecká škola, učebna 12',
      startDate: '2026-11-11',
      startTime: '16:00',
      endDate: '2026-11-11',
      endTime: '17:00',
      isAllDay: false,
      memberIds: ['dcera'],
      category: 'skola',
      transport: {
        driverId: 'tata',
        note: 'Táta vyzvedne před školou v 15:45'
      },
      reminderMinutes: 45,
      repeat: 'weekly',
      createdAt: '2026-11-02T08:30:00Z'
    },
    {
      id: 'evt-4',
      title: 'Pracovní porada projektového týmu',
      description: 'Prezentace měsíčních výsledků za listopad',
      location: 'Kancelář & Online MS Teams',
      startDate: '2026-11-11',
      startTime: '10:00',
      endDate: '2026-11-11',
      endTime: '11:30',
      isAllDay: false,
      memberIds: ['tata'],
      category: 'prace',
      createdAt: '2026-11-03T12:00:00Z'
    },
    {
      id: 'evt-5',
      title: 'Zubař - preventivní kontrola',
      description: 'MUDr. Nováková - preventivní prohlídka + dentální hygiena',
      location: 'Poliklinika, 3. patro',
      startDate: '2026-11-12',
      startTime: '13:00',
      endDate: '2026-11-12',
      endTime: '14:00',
      isAllDay: false,
      memberIds: ['mama'],
      category: 'zdravi',
      reminderMinutes: 60,
      createdAt: '2026-11-04T09:00:00Z'
    },
    {
      id: 'evt-6',
      title: 'Angličtina - doučování & konverzace',
      description: 'Příprava na pololetní test z gramatiky',
      location: 'Doma (online s lektorkou Kate)',
      startDate: '2026-11-12',
      startTime: '17:30',
      endDate: '2026-11-12',
      endTime: '18:30',
      isAllDay: false,
      memberIds: ['syn'],
      category: 'skola',
      repeat: 'weekly',
      createdAt: '2026-11-04T10:00:00Z'
    },
    {
      id: 'evt-7',
      title: 'Plavecký kroužek - zdokonalovací kurz',
      description: 'Plavky, brýle, ručník, kartička na vstup',
      location: 'Městský plavecký stadion',
      startDate: '2026-11-13',
      startTime: '15:00',
      endDate: '2026-11-13',
      endTime: '16:30',
      isAllDay: false,
      memberIds: ['dcera'],
      category: 'sport',
      transport: {
        driverId: 'mama',
        note: 'Máma počká v kavárně bazénu'
      },
      repeat: 'weekly',
      createdAt: '2026-11-05T09:00:00Z'
    },
    {
      id: 'evt-8',
      title: 'Velký víkendový nákup a trh',
      description: 'Čerstvá zelenina, maso na neděli, suroviny na pečení',
      location: 'Farmářské trhy & Supermarket',
      startDate: '2026-11-13',
      startTime: '17:30',
      endDate: '2026-11-13',
      endTime: '19:00',
      isAllDay: false,
      memberIds: ['tata', 'mama'],
      category: 'domacnost',
      createdAt: '2026-11-05T14:00:00Z'
    },
    {
      id: 'evt-9',
      title: 'Celodenní rodinný výlet: Hrad a naučná stezka',
      description: 'Teplé oblečení, termosky s čajem, svačina do batohu. Vstupenky jsou rezervované.',
      location: 'Hrad Karlštejn & Český kras',
      startDate: '2026-11-14',
      startTime: '09:30',
      endDate: '2026-11-14',
      endTime: '16:30',
      isAllDay: false,
      memberIds: ['all'],
      category: 'volny_cas',
      reminderMinutes: 120,
      createdAt: '2026-11-06T11:00:00Z'
    },
    {
      id: 'evt-10',
      title: 'Nedělní oběd u babičky a dědy',
      description: 'Oslava svátku a společné odpoledne, vzít fotky ze školy',
      location: 'Babička Marie & děda Josef',
      startDate: '2026-11-15',
      startTime: '12:00',
      endDate: '2026-11-15',
      endTime: '16:00',
      isAllDay: false,
      memberIds: ['all'],
      category: 'volny_cas',
      createdAt: '2026-11-06T12:00:00Z'
    },
    {
      id: 'evt-11',
      title: 'Třídní schůzky 7.B',
      description: 'Informace o prospěchu, chování a lyžařském výcviku',
      location: 'ZŠ Tř. Míru, učebna č. 24',
      startDate: '2026-11-16',
      startTime: '17:00',
      endDate: '2026-11-16',
      endTime: '18:30',
      isAllDay: false,
      memberIds: ['mama', 'tata'],
      category: 'skola',
      createdAt: '2026-11-07T08:00:00Z'
    },
    {
      id: 'evt-12',
      title: 'Kroužek robotiky & LEGO mindstorms',
      description: 'Programování autonomního vozítka na soutěž',
      location: 'Dům dětí a mládeže',
      startDate: '2026-11-18',
      startTime: '15:30',
      endDate: '2026-11-18',
      endTime: '17:00',
      isAllDay: false,
      memberIds: ['syn'],
      category: 'skola',
      repeat: 'weekly',
      createdAt: '2026-11-07T09:00:00Z'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Vyvenčit psa Arga před večeří',
      assignedMemberId: 'syn',
      dueDate: '2026-11-11',
      isCompleted: false,
      priority: 'normal'
    },
    {
      id: 'task-2',
      title: 'Vyklidit a naskládat myčku na nádobí',
      assignedMemberId: 'dcera',
      dueDate: '2026-11-11',
      isCompleted: true,
      priority: 'normal'
    },
    {
      id: 'task-3',
      title: 'Zkontrolovat podepsané žákovské knížky',
      assignedMemberId: 'mama',
      dueDate: '2026-11-11',
      isCompleted: true,
      priority: 'high'
    },
    {
      id: 'task-4',
      title: 'Vyměnit žárovku v předsíni',
      assignedMemberId: 'tata',
      dueDate: '2026-11-12',
      isCompleted: false,
      priority: 'low'
    },
    {
      id: 'task-5',
      title: 'Koupit pečivo a svačiny na čtvrtek',
      assignedMemberId: 'tata',
      dueDate: '2026-11-11',
      isCompleted: false,
      priority: 'normal'
    }
  ],
  meals: {
    '2026-11-11': {
      date: '2026-11-11',
      lunch: 'Školní a pracovní jídelna',
      dinner: 'Svatomartinská husa, červené zelí a knedlík',
      cookMemberId: 'mama'
    },
    '2026-11-12': {
      date: '2026-11-12',
      lunch: 'Boloňské špagety se sýrem',
      dinner: 'Dýňový krém s krutony a semínky',
      cookMemberId: 'tata'
    },
    '2026-11-13': {
      date: '2026-11-13',
      lunch: 'Ryba s bramborovou kaší',
      dinner: 'Domácí zapečená pizza (šunka, sýr, kukuřice)',
      cookMemberId: 'all'
    },
    '2026-11-14': {
      date: '2026-11-14',
      lunch: 'Svačinové tousty & termoska polévky na výlet',
      dinner: 'Hovězí guláš s chlebem',
      cookMemberId: 'tata'
    },
    '2026-11-15': {
      date: '2026-11-15',
      lunch: 'Svíčková na smetaně u babičky',
      dinner: 'Lehký zeleninový salát a čerstvé pečivo',
      cookMemberId: 'mama'
    }
  }
};

function readData(): FamilyCalendarData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Chyba při čtení dat kalendáře:', err);
  }
  // If file doesn't exist, save initial
  writeData(initialData);
  return initialData;
}

function writeData(data: FamilyCalendarData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    notifyClients();
  } catch (err) {
    console.error('Chyba při zápisu dat kalendáře:', err);
  }
}

// SSE clients for real-time live synchronization
type SSEClient = { id: number; res: Response };
const clients: SSEClient[] = [];
let clientIdCounter = 0;

function notifyClients() {
  const currentData = readData();
  const payload = `data: ${JSON.stringify(currentData)}\n\n`;
  for (const client of clients) {
    try {
      client.res.write(payload);
    } catch {
      // client may have disconnected
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoints
  app.get('/api/calendar', (_req: Request, res: Response) => {
    const data = readData();
    res.json(data);
  });

  // SSE stream for real-time live updates
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = ++clientIdCounter;
    clients.push({ id: clientId, res });

    // Send initial snapshot
    const data = readData();
    res.write(`data: ${JSON.stringify(data)}\n\n`);

    req.on('close', () => {
      const idx = clients.findIndex((c) => c.id === clientId);
      if (idx !== -1) {
        clients.splice(idx, 1);
      }
    });
  });

  // Create event
  app.post('/api/events', (req: Request, res: Response) => {
    const data = readData();
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: req.body.title || 'Nová rodinná aktivita',
      description: req.body.description || '',
      location: req.body.location || '',
      startDate: req.body.startDate,
      startTime: req.body.startTime || '12:00',
      endDate: req.body.endDate || req.body.startDate,
      endTime: req.body.endTime || '13:00',
      isAllDay: Boolean(req.body.isAllDay),
      memberIds: Array.isArray(req.body.memberIds) && req.body.memberIds.length > 0 ? req.body.memberIds : ['all'],
      category: req.body.category || 'volny_cas',
      transport: req.body.transport || undefined,
      reminderMinutes: req.body.reminderMinutes ? Number(req.body.reminderMinutes) : undefined,
      repeat: req.body.repeat || 'none',
      createdAt: new Date().toISOString()
    };

    data.events.push(newEvent);
    writeData(data);
    res.status(201).json(newEvent);
  });

  // Update event
  app.put('/api/events/:id', (req: Request, res: Response) => {
    const data = readData();
    const eventIndex = data.events.findIndex((e) => e.id === req.params.id);
    if (eventIndex === -1) {
      res.status(404).json({ error: 'Aktivita nenalezena' });
      return;
    }

    const updated = {
      ...data.events[eventIndex],
      ...req.body,
      id: req.params.id // ensure ID remains unchanged
    };

    data.events[eventIndex] = updated;
    writeData(data);
    res.json(updated);
  });

  // Delete event
  app.delete('/api/events/:id', (req: Request, res: Response) => {
    const data = readData();
    const initialLen = data.events.length;
    data.events = data.events.filter((e) => e.id !== req.params.id);

    if (data.events.length === initialLen) {
      res.status(404).json({ error: 'Aktivita nenalezena' });
      return;
    }

    writeData(data);
    res.json({ success: true, deletedId: req.params.id });
  });

  // Update member settings (e.g. rename, change avatar/color)
  app.put('/api/members/:id', (req: Request, res: Response) => {
    const data = readData();
    const memberIndex = data.members.findIndex((m) => m.id === req.params.id);
    if (memberIndex === -1) {
      res.status(404).json({ error: 'Člen rodiny nenalezen' });
      return;
    }

    data.members[memberIndex] = {
      ...data.members[memberIndex],
      ...req.body,
      id: req.params.id
    };

    writeData(data);
    res.json(data.members[memberIndex]);
  });

  // Task / Chore endpoints
  app.post('/api/tasks', (req: Request, res: Response) => {
    const data = readData();
    const newTask: FamilyTask = {
      id: `task-${Date.now()}`,
      title: req.body.title,
      assignedMemberId: req.body.assignedMemberId || 'all',
      dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
      isCompleted: false,
      priority: req.body.priority || 'normal'
    };

    data.tasks.push(newTask);
    writeData(data);
    res.status(201).json(newTask);
  });

  app.patch('/api/tasks/:id/toggle', (req: Request, res: Response) => {
    const data = readData();
    const task = data.tasks.find((t) => t.id === req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Úkol nenalezen' });
      return;
    }

    task.isCompleted = !task.isCompleted;
    writeData(data);
    res.json(task);
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const data = readData();
    data.tasks = data.tasks.filter((t) => t.id !== req.params.id);
    writeData(data);
    res.json({ success: true });
  });

  // Save meal plan
  app.put('/api/meals', (req: Request, res: Response) => {
    const data = readData();
    const { date, lunch, dinner, cookMemberId } = req.body;
    if (!date) {
      res.status(400).json({ error: 'Chybí datum' });
      return;
    }

    data.meals[date] = {
      date,
      lunch: lunch || '',
      dinner: dinner || '',
      cookMemberId: cookMemberId || 'all'
    };

    writeData(data);
    res.json(data.meals[date]);
  });

  // Export iCalendar (.ics) format so family can subscribe in Google Calendar or iPhone
  app.get('/api/export/ics', (_req: Request, res: Response) => {
    const data = readData();
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Rodinny Kalendar//CS',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Rodinný kalendář'
    ];

    for (const event of data.events) {
      const dtStart = event.isAllDay
        ? event.startDate.replace(/-/g, '')
        : `${event.startDate.replace(/-/g, '')}T${(event.startTime || '00:00').replace(':', '')}00`;
      const dtEnd = event.isAllDay
        ? event.endDate.replace(/-/g, '')
        : `${event.endDate.replace(/-/g, '')}T${(event.endTime || '23:59').replace(':', '')}00`;

      const participants = event.memberIds.includes('all')
        ? 'Celá rodina'
        : event.memberIds
            .map((id) => data.members.find((m) => m.id === id)?.name || id)
            .join(', ');

      ics.push('BEGIN:VEVENT');
      ics.push(`UID:${event.id}@rodinnykalendar.cz`);
      ics.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      if (event.isAllDay) {
        ics.push(`DTSTART;VALUE=DATE:${dtStart}`);
        ics.push(`DTEND;VALUE=DATE:${dtEnd}`);
      } else {
        ics.push(`DTSTART:${dtStart}`);
        ics.push(`DTEND:${dtEnd}`);
      }
      ics.push(`SUMMARY:${event.title} (${participants})`);
      if (event.description) ics.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
      if (event.location) ics.push(`LOCATION:${event.location}`);
      ics.push('END:VEVENT');
    }

    ics.push('END:VCALENDAR');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rodinny-kalendar.ics"');
    res.send(ics.join('\r\n'));
  });

  // Mount Vite middleware in development or static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rodinný kalendář server běží na http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Chyba při startu serveru:', err);
});
