import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { createResourceComment, favoriteResource, getCurrentActor, getHome, listResourceComments } from "@/apis";
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
  return useQuery({ queryKey: commonKeys.home, queryFn: getHome });
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
  return useQuery({ queryKey: commonKeys.comments(type, id), queryFn: () => listResourceComments(type, id), enabled: Boolean(id) });
}

export function useCreateComment(type: ResourceType, id: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ body, parentCommentId }: { body: string; parentCommentId: string | null }) => createResourceComment(type, id, body, parentCommentId), onSuccess: () => client.invalidateQueries({ queryKey: commonKeys.comments(type, id) }) });
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
    onSettled: () => client.invalidateQueries({ queryKey: ["portal", type] }),
  });
}
