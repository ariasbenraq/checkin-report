export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">¿Cómo usar la app con tu PDF de Planning Center?</h1>

      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">1) ¿Qué necesitas?</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>Acceso a <strong>Planning Center &gt; Check-Ins</strong>.</li>
          <li>Descargar un <strong>PDF</strong> del reporte del domingo.</li>
          <li>Un navegador para abrir esta app.</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">2) Cómo obtener el PDF correcto en Planning Center</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Entra a <strong>Check-Ins &gt; Reportes</strong> y elige el domingo a procesar.</li>
          <li>Configura:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Fecha:</strong> el domingo correspondiente.</li>
              <li><strong>Agrupar por:</strong> <em>Grouped by Time</em>.</li>
              <li>Verifica que el PDF muestre:
                <div className="mt-1 rounded bg-gray-100 p-2 text-sm">
                  Grouped by Time: Sunday 8:00a<br/>
                  Grouped by Time: Sunday 10:00a<br/>
                  Grouped by Time: Sunday 12:00p
                </div>
              </li>
              <li>Incluye a <strong>Voluntarios</strong> (y áreas).</li>
            </ul>
          </li>
          <li>Descarga como <strong>PDF</strong>.</li>
        </ol>
        <p className="text-sm text-gray-500">
          No edites el PDF. La app necesita esos textos tal cual (encabezados y horas como <em>7:23am</em>).
        </p>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">3) Procesar el PDF en esta app</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Ve a <strong>Cargar PDF</strong>.</li>
          <li>Arrastra o selecciona el archivo y pulsa <strong>Procesar PDF</strong>.</li>
          <li>Cambia entre horarios con los botones <strong>8:00a / 10:00a / 12:00p</strong>.</li>
        </ol>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">4) ¿Cómo leer la tabla?</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Total voluntarios:</strong> personas listadas en esa <em>área</em> para el servicio seleccionado.</li>
          <li><strong>Llegaron después del umbral:</strong> compara la hora de llegada con:
            <div className="mt-1 rounded bg-gray-100 p-2 text-sm">
              8:00a → &gt; 7:00am &nbsp;|&nbsp; 10:00a → &gt; 9:30am &nbsp;|&nbsp; 12:00p → &gt; 11:30am
            </div>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">5) Exportar o compartir</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li><strong>Copiar tabla</strong>: copia los datos al portapapeles.</li>
          <li><strong>Exportar Excel</strong>: descarga un .xlsx con los datos del horario actual.</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-3">
        <h2 className="text-lg font-semibold">6) Consejos y resolución de problemas</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Si un horario sale en cero, confirma que el PDF tiene el encabezado correcto para ese horario.</li>
          <li>Si una <em>área</em> no aparece, revisa la ortografía en el PDF (debe coincidir con los nombres esperados).</li>
          <li>Una persona inscrita en varios servicios puede aparecer en varias secciones; su llegada se compara con el umbral del horario que estás viendo.</li>
        </ul>
      </section>
    </div>
  );
}
