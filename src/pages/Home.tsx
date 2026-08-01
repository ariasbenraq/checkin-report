import { BarChart3, Users, Heart, Clock, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-display font-display text-on-surface mb-1">Dashboard</h2>
          <p className="text-body-md text-on-surface-variant">Overview of today's congregation metrics and volunteer activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card inner-glow rounded-xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <BarChart3 className="w-[120px] h-[120px]" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim text-label-caps font-semibold">+5.2%</span>
          </div>
          <p className="text-body-md text-on-surface-variant font-medium">Asistencia Total</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-display text-on-surface">85%</h3>
            <p className="text-body-sm text-on-surface-variant opacity-60">vs prev. month</p>
          </div>
        </div>

        <div className="glass-card inner-glow rounded-xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Heart className="w-[120px] h-[120px]" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary-container">
              <Heart className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-fixed/20 text-primary-fixed-dim text-label-caps font-semibold">Active Now</span>
          </div>
          <p className="text-body-md text-on-surface-variant font-medium">Voluntarios Activos</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-display text-on-surface">120</h3>
            <p className="text-body-sm text-on-surface-variant opacity-60">Full capacity</p>
          </div>
        </div>

        <div className="glass-card inner-glow rounded-xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Clock className="w-[120px] h-[120px]" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-destructive-container/20 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-destructive-container/20 text-destructive text-label-caps font-semibold">Needs Attention</span>
          </div>
          <p className="text-body-md text-on-surface-variant font-medium">Llegadas Tardías</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-display text-on-surface">12</h3>
            <p className="text-body-sm text-on-surface-variant opacity-60">Today's count</p>
          </div>
        </div>
      </div>

      <section className="glass-card inner-glow rounded-xl p-6 space-y-4">
        <h3 className="text-headline-sm text-on-surface">¿Cómo usar la app con tu PDF de Planning Center?</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl">
            <h4 className="font-semibold text-body-md text-on-surface mb-2">1) ¿Qué necesitas?</h4>
            <ul className="list-disc pl-6 space-y-1 text-on-surface-variant">
              <li>Acceso a <strong>Planning Center &gt; Check-Ins</strong>.</li>
              <li>Descargar un <strong>PDF</strong> del reporte del domingo.</li>
              <li>Un navegador para abrir esta app.</li>
            </ul>
          </div>

          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl">
            <h4 className="font-semibold text-body-md text-on-surface mb-2">2) Procesar el PDF</h4>
            <ol className="list-decimal pl-6 space-y-2 text-on-surface-variant">
              <li>Ve a <strong>Reports</strong> en el sidebar.</li>
              <li>Arrastra o selecciona el archivo y pulsa <strong>Procesar PDF</strong>.</li>
              <li>Cambia entre servicios con los botones <strong>1er / 2do / 3er servicio / NochesCDV</strong>.</li>
            </ol>
          </div>

          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl">
            <h4 className="font-semibold text-body-md text-on-surface mb-2">3) Consejos</h4>
            <ul className="list-disc pl-6 space-y-1 text-on-surface-variant">
              <li>Si un horario sale en cero, confirma que el PDF tiene el encabezado correcto.</li>
              <li>Si una área no aparece, revisa la ortografía en el PDF.</li>
              <li><strong>Copiar tabla</strong>: copia los datos al portapapeles.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
