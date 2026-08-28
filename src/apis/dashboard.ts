import { copy } from "@/apis/static-data";
import { ApiError, apiFetch, mapCommentAuthor, mapPortalResource, queryString, useFixtures } from "@/apis/common";
import { fixtureDashboard, fixtureDashboardComments, fixtureStars } from "@/apis/fixtures";
import type { ApiIssue, ApplicationDraftResponseDto, CreatedDraft, DashboardCommentItem, DashboardCommentPage, DashboardOverview, DashboardOverviewDto, PageResult, PortalApplicationUpload, PortalCommentItemDto, PortalResourceItemDto, PortalUploadKind, PublishDraft, ResourceSummary, ResourceType } from "@/types";

export async function getDashboard(): Promise<DashboardOverview> {
  if (useFixtures) return fixtureDashboard();
  const result = await apiFetch<DashboardOverviewDto>("/internal/portal/dashboard");
  return {
    counts: { app: result.counts.apps, skill: result.counts.skills, plugin: result.counts.plugins, mcp: result.counts.mcps },
    favoriteCount: result.counts.favorites,
    recent: result.recentResources.map((item) => ({
      id: item.resourceId,
      name: item.name,
      type: item.resourceType,
      status: item.status,
      href: `/dashboard/publish?type=${item.resourceType}&resourceId=${encodeURIComponent(item.resourceId)}`,
      updatedAt: item.updatedAt,
    })),
  };
}

export async function getDashboardStars(page = 1, pageSize = 20): Promise<PageResult<ResourceSummary>> {
  if (useFixtures) return fixtureStars(page, pageSize);
  const result = await apiFetch<PageResult<PortalResourceItemDto>>(`/internal/portal/dashboard/stars${queryString({ page, pageSize })}`);
  return { ...result, items: result.items.map(mapPortalResource) };
}

export interface DashboardCommentQuery { view: "replies" | "mine"; resourceType?: ResourceType; sort: "latest" | "oldest"; page: number; pageSize: number; }

function mapDashboardComment(item: PortalCommentItemDto): DashboardCommentItem {
  return {
    commentId: item.commentId,
    resourceType: item.resourceType,
    resourceId: item.resourceId,
    resourceName: item.resourceName,
    resourceHref: item.resourceHref,
    body: item.body,
    kind: item.kind,
    author: mapCommentAuthor(item.author),
    parentComment: item.parentComment ? { commentId: item.parentComment.commentId, body: item.parentComment.body, author: mapCommentAuthor(item.parentComment.author) } : null,
    createdAt: item.createdAt,
  };
}

export async function getDashboardComments(query: DashboardCommentQuery): Promise<DashboardCommentPage> {
  if (useFixtures) return fixtureDashboardComments(query.view, query.resourceType, query.sort, query.page, query.pageSize);
  const result = await apiFetch<PageResult<PortalCommentItemDto>>(`/internal/portal/dashboard/comments${queryString({ view: query.view, resourceType: query.resourceType, sort: query.sort, page: query.page, pageSize: query.pageSize })}`);
  return { ...result, items: result.items.map(mapDashboardComment) };
}

export async function createPublishDraft(draft: PublishDraft): Promise<CreatedDraft> {
  if (draft.type === "app" && !draft.applicationDraft) {
    throw new ApiError(400, "PORTAL_APP_DRAFT_REQUIRED", "应用必须提供完整 applicationDraft");
  }
  if (useFixtures) return { id: crypto.randomUUID(), type: draft.type, name: draft.name, slug: draft.slug, href: "#", description: draft.description, iconUrl: null, owner: { employeeId: "DEMO-EMPLOYEE", displayName: "林知行", avatarUrl: null, departmentName: null }, tags: draft.tags, stars: 0, updatedAt: new Date().toISOString(), status: "draft", isStarred: false };
  const body = draft.type === "app"
    ? { resourceType: draft.type, slug: draft.slug, name: draft.name, summary: draft.description, applicationDraft: draft.applicationDraft }
    : { resourceType: draft.type, slug: draft.slug, name: draft.name, summary: draft.description, metadata: { ...draft.metadata, tags: draft.tags, assetNames: draft.assetNames } };
  return mapPortalResource(await apiFetch<PortalResourceItemDto>("/internal/portal/dashboard/publish", { method: "POST", body: JSON.stringify(body) }));
}

export async function savePublishVersion(resourceId: string, draft: PublishDraft) {
  if (useFixtures) return { resourceId, resourceType: draft.type, version: draft.version };
  const body = draft.type === "app"
    ? { version: draft.version, changelog: draft.applicationDraft.changelog }
    : { version: draft.version, changelog: draft.metadata.changelog ?? "首次发布", metadata: draft.metadata };
  return apiFetch<{ resourceId: string; resourceType: ResourceType; version: string }>(`/internal/portal/dashboard/publish/${draft.type}/${resourceId}/versions`, { method: "POST", body: JSON.stringify(body) });
}

/** 提交审核成功后服务端返回最新 PortalResourceItem（app 首次提交状态为 in_review）。 */
export async function submitPublishDraft(resourceType: ResourceType, resourceId: string): Promise<ResourceSummary> {
  if (useFixtures) return { id: resourceId, type: resourceType, name: "已提交资源", slug: "submitted", href: "#", description: "", iconUrl: null, owner: { employeeId: "DEMO-EMPLOYEE", displayName: "林知行", avatarUrl: null, departmentName: null }, tags: [], stars: 0, updatedAt: new Date().toISOString(), status: "in_review", isStarred: false };
  return mapPortalResource(await apiFetch<PortalResourceItemDto>(`/internal/portal/dashboard/publish/${resourceType}/${resourceId}/submit`, { method: "POST" }));
}

/** 更新发布草稿；app 必须携带完整 applicationDraft，服务端返回最新 PortalResourceItem。 */
export async function updatePublishDraft(resourceId: string, draft: PublishDraft): Promise<ResourceSummary> {
  if (useFixtures) return { id: resourceId, type: draft.type, name: draft.name, slug: draft.slug, href: "#", description: draft.description, iconUrl: null, owner: { employeeId: "DEMO-EMPLOYEE", displayName: "林知行", avatarUrl: null, departmentName: null }, tags: draft.tags, stars: 0, updatedAt: new Date().toISOString(), status: "draft", isStarred: false };
  const body = draft.type === "app"
    ? { slug: draft.slug, name: draft.name, summary: draft.description, applicationDraft: draft.applicationDraft }
    : { slug: draft.slug, name: draft.name, summary: draft.description, metadata: { ...draft.metadata, tags: draft.tags, assetNames: draft.assetNames } };
  return mapPortalResource(await apiFetch<PortalResourceItemDto>(`/internal/portal/dashboard/publish/${draft.type}/${resourceId}`, { method: "PUT", body: JSON.stringify(body) }));
}

/** 读取应用完整草稿，用于刷新后的续编和提交失败恢复。 */
export async function getPublishAppDraft(resourceId: string): Promise<{ resource: ResourceSummary; applicationDraft: ApplicationDraftResponseDto["applicationDraft"]; draftUpdatedAt: string }> {
  if (useFixtures) throw new ApiError(503, "PORTAL_APP_DRAFT_UNAVAILABLE", "fixture 模式不提供真实应用草稿回读");
  const result = await apiFetch<ApplicationDraftResponseDto>(`/internal/portal/dashboard/publish/app/${encodeURIComponent(resourceId)}`);
  return { resource: mapPortalResource(result.resource), applicationDraft: result.applicationDraft, draftUpdatedAt: result.draftUpdatedAt };
}

export interface CreateApplicationUploadInput {
  kind: PortalUploadKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

/** 创建 Portal 应用资产上传会话。 */
export async function createApplicationUpload(resourceId: string, input: CreateApplicationUploadInput): Promise<PortalApplicationUpload> {
  if (useFixtures) throw new ApiError(503, "PORTAL_ASSET_SERVICE_UNAVAILABLE", "fixture 模式不提供真实资产上传");
  return apiFetch<PortalApplicationUpload>(`/internal/portal/dashboard/publish/app/${encodeURIComponent(resourceId)}/uploads`, { method: "POST", body: JSON.stringify(input) });
}

/** 上传原始文件内容；统一使用 binary MIME，避免浏览器 MIME 绕过服务端 raw parser。 */
export async function uploadApplicationContent(resourceId: string, uploadId: string, content: Blob): Promise<PortalApplicationUpload> {
  if (useFixtures) throw new ApiError(503, "PORTAL_ASSET_SERVICE_UNAVAILABLE", "fixture 模式不提供真实资产上传");
  return apiFetch<PortalApplicationUpload>(`/internal/portal/dashboard/publish/app/${encodeURIComponent(resourceId)}/uploads/${encodeURIComponent(uploadId)}/content`, { method: "PUT", headers: { "content-type": "application/octet-stream" }, body: content });
}

/** 完成上传并接收服务端扫描状态与 assetId。 */
export async function completeApplicationUpload(resourceId: string, uploadId: string, signature?: string): Promise<PortalApplicationUpload> {
  if (useFixtures) throw new ApiError(503, "PORTAL_ASSET_SERVICE_UNAVAILABLE", "fixture 模式不提供真实资产上传");
  return apiFetch<PortalApplicationUpload>(`/internal/portal/dashboard/publish/app/${encodeURIComponent(resourceId)}/uploads/${encodeURIComponent(uploadId)}/complete`, { method: "POST", body: JSON.stringify(signature ? { signature } : {}) });
}

export async function getApplicationUpload(resourceId: string, uploadId: string): Promise<PortalApplicationUpload> {
  if (useFixtures) throw new ApiError(503, "PORTAL_ASSET_SERVICE_UNAVAILABLE", "fixture 模式不提供真实资产上传");
  return apiFetch<PortalApplicationUpload>(`/internal/portal/dashboard/publish/app/${encodeURIComponent(resourceId)}/uploads/${encodeURIComponent(uploadId)}`);
}

function publishedFixture(resourceId: string, resourceType: ResourceType): ResourceSummary {
  return { id: resourceId, type: resourceType, name: "已发布资源", slug: "published", href: "#", description: "", iconUrl: null, owner: { employeeId: "DEMO-EMPLOYEE", displayName: "林知行", avatarUrl: null, departmentName: null }, tags: [], stars: 0, updatedAt: new Date().toISOString(), status: "published", isStarred: false };
}

/** 审核通过（app 自动上架为 published；请求体可省略，服务端使用默认意见）。 */
export async function approvePublish(resourceType: ResourceType, resourceId: string, comment?: string): Promise<ResourceSummary> {
  if (useFixtures) return publishedFixture(resourceId, resourceType);
  return mapPortalResource(await apiFetch<PortalResourceItemDto>(`/internal/portal/dashboard/publish/${resourceType}/${resourceId}/approve`, { method: "POST", body: comment === undefined ? undefined : JSON.stringify({ comment }) }));
}

/** 要求修改（回到提交前状态，通常为 draft）。 */
export async function requestChangesPublish(resourceType: ResourceType, resourceId: string, comment?: string): Promise<ResourceSummary> {
  if (useFixtures) return { ...publishedFixture(resourceId, resourceType), name: "修改中资源", slug: "draft", status: "draft" as const };
  return mapPortalResource(await apiFetch<PortalResourceItemDto>(`/internal/portal/dashboard/publish/${resourceType}/${resourceId}/request-changes`, { method: "POST", body: comment === undefined ? undefined : JSON.stringify({ comment }) }));
}

/** 遗留发布（仅兼容历史 approved 应用；已 published 幂等成功）。 */
export async function publishLegacy(resourceType: ResourceType, resourceId: string): Promise<ResourceSummary> {
  if (useFixtures) return publishedFixture(resourceId, resourceType);
  return mapPortalResource(await apiFetch<PortalResourceItemDto>(`/internal/portal/dashboard/publish/${resourceType}/${resourceId}/publish`, { method: "POST" }));
}

/** 下架（请求体可省略，服务端使用固定说明）。 */
export async function withdrawPublish(resourceType: ResourceType, resourceId: string, reason?: string): Promise<ResourceSummary> {
  if (useFixtures) return { ...publishedFixture(resourceId, resourceType), name: "已下架资源", slug: "withdrawn", status: "withdrawn" as const };
  return mapPortalResource(await apiFetch<PortalResourceItemDto>(`/internal/portal/dashboard/publish/${resourceType}/${resourceId}/withdraw`, { method: "POST", body: reason === undefined ? undefined : JSON.stringify({ reason }) }));
}

export interface PublishErrorGuidance {
  message: string;
  issues: ApiIssue[];
  /** edit=回编辑页补全；refresh=刷新后重新选择操作；null=仅提示。 */
  action: "edit" | "refresh" | null;
}

/** 发布/审核失败提示指引；错误码以接口事实来源（handoff §3.2）为准。 */
export function publishErrorGuidance(error: unknown): PublishErrorGuidance {
  const apiError = error instanceof ApiError ? error : null;
  const code = apiError?.code ?? "";
  const action = code === "DRAFT_VALIDATION_FAILED" || code === "PORTAL_APP_DRAFT_REQUIRED"
    ? "edit"
    : code === "PORTAL_RESOURCE_STATE_CONFLICT" || code === "PORTAL_VERSION_ALREADY_EXISTS" || code === "PORTAL_REVIEW_CLAIMED_BY_OTHER" || code === "PORTAL_REVIEW_QUEUE_NOT_FOUND" || code === "REVIEW_QUEUE_CLAIM_REQUIRED"
      ? "refresh"
      : null;
  return { message: apiError?.message ?? copy.publish.failedToast, issues: apiError?.issues ?? [], action };
}
