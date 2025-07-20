import type { AreaResumen } from "../features/checkins/types/resumen";

interface TableResumenProps {
  data: AreaResumen[];
  sortOrder: "asc" | "desc";
  onToggleSort: () => void;
}

const TableResumen = ({ data, sortOrder, onToggleSort }: TableResumenProps) => {
  return (
    <table className="mt-6 table-auto border-collapse border bg-white shadow rounded">
      <thead>
        <tr className="bg-gray-200">
          <th
            className="border px-4 py-2 cursor-pointer hover:bg-gray-300 transition"
            onClick={onToggleSort}
          >
            Área {sortOrder === "asc" ? "🔼" : "🔽"}
          </th>
          <th className="border px-4 py-2">Total voluntarios</th>
          <th className="border px-4 py-2">Llegaron después de 7:00am</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
          <tr key={idx} className="fade-in">
            <td className="border px-4 py-2">{item.area}</td>
            <td className="border px-4 py-2 text-center">{item.total}</td>
            <td className="border px-4 py-2 text-center">{item.lateCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableResumen;
