// src/pages/UploadView.tsx
import { useEffect, useMemo, useState } from "react";
import TableResumen from "../components/TableResumen";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { parsePdfTextAllServices } from "../utils/pdfParser";
import { LATE_LABEL, type ServiceKey } from "../features/checkins/constants";
import { ServicePicker } from "../components/ServicePicker";
import type { ParserDetalle } from "../features/checkins/buildPayload";
import { DEMO, DEMO_PDF_URL, DEMO_PDF_NAME } from "../config/demo";



function extractFechaFromName(name: string): string {
  // busca YYYY-MM-DD en el nombre del archivo; si no, hoy
  const m = name.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : new Date().toISOString().slice(0, 10);
}

// mapea AreaResumen[] -> ParserDetalle[]
function toParserDetalles(rows: AreaResumen[]): ParserDetalle[] {
  return rows.map((r) => ({
    area: r.area,
    total_voluntarios: r.total,
    post_vios: r.lateCount,
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

  const [file, setFile] = useState<File | null>(null);
  const [fechaISO, setFechaISO] = useState<string>("");

  const onToggleSort = () => setSortOrder(s => (s === "asc" ? "desc" : "asc"));

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
      if (text && file) handleExtracted(text, file);
    }
    window.addEventListener("pdf:extracted", onPdfExtracted as EventListener);
    return () => window.removeEventListener("pdf:extracted", onPdfExtracted as EventListener);
  }, []);

  // ⬇️ DEMO: precarga de “PDF” (texto extraído) al montar
  useEffect(() => {
    if (!DEMO || !DEMO_PDF_URL) return;

    (async () => {
      try {
        const resp = await fetch(DEMO_PDF_URL);
        const text = await resp.text();
        // Creamos un File con mimetype de PDF y un nombre con fecha:
        const fauxFile = new File([text], DEMO_PDF_NAME, { type: 'application/pdf' });
        handleExtracted(text, fauxFile);
      } catch (e) {
        console.warn('No se pudo precargar demo PDF:', e);
        setMessage('No se pudo precargar el archivo demo.');
      }
    })();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
      <div className="w-full">
        <div className="mx-auto max-w-3xl transition-all duration-300 motion-safe:animate-[fadein_200ms_ease-out]">
          <div className="mb-4 flex justify-center">
            <ServicePicker
              value={selected}
              onChange={setSelected}
              counts={counts}
              className="justify-center"
            />
          </div>

          {message && <div className="text-center text-rose-600 font-semibold mt-2">{message}</div>}

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
