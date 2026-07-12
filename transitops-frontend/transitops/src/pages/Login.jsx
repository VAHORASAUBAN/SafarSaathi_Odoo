import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route as RouteIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES, USERS } from '../data/seed';

export default function Login() {
  const { login, locked } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const res = login(email, password, role);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate('/');
  }

  function fillDemo(u) {
    setEmail(u.email);
    setPassword(u.password);
    setRole(u.role);
    setError('');
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-md bg-signal-amber flex items-center justify-center">
            <RouteIcon size={18} className="text-base-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">TransitOps</span>
        </div>

        <div className="panel p-7">
          <h1 className="font-display text-lg font-semibold text-ink-100 mb-1">Sign in to your account</h1>
          <p className="text-sm text-ink-500 mb-6">Enter your credentials to continue</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-signal-red/10 border border-signal-red/30 text-signal-red text-xs rounded-md px-3 py-2.5">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@transitops.in"
                required
                disabled={locked}
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={locked}
              />
            </div>
            <div>
              <label className="field-label">Role (RBAC)</label>
              <select className="field" value={role} onChange={(e) => setRole(e.target.value)} disabled={locked}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={locked}>
              {locked ? 'Account locked' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="panel p-4 mt-4">
          <div className="label-eyebrow mb-2">Demo accounts — one login, four roles</div>
          <div className="grid grid-cols-2 gap-2">
            {USERS.map((u) => (
              <button
                key={u.email}
                onClick={() => fillDemo(u)}
                className="text-left text-xs bg-base-850 hover:bg-base-800 border border-base-600 rounded-md px-2.5 py-2 transition-colors"
              >
                <div className="text-ink-100 font-medium">{u.role}</div>
                <div className="text-ink-600 font-mono">{u.email}</div>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-600 mt-3 font-mono">password for every demo account: demo1234</p>
        </div>
      </div>
    </div>
  );
}
