export type ResourceType = "app" | "skill" | "plugin" | "mcp";
export type PublishStatus = "draft" | "in_review" | "approved" | "published" | "withdrawn" | "archived";

export interface ApiIssue {
  code: string;
  message: string;
  path?: string[];
}

export interface PortalResourceItemDto {
  resourceId: string;
  resourceType: ResourceType;
  ownerEmployeeId: string;
  ownerName: string;
  slug: string;
  name: string;
  summary: string;
  status: PublishStatus;
  currentVersionId?: string | null;
  metadata: unknown;
  favoriteCount: number;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 服务端 PortalCommentItem（资源详情评论与 Dashboard 评论共用结构）。 */
export interface PortalCommentAuthorDto {
  employeeId: string;
  displayName: string;
}

export interface PortalCommentParentDto {
  commentId: string;
  body: string;
  author: PortalCommentAuthorDto;
}

export interface PortalCommentItemDto {
  commentId: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  resourceHref: string;
  body: string;
  kind: "comment" | "reply";
  author: PortalCommentAuthorDto;
  parentComment: PortalCommentParentDto | null;
  createdAt: string;
}

export interface EmployeeSummary {
  employeeId: string;
  displayName: string;
  avatarUrl: string | null;
  departmentName: string | null;
}

export interface ResourceSummary {
  id: string;
  type: ResourceType;
  name: string;
  slug: string;
  href: string;
  description: string;
  iconUrl: string | null;
  owner: EmployeeSummary;
  tags: string[];
  stars: number;
  score?: number;
  downloads?: number;
  updatedAt: string;
  status: PublishStatus;
  isStarred: boolean;
  currentVersionId?: string | null;
}

export interface ResourceDetail extends ResourceSummary {
  overview: string;
  version: string | null;
  compatibility: string[];
  screenshots: string[];
  securityStatus: "passed" | "pending" | "failed" | "unknown";
  publishedAt: string | null;
  files?: ResourceFileNode[];
}

export interface ResourceFileNode {
  id: string;
  name: string;
  path: string;
  type: "directory" | "file";
  language?: string;
  content?: string;
  size?: number;
  children?: ResourceFileNode[];
}

export interface ResourceComment {
  commentId: string;
  body: string;
  author: EmployeeSummary;
  parentCommentId: string | null;
  createdAt: string;
  replies: ResourceComment[];
}

export interface HomePayload {
  apps: ResourceSummary[];
  skills: ResourceSummary[];
  plugins: ResourceSummary[];
  mcps: ResourceSummary[];
  departments: Array<{ departmentId: string; name: string; description: string; memberCount?: number; resourceCount: number; logoUrl: string | null }>;
  skillPackages: Array<{ id: string; slug: string; name: string; description: string; skillCount: number; updatedAt?: string }>;
  updates: { title: string; summary: string; updatedAt: string } | null;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ListQuery {
  q?: string;
  sortBy?: "score" | "downloads" | "updatedAt";
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface SessionActor {
  employeeId: string;
  displayName?: string;
  roleCodes: readonly string[];
  permissions?: readonly string[];
  departmentIds: readonly string[];
  primaryDepartmentId: string;
  sessionId: string;
}

export interface ApiProblem {
  code?: string;
  message?: string;
  detail?: string;
  traceId?: string;
  issues?: ApiIssue[];
}
