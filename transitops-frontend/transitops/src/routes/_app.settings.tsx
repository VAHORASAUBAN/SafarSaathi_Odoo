import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ROLE_ACCESS, type Role } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

const MODULES = [
  { key: "fleet", label: "Fleet" },
  { key: "drivers", label: "Drivers" },
  { key: "trips", label: "Trips" },
  { key: "maintenance", label: "Maintenance" },
  { key: "expenses", label: "Fuel & Exp." },
  { key: "analytics", label: "Analytics" },
];

const ROLES: Role[] = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Settings & RBAC" subtitle="Roles, access control and app data" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current Session</h3>
          <dl className="space-y-3 text-sm">
            <Row label="Name" value={user?.name ?? "—"} />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Role" value={user?.role ?? "—"} />
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-2 overflow-x-auto">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Role-Based Access (RBAC)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="p-2">Role</th>
                {MODULES.map((m) => <th key={m.key} className="p-2 text-center">{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r} className={`border-b border-border/50 ${r === user?.role ? "bg-primary/5" : ""}`}>
                  <td className="p-2 font-medium">{r}</td>
                  {MODULES.map((m) => (
                    <td key={m.key} className="p-2 text-center">
                      {ROLE_ACCESS[r].includes(m.key) ? (
                        <Check className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            Access is enforced in the sidebar — each role only sees the modules it is permitted to use.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
