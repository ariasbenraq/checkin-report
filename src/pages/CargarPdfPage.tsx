// src/pages/CargarPdfPage.tsx
import { useState } from 'react';
import TableResumen from '../components/TableResumen';
import { parsePdfTextAllServices } from '../utils/pdfParser';
import type { AreaResumen } from '../features/checkins/types/resumen';
import type { ServiceKey } from '../features/checkins/constants';
import { getLateLabel, getServiceLabel } from '../features/checkins/constants';
import { ServicePicker } from "../components/ServicePicker";

export default function CargarPdfPage() {
  const [byService, setByService] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [], SUN_10A: [], SUN_12P: [], SUN_5P: []
  });
  const [selected, setSelected] = useState<ServiceKey>('SUN_8A');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  async function handleProcessPdf(file: File) {
    // Extrae texto de tu PDF como ya lo haces:
    const text = await file.text(); // o tu util de extracción
    const all = parsePdfTextAllServices(text);
    setByService(all);

    // Selecciona automáticamente el primero que tenga datos
    if (all.SUN_8A.length) setSelected('SUN_8A');
    else if (all.SUN_10A.length) setSelected('SUN_10A');
    else if (all.SUN_12P.length) setSelected('SUN_12P');
    else if (all.SUN_5P.length) setSelected('SUN_5P');
  }

  const data = byService[selected] ?? [];
  const lateLabel = getLateLabel(selected);

  const counts = {
    SUN_8A: byService.SUN_8A?.length ?? 0,
    SUN_10A: byService.SUN_10A?.length ?? 0,
    SUN_12P: byService.SUN_12P?.length ?? 0,
    SUN_5P: byService.SUN_5P?.length ?? 0,
  };

  return (
    <div className="space-y-4">
      {/* --- Selector de horario --- */}
      <ServicePicker value={selected} onChange={setSelected} counts={counts} />

      {/* --- Tu dropzone/botón para cargar PDF --- */}
      {/* reemplaza onChange según tu uploader */}
      <input
        type="file"
        accept="application/pdf"
        onChange={e => e.target.files && handleProcessPdf(e.target.files[0])}
        className="block"
      />

      {/* --- Tabla --- */}
      {data.length ? (
        <TableResumen
          data={[...data].sort((a,b)=> selectedSort(a,b,sortOrder))}
          lateLabel={lateLabel}
        />
      ) : (
        <p className="text-sm text-gray-600">
          {`No hay registros para ${getServiceLabel(selected)} en este PDF.`}
        </p>
      )}
    </div>
  );
}

function selectedSort(a: AreaResumen, b: AreaResumen, order: 'asc'|'desc') {
  return order === 'asc'
    ? a.area.localeCompare(b.area, 'es')
    : b.area.localeCompare(a.area, 'es');
}
