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

export const useAppsQuery = (query: ListQuery) => useQuery({ queryKey: appKeys.list(query), queryFn: () => listApps(query) });
export const useAppQuery = (userId: string, slug: string) => useQuery({ queryKey: appKeys.detail(userId, slug), queryFn: () => getApp(userId, slug) });
export const useAppsHuntQuery = () => useQuery({ queryKey: appKeys.hunt, queryFn: getAppsHunt });
export const useDepartmentsQuery = () => useQuery({ queryKey: appKeys.departments, queryFn: listDepartments });
export const useDepartmentQuery = (id: string) => useQuery({ queryKey: appKeys.department(id), queryFn: () => getDepartment(id), enabled: Boolean(id) });

export function useHuntVoteMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ periodId, entryId }: { periodId: string; entryId: string }) => voteForApp(periodId, entryId), onSuccess: () => client.invalidateQueries({ queryKey: appKeys.hunt }) });
}
