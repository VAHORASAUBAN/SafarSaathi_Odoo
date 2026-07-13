import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route as RouteIcon,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/types";

const NAV = [
  { key: "dashboard", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { key: "fleet", to: "/fleet", label: "Vehicle Registry", icon: Truck, resource: "vehicles" },
  { key: "drivers", to: "/drivers", label: "Drivers", icon: Users, resource: "drivers" },
  { key: "trips", to: "/trips", label: "Trip Dispatcher", icon: RouteIcon, resource: "trips" },
  { key: "maintenance", to: "/maintenance", label: "Maintenance", icon: Wrench, resource: "maintenance" },
  { key: "expenses", to: "/expenses", label: "Fuel & Expenses", icon: Receipt, resource: "expenses" },
  { key: "analytics", to: "/analytics", label: "Reports & Analytics", icon: BarChart3, resource: "analytics" },
  { key: "settings", to: "/settings", label: "Settings", icon: Settings, resource: "settings" },
] as const;

// Role display labels
const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-red-500" },
  fleet_manager: { label: "Fleet Manager", color: "bg-blue-500" },
  dispatcher: { label: "Dispatcher", color: "bg-green-500" },
  driver: { label: "Driver", color: "bg-yellow-500" },
  safety_officer: { label: "Safety Officer", color: "bg-purple-500" },
  financial_analyst: { label: "Financial Analyst", color: "bg-orange-500" },
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, canAccess } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth" });
  };

  const roleInfo = user ? ROLE_LABELS[user.role] : null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
            T
          </div>
          <div>
            <div className="text-sm font-semibold text-sidebar-foreground">TransitOps</div>
            <div className="text-[10px] text-muted-foreground">Transport Ops</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.filter((n) => user && canAccess(n.resource, "view")).map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.key}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-2">
            <div className="text-sm font-medium text-sidebar-foreground">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            {roleInfo && (
              <div className="mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full text-white", roleInfo.color)}>
                  {roleInfo.label}
                </span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card/50 px-6 py-3 backdrop-blur">
          <div className="text-sm text-muted-foreground md:hidden font-semibold">TransitOps</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            {roleInfo && (
              <Badge variant="outline" className="hidden sm:inline-flex">
                <Shield className="mr-1 h-3 w-3" />
                {roleInfo.label}
              </Badge>
            )}
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              {user?.name?.[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
