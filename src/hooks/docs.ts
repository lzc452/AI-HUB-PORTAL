import { useQuery } from "@tanstack/react-query";
import { getContentPage } from "@/apis";
import type { ContentPageSlug } from "@/types";

export const docsKeys = { page: (slug: ContentPageSlug) => ["portal", "docs", slug] as const };
export const useContentPageQuery = (slug: ContentPageSlug) => useQuery({ queryKey: docsKeys.page(slug), queryFn: () => getContentPage(slug) });
