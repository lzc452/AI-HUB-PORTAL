import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { DashboardLayout } from "@/layouts";

const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const PublishPage = lazy(() => import("@/pages/dashboard/PublishPage"));
const SettingPage = lazy(() => import("@/pages/dashboard/SettingPage"));
const StarsPage = lazy(() => import("@/pages/dashboard/StarsPage"));
const CommentsPage = lazy(() => import("@/pages/dashboard/CommentsPage"));

export const dashboardRoutes: RouteObject[] = [{
  path: "dashboard",
  element: <DashboardLayout />,
  children: [
    { index: true, element: <DashboardPage /> },
    { path: "publish", element: <PublishPage /> },
    { path: "setting", element: <SettingPage /> },
    { path: "stars", element: <StarsPage /> },
    { path: "comments", element: <CommentsPage /> },
  ],
}];
