import { apiFetch, useFixtures } from "@/apis/common";

/**
 * 站内通知记录（与后端 /internal/portal/notifications 契约一致，
 * 字段形状见 docs/handoff/ai-hub-portal-api.md §3.4）。
 */
export interface PortalNotificationRecord {
  notificationId: string;
  recipientEmployeeId: string;
  eventType: string;
  aggregateId: string;
  idempotencyKey: string;
  message: string;
  payload?: {
    title?: string;
    body?: string;
    detail?: Record<string, unknown>;
    deepLink?: string;
  };
  /** 已读时间（ISO 8601），未读为 null。 */
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSummary {
  unreadCount: number;
}

/** 本地 fixture 模式（VITE_PORTAL_USE_FIXTURES=true）下的演示数据。 */
const fixtureNotifications = (): PortalNotificationRecord[] => [
  {
    notificationId: "fixture-notification-1",
    recipientEmployeeId: "DEMO-EMPLOYEE",
    eventType: "application.review.decided",
    aggregateId: "app-demo-1",
    idempotencyKey: "demo:portal:notification:1",
    message: "应用「智能排班助手」的评审结论：approve。",
    payload: {
      title: "应用评审结论已出",
      body: "应用「智能排班助手」的评审结论：approve。",
      detail: { decision: "approve" },
    },
    readAt: null,
    createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
  },
  {
    notificationId: "fixture-notification-2",
    recipientEmployeeId: "DEMO-EMPLOYEE",
    eventType: "demand.progress_updated",
    aggregateId: "demand-demo-1",
    idempotencyKey: "demo:portal:notification:2",
    message: "需求「AI 辅助项目风险评估」的进度已更新为 claimed。",
    payload: {
      title: "需求进度更新",
      body: "需求「AI 辅助项目风险评估」的进度已更新为 claimed。",
      detail: { status: "claimed" },
    },
    readAt: new Date(Date.now() - 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
];

export async function listPortalNotifications(): Promise<PortalNotificationRecord[]> {
  if (useFixtures) return fixtureNotifications();
  return apiFetch<PortalNotificationRecord[]>("/internal/portal/notifications");
}

export async function getPortalNotificationSummary(): Promise<NotificationSummary> {
  if (useFixtures) return { unreadCount: 1 };
  return apiFetch<NotificationSummary>("/internal/portal/notifications/summary");
}

export async function markPortalNotificationRead(
  notificationId: string,
): Promise<PortalNotificationRecord> {
  if (useFixtures) {
    const record = fixtureNotifications().find(
      (item) => item.notificationId === notificationId,
    );
    if (record === undefined) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }
    return { ...record, readAt: new Date().toISOString() };
  }
  return apiFetch<PortalNotificationRecord>(
    `/internal/portal/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "POST" },
  );
}

export async function markAllPortalNotificationsRead(): Promise<{ updated: number }> {
  if (useFixtures) return { updated: 1 };
  return apiFetch<{ updated: number }>("/internal/portal/notifications/read-all", {
    method: "POST",
  });
}
