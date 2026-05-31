import type {
  CheckInsEvent,
  CombinedTableResponse,
  EventPeriod,
  TeamCatalogItem,
} from '../types/planning-center';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export function getCheckInsEvents() {
  return apiGet<CheckInsEvent[]>('/check-ins/events');
}

export function getEventPeriods(eventId: number, date: string) {
  const params = new URLSearchParams({ date });
  return apiGet<EventPeriod[]>(
    `/check-ins/events/${eventId}/event-periods?${params.toString()}`
  );
}

export function getTeams(eventId: number) {
  return apiGet<TeamCatalogItem[]>(`/check-ins/events/${eventId}/teams`);
}

export function getCombinedTable(input: {
  eventId: number;
  date?: string;
  eventPeriodId?: number;
  teamId?: number;
}) {
  const params = new URLSearchParams();

  if (input.date) params.set('date', input.date);
  if (input.eventPeriodId) params.set('eventPeriodId', String(input.eventPeriodId));
  if (input.teamId) params.set('teamId', String(input.teamId));

  return apiGet<CombinedTableResponse>(
    `/check-ins/events/${input.eventId}/table/combined?${params.toString()}`
  );
}
