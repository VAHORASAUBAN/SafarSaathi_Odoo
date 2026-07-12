import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, CheckCircle2, Wrench, Route as RouteIcon, Clock, UserCheck, Gauge } from "lucide-react";
import { isLicenseExpired } from "@/lib/format";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Kpi({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string | number; tone?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone ?? "text-primary"}`} />
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </Card>
  );
}

function Dashboard() {
  const { vehicles, drivers, trips } = useStore();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [region, setRegion] = useState("all");

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (type === "all" || v.type === type) &&
          (status === "all" || v.status === status) &&
          (region === "all" || v.region === region)
      ),
    [vehicles, type, status, region]
  );

  const active = filtered.filter((v) => v.status === "On Trip").length;
  const available = filtered.filter((v) => v.status === "Available").length;
  const inShop = filtered.filter((v) => v.status === "In Shop").length;
  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips = trips.filter((t) => t.status === "Draft").length;
  const onDuty = drivers.filter((d) => d.status === "On Trip").length;
  const utilization = filtered.length ? Math.round((active / filtered.length) * 100) : 0;

  const statusCounts = (["Available", "On Trip", "In Shop", "Retired"] as const).map((s) => ({
    s,
    n: vehicles.filter((v) => v.status === s).length,
  }));

  const types = [...new Set(vehicles.map((v) => v.type))];
  const regions = [...new Set(vehicles.map((v) => v.region))];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Fleet operations at a glance" />

      <div className="mb-6 flex flex-wrap gap-3">
        <Filter label="Vehicle Type" value={type} onChange={setType} options={types} />
        <Filter label="Status" value={status} onChange={setStatus} options={["Available", "On Trip", "In Shop", "Retired"]} />
        <Filter label="Region" value={region} onChange={setRegion} options={regions} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Kpi icon={RouteIcon} label="Active Vehicles" value={active} tone="text-info" />
        <Kpi icon={CheckCircle2} label="Available" value={available} tone="text-success" />
        <Kpi icon={Wrench} label="In Maintenance" value={inShop} tone="text-warning" />
        <Kpi icon={Truck} label="Active Trips" value={activeTrips} tone="text-info" />
        <Kpi icon={Clock} label="Pending Trips" value={pendingTrips} />
        <Kpi icon={UserCheck} label="Drivers On Duty" value={onDuty} tone="text-success" />
        <Kpi icon={Gauge} label="Fleet Utilization" value={`${utilization}%`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Trips</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-4">Trip</th>
                  <th className="py-2 pr-4">Vehicle</th>
                  <th className="py-2 pr-4">Driver</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Distance</th>
                </tr>
              </thead>
              <tbody>
                {trips.slice(-6).reverse().map((t) => {
                  const v = vehicles.find((x) => x.id === t.vehicleId);
                  const d = drivers.find((x) => x.id === t.driverId);
                  return (
                    <tr key={t.id} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-medium">{t.code}</td>
                      <td className="py-2.5 pr-4">{v?.name ?? "—"}</td>
                      <td className="py-2.5 pr-4">{d?.name ?? "—"}</td>
                      <td className="py-2.5 pr-4"><StatusBadge status={t.status} /></td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{t.plannedDistance} km</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vehicle Status</h3>
          <div className="space-y-4">
            {statusCounts.map(({ s, n }) => (
              <div key={s}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{s}</span>
                  <span className="text-muted-foreground">{n}</span>
                </div>
                <Progress value={vehicles.length ? (n / vehicles.length) * 100 : 0} />
              </div>
            ))}
          </div>
          {drivers.some((d) => isLicenseExpired(d.licenseExpiry)) && (
            <div className="mt-5 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
              {drivers.filter((d) => isLicenseExpired(d.licenseExpiry)).length} driver license(s) expired — check Drivers.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
