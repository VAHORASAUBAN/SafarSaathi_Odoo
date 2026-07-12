import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { VEHICLE_TYPES } from '../data/seed';

export default function Dashboard() {
  const { vehicles, drivers, trips } = useData();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => (typeFilter === 'All' || v.type === typeFilter) && (statusFilter === 'All' || v.status === statusFilter)
      ),
    [vehicles, typeFilter, statusFilter]
  );

  const kpis = useMemo(() => {
    const active = filteredVehicles.filter((v) => v.status !== 'Retired').length;
    const available = filteredVehicles.filter((v) => v.status === 'Available').length;
    const inShop = filteredVehicles.filter((v) => v.status === 'In Shop').length;
    const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
    const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
    const onDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length;
    const utilization = filteredVehicles.length
      ? Math.round((filteredVehicles.filter((v) => v.status !== 'Retired').length / filteredVehicles.length) * 100)
      : 0;
    return { active, available, inShop, activeTrips, pendingTrips, onDuty, utilization };
  }, [filteredVehicles, trips, drivers]);

  const statusCounts = ['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => ({
    status: s,
    count: vehicles.filter((v) => v.status === s).length,
  }));
  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);
  const barColor = { Available: 'bg-signal-green', 'On Trip': 'bg-signal-blue', 'In Shop': 'bg-signal-amber', Retired: 'bg-signal-red' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Dashboard</h1>
        <p className="text-sm text-ink-500">Fleet-wide operational snapshot</p>
      </div>

      <div className="panel p-3 flex flex-wrap gap-3 items-center">
        <span className="label-eyebrow">Filters</span>
        <select className="field w-40" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option>All</option>
          {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="field w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          {['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-4">
        <StatCard label="Active Vehicles" value={kpis.active} accent="green" />
        <StatCard label="Available Vehicles" value={kpis.available} accent="blue" />
        <StatCard label="Vehicles in Maintenance" value={kpis.inShop} accent="amber" />
        <StatCard label="Active Trips" value={kpis.activeTrips} accent="blue" />
        <StatCard label="Pending Trips" value={kpis.pendingTrips} accent="amber" />
        <StatCard label="Drivers On Duty" value={kpis.onDuty} accent="green" />
        <StatCard label="Fleet Utilization" value={kpis.utilization} suffix="%" accent="amber" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 panel p-4">
          <div className="label-eyebrow mb-3">Recent Trips</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip</th><th>Vehicle</th><th>Driver</th><th>Status</th><th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {trips.slice().reverse().slice(0, 6).map((t) => {
                const v = vehicles.find((x) => x.id === t.vehicleId);
                const d = drivers.find((x) => x.id === t.driverId);
                return (
                  <tr key={t.id}>
                    <td className="font-mono text-ink-100">{t.tripNo}</td>
                    <td>{v?.name || '—'}</td>
                    <td>{d?.name || '—'}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{t.plannedDistance ? `${t.plannedDistance} km` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="panel p-4">
          <div className="label-eyebrow mb-3">Vehicle Status</div>
          <div className="space-y-3">
            {statusCounts.map(({ status, count }) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-300">{status}</span>
                  <span className="text-ink-500 font-mono">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-base-800 overflow-hidden">
                  <div className={`h-full ${barColor[status]}`} style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
