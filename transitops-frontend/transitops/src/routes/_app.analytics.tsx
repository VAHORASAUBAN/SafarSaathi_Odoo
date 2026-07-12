import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { inr, downloadCSV } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  component: Analytics,
});

const COLORS = ["oklch(0.72 0.16 55)", "oklch(0.66 0.13 235)", "oklch(0.68 0.15 150)", "oklch(0.78 0.14 75)"];

function Analytics() {
  const { vehicles, trips, fuelLogs, maintenance, expenses } = useStore();

  const totalFuelLiters = fuelLogs.reduce((s, f) => s + f.liters, 0);
  const totalDistance = trips
    .filter((t) => t.status === "Completed")
    .reduce((s, t) => s + t.plannedDistance, 0);
  const fuelEff = totalFuelLiters ? (totalDistance / totalFuelLiters).toFixed(1) : "—";

  const onTrip = vehicles.filter((v) => v.status === "On Trip").length;
  const utilization = vehicles.length ? Math.round((onTrip / vehicles.length) * 100) : 0;

  const totalOps =
    fuelLogs.reduce((s, f) => s + f.cost, 0) +
    maintenance.reduce((s, m) => s + m.cost, 0) +
    expenses.reduce((s, e) => s + e.amount, 0);

  // Per-vehicle cost & ROI
  const perVehicle = vehicles.map((v) => {
    const fuel = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0);
    const maint = maintenance.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
    const revenue = trips.filter((t) => t.vehicleId === v.id).reduce((s, t) => s + (t.revenue ?? 0), 0);
    const roi = v.acquisitionCost ? ((revenue - (maint + fuel)) / v.acquisitionCost) * 100 : 0;
    return { name: v.name, cost: fuel + maint, revenue, roi: +roi.toFixed(1) };
  });

  const avgRoi = perVehicle.length ? (perVehicle.reduce((s, p) => s + p.roi, 0) / perVehicle.length).toFixed(1) : "0";

  const statusData = (["Available", "On Trip", "In Shop", "Retired"] as const).map((s) => ({
    name: s,
    value: vehicles.filter((v) => v.status === s).length,
  }));

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Fuel efficiency, utilization, cost & ROI"
        actions={
          <Button variant="outline" onClick={() => downloadCSV("vehicle-analytics.csv", perVehicle as unknown as Record<string, unknown>[])}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Fuel Efficiency" value={`${fuelEff} km/L`} />
        <Stat label="Fleet Utilization" value={`${utilization}%`} />
        <Stat label="Operational Cost" value={inr(totalOps)} />
        <Stat label="Avg Vehicle ROI" value={`${avgRoi}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Cost vs Revenue by Vehicle</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perVehicle}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.016 260)" />
              <XAxis dataKey="name" stroke="oklch(0.68 0.015 260)" fontSize={12} />
              <YAxis stroke="oklch(0.68 0.015 260)" fontSize={12} />
              <Tooltip contentStyle={{ background: "oklch(0.2 0.014 260)", border: "1px solid oklch(0.3 0.016 260)", borderRadius: 8, color: "#fff" }} />
              <Legend />
              <Bar dataKey="cost" name="Cost" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Fleet Status Mix</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.2 0.014 260)", border: "1px solid oklch(0.3 0.016 260)", borderRadius: 8, color: "#fff" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="mt-6 p-5 overflow-x-auto">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vehicle ROI</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="p-2">Vehicle</th><th className="p-2">Cost (Fuel+Maint)</th><th className="p-2">Revenue</th><th className="p-2">ROI</th>
            </tr>
          </thead>
          <tbody>
            {perVehicle.map((p) => (
              <tr key={p.name} className="border-b border-border/50">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2">{inr(p.cost)}</td>
                <td className="p-2">{inr(p.revenue)}</td>
                <td className={`p-2 font-medium ${p.roi >= 0 ? "text-success" : "text-destructive"}`}>{p.roi}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}
