import { apiFetch, queryString, useFixtures } from "@/apis/common";
import { fixtureAppPage, fixtureApps, fixtureDepartment, fixtureDepartments, fixtureDetail, fixtureHunt } from "@/apis/fixtures";
import type { AppDetail, AppHuntPayload, AppPage, DepartmentDetail, DepartmentSummary, ListQuery } from "@/types";

export async function listApps(query: ListQuery): Promise<AppPage> {
  if (useFixtures) return fixtureAppPage(query);
  return apiFetch<AppPage>(`/internal/portal/apps${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`);
}

export async function getApp(userId: string, slug: string): Promise<AppDetail> {
  if (useFixtures) return fixtureDetail("app", slug) as AppDetail;
  return apiFetch<AppDetail>(`/internal/portal/apps/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`);
}

export async function getAppsHunt(): Promise<AppHuntPayload> {
  if (useFixtures) return fixtureHunt();
  return apiFetch<AppHuntPayload>("/internal/portal/apps-hunt");
}

export async function voteForApp(periodId: string, entryId: string) {
  if (useFixtures) return { periodId, entryId, active: true };
  return apiFetch<{ periodId: string; entryId: string; active: boolean }>("/internal/portal/apps-hunt/votes", { method: "POST", body: JSON.stringify({ periodId, entryId }) });
}

export async function listDepartments(): Promise<DepartmentSummary[]> {
  if (useFixtures) return fixtureDepartments;
  return apiFetch<DepartmentSummary[]>("/internal/portal/departments");
}

export async function getDepartment(departmentId: string): Promise<DepartmentDetail> {
  if (useFixtures) return fixtureDepartment(departmentId);
  return apiFetch<DepartmentDetail>(`/internal/portal/departments/${encodeURIComponent(departmentId)}`);
}

export const featuredApps = fixtureApps;
