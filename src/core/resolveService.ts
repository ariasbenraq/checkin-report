// src/core/resolveService.ts
import { SERVICE_TIMES, type ServiceTimeConfig } from '../config/serviceTimes';

export function findServiceConfigByHeading(headingText: string): ServiceTimeConfig | null {
  // headingText debería venir como "Grouped by Time: Sunday 8:00a"
  const match = headingText.match(/Grouped by Time:\s*(.+)$/i);
  if (!match) return null;
  const found = SERVICE_TIMES.find(s => s.heading.toLowerCase() === match[1].toLowerCase());
  return found ?? null;
}
