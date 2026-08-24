import type { ResourceType } from "@/types";

export function isSafeReturnTo(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("@") && !/^[a-zA-Z][\w+.-]*:/.test(value);
}

export function currentReturnTo(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function loginHref(returnTo = currentReturnTo()): string {
  const safe = isSafeReturnTo(returnTo) ? returnTo : "/";
  return `/login?returnTo=${encodeURIComponent(safe)}`;
}

export function resourceLabel(type: ResourceType): string {
  return ({ app: "应用", skill: "技能", plugin: "插件", mcp: "MCP" } as const)[type];
}
