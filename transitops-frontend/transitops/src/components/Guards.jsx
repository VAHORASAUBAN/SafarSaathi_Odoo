import { Navigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export function RequireModule({ module, children }) {
  const { can } = useAuth();
  const level = can(module);
  if (level === 'none') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="panel px-8 py-10 text-center max-w-sm">
          <ShieldOff size={28} className="mx-auto mb-3 text-signal-red" />
          <div className="font-display font-semibold text-ink-100 mb-1">Access restricted</div>
          <p className="text-sm text-ink-500">
            Your role doesn't have access to this module. Ask a Fleet Manager to update your permissions in Settings.
          </p>
        </div>
      </div>
    );
  }
  return children(level);
}
