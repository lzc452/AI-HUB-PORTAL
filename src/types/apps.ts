import type { PageResult, ResourceDetail, ResourceSummary } from "@/types/common";

export interface AppSummary extends ResourceSummary {
  type: "app";
  departmentId: string | null;
  departmentName: string | null;
  rating: number;
}

export interface AppDetail extends ResourceDetail, Omit<AppSummary, keyof ResourceSummary> {
  type: "app";
  deliveryTypes: string[];
  latestSecurityReport: string;
}

export interface DepartmentSummary {
  departmentId: string;
  name: string;
  description: string;
  memberCount: number;
  resourceCount: number;
  logoUrl: string | null;
}

export interface AppHuntEntry {
  entryId: string;
  rank: number;
  app: AppSummary;
  votes: number;
  hasVoted: boolean;
}

export interface AppHuntPayload {
  periodId: string;
  periodName: string;
  description: string;
  closesAt: string;
  entries: AppHuntEntry[];
  history: Array<{ periodId: string; periodName: string; winnerName: string }>;
}

export interface DepartmentDetail extends DepartmentSummary {
  leader: string;
  members: Array<{ employeeId: string; displayName: string; role: string }>;
  applications: AppSummary[];
}

export type AppPage = PageResult<AppSummary>;
