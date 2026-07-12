import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PERMISSIONS, ROLES } from '../data/seed';

const MODULE_LABELS = { fleet: 'Fleet', drivers: 'Drivers', trips: 'Trips', maintenance: 'Maint.', fuel: 'Fuel/Exp', analytics: 'Analytics' };
const LEVEL_MARK = { full: '✓', view: 'view', none: '—' };
const LEVEL_STYLE = { full: 'text-signal-green', view: 'text-signal-blue', none: 'text-ink-600' };

export default function Settings() {
  const { user } = useAuth();
  const { settings, updateSettings } = useData();
  const canEdit = user?.role === 'Fleet Manager';
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  function save(e) {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Settings & RBAC</h1>
        <p className="text-sm text-ink-500">Depot configuration and role-based access control</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="panel p-5">
          <div className="label-eyebrow mb-3">General</div>
          <form onSubmit={save} className="space-y-3">
            <div>
              <label className="field-label">Depot Name</label>
              <input className="field" value={form.depotName} disabled={!canEdit} onChange={(e) => setForm({ ...form, depotName: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Currency</label>
              <input className="field" value={form.currency} disabled={!canEdit} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Distance Unit</label>
              <input className="field" value={form.distanceUnit} disabled={!canEdit} onChange={(e) => setForm({ ...form, distanceUnit: e.target.value })} />
            </div>
            {canEdit ? (
              <button type="submit" className="btn-primary">{saved ? 'Saved ✓' : 'Save changes'}</button>
            ) : (
              <p className="text-xs text-ink-600">Only Fleet Managers can edit depot settings.</p>
            )}
          </form>
        </div>

        <div className="panel p-5">
          <div className="label-eyebrow mb-3">Role-Based Access (RBAC)</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                {Object.values(MODULE_LABELS).map((l) => <th key={l}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} className={role === user?.role ? 'bg-signal-amber/5' : ''}>
                  <td className="text-ink-100 font-medium">{role}</td>
                  {Object.keys(MODULE_LABELS).map((mod) => (
                    <td key={mod} className={`font-mono ${LEVEL_STYLE[PERMISSIONS[role][mod]]}`}>
                      {LEVEL_MARK[PERMISSIONS[role][mod]]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-ink-600 font-mono mt-3">✓ full access · view = read only · — = no access</p>
        </div>
      </div>
    </div>
  );
}
