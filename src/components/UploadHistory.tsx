import { useEffect } from "react";
import { UploadSummaryCard } from "./UploadSummaryCard";
import { Loader2, FolderOpen } from "lucide-react";
import { useReportsCache } from "../contexts/ReportsCacheContext";
import type { Report } from "../lib/supabase";

interface UploadHistoryProps {
  onLoadReport: (report: Report) => void;
}

export function UploadHistory({ onLoadReport }: UploadHistoryProps) {
  const { reports, loading, loaded, refresh, removeReport } = useReportsCache();

  useEffect(() => {
    if (!loaded) {
      refresh();
    }
  }, [loaded, refresh]);

  if (loading && !loaded) {
    return (
      <div className="glass-card inner-glow rounded-xl p-8">
        <div className="flex items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-body-md">Cargando historial...</span>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="glass-card inner-glow rounded-xl p-8">
        <div className="flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <FolderOpen className="w-8 h-8 opacity-40" />
          <span className="text-body-md">No hay reportes guardados</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-headline-sm font-semibold text-on-surface">Reportes anteriores</h3>
        <span className="px-2 py-0.5 rounded-full bg-primary-fixed/20 text-primary text-[11px] font-semibold">
          {reports.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {reports.map((report) => (
          <UploadSummaryCard
            key={report.id}
            report={report}
            onLoad={onLoadReport}
            onDelete={removeReport}
          />
        ))}
      </div>
    </div>
  );
}
