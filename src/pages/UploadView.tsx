// src/pages/UploadView.tsx
import { useMemo, useState } from "react";
import PdfUploader from "../components/PdfUploader";
import TableResumen from "../components/TableResumen";
import type { AreaResumen } from "../features/checkins/types/resumen";
import { parsePdfTextAllServices } from "../utils/pdfParser";
import { SERVICE_LABEL, LATE_LABEL, type ServiceKey } from "../features/checkins/constants";

// ⬇️ imports para guardar
import { GuardarListaButton } from "../features/checkins/GuardarListaButton";
import type { ParserDetalle } from "../features/checkins/buildPayload";

function extractFechaFromName(name: string): string {
  // busca YYYY-MM-DD en el nombre del archivo; si no, hoy
  const m = name.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : new Date().toISOString().slice(0, 10);
}

// mapea AreaResumen[] -> ParserDetalle[]
function toParserDetalles(rows: AreaResumen[]): ParserDetalle[] {
  return rows.map((r) => ({
    area: r.area,
    total_voluntarios: r.total,      // 👈 ajusta si tu tipo usa otro nombre
    post_vios: r.lateCount,          // 👈 idem (en tu tabla es la col tardíos)
    // observaciones?: (si tuvieses)
  }));
}

// function pad(n: number) { return String(n).padStart(2, "0"); }

// function todayISO(): string {
//   // fecha local (no UTC) → ISO YYYY-MM-DD
//   const now = new Date();
//   return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
// }

export function isoToDisplay(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, y, mm, d] = m;
  return `${d}-${mm}-${y}`;
}

function displayToIso(display: string): string {
  const m = display.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return ""; // inválido → puedes decidir no actualizar el estado
  const [, d, mm, y] = m;
  return `${y}-${mm}-${d}`;
}


export default function UploadView() {
  const [byService, setByService] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [], SUN_10A: [], SUN_12P: []
  });
  const [selected, setSelected] = useState<ServiceKey>("SUN_8A");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [message, setMessage] = useState<string | null>(null);

  // ⬇️ nuevo: file y fecha para el payload
  const [file, setFile] = useState<File | null>(null);
  const [fechaISO, setFechaISO] = useState<string>("");

  const onToggleSort = () => setSortOrder(s => (s === "asc" ? "desc" : "asc"));

  // Recibe TEXTO + FILE desde PdfUploader (¡cambiamos la firma!)
  const handleExtracted = (fullText: string, f: File) => {
    setFile(f);
    setFechaISO(extractFechaFromName(f.name));

    const all = parsePdfTextAllServices(fullText);
    setByService(all);

    if (all.SUN_8A.length) setSelected("SUN_8A");
    else if (all.SUN_10A.length) setSelected("SUN_10A");
    else if (all.SUN_12P.length) setSelected("SUN_12P");

    const any = all.SUN_8A.length + all.SUN_10A.length + all.SUN_12P.length > 0;
    setMessage(any ? null : "No se encontraron voluntarios en los horarios.");
  };

  // datos para la tabla (ordenados)
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

  // ⬇️ detalles que irán al backend (según horario seleccionado)
  const detallesParser: ParserDetalle[] = useMemo(
    () => toParserDetalles(byService[selected] ?? []),
    [byService, selected]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
      {/* Izquierda: uploader */}
      <div className="lg:w-1/3 w-full">
        <PdfUploader onExtracted={handleExtracted} />
        {/* Fecha editable */}
        <div className="mt-4">
          <label className="block text-sm mb-1">Fecha (DD-MM-YYYY)</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={isoToDisplay(fechaISO)}
            onChange={(e) => {
              const iso = displayToIso(e.target.value);
              if (iso) setFechaISO(iso); // solo actualiza si el formato es válido
            }}
            placeholder="28-09-2025"
            inputMode="numeric"
            pattern="\d{2}-\d{2}-\d{4}"
            title="Usa el formato DD-MM-YYYY"
          />
        </div>
        {/* Botón Guardar */}
        {/* <div className="mt-4">
          {file && detallesParser.length > 0 && fechaISO && (
            <GuardarListaButton
              file={file}
              fechaISO={fechaISO}
              detallesParser={detallesParser}
              onSaved={() => {
                alert("✅ Guardado");
                // opcional: limpiar o navegar a la vista de lista
              }}
            />
          )}
        </div> */}
      </div>

      {/* Derecha: selector + tabla + botones */}
      <div className="lg:w-2/3 w-full space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
          {(["SUN_8A", "SUN_10A", "SUN_12P"] as ServiceKey[]).map(key => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`px-3 py-2 rounded-md border text-sm transition
                ${selected === key ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-50"}`}
            >
              {SERVICE_LABEL[key]}
            </button>
          ))}
        </div>

        {message && <div className="text-center text-red-600 font-semibold">{message}</div>}

        <TableResumen
          data={data}
          sortOrder={sortOrder}
          onToggleSort={onToggleSort}
          lateLabel={LATE_LABEL[selected]}
          sourceFile={file}
          fechaISO={fechaISO}
          toParserDetalles={toParserDetalles}
          onSaved={() => alert("✅ Guardado")}
        />
      </div>
    </div>
  );
}
