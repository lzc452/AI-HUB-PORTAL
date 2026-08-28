import { apiFetch, mapPortalResource, mapPortalResourceDetail, portalMetadata, queryString, useFixtures } from "@/apis/common";
import { fixtureDetail, fixtureMcpPage, fixturePluginPage } from "@/apis/fixtures";
import type { ListQuery, McpDetail, McpPage, McpSummary, PageResult, PluginDetail, PluginPage, PluginSummary, PortalResourceItemDto } from "@/types";

function mapPluginSummary(item: PortalResourceItemDto): PluginSummary {
  const metadata = portalMetadata(item.metadata);
  const syncStatus = metadata.syncStatus === "synced" || metadata.syncStatus === "syncing" || metadata.syncStatus === "failed" ? metadata.syncStatus : undefined;
  return { ...mapPortalResource(item), type: "plugin", repositoryUrl: typeof metadata.repositoryUrl === "string" ? metadata.repositoryUrl : "", ...(syncStatus ? { syncStatus } : {}) };
}

function mapMcpSummary(item: PortalResourceItemDto): McpSummary {
  const metadata = portalMetadata(item.metadata);
  const connectionType = metadata.connectionType === "stdio" || metadata.connectionType === "sse" || metadata.connectionType === "streamable_http" ? metadata.connectionType : undefined;
  const healthStatus = metadata.healthStatus === "healthy" || metadata.healthStatus === "degraded" || metadata.healthStatus === "offline" ? metadata.healthStatus : undefined;
  return { ...mapPortalResource(item), type: "mcp", ...(connectionType ? { connectionType } : {}), ...(healthStatus ? { healthStatus } : {}) };
}

export async function listPlugins(query: ListQuery): Promise<PluginPage> {
  if (useFixtures) return fixturePluginPage(query);
  const result = await apiFetch<PageResult<PortalResourceItemDto>>(`/internal/portal/plugins${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`);
  return { ...result, items: result.items.map(mapPluginSummary) };
}

export async function getPlugin(userId: string, slug: string): Promise<PluginDetail> {
  if (useFixtures) return fixtureDetail("plugin", slug) as PluginDetail;
  const item = await apiFetch<PortalResourceItemDto>(`/internal/portal/plugins/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`);
  const metadata = portalMetadata(item.metadata);
  return { ...mapPortalResourceDetail(item), ...mapPluginSummary(item), type: "plugin", readme: typeof metadata.readme === "string" ? metadata.readme : item.summary, installCommand: typeof metadata.installCommand === "string" ? metadata.installCommand : "" };
}

export async function listMcps(query: ListQuery): Promise<McpPage> {
  if (useFixtures) return fixtureMcpPage(query);
  const result = await apiFetch<PageResult<PortalResourceItemDto>>(`/internal/portal/mcps${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`);
  return { ...result, items: result.items.map(mapMcpSummary) };
}

export async function getMcp(slug: string): Promise<McpDetail> {
  if (useFixtures) return fixtureDetail("mcp", slug) as McpDetail;
  const item = await apiFetch<PortalResourceItemDto>(`/internal/portal/mcps/${encodeURIComponent(slug)}`);
  const metadata = portalMetadata(item.metadata);
  const tools = Array.isArray(metadata.tools) ? metadata.tools.filter((value): value is { name: string; description: string } => value !== null && typeof value === "object" && typeof (value as Record<string, unknown>).name === "string" && typeof (value as Record<string, unknown>).description === "string") : [];
  return { ...mapPortalResourceDetail(item), ...mapMcpSummary(item), type: "mcp", tools, configTemplate: typeof metadata.configTemplate === "string" ? metadata.configTemplate : "", authentication: typeof metadata.authentication === "string" ? metadata.authentication : "未声明" };
}
