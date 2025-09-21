// src/config/serviceTimes.ts
export type ServiceKey = 'SUN_8A' | 'SUN_10A' | 'SUN_12P';

export interface ServiceTimeConfig {
  key: ServiceKey;
  /** Texto exacto que aparece en el PDF después de "Grouped by Time: " */
  heading: string; // e.g., "Sunday 8:00a"
  /** Ventana para el "Total" (inclusive) */
  totalWindow: { from: string; to: string }; // "7:00a" -> "8:00a", etc.
  /** Umbral para "After Vios": strictly after this time */
  afterViosThreshold: string; // e.g., "7:30a"
}

export const SERVICE_TIMES: ServiceTimeConfig[] = [
  {
    key: 'SUN_8A',
    heading: 'Sunday 8:00a',
    totalWindow: { from: '7:00a', to: '8:00a' },
    afterViosThreshold: '7:30a',
  },
  {
    key: 'SUN_10A',
    heading: 'Sunday 10:00a',
    totalWindow: { from: '9:00a', to: '10:00a' },
    afterViosThreshold: '9:30a',
  },
  {
    key: 'SUN_12P',
    heading: 'Sunday 12:00p',
    totalWindow: { from: '11:00a', to: '12:00p' },
    afterViosThreshold: '11:30a',
  },
];
