import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings, LogOut, Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, module: null },
  { to: '/fleet', label: 'Fleet', icon: Truck, module: 'fleet' },
  { to: '/drivers', label: 'Drivers', icon: Users, module: 'drivers' },
  { to: '/trips', label: 'Trips', icon: Route, module: 'trips' },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, module: 'maintenance' },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel, module: 'fuel' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, module: 'analytics' },
  { to: '/settings', label: 'Settings', icon: Settings, module: null },
];

export default function Layout({ children }) {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base-950">
      <aside className="w-56 shrink-0 border-r border-base-700 bg-base-900 flex flex-col">
        <div className="px-5 py-5 border-b border-base-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-signal-amber flex items-center justify-center">
              <Route size={16} className="text-base-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">TransitOps</span>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, module }) => {
            const level = module ? can(module) : 'full';
            const disabled = level === 'none';
            return (
              <NavLink
                key={to}
                to={disabled ? '#' : to}
                onClick={(e) => disabled && e.preventDefault()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    disabled
                      ? 'text-ink-600 cursor-not-allowed opacity-50'
                      : isActive
                      ? 'bg-signal-amber/12 text-signal-amber border-l-2 border-signal-amber -ml-[2px] pl-[calc(0.75rem+2px)]'
                      : 'text-ink-300 hover:text-ink-100 hover:bg-base-800'
                  }`
                }
              >
                <Icon size={16} strokeWidth={2} />
                {label}
                {level === 'view' && (
                  <span className="ml-auto text-[9px] uppercase tracking-wide text-ink-600 font-mono">view</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-base-700 text-[11px] text-ink-600 font-mono">
          TransitOps © 2026 · RBAC enabled
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-base-700 bg-base-900/60 flex items-center justify-between px-5 gap-4">
          <div className="relative w-72 max-w-[40%]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
            <input className="field pl-8 py-1.5" placeholder="Search…" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-300">{user?.name}</span>
            <span className="badge bg-signal-blue/15 text-signal-blue border border-signal-blue/30">{user?.role}</span>
            <button onClick={handleLogout} className="btn-ghost flex items-center gap-1.5" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
