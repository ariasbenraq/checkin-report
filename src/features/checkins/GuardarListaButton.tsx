// src/features/checkins/GuardarListaButton.tsx
import { useState } from 'react';
import { buildPayload } from './buildPayload';
import { postLista } from '../../api/client';
import type { ParserDetalle } from './buildPayload';

type GuardarListaButtonProps = {
  file: File;
  fechaISO: string;              // ej: '2025-09-28'
  detallesParser: ParserDetalle[];
  onSaved?: (resp: any) => void;
  children?: React.ReactNode;    // ⬅️ NUEVO: permite dibujar UI personalizada (IconButton)
};

export function GuardarListaButton({
  file,
  fechaISO,
  detallesParser,
  onSaved,
  children,
}: GuardarListaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const disabled = loading || !file || !fechaISO || detallesParser.length === 0;

  const handleSave = async () => {
    if (disabled) return;
    try {
      setLoading(true); setErr(null);
      const payload = await buildPayload(file, fechaISO, detallesParser);
      const resp = await postLista(payload);
      onSaved?.(resp);
      // TODO: toast éxito
    } catch (e: any) {
      if (String(e?.message ?? '').includes('409')) {
        setErr('Este PDF ya fue guardado (checksum duplicado).');
      } else {
        setErr(e?.message || 'Error al guardar');
      }
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ Si te pasan children, úsalos como “trigger” (ej. IconButton en una toolbar)
  if (children) {
    return (
      <span
        onClick={handleSave}
        role="button"
        aria-disabled={disabled}
        title={disabled ? 'Completa PDF, fecha y detalles' : 'Guardar lista en el servidor'}
        className={`inline-flex items-center ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
      >
        {children}
      </span>
    );
  }

  // ⬇️ Botón por defecto (fallback si no te pasan children)
  return (
    <div className="flex items-center gap-2">
      <button
        className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
        onClick={handleSave}
        disabled={disabled}
      >
        {loading ? 'Guardando…' : 'Guardar'}
      </button>
      {err && <span className="text-red-600 text-sm">{err}</span>}
    </div>
  );
}
