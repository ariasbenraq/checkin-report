// src/pages/UploadView.tsx
import { useEffect, useMemo, useState } from "react";
import TableResumen from "../components/TableResumen";
import type { AreaResumen } from "../features/checkins/types/resumen";
import {
  extractArrivalTimes,
  computeResumen,
  detectServiceHeadings,
  type DetectedService,
  type TimesBySection,
} from "../utils/pdfParser";
import {
  getLateLabel,
  type ServiceKey,
} from "../features/checkins/constants";
import { ServicePicker } from "../components/ServicePicker";
import { useLocalStorage } from "../hooks/useLocalStorage";
import * as toast from "../lib/toast";


function getVolunteerCount(rows: AreaResumen[] | undefined): number {
  return (rows ?? []).reduce((acc, row) => acc + Number(row.total ?? 0), 0);
}

function parseTimeToMinutes(value: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return NaN;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 23 || mm > 59) return NaN;
  return hh * 60 + mm;
}

function toHHMM(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function minutesToLabel(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const ap = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ap}`;
}

function minutesToLateLabel(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const ap = hh >= 12 ? "pm" : "am";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")}${ap}`;
}

function formatDetectedHeading(heading: string): string {
  const m = /Sunday\s+(\d{1,2}:\d{2})([ap])/i.exec(heading);
  if (!m) return heading;
  const ap = m[2].toLowerCase() === "p" ? "p.m." : "a.m.";
  return `Domingo ${m[1]} ${ap}`;
}

// Opciones del combo para el corte VIOS manual de Punto ("" = automático por encabezado)
const VIOS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Auto (por defecto)" },
];
for (let m = 17 * 60 + 30; m <= 20 * 60; m += 15) {
  VIOS_OPTIONS.push({ value: toHHMM(m), label: minutesToLabel(m) });
}

export default function UploadView() {
  const [byService, setByService] = useLocalStorage<Record<ServiceKey, AreaResumen[]>>(
    "checkin:byService",
    { SUN_8A: [], SUN_10A: [], SUN_12P: [], SUN_5P: [], SUN_8P: [] }
  );
  const [selected, setSelected] = useLocalStorage<ServiceKey>("checkin:selected", "SUN_8A");
  const [message, setMessage] = useState<string | null>(null);

  const [extractedText, setExtractedText] = useLocalStorage<string>("checkin:extractedText", "");

  // Corte VIOS manual para Punto: "" = automático (default del encabezado detectado)
  const [appliedViosRaw, setAppliedVios] = useLocalStorage<string | null>("checkin:viosPunto", "");
  const appliedVios = appliedViosRaw ?? "";
  // Valor en el combo (pendiente de aplicar con el botón)
  const [draftVios, setDraftVios] = useState<string>(appliedVios);
  // Horas de llegada extraídas del PDF (se parsea UNA vez; el corte se recalcula sin reprocesar)
  const [rawTimes, setRawTimes] = useState<TimesBySection | null>(null);

  // Servicio Punto detectado en el PDF (7:00p o 8:00p)
  const detectedPunto = useMemo<DetectedService | null>(() => {
    if (!extractedText) return null;
    return detectServiceHeadings(extractedText).find((s) => s.key === "SUN_8P") ?? null;
  }, [extractedText]);

  // Etiqueta dinámica del encabezado de la tabla: refleja la hora de VIOS aplicada
  const puntoLateLabel = useMemo(() => {
    if (appliedVios) {
      return `Llegaron después de ${minutesToLateLabel(parseTimeToMinutes(appliedVios))}`;
    }
    if (detectedPunto) {
      return `Llegaron después de ${minutesToLateLabel(detectedPunto.afterViosMinutes)}`;
    }
    return getLateLabel("SUN_8P");
  }, [appliedVios, detectedPunto]);

  // Recibe TEXTO + FILE desde PdfUploader (¡cambiamos la firma!)
  const handleExtracted = (fullText: string) => {
    setExtractedText(fullText);
  };

  const handleClear = () => {
    setByService({ SUN_8A: [], SUN_10A: [], SUN_12P: [], SUN_5P: [], SUN_8P: [] });
    setSelected("SUN_8A");
    setExtractedText("");
    setRawTimes(null);
    setDraftVios(appliedVios);
    setMessage(null);
    toast.success("Tabla limpiada");
  };

  // Parseo único del PDF: extrae horas de llegada y calcula el resumen con el corte actual
  useEffect(() => {
    if (!extractedText) return;

    const times = extractArrivalTimes(extractedText);
    setRawTimes(times);

    const all = computeResumen(
      times,
      appliedVios ? { SUN_8P: parseTimeToMinutes(appliedVios) } : undefined
    );
    setByService(all);

    if (getVolunteerCount(all.SUN_8A) > 0) setSelected("SUN_8A");
    else if (getVolunteerCount(all.SUN_10A) > 0) setSelected("SUN_10A");
    else if (getVolunteerCount(all.SUN_12P) > 0) setSelected("SUN_12P");
    else if (getVolunteerCount(all.SUN_5P) > 0) setSelected("SUN_5P");
    else if (getVolunteerCount(all.SUN_8P) > 0) setSelected("SUN_8P");

    const any =
      getVolunteerCount(all.SUN_8A) +
      getVolunteerCount(all.SUN_10A) +
      getVolunteerCount(all.SUN_12P) +
      getVolunteerCount(all.SUN_5P) +
      getVolunteerCount(all.SUN_8P) > 0;

    setMessage(any ? null : "No se encontraron voluntarios en los horarios.");
  }, [extractedText]);

  // Aplica el corte VIOS elegido recalculando SOLO el resumen (sin reprocesar el PDF)
  const handleApplyVios = () => {
    setAppliedVios(draftVios);
    if (rawTimes) {
      const updated = computeResumen(
        rawTimes,
        draftVios ? { SUN_8P: parseTimeToMinutes(draftVios) } : undefined
      );
      setByService((prev) => ({ ...prev, SUN_8P: updated.SUN_8P }));
    }
    toast.success("Corte VIOS actualizado");
  };

  // datos para la tabla
  const data = useMemo(() => {
    return byService[selected] ?? [];
  }, [byService, selected]);

  const counts = useMemo(
    () => ({
      SUN_8A: getVolunteerCount(byService.SUN_8A ?? []),
      SUN_10A: getVolunteerCount(byService.SUN_10A ?? []),
      SUN_12P: getVolunteerCount(byService.SUN_12P ?? []),
      SUN_5P: getVolunteerCount(byService.SUN_5P ?? []),
      SUN_8P: getVolunteerCount(byService.SUN_8P ?? []),
    }),
    [byService]
  );

   useEffect(() => {
    function onPdfExtracted(e: any) {
      const { text } = e.detail || {};
      if (text) {
        handleExtracted(text);
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
          {/* Selector de servicio */}
          <div className="mb-4 flex justify-center">
          <ServicePicker
            value={selected}
            onChange={setSelected}
            counts={counts}
            className="justify-center"
          />
          </div>

          {selected === "SUN_8P" && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5">
              <span className="text-sm font-medium text-indigo-900">Corte VIOS Punto</span>
              <select
                value={draftVios}
                onChange={(e) => setDraftVios(e.target.value)}
                className="rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Elige el corte VIOS manual para Punto y pulsa Actualizar corte."
              >
                {VIOS_OPTIONS.map((opt) => (
                  <option key={opt.value || "auto"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleApplyVios}
                disabled={draftVios === appliedVios}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Actualizar corte
              </button>
              {detectedPunto && (
                <span className="text-xs text-indigo-700">
                  Servicio detectado: {formatDetectedHeading(detectedPunto.heading)}
                </span>
              )}
            </div>
          )}

          {message && (
            <div className="text-center text-rose-600 font-semibold mt-2">
              {message}
            </div>
          )}

          <TableResumen
            data={data}
            lateLabel={selected === "SUN_8P" ? puntoLateLabel : getLateLabel(selected)}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}
