import { clsx, type ClassValue } from "clsx";

export const cn = (...values: ClassValue[]) => clsx(values);

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(value));
}

export function initials(value: string): string {
  return Array.from(value.trim()).slice(0, 2).join("").toUpperCase() || "AI";
}
