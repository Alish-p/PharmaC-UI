import dayjs from 'dayjs';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { loadingWeightUnit } from '../vehicle/vehicle-config';
import { DEFAULT_SUBTRIP_EXPENSE_TYPES } from '../expense/expense-config';

export const mapExpensesToChartData = (items, expenseTypes = DEFAULT_SUBTRIP_EXPENSE_TYPES) => {
  if (!Array.isArray(items)) return [];
  const expenseData = expenseTypes.map((type) => {
    const total = items
      .filter((item) => (item.advanceType || item.expenseType) === type.label)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    return { label: type.label, value: total };
  });

  return expenseData;
};

export function fFreightRate(rate, model, freightAmount) {
  if (model === 'fixed') {
    return `Fixed (${fNumber(freightAmount || 0)} ₹)`;
  }
  if (model === 'hybrid') {
    return 'Hybrid';
  }
  if (model === 'per_km') {
    return `${fNumber(rate || 0)} ₹ / KM`;
  }
  if (model === 'per_hour') {
    return `${fNumber(rate || 0)} ₹ / Hr`;
  }
  if (model === 'per_ton') {
    return `${fNumber(rate || 0)} ₹ / Ton`;
  }
  if (model === 'per_kl') {
    return `${fNumber(rate || 0)} ₹ / KL`;
  }
  if (rate !== undefined && rate !== null) {
    return `${fNumber(rate)} ₹`;
  }
  return '-';
}

export const getFreightExplanation = (st, isTransporter = false) => {
  if (!st) return '';

  const freightDetails = st.freightDetails || {};
  const freightModel = freightDetails.freightModel || 'per_ton';
  const rate = freightDetails.rate || 0;
  const loadingWeight = st.loadingWeight || 0;
  const vehicleType = st.vehicleType || st.vehicleId?.vehicleType || '';
  const unit = loadingWeightUnit[vehicleType] || 'Ton';

  let grossExplanation = '';
  let grossAmount = 0;

  if (freightModel === 'per_hour') {
    const { startDate } = st;
    const { endDate } = st;
    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const diffInHours = Math.ceil(end.diff(start, 'hour', true));
      grossAmount = diffInHours * rate;
      grossExplanation = `calculated for ${diffInHours} hour${diffInHours !== 1 ? 's' : ''} at ₹${fNumber(rate)}/hour (job dates: ${dayjs(startDate).format('DD MMM YYYY, hh:mm A')} to ${dayjs(endDate).format('DD MMM YYYY, hh:mm A')})`;
    } else {
      grossAmount = 0;
      grossExplanation = `calculated at ₹${fNumber(rate)}/hour`;
    }
  } else if (freightModel === 'per_km') {
    const startKm = freightDetails.startKm || 0;
    const endKm = Number(freightDetails.endKm || startKm);
    const diffKm = endKm > startKm ? endKm - startKm : 0;
    grossAmount = diffKm * rate;
    if (diffKm > 0) {
      grossExplanation = `calculated for ${diffKm} km at ₹${fNumber(rate)}/km (KM: ${startKm} to ${endKm})`;
    } else {
      grossExplanation = `calculated at ₹${fNumber(rate)}/km`;
    }
  } else if (freightModel === 'hybrid') {
    const startKm = freightDetails.startKm || 0;
    const endKm = Number(freightDetails.endKm || startKm);
    const totalKm = endKm > startKm ? endKm - startKm : 0;
    const baseKm = freightDetails.baseKm || 0;
    const baseFreight = freightDetails.freightAmount || 0;
    const extraKm = totalKm > baseKm ? totalKm - baseKm : 0;
    if (extraKm > 0) {
      grossAmount = baseFreight + extraKm * rate;
      grossExplanation = `calculated using base freight of ₹${fNumber(baseFreight)} (${baseKm} km) + extra ${extraKm} km at ₹${fNumber(rate)}/km`;
    } else {
      grossAmount = baseFreight;
      grossExplanation = `calculated using base freight of ₹${fNumber(baseFreight)} (${baseKm} km)`;
    }
  } else if (freightModel === 'per_ton') {
    grossAmount = loadingWeight * rate;
    grossExplanation = `calculated for loading weight of ${fNumber(loadingWeight)} ${unit} at ₹${fNumber(rate)}/ton`;
  } else if (freightModel === 'fixed') {
    grossAmount = freightDetails.freightAmount || 0;
    grossExplanation = `fixed freight amount of ₹${fNumber(grossAmount)}`;
  } else {
    grossAmount = loadingWeight * rate;
    grossExplanation = `calculated for loading weight of ${fNumber(loadingWeight)} ${unit} at ₹${fNumber(rate)}/ton`;
  }

  if (isTransporter) {
    const commissionAmount = st.commissionDetails?.commissionAmount || st.commissionAmount || 0;
    const netFreight = grossAmount - commissionAmount;

    if (commissionAmount > 0) {
      return `Gross Freight: ${fCurrency(grossAmount)} (${grossExplanation}) - Transporter Commission: ${fCurrency(commissionAmount)} = Net Freight: ${fCurrency(netFreight)}`;
    }
    return `Gross Freight: ${fCurrency(grossAmount)} (${grossExplanation})`;
  }

  return grossExplanation;
};

/**
 * Resolves the weight/volume unit of a subtrip.
 * Returns 'KL' if the freight model is per kilolitre ('per_kl'),
 * otherwise falls back to the unit configured for the vehicle type, defaulting to 'Ton'.
 *
 * @param {object} st - The subtrip object
 * @returns {string} - The weight or volume unit ('Ton' or 'KL')
 */
export const getWeightUnit = (st) => {
  const model = st.freightDetails?.freightModel || st.freightModel;
  if (model === 'per_kl') return 'KL';
  const vehicleType = st.vehicleType || st.vehicleId?.vehicleType;
  return loadingWeightUnit[vehicleType] || 'Ton';
};

/**
 * Aggregates loading weights from multiple subtrips and formats the total grouped by unit.
 * Outputs a comma-separated string of totals (e.g. "10.00 Ton, 5.00 KL").
 * Defaults to "0 Ton" if no weights are found.
 *
 * @param {Array} items - Array of subtrip objects
 * @returns {string} - Formatted total weights by unit
 */
export const calculateTotalWeight = (items) => {
  let tonSum = 0;
  let klSum = 0;
  items?.forEach((st) => {
    const w = Number(st.loadingWeight) || 0;
    const unit = getWeightUnit(st);
    if (unit === 'KL') {
      klSum += w;
    } else {
      tonSum += w;
    }
  });
  const parts = [];
  if (tonSum > 0) parts.push(`${fNumber(tonSum)} Ton`);
  if (klSum > 0) parts.push(`${fNumber(klSum)} KL`);
  return parts.join(', ') || '0 Ton';
};

/**
 * Aggregates shortage weights from multiple subtrips and formats the total grouped by unit.
 * Outputs a comma-separated string of totals (e.g. "10.00 Ton, 5.00 KL").
 * Defaults to "-" if no shortage weights are found.
 *
 * @param {Array} items - Array of subtrip objects
 * @returns {string} - Formatted total shortage weights by unit
 */
export const calculateTotalShortageWeight = (items) => {
  let tonSum = 0;
  let klSum = 0;
  items?.forEach((st) => {
    const w = Number(st.shortageWeight) || 0;
    const unit = getWeightUnit(st);
    if (unit === 'KL') {
      klSum += w;
    } else {
      tonSum += w;
    }
  });
  const parts = [];
  if (tonSum > 0) parts.push(`${fNumber(tonSum)} Ton`);
  if (klSum > 0) parts.push(`${fNumber(klSum)} KL`);
  return parts.join(', ') || '-';
};
