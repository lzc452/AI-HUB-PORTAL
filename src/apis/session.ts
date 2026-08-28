import { loginHref } from "@/utils/routes";

/** apiFetch 收到 401 时在 window 上派发的事件名；main.tsx 监听后恢复登录态。 */
export const UNAUTHORIZED_EVENT = "portal:unauthorized";

/**
 * 会话失效恢复：清空 React Query 缓存并跳转登录（携带当前路径作为 returnTo）。
 * 独立为纯函数以便在 jsdom 测试中注入 stub（jsdom 的 location.assign 不可 spy）。
 */
export function handleUnauthorized(client: { clear: () => void }, assign: (url: string) => void = (url) => window.location.assign(url)): void {
  client.clear();
  if (window.location.pathname === "/login") return;
  assign(loginHref());
}
