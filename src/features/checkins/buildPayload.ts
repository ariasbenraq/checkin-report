// src/features/checkins/buildPayload.ts
import { sha256File } from '../../utils/hashFile';
import type { CreateListaPayload, DetallePayload } from '../../types/api';

export type ParserDetalle = {
  area: string;
  total_voluntarios: number | string;
  post_vios?: number | string;
  observaciones?: string | null;
};

export async function buildPayload(
  file: File,
  fechaISO: string,                // 'YYYY-MM-DD' (del UI o del filename)
  detallesParser: ParserDetalle[],
  estado: CreateListaPayload['estado'] = 'procesado',
  overrideName?: string,
): Promise<CreateListaPayload> {
  const checksum = await sha256File(file);

  const toInt = (v: number | string | undefined | null, def = 0) => {
    if (v == null) return def;
    const s = String(v).replace(/[^\d.-]/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : def;
  };

  const detalles: DetallePayload[] = detallesParser.map((d): DetallePayload => {
    const item: DetallePayload = {
      area: (d.area ?? "").toString().trim(),
      total_voluntarios: toInt(d.total_voluntarios, 0),
      post_vios: toInt(d.post_vios, 0),   // 👈 sin alias, directo
    };

    if (d.observaciones && d.observaciones.trim() !== '') {
      item.observaciones = d.observaciones.trim();
    }
    return item;
  });

  return {
    nombre: (overrideName ?? file.name).toString().trim(),
    fecha: fechaISO,
    estado,
    checksum,
    detalles,
  };
}
