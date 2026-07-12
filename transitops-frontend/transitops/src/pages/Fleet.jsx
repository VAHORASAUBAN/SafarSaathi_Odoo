import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import { VEHICLE_TYPES, VEHICLE_STATUSES } from '../data/seed';
import { validateUniqueRegNo } from '../utils/businessRules';

const empty = { regNo: '', name: '', type: 'Van', capacityKg: '', odometer: '', acquisitionCost: '' };

export default function Fleet({ readOnly }) {
  const { vehicles, addVehicle } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (typeFilter === 'All' || v.type === typeFilter) &&
          (statusFilter === 'All' || v.status === statusFilter) &&
          (v.regNo.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [vehicles, search, typeFilter, statusFilter]
  );

  function submit(e) {
    e.preventDefault();
    const dupe = validateUniqueRegNo(vehicles, form.regNo);
    if (dupe) { setError(dupe); return; }
    if (!form.name || !form.capacityKg) { setError('Name and capacity are required.'); return; }
    addVehicle({
      regNo: form.regNo.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      capacityKg: Number(form.capacityKg),
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost) || 0,
      revenue: 0,
    });
    setForm(null);
    setError('');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100">Vehicle Registry</h1>
          <p className="text-sm text-ink-500">Master list of fleet assets{readOnly ? ' — view only for your role' : ''}</p>
        </div>
        {!readOnly && (
          <button className="btn-primary flex items-center gap-1.5" onClick={() => { setForm(empty); setError(''); }}>
            <Plus size={15} /> Add Vehicle
          </button>
        )}
      </div>

      <div className="panel p-3 flex flex-wrap gap-3 items-center">
        <input className="field w-56" placeholder="Search reg. no or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="field w-36" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option>All</option>
          {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="field w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          {VEHICLE_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel p-4">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reg. No (unique)</th><th>Name/Model</th><th>Type</th><th>Capacity</th>
              <th>Odometer</th><th>Acq. Cost</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td className="font-mono text-ink-100">{v.regNo}</td>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.capacityKg.toLocaleString()} kg</td>
                <td>{v.odometer.toLocaleString()}</td>
                <td>₹{v.acquisitionCost.toLocaleString()}</td>
                <td><StatusBadge status={v.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-ink-600 py-6">No vehicles match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setForm(null)}>
          <div className="panel p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-semibold text-ink-100 mb-4">Add Vehicle</h2>
            {error && <div className="mb-3 text-xs text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-md px-3 py-2">{error}</div>}
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="field-label">Registration No. (unique)</label>
                <input className="field" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Name / Model</label>
                <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Type</label>
                  <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Max Load (kg)</label>
                  <input className="field" type="number" value={form.capacityKg} onChange={(e) => setForm({ ...form, capacityKg: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Odometer</label>
                  <input className="field" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Acquisition Cost (₹)</label>
                  <input className="field" type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Save Vehicle</button>
                <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
