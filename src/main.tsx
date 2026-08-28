import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { handleUnauthorized, UNAUTHORIZED_EVENT } from "@/apis/session";
import { router } from "@/router";
import "@/styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// 任意受保护接口返回 401（会话过期/被撤销）时清空缓存并跳转登录。
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
