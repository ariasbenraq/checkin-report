import { useEffect, useState } from "react";
import { getListas } from "../api/client";
import ListaDetailModal from "../components/ListaDetailModal";
import { isoToDisplay } from "../pages/UploadView";

export default function ListView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<any | null>(null);

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
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const totalVol = (r.detalles ?? []).reduce(
                (acc: number, d: any) => acc + (Number(d.total_voluntarios) || 0),
                0
              );
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
