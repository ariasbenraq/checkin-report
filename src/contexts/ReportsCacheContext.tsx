import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AreaResumen } from "../features/checkins/types/resumen";
import type { ServiceKey } from "../features/checkins/constants";
import { fetchReports, uploadReport, deleteReport, type Report } from "../lib/supabase";

interface ReportsCache {
  reports: Report[];
  loading: boolean;
  loaded: boolean;
  refresh: () => Promise<void>;
  addReport: (serviceData: Record<ServiceKey, AreaResumen[]>) => Promise<Report | null>;
  removeReport: (id: string) => Promise<boolean>;
}

const ReportsCacheContext = createContext<ReportsCache | null>(null);

export function ReportsCacheProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchReports();
    setReports(data);
    setLoaded(true);
    setLoading(false);
  }, []);

  const addReport = useCallback(
    async (serviceData: Record<ServiceKey, AreaResumen[]>) => {
      const report = await uploadReport(serviceData);
      if (report) {
        setReports((prev) => [report, ...prev]);
      }
      return report;
    },
    []
  );

  const removeReport = useCallback(async (id: string) => {
    const ok = await deleteReport(id);
    if (ok) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
    return ok;
  }, []);

  return (
    <ReportsCacheContext.Provider value={{ reports, loading, loaded, refresh, addReport, removeReport }}>
      {children}
    </ReportsCacheContext.Provider>
  );
}

export function useReportsCache(): ReportsCache {
  const ctx = useContext(ReportsCacheContext);
  if (!ctx) throw new Error("useReportsCache must be used within ReportsCacheProvider");
  return ctx;
}
