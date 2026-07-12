import { createContext, useContext, useState } from 'react';
import {
  initialVehicles, initialDrivers, initialTrips, initialMaintenance,
  initialFuelLogs, initialExpenses, initialSettings,
} from '../data/seed';

const DataContext = createContext(null);

function useStored(key, initial) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });
  const set = (value) => {
    setState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };
  return [state, set];
}

let seq = 100;
const nextId = (prefix) => `${prefix}${seq++}`;

export function DataProvider({ children }) {
  const [vehicles, setVehicles] = useStored('transitops.vehicles', initialVehicles);
  const [drivers, setDrivers] = useStored('transitops.drivers', initialDrivers);
  const [trips, setTrips] = useStored('transitops.trips', initialTrips);
  const [maintenance, setMaintenance] = useStored('transitops.maintenance', initialMaintenance);
  const [fuelLogs, setFuelLogs] = useStored('transitops.fuel', initialFuelLogs);
  const [expenses, setExpenses] = useStored('transitops.expenses', initialExpenses);
  const [settings, setSettings] = useStored('transitops.settings', initialSettings);

  // ---- Vehicles ----
  function addVehicle(v) {
    setVehicles((prev) => [...prev, { ...v, id: nextId('v'), status: 'Available' }]);
  }
  function updateVehicleStatus(id, status) {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  }

  // ---- Drivers ----
  function addDriver(d) {
    setDrivers((prev) => [...prev, { ...d, id: nextId('d'), status: 'Available' }]);
  }
  function updateDriverStatus(id, status) {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }

  // ---- Trips ----
  function createDraftTrip(trip) {
    const id = nextId('t');
    const tripNo = `TR${String(trips.length + 1).padStart(3, '0')}`;
    setTrips((prev) => [...prev, { ...trip, id, tripNo, status: 'Draft' }]);
    return id;
  }

  function dispatchTrip(tripId) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Dispatched', dispatchedAt: new Date().toISOString() } : t)));
    updateVehicleStatus(trip.vehicleId, 'On Trip');
    updateDriverStatus(trip.driverId, 'On Trip');
  }

  function completeTrip(tripId, { finalOdometer, fuelConsumedL, revenue }) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Completed', finalOdometer, fuelConsumedL, revenue } : t)));
    updateVehicleStatus(trip.vehicleId, 'Available');
    updateDriverStatus(trip.driverId, 'Available');
    if (finalOdometer) {
      setVehicles((prev) => prev.map((v) => (v.id === trip.vehicleId ? { ...v, odometer: Number(finalOdometer) } : v)));
    }
    if (fuelConsumedL) {
      setFuelLogs((prev) => [...prev, {
        id: nextId('f'), vehicleId: trip.vehicleId, date: new Date().toISOString().slice(0, 10),
        liters: Number(fuelConsumedL), cost: Math.round(Number(fuelConsumedL) * 90),
      }]);
    }
  }

  function cancelTrip(tripId) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Cancelled' } : t)));
    if (trip.status === 'Dispatched') {
      updateVehicleStatus(trip.vehicleId, 'Available');
      updateDriverStatus(trip.driverId, 'Available');
    }
  }

  // ---- Maintenance ----
  function addMaintenance(record) {
    const id = nextId('m');
    setMaintenance((prev) => [...prev, { ...record, id, status: 'Active' }]);
    updateVehicleStatus(record.vehicleId, 'In Shop');
  }

  function closeMaintenance(id) {
    const record = maintenance.find((m) => m.id === id);
    if (!record) return;
    setMaintenance((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'Completed' } : m)));
    const vehicle = vehicles.find((v) => v.id === record.vehicleId);
    if (vehicle && vehicle.status !== 'Retired') {
      updateVehicleStatus(record.vehicleId, 'Available');
    }
  }

  // ---- Fuel & Expenses ----
  function addFuelLog(log) {
    setFuelLogs((prev) => [...prev, { ...log, id: nextId('f') }]);
  }
  function addExpense(exp) {
    setExpenses((prev) => [...prev, { ...exp, id: nextId('e') }]);
  }

  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  const value = {
    vehicles, drivers, trips, maintenance, fuelLogs, expenses, settings,
    addVehicle, addDriver,
    createDraftTrip, dispatchTrip, completeTrip, cancelTrip,
    addMaintenance, closeMaintenance,
    addFuelLog, addExpense, updateSettings,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
