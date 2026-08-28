import { resourceLabels } from "@/apis/static-data";
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

/** 静态映射统一在 src/apis/static-data.ts 管理。 */
export function resourceLabel(type: ResourceType): string {
  return resourceLabels[type];
}
