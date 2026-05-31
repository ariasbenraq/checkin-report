import { useEffect, useMemo, useState } from 'react';
import {
  getCheckInsEvents,
  getCombinedTable,
  getEventPeriods,
  getTeams,
} from '../lib/planningCenterApi';
import type {
  CheckInsEvent,
  CombinedTableResponse,
  EventPeriod,
  TeamCatalogItem,
} from '../types/planning-center';

const DEFAULT_EVENT_ID = 981954;
const DEFAULT_DATE = '2026-05-03';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export default function PlanningCenterView() {
  const [events, setEvents] = useState<CheckInsEvent[]>([]);
  const [teams, setTeams] = useState<TeamCatalogItem[]>([]);
  const [eventPeriods, setEventPeriods] = useState<EventPeriod[]>([]);
  const [tableData, setTableData] = useState<CombinedTableResponse | null>(null);

  const [selectedEventId, setSelectedEventId] = useState<number>(DEFAULT_EVENT_ID);
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DATE);
  const [selectedEventPeriodId, setSelectedEventPeriodId] = useState<number | ''>('');
  const [selectedEventTimeId, setSelectedEventTimeId] = useState<number | ''>('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoadingEvents(true);

    void getCheckInsEvents()
      .then((data) => setEvents(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingEvents(false));
  }, []);

  useEffect(() => {
    setLoadingTeams(true);
    setSelectedTeamId('');

    void getTeams(selectedEventId)
      .then((data) => setTeams(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingTeams(false));
  }, [selectedEventId]);

  useEffect(() => {
    setLoadingPeriods(true);
    setError('');
    setSelectedEventPeriodId('');
    setSelectedEventTimeId('');
    setTableData(null);

    void getEventPeriods(selectedEventId, selectedDate)
      .then((periods) => {
        setEventPeriods(periods);
        if (periods.length > 0) {
          setSelectedEventPeriodId(periods[0].id);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingPeriods(false));
  }, [selectedDate, selectedEventId]);

  useEffect(() => {
    if (!selectedEventPeriodId) return;

    setLoadingTable(true);
    setError('');

    void getCombinedTable({
      eventId: selectedEventId,
      eventPeriodId: selectedEventPeriodId,
      teamId: selectedTeamId || undefined,
    })
      .then((data) => setTableData(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingTable(false));
  }, [selectedEventId, selectedEventPeriodId, selectedTeamId]);

  const selectedPeriod = useMemo(
    () => eventPeriods.find((period) => period.id === selectedEventPeriodId) ?? null,
    [eventPeriods, selectedEventPeriodId]
  );

  const serviceOptions = selectedPeriod?.services ?? [];
  const visibleServices = useMemo(() => {
    const services = tableData?.services ?? [];
    return selectedEventTimeId
      ? services.filter((service) => service.eventTimeId === selectedEventTimeId)
      : services;
  }, [selectedEventTimeId, tableData]);

  const visibleRows = useMemo(() => {
    const rows = tableData?.rows ?? [];
    if (!selectedEventTimeId) return rows;

    return rows.map((row) => ({
      ...row,
      countsByEventTime: {
        [String(selectedEventTimeId)]: row.countsByEventTime[String(selectedEventTimeId)] ?? 0,
      },
      lateCountsByEventTime: {
        [String(selectedEventTimeId)]:
          row.lateCountsByEventTime[String(selectedEventTimeId)] ?? 0,
      },
    }));
  }, [selectedEventTimeId, tableData]);

  const isLoading = loadingEvents || loadingTeams || loadingPeriods || loadingTable;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b_55%,#334155)] px-6 py-6 text-white">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Planning Center
              </p>
              <h1 className="mt-1 text-2xl font-bold">Asistencia de voluntarios</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Total de voluntarios y llegadas posteriores a la VIOS por servicio y área.
              </p>
            </div>

            {tableData?.eventPeriod && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                <div>Periodo: {tableData.eventPeriod.id}</div>
                <div>Inicio: {formatDateTime(tableData.eventPeriod.startsAt)}</div>
                <div>Fin: {formatDateTime(tableData.eventPeriod.endsAt)}</div>
              </div>
            )}
          </div>
        </header>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Sede</span>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Fecha</span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Servicio</span>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={selectedEventTimeId}
                onChange={(e) =>
                  setSelectedEventTimeId(e.target.value ? Number(e.target.value) : '')
                }
              >
                <option value="">Todos</option>
                {serviceOptions.map((service) => (
                  <option key={service.eventTimeId} value={service.eventTimeId}>
                    {service.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Área</span>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Todas</option>
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sede activa
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {events.find((event) => event.id === selectedEventId)?.name ?? 'Miraflores'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fecha consultada
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">{selectedDate}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                VIOS
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                1 hora antes del servicio
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
              Cargando datos desde Planning Center...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {tableData && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-900 text-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Área</th>
                      <th className="px-4 py-3 font-semibold">Total área</th>
                      <th className="px-4 py-3 font-semibold">Post VIOS área</th>
                      {visibleServices.map((service) => (
                        <th
                          key={`total-${service.eventTimeId}`}
                          className="px-4 py-3 font-semibold"
                        >
                          {service.label} total
                        </th>
                      ))}
                      {visibleServices.map((service) => (
                        <th
                          key={`late-${service.eventTimeId}`}
                          className="px-4 py-3 font-semibold"
                        >
                          {service.label} post VIOS
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {visibleRows.map((row) => (
                      <tr key={row.teamId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-slate-900">{row.teamName}</div>
                          <div className="text-xs text-slate-500">teamId: {row.teamId}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{row.totalVolunteerCount}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.totalLateVolunteerCount}
                        </td>

                        {visibleServices.map((service) => (
                          <td
                            key={`count-${row.teamId}-${service.eventTimeId}`}
                            className="px-4 py-3 text-slate-700"
                          >
                            {row.countsByEventTime[String(service.eventTimeId)] ?? 0}
                          </td>
                        ))}

                        {visibleServices.map((service) => (
                          <td
                            key={`latecount-${row.teamId}-${service.eventTimeId}`}
                            className="px-4 py-3 text-slate-700"
                          >
                            {row.lateCountsByEventTime[String(service.eventTimeId)] ?? 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>

                  <tfoot className="bg-slate-100 text-slate-900">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Totales</th>
                      <th className="px-4 py-3 font-semibold">
                        {visibleRows.reduce((sum, row) => sum + row.totalVolunteerCount, 0)}
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {visibleRows.reduce((sum, row) => sum + row.totalLateVolunteerCount, 0)}
                      </th>
                      {visibleServices.map((service) => (
                        <th
                          key={`foot-total-${service.eventTimeId}`}
                          className="px-4 py-3 font-semibold"
                        >
                          {service.volunteerCount}
                        </th>
                      ))}
                      {visibleServices.map((service) => (
                        <th
                          key={`foot-late-${service.eventTimeId}`}
                          className="px-4 py-3 font-semibold"
                        >
                          {service.lateVolunteerCount}
                        </th>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {!isLoading && !error && tableData && tableData.rows.length === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              No hay filas para los filtros seleccionados.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
