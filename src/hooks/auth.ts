import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLoginOptions, loginWithPassword } from "@/apis";
import { commonKeys, useCurrentActor } from "@/hooks/common";
import { useLoginDialogStore } from "@/store";

export const authKeys = { options: ["portal", "auth", "options"] as const };

export function useLoginOptionsQuery(enabled = true) {
  return useQuery({ queryKey: authKeys.options, queryFn: getLoginOptions, staleTime: 5 * 60_000, retry: false, enabled });
}

export function useLoginMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, password }: { employeeId: string; password: string }) => loginWithPassword(employeeId, password),
    onSuccess: (result) => {
      // 清除上一会话遗留的 dashboard 缓存（概览/收藏/评论），避免串号数据；
      // 这些查询未登录时不会挂载，移除不会触发重取竞态。挂载中的公共查询保留，
      // 让登录后继续的收藏/评论动作能基于既有数据乐观更新并正常失效重取。
      client.removeQueries({ queryKey: ["portal", "dashboard"] });
      client.setQueryData(commonKeys.actor, result.actor);
    },
  });
}

/**
 * 登录门槛：已登录时立即执行动作；未登录时打开登录弹窗，
 * 登录成功后自动执行 onSuccess（如补发收藏/评论请求或跳转）。
 */
export function useRequireLogin() {
  const actor = useCurrentActor();
  return useCallback((onSuccess?: () => void) => {
    if (actor.data) {
      onSuccess?.();
      return true;
    }
    useLoginDialogStore.getState().openLoginDialog({ onSuccess });
    return false;
  }, [actor.data]);
}
