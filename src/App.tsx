import { useState } from "react";
import PdfUploader from "./components/PdfUploader";
import { parsePdfText } from "./features/checkins/utils/parser";
import { exportToExcel } from "./features/checkins/services/exportExcel";
import TableResumen from "./components/TableResumen";
import type { AreaResumen } from "./features/checkins/types/resumen";

function App() {
  const [results, setResults] = useState<AreaResumen[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [message, setMessage] = useState<string | null>(null);


  const handlePdfText = (raw: string) => {
    const parsed = parsePdfText(raw);
    setResults(parsed);

    if (parsed.length === 0) {
      setMessage("No se encontraron voluntarios en el horario.");
    } else {
      setMessage(null); // Limpiar mensaje si hay resultados
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedResults = [...results].sort((a, b) =>
    sortOrder === "asc"
      ? a.area.localeCompare(b.area)
      : b.area.localeCompare(a.area)
  );

  const copyToClipboard = () => {
    const header = "Área\tTotal voluntarios\tLlegaron después de 7:30am";
    const rows = sortedResults.map(
      (item) => `${item.area}\t${item.total}\t${item.lateCount}`
    );
    const tsv = [header, ...rows].join("\n");

    navigator.clipboard.writeText(tsv)
      .then(() => alert("📋 Tabla copiada al portapapeles"))
      .catch(() => alert("❌ Error al copiar"));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Resumen Inventario Etiquetas</h1>
      <PdfUploader onExtracted={handlePdfText} />

      {/* Mostrar mensaje si existe, aunque no haya resultados */}
      {message && (
        <div className="my-4 text-red-600 font-semibold">
          {message}
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="flex gap-5 my-4 top-5">
            <button
              onClick={copyToClipboard}
              className="fade-in flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              <span className="material-symbols-outlined">content_copy</span>
              Copiar tabla
            </button>

            <button
              onClick={() => exportToExcel(sortedResults)}
              className="fade-in flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <span className="material-symbols-outlined">data_table</span>
              Exportar Excel
            </button>

            <button
              disabled
              className="fade-in flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded opacity-60 cursor-not-allowed"
            >
              <span className="material-symbols-outlined">drive_export</span>
              Exportar Google
            </button>

          </div>

          <TableResumen
            data={sortedResults}
            sortOrder={sortOrder}
            onToggleSort={toggleSortOrder}
          />
        </>
      )}
    </div>
  );
}

export default App;
