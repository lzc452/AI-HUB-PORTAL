import { useQuery } from "@tanstack/react-query";
import { getMcp, getPlugin, listMcps, listPlugins } from "@/apis";
import type { ListQuery } from "@/types";

export const sourceKeys = {
  plugins: (query: ListQuery) => ["portal", "source", "plugins", query] as const,
  plugin: (userId: string, slug: string) => ["portal", "plugin", "detail", userId, slug] as const,
  mcps: (query: ListQuery) => ["portal", "source", "mcps", query] as const,
  mcp: (slug: string) => ["portal", "mcp", "detail", slug] as const,
};

// 公开读端点：401 匿名重试已由 apiFetch 完成，retry:false 避免 React Query 重试叠加（匿名限流敏感）。
export const usePluginsQuery = (query: ListQuery) => useQuery({ queryKey: sourceKeys.plugins(query), queryFn: () => listPlugins(query), retry: false });
export const usePluginQuery = (userId: string, slug: string) => useQuery({ queryKey: sourceKeys.plugin(userId, slug), queryFn: () => getPlugin(userId, slug), retry: false });
export const useMcpsQuery = (query: ListQuery) => useQuery({ queryKey: sourceKeys.mcps(query), queryFn: () => listMcps(query), retry: false });
export const useMcpQuery = (slug: string) => useQuery({ queryKey: sourceKeys.mcp(slug), queryFn: () => getMcp(slug), retry: false });
