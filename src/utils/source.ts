export const pluginDetailHref = (userId: string, slug: string) => `/plugins/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`;
export const mcpDetailHref = (slug: string) => `/mcp/${encodeURIComponent(slug)}`;
