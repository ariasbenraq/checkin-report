import { useState } from "react";
import Navbar from "./components/Navbar"; // Asegúrate de tener este archivo
import PdfUploader from "./components/PdfUploader";
import { parsePdfText } from "./features/checkins/utils/parser";
import { exportToExcel } from "./features/checkins/services/exportExcel";
import TableResumen from "./components/TableResumen";
import type { AreaResumen } from "./features/checkins/types/resumen";

function App() {
  const [results, setResults] = useState<AreaResumen[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [message, setMessage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "upload" | "list">("upload");

  const handlePdfText = (raw: string) => {
    const parsed = parsePdfText(raw);
    setResults(parsed);

    if (parsed.length === 0) {
      setMessage("No se encontraron voluntarios en el horario.");
    } else {
      setMessage(null);
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
    <div className="min-h-screen bg-gray-100">
      <Navbar current={currentView} onNavigate={setCurrentView} />

      <main className="max-w-5xl mx-auto p-6">
        {currentView === "home" && (
          <div className="text-center text-xl text-gray-600 mt-10">
            🏠 Bienvenido. Esta sección está en desarrollo.
          </div>
        )}

        {currentView === "upload" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-center mb-4">Resumen Inventario Etiquetas</h1>

            {results.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
                {/* Izquierda: Uploader */}
                <div className="lg:w-1/3 w-full">
                  <PdfUploader onExtracted={handlePdfText} />
                </div>

                {/* Derecha: Botones y tabla */}
                <div className="lg:w-2/3 w-full ">
                  <TableResumen
                    data={sortedResults}
                    sortOrder={sortOrder}
                    onToggleSort={toggleSortOrder}
                  />

                  <div className="flex justify-center gap-4 mt-6 flex-wrap">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                      Copiar tabla
                    </button>

                    <button
                      onClick={() => exportToExcel(sortedResults)}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <span className="material-symbols-outlined text-base">data_table</span>
                      Exportar Excel
                    </button>

                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600/50 px-4 py-2 text-sm font-medium text-white shadow-sm opacity-50 cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base">drive_export</span>
                      Exportar Google
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <>
                <div className="mx-auto w-full max-w-md">
                  <PdfUploader onExtracted={handlePdfText} />
                </div>

                {message && (
                  <div className="my-4 text-red-600 font-semibold text-center">
                    {message}
                  </div>
                )}
              </>
            )}
          </div>
        )}


        {currentView === "list" && (
          <div className="text-center text-xl text-gray-600 mt-10">
            📄 Lista de PDFs registrados (funcionalidad próxima)
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
