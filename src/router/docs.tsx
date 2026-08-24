import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const TutorialsPage = lazy(() => import("@/pages/docs/TutorialsPage"));
const AboutPage = lazy(() => import("@/pages/docs/AboutPage"));
const UpdatesPage = lazy(() => import("@/pages/docs/UpdatesPage"));

export const docsRoutes: RouteObject[] = [
  { path: "tutorials", element: <TutorialsPage /> },
  { path: "about", element: <AboutPage /> },
  { path: "updates", element: <UpdatesPage /> },
];
