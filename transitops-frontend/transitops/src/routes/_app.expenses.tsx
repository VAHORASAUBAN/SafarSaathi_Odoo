import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useFuelLogs, useCreateFuelLog } from "@/hooks/useFuel";
import { useExpenses, useCreateExpense } from "@/hooks/useExpenses";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useVehicles } from "@/hooks/useVehicles";
import { mapApiFuelLogsToFrontend, mapApiExpensesToFrontend, mapApiMaintenanceToFrontend, mapApiVehiclesToFrontend } from "@/lib/mappers";
import type { Expense } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
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
import { Fuel, Plus, Download, AlertCircle } from "lucide-react";
import { inr, downloadCSV } from "@/lib/format";

export const Route = createFileRoute("/_app/expenses")({
  component: Expenses,
});

function Expenses() {
  // Fetch data from API
  const { data: apiFuelLogs = [], isLoading: fuelLoading, error: fuelError } = useFuelLogs();
  const { data: apiExpenses = [], isLoading: expensesLoading, error: expensesError } = useExpenses();
  const { data: apiMaintenance = [], isLoading: maintenanceLoading, error: maintenanceError } = useMaintenance();
  const { data: apiVehicles = [], isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  
  // Map API data to frontend format
  const fuelLogs = mapApiFuelLogsToFrontend(apiFuelLogs);
  const expenses = mapApiExpensesToFrontend(apiExpenses);
  const maintenance = mapApiMaintenanceToFrontend(apiMaintenance);
  const vehicles = mapApiVehiclesToFrontend(apiVehicles);

  // Mutations
  const createFuelLog = useCreateFuelLog();
  const createExpense = useCreateExpense();

  const today = new Date().toISOString().slice(0, 10);

  const [fuelOpen, setFuelOpen] = useState(false);
  const [fuel, setFuel] = useState({ vehicleId: "", liters: 0, cost: 0, date: today });

  const [expOpen, setExpOpen] = useState(false);
  const [exp, setExp] = useState<Omit<Expense, "id">>({ vehicleId: "", tripId: null, category: "Toll", amount: 0, date: today });

  const totalFuel = useMemo(() => fuelLogs.reduce((s, f) => s + f.cost, 0), [fuelLogs]);
  const totalMaint = useMemo(() => maintenance.reduce((s, m) => s + m.cost, 0), [maintenance]);
  const totalOther = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalOps = totalFuel + totalMaint + totalOther;

  const saveFuel = async () => {
    if (!fuel.vehicleId || fuel.liters <= 0) return toast.error("Select vehicle and enter liters.");
    try {
      await createFuelLog.mutateAsync({
        vehicle_id: fuel.vehicleId,
        liters: fuel.liters,
        cost: fuel.cost,
        fuel_date: fuel.date,
      });
      toast.success("Fuel log added.");
      setFuel({ vehicleId: "", liters: 0, cost: 0, date: today });
      setFuelOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add fuel log");
    }
  };

  const saveExp = async () => {
    if (!exp.vehicleId || exp.amount <= 0) return toast.error("Select vehicle and enter amount.");
    try {
      await createExpense.mutateAsync({
        vehicle_id: exp.vehicleId,
        expense_type: exp.category.toLowerCase(),
        amount: exp.amount,
        expense_date: exp.date,
      });
      toast.success("Expense added.");
      setExp({ vehicleId: "", tripId: null, category: "Toll", amount: 0, date: today });
      setExpOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    }
  };

  const vName = (id: string) => vehicles.find((v) => v.id === id)?.name ?? "—";

  // Error handling
  if (fuelError || expensesError || maintenanceError || vehiclesError) {
    return (
      <div>
        <PageHeader title="Fuel & Expense Management" subtitle="Fuel logs, tolls and operational cost" />
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-semibold">Failed to load data</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {fuelError?.message || expensesError?.message || maintenanceError?.message || vehiclesError?.message}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (fuelLoading || expensesLoading || maintenanceLoading || vehiclesLoading) {
    return (
      <div>
        <PageHeader title="Fuel & Expense Management" subtitle="Fuel logs, tolls and operational cost" />
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

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
                <DialogFooter><Button onClick={saveFuel} disabled={createFuelLog.isPending}>
                  {createFuelLog.isPending ? "Saving..." : "Save"}
                </Button></DialogFooter>
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
                <DialogFooter><Button onClick={saveExp} disabled={createExpense.isPending}>
                  {createExpense.isPending ? "Saving..." : "Save"}
                </Button></DialogFooter>
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
