import { CONFIG } from 'src/config-global';

export const calculateTaxBreakup = (customer) => {
  const taxRate = CONFIG.customerInvoiceTax || 9;

  if (!customer?.gstEnabled) {
    return {
      cgst: 0,
      sgst: 0,
      igst: 0,
    };
  }

  const isIntraState = customer.state?.toLowerCase() === 'karnataka';

  if (isIntraState) {
    return {
      cgst: taxRate,
      sgst: taxRate,
      igst: 0,
    };
  }
  return {
    cgst: 0,
    sgst: 0,
    igst: 2 * taxRate,
  };
};

export const calculateInvoicePerSubtrip = (subtrip) => {
  const freightAmount = subtrip.freightDetails?.freightAmount || 0;
  const shortageAmount = subtrip.shortageAmount || 0;
  const totalAmount = freightAmount; // we just show the shortage amount separately net total is just freight amount

  return {
    freightAmount,
    shortageAmount,
    totalAmount,
  };
};

export const calculateInvoiceSummary = ({
  subtripIds = [],
  customer = null,
  additionalItems = [],
} = {}) => {
  if (!Array.isArray(subtripIds) || subtripIds.length === 0) {
    return {
      freightAmount: 0,
      shortageAmount: 0,
      totalAmount: 0,
      freightWeight: 0,
      shortageWeight: 0,
      totalAdditionalCharges: 0,
      totalAfterTax: 0,
    };
  }

  const taxBreakupRates = calculateTaxBreakup(customer);

  // Calculate totals for each subtrip
  const subtripTotals = subtripIds.map((subtrip) => {
    const { freightAmount, shortageAmount, totalAmount } = calculateInvoicePerSubtrip(subtrip);
    const shortageWeight = subtrip.shortageWeight || 0;

    return {
      freightAmount,
      shortageAmount,
      totalAmount,
      freightWeight: subtrip.loadingWeight || 0,
      shortageWeight,
    };
  });

  // Sum up all totals
  const totalAmountBeforeTax = subtripTotals.reduce((sum, st) => sum + st.totalAmount, 0);
  const totalFreightAmount = subtripTotals.reduce((sum, st) => sum + st.freightAmount, 0);
  const totalShortageAmount = subtripTotals.reduce((sum, st) => sum + st.shortageAmount, 0);
  const totalFreightWt = subtripTotals.reduce((sum, st) => sum + st.freightWeight, 0);
  const totalShortageWt = subtripTotals.reduce((sum, st) => sum + st.shortageWeight, 0);

  // Additional items total
  const totalAdditionalCharges = additionalItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // Calculate tax and final amount based on customer
  const totalTaxRate =
    (taxBreakupRates.cgst || 0) + (taxBreakupRates.sgst || 0) + (taxBreakupRates.igst || 0);
  const taxAmount = (totalAmountBeforeTax * totalTaxRate) / 100;
  const totalAfterTax = totalAmountBeforeTax + taxAmount + totalAdditionalCharges;

  return {
    totalAmountBeforeTax,
    totalFreightAmount,
    totalShortageAmount,
    totalFreightWt,
    totalShortageWt,
    totalAdditionalCharges,
    totalAfterTax,
  };
};
