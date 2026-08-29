/**
 * 静态数据统一管理（生产静态数据 + API 缺失时的回退数据）。
 *
 * 分工说明（详见 src/apis/API-INTEGRATION-REPORT.md）：
 * - 本文件：页面/组件使用的生产静态数据（分类、导航、标签映射、选项、文案、回退值）。
 * - src/apis/fixtures.ts：仅 dev/测试（VITE_PORTAL_USE_FIXTURES=true）使用的模拟数据，不得在
 *   真实联调路径引用。
 * - 数据能走 /internal/portal/* 接口的一律走接口；本文件只保留无接口来源或接口字段不匹配的
 *   静态数据，并保留为页面回退渲染。
 */
import {
  AppWindow,
  Blocks,
  Bookmark,
  Bot,
  Building2,
  Globe2,
  KeyRound,
  MessageCircle,
  Network,
  PackageOpen,
  PackagePlus,
  PlugZap,
  Puzzle,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { PublishStatus, ResourceType } from "@/types";

// ---------------------------------------------------------------------------
// 1. 资源分类（后端暂无分类目录读取接口，前端静态维护筛选选项）
// ---------------------------------------------------------------------------

export const resourceCategories: Record<ResourceType, readonly string[]> = {
  app: ["效率", "数据", "研发", "客服", "法务"],
  skill: ["产品", "写作", "研发", "安全", "管理"],
  plugin: ["研发", "知识库", "数据", "协同", "项目"],
  mcp: ["PostgreSQL", "监控", "搜索", "自动化", "设计"],
};

// ---------------------------------------------------------------------------
// 2. 名称 / 标签 / 色调映射（覆盖全部枚举，见 tests/portal.test.tsx sanity 测试）
// ---------------------------------------------------------------------------

export const resourceLabels: Record<ResourceType, string> = {
  app: "应用",
  skill: "技能",
  plugin: "插件",
  mcp: "MCP",
};

export const publishStatusLabels: Record<PublishStatus, string> = {
  draft: "草稿",
  in_review: "审核中",
  approved: "已批准",
  published: "已发布",
  withdrawn: "已下架",
  archived: "已归档",
};

export const resourceTone: Record<ResourceType, string> = {
  app: "border-indigo-200 bg-indigo-50 text-indigo-700",
  skill: "border-violet-200 bg-violet-50 text-violet-700",
  plugin: "border-emerald-200 bg-emerald-50 text-emerald-700",
  mcp: "border-orange-200 bg-orange-50 text-orange-700",
};

export const statusTone: Record<PublishStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  in_review: "border-violet-200 bg-violet-50 text-violet-700",
  approved: "border-sky-200 bg-sky-50 text-sky-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  withdrawn: "border-slate-200 bg-slate-50 text-slate-600",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

/** AppHunt 前三名奖牌名；第 4 名起由页面按名次拼接。 */
export const appHuntMedalRanks = ["冠军", "亚军", "季军"] as const;

/** 资源详情页面包屑的上级路径。 */
export const resourcePaths: Record<ResourceType, string> = {
  app: "/apps?sortBy=score",
  skill: "/skills",
  plugin: "/plugins",
  mcp: "/mcp",
};

// ---------------------------------------------------------------------------
// 3. 导航
// ---------------------------------------------------------------------------

export const portalNavItems = [
  {
    label: "应用",
    href: "/apps?sortBy=score",
    children: [
      { label: "全部应用", description: "发现经过审核与安全扫描、可在企业内直接使用的 AI 应用。", href: "/apps?sortBy=score" },
      { label: "应用猎手", description: "用员工真实投票形成每周榜单，让优秀实践更快进入团队。", href: "/apps-hunt" },
      { label: "部门中心", description: "从业务团队的真实使用经验中发现更合适的资源。", href: "/department-zone" },
    ],
  },
  {
    label: "技能",
    href: "/skills",
    children: [
      { label: "全部技能", description: "把可靠的方法、约束和参考资料封装为可复用能力。", href: "/skills" },
      { label: "技能包", description: "按真实任务将多个 Skills 组织为完整工作流。", href: "/skillpackage" },
    ],
  },
  {
    label: "资源",
    href: "/plugins",
    children: [
      { label: "插件", description: "从代码托管、知识库到数据平台，选择受控的连接能力。", href: "/plugins" },
      { label: "MCP", description: "以 MCP 协议透明、可审计地连接企业数据与工具。", href: "/mcp" },
    ],
  },
  {
    label: "文档",
    href: "/tutorials",
    children: [
      { label: "使用指南", description: "图文与示例驱动的上手教程，从入门到进阶。", href: "/tutorials" },
      { label: "更新日志", description: "跟随每次更新，了解 Portal 的新能力与修复。", href: "/updates" },
      { label: "关于我们", description: "了解 AI Hub Portal 如何把 AI 能力带到每个人的工作中。", href: "/about" },
    ],
  },
] as const;

export const portalMobileNavItems: ReadonlyArray<{ label: string; href: string }> = portalNavItems.reduce<Array<{ label: string; href: string }>>((items, group) => [...items, ...group.children], []);

export const dashboardNavItems: ReadonlyArray<{ href: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { href: "/dashboard", label: "个人中心", icon: UserRound, end: true },
  { href: "/dashboard/publish", label: "发布", icon: PackagePlus },
  { href: "/dashboard/setting", label: "设置", icon: Settings },
  { href: "/dashboard/stars", label: "收藏", icon: Star },
  { href: "/dashboard/comments", label: "评论", icon: MessageCircle },
];

export const docsNavigation = [
  { href: "/tutorials", label: "使用指南" },
  { href: "/updates", label: "更新日志" },
  { href: "/about", label: "关于我们" },
] as const;

export const footerLinks = {
  quick: [
    { href: "/tutorials", label: "使用指南" },
    { href: "/updates", label: "更新日志" },
    { href: "/about", label: "关于我们" },
  ],
  workspace: [
    { href: "/dashboard/publish", label: "发布资源" },
    { href: "/dashboard/stars", label: "我的收藏" },
    { href: "/dashboard/comments", label: "我的评论" },
  ],
} as const;

// ---------------------------------------------------------------------------
// 4. 选项列表（排序、筛选、连接类型等）
// ---------------------------------------------------------------------------

export const resourceSortOptions = [
  { key: "score", label: "精选" },
  { key: "downloads", label: "下载量" },
  { key: "updatedAt", label: "最近上新" },
] as const;

export const commentResourceTypeOptions: ReadonlyArray<{ value: "all" | ResourceType; label: string }> = [
  { value: "all", label: "全部资源" },
  { value: "app", label: "应用" },
  { value: "skill", label: "技能" },
  { value: "plugin", label: "插件" },
  { value: "mcp", label: "MCP" },
];

export const commentSortOptions = [
  { value: "latest", label: "最新优先" },
  { value: "oldest", label: "最早优先" },
] as const;

export const favoriteResourceTypes: readonly ResourceType[] = ["app", "skill", "plugin", "mcp"];

export const mcpConnectionTypes = [
  { value: "stdio", label: "stdio" },
  { value: "sse", label: "SSE" },
  { value: "streamable_http", label: "Streamable HTTP" },
] as const;

export const skillPackageTones = ["bg-emerald-50", "bg-orange-50", "bg-indigo-50"] as const;

// ---------------------------------------------------------------------------
// 5. 发布向导
// ---------------------------------------------------------------------------

export const publishResourceOptions: ReadonlyArray<{ type: ResourceType; icon: LucideIcon; title: string; description: string; tone: string }> = [
  { type: "app", icon: AppWindow, title: "App", description: "面向员工交付完整 AI 应用体验", tone: "bg-indigo-50 text-indigo-700" },
  { type: "skill", icon: Blocks, title: "Skill", description: "封装方法、触发条件与参考资料", tone: "bg-violet-50 text-violet-700" },
  { type: "plugin", icon: Puzzle, title: "Plugin", description: "把企业系统能力接入 AI 工作流", tone: "bg-emerald-50 text-emerald-700" },
  { type: "mcp", icon: Bot, title: "MCP", description: "发布标准化工具服务与配置模板", tone: "bg-orange-50 text-orange-700" },
];

export const publishStepLabels = ["选择类型", "资源信息", "上传资产", "安全扫描", "预览", "提交审核"] as const;

/** Dashboard 个人中心的资源类型统计卡片（label 使用 resourceLabels）。 */
export const dashboardTypeCards: ReadonlyArray<{ type: ResourceType; icon: LucideIcon; tone: string }> = [
  { type: "app", icon: AppWindow, tone: "bg-indigo-50 text-indigo-700" },
  { type: "skill", icon: Blocks, tone: "bg-violet-50 text-violet-700" },
  { type: "plugin", icon: Puzzle, tone: "bg-emerald-50 text-emerald-700" },
  { type: "mcp", icon: Bot, tone: "bg-orange-50 text-orange-700" },
];

// ---------------------------------------------------------------------------
// 6. 详情页
// ---------------------------------------------------------------------------

export const resourceTabs = [
  { key: "overview", label: "概述" },
  { key: "versions", label: "版本与文件" },
  { key: "install", label: "安装与使用" },
  { key: "comments", label: "评论" },
  { key: "security", label: "安全报告" },
] as const;

// ---------------------------------------------------------------------------
// 7. 首页（Hero / Marquee / Bento / Accordion）
// ---------------------------------------------------------------------------

export const homeHeroTitle = { first: "把好用的 AI 能力", second: "，带到每个人的工作中" } as const;

export const homeMarqueeItems: ReadonlyArray<{ icon: LucideIcon; label: string }> = [
  { icon: Star, label: "应用" },
  { icon: Wand2, label: "技能" },
  { icon: PlugZap, label: "插件" },
  { icon: Network, label: "MCP" },
  { icon: Trophy, label: "App Hunt 每周榜单" },
  { icon: ShieldCheck, label: "统一安全扫描" },
  { icon: Globe2, label: "网页端发布" },
  { icon: KeyRound, label: "企业 SSO 与权限" },
  { icon: Building2, label: "部门实践" },
  { icon: Bookmark, label: "收藏复用" },
  { icon: ScrollText, label: "审计透明" },
  { icon: Users, label: "团队共享" },
];

export const homeAccordionSlices: ReadonlyArray<{ icon: LucideIcon; keyword: string; eyebrow: string; title: string; text: string; href: string; action: string }> = [
  { icon: Trophy, keyword: "hunt", eyebrow: "APP HUNT", title: "发现正在改变工作方式的应用", text: "用员工真实投票形成每周榜单，让优秀实践更快进入团队。", href: "/apps-hunt", action: "查看本周榜单" },
  { icon: PlugZap, keyword: "circuit", eyebrow: "PLUGIN & MCP", title: "把企业工具带进 AI 工作流", text: "从代码托管、知识库到数据平台，选择经过权限和安全检查的连接能力。", href: "/plugins", action: "浏览连接资源" },
  { icon: Building2, keyword: "campus", eyebrow: "DEPARTMENT", title: "跟随部门实践复用成熟能力", text: "了解不同团队发布、维护与推荐的 AI 资源，找到最贴近业务的解法。", href: "/department-zone", action: "进入部门中心" },
];

export const homeTypeCards: ReadonlyArray<{ icon: LucideIcon; tint: string; title: string; text: string; count: (value: number) => string; href: string }> = [
  { icon: Wand2, tint: "bg-indigo-50 text-indigo-600", title: "技能", text: "可复用的方法与参考资产", count: (value) => `${value} 项技能`, href: "/skills" },
  { icon: PackageOpen, tint: "bg-sky-50 text-sky-600", title: "技能包", text: "按真实任务组织的完整工作流", count: (value) => `${value} 个技能包`, href: "/skillpackage" },
  { icon: PlugZap, tint: "bg-emerald-50 text-emerald-600", title: "插件与 MCP", text: "受控、透明、可审计的连接能力", count: (value) => `${value} 项连接`, href: "/plugins" },
  { icon: Building2, tint: "bg-amber-50 text-amber-600", title: "部门实践", text: "来自业务团队的真实使用经验", count: (value) => `${value} 个部门`, href: "/department-zone" },
];

/** 用命名占位符渲染静态文案，如 interpolate("你好，{name}", { name: "林知行" })。 */
export function interpolate(template: string, values: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

// ---------------------------------------------------------------------------
// 8. 回退值（接口字段缺失 / 不匹配时使用）
// ---------------------------------------------------------------------------

export const fallbacks = {
  /** Dashboard 问候语无 displayName 时 */
  greetingName: "同事",
  /** 头像无姓名时的缩写 */
  initials: "AI",
  /** 发布表单默认版本号 */
  defaultVersion: "1.0.0",
  /** 发布表单默认版本说明 */
  defaultChangelog: "首次发布",
  /** App 自动图标背景色；仅用于生成完整 ApplicationDraft，不代表服务端扫描结果。 */
  defaultAppIconBackground: "#185FA5",
  /** MCP 表单默认连接类型 */
  defaultConnectionType: "streamable_http",
  /** MCP 详情未声明认证方式 */
  mcpAuthentication: "未声明",
  /** MCP 同步状态默认值 */
  mcpSyncStatus: "syncing",
  /** MCP 健康状态默认值 */
  mcpHealthStatus: "degraded",
  /** 预览页资源名称为空时 */
  unnamedResource: "未命名资源",
  /** apiFetch 错误响应无 message/detail 时 */
  requestFailed: "请求失败",
  /** 路由错误页未知错误 */
  pageLoadFailed: "页面加载失败",
} as const;

// ---------------------------------------------------------------------------
// 9. 页面文案（copy）
// ---------------------------------------------------------------------------

export const copy = {
  common: {
    loading: "正在加载",
    emptyTitle: "暂无内容",
    emptyDescription: "当前条件下没有可展示的数据。",
    errorTitle: "暂时无法加载",
    errorDefault: "加载失败，请稍后重试。",
    retry: "重试",
  },
  listView: {
    itemCount: "项资源",
    sortBy: "排序方式",
    search: "搜索",
    category: "分类",
    allCategories: "全部分类",
    listDisplay: "列表显示",
    gridDisplay: "卡片显示",
    display: "显示方式",
    emptyTitle: "没有找到匹配资源",
    emptyDescription: "尝试更换搜索词或清除筛选条件。",
    clearFilter: "清除筛选",
  },
  pagination: {
    aria: "分页",
    previous: "上一页",
    next: "下一页",
    pageLabel: "第 {page} / {pages} 页",
  },
  search: {
    clear: "清除搜索",
    collapse: "收起搜索",
    expand: "展开搜索",
  },
  codeViewer: {
    resourceFiles: "资源文件",
    files: "文件",
    rootNodes: "{count} 个根节点",
    copy: "复制",
    copied: "已复制",
    selectFile: "请选择一个文件查看内容",
  },
  detail: {
    favoriteAdded: "已加入收藏",
    favoriteRemoved: "已取消收藏",
    favoriteFailed: "收藏状态更新失败",
    favorited: "已收藏",
    favorite: "收藏",
    publishedBy: "由 {name} 发布",
    startUsing: "开始使用",
    currentStableVersion: "当前稳定版本",
    currentStableWithDate: "当前稳定版本 · {date}",
    codeTab: "代码",
    openApp: "打开应用",
    viewInstall: "查看安装方式",
    compatibility: "兼容环境",
    securityStatus: "安全状态",
    scanPassed: "扫描通过",
    scanPending: "待服务端校验",
    scanFailed: "扫描未通过",
    scanUnknown: "暂无安全报告",
    compatibilityUnknown: "未声明",
    versionUnknown: "暂无版本号",
    recentlyUpdated: "最近更新",
    overviewEyebrow: "Overview",
    capabilityTags: "能力标签",
    capabilityVerified: "已在企业环境完成能力验证",
    versionsTitle: "版本与文件",
    versionAssetsNote: "完整版本资产已通过安全扫描，可在“代码”中只读查看已授权文件。",
    installTitle: "安装配置",
    installDeliveryTitle: "交付与使用",
    installPolicy: "按照企业授权策略使用当前资源，首次访问可能需要确认权限范围。",
    authMethod: "认证方式：",
    commentsTitle: "评论与交流",
    replyingTo: "正在回复一条评论",
    cancelReply: "取消",
    commentPlaceholder: "分享你的使用体验或建议",
    submitComment: "发表评论",
    noComments: "还没有评论",
    noCommentsDescription: "成为第一个分享使用体验的人。",
    reply: "回复",
    securityEyebrow: "Security report",
    securityHeadline: "企业安全报告",
    securityChecks: ["敏感信息检测通过", "依赖风险检测通过", "资源权限边界已核验"],
  },
  publish: {
    headerTitle: "发布资源",
    headerDescription: "通过网页完成信息填写、资产上传、安全扫描与审核提交。",
    namePlaceholder: "例如：{label}工作助手",
    slugPlaceholder: "lowercase-resource-name",
    descriptionPlaceholder: "说明解决的问题、适用对象与主要能力",
    tagsPlaceholder: "效率，知识库，研发",
    repositoryPlaceholder: "https://git.example.internal/team/project",
    uploadHint: "选择或拖入文件",
    uploadNote: "单个文件不超过 50 MB，上传内容将进入安全扫描。",
    uploadApp: "上传图标、截图和可交付 Artifact。",
    uploadSkill: "上传 SKILL.md、references 与必要脚本。",
    uploadPlugin: "上传图标并确认仓库同步内容。",
    uploadMcp: "上传图标、配置示例与工具说明。",
    uploadUnavailable: "截图将通过 Portal 资产服务上传并扫描。",
    uploadUnavailableNote: "只有服务端返回扫描通过的 assetId 才能提交审核；本地文件名不会被视为上传结果。",
    appDepartmentLabel: "所属部门",
    appCategoryLabel: "自定义分类",
    appManualLabel: "使用手册",
    appExamplesLabel: "使用示例",
    appFaqQuestionLabel: "FAQ 问题",
    appFaqAnswerLabel: "FAQ 答案",
    appEntryUrlLabel: "Web 应用入口 URL",
    appDisclaimerLabel: "输入限制免责声明",
    appModelProviderLabel: "模型提供商",
    appRiskSensitive: "处理敏感数据",
    appRiskExternal: "向外部发送数据",
    appRiskRetention: "保留对话记录",
    appRiskHighRisk: "影响高风险决策",
    appWebOnly: "当前阶段仅支持 web_app；其他应用类型等待交付制品接口。",
    scanWaiting: "等待执行安全扫描",
    scanPassed: "安全扫描已通过",
    scanDescription: "未发现阻断发布的高风险问题，扫描报告将随审核记录保存。",
    scanHint: "扫描通常在一分钟内完成，请保持页面打开。",
    scanServer: "安全扫描由服务端在提交审核时执行，Portal 不会本地模拟通过。",
    scanStart: "开始扫描",
    scanDone: "扫描完成",
    scanPassedToast: "安全扫描通过",
    unnamedResource: "未命名资源",
    slugLabel: "英文标识",
    versionLabel: "版本",
    assetsLabel: "资产",
    assetCount: "{n} 个文件",
    scanLabel: "安全扫描",
    submittedTitle: "已提交审核",
    submittedDescription: "{name} 已进入审核队列。审核结果会通过企业消息通知，你也可以在个人中心查看状态。",
    reviewId: "审核编号：",
    publishAnother: "继续发布资源",
    previous: "上一步",
    next: "下一步",
    submitReview: "提交审核",
    submittedToast: "资源已提交审核",
    failedToast: "提交失败，请检查信息后重试",
    failedTitle: "提交未成功",
    backToEdit: "返回编辑",
    refreshRetry: "刷新重试",
    blockerTitle: "离开发布页面？",
    blockerDescription: "当前草稿仍保留在本次会话中，但尚未提交审核。",
    blockerStay: "继续编辑",
    blockerLeave: "确认离开",
  },
  dashboard: {
    eyebrow: "Personal workspace",
    greeting: "你好，{name}",
    description: "管理你发布的资源、审核进度与最近更新。",
    publishNew: "发布新资源",
    createdCount: "已创建{label}",
    favoritesTitle: "已收藏 {count} 项资源",
    favoritesDescription: "收藏数量来自当前账号的真实 Portal 数据。",
    recentTitle: "最近更新",
    continuePublish: "继续发布",
    loading: "正在加载个人中心",
  },
  stars: {
    eyebrow: "Saved resources",
    title: "我的收藏",
    description: "集中查看你标记过的 App、Skill、Plugin 与 MCP。",
    allTypes: "全部",
    emptyTitle: "这里还没有收藏",
    emptyDescription: "在资源详情页点击收藏，稍后就能从这里快速找到。",
    loading: "正在加载收藏",
  },
  comments: {
    eyebrow: "Conversations",
    title: "我的评论",
    description: "查看他人给你的回复，以及你在各类资源下参与的讨论。",
    repliesTab: "收到的回复",
    mineTab: "我的评论",
    resourceType: "资源类型",
    sort: "排序",
    repliedToYou: "回复了你的评论",
    postedComment: "发表了评论",
    emptyReplies: "暂时没有收到回复",
    emptyMine: "你还没有发表评论",
    emptyDescription: "参与资源讨论后，相关内容会显示在这里。",
    loading: "正在加载评论",
  },
  hunt: {
    loading: "正在加载应用猎手榜单",
    eyebrow: "AI Hub App Hunt",
    deadline: "本期投票截止 {date}",
    activityStatus: "活动状态：{status}",
    voting: "投票中",
    ended: "已结束",
    leaderboard: "实时榜单",
    voteRecorded: "投票由服务端按员工身份记录",
    vote: "投一票",
    voted: "已投票",
    voteCount: "票",
    votedToast: "投票已记录",
    voteFailedToast: "投票失败，请重试",
    historyTitle: "历史优胜应用",
  },
  departments: {
    zoneLoading: "正在加载部门中心",
    zoneEyebrow: "Department zone",
    zoneTitle: "部门中心",
    zoneDescription: "了解各团队正在建设和推荐的 AI 能力，从真实业务实践中找到可复用方案。",
    searchPlaceholder: "搜索部门",
    memberCount: "{count} 位成员",
    resourceCount: "{count} 项资源",
    zoneEmptyTitle: "没有找到部门",
    zoneEmptyDescription: "请尝试使用部门全称或更短的关键词。",
    detailLoading: "正在加载部门详情",
    detailEyebrow: "Department profile",
    leader: "负责人：{name} · ",
    memberCountSuffix: "{count} 位成员 · ",
    appCount: "{count} 项应用",
    appsTitle: "部门应用",
    noApps: "当前部门暂未发布应用。",
    membersTitle: "核心成员",
  },
  skillPackages: {
    loading: "正在加载技能包",
    eyebrow: "Skill Packages",
    title: "为完整任务准备的技能包",
    description: "按照真实工作顺序组合多个 Skill，快速获得一套经过验证的方法与工具。",
    skillCount: "{count} 个 Skill",
    updatedAt: "更新于 {date}",
    view: "查看技能包",
  },
  setting: {
    eyebrow: "Preferences",
    title: "设置",
    description: "调整 Portal 的通知和显示偏好；企业身份与权限由统一控制台管理。",
    notifications: "消息通知",
    emailTitle: "邮件通知",
    emailDescription: "接收资源审核、回复和安全扫描结果。",
    reviewTitle: "审核进度通知",
    reviewDescription: "资源状态变化时通过企业消息提醒。",
    display: "显示偏好",
    compactTitle: "紧凑资源卡片",
    compactDescription: "在支持的列表中减少卡片高度，显示更多内容。",
    save: "保存设置",
    savedToast: "设置已保存",
    manageConsole: "管理企业身份与权限",
    session: "账号与会话",
    sessionDescription: "退出后需要重新通过企业身份登录。",
    logout: "退出登录",
  },
  detailPages: {
    loading: (type: ResourceType) => `正在加载${resourceLabels[type]}详情`,
    notFound: (type: ResourceType) => `${resourceLabels[type]}不存在或当前账号没有查看权限。`,
  },
  docs: {
    loading: "正在加载文档",
    eyebrow: "AI Hub Docs",
    updated: "更新于",
    toc: "目录",
    navigation: "文档导航",
  },
  home: {
    heroSubtitle: "发现、评估、收藏并发布可信的 App、Skill、Plugin 与 MCP",
    exploreAll: "探索全部资源",
    readGuide: "阅读使用指南",
    hotPicks: "HOT PICKS",
    hotTitle: "热门应用",
    hotDescription: "员工正在高频使用的 AI 应用",
    noUsage: "暂无使用统计",
    usageCount: "{count} 次使用",
    ecosystemTitle: "从一个入口，进入整个 AI 资源生态",
    ecosystemDescription: "应用、技能、插件、MCP 与部门实践，统一发现与复用",
    discoverTitle: "从发现到复用，找到适合你的 AI 能力",
    discoverDescription: "悬停展开每一类能力，直达对应的资源入口",
    browseSkills: "浏览全部技能",
    appsInUse: "员工都在用的应用",
    appsInUseDescription: "顶部卡片会随着滚动堆叠，像翻阅一份热榜清单",
    recommendedBy: "{name} 推荐",
    stackCtaTitle: "还没找到合适的？",
    stackCtaDescription: "浏览全部应用，或到部门实践中心看看同事们的真实推荐。",
    browseAllApps: "浏览全部应用",
    ctaTitle: "准备好分享你的 AI 实践了吗",
    ctaDescription: "发布、维护并推荐你的 Skill 与插件，让团队共享经过验证的工作方式。",
    publishResource: "发布资源",
    viewChangelog: "查看更新日志",
    latestEyebrow: "LATEST · ",
    viewUpdates: "查看更新",
    viewAll: "查看全部",
  },
  footer: {
    brand: "AI Hub",
    tagline: "面向员工的可信 AI 应用、技能、插件与 MCP 发现和发布平台。",
    quickEntry: "快捷入口",
    workspace: "工作台",
    copyright: "© 2026 AI Hub · 仅限企业内部使用",
  },
  login: {
    eyebrow: "Enterprise AI Portal",
    title: "登录 AI Hub",
    description: "使用企业统一身份进入资源门户。登录后将返回你刚才访问的页面。",
    button: "登录",
    employeeIdLabel: "员工 ID",
    employeeIdPlaceholder: "例如：E1001",
    passwordLabel: "密码",
    passwordPlaceholder: "输入密码",
    passwordMethod: "企业密码登录",
    dingtalkMethod: "使用钉钉登录",
    unavailable: "暂时无法获取登录方式，请稍后重试。",
    failed: "登录失败，请检查员工 ID 和密码。",
    dingTalkFailed: "钉钉登录暂不可用，请稍后重试。",
    note: "仅使用必要的员工与部门信息完成鉴权",
    requiredTitle: "登录后继续",
    requiredDescription: "登录后即可访问个人中心、发布资源、管理收藏与评论。",
    requiredButton: "立即登录",
    /** 服务端钉钉 SSO 起始地址（returnTo 由页面拼接） */
    startPath: "/internal/identity/login/dingtalk/start",
  },
  system: {
    notFoundEyebrow: "404 Not Found",
    notFoundTitle: "没有找到这个页面",
    notFoundDescription: "链接可能已经更新，或当前账号没有访问权限。",
    backHome: "返回门户首页",
    errorEyebrow: "Portal error",
    errorTitle: "暂时无法显示页面",
    reload: "重新加载",
  },
} as const;
