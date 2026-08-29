import { apiFetch, useFixtures } from "@/apis/common";
import { fixtureDocs } from "@/apis/fixtures";
import type { ContentPage, ContentPageDto, ContentPageSlug } from "@/types";

export async function getContentPage(slug: ContentPageSlug): Promise<ContentPage> {
  if (useFixtures) return fixtureDocs[slug];
  const item = await apiFetch<ContentPageDto>(`/internal/portal/docs/${slug}`, {}, { allowAnonymousRetry: true });
  return { slug, title: item.title, summary: item.summary, markdown: item.bodyMarkdown, updatedAt: item.updatedAt };
}
