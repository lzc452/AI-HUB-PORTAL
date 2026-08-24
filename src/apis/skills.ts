import { apiFetch, queryString, useFixtures } from "@/apis/common";
import { fixtureDetail, fixturePackages, fixtureSkillPage } from "@/apis/fixtures";
import type { ListQuery, SkillDetail, SkillPackageSummary, SkillPage } from "@/types";

export async function listSkills(query: ListQuery): Promise<SkillPage> {
  if (useFixtures) return fixtureSkillPage(query);
  return apiFetch<SkillPage>(`/internal/portal/skills${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`);
}

export async function getSkill(userId: string, slug: string): Promise<SkillDetail> {
  if (useFixtures) return fixtureDetail("skill", slug) as SkillDetail;
  return apiFetch<SkillDetail>(`/internal/portal/skills/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`);
}

export async function listSkillPackages(): Promise<SkillPackageSummary[]> {
  if (useFixtures) return fixturePackages;
  return apiFetch<SkillPackageSummary[]>("/internal/portal/skill-packages");
}

export async function getSkillPackage(packageSlug: string): Promise<SkillPackageSummary> {
  if (useFixtures) return fixturePackages.find((item) => item.slug === packageSlug) ?? fixturePackages[0];
  return apiFetch<SkillPackageSummary>(`/internal/portal/skill-packages/${encodeURIComponent(packageSlug)}`);
}
