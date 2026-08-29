import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApp, getAppsHunt, getDepartment, listApps, listDepartments, voteForApp } from "@/apis";
import type { ListQuery } from "@/types";

export const appKeys = {
  all: ["portal", "app"] as const,
  list: (query: ListQuery) => ["portal", "app", "list", query] as const,
  detail: (userId: string, slug: string) => ["portal", "app", "detail", userId, slug] as const,
  hunt: ["portal", "app", "hunt"] as const,
  departments: ["portal", "app", "departments"] as const,
  department: (id: string) => ["portal", "app", "department", id] as const,
};

// 公开读端点：401 匿名重试已由 apiFetch 完成，retry:false 避免 React Query 重试叠加（匿名限流敏感）。
export const useAppsQuery = (query: ListQuery) => useQuery({ queryKey: appKeys.list(query), queryFn: () => listApps(query), retry: false });
export const useAppQuery = (userId: string, slug: string) => useQuery({ queryKey: appKeys.detail(userId, slug), queryFn: () => getApp(userId, slug), retry: false });
export const useAppsHuntQuery = () => useQuery({ queryKey: appKeys.hunt, queryFn: getAppsHunt, retry: false });
export const useDepartmentsQuery = () => useQuery({ queryKey: appKeys.departments, queryFn: listDepartments, retry: false });
export const useDepartmentQuery = (id: string) => useQuery({ queryKey: appKeys.department(id), queryFn: () => getDepartment(id), enabled: Boolean(id), retry: false });

export function useHuntVoteMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ periodId, entryId }: { periodId: string; entryId: string }) => voteForApp(periodId, entryId), onSuccess: () => client.invalidateQueries({ queryKey: appKeys.hunt }) });
}
