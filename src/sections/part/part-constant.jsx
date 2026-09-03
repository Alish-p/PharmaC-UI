export const PART_CATEGORIES = [
  'Belts',
  'Brakes',
  'Clutch',
  'Electrical',
  'Engine',
  'Filters',
  'Fluids',
  'Miscellaneous',
  'Suspension',
  'Tires',
  'Transmission',
];

export const PART_MANUFACTURERS = [
  'Apollo',
  'Ashok Leyland',
  'Bosch',
  'Castrol',
  'Cummins',
  'Delphi',
  'Denso',
  'Exide',
  'JK Tyre',
  'Mahindra',
  'MRF',
  'Tata',
];

export const MEASUREMENT_UNIT_GROUPS = [
  {
    label: 'Quantity',
    options: ['Piece', 'Set'],
  },
  {
    label: 'Weight',
    options: ['Kilogram', 'Gram'],
  },
  {
    label: 'Volume',
    options: ['Litre', 'Millilitre'],
  },
  {
    label: 'Length',
    options: ['Meter', 'Centimeter', 'Feet'],
  },
];

export const ALLOWED_MEASUREMENT_UNITS = [
  'Piece',
  'Set',
  'Kilogram',
  'Gram',
  'Litre',
  'Millilitre',
  'Meter',
  'Centimeter',
  'Feet',
];

export const ACTIVITY_TYPES = [
  { value: 'INITIAL', label: 'Initial', color: 'info' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Adjustment', color: 'warning' },
  { value: 'TRANSFER_IN', label: 'Transfer IN', color: 'success' },
  { value: 'TRANSFER_OUT', label: 'Transfer Out', color: 'error' },
  { value: 'WORK_ORDER_ISSUE', label: 'Work Order Issue', color: 'secondary' },
  { value: 'PURCHASE_RECEIPT', label: 'Purchase Receipt', color: 'primary' },
];
