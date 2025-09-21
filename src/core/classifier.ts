// src/core/classifier.ts
import { parse12hToMinutes, inClosedRange, strictlyAfter } from '../utils/time';
import type { ServiceTimeConfig } from '../config/serviceTimes';

export interface Arrival {
  // La hora de llegada tal cual la parseas del PDF, p.ej. "7:42a"
  arrivalTimeText: string;
  // ...otros campos de la persona que ya tengas (nombre, área, etc.)
}

export interface Classification {
  totalCount: number;
  afterViosCount: number;
}

/**
 * Dado un conjunto de arrivals de UNA sección (mismo heading del PDF),
 * devuelve el conteo "Total" y "After Vios" según la configuración.
 */
export function classifyArrivalsForService(
  arrivals: Arrival[],
  cfg: ServiceTimeConfig
): Classification {
  const from = parse12hToMinutes(cfg.totalWindow.from);
  const to = parse12hToMinutes(cfg.totalWindow.to);
  const after = parse12hToMinutes(cfg.afterViosThreshold);

  let total = 0;
  let afterVios = 0;

  for (const a of arrivals) {
    const m = parse12hToMinutes(a.arrivalTimeText);
    if (inClosedRange(m, from, to)) {
      total++;
      if (strictlyAfter(m, after)) {
        afterVios++;
      }
    }
  }

  return { totalCount: total, afterViosCount: afterVios };
}
