// src/pages/UploadView.tsx
import { useMemo, useState } from "react";
import PdfUploader from "../components/PdfUploader";
import TableResumen from "../components/TableResumen";
// import { exportToExcel } from "../features/checkins/services/exportExcel";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { parsePdfTextAllServices } from "../utils/pdfParser";
import { SERVICE_LABEL, LATE_LABEL, type ServiceKey } from "../features/checkins/constants";

export default function UploadView() {
  const [byService, setByService] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [], SUN_10A: [], SUN_12P: []
  });
  const [selected, setSelected] = useState<ServiceKey>("SUN_8A");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [message, setMessage] = useState<string | null>(null);

  const onToggleSort = () => setSortOrder(s => (s === "asc" ? "desc" : "asc"));

  // Recibe el TEXTO desde PdfUploader
  const handleExtracted = (fullText: string) => {
    const all = parsePdfTextAllServices(fullText);
    setByService(all);

    if (all.SUN_8A.length) setSelected("SUN_8A");
    else if (all.SUN_10A.length) setSelected("SUN_10A");
    else if (all.SUN_12P.length) setSelected("SUN_12P");

    const any =
      all.SUN_8A.length + all.SUN_10A.length + all.SUN_12P.length > 0;
    setMessage(any ? null : "No se encontraron voluntarios en los horarios.");
  };

  const data = useMemo(() => {
    const arr = byService[selected] ?? [];
    const copy = [...arr];
    copy.sort((a, b) =>
      sortOrder === "asc"
        ? a.area.localeCompare(b.area, "es")
        : b.area.localeCompare(a.area, "es")
    );
    return copy;
  }, [byService, selected, sortOrder]);

  const copyToClipboard = () => {
    const header = `Área\tTotal voluntarios\t${LATE_LABEL[selected]}`;
    const rows = data.map(d => `${d.area}\t${d.total}\t${d.lateCount}`);
    navigator.clipboard.writeText([header, ...rows].join("\n"))
      .then(() => alert("📋 Tabla copiada al portapapeles"))
      .catch(() => alert("❌ Error al copiar"));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
      {/* Izquierda: uploader */}
      <div className="lg:w-1/3 w-full">
        <PdfUploader onExtracted={handleExtracted} />
      </div>

      {/* Derecha: selector + tabla + botones */}
      <div className="lg:w-2/3 w-full space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
          {(["SUN_8A","SUN_10A","SUN_12P"] as ServiceKey[]).map(key => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`px-3 py-2 rounded-md border text-sm transition
                ${selected === key ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-50"}`}
            >
              {SERVICE_LABEL[key]}
            </button>
          ))}
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
            Copiar tabla
          </button>
        </div>

        {message && <div className="text-center text-red-600 font-semibold">{message}</div>}

        <TableResumen
          data={data}
          sortOrder={sortOrder}
          onToggleSort={onToggleSort}
          lateLabel={LATE_LABEL[selected]}
        />

        {/* <div className="flex justify-center gap-4 mt-2 flex-wrap">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
            Copiar tabla
          </button>

          <button
            onClick={() => exportToExcel(data)}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            <span className="material-symbols-outlined text-base">data_table</span>
            Exportar Excel
          </button>

          <button
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-blue-600/50 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">drive_export</span>
            Exportar Google
          </button>
        </div> */}
      </div>
    </div>
  );
}
