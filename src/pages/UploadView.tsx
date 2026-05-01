// src/pages/UploadView.tsx
import { useEffect, useMemo, useState } from "react";
import TableResumen from "../components/TableResumen";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { parsePdfTextAllServices } from "../utils/pdfParser";
import {
  getLateLabel,
  SCHEDULE_LABEL,
  type ScheduleMode,
  type ServiceKey,
} from "../features/checkins/constants";
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

function getVolunteerCount(rows: AreaResumen[]): number {
  return rows.reduce((acc, row) => acc + Number(row.total ?? 0), 0);
}

export default function UploadView() {
  const [byService, setByService] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [], SUN_10A: [], SUN_12P: [], SUN_7P: []
  });
  const [selected, setSelected] = useState<ServiceKey>("SUN_8A");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("winter");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [message, setMessage] = useState<string | null>(null);

  // ⬇️ nuevo: file y fecha para el payload
  const [file, setFile] = useState<File | null>(null);
  const [fechaISO, setFechaISO] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");

  const onToggleSort = () => setSortOrder(s => (s === "asc" ? "desc" : "asc"));

  // Recibe TEXTO + FILE desde PdfUploader (¡cambiamos la firma!)
  const handleExtracted = (fullText: string, f: File) => {
    setFile(f);
    setFechaISO(extractFechaFromName(f.name));
    setExtractedText(fullText);
  };

  useEffect(() => {
    if (!extractedText) return;

    const all = parsePdfTextAllServices(extractedText, scheduleMode);
    setByService(all);

    if (getVolunteerCount(all.SUN_8A) > 0) setSelected("SUN_8A");
    else if (getVolunteerCount(all.SUN_10A) > 0) setSelected("SUN_10A");
    else if (getVolunteerCount(all.SUN_12P) > 0) setSelected("SUN_12P");
    else if (getVolunteerCount(all.SUN_7P) > 0) setSelected("SUN_7P");

    const any =
      getVolunteerCount(all.SUN_8A) +
      getVolunteerCount(all.SUN_10A) +
      getVolunteerCount(all.SUN_12P) +
      getVolunteerCount(all.SUN_7P) > 0;

    setMessage(any ? null : "No se encontraron voluntarios en los horarios.");
  }, [extractedText, scheduleMode]);

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
      SUN_8A: getVolunteerCount(byService.SUN_8A ?? []),
      SUN_10A: getVolunteerCount(byService.SUN_10A ?? []),
      SUN_12P: getVolunteerCount(byService.SUN_12P ?? []),
      SUN_7P: getVolunteerCount(byService.SUN_7P ?? []),
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
            <div className="inline-flex rounded-lg border bg-white shadow-sm overflow-hidden">
              {(["summer", "winter"] as ScheduleMode[]).map((mode, index) => {
                const active = scheduleMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setScheduleMode(mode)}
                    className={[
                      "px-4 py-2 text-sm font-medium",
                      index > 0 ? "border-l" : "",
                      active ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {SCHEDULE_LABEL[mode]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-4 flex justify-center">
          <ServicePicker
            value={selected}
            onChange={setSelected}
            scheduleMode={scheduleMode}
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
            lateLabel={getLateLabel(selected, scheduleMode)}
            sourceFile={file}
            fechaISO={fechaISO}
            onFechaChange={setFechaISO} 
            toParserDetalles={toParserDetalles}
            onSaved={() => alert("✅ Guardado")}
            disableSave={selected === "SUN_7P"}
          />
        </div>
      </div>
    </div>
  );
}
