import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useTrips, useCreateTrip, useDispatchTrip, useCompleteTrip, useCancelTrip } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { mapApiTripsToFrontend, mapApiVehiclesToFrontend, mapApiDriversToFrontend } from "@/lib/mappers";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Send, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { isLicenseExpired } from "@/lib/format";

export const Route = createFileRoute("/_app/trips")({
  component: Trips,
});

function Trips() {
  // Fetch data from API
  const { data: apiTrips = [], isLoading: tripsLoading, error: tripsError } = useTrips();
  const { data: apiVehicles = [], isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { data: apiDrivers = [], isLoading: driversLoading, error: driversError } = useDrivers();
  
  // Map API data to frontend format
  const trips = mapApiTripsToFrontend(apiTrips);
  const vehicles = mapApiVehiclesToFrontend(apiVehicles);
  const drivers = mapApiDriversToFrontend(apiDrivers);

  // Mutations
  const createTrip = useCreateTrip();
  const dispatchTrip = useDispatchTrip();
  const completeTrip = useCompleteTrip();
  const cancelTrip = useCancelTrip();

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

  const submit = async () => {
    if (!source || !destination) return toast.error("Source and destination are required");
    if (!vehicleId || !driverId) return toast.error("Vehicle and driver are required");
    if (overCapacity) return toast.error("Cargo exceeds vehicle capacity");
    
    try {
      await createTrip.mutateAsync({
        vehicle_id: parseInt(vehicleId),
        driver_id: parseInt(driverId),
        source,
        destination,
        cargo_weight: cargoWeight,
        planned_distance: plannedDistance,
      });
      toast.success("Trip created as Draft.");
      setSource(""); setDestination(""); setVehicleId(""); setDriverId(""); setCargoWeight(0); setPlannedDistance(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create trip");
    }
  };

  const doDispatch = async (id: string) => {
    try {
      await dispatchTrip.mutateAsync({
        id: parseInt(id),
        data: { dispatch_time: new Date().toISOString() }
      });
      toast.success("Trip dispatched — vehicle & driver now On Trip.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to dispatch trip");
    }
  };

  const doComplete = async () => {
    if (!completeFor) return;
    try {
      await completeTrip.mutateAsync({
        id: parseInt(completeFor),
        data: {
          end_odometer: finalOdo,
          fuel_consumed: fuel,
          completion_time: new Date().toISOString()
        }
      });
      toast.success("Trip completed — vehicle & driver back to Available.");
      setCompleteFor(null); setFinalOdo(0); setFuel(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete trip");
    }
  };

  const doCancel = async (id: string) => {
    try {
      await cancelTrip.mutateAsync(parseInt(id));
      toast.success("Trip cancelled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel trip");
    }
  };

  // Error handling
  if (tripsError || vehiclesError || driversError) {
    return (
      <div>
        <PageHeader title="Trip Dispatcher" subtitle="Create, dispatch and track trips with validations" />
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-semibold">Failed to load data</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {tripsError?.message || vehiclesError?.message || driversError?.message}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (tripsLoading || vehiclesLoading || driversLoading) {
    return (
      <div>
        <PageHeader title="Trip Dispatcher" subtitle="Create, dispatch and track trips with validations" />
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-[500px] lg:col-span-2" />
          <Skeleton className="h-[500px] lg:col-span-3" />
        </div>
      </div>
    );
  }

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

            <Button className="w-full" onClick={submit} disabled={createTrip.isPending}>
              {createTrip.isPending ? "Creating..." : <><Plus className="mr-2 h-4 w-4" /> Create Trip</>}
            </Button>
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
                        <Button size="sm" onClick={() => doDispatch(t.id)} disabled={dispatchTrip.isPending}>
                          <Send className="mr-1.5 h-3.5 w-3.5" /> Dispatch
                        </Button>
                      )}
                      {t.status === "Dispatched" && (
                        <Button size="sm" variant="secondary" onClick={() => { setCompleteFor(t.id); setFinalOdo(v?.odometer ?? 0); }} disabled={completeTrip.isPending}>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      {(t.status === "Draft" || t.status === "Dispatched") && (
                        <Button size="sm" variant="ghost" onClick={() => doCancel(t.id)} disabled={cancelTrip.isPending}>
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
          <DialogFooter><Button onClick={doComplete} disabled={completeTrip.isPending}>
            {completeTrip.isPending ? "Completing..." : "Confirm Completion"}
          </Button></DialogFooter>
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
