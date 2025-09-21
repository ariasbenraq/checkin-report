// src/pages/CargarPdfPage.tsx
import { useState } from 'react';
import TableResumen from '../components/TableResumen';
import { parsePdfTextAllServices } from '../utils/pdfParser';
import type { AreaResumen } from '../features/checkins/types/resumen';
import type { ServiceKey } from '../features/checkins/constants';
import { SERVICE_LABEL, LATE_LABEL } from '../features/checkins/constants';

export default function CargarPdfPage() {
  const [byService, setByService] = useState<Record<ServiceKey, AreaResumen[]>>({
    SUN_8A: [], SUN_10A: [], SUN_12P: []
  });
  const [selected, setSelected] = useState<ServiceKey>('SUN_8A');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const onToggleSort = () => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));

  async function handleProcessPdf(file: File) {
    // Extrae texto de tu PDF como ya lo haces:
    const text = await file.text(); // o tu util de extracción
    const all = parsePdfTextAllServices(text);
    setByService(all);

    // Selecciona automáticamente el primero que tenga datos
    if (all.SUN_8A.length) setSelected('SUN_8A');
    else if (all.SUN_10A.length) setSelected('SUN_10A');
    else if (all.SUN_12P.length) setSelected('SUN_12P');
  }

  const data = byService[selected] ?? [];
  const lateLabel = LATE_LABEL[selected];

  return (
    <div className="space-y-4">
      {/* --- Selector de horario --- */}
      <div className="flex gap-2">
        {(['SUN_8A','SUN_10A','SUN_12P'] as ServiceKey[]).map(key => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-3 py-2 rounded-md border ${selected === key ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            {SERVICE_LABEL[key]}
          </button>
        ))}
      </div>

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
          sortOrder={sortOrder}
          onToggleSort={onToggleSort}
          lateLabel={lateLabel} // <- etiqueta dinámica
        />
      ) : (
        <p className="text-sm text-gray-600">
          {`No hay registros para ${SERVICE_LABEL[selected]} en este PDF.`}
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
