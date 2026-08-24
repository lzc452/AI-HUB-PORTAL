import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { PortalLayout } from "@/layouts";
import { SsoGuard } from "@/router/guards";
import { appsRoutes } from "@/router/apps";
import { skillsRoutes } from "@/router/skills";
import { sourceRoutes } from "@/router/source";
import { docsRoutes } from "@/router/docs";
import { dashboardRoutes } from "@/router/dashboard";

const HomePage = lazy(() => import("@/pages/home/HomePage"));
const LoginPage = lazy(() => import("@/pages/system/LoginPage"));
const NotFoundPage = lazy(() => import("@/pages/system/NotFoundPage"));
const RouteErrorPage = lazy(() => import("@/pages/system/RouteErrorPage"));

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <RouteErrorPage /> },
  {
    element: <SsoGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      { element: <PortalLayout />, children: [{ index: true, element: <HomePage /> }, ...appsRoutes, ...skillsRoutes, ...sourceRoutes, ...docsRoutes, { path: "*", element: <NotFoundPage /> }] },
      ...dashboardRoutes,
    ],
  },
]);
