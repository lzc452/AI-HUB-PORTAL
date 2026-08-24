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
  skillCount: number;
  skills: SkillSummary[];
  updatedAt: string;
}

export type SkillPage = PageResult<SkillSummary>;
