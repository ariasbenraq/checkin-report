import type { Report } from "../lib/supabase";
import type { ServiceKey } from "../features/checkins/constants";
import { SERVICE_LABELS } from "../features/checkins/constants";
import { FileText, Upload, Trash2 } from "lucide-react";

function getTotalVolunteers(serviceData: Record<ServiceKey, any[]>): number {
  return Object.values(serviceData).reduce(
    (acc, rows) => acc + rows.reduce((a: number, r: any) => a + Number(r.total ?? 0), 0),
    0
  );
}

function getServicesWithData(serviceData: Record<ServiceKey, any[]>): string[] {
  return Object.entries(serviceData)
    .filter(([, rows]) => rows.some((r: any) => Number(r.total ?? 0) > 0))
    .map(([key]) => SERVICE_LABELS[key as ServiceKey]);
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

interface UploadSummaryCardProps {
  report: Report;
  onLoad: (report: Report) => void;
  onDelete?: (id: string) => void;
}

export function UploadSummaryCard({ report, onLoad, onDelete }: UploadSummaryCardProps) {
  const total = getTotalVolunteers(report.service_data);
  const services = getServicesWithData(report.service_data);

  return (
    <div className="glass-card inner-glow rounded-xl p-4 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-body-sm text-on-surface-variant truncate">
              {formatDate(report.created_at)}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-headline-sm font-semibold text-on-surface">{total}</span>
            <span className="text-body-sm text-on-surface-variant">voluntarios</span>
          </div>

          {services.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {services.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-primary-fixed/20 text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onLoad(report)}
            className="p-1.5 rounded-lg hover:bg-primary-container/20 text-primary transition-colors"
            title="Cargar reporte"
          >
            <Upload className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(report.id)}
              className="p-1.5 rounded-lg hover:bg-destructive-container/20 text-destructive transition-colors"
              title="Eliminar reporte"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
