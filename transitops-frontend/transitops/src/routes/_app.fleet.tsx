import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { mapApiVehiclesToFrontend, mapFrontendVehicleToApi } from "@/lib/mappers";
import type { Vehicle, VehicleStatus } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Search, Download, AlertCircle } from "lucide-react";
import { inr, num, downloadCSV } from "@/lib/format";

export const Route = createFileRoute("/_app/fleet")({
  component: Fleet,
});

const empty: Omit<Vehicle, "id"> = {
  regNumber: "",
  name: "",
  type: "Van",
  capacity: 500,
  odometer: 0,
  acquisitionCost: 0,
  status: "Available",
  region: "West",
};

function Fleet() {
  const { data: apiVehicles = [], isLoading, error } = useVehicles();
  const vehicles = mapApiVehiclesToFrontend(apiVehicles);
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);

  const filtered = vehicles.filter(
    (v) =>
      v.regNumber.toLowerCase().includes(q.toLowerCase()) ||
      v.name.toLowerCase().includes(q.toLowerCase())
  );

  const save = async () => {
    if (!form.regNumber || !form.name) return toast.error("Registration number and name are required.");
    try {
      await createVehicle.mutateAsync(mapFrontendVehicleToApi(form));
      toast.success("Vehicle registered.");
      setForm(empty);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create vehicle");
    }
  };

  const updateStatus = async (id: string, status: VehicleStatus) => {
    try {
      await updateVehicle.mutateAsync({ id: parseInt(id), data: { status: status.toLowerCase().replace(" ", "_") } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await deleteVehicle.mutateAsync(parseInt(id));
      toast.success("Vehicle deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete vehicle");
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Vehicle Registry" subtitle="Master list of fleet vehicles" />
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-semibold">Failed to load vehicles</div>
              <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Vehicle Registry" subtitle="Master list of fleet vehicles" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        subtitle="Master list of fleet vehicles"
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCSV("vehicles.csv", filtered as unknown as Record<string, unknown>[])}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Register Vehicle</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Registration No."><Input value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} /></Field>
                  <Field label="Name / Model"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                  <Field label="Type">
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Van", "Truck", "Mini", "Bus"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Region">
                    <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["North", "South", "East", "West"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Max Capacity (kg)"><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></Field>
                  <Field label="Odometer (km)"><Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: +e.target.value })} /></Field>
                  <Field label="Acquisition Cost (₹)"><Input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: +e.target.value })} /></Field>
                  <Field label="Status">
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(["Available", "On Trip", "In Shop", "Retired"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <DialogFooter><Button onClick={save} disabled={createVehicle.isPending}>
                  {createVehicle.isPending ? "Saving..." : "Save Vehicle"}
                </Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search reg no. or name…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="p-3">Reg No.</th>
              <th className="p-3">Name / Model</th>
              <th className="p-3">Type</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Odometer</th>
              <th className="p-3">Acq. Cost</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-accent/30">
                <td className="p-3 font-medium">{v.regNumber}</td>
                <td className="p-3">{v.name}</td>
                <td className="p-3 text-muted-foreground">{v.type}</td>
                <td className="p-3">{num(v.capacity)} kg</td>
                <td className="p-3">{num(v.odometer)}</td>
                <td className="p-3">{inr(v.acquisitionCost)}</td>
                <td className="p-3">
                  <Select value={v.status} onValueChange={(s) => updateStatus(v.id, s as VehicleStatus)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Available", "On Trip", "In Shop", "Retired"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} disabled={deleteVehicle.isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No vehicles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Rule: registration numbers are unique. Retired / In&nbsp;Shop vehicles are hidden from the trip dispatcher.
      </p>
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
