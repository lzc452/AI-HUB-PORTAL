import { apiFetch, mapPortalResource, mapPortalResourceDetail, portalMetadata, queryString, useFixtures } from "@/apis/common";
import { fixtureDetail, fixturePackages, fixtureSkillPage } from "@/apis/fixtures";
import type { ListQuery, PageResult, PortalResourceItemDto, SkillDetail, SkillPackageDetail, SkillPackageDetailDto, SkillPackageDto, SkillPackageSummary, SkillPage, SkillSummary } from "@/types";

function mapSkillSummary(item: PortalResourceItemDto): SkillSummary {
  const metadata = portalMetadata(item.metadata);
  return {
    ...mapPortalResource(item),
    type: "skill",
    trigger: typeof metadata.trigger === "string" ? metadata.trigger : "",
    environments: Array.isArray(metadata.environments) ? metadata.environments.filter((value): value is string => typeof value === "string") : [],
  };
}

function mapSkillPackage(item: SkillPackageDto): SkillPackageSummary {
  return {
    id: item.packageId,
    slug: item.packageSlug,
    name: item.name,
    description: item.summary,
    owner: { employeeId: item.ownerEmployeeId, displayName: item.ownerName },
    skillCount: item.skillCount,
  };
}

export async function listSkills(query: ListQuery): Promise<SkillPage> {
  if (useFixtures) return fixtureSkillPage(query);
  const result = await apiFetch<PageResult<PortalResourceItemDto>>(`/internal/portal/skills${queryString({ query: query.q, sortBy: query.sortBy === "updatedAt" ? "latest" : query.sortBy === "downloads" ? "score" : query.sortBy, page: query.page, pageSize: query.pageSize })}`, {}, { allowAnonymousRetry: true });
  return { ...result, items: result.items.map(mapSkillSummary) };
}

export async function getSkill(userId: string, slug: string): Promise<SkillDetail> {
  if (useFixtures) return fixtureDetail("skill", slug) as SkillDetail;
  const item = await apiFetch<PortalResourceItemDto>(`/internal/portal/skills/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`, {}, { allowAnonymousRetry: true });
  const metadata = portalMetadata(item.metadata);
  return { ...mapPortalResourceDetail(item), ...mapSkillSummary(item), type: "skill", installCommand: typeof metadata.installCommand === "string" ? metadata.installCommand : "" };
}

export async function listSkillPackages(): Promise<SkillPackageSummary[]> {
  if (useFixtures) return fixturePackages;
  return (await apiFetch<SkillPackageDto[]>("/internal/portal/skill-packages", {}, { allowAnonymousRetry: true })).map(mapSkillPackage);
}

export async function getSkillPackage(packageSlug: string): Promise<SkillPackageDetail> {
  if (useFixtures) return (fixturePackages.find((item) => item.slug === packageSlug) ?? fixturePackages[0]) as SkillPackageDetail;
  const item = await apiFetch<SkillPackageDetailDto>(`/internal/portal/skill-packages/${encodeURIComponent(packageSlug)}`, {}, { allowAnonymousRetry: true });
  return {
    ...mapSkillPackage({ ...item, skillCount: item.skills.length }),
    skills: item.skills.map((skill) => ({
      id: skill.skillId,
      slug: skill.skillSlug,
      name: skill.name,
      description: skill.summary,
      owner: { employeeId: skill.ownerEmployeeId, displayName: skill.ownerName },
      href: `/skills/${encodeURIComponent(skill.ownerEmployeeId)}/${encodeURIComponent(skill.skillSlug)}`,
    })),
  };
}
