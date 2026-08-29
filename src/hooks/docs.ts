import { useQuery } from "@tanstack/react-query";
import { getContentPage } from "@/apis";
import type { ContentPageSlug } from "@/types";

export const docsKeys = { page: (slug: ContentPageSlug) => ["portal", "docs", slug] as const };
// 公开读端点：401 匿名重试已由 apiFetch 完成，retry:false 避免 React Query 重试叠加（匿名限流敏感）。
export const useContentPageQuery = (slug: ContentPageSlug) => useQuery({ queryKey: docsKeys.page(slug), queryFn: () => getContentPage(slug), retry: false });
