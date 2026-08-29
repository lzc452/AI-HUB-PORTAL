import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { StrictMode } from "react";
import { MemoryRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { appKeys, commonKeys, dashboardKeys, useCurrentActor, useFavoriteMutation, usePublishMutation, useRequireLogin } from "@/hooks";
import {
  ApiError,
  apiFetch,
  buildLoginEnvelope,
  completeDingTalkLogin,
  createDingTalkCallbackPath,
  createPublishDraft,
  createApplicationUpload,
  createResourceComment,
  favoriteResource,
  getLoginOptions,
  getAppsHunt,
  getContentPage,
  getCurrentActor,
  getDashboard,
  getDashboardComments,
  getPublishAppDraft,
  getDepartment,
  getHome,
  getSkillPackage,
  handleSessionInvalid,
  handleUnauthorized,
  logout,
  listApps,
  listDepartments,
  listMcps,
  listPlugins,
  listResourceComments,
  listSkillPackages,
  listSkills,
  loginWithPassword,
  mapPortalResourceDetail,
  publishErrorGuidance,
  SESSION_INVALID_EVENT,
  startDingTalkLogin,
  submitPublishDraft,
  completeApplicationUpload,
  uploadApplicationContent,
  useFixtures,
} from "@/apis";
import { publishStatusLabels, resourceCategories, resourceLabels, resourceTone, statusTone } from "@/apis/static-data";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { MarkdownContent } from "@/components/common";
import { AppsDefaultRedirect, DepartmentRedirect } from "@/router/redirects";
import { AuthGuard } from "@/router/guards";
import { dashboardCommentsQuerySchema, publishDraftSchema } from "@/schemas";
import { useDashboardStore, useLoginDialogStore } from "@/store";
import type { ApplicationDraft, PublishDraft } from "@/types";
import { server } from "./setup";

function LocationProbe() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.search}${location.hash}`}</output>;
}

function renderWithQueryClient<T>(callback: () => T) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rendered = renderHook(callback, { wrapper: ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
  return { client, result: rendered.result };
}

const validApplicationDraft: ApplicationDraft = {
  name: "费用助手",
  departmentId: "dept-1",
  maintainerEmployeeIds: ["E1001"],
  categoryId: "",
  applicationType: "web_app",
  tagIds: [],
  customCategoryName: "办公效率",
  customTagNames: ["费用"],
  icon: { mode: "auto", backgroundColor: "#185FA5", text: "费", assetId: null },
  screenshotAssetIds: ["asset-screen-1"],
  attachmentAssetIds: [],
  summaryHtml: "<p>费用填报和票据识别。</p>",
  manualHtml: "<p>打开应用后按提示填写。</p>",
  manualAssetId: null,
  examplesHtml: "<p>上传票据并确认费用科目。</p>",
  examplesAssetId: null,
  faq: [{ question: "谁可以使用？", answer: "全体员工。" }],
  audience: [{ audienceType: "all", departmentId: null, employeeId: null, includeChildren: false }],
  risk: {
    handlesSensitiveData: false,
    sendsDataExternally: false,
    retainsConversations: false,
    retentionPeriod: null,
    modelProviders: ["local"],
    providerNote: null,
    affectsHighRiskDecisions: false,
    inputRestrictionDisclaimer: "请勿输入受限数据。",
  },
  deliveries: [{ channel: "web", entryUrl: "https://apps.example.test/expense", minClientVersion: null, enabled: true, assetIds: [] }],
  version: "1.0.0",
  changelog: "首次发布",
};

const validAppPublishDraft: PublishDraft = {
  type: "app",
  name: validApplicationDraft.name,
  slug: "expense-assistant",
  description: "用于费用填报和票据识别的应用。",
  tags: ["费用"],
  version: validApplicationDraft.version,
  assetNames: ["screenshot.png"],
  applicationDraft: validApplicationDraft,
};

describe("Portal 基础约束", () => {
  it("static-data 统一管理：标签/色调/分类映射覆盖全部枚举", () => {
    for (const type of ["app", "skill", "plugin", "mcp"] as const) {
      expect(resourceLabels[type]).toBeTruthy();
      expect(resourceTone[type]).toContain("bg-");
      expect(resourceCategories[type].length).toBeGreaterThan(0);
    }
    for (const status of ["draft", "in_review", "approved", "published", "withdrawn", "archived"] as const) {
      expect(publishStatusLabels[status]).toBeTruthy();
      expect(statusTone[status]).toContain("bg-");
    }
  });

  it("真实联调默认关闭 fixtures，并把 PortalResourceItem 映射为页面模型", async () => {
    server.use(http.get("/internal/portal/apps", ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get("query")).toBe("合同");
      expect(request.credentials).toBe("same-origin");
      return HttpResponse.json({
        items: [{
          resourceId: "app-1",
          resourceType: "app",
          ownerEmployeeId: "E1001",
          ownerName: "林知行",
          slug: "contract-risk",
          name: "合同风险助手",
          summary: "识别合同条款风险。",
          status: "in_review",
          currentVersionId: null,
          metadata: {},
          favoriteCount: 12,
          isFavorited: true,
          createdAt: "2026-08-01T08:00:00.000Z",
          updatedAt: "2026-08-26T08:00:00.000Z",
        }],
        total: 1,
        page: 1,
        pageSize: 20,
      });
    }));

    expect(useFixtures).toBe(false);
    const result = await listApps({ q: "合同", sortBy: "score", page: 1, pageSize: 20 });
    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      id: "app-1",
      type: "app",
      description: "识别合同条款风险。",
      href: "/apps/E1001/contract-risk",
      owner: { employeeId: "E1001", displayName: "林知行" },
      stars: 12,
      isStarred: true,
      status: "in_review",
      currentVersionId: null,
    });
  });

  it("apiFetch 解析统一 API 响应", async () => {
    server.use(http.get("http://localhost/internal/test", () => HttpResponse.json({ ok: true })));
    await expect(apiFetch<{ ok: boolean }>("http://localhost/internal/test")).resolves.toEqual({ ok: true });
  });

  it("apiFetch 保留 Problem Details 的字段级 issues", async () => {
    server.use(http.post("http://localhost/internal/test", () => HttpResponse.json({
      code: "DRAFT_VALIDATION_FAILED",
      detail: "草稿未通过提交校验",
      traceId: "trace-1",
      issues: [
        { code: "DELIVERY_REQUIRED", message: "至少配置一个可用交付渠道", path: "deliveries.0.entryUrl" },
        { code: "LEGACY_FAQ_REQUIRED", message: "请填写 FAQ", path: ["faq", "0", "answer"] },
      ],
    }, { status: 400 })));

    const error = await apiFetch("http://localhost/internal/test", { method: "POST" }).catch((value: unknown) => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: "DRAFT_VALIDATION_FAILED",
      message: "草稿未通过提交校验",
      traceId: "trace-1",
      issues: [
        { code: "DELIVERY_REQUIRED", message: "至少配置一个可用交付渠道", path: ["deliveries", "0", "entryUrl"] },
        { code: "LEGACY_FAQ_REQUIRED", message: "请填写 FAQ", path: ["faq", "0", "answer"] },
      ],
    });
  });

  it("当前 actor 使用服务端直接返回的 ActorContext", async () => {
    server.use(http.get("/internal/identity/actor", () => HttpResponse.json({
      employeeId: "E1001",
      displayName: "林知行",
      roleCodes: ["employee"],
      permissions: ["application.create"],
      departmentIds: ["dept-1"],
      primaryDepartmentId: "dept-1",
      sessionId: "session-1",
    })));

    await expect(getCurrentActor()).resolves.toMatchObject({ employeeId: "E1001", sessionId: "session-1" });
  });

  it("登录 options 只暴露服务端声明的登录方式", async () => {
    server.use(http.get("/internal/identity/login/options", () => HttpResponse.json({ methods: ["password"] })));
    await expect(getLoginOptions()).resolves.toEqual({ methods: ["password"] });
  });

  it("密码登录使用 RSA-OAEP/AES-GCM 信封，不在请求中发送明文密码", async () => {
    const keyPair = await crypto.subtle.generateKey(
      { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true,
      ["wrapKey", "unwrapKey"],
    ) as CryptoKeyPair;
    const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const challenge = { keyId: "key-1", jwk: { ...jwk, kty: "RSA", alg: "RSA-OAEP-256", key_ops: ["wrapKey"] }, nonce: "nonce-1", expiresAt: new Date(Date.now() + 60_000).toISOString() } as unknown as import("@/types").LoginChallenge;
    let requestBody: Record<string, unknown> | undefined;
    server.use(
      http.get("/internal/identity/login/challenge", () => HttpResponse.json(challenge)),
      http.post("/internal/identity/login/password", async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ actor: { employeeId: "E1001", displayName: "林知行", roleCodes: ["employee"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "session-1" }, session: { sessionId: "session-1", employeeId: "E1001", deviceLabel: "browser", expiresAt: new Date(Date.now() + 60_000).toISOString(), revokedAt: null } });
      }),
    );

    const envelope = await buildLoginEnvelope("E1001", "never-send-this", challenge);
    expect(JSON.stringify(envelope)).not.toContain("never-send-this");
    await expect(loginWithPassword("E1001", "never-send-this")).resolves.toMatchObject({ actor: { employeeId: "E1001" } });
    expect(requestBody).toMatchObject({ employeeId: "E1001", envelope: { keyId: "key-1", nonce: "nonce-1" } });
    expect(JSON.stringify(requestBody)).not.toContain("never-send-this");
  });

  it("DingTalk 登录仅通过服务端返回的 redirectUrl 跳转", async () => {
    server.use(http.get("/internal/identity/login/dingtalk/start", ({ request }) => {
      expect(new URL(request.url).searchParams.get("returnTo")).toBe("/?dingtalk=complete&returnTo=%2Fdashboard");
      return HttpResponse.json({ redirectUrl: "https://login.example.test/dingtalk" });
    }));
    await expect(startDingTalkLogin(createDingTalkCallbackPath("/dashboard"))).resolves.toEqual({ redirectUrl: "https://login.example.test/dingtalk" });
  });

  it("DingTalk 回调使用 HttpOnly handoff cookie 完成会话", async () => {
    server.use(http.post("/internal/identity/login/dingtalk/complete", ({ request }) => {
      expect(request.credentials).toBe("same-origin");
      return HttpResponse.json({
        actor: { employeeId: "E1001", displayName: "林知行", roleCodes: ["employee"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "session-1" },
        session: { sessionId: "session-1", employeeId: "E1001", deviceLabel: "browser", expiresAt: "2026-08-29T00:00:00.000Z", revokedAt: null },
      }, { status: 201 });
    }));

    await expect(completeDingTalkLogin()).resolves.toMatchObject({ actor: { employeeId: "E1001" }, session: { sessionId: "session-1" } });
  });

  it("DingTalk 回调只完成一次会话并跳转 returnTo", async () => {
    let completeCalls = 0;
    server.use(
      http.get("/internal/identity/login/options", () => HttpResponse.json({ methods: ["password", "dingtalk_sso"] })),
      http.post("/internal/identity/login/dingtalk/complete", () => {
        completeCalls += 1;
        return HttpResponse.json({
          actor: { employeeId: "E1001", displayName: "林知行", roleCodes: ["employee"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "session-1" },
          session: { sessionId: "session-1", employeeId: "E1001", deviceLabel: "browser", expiresAt: "2026-08-29T00:00:00.000Z", revokedAt: null },
        }, { status: 201 });
      }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    // 模拟钉钉回调入口（真实场景由 URL 携带 dingtalk=complete 触发弹窗打开）。
    useLoginDialogStore.setState({ request: { returnTo: "/dashboard", dingTalkComplete: true } });

    render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route path="/" element={<LocationProbe />} />
              <Route path="/dashboard" element={<LocationProbe />} />
            </Routes>
            <LoginDialog />
          </MemoryRouter>
        </QueryClientProvider>
      </StrictMode>,
    );

    await waitFor(() => expect(screen.getByText("/dashboard")).toBeInTheDocument());
    expect(completeCalls).toBe(1);
    useLoginDialogStore.setState({ request: null });
  });

  it("应用创建发送完整 applicationDraft，非应用仍沿用 metadata", async () => {
    const requests: Array<Record<string, unknown>> = [];
    server.use(http.post("/internal/portal/dashboard/publish", async ({ request }) => {
      requests.push(await request.json() as Record<string, unknown>);
      return HttpResponse.json({
        resourceId: `resource-${requests.length}`,
        resourceType: requests.at(-1)?.resourceType,
        ownerEmployeeId: "E1001",
        ownerName: "林知行",
        slug: requests.at(-1)?.slug,
        name: requests.at(-1)?.name,
        summary: requests.at(-1)?.summary,
        status: "draft",
        metadata: {},
        favoriteCount: 0,
        isFavorited: false,
        createdAt: "2026-08-26T08:00:00.000Z",
        updatedAt: "2026-08-26T08:00:00.000Z",
      }, { status: 201 });
    }));
    const applicationDraft = {
      name: "费用助手",
      departmentId: "dept-1",
      maintainerEmployeeIds: ["E1001"],
      categoryId: "",
      applicationType: "web_app" as const,
      tagIds: [],
      customCategoryName: "办公效率",
      customTagNames: ["费用"],
      icon: { mode: "auto" as const, backgroundColor: "#185FA5", text: "费", assetId: null },
      screenshotAssetIds: ["asset-screen-1"],
      attachmentAssetIds: [],
      summaryHtml: "<p>费用填报和票据识别。</p>",
      manualHtml: "<p>打开应用后按提示填写。</p>",
      manualAssetId: null,
      examplesHtml: "<p>上传票据并确认费用科目。</p>",
      examplesAssetId: null,
      faq: [{ question: "谁可以使用？", answer: "全体员工。" }],
      audience: [{ audienceType: "all" as const, departmentId: null, employeeId: null, includeChildren: false }],
      risk: {
        handlesSensitiveData: false,
        sendsDataExternally: false,
        retainsConversations: false,
        retentionPeriod: null,
        modelProviders: ["local" as const],
        providerNote: null,
        affectsHighRiskDecisions: false,
        inputRestrictionDisclaimer: "请勿输入受限数据。",
      },
      deliveries: [{ channel: "web" as const, entryUrl: "https://apps.example.test/expense", minClientVersion: null, enabled: true, assetIds: [] }],
      version: "1.0.0",
      changelog: "首次发布",
    };
    const baseDraft = { name: "费用助手", slug: "expense-assistant", description: "用于费用填报和票据识别的应用。", tags: ["费用"], version: "1.0.0", metadata: { changelog: "首次发布" }, assetNames: [] };

    await createPublishDraft({ ...baseDraft, type: "app", applicationDraft });
    await createPublishDraft({ ...baseDraft, type: "skill" });

    expect(requests[0]).toMatchObject({ resourceType: "app", applicationDraft });
    expect(requests[0]).not.toHaveProperty("metadata");
    expect(requests[1]).toMatchObject({ resourceType: "skill", metadata: { changelog: "首次发布", tags: ["费用"], assetNames: [] } });
  });

  it("应用提交失败后更新同一草稿 ID，不重复创建资源", async () => {
    let createCount = 0;
    let updateCount = 0;
    let submitCount = 0;
    const resource = { resourceId: "app-retry-1", resourceType: "app" as const, ownerEmployeeId: "E1001", ownerName: "林知行", slug: validAppPublishDraft.slug, name: validAppPublishDraft.name, summary: validAppPublishDraft.description, status: "draft" as const, currentVersionId: null, metadata: {}, favoriteCount: 0, isFavorited: false, createdAt: "2026-08-26T08:00:00.000Z", updatedAt: "2026-08-26T08:00:00.000Z" };
    server.use(
      http.post("/internal/portal/dashboard/publish", () => { createCount += 1; return HttpResponse.json(resource, { status: 201 }); }),
      http.put("/internal/portal/dashboard/publish/app/app-retry-1", async ({ request }) => { updateCount += 1; expect((await request.json()) as Record<string, unknown>).toHaveProperty("applicationDraft"); return HttpResponse.json(resource); }),
      http.post("/internal/portal/dashboard/publish/app/app-retry-1/submit", () => {
        submitCount += 1;
        if (submitCount === 1) return HttpResponse.json({ code: "DRAFT_VALIDATION_FAILED", detail: "草稿未通过提交校验", issues: [{ code: "FAQ_REQUIRED", message: "请填写 FAQ", path: ["faq"] }] }, { status: 400 });
        return HttpResponse.json({ ...resource, status: "in_review" });
      }),
    );
    const { result } = renderWithQueryClient(() => usePublishMutation());
    await expect(result.current.mutateAsync(validAppPublishDraft)).rejects.toMatchObject({ resourceId: "app-retry-1" });
    await expect(result.current.mutateAsync({ draft: validAppPublishDraft, resourceId: "app-retry-1" })).resolves.toMatchObject({ resourceId: "app-retry-1", resource: { status: "in_review" } });
    expect(createCount).toBe(1);
    expect(updateCount).toBe(1);
    expect(submitCount).toBe(2);
  });

  it("应用草稿回读与资产上传遵循 Portal 同源契约", async () => {
    const requestLog: Array<{ method: string; path: string; body?: unknown; bytes?: number; contentType?: string }> = [];
    const resource = {
      resourceId: "app-resume-1",
      resourceType: "app" as const,
      ownerEmployeeId: "E1001",
      ownerName: "林知行",
      slug: "expense-assistant",
      name: "费用助手",
      summary: "用于费用填报和票据识别的应用。",
      status: "draft" as const,
      currentVersionId: null,
      metadata: {},
      favoriteCount: 0,
      isFavorited: false,
      createdAt: "2026-08-26T08:00:00.000Z",
      updatedAt: "2026-08-26T08:00:00.000Z",
    };
    const upload = (overrides: Record<string, unknown> = {}) => ({ uploadId: "upload-1", kind: "screenshot", fileName: "screen.png", mimeType: "image/png", sizeBytes: 3, uploadStatus: "completed", scanStatus: "passed", sha256: "sha-1", errorCode: null, assetId: "asset-screen-1", ...overrides });
    server.use(
      http.get("/internal/portal/dashboard/publish/app/app-resume-1", () => HttpResponse.json({ resource, applicationDraft: validApplicationDraft, draftUpdatedAt: "2026-08-27T08:00:00.000Z" })),
      http.post("/internal/portal/dashboard/publish/app/app-resume-1/uploads", async ({ request }) => { requestLog.push({ method: request.method, path: new URL(request.url).pathname, body: await request.json() }); return HttpResponse.json(upload(), { status: 201 }); }),
      http.put("/internal/portal/dashboard/publish/app/app-resume-1/uploads/upload-1/content", async ({ request }) => { requestLog.push({ method: request.method, path: new URL(request.url).pathname, bytes: (await request.arrayBuffer()).byteLength, contentType: request.headers.get("content-type") ?? undefined }); return HttpResponse.json(upload({ uploadStatus: "content_uploaded", assetId: null })); }),
      http.post("/internal/portal/dashboard/publish/app/app-resume-1/uploads/upload-1/complete", async ({ request }) => { requestLog.push({ method: request.method, path: new URL(request.url).pathname, body: await request.json() }); return HttpResponse.json(upload()); }),
    );

    await expect(getPublishAppDraft("app-resume-1")).resolves.toMatchObject({ resource: { id: "app-resume-1", type: "app" }, applicationDraft: { applicationType: "web_app" }, draftUpdatedAt: "2026-08-27T08:00:00.000Z" });
    await expect(createApplicationUpload("app-resume-1", { kind: "screenshot", fileName: "screen.png", mimeType: "image/png", sizeBytes: 3 })).resolves.toMatchObject({ uploadId: "upload-1" });
    await expect(uploadApplicationContent("app-resume-1", "upload-1", new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }))).resolves.toMatchObject({ uploadStatus: "content_uploaded" });
    await expect(completeApplicationUpload("app-resume-1", "upload-1")).resolves.toMatchObject({ assetId: "asset-screen-1", scanStatus: "passed" });

    expect(requestLog).toEqual([
      { method: "POST", path: "/internal/portal/dashboard/publish/app/app-resume-1/uploads", body: { kind: "screenshot", fileName: "screen.png", mimeType: "image/png", sizeBytes: 3 } },
      { method: "PUT", path: "/internal/portal/dashboard/publish/app/app-resume-1/uploads/upload-1/content", bytes: expect.any(Number), contentType: "application/octet-stream" },
      { method: "POST", path: "/internal/portal/dashboard/publish/app/app-resume-1/uploads/upload-1/complete", body: {} },
    ]);
    expect(requestLog[1]?.bytes).toBeGreaterThan(0);
  });

  it("其余 Portal 读取接口把服务端 DTO 适配为页面模型", async () => {
    const resource = (resourceType: "skill" | "plugin" | "mcp", resourceId: string) => ({
      resourceId,
      resourceType,
      ownerEmployeeId: "E1001",
      ownerName: "林知行",
      slug: `${resourceType}-slug`,
      name: `${resourceType} 资源`,
      summary: `${resourceType} 摘要`,
      status: "published",
      metadata: {},
      favoriteCount: 3,
      isFavorited: false,
      createdAt: "2026-08-01T08:00:00.000Z",
      updatedAt: "2026-08-26T08:00:00.000Z",
    });
    server.use(
      http.get("/internal/portal/skills", () => HttpResponse.json({ items: [resource("skill", "skill-1")], total: 1, page: 1, pageSize: 20 })),
      http.get("/internal/portal/plugins", () => HttpResponse.json({ items: [resource("plugin", "plugin-1")], total: 1, page: 1, pageSize: 20 })),
      http.get("/internal/portal/mcps", () => HttpResponse.json({ items: [resource("mcp", "mcp-1")], total: 1, page: 1, pageSize: 20 })),
      http.get("/internal/portal/dashboard", () => HttpResponse.json({
        counts: { apps: 2, skills: 3, plugins: 4, mcps: 5, favorites: 6 },
        recentResources: [{ resourceType: "app", resourceId: "app-1", name: "费用助手", status: "draft", updatedAt: "2026-08-26T08:00:00.000Z" }],
      })),
      http.get("/internal/portal/departments", () => HttpResponse.json([{ departmentId: "dept-1", name: "数据部", description: "数据智能", memberCount: 9, applicationCount: 2 }])),
      http.get("/internal/portal/departments/dept-1", () => HttpResponse.json({ departmentId: "dept-1", name: "数据部", description: "数据智能", metadata: {}, applications: [{ ...resource("skill", "ignored"), resourceId: "app-1", resourceType: "app", slug: "app-1", name: "费用助手" }] })),
      http.get("/internal/portal/skill-packages", () => HttpResponse.json([{ packageId: "pkg-1", packageSlug: "data-workflow", name: "数据工作流", summary: "数据分析技能组合", ownerEmployeeId: "E1001", ownerName: "林知行", skillCount: 1 }])),
      http.get("/internal/portal/skill-packages/data-workflow", () => HttpResponse.json({ packageId: "pkg-1", packageSlug: "data-workflow", name: "数据工作流", summary: "数据分析技能组合", ownerEmployeeId: "E1001", ownerName: "林知行", skills: [{ skillId: "skill-1", skillSlug: "analysis", name: "分析", summary: "完成数据分析", ownerEmployeeId: "E2001", ownerName: "周知远" }] })),
      http.get("/internal/portal/apps-hunt", () => HttpResponse.json([{ periodId: "week-1", periodName: "本周应用", periodStatus: "active", entryId: "entry-1", applicationId: "app-1", name: "费用助手", summary: "费用填报", voteCount: 8, hasVoted: true }])),
    );

    const query = { sortBy: "score" as const, page: 1, pageSize: 20 };
    expect((await listSkills(query)).items[0]).toMatchObject({ id: "skill-1", type: "skill", description: "skill 摘要" });
    expect((await listPlugins(query)).items[0]).toMatchObject({ id: "plugin-1", type: "plugin" });
    expect((await listMcps(query)).items[0]).toMatchObject({ id: "mcp-1", type: "mcp" });
    expect(await getDashboard()).toMatchObject({ counts: { app: 2, skill: 3, plugin: 4, mcp: 5 }, favoriteCount: 6, recent: [{ id: "app-1", href: "/dashboard/publish?type=app&resourceId=app-1" }] });
    expect((await listDepartments())[0]).toMatchObject({ resourceCount: 2, memberCount: 9 });
    expect(await getDepartment("dept-1")).toMatchObject({ resourceCount: 1, applications: [{ id: "app-1", type: "app" }] });
    expect((await listSkillPackages())[0]).toMatchObject({ id: "pkg-1", slug: "data-workflow", description: "数据分析技能组合" });
    expect((await getSkillPackage("data-workflow")).skills[0]).toMatchObject({ id: "skill-1", owner: { employeeId: "E2001", displayName: "周知远" }, href: "/skills/E2001/analysis" });
    expect(await getAppsHunt()).toMatchObject({ periodId: "week-1", periodStatus: "active", entries: [{ entryId: "entry-1", votes: 8, hasVoted: true, app: { id: "app-1", name: "费用助手" } }] });
  });

  it("评论列表把扁平 PortalCommentItem 组装为回复树", async () => {
    server.use(http.get("/internal/portal/app/app-1/comments", () => HttpResponse.json([
      {
        commentId: "c1", resourceType: "app", resourceId: "app-1", resourceName: "费用助手", resourceHref: "/apps/E1001/expense-assistant",
        body: "很好用", kind: "comment", author: { employeeId: "E1001", displayName: "林知行" }, parentComment: null, createdAt: "2026-08-01T08:00:00.000Z",
      },
      {
        commentId: "c2", resourceType: "app", resourceId: "app-1", resourceName: "费用助手", resourceHref: "/apps/E1001/expense-assistant",
        body: "请问支持移动端吗", kind: "reply", author: { employeeId: "E1002", displayName: "王小明" },
        parentComment: { commentId: "c1", body: "很好用", author: { employeeId: "E1001", displayName: "林知行" } }, createdAt: "2026-08-02T08:00:00.000Z",
      },
    ])));

    const [top] = await listResourceComments("app", "app-1");
    expect(top).toMatchObject({
      commentId: "c1",
      body: "很好用",
      parentCommentId: null,
      author: { employeeId: "E1001", displayName: "林知行", avatarUrl: null, departmentName: null },
      replies: [{ commentId: "c2", parentCommentId: "c1", body: "请问支持移动端吗", author: { employeeId: "E1002", displayName: "王小明", avatarUrl: null, departmentName: null } }],
    });
  });

  it("发布评论返回映射后的单条评论", async () => {
    server.use(http.post("/internal/portal/app/app-1/comments", () => HttpResponse.json({
      commentId: "c3", resourceType: "app", resourceId: "app-1", resourceName: "费用助手", resourceHref: "/apps/E1001/expense-assistant",
      body: "新评论", kind: "comment", author: { employeeId: "E1001", displayName: "林知行" }, parentComment: null, createdAt: "2026-08-03T08:00:00.000Z",
    }, { status: 201 })));

    await expect(createResourceComment("app", "app-1", "新评论", null)).resolves.toMatchObject({ commentId: "c3", body: "新评论", parentCommentId: null, replies: [] });
  });

  it("Dashboard 评论映射服务端 PortalCommentItem", async () => {
    server.use(http.get("/internal/portal/dashboard/comments", () => HttpResponse.json({
      items: [{
        commentId: "d1", resourceType: "app", resourceId: "app-1", resourceName: "费用助手", resourceHref: "/apps/E1001/expense-assistant",
        body: "回复内容", kind: "reply", author: { employeeId: "E1002", displayName: "王小明" },
        parentComment: { commentId: "d0", body: "原始评论", author: { employeeId: "E1001", displayName: "林知行" } }, createdAt: "2026-08-02T08:00:00.000Z",
      }],
      total: 1, page: 1, pageSize: 20,
    })));

    const page = await getDashboardComments({ view: "replies", sort: "latest", page: 1, pageSize: 20 });
    expect(page.total).toBe(1);
    expect(page.items[0]).toMatchObject({
      commentId: "d1",
      kind: "reply",
      resourceName: "费用助手",
      author: { employeeId: "E1002", displayName: "王小明", avatarUrl: null, departmentName: null },
      parentComment: { commentId: "d0", author: { employeeId: "E1001", displayName: "林知行", avatarUrl: null, departmentName: null } },
    });
  });

  it("内容页把 ContentPage 服务端结构映射为页面模型", async () => {
    server.use(http.get("/internal/portal/docs/tutorials", () => HttpResponse.json({
      pageKey: "tutorials",
      title: "使用指南",
      bodyMarkdown: "# 使用指南\n从这里开始。",
      publishedAt: "2026-08-01T08:00:00.000Z",
      summary: "从这里开始的 Portal 使用指南。",
      updatedAt: "2026-08-26T08:00:00.000Z",
    })));

    await expect(getContentPage("tutorials")).resolves.toMatchObject({
      slug: "tutorials",
      title: "使用指南",
      summary: "从这里开始的 Portal 使用指南。",
      markdown: "# 使用指南\n从这里开始。",
      updatedAt: "2026-08-26T08:00:00.000Z",
    });
  });

  it("首页 updates 从 ContentPage 结构显式映射", async () => {
    server.use(http.get("/internal/portal/home", () => HttpResponse.json({
      apps: [], skills: [], plugins: [], mcps: [], departments: [], skillPackages: [],
      updates: { pageKey: "updates", title: "八月更新", summary: "本月更新摘要", bodyMarkdown: "本月更新说明", publishedAt: "2026-08-01T08:00:00.000Z", updatedAt: "2026-08-26T08:00:00.000Z" },
    })));

    const home = await getHome();
    expect(home.updates).toMatchObject({ title: "八月更新", summary: "本月更新摘要", updatedAt: "2026-08-26T08:00:00.000Z" });
  });

  it("发布成功后失效 dashboard、app 列表、home 与对应类型查询", async () => {
    const resource = { resourceId: "app-9", resourceType: "skill", ownerEmployeeId: "E1001", ownerName: "林知行", slug: "new-skill", name: "新技能", summary: "摘要", status: "draft", metadata: {}, favoriteCount: 0, isFavorited: false, createdAt: "2026-08-26T08:00:00.000Z", updatedAt: "2026-08-26T08:00:00.000Z" };
    server.use(
      http.post("/internal/portal/dashboard/publish", () => HttpResponse.json(resource, { status: 201 })),
      http.post("/internal/portal/dashboard/publish/skill/app-9/versions", () => HttpResponse.json({ resourceId: "app-9", resourceType: "skill", version: "1.0.0" })),
      http.post("/internal/portal/dashboard/publish/skill/app-9/submit", () => HttpResponse.json({ ...resource, status: "in_review" })),
    );
    const { client, result } = renderWithQueryClient(() => usePublishMutation());
    client.setQueryData(dashboardKeys.overview, { counts: {}, favoriteCount: 0, recent: [] });
    client.setQueryData(appKeys.list({ sortBy: "score", page: 1, pageSize: 20 }), { items: [], total: 0, page: 1, pageSize: 20 });
    client.setQueryData(commonKeys.home, { apps: [], skills: [], plugins: [], mcps: [], departments: [], skillPackages: [], updates: null });
    client.setQueryData(["portal", "skill", "list", { sortBy: "score", page: 1, pageSize: 20 }], { items: [], total: 0, page: 1, pageSize: 20 });

    await result.current.mutateAsync({ type: "skill", name: "新技能", slug: "new-skill", description: "摘要", tags: [], version: "1.0.0", metadata: { changelog: "首次发布" }, assetNames: [] });

    await waitFor(() => {
      expect(client.getQueryState(dashboardKeys.overview)?.isInvalidated).toBe(true);
      expect(client.getQueryState(appKeys.list({ sortBy: "score", page: 1, pageSize: 20 }))?.isInvalidated).toBe(true);
      expect(client.getQueryState(commonKeys.home)?.isInvalidated).toBe(true);
      expect(client.getQueryState(["portal", "skill", "list", { sortBy: "score", page: 1, pageSize: 20 }])?.isInvalidated).toBe(true);
    });
  });

  it("收藏切换后失效详情、dashboard 与首页查询", async () => {
    server.use(http.post("/internal/portal/app/app-1/favorite", () => HttpResponse.json({ resourceType: "app", resourceId: "app-1", active: true })));
    const { client, result } = renderWithQueryClient(() => useFavoriteMutation("app", "app-1"));
    client.setQueryData(appKeys.detail("E1001", "app-1"), { id: "app-1", isStarred: false, stars: 0 });
    client.setQueryData(dashboardKeys.overview, { counts: {}, favoriteCount: 0, recent: [] });
    client.setQueryData(commonKeys.home, { apps: [], skills: [], plugins: [], mcps: [], departments: [], skillPackages: [], updates: null });

    await result.current.mutateAsync(true);

    await waitFor(() => {
      expect(client.getQueryState(appKeys.detail("E1001", "app-1"))?.isInvalidated).toBe(true);
      expect(client.getQueryState(dashboardKeys.overview)?.isInvalidated).toBe(true);
      expect(client.getQueryState(commonKeys.home)?.isInvalidated).toBe(true);
    });
  });

  it("apiFetch 遇 401 派发 portal:unauthorized 事件并抛出 ApiError", async () => {
    server.use(http.get("http://localhost/internal/unauthorized", () => HttpResponse.json({ code: "SESSION_EXPIRED", detail: "会话已过期" }, { status: 401 })));
    const listener = vi.fn();
    window.addEventListener("portal:unauthorized", listener);
    try {
      await expect(apiFetch("http://localhost/internal/unauthorized")).rejects.toMatchObject({ status: 401, code: "SESSION_EXPIRED" });
      expect(listener).toHaveBeenCalled();
    } finally {
      window.removeEventListener("portal:unauthorized", listener);
    }
  });

  it("logout 调用 /internal/identity/logout 并在 204 时完成", async () => {
    server.use(http.post("/internal/identity/logout", () => new HttpResponse(null, { status: 204 })));
    await expect(logout()).resolves.toBeUndefined();
  });

  it("handleUnauthorized 使 actor 查询失效并打开登录弹窗", () => {
    useLoginDialogStore.setState({ request: null });
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    handleUnauthorized({ invalidateQueries });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["portal", "common", "actor"] });
    expect(useLoginDialogStore.getState().request).toMatchObject({ returnTo: "/" });
    useLoginDialogStore.setState({ request: null });
  });

  it("公开读端点 401 时清除登录态缓存并匿名重试一次，成功后正常返回且不弹窗", async () => {
    const unauthorizedListener = vi.fn();
    const sessionInvalidListener = vi.fn();
    window.addEventListener("portal:unauthorized", unauthorizedListener);
    window.addEventListener(SESSION_INVALID_EVENT, sessionInvalidListener);
    let calls = 0;
    server.use(http.get("/internal/portal/apps", () => {
      calls += 1;
      if (calls === 1) return HttpResponse.json({ code: "SESSION_EXPIRED", detail: "会话已过期" }, { status: 401 });
      return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 20 });
    }));
    try {
      await expect(listApps({ q: "", sortBy: "score", page: 1, pageSize: 20 })).resolves.toMatchObject({ total: 0 });
      // 恰好重试一次；派发 session-invalid（清登录态缓存）但不派发 unauthorized（不弹窗）。
      expect(calls).toBe(2);
      expect(sessionInvalidListener).toHaveBeenCalledTimes(1);
      expect(unauthorizedListener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("portal:unauthorized", unauthorizedListener);
      window.removeEventListener(SESSION_INVALID_EVENT, sessionInvalidListener);
    }
  });

  it("公开读端点连续 401 时仅重试一次后抛错，不派发 unauthorized 事件", async () => {
    const unauthorizedListener = vi.fn();
    window.addEventListener("portal:unauthorized", unauthorizedListener);
    let calls = 0;
    server.use(http.get("/internal/portal/home", () => {
      calls += 1;
      return HttpResponse.json({ code: "SESSION_EXPIRED", detail: "会话已过期" }, { status: 401 });
    }));
    try {
      await expect(getHome()).rejects.toMatchObject({ status: 401, code: "SESSION_EXPIRED" });
      expect(calls).toBe(2);
      expect(unauthorizedListener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("portal:unauthorized", unauthorizedListener);
    }
  });

  it("写端点 401 仍派发 portal:unauthorized 事件（保持登录弹窗引导）", async () => {
    const listener = vi.fn();
    window.addEventListener("portal:unauthorized", listener);
    server.use(http.post("/internal/portal/app/app-1/favorite", () => HttpResponse.json({ code: "SESSION_EXPIRED", detail: "会话已过期" }, { status: 401 })));
    try {
      await expect(favoriteResource("app", "app-1", true)).rejects.toMatchObject({ status: 401, code: "SESSION_EXPIRED" });
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("portal:unauthorized", listener);
    }
  });

  it("handleSessionInvalid 使 actor 查询失效并触发重取，不打开登录弹窗", () => {
    useLoginDialogStore.setState({ request: null });
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    handleSessionInvalid({ invalidateQueries });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["portal", "common", "actor"] });
    expect(useLoginDialogStore.getState().request).toBeNull();
  });

  it("公开读 401 匿名重试后重新探测登录态（actor 被再次调用）", async () => {
    // 模拟 main.tsx 对 portal:session-invalid 的监听：失效 actor 查询（活跃 observer 重取探测）。
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const onSessionInvalid = () => handleSessionInvalid(client);
    window.addEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
    let actorCalls = 0;
    let readCalls = 0;
    server.use(
      http.get("/internal/identity/actor", () => {
        actorCalls += 1;
        return HttpResponse.json({ code: "SESSION_REQUIRED", detail: "未登录" }, { status: 401 });
      }),
      http.get("/internal/portal/home", () => {
        readCalls += 1;
        if (readCalls === 1) return HttpResponse.json({ code: "SESSION_EXPIRED", detail: "会话已过期" }, { status: 401 });
        return HttpResponse.json({ apps: [], skills: [], plugins: [], mcps: [], departments: [], skillPackages: [], updates: null });
      }),
    );
    try {
      renderHook(() => useCurrentActor(), { wrapper: ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
      await waitFor(() => expect(actorCalls).toBe(1));
      await act(async () => { await getHome(); });
      await waitFor(() => expect(actorCalls).toBe(2));
      expect(readCalls).toBe(2);
    } finally {
      window.removeEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
    }
  });

  it("公开读 401 匿名重试后，订阅 actor 的 UI 自动降级为未登录视图（回归：removeQueries 不冻结在途 observer）", async () => {
    // main.tsx 等价接线：portal:session-invalid → 失效 actor 查询（活跃 observer 重取探测）。
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } });
    const onSessionInvalid = () => handleSessionInvalid(client);
    window.addEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
    let actorCalls = 0;
    let homeCalls = 0;
    server.use(
      http.get("/internal/identity/actor", () => {
        actorCalls += 1;
        if (actorCalls === 1) return HttpResponse.json({ employeeId: "E1001", displayName: "林知行", roleCodes: ["employee"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "session-1" });
        return HttpResponse.json({ code: "SESSION_REQUIRED", detail: "未登录" }, { status: 401 });
      }),
      http.get("/internal/portal/home", () => {
        homeCalls += 1;
        if (homeCalls === 1) return HttpResponse.json({ code: "SESSION_EXPIRED", detail: "会话已过期" }, { status: 401 });
        return HttpResponse.json({ apps: [], skills: [], plugins: [], mcps: [], departments: [], skillPackages: [], updates: null });
      }),
    );
    function ActorProbe() {
      const actor = useCurrentActor();
      return <output data-testid="actor-state">{actor.isPending ? "pending" : actor.isError ? "anonymous" : actor.data?.employeeId ?? "no-data"}</output>;
    }
    render(
      <QueryClientProvider client={client}>
        <ActorProbe />
      </QueryClientProvider>,
    );
    // 启动探测：已登录。
    await waitFor(() => expect(screen.getByTestId("actor-state")).toHaveTextContent("E1001"));
    // 公开读端点 401（会话已过期）→ 匿名重试一次 → 恢复后 UI 应自动降级为未登录。
    await act(async () => { await getHome(); });
    await waitFor(() => expect(screen.getByTestId("actor-state")).toHaveTextContent("anonymous"));
    expect(homeCalls).toBe(2);
  });

  it("未登录访问个人中心时展示登录提示并自动打开登录弹窗", async () => {
    useLoginDialogStore.setState({ request: null });
    server.use(
      http.get("/internal/identity/actor", () => HttpResponse.json({ code: "SESSION_REQUIRED", detail: "未登录" }, { status: 401 })),
      http.get("/internal/identity/login/options", () => HttpResponse.json({ methods: ["password"] })),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <Routes>
              <Route element={<AuthGuard />}>
                <Route path="/dashboard" element={<LocationProbe />} />
              </Route>
            </Routes>
            <LoginDialog />
          </MemoryRouter>
        </QueryClientProvider>
      </StrictMode>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    // 弹窗（modal）会把背后的页面标记 aria-hidden，关闭后再断言登录提示面板。
    useLoginDialogStore.setState({ request: null });
    await waitFor(() => expect(screen.getByRole("heading", { name: "登录后继续" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "立即登录" })).toBeInTheDocument();
    useLoginDialogStore.setState({ request: null });
  });

  it("useRequireLogin 未登录时打开登录弹窗并暂缓动作", async () => {
    useLoginDialogStore.setState({ request: null });
    server.use(http.get("/internal/identity/actor", () => HttpResponse.json({ code: "SESSION_REQUIRED", detail: "未登录" }, { status: 401 })));
    const { client, result } = renderWithQueryClient(() => useRequireLogin());
    await waitFor(() => expect(client.getQueryState(commonKeys.actor)?.status).toBe("error"));
    await act(async () => {});
    const onSuccess = vi.fn();
    act(() => { result.current(onSuccess); });
    expect(useLoginDialogStore.getState().request?.onSuccess).toBe(onSuccess);
    expect(onSuccess).not.toHaveBeenCalled();
    useLoginDialogStore.setState({ request: null });
  });

  it("useRequireLogin 已登录时直接执行动作", async () => {
    server.use(http.get("/internal/identity/actor", () => HttpResponse.json({ employeeId: "E1001", displayName: "林知行", roleCodes: ["employee"], departmentIds: ["dept-1"], primaryDepartmentId: "dept-1", sessionId: "session-1" })));
    const { client, result } = renderWithQueryClient(() => useRequireLogin());
    await waitFor(() => expect(client.getQueryData(commonKeys.actor)).toBeTruthy());
    await act(async () => {});
    const onSuccess = vi.fn();
    act(() => { result.current(onSuccess); });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(useLoginDialogStore.getState().request).toBeNull();
  });

  it("publishErrorGuidance 区分可编辑、需刷新与仅提示的错误", () => {
    const validation = new ApiError(400, "DRAFT_VALIDATION_FAILED", "草稿未通过提交校验", "trace-1", [{ code: "DELIVERY_REQUIRED", message: "至少配置一个可用交付渠道" }]);
    expect(publishErrorGuidance(validation)).toMatchObject({ action: "edit", message: "草稿未通过提交校验", issues: [{ code: "DELIVERY_REQUIRED" }] });
    expect(publishErrorGuidance(new ApiError(400, "PORTAL_APP_DRAFT_REQUIRED", "缺少完整草稿"))).toMatchObject({ action: "edit" });
    expect(publishErrorGuidance(new ApiError(400, "PORTAL_RESOURCE_STATE_CONFLICT", "状态冲突"))).toMatchObject({ action: "refresh" });
    expect(publishErrorGuidance(new ApiError(403, "PORTAL_PUBLISH_FORBIDDEN", "无权限"))).toMatchObject({ action: null });
    expect(publishErrorGuidance(new Error("boom"))).toMatchObject({ action: null, message: "提交失败，请检查信息后重试" });
  });

  it("提交审核返回最新 PortalResourceItem 并映射为页面模型", async () => {
    server.use(http.post("/internal/portal/dashboard/publish/app/app-1/submit", () => HttpResponse.json({
      resourceId: "app-1", resourceType: "app", ownerEmployeeId: "E1001", ownerName: "林知行", slug: "expense-assistant",
      name: "费用助手", summary: "费用填报。", status: "in_review", metadata: {}, favoriteCount: 0, isFavorited: false,
      createdAt: "2026-08-26T08:00:00.000Z", updatedAt: "2026-08-26T08:00:00.000Z",
    })));

    await expect(submitPublishDraft("app", "app-1")).resolves.toMatchObject({
      id: "app-1",
      status: "in_review",
      href: "/apps/E1001/expense-assistant",
    });
  });

  it("详情缺少安全报告和版本时保持未知/空值，不显示伪造成功", () => {
    const detail = mapPortalResourceDetail({
      resourceId: "app-unknown", resourceType: "app", ownerEmployeeId: "E1001", ownerName: "林知行", slug: "unknown", name: "待校验应用", summary: "摘要", status: "draft", currentVersionId: null, metadata: {}, favoriteCount: 0, isFavorited: false, createdAt: "2026-08-26T08:00:00.000Z", updatedAt: "2026-08-26T08:00:00.000Z",
    });
    expect(detail).toMatchObject({ version: null, securityStatus: "unknown", screenshots: [], compatibility: [] });
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
      const parsed = publishDraftSchema.parse({ type, name: "可信资源", slug: `trusted-${type}`, description: "这是一个经过验证且可以安全使用的企业资源。", tagsText: "企业，可信", version: "1.0.0", changelog: "首次发布版本", repositoryUrl: "", connectionType: "streamable_http", ...(type === "app" ? { departmentId: "dept-1", categoryName: "办公效率", manualText: "打开应用并按提示使用。", examplesText: "例如：创建一条费用记录。", faqQuestion: "谁可以使用？", faqAnswer: "全体员工。", inputRestrictionDisclaimer: "请勿输入受限数据。", entryUrl: "https://apps.example.test" } : {}) });
      expect(parsed.type).toBe(type);
    }
    expect(() => publishDraftSchema.parse({ type: "app", name: "可信资源", slug: "trusted-app", description: "这是一个经过验证且可以安全使用的企业资源。", tagsText: "企业", version: "1.0.0", changelog: "首次发布版本", repositoryUrl: "", connectionType: "streamable_http" })).toThrow();
    expect(() => publishDraftSchema.parse({ ...publishDraftSchema.parse({ type: "app", name: "可信资源", slug: "trusted-app", description: "这是一个经过验证且可以安全使用的企业资源。", tagsText: "企业", version: "1.0.0", changelog: "首次发布版本", repositoryUrl: "", connectionType: "streamable_http", departmentId: "dept-1", categoryName: "办公效率", manualText: "打开应用并按提示使用。", examplesText: "例如：创建一条费用记录。", faqQuestion: "谁可以使用？", faqAnswer: "全体员工。", inputRestrictionDisclaimer: "请勿输入受限数据。", entryUrl: "https://apps.example.test" }), applicationType: "desktop_app" })).toThrow();
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
