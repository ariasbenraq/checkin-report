import type { AreaResumen } from "../features/checkins/types/resumen";
import { useMemo } from "react";

interface TableResumenProps {
  data: AreaResumen[];
  sortOrder: "asc" | "desc";
  onToggleSort: () => void;
  lateLabel?: string; // Etiqueta para “llegaron tarde”
  showTotalsRow?: boolean;
}

const nf = new Intl.NumberFormat("es-PE");

const TableResumen = ({
  data,
  sortOrder,
  onToggleSort,
  lateLabel = 'Llegaron después del umbral',
  showTotalsRow = true,
}: TableResumenProps) => {
  // Totales
  const { totalVol, totalLate } = useMemo(() => {
    const acc = { totalVol: 0, totalLate: 0 };
    for (const item of data ?? []) {
      acc.totalVol += Number(item?.total ?? 0);
      acc.totalLate += Number(item?.lateCount ?? 0);
    }
    return acc;
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden">
      {/* el contenedor con overflow hace que thead/tfoot sticky funcionen */}
      <div className="overflow-y-auto max-h-[500px]">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300 transition whitespace-nowrap select-none"
                onClick={onToggleSort}
                aria-sort={sortOrder === "asc" ? "ascending" : "descending"}
                aria-label="Ordenar por área"
              >
                Área {sortOrder === "asc" ? "🔼" : "🔽"}
              </th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Total voluntarios</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">{lateLabel}</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{item.area}</td>
                  <td className="px-4 py-2 text-center">{nf.format(item.total)}</td>
                  <td className="px-4 py-2 text-center">{nf.format(item.lateCount)}</td>
                </tr>
              ))
            )}
          </tbody>

          {showTotalsRow && (
            <tfoot className="bg-gray-100 sticky bottom-0 z-10">
              <tr className="border-t font-semibold">
                {/* Primera columna: etiqueta */}
                <td className="px-4 py-2 text-right">Totales:</td>
                {/* Totales alineados con sus columnas */}
                <td className="px-4 py-2 text-center">{nf.format(totalVol)}</td>
                <td className="px-4 py-2 text-center">{nf.format(totalLate)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default TableResumen;
