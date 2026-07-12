import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { vehicleOperationalCost } from '../utils/businessRules';

export default function FuelExpenses({ readOnly }) {
  const { vehicles, trips, fuelLogs, expenses, maintenance, addFuelLog, addExpense } = useData();
  const [fuelForm, setFuelForm] = useState(null);
  const [expForm, setExpForm] = useState(null);

  const totalCost = vehicles.reduce((s, v) => s + vehicleOperationalCost(v.id, fuelLogs, maintenance), 0);

  function submitFuel(e) {
    e.preventDefault();
    addFuelLog({ ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost) });
    setFuelForm(null);
  }
  function submitExpense(e) {
    e.preventDefault();
    addExpense({ ...expForm, toll: Number(expForm.toll) || 0, misc: Number(expForm.misc) || 0 });
    setExpForm(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100">Fuel & Expense Management</h1>
          <p className="text-sm text-ink-500">{readOnly ? 'View only for your role' : 'Fuel logs, tolls and misc. expenses per vehicle'}</p>
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <button className="btn-primary flex items-center gap-1.5" onClick={() => setFuelForm({ vehicleId: vehicles[0]?.id || '', date: new Date().toISOString().slice(0, 10), liters: '', cost: '' })}>
              <Plus size={15} /> Log Fuel
            </button>
            <button className="btn-primary flex items-center gap-1.5" onClick={() => setExpForm({ tripId: trips[0]?.id || '', vehicleId: vehicles[0]?.id || '', toll: '', misc: '', date: new Date().toISOString().slice(0, 10) })}>
              <Plus size={15} /> Add Expense
            </button>
          </div>
        )}
      </div>

      <div className="panel p-4">
        <div className="label-eyebrow mb-3">Fuel Logs</div>
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Date</th><th>Liters</th><th>Cost</th></tr></thead>
          <tbody>
            {fuelLogs.slice().reverse().map((f) => {
              const v = vehicles.find((x) => x.id === f.vehicleId);
              return (
                <tr key={f.id}>
                  <td className="text-ink-100">{v?.name || '—'}</td>
                  <td>{f.date}</td>
                  <td>{f.liters} L</td>
                  <td>₹{Number(f.cost).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel p-4">
        <div className="label-eyebrow mb-3">Other Expenses (Toll / Misc)</div>
        <table className="data-table">
          <thead><tr><th>Trip</th><th>Vehicle</th><th>Toll</th><th>Other</th><th>Maint. (linked)</th><th>Total</th></tr></thead>
          <tbody>
            {expenses.slice().reverse().map((e) => {
              const v = vehicles.find((x) => x.id === e.vehicleId);
              const t = trips.find((x) => x.id === e.tripId);
              return (
                <tr key={e.id}>
                  <td className="text-ink-100">{t?.tripNo || '—'}</td>
                  <td>{v?.name || '—'}</td>
                  <td>₹{e.toll}</td>
                  <td>₹{e.misc}</td>
                  <td><StatusPill status={t?.status} /></td>
                  <td>₹{(e.toll + e.misc).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end mt-4 pt-3 border-t border-base-700">
          <div className="text-right">
            <div className="label-eyebrow">Total Operational Cost (Auto) = Fuel + Maintenance</div>
            <div className="font-display text-2xl font-semibold text-signal-amber">₹{totalCost.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {fuelForm && (
        <Modal onClose={() => setFuelForm(null)} title="Log Fuel">
          <form onSubmit={submitFuel} className="space-y-3">
            <Field label="Vehicle">
              <select className="field" value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Field>
            <Field label="Date"><input className="field" type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} /></Field>
            <Field label="Liters"><input className="field" type="number" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} required /></Field>
            <Field label="Cost (₹)"><input className="field" type="number" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} required /></Field>
            <button type="submit" className="btn-primary w-full">Save Fuel Log</button>
          </form>
        </Modal>
      )}

      {expForm && (
        <Modal onClose={() => setExpForm(null)} title="Add Expense">
          <form onSubmit={submitExpense} className="space-y-3">
            <Field label="Trip">
              <select className="field" value={expForm.tripId} onChange={(e) => setExpForm({ ...expForm, tripId: e.target.value })}>
                {trips.map((t) => <option key={t.id} value={t.id}>{t.tripNo}</option>)}
              </select>
            </Field>
            <Field label="Vehicle">
              <select className="field" value={expForm.vehicleId} onChange={(e) => setExpForm({ ...expForm, vehicleId: e.target.value })}>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Toll (₹)"><input className="field" type="number" value={expForm.toll} onChange={(e) => setExpForm({ ...expForm, toll: e.target.value })} /></Field>
              <Field label="Other (₹)"><input className="field" type="number" value={expForm.misc} onChange={(e) => setExpForm({ ...expForm, misc: e.target.value })} /></Field>
            </div>
            <button type="submit" className="btn-primary w-full">Save Expense</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="field-label">{label}</label>{children}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="panel p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display font-semibold text-ink-100 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  if (!status) return <span className="text-ink-600">—</span>;
  const map = { Completed: 'text-signal-green', Dispatched: 'text-signal-blue', Draft: 'text-ink-400', Cancelled: 'text-signal-red' };
  return <span className={`text-xs font-medium ${map[status] || 'text-ink-400'}`}>{status}</span>;
}
