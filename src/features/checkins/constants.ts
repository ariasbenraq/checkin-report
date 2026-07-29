export type ServiceKey = 'SUN_8A' | 'SUN_10A' | 'SUN_12P' | 'SUN_5P';

const SERVICE_LABELS: Record<ServiceKey, string> = {
  SUN_8A: 'Domingo 8:00 a.m.',
  SUN_10A: 'Domingo 10:00 a.m.',
  SUN_12P: 'Domingo 12:00 p.m.',
  SUN_5P: 'Domingo 5:00 p.m.',
};

const LATE_LABELS: Record<ServiceKey, string> = {
  SUN_8A: 'Llegaron después de 7:00am',
  SUN_10A: 'Llegaron después de 9:30am',
  SUN_12P: 'Llegaron después de 11:30am',
  SUN_5P: 'Llegaron después de 4:00pm',
};

export function getServiceLabel(service: ServiceKey): string {
  return SERVICE_LABELS[service];
}

export function getLateLabel(service: ServiceKey): string {
  return LATE_LABELS[service];
}

const SERVICE_NAMES: Record<ServiceKey, string> = {
  SUN_8A: '1er. Servicio',
  SUN_10A: '2do. Servicio',
  SUN_12P: '3er. Servicio',
  SUN_5P: 'Noches CDV',
};

export function getServiceName(service: ServiceKey): string {
  return SERVICE_NAMES[service];
}
