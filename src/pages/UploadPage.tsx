import { useMemo, useState } from "react";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { parsePdfTextAllServices } from "../utils/pdfParser";
import { SERVICE_LABELS, type ServiceKey } from "../features/checkins/constants";
import { CheckCircle, TriangleAlert, BarChart3, Eye } from "lucide-react";
import { useReportsCache } from "../contexts/ReportsCacheContext";
import { UploadHistory } from "../components/UploadHistory";
import type { Report } from "../lib/supabase";
import PdfUploader from "../components/PdfUploader";

function getVolunteerCount(rows: AreaResumen[] | undefined): number {
  return (rows ?? []).reduce((acc, row) => acc + Number(row.total ?? 0), 0);
}

type UploadStatus = "idle" | "processing" | "done" | "error";

export default function UploadPage() {
  const { addReport } = useReportsCache();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [],
    SUN_10A: [],
    SUN_12P: [],
    SUN_5P: [],
  });
  const [selected, setSelected] = useState<ServiceKey>("SUN_8A");

  const handleExtracted = (fullText: string) => {
    setStatus("processing");
    setMessage(null);

    try {
      const all = parsePdfTextAllServices(fullText);
      setServiceData(all);

      if (getVolunteerCount(all.SUN_8A) > 0) setSelected("SUN_8A");
      else if (getVolunteerCount(all.SUN_10A) > 0) setSelected("SUN_10A");
      else if (getVolunteerCount(all.SUN_12P) > 0) setSelected("SUN_12P");
      else if (getVolunteerCount(all.SUN_5P) > 0) setSelected("SUN_5P");

      const total =
        getVolunteerCount(all.SUN_8A) +
        getVolunteerCount(all.SUN_10A) +
        getVolunteerCount(all.SUN_12P) +
        getVolunteerCount(all.SUN_5P);

      if (total === 0) {
        setMessage("No se encontraron voluntarios en los horarios.");
        setStatus("error");
      } else {
        setStatus("done");
        addReport(all);
      }
    } catch {
      setMessage("Error al procesar el PDF.");
      setStatus("error");
    }
  };

  const counts = useMemo(
    () => ({
      SUN_8A: getVolunteerCount(serviceData.SUN_8A ?? []),
      SUN_10A: getVolunteerCount(serviceData.SUN_10A ?? []),
      SUN_12P: getVolunteerCount(serviceData.SUN_12P ?? []),
      SUN_5P: getVolunteerCount(serviceData.SUN_5P ?? []),
    }),
    [serviceData]
  );

  const totalVolunteers = counts.SUN_8A + counts.SUN_10A + counts.SUN_12P + counts.SUN_5P;
  const hasData = totalVolunteers > 0;

  const handleLoadReport = (report: Report) => {
    setServiceData(report.service_data);
    setStatus("done");
    setMessage(null);

    const sd = report.service_data;
    if (getVolunteerCount(sd.SUN_8A) > 0) setSelected("SUN_8A");
    else if (getVolunteerCount(sd.SUN_10A) > 0) setSelected("SUN_10A");
    else if (getVolunteerCount(sd.SUN_12P) > 0) setSelected("SUN_12P");
    else if (getVolunteerCount(sd.SUN_5P) > 0) setSelected("SUN_5P");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-headline-lg font-semibold text-on-surface">
          Upload Attendance Report
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Process ecclesiastical attendance data from standardized PDF exports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <div className="glass-card inner-glow rounded-xl min-h-[320px] relative overflow-hidden">
            {status === "processing" && (
              <div className="absolute inset-0 bg-primary/5 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <span className="text-body-md text-on-surface-variant">Procesando PDF...</span>
                </div>
              </div>
            )}

            {status === "done" && hasData && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Procesado
                </span>
              </div>
            )}

            <PdfUploader onExtracted={handleExtracted} onBusyChange={(busy) => setStatus(busy ? "processing" : "idle")} />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-card inner-glow rounded-xl p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-headline-sm font-semibold text-on-surface">Resumen</h3>
            </div>

            {!hasData ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-body-sm text-on-surface-variant text-center">Sube un PDF para ver el resumen</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-primary-container/10 p-3 text-center">
                    <span className="text-headline-sm font-semibold text-primary">{totalVolunteers}</span>
                    <p className="text-body-sm text-on-surface-variant">Total</p>
                  </div>
                  <div className="rounded-xl bg-tertiary-container/10 p-3 text-center">
                    <span className="text-headline-sm font-semibold text-tertiary">
                      {Object.values(counts).filter((c) => c > 0).length}
                    </span>
                    <p className="text-body-sm text-on-surface-variant">Servicios</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {(["SUN_8A", "SUN_10A", "SUN_12P", "SUN_5P"] as ServiceKey[]).map((key) => (
                    <div key={key} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
                      <span className="text-body-sm text-on-surface-variant">{SERVICE_LABELS[key]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-data-mono font-semibold text-on-surface">{counts[key]}</span>
                        <button
                          onClick={() => setSelected(key)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            selected === key
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container/30"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive-container/30 px-4 py-3 text-body-md text-destructive">
          <TriangleAlert className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      <UploadHistory onLoadReport={handleLoadReport} />
    </div>
  );
}
