import { apiFetch, useFixtures } from "@/apis/common";
import { fixtureDocs } from "@/apis/fixtures";
import type { ContentPage, ContentPageSlug } from "@/types";

export async function getContentPage(slug: ContentPageSlug): Promise<ContentPage> {
  if (useFixtures) return fixtureDocs[slug];
  return apiFetch<ContentPage>(`/internal/portal/docs/${slug}`);
}
