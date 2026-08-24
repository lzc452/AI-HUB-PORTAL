import { apiFetch, queryString, useFixtures } from "@/apis/common";
import { fixtureDetail, fixtureMcpPage, fixturePluginPage } from "@/apis/fixtures";
import type { ListQuery, McpDetail, McpPage, PluginDetail, PluginPage } from "@/types";

export async function listPlugins(query: ListQuery): Promise<PluginPage> {
  if (useFixtures) return fixturePluginPage(query);
  return apiFetch<PluginPage>(`/internal/portal/plugins${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`);
}

export async function getPlugin(userId: string, slug: string): Promise<PluginDetail> {
  if (useFixtures) return fixtureDetail("plugin", slug) as PluginDetail;
  return apiFetch<PluginDetail>(`/internal/portal/plugins/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`);
}

export async function listMcps(query: ListQuery): Promise<McpPage> {
  if (useFixtures) return fixtureMcpPage(query);
  return apiFetch<McpPage>(`/internal/portal/mcps${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`);
}

export async function getMcp(slug: string): Promise<McpDetail> {
  if (useFixtures) return fixtureDetail("mcp", slug) as McpDetail;
  return apiFetch<McpDetail>(`/internal/portal/mcps/${encodeURIComponent(slug)}`);
}
