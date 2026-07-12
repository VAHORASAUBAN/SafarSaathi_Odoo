import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "@/lib/api-services";
import type { CreateMaintenanceRequest, UpdateMaintenanceRequest } from "@/lib/api-types";

export function useMaintenance(params?: Parameters<typeof maintenanceService.getAll>[0]) {
  return useQuery({
    queryKey: ["maintenance", params],
    queryFn: () => maintenanceService.getAll(params),
  });
}

export function useMaintenanceRecord(id: number) {
  return useQuery({
    queryKey: ["maintenance", id],
    queryFn: () => maintenanceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaintenanceRequest) => maintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMaintenanceRequest }) =>
      maintenanceService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
