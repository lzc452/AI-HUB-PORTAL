import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const SkillsPage = lazy(() => import("@/pages/skills/SkillsPage"));
const SkillDetailPage = lazy(() => import("@/pages/skills/SkillDetailPage"));
const SkillPackagesPage = lazy(() => import("@/pages/skills/SkillPackagesPage"));
const SkillPackageDetailPage = lazy(() => import("@/pages/skills/SkillPackageDetailPage"));

export const skillsRoutes: RouteObject[] = [
  { path: "skills", element: <SkillsPage /> },
  { path: "skills/:userId/:skillSlug", element: <SkillDetailPage /> },
  { path: "skillpackage", element: <SkillPackagesPage /> },
  { path: "skillpackage/:packageSlug", element: <SkillPackageDetailPage /> },
];
