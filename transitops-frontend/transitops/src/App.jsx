import { Routes, Route } from 'react-router-dom';
import { RequireAuth, RequireModule } from './components/Guards';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />

      <Route
        path="/fleet"
        element={
          <RequireAuth>
            <RequireModule module="fleet">{(level) => <Fleet readOnly={level === 'view'} />}</RequireModule>
          </RequireAuth>
        }
      />
      <Route
        path="/drivers"
        element={
          <RequireAuth>
            <RequireModule module="drivers">{(level) => <Drivers readOnly={level === 'view'} />}</RequireModule>
          </RequireAuth>
        }
      />
      <Route
        path="/trips"
        element={
          <RequireAuth>
            <RequireModule module="trips">{(level) => <Trips readOnly={level === 'view'} />}</RequireModule>
          </RequireAuth>
        }
      />
      <Route
        path="/maintenance"
        element={
          <RequireAuth>
            <RequireModule module="maintenance">{(level) => <Maintenance readOnly={level === 'view'} />}</RequireModule>
          </RequireAuth>
        }
      />
      <Route
        path="/fuel-expenses"
        element={
          <RequireAuth>
            <RequireModule module="fuel">{(level) => <FuelExpenses readOnly={level === 'view'} />}</RequireModule>
          </RequireAuth>
        }
      />
      <Route
        path="/analytics"
        element={
          <RequireAuth>
            <RequireModule module="analytics">{() => <Analytics />}</RequireModule>
          </RequireAuth>
        }
      />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
    </Routes>
  );
}
