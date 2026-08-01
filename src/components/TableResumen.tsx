import type { AreaResumen } from "../features/checkins/types/resumen";
import { useMemo, useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { applyTextFormat, type TextFormat, cycleFormat, FORMAT_LABEL } from "../utils/textFormatter";
import {
  Search,
  X,
  ArrowUpDown,
  Type,
  Copy,
  Trash2,
  EyeOff,
  Eye,
  Pencil,
  Save,
  ArrowUp,
  ArrowDown,
  Undo2,
} from "lucide-react";

interface TableResumenProps {
  data: AreaResumen[];
  lateLabel?: string;
  onClear?: () => void;
}

const nf = new Intl.NumberFormat("es-PE");

const keyOf = (x: AreaResumen, fallbackIndex: number) =>
  (x as any)?.id?.toString?.() ?? String(x.area ?? fallbackIndex);

const TableResumen = ({
  data,
  lateLabel = "Llegaron después del umbral",
  onClear,
}: TableResumenProps) => {
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState<AreaResumen[]>(data ?? []);
  const [showExcluded, setShowExcluded] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const dragIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);

  const [areaFormat, setAreaFormat] = useState<TextFormat>("capitalize");
  const [sortColumn, setSortColumn] = useState<"area" | "total" | "late">("area");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [tableHeight, setTableHeight] = useLocalStorage<number>("checkin:tableHeight", 500);

  useEffect(() => {
    if (!editMode) {
      setRows(data ?? []);
    }
  }, [data, editMode]);

  const visibleRows = useMemo(() => {
    let result = rows;
    if (editMode && !showExcluded) {
      result = result.filter((r, i) => !excluded.has(keyOf(r, i)));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((r) => (r.area ?? "").toLowerCase().includes(term));
    }
    const sorted = [...result];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "area") {
        cmp = (a.area ?? "").localeCompare(b.area ?? "", "es");
      } else if (sortColumn === "total") {
        cmp = Number(a.total ?? 0) - Number(b.total ?? 0);
      } else {
        cmp = Number(a.lateCount ?? 0) - Number(b.lateCount ?? 0);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, editMode, showExcluded, excluded, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: "area" | "total" | "late") => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

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

  const totalExcluded = excluded.size;

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
    setExcluded(new Set());
    setEditMode(false);
  }

  function handleDragStart(ev: React.DragEvent<HTMLTableRowElement>) {
    const idx = Number(ev.currentTarget.dataset.index);
    dragIndexRef.current = idx;
    ev.dataTransfer.setData("text/plain", String(idx));
    ev.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(ev: React.DragEvent<HTMLTableRowElement>) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
    const idx = Number(ev.currentTarget.dataset.index);
    overIndexRef.current = idx;
  }

  function handleDrop(_ev: React.DragEvent<HTMLTableRowElement>) {
    const from = dragIndexRef.current;
    const to = overIndexRef.current;
    dragIndexRef.current = null;
    overIndexRef.current = null;
    if (from == null || to == null || from === to) return;

    setRows((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function handleCopyTable() {
    const bodyRows = rows
      .map((r, i) => ({ r, i }))
      .filter(({ r, i }) => (editMode && !showExcluded ? !excluded.has(keyOf(r, i)) : true))
      .map(({ r }) => r);

    const tsv = bodyRows
      .map((r) => {
        return [applyTextFormat(r.area ?? "", areaFormat), String(r.total ?? 0), String(r.lateCount ?? 0)].join("\t");
      })
      .join("\n");

    void navigator.clipboard.writeText(tsv);
  }

  return (
    <div className="glass-card inner-glow rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest/40">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-on-surface">Resumen por área</h3>
          {editMode && totalExcluded > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-destructive-container text-on-destructive-container text-[11px] font-bold uppercase tracking-wider">
              Excluidas: {totalExcluded}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
            <Input
              type="text"
              placeholder="Buscar área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 bg-surface-container-low border-outline-variant/30 rounded-full w-48"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 border border-outline-variant/30 rounded-lg px-3 py-1.5 bg-surface-container-lowest">
            <ArrowUpDown className="w-4 h-4 text-on-surface-variant/60" />
            <input
              type="range"
              min={200}
              max={800}
              step={50}
              value={tableHeight}
              onChange={(e) => setTableHeight(Number(e.target.value))}
              className="w-24 accent-primary"
              title={`Altura: ${tableHeight}px`}
            />
            <span className="text-body-sm text-on-surface-variant w-10 text-right">{tableHeight}px</span>
          </div>

          <Button variant="outline" size="sm" onClick={() => setAreaFormat((f) => cycleFormat(f))} title={`Cambiar formato: ${FORMAT_LABEL[areaFormat]}`}>
            <Type className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyTable} title="Copiar filas visibles">
            <Copy className="w-4 h-4" />
          </Button>
          {onClear && (
            <Button variant="outline" size="sm" onClick={onClear} title="Limpiar datos">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {editMode && (
            <Button variant="outline" size="sm" onClick={() => setShowExcluded((v) => !v)} title={showExcluded ? "Ocultar excluidas" : "Ver excluidas"}>
              {showExcluded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
          {!editMode ? (
            <Button variant="outline" size="sm" onClick={toggleEdit} title="Entrar en modo edición">
              <Pencil className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={handleCommit} title="Confirmar cambios">
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExcluded(new Set());
                  setRows(data ?? []);
                  setEditMode(false);
                }}
                title="Descartar cambios"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: tableHeight }}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low/50 border-b border-outline-variant/20">
            <tr>
              <th className="w-10 px-4 py-3 text-label-caps text-on-surface-variant/80 tracking-widest uppercase">{editMode ? "⋮⋮" : ""}</th>
              {editMode && <th className="w-10 px-4 py-3 text-label-caps text-on-surface-variant/80 tracking-widest uppercase">•</th>}
              <th
                className="px-4 py-3 text-label-caps text-on-surface-variant/80 tracking-widest uppercase whitespace-nowrap select-none cursor-pointer hover:bg-surface-container-high/50 transition"
                onClick={() => handleSort("area")}
              >
                <span className="inline-flex items-center gap-1">
                  {applyTextFormat("Área", areaFormat)}
                  {sortColumn === "area" && (sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                </span>
              </th>
              <th
                className="px-4 py-3 text-label-caps text-on-surface-variant/80 tracking-widest uppercase text-center whitespace-nowrap select-none cursor-pointer hover:bg-surface-container-high/50 transition"
                onClick={() => handleSort("total")}
              >
                <span className="inline-flex items-center gap-1">
                  Total
                  {sortColumn === "total" && (sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                </span>
              </th>
              <th
                className="px-4 py-3 text-label-caps text-on-surface-variant/80 tracking-widest uppercase text-center whitespace-nowrap select-none cursor-pointer hover:bg-surface-container-high/50 transition"
                onClick={() => handleSort("late")}
              >
                <span className="inline-flex items-center gap-1">
                  {lateLabel}
                  {sortColumn === "late" && (sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-outline-variant/10">
            {!visibleRows || visibleRows.length === 0 ? (
              <tr>
                <td colSpan={editMode ? 5 : 4} className="px-4 py-8 text-center text-on-surface-variant">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              visibleRows.map((item) => {
                const realIdx = rows.indexOf(item);
                const k = keyOf(item, realIdx);
                const isExcluded = excluded.has(k);

                return (
                  <tr
                    key={k}
                    data-index={realIdx}
                    className={`transition hover:bg-primary-container/5 ${isExcluded ? "opacity-60 line-through" : ""}`}
                    draggable={editMode}
                    onDragStart={editMode ? handleDragStart : undefined}
                    onDragOver={editMode ? handleDragOver : undefined}
                    onDrop={editMode ? handleDrop : undefined}
                  >
                    <td className="px-4 py-3 text-on-surface-variant select-none">{editMode ? "⠿" : ""}</td>
                    {editMode && (
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => toggleExclude(k)} title={isExcluded ? "Incluir área" : "Excluir área"}>
                          {isExcluded ? <Undo2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium text-on-surface">{applyTextFormat(item.area ?? "", areaFormat)}</td>
                    <td className="px-4 py-3 text-center font-data-mono text-data-mono text-on-surface">{nf.format(item.total)}</td>
                    <td className="px-4 py-3 text-center font-data-mono text-data-mono text-on-surface">{nf.format(item.lateCount)}</td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot className="bg-surface-container-low/50 border-t border-outline-variant/20 sticky bottom-0 z-10">
            <tr className="font-semibold">
              <td className="px-4 py-3" />
              {editMode && <td className="px-4 py-3" />}
              <td className="px-4 py-3 text-right text-on-surface">
                Totales{totalExcluded > 0 ? ` (excluidas: ${totalExcluded})` : ""}:
              </td>
              <td className="px-4 py-3 text-center font-data-mono text-data-mono">{nf.format(totalVol)}</td>
              <td className="px-4 py-3 text-center font-data-mono text-data-mono">{nf.format(totalLate)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TableResumen;
