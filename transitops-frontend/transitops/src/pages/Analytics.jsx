import { useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import { fuelEfficiency, vehicleOperationalCost, vehicleROI } from '../utils/businessRules';

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

export default function Analytics() {
  const { vehicles, trips, fuelLogs, maintenance } = useData();

  const completedTrips = trips.filter((t) => t.status === 'Completed');
  const totalDistance = completedTrips.reduce((s, t) => s + (t.plannedDistance || 0), 0);
  const totalFuel = completedTrips.reduce((s, t) => s + (t.fuelConsumedL || 0), 0);
  const avgEfficiency = fuelEfficiency(totalDistance, totalFuel).toFixed(1);

  const utilization = vehicles.length
    ? Math.round((vehicles.filter((v) => v.status !== 'Retired').length / vehicles.length) * 100)
    : 0;

  const totalOpCost = vehicles.reduce((s, v) => s + vehicleOperationalCost(v.id, fuelLogs, maintenance), 0);

  const avgROI = vehicles.length
    ? (vehicles.reduce((s, v) => s + vehicleROI(v, fuelLogs, maintenance), 0) / vehicles.length).toFixed(1)
    : 0;

  const monthlyRevenue = useMemo(
    () => MONTHS.map((m, i) => ({ month: m, revenue: 60000 + i * 8000 + (i % 2 === 0 ? 14000 : -6000) })),
    []
  );

  const costliest = useMemo(
    () =>
      vehicles
        .map((v) => ({ name: v.name, cost: vehicleOperationalCost(v.id, fuelLogs, maintenance) }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 3),
    [vehicles, fuelLogs, maintenance]
  );
  const maxCost = Math.max(...costliest.map((c) => c.cost), 1);
  const costColors = ['bg-signal-red', 'bg-signal-amber', 'bg-signal-blue'];

  function exportCsv() {
    const rows = [
      ['Vehicle', 'Reg No', 'Status', 'Operational Cost', 'ROI %'],
      ...vehicles.map((v) => [v.name, v.regNo, v.status, vehicleOperationalCost(v.id, fuelLogs, maintenance), vehicleROI(v, fuelLogs, maintenance).toFixed(1)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transitops-analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100">Reports & Analytics</h1>
          <p className="text-sm text-ink-500">Fleet performance and cost intelligence</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary flex items-center gap-1.5">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <StatCard label="Fuel Efficiency" value={avgEfficiency} suffix="km/L" accent="blue" />
        <StatCard label="Fleet Utilization" value={utilization} suffix="%" accent="green" />
        <StatCard label="Operational Cost" value={`₹${totalOpCost.toLocaleString()}`} accent="amber" />
        <StatCard label="Vehicle ROI" value={avgROI} suffix="%" accent="green" />
      </div>
      <p className="text-[11px] text-ink-600 font-mono -mt-3">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost</p>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 panel p-4">
          <div className="label-eyebrow mb-3">Monthly Revenue</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2530" vertical={false} />
              <XAxis dataKey="month" stroke="#6B7385" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#131720', border: '1px solid #1F2530', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#C4CAD6' }}
                formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#4C8FE0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-4">
          <div className="label-eyebrow mb-3">Top Costliest Vehicles</div>
          <div className="space-y-3 mt-2">
            {costliest.map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-300">{c.name}</span>
                  <span className="text-ink-500 font-mono">₹{c.cost.toLocaleString()}</span>
                </div>
                <div className="h-2.5 rounded-full bg-base-800 overflow-hidden">
                  <div className={`h-full ${costColors[i]}`} style={{ width: `${(c.cost / maxCost) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
