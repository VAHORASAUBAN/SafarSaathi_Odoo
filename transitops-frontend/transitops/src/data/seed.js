export const ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

// permission levels: 'full' | 'view' | 'none'
export const PERMISSIONS = {
  'Fleet Manager':    { fleet: 'full', drivers: 'view', trips: 'none', maintenance: 'full', fuel: 'none', analytics: 'none' },
  'Dispatcher':       { fleet: 'view', drivers: 'view', trips: 'full', maintenance: 'none', fuel: 'none', analytics: 'none' },
  'Safety Officer':   { fleet: 'none', drivers: 'full', trips: 'view', maintenance: 'none', fuel: 'none', analytics: 'view' },
  'Financial Analyst':{ fleet: 'view', drivers: 'none', trips: 'none', maintenance: 'view', fuel: 'full', analytics: 'full' },
};

export const USERS = [
  { email: 'fleet@transitops.in', password: 'demo1234', name: 'Rohan K.', role: 'Fleet Manager' },
  { email: 'dispatch@transitops.in', password: 'demo1234', name: 'Priya S.', role: 'Dispatcher' },
  { email: 'safety@transitops.in', password: 'demo1234', name: 'Karan M.', role: 'Safety Officer' },
  { email: 'finance@transitops.in', password: 'demo1234', name: 'Anita D.', role: 'Financial Analyst' },
];

export const VEHICLE_TYPES = ['Van', 'Truck', 'Mini', 'Trailer'];
export const VEHICLE_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];
export const DRIVER_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
export const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export const initialVehicles = [
  { id: 'v1', regNo: 'GJ01AB1234', name: 'VAN-05', type: 'Van', capacityKg: 500, odometer: 14000, acquisitionCost: 620000, status: 'Available', revenue: 186000 },
  { id: 'v2', regNo: 'GJ01AC4491', name: 'TRUCK-11', type: 'Truck', capacityKg: 5000, odometer: 182000, acquisitionCost: 2450000, status: 'On Trip', revenue: 940000 },
  { id: 'v3', regNo: 'GJ01AD8120', name: 'MINI-03', type: 'Mini', capacityKg: 1000, odometer: 66000, acquisitionCost: 410000, status: 'In Shop', revenue: 121000 },
  { id: 'v4', regNo: 'GJ01AB0087', name: 'VAN-09', type: 'Van', capacityKg: 850, odometer: 214000, acquisitionCost: 540000, status: 'Retired', revenue: 205000 },
  { id: 'v5', regNo: 'GJ05CT7712', name: 'TRUCK-04', type: 'Truck', capacityKg: 7000, odometer: 98000, acquisitionCost: 2800000, status: 'Available', revenue: 1120000 },
];

export const initialDrivers = [
  { id: 'd1', name: 'Alex', licenseNo: 'DL-88215', licenseCategory: 'LMV', licenseExpiry: '2028-12-01', contact: '9876500001', safetyScore: 96, status: 'Available' },
  { id: 'd2', name: 'John', licenseNo: 'DL-44120', licenseCategory: 'HMV', licenseExpiry: '2025-03-01', contact: '9722000002', safetyScore: 81, status: 'Suspended' },
  { id: 'd3', name: 'Priya', licenseNo: 'DL-77031', licenseCategory: 'LMV', licenseExpiry: '2027-01-01', contact: '9180000003', safetyScore: 99, status: 'On Trip' },
  { id: 'd4', name: 'Suresh', licenseNo: 'DL-90045', licenseCategory: 'HMV', licenseExpiry: '2027-01-01', contact: '9440000004', safetyScore: 88, status: 'Available' },
];

export const initialTrips = [
  { id: 't1', tripNo: 'TR001', source: 'Ranchhodnagar Depot', destination: 'Ahmedabad Hub', vehicleId: 'v1', driverId: 'd1', cargoWeight: 450, plannedDistance: 45, status: 'Dispatched', dispatchedAt: '2026-07-10T09:15:00' },
  { id: 't2', tripNo: 'TR002', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleId: 'v2', driverId: 'd2', cargoWeight: 3200, plannedDistance: 30, status: 'Completed', finalOdometer: 182150, fuelConsumedL: 40, revenue: 18500 },
  { id: 't3', tripNo: 'TR003', source: 'Maninagar', destination: 'Kalol Depot', vehicleId: 'v3', driverId: 'd4', cargoWeight: 700, plannedDistance: 20, status: 'Cancelled' },
];

export const initialMaintenance = [
  { id: 'm1', vehicleId: 'v3', serviceType: 'Tyre Replace', cost: 6200, date: '2026-07-08', status: 'Active' },
  { id: 'm2', vehicleId: 'v2', serviceType: 'Engine Repair', cost: 18000, date: '2026-07-05', status: 'Completed' },
];

export const initialFuelLogs = [
  { id: 'f1', vehicleId: 'v1', date: '2026-07-05', liters: 42, cost: 3850 },
  { id: 'f2', vehicleId: 'v2', date: '2026-07-06', liters: 110, cost: 8400 },
  { id: 'f3', vehicleId: 'v3', date: '2026-07-06', liters: 28, cost: 2050 },
];

export const initialExpenses = [
  { id: 'e1', tripId: 't1', vehicleId: 'v1', toll: 120, misc: 0, date: '2026-07-05' },
  { id: 'e2', tripId: 't2', vehicleId: 'v2', toll: 340, misc: 150, date: '2026-07-06' },
];

export const initialSettings = {
  depotName: 'Ranchhodnagar Depot',
  currency: 'INR (₹)',
  distanceUnit: 'Kilometers',
};
