// Central place for every mandatory business rule in the brief (section 4).
// Every one of these returns either null (valid) or a human-readable error string.

export function isLicenseExpired(driver, today = new Date()) {
  return new Date(driver.licenseExpiry) < today;
}

export function validateUniqueRegNo(vehicles, regNo, ignoreId = null) {
  const clash = vehicles.some(
    (v) => v.id !== ignoreId && v.regNo.trim().toLowerCase() === regNo.trim().toLowerCase()
  );
  return clash ? 'Registration number must be unique — this one is already registered.' : null;
}

export function dispatchableVehicles(vehicles) {
  // Retired or In Shop vehicles must never appear in the dispatch selection.
  return vehicles.filter((v) => v.status === 'Available');
}

export function dispatchableDrivers(drivers) {
  // Drivers with expired licenses or Suspended status cannot be assigned.
  return drivers.filter((d) => d.status === 'Available' && !isLicenseExpired(d));
}

export function validateTripDraft({ source, destination, vehicle, driver, cargoWeight, plannedDistance }) {
  if (!source || !destination) return 'Source and destination are required.';
  if (!vehicle) return 'Select an available vehicle.';
  if (!driver) return 'Select an available driver.';
  if (vehicle.status !== 'Available') return `${vehicle.name} is not Available and cannot be dispatched.`;
  if (driver.status !== 'Available') return `${driver.name} is not Available and cannot be assigned.`;
  if (isLicenseExpired(driver)) return `${driver.name}'s license expired on ${driver.licenseExpiry} — cannot be assigned.`;
  const weight = Number(cargoWeight);
  if (!weight || weight <= 0) return 'Enter a valid cargo weight.';
  if (weight > vehicle.capacityKg) {
    return `Cargo weight exceeds ${vehicle.name}'s capacity of ${vehicle.capacityKg} kg by ${weight - vehicle.capacityKg} kg — dispatch blocked.`;
  }
  const distance = Number(plannedDistance);
  if (!distance || distance <= 0) return 'Enter a valid planned distance.';
  return null;
}

export function fuelEfficiency(distance, liters) {
  if (!liters) return 0;
  return distance / liters;
}

export function vehicleOperationalCost(vehicleId, fuelLogs, maintenanceLogs) {
  const fuel = fuelLogs.filter((f) => f.vehicleId === vehicleId).reduce((s, f) => s + Number(f.cost), 0);
  const maint = maintenanceLogs.filter((m) => m.vehicleId === vehicleId).reduce((s, m) => s + Number(m.cost), 0);
  return fuel + maint;
}

export function vehicleROI(vehicle, fuelLogs, maintenanceLogs) {
  const cost = vehicleOperationalCost(vehicle.id, fuelLogs, maintenanceLogs);
  const revenue = Number(vehicle.revenue || 0);
  if (!vehicle.acquisitionCost) return 0;
  return ((revenue - cost) / vehicle.acquisitionCost) * 100;
}
