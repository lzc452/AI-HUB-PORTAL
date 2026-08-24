import { useMutation, useQuery } from "@tanstack/react-query";
import { createPublishDraft, getDashboard, getDashboardComments, getDashboardStars, savePublishVersion, submitPublishDraft, type DashboardCommentQuery } from "@/apis";
import type { PublishDraft } from "@/types";

export const dashboardKeys = {
  overview: ["portal", "dashboard", "overview"] as const,
  stars: (page: number, pageSize: number) => ["portal", "dashboard", "stars", page, pageSize] as const,
  comments: (query: DashboardCommentQuery) => ["portal", "dashboard", "comments", query] as const,
};

export const useDashboardQuery = () => useQuery({ queryKey: dashboardKeys.overview, queryFn: getDashboard });
export const useDashboardStarsQuery = (page: number, pageSize: number) => useQuery({ queryKey: dashboardKeys.stars(page, pageSize), queryFn: () => getDashboardStars(page, pageSize) });
export const useDashboardCommentsQuery = (query: DashboardCommentQuery) => useQuery({ queryKey: dashboardKeys.comments(query), queryFn: () => getDashboardComments(query) });

export function usePublishMutation() {
  return useMutation({ mutationFn: async (draft: PublishDraft) => {
    const created = await createPublishDraft(draft);
    await savePublishVersion(created.resourceId, draft);
    return submitPublishDraft(draft.type, created.resourceId);
  } });
}
