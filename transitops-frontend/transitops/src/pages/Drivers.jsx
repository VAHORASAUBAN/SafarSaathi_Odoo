import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import { isLicenseExpired } from '../utils/businessRules';

const empty = { name: '', licenseNo: '', licenseCategory: 'LMV', licenseExpiry: '', contact: '', safetyScore: 90 };

export default function Drivers({ readOnly }) {
  const { drivers, addDriver } = useData();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const filtered = useMemo(
    () => drivers.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNo.toLowerCase().includes(search.toLowerCase())),
    [drivers, search]
  );

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.licenseNo || !form.licenseExpiry) { setError('Name, license number and expiry are required.'); return; }
    addDriver({
      name: form.name.trim(),
      licenseNo: form.licenseNo.trim(),
      licenseCategory: form.licenseCategory,
      licenseExpiry: form.licenseExpiry,
      contact: form.contact.trim(),
      safetyScore: Number(form.safetyScore) || 90,
    });
    setForm(null);
    setError('');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100">Drivers & Safety Profiles</h1>
          <p className="text-sm text-ink-500">{readOnly ? 'View only for your role' : 'License compliance and safety scoring'}</p>
        </div>
        {!readOnly && (
          <button className="btn-primary flex items-center gap-1.5" onClick={() => { setForm(empty); setError(''); }}>
            <Plus size={15} /> Add Driver
          </button>
        )}
      </div>

      <div className="panel p-3">
        <input className="field w-64" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="panel p-4">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th><th>License No.</th><th>Category</th><th>Expiry</th><th>Contact</th><th>Trip Compl.</th><th>Safety</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const expired = isLicenseExpired(d);
              return (
                <tr key={d.id}>
                  <td className="text-ink-100">{d.name}</td>
                  <td className="font-mono">{d.licenseNo}</td>
                  <td>{d.licenseCategory}</td>
                  <td className={expired ? 'text-signal-red font-medium' : ''}>{d.licenseExpiry}{expired ? ' EXPIRED' : ''}</td>
                  <td className="font-mono">{d.contact}</td>
                  <td>{d.safetyScore}%</td>
                  <td>
                    <span className={`badge ${d.safetyScore >= 90 ? 'bg-signal-green/15 text-signal-green border border-signal-green/30' : 'bg-signal-amber/15 text-signal-amber border border-signal-amber/30'}`}>
                      {d.safetyScore}%
                    </span>
                  </td>
                  <td><StatusBadge status={expired && d.status === 'Available' ? 'Suspended' : d.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-ink-600 mt-4 font-mono">
          Rule: Expired license or Suspended status → blocked from trip assignment.
        </p>
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setForm(null)}>
          <div className="panel p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-semibold text-ink-100 mb-4">Add Driver</h2>
            {error && <div className="mb-3 text-xs text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-md px-3 py-2">{error}</div>}
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="field-label">Name</label>
                <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">License No.</label>
                  <input className="field" value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select className="field" value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}>
                    <option>LMV</option><option>HMV</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Expiry Date</label>
                  <input className="field" type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label">Contact</label>
                  <input className="field" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="field-label">Safety Score (%)</label>
                <input className="field" type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Save Driver</button>
                <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
