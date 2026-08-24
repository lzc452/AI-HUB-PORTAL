import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { AppsDefaultRedirect, DepartmentRedirect } from "@/router/redirects";

const AppsPage = lazy(() => import("@/pages/apps/AppsPage"));
const AppDetailPage = lazy(() => import("@/pages/apps/AppDetailPage"));
const AppsHuntPage = lazy(() => import("@/pages/apps/AppsHuntPage"));
const DepartmentZonePage = lazy(() => import("@/pages/apps/DepartmentZonePage"));
const DepartmentDetailPage = lazy(() => import("@/pages/apps/DepartmentDetailPage"));

export const appsRoutes: RouteObject[] = [
  { element: <AppsDefaultRedirect />, children: [{ path: "apps", element: <AppsPage /> }] },
  { path: "apps/:userId/:appSlug", element: <AppDetailPage /> },
  { path: "apps-hunt", element: <AppsHuntPage /> },
  { path: "department", element: <DepartmentRedirect /> },
  { path: "department-zone", element: <DepartmentZonePage /> },
  { path: "department/:departmentId", element: <DepartmentDetailPage /> },
];
