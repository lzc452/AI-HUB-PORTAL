import type {
  AppDetail,
  AppHuntPayload,
  AppPage,
  AppSummary,
  ContentPage,
  DashboardCommentItem,
  DashboardCommentPage,
  DashboardOverview,
  DepartmentDetail,
  DepartmentSummary,
  HomePayload,
  ListQuery,
  McpDetail,
  McpPage,
  McpSummary,
  PageResult,
  PluginDetail,
  PluginPage,
  PluginSummary,
  ResourceComment,
  ResourceFileNode,
  ResourceSummary,
  ResourceType,
  SkillDetail,
  SkillPackageSummary,
  SkillPage,
  SkillSummary,
} from "@/types";

const owner = (employeeId: string, displayName: string, departmentName: string) => ({
  employeeId,
  displayName,
  avatarUrl: null,
  departmentName,
});

const appSeeds = [
  ["智能会议纪要", "meeting-copilot", "自动转写会议、提炼结论并跟踪行动项。", "产品研发部"],
  ["合同风险助手", "contract-risk", "识别关键条款与履约风险，生成可核查的审阅建议。", "法务合规部"],
  ["经营数据洞察", "business-insight", "用自然语言查询经营指标并生成趋势解读。", "数据智能部"],
  ["客服质检台", "service-inspector", "批量分析会话质量、情绪与服务规范执行情况。", "客户体验部"],
  ["研发知识问答", "engineering-qa", "连接内部技术文档，为研发问题提供带来源的答案。", "技术平台部"],
  ["招聘面试助手", "interview-assistant", "根据岗位要求生成面试提纲与结构化评估记录。", "人力资源部"],
  ["营销素材工坊", "campaign-studio", "生成符合品牌规范的活动文案与多尺寸素材建议。", "品牌市场部"],
  ["采购比价助手", "procurement-compare", "归集供应商报价并呈现价格、交付与风险差异。", "供应链中心"],
] as const;

export const fixtureApps: AppSummary[] = appSeeds.map(([name, slug, description, departmentName], index) => ({
  id: `app-${index + 1}`,
  type: "app",
  name,
  slug,
  href: `/apps/E${1001 + index}/${slug}`,
  description,
  iconUrl: null,
  owner: owner(`E${1001 + index}`, ["周知远", "沈清和", "陈溪", "林澄", "许言", "乔安", "顾南", "韩青"][index], departmentName),
  tags: [["效率", "会议"], ["法务", "风控"], ["数据", "分析"], ["客服", "质检"], ["研发", "知识库"], ["招聘", "评估"], ["营销", "内容"], ["采购", "分析"]][index],
  score: 98 - index * 3,
  stars: 486 - index * 37,
  downloads: 3200 - index * 211,
  updatedAt: `2026-08-${String(23 - index).padStart(2, "0")}T08:00:00.000Z`,
  status: "published",
  isStarred: index === 1,
  departmentId: `dept-${index % 5 + 1}`,
  departmentName,
  rating: 4.9 - index * 0.08,
}));

const skillSeeds = [
  ["需求拆解专家", "requirement-decomposer", "将模糊业务目标拆分为可执行的用户故事与验收标准。"],
  ["数据报告润色", "report-polisher", "把分析结果整理为清晰、克制、面向决策者的报告。"],
  ["SQL 安全审查", "sql-safety-review", "在执行前检查查询风险、权限边界与性能隐患。"],
  ["客服回复校准", "service-reply-tuner", "按照品牌语气与服务规范改写客服回复。"],
  ["事故复盘教练", "incident-retrospective", "引导团队从时间线、根因到改进行动完成复盘。"],
  ["竞品信息提炼", "competitor-synthesizer", "从公开材料提炼产品定位、能力和差异点。"],
  ["代码评审清单", "code-review-checklist", "按风险与优先级输出可执行的代码评审意见。"],
  ["OKR 对齐助手", "okr-alignment", "检查目标、关键结果与团队依赖是否清晰对齐。"],
] as const;

export const fixtureSkills: SkillSummary[] = skillSeeds.map(([name, slug, description], index) => ({
  id: `skill-${index + 1}`,
  type: "skill",
  name,
  slug,
  href: `/skills/S${2001 + index}/${slug}`,
  description,
  iconUrl: null,
  owner: owner(`S${2001 + index}`, ["宋栩", "程澈", "梁川", "白鹭", "唐屿", "叶知秋", "秦风", "谢宁"][index], ["产品研发部", "品牌市场部", "数据智能部", "客户体验部"][index % 4]),
  tags: [["产品", "规划"], ["写作", "报告"], ["SQL", "安全"], ["客服", "品牌"], ["稳定性", "复盘"], ["研究", "分析"], ["研发", "质量"], ["管理", "目标"]][index],
  score: 96 - index * 3,
  stars: 362 - index * 29,
  downloads: 2450 - index * 173,
  updatedAt: `2026-08-${String(22 - index).padStart(2, "0")}T09:30:00.000Z`,
  status: "published",
  isStarred: index === 0,
  trigger: ["拆解需求", "润色报告", "审查 SQL", "校准回复", "开始复盘", "分析竞品", "评审代码", "检查 OKR"][index],
  environments: index % 2 === 0 ? ["Codex", "Claude Code"] : ["ChatGPT", "Web"],
}));

const pluginSeeds = [
  ["GitLab 工作流", "gitlab-flow", "查询 Merge Request、Issue 与流水线状态。"],
  ["企业知识库", "enterprise-wiki", "检索内部知识空间并返回可追溯引用。"],
  ["数据目录", "data-catalog", "发现数据资产、字段口径和血缘信息。"],
  ["工单中心", "ticket-center", "创建、查询和更新跨部门服务工单。"],
  ["制品仓库", "artifact-registry", "浏览构建制品、版本与安全扫描结果。"],
  ["项目日历", "project-calendar", "同步里程碑、会议和交付日期。"],
] as const;

export const fixturePlugins: PluginSummary[] = pluginSeeds.map(([name, slug, description], index) => ({
  id: `plugin-${index + 1}`,
  type: "plugin",
  name,
  slug,
  href: `/plugins/P${3001 + index}/${slug}`,
  description,
  iconUrl: null,
  owner: owner(`P${3001 + index}`, ["平台工程团队", "知识管理团队", "数据治理团队", "共享服务团队", "DevOps 团队", "项目管理办公室"][index], ["技术平台部", "企业发展部", "数据智能部"][index % 3]),
  tags: [["GitLab", "研发"], ["知识库", "检索"], ["数据", "治理"], ["工单", "协同"], ["制品", "安全"], ["日历", "项目"]][index],
  score: 94 - index * 4,
  stars: 298 - index * 31,
  downloads: 1760 - index * 205,
  updatedAt: `2026-08-${String(21 - index).padStart(2, "0")}T10:00:00.000Z`,
  status: "published",
  isStarred: false,
  repositoryUrl: `https://git.example.internal/ai-hub/${slug}`,
  syncStatus: index === 4 ? "syncing" : "synced",
}));

const mcpSeeds = [
  ["PostgreSQL Readonly", "postgres-readonly", "通过只读连接安全查询授权数据库。", "stdio"],
  ["Observability Gateway", "observability-gateway", "统一查询日志、指标和追踪信息。", "streamable_http"],
  ["Document Search", "document-search", "对企业文档进行语义搜索与权限过滤。", "sse"],
  ["Browser Automation", "browser-automation", "在隔离环境中完成网页浏览和表单自动化。", "streamable_http"],
  ["Design Assets", "design-assets", "发现设计资源、组件说明和品牌规范。", "stdio"],
] as const;

export const fixtureMcps: McpSummary[] = mcpSeeds.map(([name, slug, description, connectionType], index) => ({
  id: `mcp-${index + 1}`,
  type: "mcp",
  name,
  slug,
  href: `/mcp/${slug}`,
  description,
  iconUrl: null,
  owner: owner(`M${4001 + index}`, ["数据库平台组", "可观测性团队", "知识平台组", "自动化平台组", "设计系统组"][index], ["技术平台部", "数据智能部"][index % 2]),
  tags: [["PostgreSQL", "只读"], ["监控", "日志"], ["搜索", "文档"], ["浏览器", "自动化"], ["设计", "资产"]][index],
  score: 92 - index * 3,
  stars: 244 - index * 27,
  downloads: 1320 - index * 151,
  updatedAt: `2026-08-${String(20 - index).padStart(2, "0")}T11:00:00.000Z`,
  status: "published",
  isStarred: index === 2,
  connectionType: connectionType as McpSummary["connectionType"],
  healthStatus: index === 3 ? "degraded" : "healthy",
}));

export const fixtureDepartments: DepartmentSummary[] = [
  ["dept-1", "产品研发部", "围绕核心产品建设可信、易用的 AI 能力。", 126, 34],
  ["dept-2", "技术平台部", "提供模型、数据、工程效率与安全基础设施。", 89, 41],
  ["dept-3", "数据智能部", "让企业数据更容易被理解、分析和使用。", 62, 27],
  ["dept-4", "客户体验部", "通过 AI 提升服务质量与客户满意度。", 74, 19],
  ["dept-5", "品牌市场部", "打造统一品牌体验并提升内容生产效率。", 48, 16],
].map(([departmentId, name, description, memberCount, resourceCount]) => ({ departmentId, name, description, memberCount, resourceCount, logoUrl: null } as DepartmentSummary));

export const fixturePackages: SkillPackageSummary[] = [
  ["package-1", "product-discovery", "产品发现工具箱", "从用户洞察到需求优先级的一组产品 Skill。", 4],
  ["package-2", "engineering-quality", "研发质量工具箱", "覆盖评审、安全检查和事故复盘的工程 Skill。", 3],
  ["package-3", "customer-success", "客户成功工具箱", "用于客服回复、会话质检和知识检索的 Skill。", 3],
].map(([id, slug, name, description, count], index) => ({ id, slug, name, description, skillCount: count, skills: fixtureSkills.slice(index * 2, index * 2 + Number(count)), updatedAt: `2026-08-${20 - index}T08:00:00.000Z` } as SkillPackageSummary));

const comments: ResourceComment[] = [
  { commentId: "comment-1", body: "版本说明很清楚，会议行动项的负责人识别准确率也有明显提升。", author: owner("E5101", "季衡", "项目管理办公室"), parentCommentId: null, createdAt: "2026-08-22T09:12:00.000Z", replies: [{ commentId: "reply-1", body: "感谢反馈，我们会继续优化跨部门会议中的角色识别。", author: owner("E1001", "周知远", "产品研发部"), parentCommentId: "comment-1", createdAt: "2026-08-22T10:05:00.000Z", replies: [] }] },
  { commentId: "comment-2", body: "希望后续增加行动项导出到项目管理工具的能力。", author: owner("E5204", "闻舟", "企业发展部"), parentCommentId: null, createdAt: "2026-08-21T15:40:00.000Z", replies: [] },
];

const allResources = (): ResourceSummary[] => [...fixtureApps, ...fixtureSkills, ...fixturePlugins, ...fixtureMcps];

export function fixtureList<T extends ResourceSummary>(items: T[], query: ListQuery): PageResult<T> {
  const keyword = query.q?.trim().toLowerCase();
  let filtered = keyword ? items.filter((item) => `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(keyword)) : [...items];
  if (query.category) filtered = filtered.filter((item) => item.tags.includes(query.category!));
  const sortBy = query.sortBy ?? "score";
  filtered.sort((a, b) => sortBy === "updatedAt" ? b.updatedAt.localeCompare(a.updatedAt) : sortBy === "downloads" ? (b.downloads ?? 0) - (a.downloads ?? 0) : (b.score ?? 0) - (a.score ?? 0));
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: filtered.length };
}

export function fixtureAppPage(query: ListQuery): AppPage { return fixtureList(fixtureApps, query); }
export function fixtureSkillPage(query: ListQuery): SkillPage { return fixtureList(fixtureSkills, query); }
export function fixturePluginPage(query: ListQuery): PluginPage { return fixtureList(fixturePlugins, query); }
export function fixtureMcpPage(query: ListQuery): McpPage { return fixtureList(fixtureMcps, query); }

function fixtureFiles(type: ResourceType, slug: string): ResourceFileNode[] {
  const markdown = (title: string, description: string) => `# ${title}\n\n${description}\n\n## 安全约束\n\n- 仅访问当前员工有权限的数据\n- 关键操作写入审计日志\n- 禁止在输出中暴露敏感信息\n`;
  if (type === "app") return [
    { id: `${slug}-readme`, name: "README.md", path: "README.md", type: "file", language: "markdown", size: 684, content: markdown("智能会议纪要", "将会议内容转换为可追踪的结论和行动项。") },
    { id: `${slug}-src`, name: "src", path: "src", type: "directory", children: [
      { id: `${slug}-app`, name: "App.tsx", path: "src/App.tsx", type: "file", language: "tsx", size: 921, content: `import { useMeetingSummary } from "./hooks/useMeetingSummary";\n\nexport function App() {\n  const meeting = useMeetingSummary();\n  return (\n    <main aria-label="会议纪要">\n      <h1>{meeting.title}</h1>\n      <section>{meeting.summary}</section>\n      <ol>{meeting.actions.map((action) => <li key={action.id}>{action.owner}：{action.task}</li>)}</ol>\n    </main>\n  );\n}\n` },
      { id: `${slug}-api-dir`, name: "api", path: "src/api", type: "directory", children: [
        { id: `${slug}-client`, name: "client.ts", path: "src/api/client.ts", type: "file", language: "typescript", size: 512, content: `export async function getMeetingSummary(meetingId: string) {\n  const response = await fetch(\`/internal/meetings/\${encodeURIComponent(meetingId)}/summary\`, { credentials: "same-origin" });\n  if (!response.ok) throw new Error("MEETING_SUMMARY_FAILED");\n  return response.json();\n}\n` },
      ] },
    ] },
    { id: `${slug}-manifest`, name: "portal.json", path: "portal.json", type: "file", language: "json", size: 248, content: `{"name":"${slug}","delivery":["web","dingtalk"],"permissions":["meeting.read"]}\n` },
  ];
  if (type === "skill") return [
    { id: `${slug}-skill`, name: "SKILL.md", path: "SKILL.md", type: "file", language: "markdown", size: 1260, content: `---\nname: ${slug}\ndescription: 将模糊目标拆解为可执行需求与验收标准。\n---\n\n# 执行流程\n\n1. 明确目标用户、问题与成功指标。\n2. 列出约束、依赖和不可变条件。\n3. 形成用户故事与可验证的验收标准。\n\n## 输出要求\n\n每项结论必须说明依据；不确定信息明确标记为待确认。\n` },
    { id: `${slug}-references`, name: "references", path: "references", type: "directory", children: [
      { id: `${slug}-checklist`, name: "acceptance-checklist.md", path: "references/acceptance-checklist.md", type: "file", language: "markdown", size: 642, content: `# 验收标准清单\n\n- 是否描述可观察的用户行为\n- 是否包含正常、边界与异常路径\n- 是否能够由测试或业务验收验证\n- 是否避免实现细节替代业务结果\n` },
      { id: `${slug}-example`, name: "example.json", path: "references/example.json", type: "file", language: "json", size: 354, content: `{"story":"作为员工，我希望按资源类型筛选收藏，以便快速找到目标资源。","acceptance":["筛选状态写入 URL","刷新后状态保持","空结果显示清除筛选入口"]}\n` },
    ] },
  ];
  if (type === "plugin") return [
    { id: `${slug}-readme`, name: "README.md", path: "README.md", type: "file", language: "markdown", size: 792, content: markdown("GitLab 工作流 Plugin", "在最小权限范围内查询 Merge Request、Issue 与流水线。") },
    { id: `${slug}-src`, name: "src", path: "src", type: "directory", children: [
      { id: `${slug}-index`, name: "index.ts", path: "src/index.ts", type: "file", language: "typescript", size: 930, content: `import { definePlugin } from "@ai-hub/plugin-sdk";\n\nexport default definePlugin({\n  name: "gitlab-flow",\n  tools: {\n    async listMergeRequests({ projectId, state = "opened" }, context) {\n      context.permissions.require("gitlab.merge_requests.read");\n      return context.gitlab.mergeRequests.list({ projectId, state });\n    },\n  },\n});\n` },
      { id: `${slug}-schemas`, name: "schemas.ts", path: "src/schemas.ts", type: "file", language: "typescript", size: 488, content: `import { z } from "zod";\n\nexport const listMergeRequestsSchema = z.object({\n  projectId: z.string().min(1),\n  state: z.enum(["opened", "merged", "closed"]).default("opened"),\n});\n` },
    ] },
    { id: `${slug}-package`, name: "package.json", path: "package.json", type: "file", language: "json", size: 232, content: `{"name":"@ai-hub/${slug}","version":"1.6.0","type":"module","main":"dist/index.js"}\n` },
  ];
  return [
    { id: `${slug}-readme`, name: "README.md", path: "README.md", type: "file", language: "markdown", size: 720, content: markdown("Observability MCP", "统一查询日志、指标和追踪信息，并保持企业权限边界。") },
    { id: `${slug}-server`, name: "server", path: "server", type: "directory", children: [
      { id: `${slug}-server-index`, name: "index.ts", path: "server/index.ts", type: "file", language: "typescript", size: 1054, content: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";\nimport { z } from "zod";\n\nconst server = new McpServer({ name: "${slug}", version: "1.6.0" });\n\nserver.tool("search_logs", { query: z.string(), minutes: z.number().int().max(1440) }, async ({ query, minutes }) => ({\n  content: [{ type: "text", text: JSON.stringify(await searchAuthorizedLogs(query, minutes)) }],\n}));\n\nserver.connect(createAuthenticatedTransport());\n` },
      { id: `${slug}-auth`, name: "auth.ts", path: "server/auth.ts", type: "file", language: "typescript", size: 460, content: `export function requireEmployeeScope(scope: string, actor: { scopes: string[] }) {\n  if (!actor.scopes.includes(scope)) throw new Error("MCP_SCOPE_FORBIDDEN");\n}\n` },
    ] },
    { id: `${slug}-config`, name: "mcp.json", path: "mcp.json", type: "file", language: "json", size: 316, content: `{"name":"${slug}","transport":"streamable_http","tools":["search_logs","get_trace"],"authentication":"enterprise_sso"}\n` },
  ];
}

export function fixtureDetail(type: ResourceType, slug: string): AppDetail | SkillDetail | PluginDetail | McpDetail {
  const summary = allResources().find((item) => item.type === type && item.slug === slug) ?? allResources().find((item) => item.type === type);
  if (!summary) throw new Error("FIXTURE_RESOURCE_NOT_FOUND");
  const base = { ...summary, overview: `## ${summary.name}\n\n${summary.description}\n\n该资源已完成企业安全扫描与发布审核，可在授权范围内放心使用。\n\n### 使用建议\n\n- 首次使用前确认数据权限范围\n- 关键输出应保留来源与审核记录`, version: "1.6.0", compatibility: ["Web", "Windows", "macOS"], screenshots: [], securityStatus: "passed" as const, publishedAt: "2026-06-18T08:00:00.000Z", files: fixtureFiles(type, slug) };
  if (type === "app") return { ...base, ...(summary as AppSummary), type, deliveryTypes: ["Web", "DingTalk"], latestSecurityReport: "依赖与上传资产扫描通过，未发现高风险项。" };
  if (type === "skill") return { ...base, ...(summary as SkillSummary), type, installCommand: `npx ai-hub skill add ${summary.slug}` };
  if (type === "plugin") return { ...base, ...(summary as PluginSummary), type, readme: `# ${summary.name}\n\n${summary.description}\n\n插件采用最小权限连接，并记录所有调用审计。`, installCommand: `npx ai-hub plugin add ${summary.slug}` };
  return { ...base, ...(summary as McpSummary), type: "mcp", tools: [{ name: "search", description: "按权限查询可用内容。" }, { name: "get_detail", description: "获取指定对象的详细信息。" }], configTemplate: `{\n  "mcpServers": {\n    "${summary.slug}": { "url": "https://ai-hub.internal/mcp/${summary.slug}" }\n  }\n}`, authentication: "企业 SSO 委托凭证" };
}

export function fixtureHome(): HomePayload {
  return { apps: fixtureApps.slice(0, 4), skills: fixtureSkills.slice(0, 4), plugins: fixturePlugins.slice(0, 3), mcps: fixtureMcps.slice(0, 3), departments: fixtureDepartments, skillPackages: fixturePackages, updates: { title: "Portal 一期正式开放", summary: "统一发现、收藏与发布 App、Skill、Plugin 和 MCP。", updatedAt: "2026-08-24T08:00:00.000Z" } };
}

export function fixtureDepartment(id: string): DepartmentDetail {
  const department = fixtureDepartments.find((item) => item.departmentId === id) ?? fixtureDepartments[0];
  return { ...department, leader: "周知远", members: [{ employeeId: "E1001", displayName: "周知远", role: "负责人" }, { employeeId: "E1009", displayName: "林澄", role: "产品经理" }, { employeeId: "E1021", displayName: "宋栩", role: "AI 工程师" }], applications: fixtureApps.filter((app) => app.departmentId === department.departmentId) };
}

export function fixtureHunt(): AppHuntPayload {
  return { periodId: "2026-w34", periodName: "第 34 周应用猎手", description: "发现本周最值得在团队中推广的 AI 应用，每人可保留一张有效票。", closesAt: "2026-08-30T16:00:00.000Z", entries: fixtureApps.slice(0, 6).map((app, index) => ({ entryId: `entry-${index + 1}`, rank: index + 1, app, votes: 428 - index * 53, hasVoted: index === 2 })), history: [{ periodId: "2026-w33", periodName: "第 33 周", winnerName: "研发知识问答" }, { periodId: "2026-w32", periodName: "第 32 周", winnerName: "经营数据洞察" }] };
}

export function fixtureDashboard(): DashboardOverview {
  return { counts: { app: 3, skill: 6, plugin: 2, mcp: 1 }, favoriteCount: 8, recent: allResources().slice(0, 6).map((item, index) => ({ id: item.id, name: item.name, type: item.type, status: index === 1 ? "in_review" : item.status, href: item.href, updatedAt: item.updatedAt })) };
}

const dashboardComments: DashboardCommentItem[] = [
  { commentId: "dashboard-comment-1", resourceType: "app", resourceId: "app-1", resourceName: "智能会议纪要", resourceHref: "/apps/E1001/meeting-copilot?tab=comments#comment-comment-1", body: "行动项已经可以同步到项目看板了，欢迎继续体验。", kind: "reply", author: owner("E1001", "周知远", "产品研发部"), parentComment: { commentId: "mine-1", body: "希望支持行动项同步。", author: owner("DEMO-EMPLOYEE", "林知行", "数据智能部") }, createdAt: "2026-08-23T13:20:00.000Z" },
  { commentId: "dashboard-comment-2", resourceType: "skill", resourceId: "skill-1", resourceName: "需求拆解专家", resourceHref: "/skills/S2001/requirement-decomposer?tab=comments#comment-dashboard-comment-2", body: "新版本补充了验收标准的反例，请帮忙看看是否更易用。", kind: "reply", author: owner("S2001", "宋栩", "产品研发部"), parentComment: { commentId: "mine-2", body: "建议增加反例提示。", author: owner("DEMO-EMPLOYEE", "林知行", "数据智能部") }, createdAt: "2026-08-20T09:05:00.000Z" },
  { commentId: "mine-1", resourceType: "plugin", resourceId: "plugin-1", resourceName: "GitLab 工作流", resourceHref: "/plugins/P3001/gitlab-flow?tab=comments#comment-mine-1", body: "流水线失败时能否直接展示对应 Job 的关键日志？", kind: "comment", author: owner("DEMO-EMPLOYEE", "林知行", "数据智能部"), parentComment: null, createdAt: "2026-08-19T17:32:00.000Z" },
  { commentId: "mine-2", resourceType: "mcp", resourceId: "mcp-2", resourceName: "Observability Gateway", resourceHref: "/mcp/observability-gateway?tab=comments#comment-mine-2", body: "权限隔离说明很清晰，接入过程顺利。", kind: "comment", author: owner("DEMO-EMPLOYEE", "林知行", "数据智能部"), parentComment: null, createdAt: "2026-08-18T11:15:00.000Z" },
];

export function fixtureDashboardComments(view: "replies" | "mine", resourceType: ResourceType | undefined, sort: "latest" | "oldest", page: number, pageSize: number): DashboardCommentPage {
  let items = dashboardComments.filter((item) => view === "replies" ? item.kind === "reply" : item.author.employeeId === "DEMO-EMPLOYEE");
  if (resourceType) items = items.filter((item) => item.resourceType === resourceType);
  items.sort((a, b) => sort === "latest" ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt));
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: items.length };
}

export const fixtureDocs: Record<ContentPage["slug"], ContentPage> = {
  tutorials: { slug: "tutorials", title: "使用指南", summary: "从发现资源到发布审核，快速掌握 AI Hub Portal。", markdown: "## 开始使用\n\n使用顶部导航发现 App、Skill、Plugin 与 MCP。列表筛选会保存在 URL 中，方便分享。\n\n## 收藏与评论\n\n在详情页收藏资源、查看安全报告，并与发布者交流使用经验。\n\n## 发布资源\n\n进入个人中心的发布工作台，按步骤完成元数据、资产、安全扫描和审核提交。", updatedAt: "2026-08-24T08:00:00.000Z" },
  about: { slug: "about", title: "关于我们", summary: "让经过验证的 AI 能力在企业内被安全地发现与复用。", markdown: "## AI Hub Portal\n\nPortal 是企业员工发现、评估、收藏和发布 AI 资源的统一入口。\n\n## 我们的原则\n\n资源可追溯、权限最小化、审核有记录、使用有反馈。", updatedAt: "2026-08-18T08:00:00.000Z" },
  updates: { slug: "updates", title: "更新日志", summary: "了解 Portal 最新功能、体验优化和安全能力。", markdown: "## 2026.08.24\n\n- 上线 App、Skill、Plugin 与 MCP 四类资源发现页。\n- 新增我的评论双视图。\n- 发布流程接入安全扫描和审核。\n\n## 2026.08.12\n\n- 完成部门中心与应用猎手内测。", updatedAt: "2026-08-24T08:00:00.000Z" },
};

export function fixtureComments(): ResourceComment[] { return structuredClone(comments); }
export function fixtureStars(page: number, pageSize: number): PageResult<ResourceSummary> {
  const items = allResources().filter((item) => item.isStarred);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: items.length };
}
