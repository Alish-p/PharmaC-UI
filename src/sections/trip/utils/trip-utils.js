// Utility functions related to Trip domain

// Calculate total kilometers for a trip using trip-level odometer only.
// 1) Trip-level odometer: endKm - startKm (if both are valid numbers)
// Always clamp to 0 when result is negative or invalid.
export const getTripTotalKm = (trip) => {
  if (!trip) return 0;

  const startKm = Number(trip?.startKm);
  const endKm = Number(trip?.endKm);

  if (Number.isFinite(startKm) && Number.isFinite(endKm)) {
    const diff = endKm - startKm;
    return diff > 0 ? diff : 0;
  }
  return 0;
};
