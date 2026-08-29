import { fallbacks } from "@/apis/static-data";
import { fixtureComments, fixtureHome } from "@/apis/fixtures";
import { SESSION_INVALID_EVENT, UNAUTHORIZED_EVENT } from "@/apis/session";
import type { ApiIssue, ApiProblem, ContentPageDto, DepartmentDto, EmployeeSummary, HomePayload, PortalCommentAuthorDto, PortalCommentItemDto, PortalResourceItemDto, ResourceComment, ResourceDetail, ResourceFileNode, ResourceSummary, ResourceType, SessionActor, SkillPackageDto } from "@/types";

export const useFixtures = import.meta.env.DEV && import.meta.env.VITE_PORTAL_USE_FIXTURES === "true";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly traceId?: string,
    readonly issues: ApiIssue[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split(";")
    .map((value) => value.trim().split("="))
    .find(([key]) => key === name)
    ?.slice(1)
    .join("=");
}

function normalizeIssuePath(path: string | string[] | undefined): string[] | undefined {
  const segments = typeof path === "string"
    ? path.split(".")
    : Array.isArray(path)
      ? path
      : [];
  const normalized = segments.filter(
    (segment): segment is string => typeof segment === "string" && segment.length > 0,
  );
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeApiIssues(issues: ApiProblem["issues"]): ApiIssue[] {
  if (!Array.isArray(issues)) return [];
  return issues.flatMap((issue) => {
    if (
      issue === null ||
      typeof issue !== "object" ||
      typeof issue.code !== "string" ||
      typeof issue.message !== "string"
    ) {
      return [];
    }
    const path = normalizeIssuePath(issue.path);
    return [{
      code: issue.code,
      message: issue.message,
      ...(path === undefined ? {} : { path }),
    }];
  });
}

export interface ApiFetchOptions {
  /**
   * 401 时不派发 portal:unauthorized（如 actor 探测：401=未登录是合法状态）。
   * 仅写端点/dashboard 读端点保留默认弹窗引导行为。
   */
  announceUnauthorized?: boolean;
  /**
   * 公开读端点（可选认证，契约 P1-5）：收到 401（携带无效会话）时，
   * 先派发 portal:session-invalid（main.tsx 清除本地登录态缓存），
   * 再以匿名身份重试一次（同一 URL/方法/body，cookie 由浏览器按 same-origin 携带）；
   * 重试成功即返回；仍失败（含再次 401）直接抛错走页面错误提示——
   * 不弹登录弹窗、不跳转、不再次重试（匿名限流 60s/120 次，只允许一次重试）。
   */
  allowAnonymousRetry?: boolean;
}

function readProblem(response: Response): Promise<ApiProblem> {
  return response.json().catch(() => ({})) as Promise<ApiProblem>;
}

function toApiError(response: Response, problem: ApiProblem): ApiError {
  return new ApiError(response.status, problem.code ?? "PORTAL_REQUEST_FAILED", problem.detail ?? problem.message ?? fallbacks.requestFailed, problem.traceId, normalizeApiIssues(problem.issues));
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, options: ApiFetchOptions = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = readCookie("csrf_token");
    if (csrf) headers.set("x-csrf-token", csrf);
    headers.set("x-request-nonce", crypto.randomUUID());
    headers.set("x-request-timestamp", new Date().toISOString());
  }
  const send = () => fetch(path, { ...init, credentials: "same-origin", headers });

  let response = await send();
  if (response.status === 401 && options.allowAnonymousRetry) {
    // 公开读端点携带无效会话：清除本地登录态缓存后以匿名身份重试一次。
    window.dispatchEvent(new CustomEvent(SESSION_INVALID_EVENT));
    response = await send();
    if (!response.ok) {
      // 仍失败（含再次 401）：走页面错误提示，不派发事件、不弹窗、不再次重试。
      throw toApiError(response, await readProblem(response));
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
  if (!response.ok) {
    const problem = await readProblem(response);
    // 匿名浏览是合法状态（如 /internal/identity/actor），这类 401 不触发“会话失效”弹窗。
    if (response.status === 401 && options.announceUnauthorized !== false) window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw toApiError(response, problem);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** 注销当前会话；服务端清除 HttpOnly Cookie 并返回 204。 */
export async function logout(): Promise<void> {
  if (useFixtures) return;
  await apiFetch<void>("/internal/identity/logout", { method: "POST" });
}

export async function getCurrentActor(): Promise<SessionActor> {
  if (useFixtures) {
    return { employeeId: "DEMO-EMPLOYEE", displayName: "林知行", roleCodes: ["employee"], permissions: ["portal.read", "portal.publish"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "fixture-session" };
  }
  // 未登录浏览是合法状态：actor 返回 401 只表示当前为匿名访客，不应触发“会话失效”弹窗。
  return apiFetch<SessionActor>("/internal/identity/actor", {}, { announceUnauthorized: false });
}

function metadataRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function portalMetadata(value: unknown): Record<string, unknown> {
  return metadataRecord(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function resourceHref(type: ResourceType, ownerEmployeeId: string, slug: string): string {
  if (type === "mcp") return `/mcp/${slug}`;
  const segment = type === "app" ? "apps" : type === "skill" ? "skills" : "plugins";
  return `/${segment}/${ownerEmployeeId}/${slug}`;
}

export function mapPortalResource(item: PortalResourceItemDto): ResourceSummary {
  const metadata = metadataRecord(item.metadata);
  return {
    id: item.resourceId,
    type: item.resourceType,
    name: item.name,
    slug: item.slug,
    href: resourceHref(item.resourceType, item.ownerEmployeeId, item.slug),
    description: item.summary,
    iconUrl: stringValue(metadata.iconUrl) ?? null,
    owner: {
      employeeId: item.ownerEmployeeId,
      displayName: item.ownerName,
      avatarUrl: stringValue(metadata.ownerAvatarUrl) ?? null,
      departmentName: stringValue(metadata.departmentName) ?? null,
    },
    tags: stringArray(metadata.tags).length > 0 ? stringArray(metadata.tags) : stringArray(metadata.customTagNames),
    stars: item.favoriteCount,
    updatedAt: item.updatedAt,
    status: item.status,
    isStarred: item.isFavorited,
    ...(item.resourceType === "app" ? { currentVersionId: item.currentVersionId ?? null } : {}),
  };
}

export function mapPortalResourceDetail(item: PortalResourceItemDto): ResourceDetail {
  const metadata = metadataRecord(item.metadata);
  const securityStatus = metadata.securityStatus === "passed" || metadata.securityStatus === "pending" || metadata.securityStatus === "failed" ? metadata.securityStatus : "unknown";
  return {
    ...mapPortalResource(item),
    overview: stringValue(metadata.overview) ?? stringValue(metadata.readme) ?? stringValue(metadata.summaryHtml) ?? item.summary,
    version: stringValue(metadata.version) ?? null,
    compatibility: stringArray(metadata.compatibility),
    screenshots: stringArray(metadata.screenshots),
    securityStatus,
    publishedAt: stringValue(metadata.publishedAt) ?? null,
    ...(Array.isArray(metadata.files) ? { files: metadata.files as ResourceFileNode[] } : {}),
  };
}

export function queryString(values: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

export async function getHome(): Promise<HomePayload> {
  if (useFixtures) return fixtureHome();
  const result = await apiFetch<Omit<HomePayload, "apps" | "skills" | "plugins" | "mcps" | "departments" | "skillPackages" | "updates"> & { apps: PortalResourceItemDto[]; skills: PortalResourceItemDto[]; plugins: PortalResourceItemDto[]; mcps: PortalResourceItemDto[]; departments: DepartmentDto[]; skillPackages: SkillPackageDto[]; updates: ContentPageDto | null }>("/internal/portal/home", {}, { allowAnonymousRetry: true });
  return {
    ...result,
    apps: result.apps.map(mapPortalResource),
    skills: result.skills.map(mapPortalResource),
    plugins: result.plugins.map(mapPortalResource),
    mcps: result.mcps.map(mapPortalResource),
    departments: result.departments.map((item) => ({ departmentId: item.departmentId, name: item.name, description: item.description, memberCount: item.memberCount, resourceCount: item.applicationCount, logoUrl: null })),
    skillPackages: result.skillPackages.map((item) => ({ id: item.packageId, slug: item.packageSlug, name: item.name, description: item.summary, skillCount: item.skillCount })),
    updates: result.updates ? { title: result.updates.title, summary: result.updates.summary, updatedAt: result.updates.updatedAt } : null,
  };
}

export async function favoriteResource(resourceType: ResourceType, resourceId: string, active: boolean) {
  if (useFixtures) return { resourceType, resourceId, active };
  return apiFetch<{ resourceType: ResourceType; resourceId: string; active: boolean }>(`/internal/portal/${resourceType}/${resourceId}/favorite`, { method: "POST", body: JSON.stringify({ active }) });
}

export function mapCommentAuthor(author: PortalCommentAuthorDto): EmployeeSummary {
  return { employeeId: author.employeeId, displayName: author.displayName, avatarUrl: null, departmentName: null };
}

export function mapPortalComment(item: PortalCommentItemDto): ResourceComment {
  return {
    commentId: item.commentId,
    body: item.body,
    author: mapCommentAuthor(item.author),
    parentCommentId: item.parentComment?.commentId ?? null,
    createdAt: item.createdAt,
    replies: [],
  };
}

/** 服务端返回扁平评论列表；按 parentComment.commentId 组装为页面模型的回复树。 */
export function mapResourceCommentTree(items: PortalCommentItemDto[]): ResourceComment[] {
  const byId = new Map(items.map((item) => [item.commentId, item]));
  const repliesOf = new Map<string, ResourceComment[]>();
  items.forEach((item) => {
    const parentId = item.parentComment?.commentId ?? null;
    if (parentId !== null && byId.has(parentId)) {
      const list = repliesOf.get(parentId) ?? [];
      list.push(mapPortalComment(item));
      repliesOf.set(parentId, list);
    }
  });
  return items
    .filter((item) => item.kind === "comment" || item.parentComment === null)
    .map((item) => ({ ...mapPortalComment(item), replies: repliesOf.get(item.commentId) ?? [] }));
}

export async function listResourceComments(resourceType: ResourceType, resourceId: string): Promise<ResourceComment[]> {
  if (useFixtures) return fixtureComments();
  return mapResourceCommentTree(await apiFetch<PortalCommentItemDto[]>(`/internal/portal/${resourceType}/${resourceId}/comments`, {}, { allowAnonymousRetry: true }));
}

export async function createResourceComment(resourceType: ResourceType, resourceId: string, body: string, parentCommentId: string | null): Promise<ResourceComment> {
  if (useFixtures) return { commentId: crypto.randomUUID(), body, parentCommentId, createdAt: new Date().toISOString(), author: { employeeId: "DEMO-EMPLOYEE", displayName: "林知行", avatarUrl: null, departmentName: null }, replies: [] };
  return mapPortalComment(await apiFetch<PortalCommentItemDto>(`/internal/portal/${resourceType}/${resourceId}/comments`, { method: "POST", body: JSON.stringify({ body, parentCommentId }) }));
}
