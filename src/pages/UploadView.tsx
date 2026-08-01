import { useEffect, useMemo, useState } from "react";
import TableResumen from "../components/TableResumen";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { getLateLabel, type ServiceKey } from "../features/checkins/constants";
import { ServicePicker } from "../components/ServicePicker";
import { Loader2, FolderOpen } from "lucide-react";
import { useReportsCache } from "../contexts/ReportsCacheContext";

function getVolunteerCount(rows: AreaResumen[] | undefined): number {
  return (rows ?? []).reduce((acc, row) => acc + Number(row.total ?? 0), 0);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UploadView() {
  const { reports, loading, loaded, refresh } = useReportsCache();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [],
    SUN_10A: [],
    SUN_12P: [],
    SUN_5P: [],
  });
  const [selected, setSelected] = useState<ServiceKey>("SUN_8A");

  useEffect(() => {
    if (!loaded) {
      refresh();
    }
  }, [loaded, refresh]);

  useEffect(() => {
    if (!selectedReportId || reports.length === 0) return;
    const report = reports.find((r) => r.id === selectedReportId);
    if (!report) return;

    setServiceData(report.service_data);

    const sd = report.service_data;
    if (getVolunteerCount(sd.SUN_8A) > 0) setSelected("SUN_8A");
    else if (getVolunteerCount(sd.SUN_10A) > 0) setSelected("SUN_10A");
    else if (getVolunteerCount(sd.SUN_12P) > 0) setSelected("SUN_12P");
    else if (getVolunteerCount(sd.SUN_5P) > 0) setSelected("SUN_5P");
  }, [selectedReportId, reports]);

  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  const data = useMemo(() => {
    return serviceData[selected] ?? [];
  }, [serviceData, selected]);

  const counts = useMemo(
    () => ({
      SUN_8A: getVolunteerCount(serviceData.SUN_8A ?? []),
      SUN_10A: getVolunteerCount(serviceData.SUN_10A ?? []),
      SUN_12P: getVolunteerCount(serviceData.SUN_12P ?? []),
      SUN_5P: getVolunteerCount(serviceData.SUN_5P ?? []),
    }),
    [serviceData]
  );

  const hasData = Object.values(counts).some((c) => c > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-headline-lg font-semibold text-on-surface">Reports</h2>
        <p className="text-body-md text-on-surface-variant">View and manage attendance data from processed reports.</p>
      </div>

      {loading && !loaded ? (
        <div className="glass-card inner-glow rounded-xl p-8">
          <div className="flex items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-body-md">Cargando reportes...</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-card inner-glow rounded-xl p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <FolderOpen className="w-8 h-8 opacity-40" />
            <span className="text-body-md">No hay reportes guardados</span>
            <span className="text-body-sm text-on-surface-variant/60">Sube un PDF en la página de Upload para crear reportes</span>
          </div>
        </div>
      ) : (
        <>
          <div className="glass-card inner-glow rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-headline-sm font-semibold text-on-surface">Seleccionar reporte</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {reports.map((report) => {
                const total = Object.values(report.service_data).reduce(
                  (acc, rows) => acc + rows.reduce((a: number, r: any) => a + Number(r.total ?? 0), 0),
                  0
                );
                const isSelected = report.id === selectedReportId;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`p-3 rounded-xl text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                        : "bg-surface-container-high/50 hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body-sm font-medium truncate">{formatDate(report.created_at)}</span>
                    </div>
                    <span className="text-headline-sm font-semibold">{total}</span>
                    <span className={`text-body-sm ml-1 ${isSelected ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                      voluntarios
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <ServicePicker value={selected} onChange={setSelected} counts={counts} />
          </div>

          {hasData && <TableResumen data={data} lateLabel={getLateLabel(selected)} />}
        </>
      )}
    </div>
  );
}
