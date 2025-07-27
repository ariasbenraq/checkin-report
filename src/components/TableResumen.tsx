import type { AreaResumen } from "../features/checkins/types/resumen";

interface TableResumenProps {
  data: AreaResumen[];
  sortOrder: "asc" | "desc";
  onToggleSort: () => void;
}

const TableResumen = ({ data, sortOrder, onToggleSort }: TableResumenProps) => {
  return (
    <div className="max-w-4xl mx-auto mt-6 rounded-xl shadow overflow-hidden">
      <div className="overflow-y-auto max-h-[500px]">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300 transition whitespace-nowrap"
                onClick={onToggleSort}
              >
                Área {sortOrder === "asc" ? "🔼" : "🔽"}
              </th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Total voluntarios</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Llegaron después de 7:30am</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2">{item.area}</td>
                <td className="px-4 py-2 text-center">{item.total}</td>
                <td className="px-4 py-2 text-center">{item.lateCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableResumen;
