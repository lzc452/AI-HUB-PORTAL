import type { EmployeeSummary, PageResult, PublishStatus, ResourceSummary, ResourceType } from "@/types/common";

export type ApplicationType = "web_app" | "desktop_app" | "mobile_app" | "mini_program";
export type DeliveryChannel = "web" | "desktop" | "mobile" | "mini_program";
export type AiRiskModelProvider = "deepseek" | "qwen" | "wenxin" | "hunyuan" | "local" | "other";

export interface ApplicationDraft {
  name: string;
  departmentId: string;
  maintainerEmployeeIds: string[];
  categoryId: string;
  applicationType: ApplicationType;
  tagIds: string[];
  customCategoryName?: string;
  customTagNames?: string[];
  icon: { mode: "auto" | "upload"; backgroundColor: string | null; text: string | null; assetId: string | null };
  screenshotAssetIds: string[];
  attachmentAssetIds?: string[];
  summaryHtml: string;
  manualHtml: string | null;
  manualAssetId: string | null;
  examplesHtml: string | null;
  examplesAssetId: string | null;
  faq: Array<{ question: string; answer: string }>;
  audience: Array<{ audienceType: "all" | "department" | "employee"; departmentId: string | null; employeeId: string | null; includeChildren: boolean }>;
  risk: {
    handlesSensitiveData: boolean;
    sendsDataExternally: boolean;
    retainsConversations: boolean;
    retentionPeriod: string | null;
    modelProviders: AiRiskModelProvider[];
    providerNote: string | null;
    affectsHighRiskDecisions: boolean;
    inputRestrictionDisclaimer: string;
  };
  deliveries: Array<{ channel: DeliveryChannel; entryUrl: string | null; minClientVersion: string | null; enabled: boolean; assetIds: string[]; targets?: Array<Record<string, unknown>> }>;
  version: string;
  changelog: string;
}

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
  favoriteCount: number;
  recent: Array<{
    id: string;
    name: string;
    type: ResourceType;
    status: PublishStatus;
    href: string;
    updatedAt: string;
  }>;
}

export interface DashboardOverviewDto {
  counts: { apps: number; skills: number; plugins: number; mcps: number; favorites: number };
  recentResources: Array<{ resourceType: ResourceType; resourceId: string; name: string; status: PublishStatus; updatedAt: string }>;
}

export type PortalUploadKind = "icon" | "screenshot" | "attachment" | "artifact";

export interface PortalApplicationUpload {
  uploadId: string;
  kind: PortalUploadKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadStatus: string;
  scanStatus: string;
  sha256: string | null;
  errorCode: string | null;
  assetId: string | null;
}

export interface ApplicationDraftResponseDto {
  resource: import("@/types/common").PortalResourceItemDto;
  applicationDraft: ApplicationDraft;
  draftUpdatedAt: string;
}

export interface PublishDraftBase {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  version: string;
  assetNames: string[];
}

export interface AppPublishDraft extends PublishDraftBase {
  type: "app";
  applicationDraft: ApplicationDraft;
}

export interface NativePublishDraft extends PublishDraftBase {
  type: Exclude<ResourceType, "app">;
  metadata: Record<string, string>;
}

export type PublishDraft = AppPublishDraft | NativePublishDraft;

export interface PortalSetting {
  emailNotification: boolean;
  reviewNotification: boolean;
  compactCards: boolean;
}

export type CreatedDraft = ResourceSummary;
