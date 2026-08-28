import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLoginOptions, loginWithPassword, logout } from "@/apis";
import { commonKeys } from "@/hooks/common";

export const authKeys = { options: ["portal", "auth", "options"] as const };

export function useLoginOptionsQuery() {
  return useQuery({ queryKey: authKeys.options, queryFn: getLoginOptions, staleTime: 5 * 60_000, retry: false });
}

export function useLoginMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, password }: { employeeId: string; password: string }) => loginWithPassword(employeeId, password),
    onSuccess: (result) => client.setQueryData(commonKeys.actor, result.actor),
  });
}

export function useLogoutMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: logout, onSuccess: () => client.clear() });
}
