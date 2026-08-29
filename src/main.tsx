import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { handleSessionInvalid, handleUnauthorized, SESSION_INVALID_EVENT, UNAUTHORIZED_EVENT } from "@/apis/session";
import { router } from "@/router";
import "@/styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// 公开读端点 401（无效会话）：失效 actor 查询（活跃 observer 自动重取探测登录态，
// UI 降级为未登录视图）；匿名重试由 apiFetch 完成，不弹窗。
window.addEventListener(SESSION_INVALID_EVENT, () => handleSessionInvalid(queryClient));
// 写端点/dashboard 读端点返回 401（会话过期/被撤销）时失效登录态并弹窗引导登录。
window.addEventListener(UNAUTHORIZED_EVENT, () => handleUnauthorized(queryClient));

const root = document.getElementById("root");
if (!root) throw new Error("ROOT_ELEMENT_NOT_FOUND");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
