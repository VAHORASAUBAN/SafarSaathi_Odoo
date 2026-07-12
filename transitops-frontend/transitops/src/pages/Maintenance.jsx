import { useState } from 'react';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';

const SERVICE_TYPES = ['Oil Change', 'Tyre Replace', 'Engine Repair', 'Brake Service', 'General Inspection'];

export default function Maintenance({ readOnly }) {
  const { vehicles, maintenance, addMaintenance, closeMaintenance } = useData();
  const [form, setForm] = useState({ vehicleId: '', serviceType: SERVICE_TYPES[0], cost: '', date: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState('');

  // vehicles eligible for a new maintenance record: not already In Shop, not Retired
  const eligible = vehicles.filter((v) => v.status !== 'In Shop' && v.status !== 'Retired');

  function submit(e) {
    e.preventDefault();
    if (!form.vehicleId || !form.cost) { setError('Select a vehicle and enter a cost.'); return; }
    addMaintenance({ vehicleId: form.vehicleId, serviceType: form.serviceType, cost: Number(form.cost), date: form.date });
    setForm({ vehicleId: '', serviceType: SERVICE_TYPES[0], cost: '', date: new Date().toISOString().slice(0, 10) });
    setError('');
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Maintenance</h1>
        <p className="text-sm text-ink-500">{readOnly ? 'View only for your role' : 'Log service records — active records take vehicles off the dispatch pool'}</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {!readOnly && (
          <div className="panel p-5">
            <div className="label-eyebrow mb-3">Log Service Record</div>
            {error && <div className="mb-3 text-xs text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-md px-3 py-2">{error}</div>}
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="field-label">Vehicle</label>
                <select className="field" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">Select vehicle…</option>
                  {eligible.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Service Type</label>
                <select className="field" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                  {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Cost (₹)</label>
                  <input className="field" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label">Date</label>
                  <input className="field" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Save</button>
            </form>

            <div className="mt-5 space-y-1.5">
              {['Available', 'In Shop'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs text-ink-500">
                  <span className={s === 'Available' ? 'text-signal-green' : 'text-signal-amber'}>{s}</span>
                  <div className="flex-1 h-px bg-base-700" />
                  <span>{i === 0 ? 'In Shop' : 'Available'}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-ink-600 font-mono mt-2">Note: In Shop vehicles are removed from the dispatch pool.</p>
          </div>
        )}

        <div className={`panel p-4 ${readOnly ? 'col-span-2' : ''}`}>
          <div className="label-eyebrow mb-3">Service Log</div>
          <table className="data-table">
            <thead>
              <tr><th>Vehicle</th><th>Service</th><th>Cost</th><th>Date</th><th>Status</th>{!readOnly && <th></th>}</tr>
            </thead>
            <tbody>
              {maintenance.slice().reverse().map((m) => {
                const v = vehicles.find((x) => x.id === m.vehicleId);
                return (
                  <tr key={m.id}>
                    <td className="text-ink-100">{v?.name || '—'}</td>
                    <td>{m.serviceType}</td>
                    <td>₹{m.cost.toLocaleString()}</td>
                    <td>{m.date}</td>
                    <td><StatusBadge status={m.status} /></td>
                    {!readOnly && (
                      <td>
                        {m.status === 'Active' && (
                          <button className="btn-ghost text-xs" onClick={() => closeMaintenance(m.id)}>Close</button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
