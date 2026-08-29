import type { QueryClient } from "@tanstack/react-query";
import { useLoginDialogStore } from "@/store/auth";
import { currentReturnTo } from "@/utils/routes";

/** apiFetch 收到 401 时在 window 上派发的事件名；main.tsx 监听后恢复登录态。 */
export const UNAUTHORIZED_EVENT = "portal:unauthorized";

/**
 * 公开读端点（可选认证，契约 P1-5）收到 401（携带无效会话）时派发的事件名；
 * main.tsx 监听后仅清除本地登录态缓存，不弹登录弹窗。
 */
export const SESSION_INVALID_EVENT = "portal:session-invalid";

/** 与 hooks/common.ts 的 commonKeys.actor 保持一致：失效登录态后各页面立即回到未登录视图。 */
const ACTOR_QUERY_KEY = ["portal", "common", "actor"] as const;

/**
 * 会话失效恢复：使 actor 查询失效并弹出登录弹窗，登录成功后回到原页面。
 * 只用 invalidateQueries 通知 actor 查询（React Query v5 的 removeQueries 不会通知
 * 已订阅的活跃 observer，会导致 PortalHeader/AuthGuard 冻结在删除前状态），
 * 活跃 observer 会自动重取 → 401（actor 探测 announceUnauthorized:false，不弹窗不死循环）
 * → UI 立即降级为未登录视图；仅影响 actor 查询，避免清空全部缓存导致受保护接口反复重取。
 * 独立为纯函数以便在 jsdom 测试中注入 stub（jsdom 的 location 不可 spy）。
 */
export function handleUnauthorized(client: Pick<QueryClient, "invalidateQueries">): void {
  void client.invalidateQueries({ queryKey: ACTOR_QUERY_KEY });
  useLoginDialogStore.getState().openLoginDialog({ returnTo: currentReturnTo() });
}

/**
 * 公开读端点 401（无效会话）恢复：使 actor 查询失效并触发一次登录态重探测
 * （契约：401 恢复时调用 GET /internal/identity/actor，200=已登录 / 401=未登录，
 * 不使用 document.cookie），不打开登录弹窗——匿名重试由 apiFetch 完成，
 * 仍失败时页面自行走错误提示。
 * 不弹窗：actor 探测自带 announceUnauthorized:false；不死循环：actor 查询 retry:false。
 * 独立为纯函数以便在 jsdom 测试中注入 stub。
 */
export function handleSessionInvalid(client: Pick<QueryClient, "invalidateQueries">): void {
  void client.invalidateQueries({ queryKey: ACTOR_QUERY_KEY });
}
