import { useEffect, useState } from "react";
import { logAppEvent } from "../utils/logger";
import {
  fetchPdfStats,
  fetchRecentErrors,
  fetchPdfProcessingLogs,
  fetchLoginStats,
  fetchServiceViewStats,
  fetchPdfValidationErrorStats,
  type PdfProcessingLog,
  type ErrorLog,
} from "../utils/logger";

interface PdfStats {
  total: number;
  success: number;
  error: number;
}

interface LoginStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
}

interface ValidationErrors {
  total: number;
  errors: Array<{ message: string; count: number }>;
}

const SERVICE_LABELS: Record<string, string> = {
  SUN_8A: "1er Servicio",
  SUN_10A: "2do Servicio",
  SUN_12P: "3er Servicio",
  SUN_5P: "Noche CDV",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<PdfStats>({ total: 0, success: 0, error: 0 });
  const [loginStats, setLoginStats] = useState<LoginStats>({
    totalLogins: 0,
    successfulLogins: 0,
    failedLogins: 0,
    uniqueUsers: 0,
  });
  const [serviceStats, setServiceStats] = useState<Record<string, number>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    total: 0,
    errors: [],
  });
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [recentProcessing, setRecentProcessing] = useState<PdfProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logAppEvent({ action: "admin_view" });
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [
      pdfStats,
      login,
      services,
      validation,
      errors,
      processing,
    ] = await Promise.all([
      fetchPdfStats(),
      fetchLoginStats(),
      fetchServiceViewStats(),
      fetchPdfValidationErrorStats(),
      fetchRecentErrors(10),
      fetchPdfProcessingLogs(20),
    ]);
    setStats(pdfStats);
    setLoginStats(login);
    setServiceStats(services);
    setValidationErrors(validation);
    setRecentErrors(errors);
    setRecentProcessing(processing);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando datos de monitoreo...</div>
      </div>
    );
  }

  const successRate =
    stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Monitoreo de la Aplicación
        </h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Actualizar
        </button>
      </div>

      {/* Estadísticas de Login */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sesiones de Usuario</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Logins" value={loginStats.totalLogins.toString()} color="blue" />
          <StatCard title="Exitosos" value={loginStats.successfulLogins.toString()} color="green" />
          <StatCard title="Fallidos" value={loginStats.failedLogins.toString()} color="red" />
          <StatCard title="Usuarios Únicos" value={loginStats.uniqueUsers.toString()} color="blue" />
        </div>
      </div>

      {/* Uso de Servicios */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uso de Servicios</h2>
        {Object.keys(serviceStats).length === 0 ? (
          <p className="text-gray-500 text-sm">No hay datos de uso de servicios.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(SERVICE_LABELS).map(([key, label]) => (
              <StatCard
                key={key}
                title={label}
                value={(serviceStats[key] || 0).toString()}
                color="blue"
              />
            ))}
          </div>
        )}
      </div>

      {/* Tarjetas de estadísticas de PDF */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total PDFs" value={stats.total.toString()} color="blue" />
        <StatCard title="Exitosos" value={stats.success.toString()} color="green" />
        <StatCard title="Fallidos" value={stats.error.toString()} color="red" />
        <StatCard
          title="Tasa de Éxito"
          value={`${successRate}%`}
          color={
            Number(successRate) >= 90
              ? "green"
              : Number(successRate) >= 70
                ? "yellow"
                : "red"
          }
        />
      </div>

      {/* Errores de Validación de PDF */}
      {validationErrors.total > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Errores de Validación de PDF ({validationErrors.total} total)
          </h2>
          <div className="space-y-2">
            {validationErrors.errors.map((err, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                <span className="text-sm text-red-800">{err.message}</span>
                <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">
                  {err.count} vez(es)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errores recientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Errores Recientes</h2>
        {recentErrors.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay errores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mensaje
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Componente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentErrors.map((err) => (
                  <tr key={err.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        {err.error_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {err.error_message}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {err.component ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(err.created_at).toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log de procesamiento reciente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Procesamiento de PDFs Reciente
        </h2>
        {recentProcessing.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay procesamientos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Archivo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Filas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProcessing.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {log.file_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status === "success" ? "Éxito" : "Error"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {log.rows_processed}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {log.error_message ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "blue" | "green" | "red" | "yellow";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-75">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
