import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App";
import { PortalLayout } from "@/layouts";
import { AuthGuard } from "@/router/guards";
import { appsRoutes } from "@/router/apps";
import { skillsRoutes } from "@/router/skills";
import { sourceRoutes } from "@/router/source";
import { docsRoutes } from "@/router/docs";
import { dashboardRoutes } from "@/router/dashboard";

const HomePage = lazy(() => import("@/pages/home/HomePage"));
const NotFoundPage = lazy(() => import("@/pages/system/NotFoundPage"));
const RouteErrorPage = lazy(() => import("@/pages/system/RouteErrorPage"));

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      // 门户不再提供独立登录页；旧链接重定向回首页，登录统一通过全局弹窗完成。
      { path: "/login", element: <Navigate replace to="/" />, errorElement: <RouteErrorPage /> },
      {
        errorElement: <RouteErrorPage />,
        children: [
          { element: <PortalLayout />, children: [{ index: true, element: <HomePage /> }, ...appsRoutes, ...skillsRoutes, ...sourceRoutes, ...docsRoutes, { path: "*", element: <NotFoundPage /> }] },
          { element: <AuthGuard />, children: dashboardRoutes },
        ],
      },
    ],
  },
]);
