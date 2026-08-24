import type { ApiProblem, HomePayload, ResourceComment, ResourceType, SessionActor } from "@/types";
import { fixtureComments, fixtureHome } from "@/apis/fixtures";

export const useFixtures = import.meta.env.DEV && import.meta.env.VITE_PORTAL_USE_FIXTURES !== "false";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly traceId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split(";")
    .map((value) => value.trim().split("="))
    .find(([key]) => key === name)
    ?.slice(1)
    .join("=");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = readCookie("csrf_token");
    if (csrf) headers.set("x-csrf-token", csrf);
    headers.set("x-request-nonce", crypto.randomUUID());
    headers.set("x-request-timestamp", new Date().toISOString());
  }
  const response = await fetch(path, { ...init, credentials: "same-origin", headers });
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ApiProblem;
    throw new ApiError(response.status, problem.code ?? "PORTAL_REQUEST_FAILED", problem.message ?? problem.detail ?? "请求失败", problem.traceId);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getCurrentActor(): Promise<SessionActor> {
  if (useFixtures) {
    return { employeeId: "DEMO-EMPLOYEE", displayName: "林知行", avatarUrl: null, permissions: ["portal.read", "portal.publish"] };
  }
  const result = await apiFetch<{ actor: SessionActor }>("/internal/identity/actor");
  return result.actor;
}

export function queryString(values: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

export async function getHome(): Promise<HomePayload> {
  if (useFixtures) return fixtureHome();
  return apiFetch<HomePayload>("/internal/portal/home");
}

export async function favoriteResource(resourceType: ResourceType, resourceId: string, active: boolean) {
  if (useFixtures) return { resourceType, resourceId, active };
  return apiFetch<{ resourceType: ResourceType; resourceId: string; active: boolean }>(`/internal/portal/${resourceType}/${resourceId}/favorite`, { method: "POST", body: JSON.stringify({ active }) });
}

export async function listResourceComments(resourceType: ResourceType, resourceId: string): Promise<ResourceComment[]> {
  if (useFixtures) return fixtureComments();
  return apiFetch<ResourceComment[]>(`/internal/portal/${resourceType}/${resourceId}/comments`);
}

export async function createResourceComment(resourceType: ResourceType, resourceId: string, body: string, parentCommentId: string | null) {
  if (useFixtures) return { commentId: crypto.randomUUID(), resourceType, resourceId, body, parentCommentId, createdAt: new Date().toISOString() };
  return apiFetch<ResourceComment>(`/internal/portal/${resourceType}/${resourceId}/comments`, { method: "POST", body: JSON.stringify({ body, parentCommentId }) });
}
