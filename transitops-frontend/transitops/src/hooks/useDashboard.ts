import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/api-services";

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: () => dashboardService.getKPIs(),
  });
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["dashboard", "analytics"],
    queryFn: () => dashboardService.getAnalytics(),
  });
}
