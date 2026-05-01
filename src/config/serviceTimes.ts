// src/config/serviceTimes.ts
export type ServiceKey = 'SUN_8A' | 'SUN_10A' | 'SUN_12P' | 'SUN_7P';

export interface ServiceTimeConfig {
  key: ServiceKey;
  /** Texto exacto que aparece en el PDF después de "Grouped by Time: " */
  heading: string; // e.g., "Sunday 9:00a"
  /** Ventana para el "Total" (inclusive) */
  totalWindow: { from: string; to: string }; // "8:30a" -> "9:00a", etc.
  /** Umbral para "After Vios": strictly after this time */
  afterViosThreshold: string; // e.g., "8:30a"
}

export const SERVICE_TIMES: ServiceTimeConfig[] = [
  {
    key: 'SUN_8A',
    heading: 'Sunday 9:00a',
    totalWindow: { from: '8:30a', to: '9:00a' },
    afterViosThreshold: '8:30a',
  },
  {
    key: 'SUN_10A',
    heading: 'Sunday 11:00a',
    totalWindow: { from: '10:30a', to: '11:00a' },
    afterViosThreshold: '10:30a',
  },
  {
    key: 'SUN_12P',
    heading: 'Sunday 1:00p',
    totalWindow: { from: '12:30p', to: '1:00p' },
    afterViosThreshold: '12:30p',
  },
  {
    key: 'SUN_7P',
    heading: 'Sunday 6:00p',
    totalWindow: { from: '5:30p', to: '6:00p' },
    afterViosThreshold: '5:30p',
  },
];
