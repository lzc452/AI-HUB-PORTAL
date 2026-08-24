import { useQuery } from "@tanstack/react-query";
import { getMcp, getPlugin, listMcps, listPlugins } from "@/apis";
import type { ListQuery } from "@/types";

export const sourceKeys = {
  plugins: (query: ListQuery) => ["portal", "source", "plugins", query] as const,
  plugin: (userId: string, slug: string) => ["portal", "plugin", "detail", userId, slug] as const,
  mcps: (query: ListQuery) => ["portal", "source", "mcps", query] as const,
  mcp: (slug: string) => ["portal", "mcp", "detail", slug] as const,
};

export const usePluginsQuery = (query: ListQuery) => useQuery({ queryKey: sourceKeys.plugins(query), queryFn: () => listPlugins(query) });
export const usePluginQuery = (userId: string, slug: string) => useQuery({ queryKey: sourceKeys.plugin(userId, slug), queryFn: () => getPlugin(userId, slug) });
export const useMcpsQuery = (query: ListQuery) => useQuery({ queryKey: sourceKeys.mcps(query), queryFn: () => listMcps(query) });
export const useMcpQuery = (slug: string) => useQuery({ queryKey: sourceKeys.mcp(slug), queryFn: () => getMcp(slug) });
