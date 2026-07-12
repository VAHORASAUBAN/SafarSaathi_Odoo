import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driverService } from "@/lib/api-services";
import type { CreateDriverRequest, UpdateDriverRequest } from "@/lib/api-types";

export function useDrivers(params?: Parameters<typeof driverService.getAll>[0]) {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => driverService.getAll(params),
  });
}

export function useAvailableDrivers() {
  return useQuery({
    queryKey: ["drivers", "available"],
    queryFn: () => driverService.getAvailable(),
  });
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: ["drivers", id],
    queryFn: () => driverService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverRequest) => driverService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDriverRequest }) =>
      driverService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => driverService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
