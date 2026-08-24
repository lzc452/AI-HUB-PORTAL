import { useQuery } from "@tanstack/react-query";
import { getSkill, getSkillPackage, listSkillPackages, listSkills } from "@/apis";
import type { ListQuery } from "@/types";

export const skillKeys = {
  all: ["portal", "skill"] as const,
  list: (query: ListQuery) => ["portal", "skill", "list", query] as const,
  detail: (userId: string, slug: string) => ["portal", "skill", "detail", userId, slug] as const,
  packages: ["portal", "skill", "packages"] as const,
  package: (slug: string) => ["portal", "skill", "package", slug] as const,
};

export const useSkillsQuery = (query: ListQuery) => useQuery({ queryKey: skillKeys.list(query), queryFn: () => listSkills(query) });
export const useSkillQuery = (userId: string, slug: string) => useQuery({ queryKey: skillKeys.detail(userId, slug), queryFn: () => getSkill(userId, slug) });
export const useSkillPackagesQuery = () => useQuery({ queryKey: skillKeys.packages, queryFn: listSkillPackages });
export const useSkillPackageQuery = (slug: string) => useQuery({ queryKey: skillKeys.package(slug), queryFn: () => getSkillPackage(slug), enabled: Boolean(slug) });
