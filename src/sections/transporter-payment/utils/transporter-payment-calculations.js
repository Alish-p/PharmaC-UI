import { fNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';

export const calculateTaxBreakup = (transporter, totalAmountBeforeTax) => {
  const taxRate = CONFIG.transporterInvoiceTax || 9;
  const tdsRate = transporter?.tdsPercentage || 0;
  const tdsAmount = (totalAmountBeforeTax * tdsRate) / 100;

  if (!transporter?.gstEnabled) {
    return {
      cgst: { rate: 0, amount: 0 },
      sgst: { rate: 0, amount: 0 },
      igst: { rate: 0, amount: 0 },
      tds: { rate: tdsRate, amount: tdsAmount },
      totalTax: tdsAmount,
    };
  }

  const isIntraState = transporter.state?.toLowerCase() === 'karnataka';

  if (isIntraState) {
    const taxAmount = (totalAmountBeforeTax * taxRate) / 100;
    return {
      cgst: { rate: taxRate, amount: taxAmount },
      sgst: { rate: taxRate, amount: taxAmount },
      igst: { rate: 0, amount: 0 },
      tds: { rate: tdsRate, amount: tdsAmount },
      totalTax: tdsAmount, // shall not deduct GST in net total under GST reverse mechanism
    };
  }
  const igstRate = 2 * taxRate;
  const igstAmount = (totalAmountBeforeTax * igstRate) / 100;
  return {
    cgst: { rate: 0, amount: 0 },
    sgst: { rate: 0, amount: 0 },
    igst: { rate: igstRate, amount: igstAmount },
    tds: { rate: tdsRate, amount: tdsAmount },
    totalTax: tdsAmount, // shall not deduct GST in net total under GST reverse mechanism
  };
};

export const calculateTransporterPayment = (subtrip) => {
  if (!subtrip) return null;

  const freightDetails = subtrip.freightDetails || {};
  const commissionDetails = subtrip.commissionDetails || {};

  const grossFreightAmount = freightDetails.freightAmount || 0;

  const commissionAmount = commissionDetails.commissionAmount || 0;

  // 🚛 Total Freight (gross freight - transporter commission)
  const totalFreightAmount = grossFreightAmount - commissionAmount;

  let effectiveFreightRate = 0;
  if (freightDetails.freightModel === 'fixed') {
    effectiveFreightRate = (freightDetails.freightAmount || 0) - commissionAmount;
  } else {
    effectiveFreightRate = freightDetails.rate
      ? freightDetails.rate - (commissionDetails.commissionRate || 0)
      : 0;
  }

  // ⛽ Total Deductions (advances for market vehicles, expenses for own)
  const deductionSource =
    Array.isArray(subtrip.advances) && subtrip.advances.length > 0
      ? subtrip.advances
      : Array.isArray(subtrip.expenses)
        ? subtrip.expenses
        : [];
  const totalExpense = deductionSource.reduce((acc, item) => acc + (item.amount || 0), 0);

  // 📉 Shortage Deduction
  const totalShortageAmount = subtrip.shortageAmount || 0;

  // 💰 Final Payment to Transporter
  const totalTransporterPayment = totalFreightAmount - totalExpense - totalShortageAmount;

  return {
    effectiveFreightRate,
    totalFreightAmount,
    totalExpense,
    totalShortageAmount,
    totalTransporterPayment,
  };
};

export const calculateTransporterPaymentSummary = (
  subtrips,
  transporter,
  additionalCharges = []
) => {
  let totalFreightAmount = 0;
  let totalExpense = 0;
  let totalShortageAmount = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const subtrip of subtrips) {
    const {
      totalFreightAmount: freight,
      totalExpense: expense,
      totalShortageAmount: shortage,
    } = calculateTransporterPayment(subtrip);
    totalFreightAmount += freight;
    totalExpense += expense;
    totalShortageAmount += shortage;
  }

  const preTaxIncome = totalFreightAmount - totalExpense - totalShortageAmount;
  const taxBreakup = calculateTaxBreakup(transporter, totalFreightAmount);
  const totalTax = taxBreakup.totalTax || 0;
  const totalAdditionalCharges = additionalCharges.reduce((acc, ch) => acc + ch.amount, 0);
  const netIncome = preTaxIncome - totalTax + totalAdditionalCharges;

  return {
    totalFreightAmount,
    totalExpense,
    totalShortageAmount,
    totalTripWiseIncome: preTaxIncome,
    totalTax,
    totalAdditionalCharges,
    netIncome,
    taxBreakup,
  };
};

export const fEffectiveTransporterRate = (st) => {
  const freightDetails = st.freightDetails || {};
  const freightModel = freightDetails.freightModel || 'per_ton';
  const rate = freightDetails.rate || 0;
  const commissionDetails = st.commissionDetails || {};
  const commissionRate = commissionDetails.commissionRate || 0;

  if (freightModel === 'per_ton') {
    const effRate = rate - commissionRate;
    return `${fNumber(effRate)} ₹ / Ton`;
  }

  if (freightModel === 'per_kl') {
    const effRate = rate - commissionRate;
    return `${fNumber(effRate)} ₹ / KL`;
  }

  // For rest, show freight amount - commission amount (fixed)
  const freightAmount = freightDetails.freightAmount || st.freightAmount || 0;
  const commissionAmount = commissionDetails.commissionAmount || 0;
  const netFreightAmount = freightAmount - commissionAmount;
  return `Fixed (${fNumber(netFreightAmount)} ₹)`;
};
