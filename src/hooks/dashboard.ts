import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPublishDraft, getDashboard, getDashboardComments, getDashboardStars, getPublishAppDraft, savePublishVersion, submitPublishDraft, updatePublishDraft, type DashboardCommentQuery } from "@/apis";
import { commonKeys } from "@/hooks/common";
import type { PublishDraft } from "@/types";

export const dashboardKeys = {
  overview: ["portal", "dashboard", "overview"] as const,
  stars: (page: number, pageSize: number) => ["portal", "dashboard", "stars", page, pageSize] as const,
  comments: (query: DashboardCommentQuery) => ["portal", "dashboard", "comments", query] as const,
  appDraft: (resourceId: string) => ["portal", "dashboard", "app-draft", resourceId] as const,
};

export const useDashboardQuery = () => useQuery({ queryKey: dashboardKeys.overview, queryFn: getDashboard });
export const useDashboardStarsQuery = (page: number, pageSize: number) => useQuery({ queryKey: dashboardKeys.stars(page, pageSize), queryFn: () => getDashboardStars(page, pageSize) });
export const useDashboardCommentsQuery = (query: DashboardCommentQuery) => useQuery({ queryKey: dashboardKeys.comments(query), queryFn: () => getDashboardComments(query) });
export const usePublishAppDraftQuery = (resourceId: string | null) => useQuery({ queryKey: dashboardKeys.appDraft(resourceId ?? ""), queryFn: () => getPublishAppDraft(resourceId!), enabled: Boolean(resourceId), retry: false });

export class PublishFlowError extends Error {
  constructor(readonly cause: unknown, readonly resourceId: string) {
    super(cause instanceof Error ? cause.message : "发布流程失败");
    this.name = "PublishFlowError";
  }
}

export type PublishMutationInput = PublishDraft | { draft: PublishDraft; resourceId?: string };

export function usePublishMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: PublishMutationInput) => {
      const draft = "draft" in input ? input.draft : input;
      let resourceId = "draft" in input ? input.resourceId : undefined;
      try {
        if (!resourceId) resourceId = (await createPublishDraft(draft)).id;
        else await updatePublishDraft(resourceId, draft);
        if (draft.type !== "app") await savePublishVersion(resourceId, draft);
        return { resourceId, resource: await submitPublishDraft(draft.type, resourceId) };
      } catch (error) {
        if (resourceId) throw new PublishFlowError(error, resourceId);
        throw error;
      }
    },
    onSuccess: (_result, input) => {
      const draft = "draft" in input ? input.draft : input;
      client.invalidateQueries({ queryKey: ["portal", "dashboard"] });
      client.invalidateQueries({ queryKey: ["portal", "app"] });
      client.invalidateQueries({ queryKey: ["portal", draft.type] });
      client.invalidateQueries({ queryKey: commonKeys.home });
    },
  });
}
