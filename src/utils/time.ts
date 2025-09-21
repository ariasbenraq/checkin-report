// src/utils/time.ts
/**
 * Convierte "7:30a" o "12:00p" a minutos desde 00:00 (0..1439).
 * Soporta "a"/"p" con o sin "m".
 */
export function parse12hToMinutes(t: string): number {
  const s = t.trim().toLowerCase().replace(/\s+/g, '');
  const match = /^(\d{1,2}):?(\d{2})?(a|p)m?$/.exec(s);
  if (!match) throw new Error(`Hora inválida: "${t}"`);
  let [_, hh, mm, ap] = match;
  const H = parseInt(hh, 10);
  const M = mm ? parseInt(mm, 10) : 0;

  if (H < 1 || H > 12 || M < 0 || M > 59) throw new Error(`Hora inválida: "${t}"`);

  // Mapear a 24h
  let hour24 = H % 12;           // 12 → 0
  if (ap === 'p') hour24 += 12;  // PM suma 12
  return hour24 * 60 + M;
}

/** checa si x está en [a, b] inclusivo */
export function inClosedRange(x: number, a: number, b: number): boolean {
  return x >= a && x <= b;
}

/** checa si x está estrictamente después de t */
export function strictlyAfter(x: number, t: number): boolean {
  return x > t;
}
