import { apiFetch, mapPortalResource, mapPortalResourceDetail, portalMetadata, queryString, useFixtures } from "@/apis/common";
import { fixtureAppPage, fixtureDepartment, fixtureDepartments, fixtureDetail, fixtureHunt } from "@/apis/fixtures";
import type { AppDetail, AppHuntPayload, AppHuntRowDto, AppPage, AppSummary, DepartmentDetail, DepartmentDetailDto, DepartmentDto, DepartmentSummary, ListQuery, PageResult, PortalResourceItemDto } from "@/types";

function mapAppSummary(item: PortalResourceItemDto): AppSummary {
  const metadata = portalMetadata(item.metadata);
  return { ...mapPortalResource(item), type: "app", departmentId: typeof metadata.departmentId === "string" ? metadata.departmentId : null, departmentName: typeof metadata.departmentName === "string" ? metadata.departmentName : null };
}

export async function listApps(query: ListQuery): Promise<AppPage> {
  if (useFixtures) return fixtureAppPage(query);
  const result = await apiFetch<PageResult<PortalResourceItemDto>>(`/internal/portal/apps${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`, {}, { allowAnonymousRetry: true });
  return { ...result, items: result.items.map(mapAppSummary) };
}

export async function getApp(userId: string, slug: string): Promise<AppDetail> {
  if (useFixtures) return fixtureDetail("app", slug) as AppDetail;
  const item = await apiFetch<PortalResourceItemDto>(`/internal/portal/apps/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`, {}, { allowAnonymousRetry: true });
  const metadata = portalMetadata(item.metadata);
  return { ...mapPortalResourceDetail(item), ...mapAppSummary(item), type: "app", deliveryTypes: Array.isArray(metadata.deliveryTypes) ? metadata.deliveryTypes.filter((value): value is string => typeof value === "string") : [], ...(typeof metadata.latestSecurityReport === "string" ? { latestSecurityReport: metadata.latestSecurityReport } : {}) };
}

export async function getAppsHunt(): Promise<AppHuntPayload> {
  if (useFixtures) return fixtureHunt();
  const rows = await apiFetch<AppHuntRowDto[]>("/internal/portal/apps-hunt", {}, { allowAnonymousRetry: true });
  const current = rows.find((row) => row.periodStatus === "active") ?? rows[0];
  if (!current) return { periodId: "", periodName: "暂无进行中的应用评选", periodStatus: "empty", entries: [], history: [] };
  const currentRows = rows.filter((row) => row.periodId === current.periodId);
  const otherPeriods = new Map<string, AppHuntRowDto>();
  rows.forEach((row) => {
    if (row.periodId !== current.periodId && !otherPeriods.has(row.periodId)) otherPeriods.set(row.periodId, row);
  });
  return {
    periodId: current.periodId,
    periodName: current.periodName,
    periodStatus: current.periodStatus,
    entries: currentRows.map((row, index) => ({
      entryId: row.entryId,
      rank: index + 1,
      app: { id: row.applicationId, name: row.name, description: row.summary, iconUrl: null },
      votes: row.voteCount,
      hasVoted: row.hasVoted,
    })),
    history: Array.from(otherPeriods.values(), (row) => ({ periodId: row.periodId, periodName: row.periodName, winnerName: row.name })),
  };
}

export async function voteForApp(periodId: string, entryId: string) {
  if (useFixtures) return { periodId, entryId, active: true };
  return apiFetch<{ periodId: string; entryId: string; active: boolean }>("/internal/portal/apps-hunt/votes", { method: "POST", body: JSON.stringify({ periodId, entryId }) });
}

export async function listDepartments(): Promise<DepartmentSummary[]> {
  if (useFixtures) return fixtureDepartments;
  return (await apiFetch<DepartmentDto[]>("/internal/portal/departments", {}, { allowAnonymousRetry: true })).map((item) => ({
    departmentId: item.departmentId,
    name: item.name,
    description: item.description,
    memberCount: item.memberCount,
    resourceCount: item.applicationCount,
    logoUrl: null,
  }));
}

export async function getDepartment(departmentId: string): Promise<DepartmentDetail> {
  if (useFixtures) return fixtureDepartment(departmentId);
  const item = await apiFetch<DepartmentDetailDto>(`/internal/portal/departments/${encodeURIComponent(departmentId)}`, {}, { allowAnonymousRetry: true });
  const metadata = portalMetadata(item.metadata);
  const applications = item.applications.map(mapAppSummary);
  const members = Array.isArray(metadata.members)
    ? metadata.members.filter((member): member is { employeeId: string; displayName: string; role: string } => member !== null && typeof member === "object" && typeof (member as Record<string, unknown>).employeeId === "string" && typeof (member as Record<string, unknown>).displayName === "string" && typeof (member as Record<string, unknown>).role === "string")
    : undefined;
  return {
    departmentId: item.departmentId,
    name: item.name,
    description: item.description,
    resourceCount: applications.length,
    logoUrl: typeof metadata.logoUrl === "string" ? metadata.logoUrl : null,
    metadata,
    applications,
    ...(typeof metadata.memberCount === "number" ? { memberCount: metadata.memberCount } : {}),
    ...(typeof metadata.leader === "string" ? { leader: metadata.leader } : {}),
    ...(members ? { members } : {}),
  };
}
