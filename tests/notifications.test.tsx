import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPortalNotificationSummary,
  listPortalNotifications,
  markAllPortalNotificationsRead,
  markPortalNotificationRead,
  type PortalNotificationRecord,
} from "@/apis";
import { PortalHeader } from "@/components/common";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";
import {
  useMarkAllPortalNotificationsRead,
  useMarkPortalNotificationRead,
  usePortalNotificationsList,
  usePortalUnreadCount,
} from "@/hooks";
import { useLoginDialogStore } from "@/store";
import { server } from "./setup";

const actor = {
  employeeId: "E1001",
  displayName: "林知行",
  roleCodes: ["employee"],
  permissions: ["notification.read"],
  departmentIds: ["dept-1"],
  primaryDepartmentId: "dept-1",
  sessionId: "session-1",
};

const notification = (
  id: string,
  overrides: Partial<PortalNotificationRecord> = {},
): PortalNotificationRecord => ({
  notificationId: id,
  recipientEmployeeId: "E1001",
  eventType: "application.review.decided",
  aggregateId: "app-1",
  idempotencyKey: `application.review.decided:app-1:E1001:${id}`,
  message: `通知 ${id}`,
  payload: { title: `标题 ${id}`, body: `正文 ${id}` },
  readAt: null,
  createdAt: "2026-08-28T08:00:00.000Z",
  ...overrides,
});

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function wrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  server.use(
    http.get("/internal/identity/actor", () => HttpResponse.json(actor)),
    http.get("/internal/portal/notifications", () =>
      HttpResponse.json([
        notification("n-1"),
        notification("n-2", { readAt: "2026-08-27T08:00:00.000Z" }),
      ]),
    ),
    http.get("/internal/portal/notifications/summary", () =>
      HttpResponse.json({ unreadCount: 1 }),
    ),
    http.post("/internal/portal/notifications/n-1/read", () =>
      HttpResponse.json(notification("n-1", { readAt: "2026-08-28T09:00:00.000Z" })),
    ),
    http.post("/internal/portal/notifications/read-all", () =>
      HttpResponse.json({ updated: 1 }),
    ),
  );
});

describe("portal notifications api", () => {
  it("requests the portal notification endpoints with the documented paths", async () => {
    const seen: string[] = [];
    server.use(
      http.get("/internal/portal/notifications", ({ request }) => {
        seen.push(`${request.method} ${new URL(request.url).pathname}`);
        return HttpResponse.json([]);
      }),
      http.get("/internal/portal/notifications/summary", ({ request }) => {
        seen.push(`${request.method} ${new URL(request.url).pathname}`);
        return HttpResponse.json({ unreadCount: 0 });
      }),
      http.post("/internal/portal/notifications/n-9/read", ({ request }) => {
        seen.push(`${request.method} ${new URL(request.url).pathname}`);
        return HttpResponse.json(notification("n-9"));
      }),
      http.post("/internal/portal/notifications/read-all", ({ request }) => {
        seen.push(`${request.method} ${new URL(request.url).pathname}`);
        return HttpResponse.json({ updated: 0 });
      }),
    );

    await listPortalNotifications();
    await getPortalNotificationSummary();
    await markPortalNotificationRead("n-9");
    await markAllPortalNotificationsRead();

    expect(seen).toEqual([
      "GET /internal/portal/notifications",
      "GET /internal/portal/notifications/summary",
      "POST /internal/portal/notifications/n-9/read",
      "POST /internal/portal/notifications/read-all",
    ]);
  });
});

describe("portal notification hooks", () => {
  it("loads the unread count and the list for the signed-in actor", async () => {
    const client = makeClient();
    const { result: listResult } = renderHook(() => usePortalNotificationsList(), {
      wrapper: wrapper(client),
    });
    const { result: summaryResult } = renderHook(() => usePortalUnreadCount(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(listResult.current.data).toHaveLength(2));
    await waitFor(() => expect(summaryResult.current.data?.unreadCount).toBe(1));
  });

  it("marks a single notification read and invalidates the list", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useMarkPortalNotificationRead(), {
      wrapper: wrapper(client),
    });
    await act(async () => {
      const record = await result.current.mutateAsync("n-1");
      expect(record.notificationId).toBe("n-1");
      expect(record.readAt).not.toBeNull();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("marks all notifications read", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useMarkAllPortalNotificationsRead(), {
      wrapper: wrapper(client),
    });
    await act(async () => {
      const outcome = await result.current.mutateAsync();
      expect(outcome.updated).toBe(1);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("portal NotificationsPage", () => {
  it("renders the notification list with unread markers and the unread tab count", async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
      { wrapper: wrapper(makeClient()) },
    );

    expect(await screen.findByText("标题 n-1")).toBeInTheDocument();
    expect(screen.getByText("标题 n-2")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/未读（1）/)).toBeInTheDocument(),
    );
  });

  it("marks a notification read when it is opened", async () => {
    const seen: string[] = [];
    server.use(
      http.post("/internal/portal/notifications/n-1/read", ({ request }) => {
        seen.push(`${request.method} ${new URL(request.url).pathname}`);
        return HttpResponse.json(notification("n-1", { readAt: "2026-08-28T09:00:00.000Z" }));
      }),
    );

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
      { wrapper: wrapper(makeClient()) },
    );

    const item = await screen.findByText("标题 n-1");
    await act(async () => {
      item.click();
    });
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "通知详情" })).toBeInTheDocument(),
    );
    expect(seen).toContain("POST /internal/portal/notifications/n-1/read");
  });

  it("marks all notifications read via the batch endpoint", async () => {
    const seen: string[] = [];
    server.use(
      http.post("/internal/portal/notifications/read-all", ({ request }) => {
        seen.push(`${request.method} ${new URL(request.url).pathname}`);
        return HttpResponse.json({ updated: 2 });
      }),
    );

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
      { wrapper: wrapper(makeClient()) },
    );

    const button = await screen.findByRole("button", { name: "全部标记已读" });
    await act(async () => {
      button.click();
    });
    await waitFor(() => expect(seen).toContain("POST /internal/portal/notifications/read-all"));
  });
});

describe("portal header notification bell", () => {
  it("shows the unread badge and opens the recent-unread dropdown", async () => {
    render(
      <StrictMode>
        <MemoryRouter>
          <PortalHeader />
        </MemoryRouter>
      </StrictMode>,
      { wrapper: wrapper(makeClient()) },
    );

    await waitFor(() => expect(screen.getByRole("button", { name: "通知" })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());

    await act(async () => {
      screen.getByRole("button", { name: "通知" }).click();
    });
    expect(await screen.findByText("标题 n-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看全部通知" })).toBeInTheDocument();
  });

  it("opens the login dialog when an anonymous visitor clicks the bell", async () => {
    server.use(
      http.get("/internal/identity/actor", () =>
        HttpResponse.json({ code: "SESSION_REQUIRED", detail: "未登录" }, { status: 401 }),
      ),
    );
    const openSpy = vi.fn();
    useLoginDialogStore.setState({ openLoginDialog: openSpy } as never);

    render(
      <MemoryRouter>
        <PortalHeader />
      </MemoryRouter>,
      { wrapper: wrapper(makeClient()) },
    );

    const bell = await screen.findByRole("button", { name: "通知" });
    await act(async () => {
      bell.click();
    });
    expect(openSpy).toHaveBeenCalled();
  });
});
