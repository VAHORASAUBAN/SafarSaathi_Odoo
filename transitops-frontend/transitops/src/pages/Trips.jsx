import { useState } from 'react';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import { dispatchableVehicles, dispatchableDrivers, validateTripDraft } from '../utils/businessRules';

const emptyForm = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '' };

export default function Trips({ readOnly }) {
  const { vehicles, drivers, trips, createDraftTrip, dispatchTrip, completeTrip, cancelTrip } = useData();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(null); // trip id being completed
  const [completeForm, setCompleteForm] = useState({ finalOdometer: '', fuelConsumedL: '', revenue: '' });

  const availableVehicles = dispatchableVehicles(vehicles);
  const availableDrivers = dispatchableDrivers(drivers);

  const vehicle = vehicles.find((v) => v.id === form.vehicleId);
  const driver = drivers.find((d) => d.id === form.driverId);
  const capacityBreached = vehicle && form.cargoWeight && Number(form.cargoWeight) > vehicle.capacityKg;

  function handleCreateAndDispatch(e) {
    e.preventDefault();
    const msg = validateTripDraft({ ...form, vehicle, driver });
    if (msg) { setError(msg); return; }
    const id = createDraftTrip({ ...form, cargoWeight: Number(form.cargoWeight), plannedDistance: Number(form.plannedDistance) });
    dispatchTrip(id);
    setForm(emptyForm);
    setError('');
  }

  function openComplete(trip) {
    setCompleting(trip.id);
    setCompleteForm({ finalOdometer: '', fuelConsumedL: '', revenue: '' });
  }

  function submitComplete(e) {
    e.preventDefault();
    completeTrip(completing, completeForm);
    setCompleting(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Trip Dispatcher</h1>
        <p className="text-sm text-ink-500">{readOnly ? 'View only for your role' : 'Create, dispatch and track trips'}</p>
      </div>

      <div className="panel p-4 flex items-center gap-6">
        <span className="label-eyebrow shrink-0">Trip Lifecycle</span>
        <div className="flex items-center gap-2 flex-1">
          {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((stage, i) => (
            <div key={stage} className="flex items-center gap-2 flex-1">
              <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-signal-green' : i === 1 ? 'bg-signal-blue' : 'bg-base-600'}`} />
              <span className="text-xs text-ink-500">{stage}</span>
              {i < 3 && <div className="flex-1 h-px bg-base-700" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {!readOnly && (
          <div className="panel p-5">
            <div className="label-eyebrow mb-3">Create Trip</div>
            {error && <div className="mb-3 text-xs text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-md px-3 py-2">{error}</div>}
            <form onSubmit={handleCreateAndDispatch} className="space-y-3">
              <div>
                <label className="field-label">Source</label>
                <input className="field" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Ranchhodnagar Depot" required />
              </div>
              <div>
                <label className="field-label">Destination</label>
                <input className="field" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Ahmedabad Hub" required />
              </div>
              <div>
                <label className="field-label">Vehicle (available only)</label>
                <select className="field" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">Select vehicle…</option>
                  {availableVehicles.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.capacityKg} kg capacity</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Driver (available only)</label>
                <select className="field" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required>
                  <option value="">Select driver…</option>
                  {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Cargo Weight (kg)</label>
                <input className="field" type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Planned Distance (km)</label>
                <input className="field" type="number" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} required />
              </div>

              {vehicle && (
                <div className={`rounded-md px-3 py-2 text-xs border ${capacityBreached ? 'bg-signal-red/10 border-signal-red/30 text-signal-red' : 'bg-base-850 border-base-600 text-ink-500'}`}>
                  Vehicle capacity {vehicle.capacityKg} kg · Cargo weight {form.cargoWeight || 0} kg
                  {capacityBreached && (
                    <div className="mt-1 font-medium">
                      ✕ Capacity exceeded by {Number(form.cargoWeight) - vehicle.capacityKg} kg — dispatch blocked
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1" disabled={capacityBreached}>Dispatch Trip</button>
                <button type="button" className="btn-secondary" onClick={() => { setForm(emptyForm); setError(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className={`panel p-5 ${readOnly ? 'col-span-2' : ''}`}>
          <div className="label-eyebrow mb-3">Live Board</div>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {trips.slice().reverse().map((t) => {
              const v = vehicles.find((x) => x.id === t.vehicleId);
              const d = drivers.find((x) => x.id === t.driverId);
              return (
                <div key={t.id} className="border border-base-700 rounded-md p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-sm text-ink-100">{t.tripNo}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-ink-500 mb-1">{t.source} → {t.destination}</div>
                  <div className="text-xs text-ink-600 font-mono mb-2">
                    {v?.name || 'Awaiting vehicle'} / {d?.name || 'Awaiting driver'}
                  </div>
                  {!readOnly && t.status === 'Dispatched' && (
                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => openComplete(t)}>Complete</button>
                      <button className="btn-ghost text-xs" onClick={() => cancelTrip(t.id)}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {completing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setCompleting(null)}>
          <div className="panel p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-semibold text-ink-100 mb-4">Complete Trip</h2>
            <form onSubmit={submitComplete} className="space-y-3">
              <div>
                <label className="field-label">Final Odometer</label>
                <input className="field" type="number" value={completeForm.finalOdometer} onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Fuel Consumed (L)</label>
                <input className="field" type="number" value={completeForm.fuelConsumedL} onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumedL: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Trip Revenue (₹)</label>
                <input className="field" type="number" value={completeForm.revenue} onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">Mark Completed</button>
                <button type="button" className="btn-secondary" onClick={() => setCompleting(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="text-xs text-ink-600 font-mono">On complete odometer → fuel log → expenses; Vehicle & Driver return to Available.</p>
    </div>
  );
}
