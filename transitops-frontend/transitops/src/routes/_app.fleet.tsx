import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Vehicle, VehicleStatus } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Search, Download } from "lucide-react";
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
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);

  const filtered = vehicles.filter(
    (v) =>
      v.regNumber.toLowerCase().includes(q.toLowerCase()) ||
      v.name.toLowerCase().includes(q.toLowerCase())
  );

  const save = () => {
    if (!form.regNumber || !form.name) return toast.error("Registration number and name are required.");
    const res = addVehicle(form);
    if (!res.ok) return toast.error(res.error);
    toast.success("Vehicle registered.");
    setForm(empty);
    setOpen(false);
  };

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
                <DialogFooter><Button onClick={save}>Save Vehicle</Button></DialogFooter>
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
                  <Select value={v.status} onValueChange={(s) => updateVehicle(v.id, { status: s as VehicleStatus })}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Available", "On Trip", "In Shop", "Retired"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => deleteVehicle(v.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
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

