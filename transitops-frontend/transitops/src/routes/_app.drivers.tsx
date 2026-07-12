import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Driver, DriverStatus } from "@/lib/types";
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
import { Plus, Trash2, Download, AlertTriangle } from "lucide-react";
import { isLicenseExpired, daysUntil, downloadCSV } from "@/lib/format";

export const Route = createFileRoute("/_app/drivers")({
  component: Drivers,
});

const empty: Omit<Driver, "id"> = {
  name: "",
  licenseNumber: "",
  licenseCategory: "LMV",
  licenseExpiry: "2028-01-01",
  contact: "",
  safetyScore: 90,
  status: "Available",
};

function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const save = () => {
    if (!form.name || !form.licenseNumber) return toast.error("Name and license number are required.");
    addDriver(form);
    toast.success("Driver added.");
    setForm(empty);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Drivers & Safety Profiles"
        subtitle="Compliance, license validity and safety scores"
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCSV("drivers.csv", drivers as unknown as Record<string, unknown>[])}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Driver</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Driver</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                  <Field label="License No."><Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></Field>
                  <Field label="Category">
                    <Select value={form.licenseCategory} onValueChange={(v) => setForm({ ...form, licenseCategory: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["LMV", "HMV", "MCWG"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="License Expiry"><Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} /></Field>
                  <Field label="Contact"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
                  <Field label="Safety Score"><Input type="number" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: +e.target.value })} /></Field>
                  <Field label="Status">
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DriverStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(["Available", "On Trip", "Off Duty", "Suspended"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <DialogFooter><Button onClick={save}>Save Driver</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="p-3">Driver</th>
              <th className="p-3">License No.</th>
              <th className="p-3">Category</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Safety</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const expired = isLicenseExpired(d.licenseExpiry);
              const soon = !expired && daysUntil(d.licenseExpiry) < 60;
              return (
                <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3 text-muted-foreground">{d.licenseNumber}</td>
                  <td className="p-3">{d.licenseCategory}</td>
                  <td className="p-3">
                    <span className={expired ? "text-destructive" : soon ? "text-warning" : ""}>
                      {d.licenseExpiry}
                    </span>
                    {(expired || soon) && <AlertTriangle className="ml-1 inline h-3.5 w-3.5 text-warning" />}
                  </td>
                  <td className="p-3 text-muted-foreground">{d.contact}</td>
                  <td className="p-3">{d.safetyScore}%</td>
                  <td className="p-3">
                    <Select value={d.status} onValueChange={(s) => updateDriver(d.id, { status: s as DriverStatus })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{(["Available", "On Trip", "Off Duty", "Suspended"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon" onClick={() => deleteDriver(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Rule: drivers with an expired license or Suspended status cannot be assigned to trips.
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
