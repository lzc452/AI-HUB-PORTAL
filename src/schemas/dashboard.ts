import { z } from "zod";
import { resourceTypeSchema } from "@/schemas/common";

export const dashboardCommentsQuerySchema = z.object({
  view: z.enum(["replies", "mine"]).default("replies"),
  resourceType: resourceTypeSchema.optional(),
  sort: z.enum(["latest", "oldest"]).default("latest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const publishDraftSchema = z.object({
  type: resourceTypeSchema,
  name: z.string().trim().min(2, "请输入至少 2 个字符的资源名称").max(160),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "仅支持小写字母、数字与连字符").max(120),
  description: z.string().trim().min(10, "请填写至少 10 个字符的资源说明").max(2000),
  tagsText: z.string().trim().min(1, "请至少填写一个标签"),
  version: z.string().trim().regex(/^[0-9A-Za-z][0-9A-Za-z.+_-]{0,63}$/, "版本号格式不正确"),
  changelog: z.string().trim().min(4, "请填写版本说明").max(8000),
  repositoryUrl: z.string().url("请输入有效 URL").or(z.literal("")),
  connectionType: z.enum(["stdio", "sse", "streamable_http"]),
});

export type PublishDraftForm = z.infer<typeof publishDraftSchema>;
