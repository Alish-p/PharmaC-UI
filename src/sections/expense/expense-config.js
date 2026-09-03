import { useTenant } from 'src/query/use-tenant';

export const DEFAULT_SUBTRIP_EXPENSE_TYPES = [
  { label: 'Diesel', icon: 'mdi:gas-station' },
  { label: 'Adblue', icon: 'mdi:water' },
  { label: 'Trip Advance', icon: 'mdi:cash-fast' },
  { label: 'Driver Salary', icon: 'mdi:wallet' },
  { label: 'Extra Advance', icon: 'mdi:cash-plus' },
  { label: 'Bhatta', icon: 'mdi:hand-coin' },
  { label: 'Greasing', icon: 'mdi:oil' },
  { label: 'Excise', icon: 'mdi:receipt-text' },
  { label: 'Tyre Puncture', icon: 'mdi:car-tire-alert' },
  { label: 'Tyre Expense', icon: 'solar:wheel-bold-duotone' },
  { label: 'Police', icon: 'mdi:police-badge' },
  { label: 'RTO', icon: 'mdi:office-building' },
  { label: 'Toll', icon: 'mdi:gate' },
  { label: 'Vehicle Repair', icon: 'mdi:car-wrench' },
  { label: 'Material Damages', icon: 'mdi:package-variant' },
  { label: 'Late Pouch Penalty', icon: 'mdi:clock-alert' },
  { label: 'Other', icon: 'mdi:dots-horizontal' },
];

export const DEFAULT_VEHICLE_EXPENSE_TYPES = [
  { label: 'Work Order', icon: 'mdi:wrench' },
  { label: 'Insurance', icon: 'mdi:shield-check' },
  { label: 'EMI', icon: 'mdi:bank' },
  { label: 'AMC', icon: 'mdi:toolbox' },
  { label: 'Road Tax', icon: 'mdi:highway' },
  { label: 'Permit', icon: 'mdi:badge-account-horizontal' },
  { label: 'Passing', icon: 'mdi:clipboard-check' },
  { label: 'Tyre', icon: 'mdi:car-tire-alert' },
  { label: 'Major Repair', icon: 'mdi:wrench' },
  { label: 'Fitness Certificate', icon: 'mdi:certificate' },
  { label: 'Over-Load Fees', icon: 'mdi:truck-alert' },
  { label: 'Electrical Work', icon: 'mdi:flash' },
  { label: 'Mechanical Work', icon: 'mdi:cog' },
  { label: 'Phata Work', icon: 'mdi:hammer' },
  { label: 'Body Work', icon: 'mdi:car-wrench' },
  { label: 'Minor Engine Work', icon: 'mdi:engine-outline' },
  { label: 'Major Engine Work', icon: 'mdi:engine' },
  { label: 'Outside Garage Expense', icon: 'mdi:garage-variant' },
  { label: 'Showroom Expence', icon: 'mdi:store' },
  { label: 'Other', icon: 'mdi:dots-horizontal' },
];

// Standard set of payment methods for consistency across forms
export const DEFAULT_PAYMENT_METHODS = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Bank Transfer', value: 'Bank Transfer' },
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Debit Card', value: 'Debit Card' },
  { label: 'UPI (Google Pay, PhonePe, Paytm, etc.)', value: 'UPI' },
  { label: 'Cheque', value: 'Cheque' },
  { label: 'Other', value: 'Other' },
];

export function useSubtripExpenseTypes() {
  const { data: tenant } = useTenant();
  const dbTypes = tenant?.config?.expense?.['subtrip-expense-types'];

  if (dbTypes && dbTypes.length > 0) {
    return dbTypes;
  }
  return DEFAULT_SUBTRIP_EXPENSE_TYPES;
}

export function useVehicleExpenseTypes() {
  const { data: tenant } = useTenant();
  const dbTypes = tenant?.config?.expense?.['vehicle-expense-types'];

  if (dbTypes && dbTypes.length > 0) {
    return dbTypes;
  }
  return DEFAULT_VEHICLE_EXPENSE_TYPES;
}

export function usePaymentMethods() {
  return DEFAULT_PAYMENT_METHODS;
}

export const SUBTRIP_EXPENSE_TYPES = {
  DIESEL: 'Diesel',
  ADBLUE: 'Adblue',
  DRIVER_SALARY: 'Driver Salary',
  DRIVER_ADVANCE: 'Trip Advance',
  EXTRA_ADVANCE: 'Extra Advance',
  BHATTA: 'Bhatta',
  TYRE_PUNCHER: 'Tyre Puncture',
  TYRE_EXPENSE: 'Tyre Expense',
  POLICE: 'Police',
  RTO: 'RTO',
  TOLL: 'Toll',
  VEHICLE_REPAIR: 'Vehicle Repair',
  GREASING: 'Greasing',
  EXCISE: 'Excise',
  MATERIAL_DAMAGES: 'Material Damages',
  LATE_POUCH_PENALTY: 'Late Pouch Penalty',
  OTHER: 'Other',
};
