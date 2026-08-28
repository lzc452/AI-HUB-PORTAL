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
  applicationType: z.enum(["web_app", "desktop_app", "mobile_app", "mini_program"]).default("web_app"),
  departmentId: z.string().trim().default(""),
  categoryName: z.string().default(""),
  manualText: z.string().default(""),
  examplesText: z.string().default(""),
  faqQuestion: z.string().default(""),
  faqAnswer: z.string().default(""),
  screenshotAssetIdsText: z.string().default(""),
  entryUrl: z.string().url("请输入有效的 Web 应用 URL").or(z.literal("")).default(""),
  inputRestrictionDisclaimer: z.string().default(""),
  modelProvider: z.enum(["deepseek", "qwen", "wenxin", "hunyuan", "local", "other"]).default("local"),
  handlesSensitiveData: z.boolean().default(false),
  sendsDataExternally: z.boolean().default(false),
  retainsConversations: z.boolean().default(false),
  affectsHighRiskDecisions: z.boolean().default(false),
  retentionPeriod: z.string().default(""),
}).superRefine((value, context) => {
  if (value.type !== "app") return;
  if (value.applicationType !== "web_app") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["applicationType"], message: "一期仅支持 Web App" });
  }
  const required: Array<[keyof typeof value, string]> = [
    ["departmentId", "请选择所属部门"],
    ["categoryName", "请填写应用分类"],
    ["manualText", "请填写使用手册"],
    ["examplesText", "请填写使用示例"],
    ["faqQuestion", "请填写至少一条 FAQ 问题"],
    ["faqAnswer", "请填写至少一条 FAQ 答案"],
    ["inputRestrictionDisclaimer", "请填写输入限制免责声明"],
    ["entryUrl", "请输入 Web 应用入口 URL"],
  ];
  required.forEach(([path, message]) => {
    if (typeof value[path] !== "string" || value[path].trim() === "") context.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  });
});

/** Values accepted by react-hook-form before Zod applies defaults. */
export type PublishDraftFormInput = z.input<typeof publishDraftSchema>;
/** Fully-normalized values emitted after Zod validation/defaults. */
export type PublishDraftForm = z.output<typeof publishDraftSchema>;
