// src/utils/textFormatter.ts
export type TextFormat = 'capitalize' | 'lowercase' | 'uppercase';

export const FORMAT_LABEL: Record<TextFormat, string> = {
  capitalize: 'Aa (Primera letra)',
  lowercase: 'aa (minúscula)',
  uppercase: 'AA (MAYÚSCULA)',
};

/**
 * Aplica formato al texto.
 * - capitalize: primera letra de cada palabra en mayúscula, resto en minúscula.
 * - lowercase: todo en minúscula.
 * - uppercase: todo en mayúscula.
 */
export function applyTextFormat(text: string, format: TextFormat): string {
  const safe = (text ?? '').trim();

  switch (format) {
    case 'lowercase':
      return safe.toLowerCase();

    case 'uppercase':
      return safe.toUpperCase();

    case 'capitalize':
    default:
      // Capitaliza cada palabra respetando espacios múltiples
      return safe
        .toLowerCase()
        .replace(/\p{L}+/gu, (word) => word[0].toUpperCase() + word.slice(1));
  }
}

/** Devuelve el siguiente formato en el ciclo botón → botón → botón */
export function cycleFormat(current: TextFormat): TextFormat {
  const order: TextFormat[] = ['capitalize', 'lowercase', 'uppercase'];
  const i = order.indexOf(current);
  return order[(i + 1) % order.length];
}
