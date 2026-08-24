import type { AppHuntEntry } from "@/types";

export const appHuntMedal = (entry: AppHuntEntry) => (["冠军", "亚军", "季军"][entry.rank - 1] ?? `第 ${entry.rank} 名`);
export const appDetailHref = (userId: string, slug: string) => `/apps/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`;
