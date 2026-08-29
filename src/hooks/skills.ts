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

// 公开读端点：401 匿名重试已由 apiFetch 完成，retry:false 避免 React Query 重试叠加（匿名限流敏感）。
export const useSkillsQuery = (query: ListQuery) => useQuery({ queryKey: skillKeys.list(query), queryFn: () => listSkills(query), retry: false });
export const useSkillQuery = (userId: string, slug: string) => useQuery({ queryKey: skillKeys.detail(userId, slug), queryFn: () => getSkill(userId, slug), retry: false });
export const useSkillPackagesQuery = () => useQuery({ queryKey: skillKeys.packages, queryFn: listSkillPackages, retry: false });
export const useSkillPackageQuery = (slug: string) => useQuery({ queryKey: skillKeys.package(slug), queryFn: () => getSkillPackage(slug), enabled: Boolean(slug), retry: false });
