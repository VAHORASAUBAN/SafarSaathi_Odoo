import { createContext, useContext, useEffect, useState } from 'react';
import { USERS, PERMISSIONS } from '../data/seed';

const AuthContext = createContext(null);
const MAX_ATTEMPTS = 5;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops.session');
    return saved ? JSON.parse(saved) : null;
  });
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('transitops.session', JSON.stringify(user));
    else localStorage.removeItem('transitops.session');
  }, [user]);

  function login(email, password, role) {
    if (locked) return { ok: false, error: 'Account locked after 5 failed attempts. Refresh to reset (demo).' };
    const match = USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password && u.role === role
    );
    if (!match) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLocked(true);
        return { ok: false, error: 'Invalid credentials. Account locked after 5 failed attempts.' };
      }
      return { ok: false, error: `Invalid credentials, or role does not match this account. ${MAX_ATTEMPTS - next} attempt(s) left.` };
    }
    setAttempts(0);
    setUser(match);
    return { ok: true };
  }

  function logout() {
    setUser(null);
  }

  function can(module) {
    // returns 'full' | 'view' | 'none'
    if (!user) return 'none';
    return PERMISSIONS[user.role]?.[module] || 'none';
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, can, locked, attempts, maxAttempts: MAX_ATTEMPTS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
