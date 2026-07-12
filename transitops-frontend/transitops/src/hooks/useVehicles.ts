import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@/lib/api-services";
import type { CreateVehicleRequest, UpdateVehicleRequest } from "@/lib/api-types";

export function useVehicles(params?: Parameters<typeof vehicleService.getAll>[0]) {
  return useQuery({
    queryKey: ["vehicles", params],
    queryFn: () => vehicleService.getAll(params),
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: ["vehicles", "available"],
    queryFn: () => vehicleService.getAvailable(),
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  });
}

export function useVehicleAnalytics(id: number) {
  return useQuery({
    queryKey: ["vehicles", id, "analytics"],
    queryFn: () => vehicleService.getAnalytics(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => vehicleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehicleRequest }) =>
      vehicleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vehicleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
