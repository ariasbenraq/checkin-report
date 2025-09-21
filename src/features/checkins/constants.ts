export type ServiceKey = 'SUN_8A' | 'SUN_10A' | 'SUN_12P';

export const SERVICE_LABEL: Record<ServiceKey, string> = {
  SUN_8A: 'Domingo 8:00 a.m.',
  SUN_10A: 'Domingo 10:00 a.m.',
  SUN_12P: 'Domingo 12:00 p.m.',
};

export const LATE_LABEL: Record<ServiceKey, string> = {
  SUN_8A: 'Llegaron después de 7:00am',
  SUN_10A: 'Llegaron después de 9:30am',
  SUN_12P: 'Llegaron después de 11:30am',
};
