// src/pages/UploadView.tsx
import { useEffect, useMemo, useState } from "react";
import TableResumen from "../components/TableResumen";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { parsePdfTextAllServices } from "../utils/pdfParser";
import {  LATE_LABEL, type ServiceKey } from "../features/checkins/constants";
import { ServicePicker } from "../components/ServicePicker";

// ⬇️ imports para guardar
import type { ParserDetalle } from "../features/checkins/buildPayload";


function extractFechaFromName(name: string): string {
  // busca YYYY-MM-DD en el nombre del archivo; si no, hoy
  const m = name.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : new Date().toISOString().slice(0, 10); UploadView
}

// mapea AreaResumen[] -> ParserDetalle[]
function toParserDetalles(rows: AreaResumen[]): ParserDetalle[] {
  return rows.map((r) => ({
    area: r.area,
    total_voluntarios: r.total,      // 👈 ajusta si tu tipo usa otro nombre
    post_vios: r.lateCount,          // 👈 idem (en tu tabla es la col tardíos)
    // observaciones?: (si tuvieses)
  }));
}

export function isoToDisplay(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, y, mm, d] = m;
  return `${d}-${mm}-${y}`;
}

export default function UploadView() {
  const [byService, setByService] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [], SUN_10A: [], SUN_12P: []
  });
  const [selected, setSelected] = useState<ServiceKey>("SUN_8A");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [message, setMessage] = useState<string | null>(null);

  // ⬇️ nuevo: file y fecha para el payload
  const [file, setFile] = useState<File | null>(null);
  const [fechaISO, setFechaISO] = useState<string>("");

  const onToggleSort = () => setSortOrder(s => (s === "asc" ? "desc" : "asc"));

  // Recibe TEXTO + FILE desde PdfUploader (¡cambiamos la firma!)
  const handleExtracted = (fullText: string, f: File) => {
    setFile(f);
    setFechaISO(extractFechaFromName(f.name));

    const all = parsePdfTextAllServices(fullText);
    setByService(all);

    if (all.SUN_8A.length) setSelected("SUN_8A");
    else if (all.SUN_10A.length) setSelected("SUN_10A");
    else if (all.SUN_12P.length) setSelected("SUN_12P");

    const any = all.SUN_8A.length + all.SUN_10A.length + all.SUN_12P.length > 0;
    setMessage(any ? null : "No se encontraron voluntarios en los horarios.");
  };

  // datos para la tabla (ordenados)
  const data = useMemo(() => {
    const arr = byService[selected] ?? [];
    const copy = [...arr];
    copy.sort((a, b) =>
      sortOrder === "asc"
        ? a.area.localeCompare(b.area, "es")
        : b.area.localeCompare(a.area, "es")
    );
    return copy;
  }, [byService, selected, sortOrder]);

  const counts = useMemo(
    () => ({
      SUN_8A: byService.SUN_8A?.length ?? 0,
      SUN_10A: byService.SUN_10A?.length ?? 0,
      SUN_12P: byService.SUN_12P?.length ?? 0,
    }),
    [byService]
  );

   useEffect(() => {
    function onPdfExtracted(e: any) {
      const { text, file } = e.detail || {};
      if (text && file) {
        handleExtracted(text, file);
      }
    }
    window.addEventListener("pdf:extracted", onPdfExtracted as EventListener);
    return () => window.removeEventListener("pdf:extracted", onPdfExtracted as EventListener);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
      {/* Derecha: área principal centrada y con animación sutil */}
      <div className="w-full">
        <div className="mx-auto max-w-3xl transition-all duration-300 motion-safe:animate-[fadein_200ms_ease-out]">
          {/* Fecha editable: solo visible si ya hay archivo */}
          {/* Selector de servicio */}
          <div className="mb-4 flex justify-center">
          <ServicePicker
            value={selected}
            onChange={setSelected}
            counts={counts}
            className="justify-center"
          />
          </div>

          {message && (
            <div className="text-center text-rose-600 font-semibold mt-2">
              {message}
            </div>
          )}

          {message && <div className="text-center text-red-600 font-semibold">{message}</div>}

          <TableResumen
            data={data}
            sortOrder={sortOrder}
            onToggleSort={onToggleSort}
            lateLabel={LATE_LABEL[selected]}
            sourceFile={file}
            fechaISO={fechaISO}
            onFechaChange={setFechaISO} 
            toParserDetalles={toParserDetalles}
            onSaved={() => alert("✅ Guardado")}
          />
        </div>
      </div>
    </div>
  );
}
