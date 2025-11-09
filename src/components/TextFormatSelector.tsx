// src/components/TextFormatSelector.tsx
import React from 'react';
import { type TextFormat, FORMAT_LABEL, cycleFormat } from '../utils/textFormatter';

type Props = {
  value: TextFormat;
  onChange: (next: TextFormat) => void;
  /** Si prefieres sólo ciclo por botón, deja true (default). */
  mode?: 'button-only' | 'button+select';
};

export default function TextFormatSelector({ value, onChange, mode = 'button-only' }: Props) {
  const handleClick = () => onChange(cycleFormat(value));

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button type="button" onClick={handleClick}>
        Formato: {FORMAT_LABEL[value]}
      </button>

      {mode === 'button+select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TextFormat)}
          aria-label="Seleccionar formato"
        >
          <option value="capitalize">{FORMAT_LABEL.capitalize}</option>
          <option value="lowercase">{FORMAT_LABEL.lowercase}</option>
          <option value="uppercase">{FORMAT_LABEL.uppercase}</option>
        </select>
      )}
    </div>
  );
}
