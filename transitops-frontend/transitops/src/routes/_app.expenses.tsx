import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Expense } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
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
import { Fuel, Plus, Download } from "lucide-react";
import { inr, downloadCSV } from "@/lib/format";

export const Route = createFileRoute("/_app/expenses")({
  component: Expenses,
});

function Expenses() {
  const { vehicles, fuelLogs, expenses, maintenance, addFuelLog, addExpense } = useStore();
  const today = new Date().toISOString().slice(0, 10);

  const [fuelOpen, setFuelOpen] = useState(false);
  const [fuel, setFuel] = useState({ vehicleId: "", liters: 0, cost: 0, date: today });

  const [expOpen, setExpOpen] = useState(false);
  const [exp, setExp] = useState<Omit<Expense, "id">>({ vehicleId: "", tripId: null, category: "Toll", amount: 0, date: today });

  const totalFuel = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);
  const totalOther = expenses.reduce((s, e) => s + e.amount, 0);
  const totalOps = totalFuel + totalMaint + totalOther;

  const saveFuel = () => {
    if (!fuel.vehicleId || fuel.liters <= 0) return toast.error("Select vehicle and enter liters.");
    addFuelLog(fuel);
    toast.success("Fuel log added.");
    setFuel({ vehicleId: "", liters: 0, cost: 0, date: today });
    setFuelOpen(false);
  };
  const saveExp = () => {
    if (!exp.vehicleId || exp.amount <= 0) return toast.error("Select vehicle and enter amount.");
    addExpense(exp);
    toast.success("Expense added.");
    setExp({ vehicleId: "", tripId: null, category: "Toll", amount: 0, date: today });
    setExpOpen(false);
  };

  const vName = (id: string) => vehicles.find((v) => v.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Fuel & Expense Management"
        subtitle="Fuel logs, tolls and operational cost"
        actions={
          <Button variant="outline" onClick={() => downloadCSV("fuel-logs.csv", fuelLogs as unknown as Record<string, unknown>[])}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total Fuel" value={inr(totalFuel)} />
        <Stat label="Total Maintenance" value={inr(totalMaint)} />
        <Stat label="Other Expenses" value={inr(totalOther)} />
        <Stat label="Total Operational Cost" value={inr(totalOps)} highlight />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Fuel Logs</h3>
            <Dialog open={fuelOpen} onOpenChange={setFuelOpen}>
              <DialogTrigger asChild><Button size="sm"><Fuel className="mr-1.5 h-3.5 w-3.5" /> Log Fuel</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Log Fuel</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Vehicle">
                    <Select value={fuel.vehicleId} onValueChange={(v) => setFuel({ ...fuel, vehicleId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Date"><Input type="date" value={fuel.date} onChange={(e) => setFuel({ ...fuel, date: e.target.value })} /></Field>
                  <Field label="Liters"><Input type="number" value={fuel.liters} onChange={(e) => setFuel({ ...fuel, liters: +e.target.value })} /></Field>
                  <Field label="Cost (₹)"><Input type="number" value={fuel.cost} onChange={(e) => setFuel({ ...fuel, cost: +e.target.value })} /></Field>
                </div>
                <DialogFooter><Button onClick={saveFuel}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="p-2">Vehicle</th><th className="p-2">Date</th><th className="p-2">Liters</th><th className="p-2">Cost</th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.slice().reverse().map((f) => (
                <tr key={f.id} className="border-b border-border/50">
                  <td className="p-2 font-medium">{vName(f.vehicleId)}</td>
                  <td className="p-2 text-muted-foreground">{f.date}</td>
                  <td className="p-2">{f.liters} L</td>
                  <td className="p-2">{inr(f.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Other Expenses</h3>
            <Dialog open={expOpen} onOpenChange={setExpOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Expense</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Vehicle">
                    <Select value={exp.vehicleId} onValueChange={(v) => setExp({ ...exp, vehicleId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Category">
                    <Select value={exp.category} onValueChange={(v) => setExp({ ...exp, category: v as Expense["category"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(["Toll", "Parking", "Maintenance", "Other"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Amount (₹)"><Input type="number" value={exp.amount} onChange={(e) => setExp({ ...exp, amount: +e.target.value })} /></Field>
                  <Field label="Date"><Input type="date" value={exp.date} onChange={(e) => setExp({ ...exp, date: e.target.value })} /></Field>
                </div>
                <DialogFooter><Button onClick={saveExp}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="p-2">Vehicle</th><th className="p-2">Category</th><th className="p-2">Date</th><th className="p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice().reverse().map((e) => (
                <tr key={e.id} className="border-b border-border/50">
                  <td className="p-2 font-medium">{vName(e.vehicleId)}</td>
                  <td className="p-2">{e.category}</td>
                  <td className="p-2 text-muted-foreground">{e.date}</td>
                  <td className="p-2">{inr(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={`p-4 ${highlight ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div>
    </Card>
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
