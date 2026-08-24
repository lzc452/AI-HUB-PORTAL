export type ResourceType = "app" | "skill" | "plugin" | "mcp";
export type PublishStatus = "draft" | "scanning" | "pending_review" | "published" | "rejected" | "withdrawn";

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
  score: number;
  stars: number;
  downloads: number;
  updatedAt: string;
  status: PublishStatus;
  isStarred: boolean;
}

export interface ResourceDetail extends ResourceSummary {
  overview: string;
  version: string;
  compatibility: string[];
  screenshots: string[];
  securityStatus: "passed" | "pending" | "failed";
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
  departments: Array<{ departmentId: string; name: string; description: string; memberCount: number; resourceCount: number; logoUrl: string | null }>;
  skillPackages: Array<{ id: string; slug: string; name: string; description: string; skillCount: number; updatedAt: string }>;
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
  displayName: string;
  avatarUrl: string | null;
  permissions: string[];
}

export interface ApiProblem {
  code?: string;
  message?: string;
  detail?: string;
  traceId?: string;
}
