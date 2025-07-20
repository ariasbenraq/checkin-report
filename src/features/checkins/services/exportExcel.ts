import * as XLSX from "xlsx";
import type { AreaResumen } from "../types/resumen";

export function exportToExcel(data: AreaResumen[]): void {
  const worksheetData = [
    ["Área", "Total voluntarios", "Llegaron después de 7:30am"],
    ...data.map((item) => [item.area, item.total, item.lateCount]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen");

  const today = new Date().toISOString().split("T")[0];
  const fileName = `resumen-voluntarios-${today}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
