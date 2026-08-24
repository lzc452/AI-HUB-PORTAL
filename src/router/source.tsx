import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const PluginsPage = lazy(() => import("@/pages/source/PluginsPage"));
const PluginDetailPage = lazy(() => import("@/pages/source/PluginDetailPage"));
const McpsPage = lazy(() => import("@/pages/source/McpsPage"));
const McpDetailPage = lazy(() => import("@/pages/source/McpDetailPage"));

export const sourceRoutes: RouteObject[] = [
  { path: "plugins", element: <PluginsPage /> },
  { path: "plugins/:userId/:pluginSlug", element: <PluginDetailPage /> },
  { path: "mcp", element: <McpsPage /> },
  { path: "mcp/:mcpSlug", element: <McpDetailPage /> },
];
