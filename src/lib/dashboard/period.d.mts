export type DashboardPeriod = {
  month: string;
  startDate: string;
  endDate: string;
  asOfDate: string;
};

export function resolveDashboardPeriod(input?: unknown, now?: Date): DashboardPeriod;
