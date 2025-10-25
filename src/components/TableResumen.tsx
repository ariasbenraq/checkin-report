import type { AreaResumen } from "../features/checkins/types/resumen";
import { useMemo, useEffect, useRef, useState } from "react";
import { IconButton } from "../components/ui";
import { GuardarListaButton } from "../features/checkins/GuardarListaButton";
import type { ParserDetalle } from "../features/checkins/buildPayload";



interface TableResumenProps {
  data: AreaResumen[];
  sortOrder: "asc" | "desc";
  onToggleSort: () => void;
  lateLabel?: string;
  showTotalsRow?: boolean;
  onReorder?: (next: AreaResumen[]) => void;
  /** Se invoca al confirmar edición con el nuevo orden (solo incluidos) y la lista de excluidos */
  onCommit?: (payload: { included: AreaResumen[]; excludedKeys: string[] }) => void;

  sourceFile?: File | null;
  fechaISO?: string;
  toParserDetalles?: (rows: AreaResumen[]) => ParserDetalle[];
  onSaved?: () => void; // opcional, para callback al terminar
}

const nf = new Intl.NumberFormat("es-PE");

const keyOf = (x: AreaResumen, fallbackIndex: number) =>
  (x as any)?.id?.toString?.() ?? String(x.area ?? fallbackIndex);

const TableResumen = ({
  data,
  sortOrder,
  onToggleSort,
  lateLabel = "Llegaron después del umbral",
  showTotalsRow = true,
  onReorder,
  onCommit,
  // ⬇️ NUEVO
  sourceFile,
  fechaISO,
  toParserDetalles,
  onSaved,
}: TableResumenProps) => {
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState<AreaResumen[]>(data ?? []);
  const [showExcluded, setShowExcluded] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const dragIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);

  // Sincroniza con data si no estás editando
  useEffect(() => {

    setRows(data ?? []);

  }, [data]);

  // Filas visibles según showExcluded
  const visibleRows = useMemo(() => {
    if (!editMode || showExcluded) return rows;
    return rows.filter((r, i) => !excluded.has(keyOf(r, i)));
  }, [rows, editMode, showExcluded, excluded]);

  // Totales SOLO con incluidas
  const { totalVol, totalLate } = useMemo(() => {
    const acc = { totalVol: 0, totalLate: 0 };
    for (let i = 0; i < rows.length; i++) {
      const k = keyOf(rows[i], i);
      if (!excluded.has(k)) {
        acc.totalVol += Number(rows[i]?.total ?? 0);
        acc.totalLate += Number(rows[i]?.lateCount ?? 0);
      }
    }
    return acc;
  }, [rows, excluded]);

  // ⬇️ filas incluidas respetando orden + exclusiones
  const includedRows: AreaResumen[] = useMemo(
    () => rows.filter((r, i) => !excluded.has(keyOf(r, i))),
    [rows, excluded]
  );

  // ⬇️ condición del botón Guardar
  const canSave = Boolean(sourceFile && fechaISO && toParserDetalles && includedRows.length > 0);


  function handleDragStart(ev: React.DragEvent<HTMLTableRowElement>) {
    const idx = Number(ev.currentTarget.dataset.index);
    dragIndexRef.current = idx;
    ev.dataTransfer.setData("text/plain", String(idx));
    ev.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(ev: React.DragEvent<HTMLTableRowElement>) {
    ev.preventDefault();
    overIndexRef.current = Number(ev.currentTarget.dataset.index);
    ev.dataTransfer.dropEffect = "move";
  }

  function handleDrop(ev: React.DragEvent<HTMLTableRowElement>) {
    ev.preventDefault();
    const from = dragIndexRef.current;
    const to = overIndexRef.current;
    dragIndexRef.current = null;
    overIndexRef.current = null;
    if (from == null || to == null || from === to) return;

    setRows((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder?.(next);
      return next;
    });
  }

  function toggleEdit() {
    setEditMode((v) => !v);
  }

  function toggleExclude(key: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleCommit() {
    const included = rows.filter((r, i) => !excluded.has(keyOf(r, i)));
    setRows(included);
    onCommit?.({ included, excludedKeys: Array.from(excluded) });
    // opcional: salir de edición al confirmar
    setEditMode(false);
  }

  function handleCopyTable() {
    // Clave estable para exclusiones
    const getKey = (x: AreaResumen, i: number) =>
      (x as any)?.id?.toString?.() ?? String(x.area ?? i);

    // Filas a copiar: respetar orden actual, exclusiones y visibilidad
    const bodyRows = rows
      .map((r, i) => ({ r, i }))
      .filter(({ r, i }) =>
        editMode && !showExcluded ? !excluded.has(getKey(r, i)) : true
      )
      .map(({ r }) => r);

    // Construir TSV: Área \t Total \t Llegaron después del umbral
    const tsv = bodyRows
      .map((r) => {
        const area = (r.area ?? "").toString().trim();
        const total = String(r.total ?? 0);
        const late = String(r.lateCount ?? 0);
        return [area, total, late].join("\t");
      })
      .join("\n");

    // Copiar al portapapeles (con fallback)
    try {
      void navigator.clipboard.writeText(tsv);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = tsv;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }


  const totalExcluded = excluded.size;

  return (
    <div className="max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden">
      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white/70 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Resumen por área</h3>
          {editMode && totalExcluded > 0 && (
            <span className="text-xs rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
              Excluidas: {totalExcluded}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">

          {/* Guardar (solo si hay PDF + fecha + mapeador + filas incluidas) */}
          {canSave && (
            <GuardarListaButton
              file={sourceFile as File}
              fechaISO={fechaISO as string}
              detallesParser={toParserDetalles!(includedRows)}
              onSaved={() => {
                setEditMode(false);
                onSaved?.();
              }}
            >
              <IconButton
                onlyIcon
                label="Guardar lista en el servidor"
                title="Guardar lista en el servidor"
                icon="database_upload"
                variant="primary"
              />
            </GuardarListaButton>
          )}


          <IconButton
            onClick={handleCopyTable}
            onlyIcon
            label="Copiar cuerpo de la tabla"
            title="Copiar filas visibles (sin encabezados ni totales)"
            icon="content_copy"
            variant="outline"
          />
          <IconButton
            onClick={onToggleSort}
            disabled={editMode}
            onlyIcon
            label={editMode ? "Desactiva edición para ordenar por columna" : "Ordenar por área"}
            title={sortOrder === "asc" ? "Ordenar descendente" : "Ordenar ascendente"}
            icon={sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
            variant="outline"
          />


          {editMode && (
            <IconButton
              onClick={() => setShowExcluded((v) => !v)}
              onlyIcon
              label={showExcluded ? "Ocultar excluidas" : "Ver excluidas"}
              title={showExcluded ? "Ocultar filas excluidas" : "Mostrar filas excluidas"}
              icon={showExcluded ? "visibility_off" : "visibility"}
              variant="outline"
            />
          )}

          {!editMode ? (
            <IconButton
              onClick={toggleEdit}
              onlyIcon
              label="Editar: arrastrar y excluir filas"
              title="Entrar en modo edición"
              icon="edit"
              variant="outline"
            />
          ) : (
            <>
              <IconButton
                onClick={handleCommit}
                onlyIcon
                label="Guardar cambios"
                title="Confirmar y guardar cambios"
                icon="save"
                variant="primary"
              />
              <IconButton
                onClick={() => {
                  setExcluded(new Set());
                  setRows(data ?? []);
                  setEditMode(false);
                }}
                onlyIcon
                label="Descartar cambios"
                title="Descartar cambios y salir de edición"
                icon="close"
                variant="outline"
              />
            </>
          )}
        </div>
      </div>



      {/* Tabla */}
      <div className="overflow-y-auto max-h-[500px]">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="w-10 px-2 py-2 text-left">{editMode ? "⋮⋮" : ""}</th>
              {editMode && <th className="w-10 px-2 py-2 text-left">•</th>}
              <th className="px-4 py-2 text-left whitespace-nowrap select-none">Área</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Total voluntarios</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">{lateLabel}</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {(!visibleRows || visibleRows.length === 0) ? (
              <tr>
                <td colSpan={editMode ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              visibleRows.map((item, visIdx) => {
                // visIdx es índice en visibleRows; necesitamos índice real en rows para DnD
                const realIdx = rows.indexOf(item);
                const k = keyOf(item, realIdx);
                const isExcluded = excluded.has(k);

                return (
                  <tr
                    key={k}
                    data-index={realIdx}
                    className={`border-t transition ${editMode ? "hover:bg-indigo-50/40" : "hover:bg-gray-50"
                      } ${isExcluded ? "opacity-60 line-through" : ""}`}
                    draggable={editMode}
                    onDragStart={editMode ? handleDragStart : undefined}
                    onDragOver={editMode ? handleDragOver : undefined}
                    onDrop={editMode ? handleDrop : undefined}
                  >
                    {/* handle */}
                    <td className="px-2 py-2 text-center select-none">{editMode ? "⠿" : ""}</td>

                    {/* excluir / incluir */}
                    {editMode && (
                      <td className="px-2 py-2 text-center">
                        <IconButton
                          onClick={() => toggleExclude(k)}
                          onlyIcon
                          label={isExcluded ? "" : ""}
                          title={isExcluded ? "Incluir área" : "Excluir área"}
                          icon={isExcluded ? "undo" : "delete"}
                          // variant={isExcluded ? "solid" : "danger"}
                          size="sm"
                        />
                      </td>
                    )}

                    <td className="px-4 py-2">{item.area}</td>
                    <td className="px-4 py-2 text-center">{nf.format(item.total)}</td>
                    <td className="px-4 py-2 text-center">{nf.format(item.lateCount)}</td>
                  </tr>
                );
              })
            )}
          </tbody>

          {showTotalsRow && (
            <tfoot className="bg-gray-100 sticky bottom-0 z-10">
              <tr className="border-t font-semibold">
                <td className="px-2 py-2" />
                {editMode && <td className="px-2 py-2" />}
                <td className="px-4 py-2 text-right">
                  Totales{totalExcluded > 0 ? ` (excluidas: ${totalExcluded})` : ""}:
                </td>
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
