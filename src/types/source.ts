import type { PageResult, ResourceDetail, ResourceSummary } from "@/types/common";

export interface PluginSummary extends ResourceSummary {
  type: "plugin";
  repositoryUrl: string;
  syncStatus: "synced" | "syncing" | "failed";
}

export interface PluginDetail extends ResourceDetail, Omit<PluginSummary, keyof ResourceSummary> {
  type: "plugin";
  readme: string;
  installCommand: string;
}

export interface McpSummary extends ResourceSummary {
  type: "mcp";
  connectionType: "stdio" | "sse" | "streamable_http";
  healthStatus: "healthy" | "degraded" | "offline";
}

export interface McpDetail extends ResourceDetail, Omit<McpSummary, keyof ResourceSummary> {
  type: "mcp";
  tools: Array<{ name: string; description: string }>;
  configTemplate: string;
  authentication: string;
}

export type PluginPage = PageResult<PluginSummary>;
export type McpPage = PageResult<McpSummary>;
