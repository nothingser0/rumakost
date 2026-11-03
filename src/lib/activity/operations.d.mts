import type { AuthAppUser } from "../auth/app-user";
import type { DashboardPeriod } from "../dashboard/period.mjs";

export type ActivityActor = Pick<
  AuthAppUser,
  "id" | "role" | "isActive" | "mustChangePassword"
>;

export type ActivityRecord = {
  id: string;
  source: "AUDIT" | "TICKET_STATUS";
  action: string;
  entityType: string;
  entityId: string;
  parentEntityId: string | null;
  occurredAt: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: AuthAppUser["role"] | null;
  actorType: "USER" | "SYSTEM";
  fromStatus: string | null;
  toStatus: string | null;
};

export type ActivityCursor = { occurredAt: string; id: string } | null;

export type ActivityRepository = {
  listActivity(input: {
    actorRole: "OWNER" | "STAFF";
    startDate: string;
    endDate: string;
    limit: number;
    cursor: ActivityCursor;
  }): Promise<ActivityRecord[]>;
};

export type ActivityPage = {
  period: Pick<DashboardPeriod, "month" | "startDate" | "endDate">;
  items: Array<{
    id: string;
    source: "AUDIT" | "TICKET_STATUS";
    action: string;
    occurredAt: string;
    actor: {
      id: string | null;
      name: string | null;
      role: AuthAppUser["role"] | null;
      type: "USER" | "SYSTEM";
    };
    entity: { type: string; id: string };
    statusChange: { fromStatus: string | null; toStatus: string | null } | null;
    href: string | null;
  }>;
  nextCursor: { occurredAt: string; id: string } | null;
};

export function canViewActivityAction(
  role: "OWNER" | "STAFF" | "TENANT",
  record: Pick<ActivityRecord, "entityType" | "action">,
): boolean;

export function activityHref(
  record: Pick<ActivityRecord, "entityType" | "entityId" | "parentEntityId">,
): string | null;

export function getActivityPage(input: {
  actor: ActivityActor;
  input?: unknown;
  repository: ActivityRepository;
  now?: Date;
}): Promise<ActivityPage>;
