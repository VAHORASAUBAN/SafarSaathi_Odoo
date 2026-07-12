import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fuelService } from "@/lib/api-services";
import type { CreateFuelLogRequest } from "@/lib/api-types";

export function useFuelLogs(params?: Parameters<typeof fuelService.getAll>[0]) {
  return useQuery({
    queryKey: ["fuel", params],
    queryFn: () => fuelService.getAll(params),
  });
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFuelLogRequest) => fuelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
