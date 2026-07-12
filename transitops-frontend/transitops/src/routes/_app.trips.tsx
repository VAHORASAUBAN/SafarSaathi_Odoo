import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Send, CheckCircle2, XCircle } from "lucide-react";
import { isLicenseExpired } from "@/lib/format";

export const Route = createFileRoute("/_app/trips")({
  component: Trips,
});

function Trips() {
  const store = useStore();
  const { vehicles, drivers, trips, createTrip, dispatchTrip, cancelTrip, completeTrip } = store;

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState(0);
  const [plannedDistance, setPlannedDistance] = useState(0);

  const [completeFor, setCompleteFor] = useState<string | null>(null);
  const [finalOdo, setFinalOdo] = useState(0);
  const [fuel, setFuel] = useState(0);

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const availableDrivers = drivers.filter(
    (d) => d.status === "Available" && !isLicenseExpired(d.licenseExpiry)
  );
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const overCapacity = selectedVehicle ? cargoWeight > selectedVehicle.capacity : false;

  const submit = () => {
    const res = createTrip({ source, destination, vehicleId, driverId, cargoWeight, plannedDistance });
    if (!res.ok) return toast.error(res.error);
    toast.success("Trip created as Draft.");
    setSource(""); setDestination(""); setVehicleId(""); setDriverId(""); setCargoWeight(0); setPlannedDistance(0);
  };

  const doDispatch = (id: string) => {
    const res = dispatchTrip(id);
    if (!res.ok) return toast.error(res.error);
    toast.success("Trip dispatched — vehicle & driver now On Trip.");
  };

  const doComplete = () => {
    if (!completeFor) return;
    completeTrip(completeFor, finalOdo, fuel);
    toast.success("Trip completed — vehicle & driver back to Available.");
    setCompleteFor(null); setFinalOdo(0); setFuel(0);
  };

  return (
    <div>
      <PageHeader title="Trip Dispatcher" subtitle="Create, dispatch and track trips with validations" />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Create Trip</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Source"><Input value={source} onChange={(e) => setSource(e.target.value)} /></Field>
              <Field label="Destination"><Input value={destination} onChange={(e) => setDestination(e.target.value)} /></Field>
            </div>
            <Field label="Available Vehicle">
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {availableVehicles.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No available vehicles</div>}
                  {availableVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name} · {v.capacity}kg</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Available Driver">
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {availableDrivers.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No available drivers</div>}
                  {availableDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} · {d.licenseCategory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cargo Weight (kg)"><Input type="number" value={cargoWeight} onChange={(e) => setCargoWeight(+e.target.value)} /></Field>
              <Field label="Planned Distance (km)"><Input type="number" value={plannedDistance} onChange={(e) => setPlannedDistance(+e.target.value)} /></Field>
            </div>

            {selectedVehicle && (
              <div className={`rounded-md border p-3 text-xs ${overCapacity ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-accent/30 text-muted-foreground"}`}>
                Vehicle capacity: {selectedVehicle.capacity} kg · Cargo: {cargoWeight} kg
                {overCapacity && <div className="mt-1 font-medium">✕ Cargo exceeds capacity — dispatch blocked.</div>}
              </div>
            )}

            <Button className="w-full" onClick={submit}><Plus className="mr-2 h-4 w-4" /> Create Trip</Button>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Live Board</h3>
          <div className="space-y-3">
            {trips.slice().reverse().map((t) => {
              const v = vehicles.find((x) => x.id === t.vehicleId);
              const d = drivers.find((x) => x.id === t.driverId);
              return (
                <div key={t.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t.code}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{t.source} → {t.destination}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {v?.name ?? "—"} / {d?.name ?? "—"} · {t.cargoWeight}kg · {t.plannedDistance}km
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {t.status === "Draft" && (
                        <Button size="sm" onClick={() => doDispatch(t.id)}><Send className="mr-1.5 h-3.5 w-3.5" /> Dispatch</Button>
                      )}
                      {t.status === "Dispatched" && (
                        <Button size="sm" variant="secondary" onClick={() => { setCompleteFor(t.id); setFinalOdo(v?.odometer ?? 0); }}>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      {(t.status === "Draft" || t.status === "Dispatched") && (
                        <Button size="sm" variant="ghost" onClick={() => cancelTrip(t.id)}>
                          <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        On dispatch → vehicle &amp; driver become On Trip. On complete/cancel → both restored to Available.
      </p>

      <Dialog open={!!completeFor} onOpenChange={(o) => !o && setCompleteFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete Trip</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Final Odometer (km)"><Input type="number" value={finalOdo} onChange={(e) => setFinalOdo(+e.target.value)} /></Field>
            <Field label="Fuel Consumed (L)"><Input type="number" value={fuel} onChange={(e) => setFuel(+e.target.value)} /></Field>
          </div>
          <DialogFooter><Button onClick={doComplete}>Confirm Completion</Button></DialogFooter>
        </DialogContent>
      </Dialog>
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
