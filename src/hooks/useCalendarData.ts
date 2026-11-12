import { useState, useEffect, useCallback } from 'react';
import { FamilyCalendarData, CalendarEvent, FamilyMember, FamilyTask, DailyMeal } from '../types/calendar.ts';

export function useCalendarData() {
  const [data, setData] = useState<FamilyCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial fetch
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar');
      if (!res.ok) throw new Error('Nepodařilo se načíst data kalendáře');
      const json: FamilyCalendarData = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError('Chyba při stahování dat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Setup Server-Sent Events (SSE) for multi-device real-time sync
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onmessage = (event) => {
        try {
          const freshData: FamilyCalendarData = JSON.parse(event.data);
          setData(freshData);
          setIsSyncing(true);
          setTimeout(() => setIsSyncing(false), 800);
        } catch (e) {
          console.error('Chyba při parsování SSE:', e);
        }
      };
      eventSource.onerror = () => {
        // Fallback polling if SSE is not active
        eventSource?.close();
      };
    } catch {
      // ignore
    }

    // Polling interval fallback every 8 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 8000);

    return () => {
      eventSource?.close();
      clearInterval(interval);
    };
  }, [fetchData]);

  const addEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (!res.ok) throw new Error('Chyba při ukládání aktivity');
      const saved: CalendarEvent = await res.json();
      setData((prev) => (prev ? { ...prev, events: [...prev.events, saved] } : prev));
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Chyba při úpravě aktivity');
      const updated: CalendarEvent = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              events: prev.events.map((e) => (e.id === id ? updated : e))
            }
          : prev
      );
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Chyba při mazání aktivity');
      setData((prev) =>
        prev
          ? {
              ...prev,
              events: prev.events.filter((e) => e.id !== id)
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateMember = async (id: string, updates: Partial<FamilyMember>) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Chyba při úpravě člena');
      const updated: FamilyMember = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((m) => (m.id === id ? updated : m))
            }
          : prev
      );
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addTask = async (taskData: Partial<FamilyTask>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Chyba při přidávání úkolu');
      const saved: FamilyTask = await res.json();
      setData((prev) => (prev ? { ...prev, tasks: [...prev.tasks, saved] } : prev));
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Chyba při přepínání úkolu');
      const updated: FamilyTask = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) => (t.id === id ? updated : t))
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.filter((t) => t.id !== id)
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateMeal = async (meal: DailyMeal) => {
    try {
      const res = await fetch('/api/meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal)
      });
      if (!res.ok) throw new Error('Chyba při ukládání jídelníčku');
      const saved: DailyMeal = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              meals: {
                ...prev.meals,
                [saved.date]: saved
              }
            }
          : prev
      );
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    isSyncing,
    refetch: fetchData,
    addEvent,
    updateEvent,
    deleteEvent,
    updateMember,
    addTask,
    toggleTask,
    deleteTask,
    updateMeal
  };
}
