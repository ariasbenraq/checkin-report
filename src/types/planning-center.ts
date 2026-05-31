export type CheckInsEvent = {
  id: number;
  name: string;
};

export type EventPeriodService = {
  eventTimeId: number;
  label: string;
  startsAt: string;
  volunteerCount: number;
  totalCount: number;
};

export type EventPeriod = {
  id: number;
  startsAt: string;
  endsAt: string;
  volunteerCount: number;
  date: string;
  services: EventPeriodService[];
};

export type TeamCatalogItem = {
  teamId: number;
  teamKey: string;
  teamName: string;
};

export type CombinedService = {
  eventTimeId: number;
  label: string;
  startsAt: string;
  thresholdStartsAt: string;
  volunteerCount: number;
  totalCount: number;
  lateVolunteerCount: number;
};

export type CombinedRow = {
  teamId: number;
  teamKey: string;
  teamName: string;
  rawAreas: string[];
  totalVolunteerCount: number;
  totalLateVolunteerCount: number;
  countsByEventTime: Record<string, number>;
  lateCountsByEventTime: Record<string, number>;
};

export type CombinedTableResponse = {
  eventId: number;
  eventPeriod: {
    id: number;
    startsAt: string;
    endsAt: string;
    volunteerCount: number;
  } | null;
  date: string;
  filters: {
    teamId: number | null;
    lateAfterMinutes: number;
  };
  services: CombinedService[];
  rows: CombinedRow[];
};
