export type ServiceKey = 'SUN_8A' | 'SUN_10A' | 'SUN_12P' | 'SUN_7P' | 'SUN_8P';
export type ScheduleMode = 'summer' | 'winter';

export const SCHEDULE_LABEL: Record<ScheduleMode, string> = {
  summer: 'Horario de verano',
  winter: 'Horario de invierno',
};

const SERVICE_LABELS: Record<ScheduleMode, Record<ServiceKey, string>> = {
  summer: {
    SUN_8A: 'Domingo 8:00 a.m.',
    SUN_10A: 'Domingo 10:00 a.m.',
    SUN_12P: 'Domingo 12:00 p.m.',
    SUN_7P: 'NochesCDV 6:00 p.m.',
    SUN_8P: 'Punto 8:00 p.m.',
  },
  winter: {
    SUN_8A: 'Domingo 9:00 a.m.',
    SUN_10A: 'Domingo 11:00 a.m.',
    SUN_12P: 'Domingo 1:00 p.m.',
    SUN_7P: 'NochesCDV 6:00 p.m.',
    SUN_8P: 'Punto 8:00 p.m.',
  },
};

const LATE_LABELS: Record<ScheduleMode, Record<ServiceKey, string>> = {
  summer: {
    SUN_8A: 'Llegaron después de 08:55am',
    SUN_10A: 'Llegaron después de 10:55am',
    SUN_12P: 'Llegaron después de 12:55pm',
    SUN_7P: 'Llegaron después de 5:55pm',
    SUN_8P: 'Llegaron después de 7:55pm',
  },
  winter: {
    SUN_8A: 'Llegaron después de 08:55am',
    SUN_10A: 'Llegaron después de 10:55am',
    SUN_12P: 'Llegaron después de 12:55pm',
    SUN_7P: 'Llegaron después de 5:55pm',
    SUN_8P: 'Llegaron después de 7:55pm',
  },
};

export function getServiceLabel(service: ServiceKey, scheduleMode: ScheduleMode): string {
  return SERVICE_LABELS[scheduleMode][service];
}

export function getLateLabel(service: ServiceKey, scheduleMode: ScheduleMode): string {
  return LATE_LABELS[scheduleMode][service];
}

const SERVICE_NAMES: Record<ServiceKey, string> = {
  SUN_8A: '1er. Servicio',
  SUN_10A: '2do. Servicio',
  SUN_12P: '3er. Servicio',
  SUN_7P: 'Noche CDV',
  SUN_8P: 'Punto',
};

export function getServiceName(service: ServiceKey): string {
  return SERVICE_NAMES[service];
}
