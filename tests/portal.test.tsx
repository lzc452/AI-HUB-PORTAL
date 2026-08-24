import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { apiFetch, listApps } from "@/apis";
import { MarkdownContent } from "@/components/common";
import { AppsDefaultRedirect, DepartmentRedirect } from "@/router/redirects";
import { dashboardCommentsQuerySchema, publishDraftSchema } from "@/schemas";
import { useDashboardStore } from "@/store";
import { server } from "./setup";

function LocationProbe() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.search}${location.hash}`}</output>;
}

describe("Portal 基础约束", () => {
  it("可通过 @/ Alias 加载业务 API，并按关键词筛选开发夹具", async () => {
    const result = await listApps({ q: "合同", sortBy: "score", page: 1, pageSize: 20 });
    expect(result.total).toBe(1);
    expect(result.items[0].slug).toBe("contract-risk");
  });

  it("apiFetch 解析统一 API 响应", async () => {
    server.use(http.get("http://localhost/internal/test", () => HttpResponse.json({ ok: true })));
    await expect(apiFetch<{ ok: boolean }>("http://localhost/internal/test")).resolves.toEqual({ ok: true });
  });

  it("/apps 缺少 sortBy 时保留 query 与 hash 并规范化", async () => {
    render(<MemoryRouter initialEntries={["/apps?q=meeting#top"]}><Routes><Route element={<AppsDefaultRedirect />}><Route path="/apps" element={<LocationProbe />} /></Route></Routes></MemoryRouter>);
    expect(await screen.findByText("/apps?q=meeting&sortBy=score#top")).toBeInTheDocument();
  });

  it("/department 保留 search 与 hash 重定向到部门中心", async () => {
    render(<MemoryRouter initialEntries={["/department?q=data#teams"]}><Routes><Route path="/department" element={<DepartmentRedirect />} /><Route element={<Outlet />}><Route path="/department-zone" element={<LocationProbe />} /></Route></Routes></MemoryRouter>);
    expect(await screen.findByText("/department-zone?q=data#teams")).toBeInTheDocument();
  });

  it("评论查询和四类发布表单均执行 Zod 校验", () => {
    expect(dashboardCommentsQuerySchema.parse({}).view).toBe("replies");
    for (const type of ["app", "skill", "plugin", "mcp"] as const) {
      expect(publishDraftSchema.parse({ type, name: "可信资源", slug: `trusted-${type}`, description: "这是一个经过验证且可以安全使用的企业资源。", tagsText: "企业，可信", version: "1.0.0", changelog: "首次发布版本", repositoryUrl: "", connectionType: "streamable_http" }).type).toBe(type);
    }
  });

  it("Dashboard store 按资源类型隔离草稿", () => {
    const state = useDashboardStore.getState();
    state.updateDraft("skill", { name: "需求拆解专家" });
    expect(useDashboardStore.getState().drafts.skill.name).toBe("需求拆解专家");
    expect(useDashboardStore.getState().drafts.app.name).toBe("");
    useDashboardStore.getState().resetDraft("skill");
  });

  it("Markdown 使用 GFM 渲染并清理不安全 HTML", () => {
    const { container } = render(<MarkdownContent markdown={'| 能力 | 状态 |\n| --- | --- |\n| 扫描 | 通过 |\n\n<script>alert("unsafe")</script>'} />);
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent("alert");
  });
});
