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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLE_ACCESS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const NAV = [
  { key: "dashboard", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "fleet", to: "/fleet", label: "Vehicle Registry", icon: Truck },
  { key: "drivers", to: "/drivers", label: "Drivers", icon: Users },
  { key: "trips", to: "/trips", label: "Trip Dispatcher", icon: RouteIcon },
  { key: "maintenance", to: "/maintenance", label: "Maintenance", icon: Wrench },
  { key: "expenses", to: "/expenses", label: "Fuel & Expenses", icon: Receipt },
  { key: "analytics", to: "/analytics", label: "Reports & Analytics", icon: BarChart3 },
  { key: "settings", to: "/settings", label: "Settings & RBAC", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const allowed = user ? ROLE_ACCESS[user.role] : [];

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth" });
  };

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
          {NAV.filter((n) => allowed.includes(n.key)).map((n) => {
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
            <div className="text-xs text-primary">{user?.role}</div>
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
