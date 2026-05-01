export type ServiceKey = 'SUN_8A' | 'SUN_10A' | 'SUN_12P' | 'SUN_7P';
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
  },
  winter: {
    SUN_8A: 'Domingo 9:00 a.m.',
    SUN_10A: 'Domingo 11:00 a.m.',
    SUN_12P: 'Domingo 1:00 p.m.',
    SUN_7P: 'NochesCDV 6:00 p.m.',
  },
};

const LATE_LABELS: Record<ScheduleMode, Record<ServiceKey, string>> = {
  summer: {
    SUN_8A: 'Llegaron después de 7:00am',
    SUN_10A: 'Llegaron después de 9:30am',
    SUN_12P: 'Llegaron después de 11:30am',
    SUN_7P: 'Llegaron después de 5:30pm',
  },
  winter: {
    SUN_8A: 'Llegaron después de 8:30am',
    SUN_10A: 'Llegaron después de 10:30am',
    SUN_12P: 'Llegaron después de 12:30pm',
    SUN_7P: 'Llegaron después de 5:30pm',
  },
};

export function getServiceLabel(service: ServiceKey, scheduleMode: ScheduleMode): string {
  return SERVICE_LABELS[scheduleMode][service];
}

export function getLateLabel(service: ServiceKey, scheduleMode: ScheduleMode): string {
  return LATE_LABELS[scheduleMode][service];
}
