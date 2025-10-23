import { useEffect, useState } from "react";
import { getListas, deleteLista } from "../api/client";
import ListaDetailModal from "../components/ListaDetailModal";
import { isoToDisplay } from "../pages/UploadView";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function ListView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null); // ← nuevo

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getListas({ page: "1", limit: "20" });
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // ← handler eliminar
  const handleDelete = async (
    e: React.MouseEvent,
    id: number,
    nombre: string
  ) => {
    e.stopPropagation(); // evita abrir el modal
    const ok = confirm(`¿Eliminar "${nombre}"? Esta acción es permanente.`);
    if (!ok) return;

    setDeletingId(id);
    try {
      await deleteLista(id);
      // Optimista: quitamos la fila sin esperar refresh
      setRows((prev) => prev.filter((x) => x.id !== id));
      if (active?.id === id) setActive(null);
      // Si prefieres forzar refresco desde servidor:
      // await refresh();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar. Revisa consola para más detalles.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">PDFs guardados</h2>
        <button
          className="px-3 py-1 rounded bg-gray-800 text-white"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Cargando…" : "Refrescar"}
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {/* <th className="text-left p-3">ID</th> */}
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Voluntarios (total)</th>
              <th className="text-right p-3 w-14">Acciones</th> {/* ← nueva */}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const totalVol = (r.detalles ?? []).reduce(
                (acc: number, d: any) => acc + (Number(d.total_voluntarios) || 0),
                0
              );

              const isDeleting = deletingId === r.id;

              return (
                <tr
                  key={r.id}
                  onClick={() => setActive(r)}
                  className="border-t cursor-pointer hover:bg-gray-50"
                >
                  {/* <td className="p-3">{r.id}</td> */}
                  <td className="p-3">{r.nombre}</td>
                  <td className="p-3">{isoToDisplay(r.fecha)}</td>
                  <td className="p-3">{totalVol.toLocaleString('es-PE')}</td> {/* ← suma */}
                  <td className="p-3 text-right">
                    <button
                      aria-label="Eliminar lista"
                      title="Eliminar"
                      onClick={(e) => handleDelete(e, r.id, r.nombre)}
                      disabled={isDeleting}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        // mini spinner accesible
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            opacity="0.25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                        </svg>
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={3}>
                  {/* ← colSpan ahora 3, porque ya no hay columna ID */}
                  Sin registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal mejorado */}
      {active && (
        <ListaDetailModal
          record={active}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
