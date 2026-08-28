import { expect, test } from "@playwright/test";

const employeeId = process.env.PORTAL_TEST_EMPLOYEE_ID;
const password = process.env.PORTAL_TEST_PASSWORD;

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login?returnTo=/dashboard");
  await expect(page.getByLabel("员工 ID")).toBeVisible();
  await page.getByLabel("员工 ID").fill(employeeId!);
  await page.getByLabel("密码").fill(password!);
  await page.getByRole("button", { name: "企业密码登录" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("Portal 真实联调（一次性测试环境）", () => {
  test.skip(!process.env.PORTAL_REAL_E2E || !employeeId || !password, "设置 PORTAL_REAL_E2E=true、PORTAL_TEST_EMPLOYEE_ID、PORTAL_TEST_PASSWORD 后执行");

  test("密码登录 → 首页/Dashboard → 退出并恢复登录入口", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: /你好/ })).toBeVisible();
    await page.getByRole("button", { name: "退出登录" }).click();
    await expect(page).toHaveURL(/\/login\?returnTo=/);
  });

  test("Web App 发布页只提供真实草稿/资产流程，不展示伪造上传成功", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard/publish");
    await page.getByRole("button", { name: /App/ }).click();
    await expect(page.getByText("一期仅支持 Web App")).toBeVisible();
    await expect(page.getByText("Portal 资产服务尚未接入，暂不能上传或确认真实 assetId。")).toHaveCount(0);
    await expect(page.getByText("所属部门")).toBeVisible();
  });
});
