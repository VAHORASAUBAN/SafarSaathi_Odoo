import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useMaintenance, useCreateMaintenance, useUpdateMaintenance } from "@/hooks/useMaintenance";
import { useVehicles } from "@/hooks/useVehicles";
import { mapApiMaintenanceToFrontend, mapApiVehiclesToFrontend } from "@/lib/mappers";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_app/maintenance")({
  component: Maintenance,
});

function Maintenance() {
  // Fetch data from API
  const { data: apiMaintenance = [], isLoading: maintenanceLoading, error: maintenanceError } = useMaintenance();
  const { data: apiVehicles = [], isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  
  // Map API data to frontend format
  const maintenance = mapApiMaintenanceToFrontend(apiMaintenance);
  const vehicles = mapApiVehiclesToFrontend(apiVehicles);

  // Mutations
  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();

  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("Oil Change");
  const [cost, setCost] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const eligible = vehicles.filter((v) => v.status !== "Retired");

  const save = async () => {
    if (!vehicleId) return toast.error("Select a vehicle.");
    try {
      await createMaintenance.mutateAsync({
        vehicle_id: vehicleId,
        maintenance_type: serviceType,
        cost,
        scheduled_date: date,
        status: "scheduled"
      });
      toast.success("Maintenance logged — vehicle set to In Shop.");
      setVehicleId(""); setCost(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create maintenance");
    }
  };

  const closeMaintenanceRecord = async (id: string) => {
    try {
      await updateMaintenance.mutateAsync({
        id,
        data: { status: "completed" }
      });
      toast.success("Maintenance closed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to close maintenance");
    }
  };

  // Error handling
  if (maintenanceError || vehiclesError) {
    return (
      <div>
        <PageHeader title="Maintenance" subtitle="Service logs & vehicle downtime" />
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-semibold">Failed to load data</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {maintenanceError?.message || vehiclesError?.message}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (maintenanceLoading || vehiclesLoading) {
    return (
      <div>
        <PageHeader title="Maintenance" subtitle="Service logs & vehicle downtime" />
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-[400px] lg:col-span-2" />
          <Skeleton className="h-[400px] lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Service logs & vehicle downtime" />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Log Service Record</h3>
          <div className="space-y-4">
            <Field label="Vehicle">
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {eligible.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} · {v.status}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Service Type">
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Oil Change", "Engine Repair", "Tyre Replace", "Brake Service", "General Service"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cost (₹)"><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} /></Field>
              <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            </div>
            <Button className="w-full" onClick={save} disabled={createMaintenance.isPending}>
              {createMaintenance.isPending ? "Saving..." : "Save & Set In Shop"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Adding an active maintenance record switches the vehicle to In Shop and hides it from dispatch. Closing it restores Available.
            </p>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3 overflow-x-auto">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Service Log</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="p-2">Vehicle</th>
                <th className="p-2">Service</th>
                <th className="p-2">Date</th>
                <th className="p-2">Cost</th>
                <th className="p-2">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {maintenance.slice().reverse().map((m) => {
                const v = vehicles.find((x) => x.id === m.vehicleId);
                return (
                  <tr key={m.id} className="border-b border-border/50">
                    <td className="p-2 font-medium">{v?.name ?? "—"}</td>
                    <td className="p-2">{m.serviceType}</td>
                    <td className="p-2 text-muted-foreground">{m.date}</td>
                    <td className="p-2">{inr(m.cost)}</td>
                    <td className="p-2"><StatusBadge status={m.status} /></td>
                    <td className="p-2">
                      {m.status === "Active" && (
                        <Button size="sm" variant="secondary" onClick={() => closeMaintenanceRecord(m.id)} disabled={updateMaintenance.isPending}>
                          Close
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
