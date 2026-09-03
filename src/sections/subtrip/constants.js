export const SUBTRIP_STATUS_COLORS = {
  'in-queue': 'warning',
  loaded: 'info',
  received: 'primary',
  error: 'error',
  closed: 'secondary',
  billed: 'success',
  cancelled: 'error',
};

export const SUBTRIP_STATUS = {
  IN_QUEUE: 'in-queue', // When the consignment is created and assigned a vehicle, waiting for loading
  LOADED: 'loaded', // When the vehicle is fully loaded and has left for delivery
  ERROR: 'error', // When there is a problem with documents or other issues
  RECEIVED: 'received', // When the consignment is successfully received at the destination
  BILLED: 'billed', // When the invoice is generated but pending payment
  CANCELLED: 'cancelled', // When the subtrip is cancelled/deleted
};

export const DRIVER_ADVANCE_GIVEN_BY_OPTIONS = {
  SELF: 'Self',
  FUEL_PUMP: 'Fuel Pump',
};

export const FREIGHT_MODEL_OPTIONS = [
  { value: 'per_ton', label: 'Per Ton' },
  { value: 'per_kl', label: 'Per KL' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'per_km', label: 'Per KM' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'hybrid', label: 'Hybrid' },
];
