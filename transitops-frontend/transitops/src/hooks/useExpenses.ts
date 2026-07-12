import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "@/lib/api-services";
import type { CreateExpenseRequest } from "@/lib/api-types";

export function useExpenses(params?: Parameters<typeof expenseService.getAll>[0]) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => expenseService.getAll(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
