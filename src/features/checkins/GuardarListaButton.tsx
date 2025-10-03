// src/features/checkins/GuardarListaButton.tsx
import { useState } from 'react';
import { buildPayload } from './buildPayload';
import { postLista } from '../../api/client';
import type { ParserDetalle } from './buildPayload';

export function GuardarListaButton({
  file,
  fechaISO,
  detallesParser,
  onSaved,
}: {
  file: File;
  fechaISO: string;              // ej: '2025-09-28'
  detallesParser: ParserDetalle[];
  onSaved?: (resp: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true); setErr(null);
      const payload = await buildPayload(file, fechaISO, detallesParser);
      const resp = await postLista(payload);
      onSaved?.(resp);
      // TODO: toast éxito
    } catch (e: any) {
      // Manejo especial de duplicado
      if (String(e.message).includes('409')) {
        setErr('Este PDF ya fue guardado (checksum duplicado).');
      } else {
        setErr(e.message || 'Error al guardar');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
        onClick={handleSave}
        disabled={loading || !file || !fechaISO || detallesParser.length === 0}
      >
        {loading ? 'Guardando…' : 'Guardar'}
      </button>
      {err && <span className="text-red-600 text-sm">{err}</span>}
    </div>
  );
}
