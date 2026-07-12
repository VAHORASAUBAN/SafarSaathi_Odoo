export default function StatCard({ label, value, accent = 'amber', suffix = '' }) {
  const accentMap = {
    amber: 'border-l-signal-amber',
    green: 'border-l-signal-green',
    blue: 'border-l-signal-blue',
    red: 'border-l-signal-red',
  };
  return (
    <div className={`panel border-l-4 ${accentMap[accent]} px-4 py-3 flex-1 min-w-[140px]`}>
      <div className="label-eyebrow mb-1.5">{label}</div>
      <div className="font-display text-2xl font-semibold text-ink-100">
        {value}
        {suffix && <span className="text-base text-ink-500 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
