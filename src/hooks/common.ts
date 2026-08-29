import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { createResourceComment, favoriteResource, getCurrentActor, getHome, listResourceComments, logout } from "@/apis";
import { listQuerySchema } from "@/schemas";
import type { ListQuery, ResourceDetail, ResourceType } from "@/types";

export const commonKeys = {
  actor: ["portal", "common", "actor"] as const,
  home: ["portal", "common", "home"] as const,
  comments: (type: ResourceType, id: string) => ["portal", "common", "comments", type, id] as const,
};

export function useCurrentActor() {
  return useQuery({ queryKey: commonKeys.actor, queryFn: getCurrentActor, retry: false });
}

export function useHomeQuery() {
  // 公开读端点：401 匿名重试已由 apiFetch 完成，retry:false 避免 React Query 重试叠加（匿名限流敏感）。
  return useQuery({ queryKey: commonKeys.home, queryFn: getHome, retry: false });
}

/** 退出登录：注销服务端会话后清空缓存并回到门户首页。 */
export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      client.clear();
      window.location.assign("/");
    },
  });
}

export function useListUrlState() {
  const [params, setParams] = useSearchParams();
  const parsed = listQuerySchema.parse({ q: params.get("q") || undefined, sortBy: params.get("sortBy") || undefined, category: params.get("category") || undefined, page: params.get("page") || undefined, pageSize: params.get("pageSize") || undefined });
  const query: ListQuery = parsed;
  const update = (patch: Partial<Record<keyof ListQuery, string | number | undefined>>) => {
    setParams((current) => {
      Object.entries(patch).forEach(([key, value]) => value === undefined || value === "" ? current.delete(key) : current.set(key, String(value)));
      if (!("page" in patch)) current.set("page", "1");
      return current;
    }, { replace: true });
  };
  return { query, update };
}

export function useResourceComments(type: ResourceType, id: string) {
  // 公开读端点：401 匿名重试已由 apiFetch 完成，retry:false 避免重试叠加。
  return useQuery({ queryKey: commonKeys.comments(type, id), queryFn: () => listResourceComments(type, id), enabled: Boolean(id), retry: false });
}

export function useCreateComment(type: ResourceType, id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ body, parentCommentId }: { body: string; parentCommentId: string | null }) => createResourceComment(type, id, body, parentCommentId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: commonKeys.comments(type, id) });
      client.invalidateQueries({ queryKey: ["portal", "dashboard", "comments"] });
    },
  });
}

export function useFavoriteMutation(type: ResourceType, id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (active: boolean) => favoriteResource(type, id, active),
    onMutate: async (active) => {
      await client.cancelQueries({ queryKey: ["portal", type] });
      const snapshots = client.getQueriesData<ResourceDetail>({ queryKey: ["portal", type] });
      snapshots.forEach(([key, value]) => {
        if (value?.id === id) client.setQueryData(key, { ...value, isStarred: active, stars: Math.max(0, value.stars + (active ? 1 : -1)) });
      });
      return snapshots;
    },
    onError: (_error, _active, snapshots) => snapshots?.forEach(([key, value]) => client.setQueryData(key, value)),
    onSettled: () => {
      client.invalidateQueries({ queryKey: ["portal", type] });
      client.invalidateQueries({ queryKey: ["portal", "dashboard"] });
      client.invalidateQueries({ queryKey: commonKeys.home });
    },
  });
}
