import { expect, test } from "@playwright/test";

const routes = [
  ["/", "把好用的 AI 能力"],
  ["/apps?sortBy=score", "全部应用"],
  ["/apps/E1001/meeting-copilot", "智能会议纪要"],
  ["/apps-hunt", "第 34 周应用猎手"],
  ["/department-zone", "部门中心"],
  ["/department/dept-1", "产品研发部"],
  ["/skills", "全部技能"],
  ["/skills/S2001/requirement-decomposer", "需求拆解专家"],
  ["/skillpackage", "为完整任务准备的技能包"],
  ["/skillpackage/product-discovery", "产品发现工具箱"],
  ["/plugins", "插件"],
  ["/plugins/P3001/gitlab-flow", "GitLab 工作流"],
  ["/mcp", "MCP"],
  ["/mcp/postgres-readonly", "PostgreSQL Readonly"],
  ["/tutorials", "使用指南"],
  ["/about", "关于我们"],
  ["/updates", "更新日志"],
  ["/dashboard", "你好，林知行"],
  ["/dashboard/publish", "发布资源"],
  ["/dashboard/setting", "设置"],
  ["/dashboard/stars", "我的收藏"],
  ["/dashboard/comments", "我的评论"],
] as const;

test("全部一期路由可访问且呈现对应页面", async ({ page }) => {
  // 该用例顺序打开 20 个懒加载路由，桌面端首次加载各页面 chunk 的总耗时可能略高于默认 30 秒。
  test.setTimeout(90_000);
  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading, exact: false }).first()).toBeVisible();
  }
});

test("规范化默认排序与部门旧入口", async ({ page }) => {
  await page.goto("/apps?q=会议#directory");
  await expect(page).toHaveURL(/\/apps\?q=%E4%BC%9A%E8%AE%AE&sortBy=score#directory$/);
  await page.goto("/department?q=产品#teams");
  await expect(page).toHaveURL(/\/department-zone\?q=%E4%BA%A7%E5%93%81#teams$/);
});

test("搜索、排序和评论双视图以 URL 为唯一状态", async ({ page }) => {
  await page.goto("/apps?sortBy=score");
  await page.getByPlaceholder("搜索全部应用").fill("合同");
  await expect(page).toHaveURL(/q=%E5%90%88%E5%90%8C/);
  await expect(page.getByText("合同风险助手")).toBeVisible();
  await page.goto("/dashboard/comments");
  await page.getByRole("tab", { name: "我的评论" }).click();
  await expect(page).toHaveURL(/view=mine/);
  await expect(page.getByText("GitLab 工作流")).toBeVisible();
});

for (const type of ["App", "Skill", "Plugin", "MCP"] as const) {
  test(`${type} 可进入统一发布流程`, async ({ page }) => {
    await page.goto("/dashboard/publish");
    await page.getByRole("button", { name: new RegExp(type) }).click();
    await expect(page.getByRole("heading", { name: new RegExp(type === "App" ? "应用基本信息" : type === "Skill" ? "技能基本信息" : type === "Plugin" ? "插件基本信息" : "MCP基本信息") })).toBeVisible();
  });
}

test("评论详情、收藏和完整发布步骤可交互", async ({ page }) => {
  await page.goto("/apps/E1001/meeting-copilot?tab=comments");
  await expect(page.getByRole("heading", { name: "评论与交流" })).toBeVisible();
  await page.getByRole("button", { name: "收藏" }).click();
  await expect(page.getByText("已加入收藏")).toBeVisible();

  await page.goto("/dashboard/publish");
  await page.getByRole("button", { name: /Skill/ }).click();
  await page.getByLabel("资源名称").fill("知识校准技能");
  await page.getByLabel("英文标识").fill("knowledge-calibration");
  await page.getByLabel("资源说明").fill("用于校准企业知识问答结果并确保引用准确可追溯。");
  await page.getByLabel("标签").fill("知识库，质量");
  await page.getByLabel("版本说明").fill("首次发布完整能力与参考资料。");
  await page.getByRole("button", { name: /下一步/ }).click();
  await expect(page.getByRole("heading", { name: "上传资产" })).toBeVisible();
  await page.getByRole("button", { name: /下一步/ }).click();
  await page.getByRole("button", { name: "开始扫描" }).click();
  await page.getByRole("button", { name: /下一步/ }).click();
  await page.getByRole("button", { name: /提交审核/ }).click();
  await expect(page.getByRole("heading", { name: "已提交审核" })).toBeVisible();
});

test("四类资源列表视图切换在刷新后保持", async ({ page }) => {
  for (const route of ["/apps?sortBy=score", "/skills", "/plugins", "/mcp"]) {
    await page.goto(route);
    const gridButton = page.getByRole("radio", { name: "卡片显示" });
    const listButton = page.getByRole("radio", { name: "列表显示" });
    await gridButton.click();
    await expect(gridButton).toHaveAttribute("aria-checked", "true");
    await expect(page.locator('[data-testid="resource-state-region"] [data-view="grid"]')).toBeVisible();
    await page.reload();
    await expect(page.getByRole("radio", { name: "卡片显示" })).toHaveAttribute("aria-checked", "true");
    await listButton.click();
    await expect(page.locator('[data-testid="resource-state-region"] [data-view="list"]')).toBeVisible();
  }
});

test("四类资源详情可浏览嵌套文件和复制代码", async ({ page }, testInfo) => {
  for (const [route, fileName, snippet] of [
    ["/apps/E1001/meeting-copilot", "App.tsx", "useMeetingSummary"],
    ["/skills/S2001/requirement-decomposer", "SKILL.md", "执行流程"],
    ["/plugins/P3001/gitlab-flow", "index.ts", "definePlugin"],
    ["/mcp/postgres-readonly", "index.ts", "McpServer"],
  ] as const) {
    await page.goto(route);
    await page.getByRole("tab", { name: "代码" }).click();
    await page.getByText(fileName, { exact: true }).first().click();
    await expect(page.locator('[data-testid="resource-code-panel"] pre')).toContainText(snippet);
    await page.getByRole("button", { name: "复制" }).click();
    await expect(page.getByRole("button", { name: "已复制" })).toBeVisible();
    if (testInfo.project.name === "mobile") {
      const tree = await page.locator('[data-testid="resource-file-tree"]').boundingBox();
      const panel = await page.locator('[data-testid="resource-code-panel"]').boundingBox();
      expect(tree && panel && panel.y >= tree.y + tree.height - 1).toBeTruthy();
    }
  }
});
