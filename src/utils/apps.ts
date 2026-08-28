import { appHuntMedalRanks } from "@/apis/static-data";
import type { AppHuntEntry } from "@/types";

export const appHuntMedal = (entry: AppHuntEntry) => (appHuntMedalRanks[entry.rank - 1] ?? `第 ${entry.rank} 名`);
export const appDetailHref = (userId: string, slug: string) => `/apps/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`;
