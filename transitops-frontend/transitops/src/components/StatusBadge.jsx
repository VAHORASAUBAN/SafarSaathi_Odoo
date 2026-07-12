const STATUS_STYLES = {
  // Vehicle / general
  Available: 'bg-signal-green/15 text-signal-green border border-signal-green/30',
  'On Trip': 'bg-signal-blue/15 text-signal-blue border border-signal-blue/30',
  'In Shop': 'bg-signal-amber/15 text-signal-amber border border-signal-amber/30',
  Retired: 'bg-signal-red/15 text-signal-red border border-signal-red/30',
  // Driver
  'Off Duty': 'bg-base-600/40 text-ink-300 border border-base-500/50',
  Suspended: 'bg-signal-red/15 text-signal-red border border-signal-red/30',
  // Trip
  Draft: 'bg-base-600/40 text-ink-300 border border-base-500/50',
  Dispatched: 'bg-signal-blue/15 text-signal-blue border border-signal-blue/30',
  Completed: 'bg-signal-green/15 text-signal-green border border-signal-green/30',
  Cancelled: 'bg-signal-red/15 text-signal-red border border-signal-red/30',
  // Maintenance
  Active: 'bg-signal-amber/15 text-signal-amber border border-signal-amber/30',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-base-600/40 text-ink-300 border border-base-500/50';
  return <span className={`badge ${cls}`}>{status}</span>;
}
