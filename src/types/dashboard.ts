import type { EmployeeSummary, PageResult, PublishStatus, ResourceType } from "@/types/common";

export interface DashboardCommentItem {
  commentId: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  resourceHref: string;
  body: string;
  kind: "comment" | "reply";
  author: EmployeeSummary;
  parentComment: {
    commentId: string;
    body: string;
    author: EmployeeSummary;
  } | null;
  createdAt: string;
}

export type DashboardCommentPage = PageResult<DashboardCommentItem>;

export interface DashboardOverview {
  counts: Record<ResourceType, number>;
  pendingReviewCount: number;
  publishedCount: number;
  recent: Array<{
    id: string;
    name: string;
    type: ResourceType;
    status: PublishStatus;
    href: string;
    updatedAt: string;
  }>;
}

export interface PublishDraft {
  type: ResourceType;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  version: string;
  metadata: Record<string, string>;
  assetNames: string[];
}

export interface PortalSetting {
  emailNotification: boolean;
  reviewNotification: boolean;
  compactCards: boolean;
}

export interface CreatedDraft {
  resourceId: string;
  resourceType: ResourceType;
  status: PublishStatus;
}
