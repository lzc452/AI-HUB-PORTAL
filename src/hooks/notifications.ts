import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPortalNotificationSummary,
  listPortalNotifications,
  markAllPortalNotificationsRead,
  markPortalNotificationRead,
} from "@/apis";
import { useCurrentActor } from "@/hooks/common";

export const notificationKeys = {
  list: ["portal", "notifications", "list"] as const,
  summary: ["portal", "notifications", "summary"] as const,
};

/** 通知列表：仅登录后启用，30s 轮询（与 Web 端一致，无推送通道）。 */
export function usePortalNotificationsList() {
  const actor = useCurrentActor();
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: listPortalNotifications,
    enabled: Boolean(actor.data),
    refetchInterval: 30_000,
    retry: false,
  });
}

/** 未读数：仅登录后启用，30s 轮询。 */
export function usePortalUnreadCount() {
  const actor = useCurrentActor();
  return useQuery({
    queryKey: notificationKeys.summary,
    queryFn: getPortalNotificationSummary,
    enabled: Boolean(actor.data),
    refetchInterval: 30_000,
    retry: false,
  });
}

export function useMarkPortalNotificationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markPortalNotificationRead,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: notificationKeys.list });
      client.invalidateQueries({ queryKey: notificationKeys.summary });
    },
  });
}

export function useMarkAllPortalNotificationsRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markAllPortalNotificationsRead,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: notificationKeys.list });
      client.invalidateQueries({ queryKey: notificationKeys.summary });
    },
  });
}
