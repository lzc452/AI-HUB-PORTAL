import { apiFetch, queryString, useFixtures } from "@/apis/common";
import { fixtureDashboard, fixtureDashboardComments, fixtureStars } from "@/apis/fixtures";
import type { CreatedDraft, DashboardCommentPage, DashboardOverview, PageResult, PublishDraft, ResourceSummary, ResourceType } from "@/types";

export async function getDashboard(): Promise<DashboardOverview> {
  if (useFixtures) return fixtureDashboard();
  return apiFetch<DashboardOverview>("/internal/portal/dashboard");
}

export async function getDashboardStars(page = 1, pageSize = 20): Promise<PageResult<ResourceSummary>> {
  if (useFixtures) return fixtureStars(page, pageSize);
  return apiFetch<PageResult<ResourceSummary>>(`/internal/portal/dashboard/stars${queryString({ page, pageSize })}`);
}

export interface DashboardCommentQuery { view: "replies" | "mine"; resourceType?: ResourceType; sort: "latest" | "oldest"; page: number; pageSize: number; }

export async function getDashboardComments(query: DashboardCommentQuery): Promise<DashboardCommentPage> {
  if (useFixtures) return fixtureDashboardComments(query.view, query.resourceType, query.sort, query.page, query.pageSize);
  return apiFetch<DashboardCommentPage>(`/internal/portal/dashboard/comments${queryString({ view: query.view, resourceType: query.resourceType, sort: query.sort, page: query.page, pageSize: query.pageSize })}`);
}

export async function createPublishDraft(draft: PublishDraft): Promise<CreatedDraft> {
  if (useFixtures) return { resourceId: crypto.randomUUID(), resourceType: draft.type, status: "draft" };
  return apiFetch<CreatedDraft>("/internal/portal/dashboard/publish", { method: "POST", body: JSON.stringify({ resourceType: draft.type, slug: draft.slug, name: draft.name, summary: draft.description, metadata: { ...draft.metadata, tags: draft.tags, assetNames: draft.assetNames } }) });
}

export async function savePublishVersion(resourceId: string, draft: PublishDraft) {
  if (useFixtures) return { resourceId, resourceType: draft.type, version: draft.version };
  return apiFetch<{ resourceId: string; resourceType: ResourceType; version: string }>(`/internal/portal/dashboard/publish/${draft.type}/${resourceId}/versions`, { method: "POST", body: JSON.stringify({ version: draft.version, changelog: draft.metadata.changelog ?? "首次发布", metadata: draft.metadata }) });
}

export async function submitPublishDraft(resourceType: ResourceType, resourceId: string) {
  if (useFixtures) return { resourceType, resourceId, status: "pending_review" as const };
  return apiFetch<{ resourceType: ResourceType; resourceId: string; status: string }>(`/internal/portal/dashboard/publish/${resourceType}/${resourceId}/submit`, { method: "POST" });
}
