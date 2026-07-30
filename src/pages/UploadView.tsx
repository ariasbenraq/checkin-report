// src/pages/UploadView.tsx
import { useEffect, useMemo, useState } from "react";
import TableResumen from "../components/TableResumen";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { parsePdfTextAllServices } from "../utils/pdfParser";
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

export default function UploadView() {
  const [byService, setByService] = useLocalStorage<Record<ServiceKey, AreaResumen[]>>(
    "checkin:byService",
    { SUN_8A: [], SUN_10A: [], SUN_12P: [], SUN_5P: [] }
  );
  const [selected, setSelected] = useLocalStorage<ServiceKey>("checkin:selected", "SUN_8A");
  const [message, setMessage] = useState<string | null>(null);

  const [extractedText, setExtractedText] = useLocalStorage<string>("checkin:extractedText", "");

  // Recibe TEXTO + FILE desde PdfUploader (¡cambiamos la firma!)
  const handleExtracted = (fullText: string) => {
    setExtractedText(fullText);
  };

  const handleClear = () => {
    setByService({ SUN_8A: [], SUN_10A: [], SUN_12P: [], SUN_5P: [] });
    setSelected("SUN_8A");
    setExtractedText("");
    setMessage(null);
    toast.success("Tabla limpiada");
  };

  useEffect(() => {
    if (!extractedText) return;

    const all = parsePdfTextAllServices(extractedText);
    setByService(all);

    if (getVolunteerCount(all.SUN_8A) > 0) setSelected("SUN_8A");
    else if (getVolunteerCount(all.SUN_10A) > 0) setSelected("SUN_10A");
    else if (getVolunteerCount(all.SUN_12P) > 0) setSelected("SUN_12P");
    else if (getVolunteerCount(all.SUN_5P) > 0) setSelected("SUN_5P");

    const any =
      getVolunteerCount(all.SUN_8A) +
      getVolunteerCount(all.SUN_10A) +
      getVolunteerCount(all.SUN_12P) +
      getVolunteerCount(all.SUN_5P) > 0;

    setMessage(any ? null : "No se encontraron voluntarios en los horarios.");
  }, [extractedText]);

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

          {message && (
            <div className="text-center text-rose-600 font-semibold mt-2">
              {message}
            </div>
          )}

          <TableResumen
            data={data}
            lateLabel={getLateLabel(selected)}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}
