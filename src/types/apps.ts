import type { PageResult, ResourceDetail, ResourceSummary } from "@/types/common";

export interface AppSummary extends ResourceSummary {
  type: "app";
  departmentId: string | null;
  departmentName: string | null;
  rating?: number;
}

export interface AppDetail extends ResourceDetail, Omit<AppSummary, keyof ResourceSummary> {
  type: "app";
  deliveryTypes: string[];
  latestSecurityReport?: string;
}

export interface DepartmentSummary {
  departmentId: string;
  name: string;
  description: string;
  memberCount?: number;
  resourceCount: number;
  logoUrl: string | null;
}

export interface AppHuntEntry {
  entryId: string;
  rank: number;
  app: { id: string; name: string; description: string; iconUrl: string | null };
  votes: number;
  hasVoted: boolean;
}

export interface AppHuntPayload {
  periodId: string;
  periodName: string;
  periodStatus?: string;
  description?: string;
  closesAt?: string;
  entries: AppHuntEntry[];
  history: Array<{ periodId: string; periodName: string; winnerName: string }>;
}

export interface DepartmentDetail extends DepartmentSummary {
  leader?: string;
  members?: Array<{ employeeId: string; displayName: string; role: string }>;
  metadata?: Record<string, unknown>;
  applications: AppSummary[];
}

export interface DepartmentDto {
  departmentId: string;
  name: string;
  description: string;
  memberCount: number;
  applicationCount: number;
}

export interface DepartmentDetailDto {
  departmentId: string;
  name: string;
  description: string;
  metadata: unknown;
  applications: import("@/types/common").PortalResourceItemDto[];
}

export interface AppHuntRowDto {
  periodId: string;
  periodName: string;
  periodStatus: string;
  entryId: string;
  applicationId: string;
  name: string;
  summary: string;
  voteCount: number;
  hasVoted: boolean;
}

export type AppPage = PageResult<AppSummary>;
