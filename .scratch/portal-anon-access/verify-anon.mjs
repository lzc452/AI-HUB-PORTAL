/**
 * t6 验收：真实浏览器抽查匿名公开访问体验（无 Cookie / 有会话 / 会话过期三态）。
 * 运行前提：真实模式 dev server（VITE_PORTAL_USE_FIXTURES=false）已在本机 5173 启动；
 * 本脚本通过 page.route 拦截 /internal/* 模拟后端契约（可选认证语义）。
 * 用法：node .scratch/portal-anon-access/verify-anon.mjs
 */
import { chromium } from "playwright-core";

const BASE = "http://127.0.0.1:5173";

const resource = (overrides = {}) => ({
  resourceId: "app-1",
  resourceType: "app",
  ownerEmployeeId: "E1001",
  ownerName: "林知行",
  slug: "expense-assistant",
  name: "费用助手",
  summary: "用于费用填报和票据识别的应用。",
  status: "published",
  metadata: {},
  favoriteCount: 12,
  isFavorited: false,
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-26T08:00:00.000Z",
  ...overrides,
});

const skillItem = resource({ resourceId: "skill-1", resourceType: "skill", slug: "requirement-decomposer", name: "需求拆解专家", summary: "需求拆解技能。" });
const pluginItem = resource({ resourceId: "plugin-1", resourceType: "plugin", slug: "gitlab-flow", name: "GitLab 工作流", summary: "GitLab 工作流插件。" });
const mcpItem = resource({ resourceId: "mcp-1", resourceType: "mcp", slug: "postgres-readonly", name: "PostgreSQL Readonly", summary: "只读数据库连接。" });
const appDetail = resource({
  metadata: {
    overview: "# 概述\n费用助手帮助你快速填报费用。",
    version: "1.0.0",
    compatibility: ["Web"],
    securityStatus: "passed",
    deliveryTypes: ["web"],
    screenshots: [],
  },
});

const pageResult = (items) => ({ items, total: items.length, page: 1, pageSize: 20 });
const problem = (code, detail) => JSON.stringify({ code, detail });

/**
 * 构造 /internal/* 路由拦截器。
 * @param {object} state 可变的模拟状态
 */
function makeBackend(state) {
  return (route) => {
    const url = new URL(route.request().url());
    if (!url.pathname.startsWith("/internal/")) return route.continue();
    const method = route.request().method();
    const path = url.pathname;
    const json = (status, body) => route.fulfill({ status, contentType: "application/json", body: typeof body === "string" ? body : JSON.stringify(body) });

    // ---- 身份端点 ----
    if (path === "/internal/identity/actor") {
      state.actorCalls += 1;
      if (state.actorMode === "anonymous") return json(401, problem("SESSION_REQUIRED", "未登录"));
      // 会话过期场景：启动探测返回 200（已登录），401 恢复后的重探测返回 401（会话已被撤销）。
      if (state.actorMode === "expire-after-first") return json(state.actorCalls === 1 ? 200 : 401, state.actorCalls === 1 ? { employeeId: "E1001", displayName: "林知行", roleCodes: ["employee"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "session-1" } : problem("SESSION_REQUIRED", "未登录"));
      return json(200, { employeeId: "E1001", displayName: "林知行", roleCodes: ["employee"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "session-1" });
    }
    if (path === "/internal/identity/login/options") return json(200, { methods: ["password"] });

    // ---- 公开读端点（契约 P1-5：可选认证）----
    if (path === "/internal/portal/home") return json(200, { apps: [resource()], skills: [skillItem], plugins: [pluginItem], mcps: [mcpItem], departments: [{ departmentId: "dept-1", name: "数据部", description: "数据智能", memberCount: 9, applicationCount: 2 }], skillPackages: [{ packageId: "pkg-1", packageSlug: "data-workflow", name: "数据工作流", summary: "数据分析技能组合", ownerEmployeeId: "E1001", ownerName: "林知行", skillCount: 1 }], updates: null });
    if (path === "/internal/portal/apps") {
      state.appsCalls += 1;
      // 会话过期场景：携带无效会话的第一次请求返回 401，匿名重试返回 200。
      if (state.appsMode === "expire-first" && state.appsCalls === 1) return json(401, problem("SESSION_EXPIRED", "会话已过期"));
      return json(200, pageResult([resource()]));
    }
    if (path === "/internal/portal/apps/E1001/expense-assistant") return json(200, appDetail);
    if (path === "/internal/portal/skills") return json(200, pageResult([skillItem]));
    if (path === "/internal/portal/plugins") return json(200, pageResult([pluginItem]));
    if (path === "/internal/portal/mcps") return json(200, pageResult([mcpItem]));
    if (path === "/internal/portal/apps-hunt") return json(200, [{ periodId: "week-1", periodName: "第 34 周应用猎手", periodStatus: "active", entryId: "entry-1", applicationId: "app-1", name: "费用助手", summary: "费用填报", voteCount: 8, hasVoted: false }]);
    if (path === "/internal/portal/departments") return json(200, [{ departmentId: "dept-1", name: "数据部", description: "数据智能", memberCount: 9, applicationCount: 2 }]);
    if (path === "/internal/portal/skill-packages") return json(200, [{ packageId: "pkg-1", packageSlug: "data-workflow", name: "数据工作流", summary: "数据分析技能组合", ownerEmployeeId: "E1001", ownerName: "林知行", skillCount: 1 }]);
    if (path === "/internal/portal/app/app-1/comments") return json(200, []);
    if (path === "/internal/portal/docs/tutorials") return json(200, { pageKey: "tutorials", title: "使用指南", bodyMarkdown: "# 使用指南\n从这里开始。", summary: "从这里开始的 Portal 使用指南。", publishedAt: "2026-08-01T08:00:00.000Z", updatedAt: "2026-08-26T08:00:00.000Z" });

    // ---- 写端点（契约：401 → 登录弹窗）----
    if (method === "POST" && (path.endsWith("/favorite") || path === "/internal/portal/apps-hunt/votes" || path.endsWith("/comments"))) {
      return json(401, problem("SESSION_EXPIRED", "会话已过期"));
    }

    return route.continue();
  };
}

let failures = 0;
function check(name, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failures += 1;
}

const browser = await chromium.launch();
try {
  // =====================================================================
  // 场景 A：无 Cookie 匿名浏览（actor 恒 401）
  // =====================================================================
  {
    const state = { actorMode: "anonymous", actorCalls: 0, appsCalls: 0, appsMode: "normal" };
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));
    await page.route("**/*", makeBackend(state));

    // A1 首页匿名可浏览
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.getByText("把好用的 AI 能力", { exact: false }).first().waitFor({ timeout: 20000 });
    check("A1 首页匿名渲染 hero（无 Cookie 200 正常渲染）", true);
    check("A1 首页出现“登录”入口按钮", await page.getByRole("button", { name: "登录", exact: true }).isVisible().catch(() => false));
    check("A1 actor 探测已调用（启动时）", state.actorCalls >= 1, `actorCalls=${state.actorCalls}`);

    // A2 列表页匿名浏览：published 资源渲染且 isFavorited=false（列表卡片无收藏按钮、不显示“已收藏”）
    await page.goto(`${BASE}/apps?sortBy=score`, { waitUntil: "domcontentloaded" });
    await page.getByText("费用助手", { exact: false }).first().waitFor({ timeout: 20000 });
    check("A2 /apps 匿名渲染 published 资源", true);
    check("A2 匿名 isFavorited=false → 列表不出现“已收藏”态", (await page.getByRole("button", { name: "已收藏" }).count()) === 0);

    // A3 详情页匿名浏览 + 收藏入口引导登录
    await page.goto(`${BASE}/apps/E1001/expense-assistant`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "费用助手" }).waitFor({ timeout: 20000 });
    await page.getByRole("button", { name: "收藏", exact: true }).click();
    await page.getByRole("dialog").waitFor({ timeout: 10000 });
    check("A3 匿名点击收藏 → 打开登录弹窗（不报错）", (await page.getByRole("heading", { name: "登录 AI Hub" }).count()) > 0);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10000 });

    // A4 评论入口引导登录
    await page.getByRole("tab", { name: "评论" }).click();
    await page.getByPlaceholder("分享你的使用体验或建议").fill("这条评论应该要求先登录");
    await page.getByRole("button", { name: "发表评论" }).click();
    await page.getByRole("dialog").waitFor({ timeout: 10000 });
    check("A4 匿名发表评论 → 打开登录弹窗（不报错）", true);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10000 });

    // A5 AppHunt 投票入口引导登录
    await page.goto(`${BASE}/apps-hunt`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "第 34 周应用猎手" }).waitFor({ timeout: 20000 });
    await page.getByRole("button", { name: "投一票" }).click();
    await page.getByRole("dialog").waitFor({ timeout: 10000 });
    check("A5 匿名投票 → 打开登录弹窗（不报错）", true);
    check("A5 AppHunt 匿名 hasVoted=false → 显示“投一票”", true);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10000 });

    // A6 个人中心守卫：登录提示面板 + 自动弹窗
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.getByRole("dialog").waitFor({ timeout: 20000 });
    check("A6 匿名访问 /dashboard → 自动打开登录弹窗", true);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10000 });
    await page.getByRole("heading", { name: "登录后继续" }).waitFor({ timeout: 10000 });
    check("A6 未登录 /dashboard 展示登录提示面板（不白屏）", true);

    // A7 /login 旧链接重定向回首页
    await page.goto(`${BASE}/login?returnTo=%2Fdashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForURL(`${BASE}/`, { timeout: 10000 });
    check("A7 /login 重定向回首页", true);

    // A8 全流程无页面错误（不白屏）
    check("A8 匿名浏览全程无未捕获页面错误", pageErrors.length === 0, pageErrors.join("; ").slice(0, 300));
    await page.close();
  }

  // =====================================================================
  // 场景 B：会话过期访问公开读端点 → 清登录态 + 匿名重试一次 → 自动降级匿名
  // =====================================================================
  {
    const state = { actorMode: "expire-after-first", actorCalls: 0, appsCalls: 0, appsMode: "expire-first" };
    const page = await browser.newPage();
    const pageErrors = [];
    const consoleLogs = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));
    page.on("console", (m) => consoleLogs.push(`${m.type()}: ${m.text().slice(0, 200)}`));
    await page.route("**/*", makeBackend(state));

    await page.goto(`${BASE}/apps?sortBy=score`, { waitUntil: "domcontentloaded" });
    await page.getByText("费用助手", { exact: false }).first().waitFor({ timeout: 20000 });
    const actorCallsAfter = state.actorCalls;
    check("B1 过期会话读 /apps：401 → 匿名重试一次后正常渲染（不白屏）", true);
    check("B2 匿名重试恰好一次（calls=2，无死循环）", state.appsCalls === 2, `appsCalls=${state.appsCalls}`);
    check("B3 401 恢复时 actor 被再次调用（启动探测 + 恢复重探测）", state.actorCalls >= 2, `actorCalls=${state.actorCalls}`);
    check("B4 读端点 401 不弹登录弹窗", (await page.getByRole("dialog").count()) === 0);
    // 等头部从“已登录”重渲染为匿名“登录”入口（401 恢复重探测完成后）。
    let degraded = true;
    try {
      await page.getByRole("button", { name: "登录", exact: true }).waitFor({ timeout: 10000 });
    } catch {
      degraded = false;
    }
    if (!degraded) {
      // 诊断：URL、头部数量、页面 body 文本、控制台消息
      const url = page.url();
      const headerCount = await page.locator("header").count().catch(() => -1);
      const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 600) : "<no body>").catch(() => "<eval failed>");
      console.log(`[debug] url=${url} headerCount=${headerCount} actorCalls=${state.actorCalls} dialogs=${await page.getByRole("dialog").count().catch(() => -1)}`);
      console.log(`[debug] bodyText=${JSON.stringify(bodyText)}`);
      console.log(`[debug] consoleLogs=${JSON.stringify(consoleLogs.slice(0, 12))}`);
    }
    check("B5 会话失效后 UI 自动降级匿名（头部显示“登录”而非用户名）", degraded);
    check("B6 降级全程无未捕获页面错误", pageErrors.length === 0, pageErrors.join("; ").slice(0, 300));
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\n全部浏览器验收断言通过" : `\n${failures} 项断言失败`);
process.exit(failures === 0 ? 0 : 1);
