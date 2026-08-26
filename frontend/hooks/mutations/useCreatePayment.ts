import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { CreatePaymentRequest } from "@/types";

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: CreatePaymentRequest;
    }) => paymentsApi.create(groupId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.list(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.balances.group(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activity.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      });
    },
  });
}
