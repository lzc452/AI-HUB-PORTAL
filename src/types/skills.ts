import type { PageResult, ResourceDetail, ResourceSummary } from "@/types/common";

export interface SkillSummary extends ResourceSummary {
  type: "skill";
  trigger: string;
  environments: string[];
}

export interface SkillDetail extends ResourceDetail, Omit<SkillSummary, keyof ResourceSummary> {
  type: "skill";
  installCommand: string;
}

export interface SkillPackageSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  owner?: { employeeId: string; displayName: string };
  skillCount: number;
  skills?: SkillPackageItem[];
  updatedAt?: string;
}

export interface SkillPackageItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  owner?: { employeeId: string; displayName: string };
}

export interface SkillPackageDetail extends SkillPackageSummary {
  skills: SkillPackageItem[];
}

export interface SkillPackageDto {
  packageId: string;
  packageSlug: string;
  name: string;
  summary: string;
  ownerEmployeeId: string;
  ownerName: string;
  skillCount: number;
}

export interface SkillPackageDetailDto extends Omit<SkillPackageDto, "skillCount"> {
  skills: Array<{ skillId: string; skillSlug: string; name: string; summary: string; ownerEmployeeId: string; ownerName: string }>;
}

export type SkillPage = PageResult<SkillSummary>;
