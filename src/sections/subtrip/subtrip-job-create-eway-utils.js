/**
 * Parses an eWay Bill date string (e.g. "27/10/2025 05:23:00 PM" or "27/10/2025")
 * and returns a standard JavaScript Date object.
 *
 * @param {string} str - The raw date string.
 * @returns {Date|undefined} The parsed Date object or undefined if invalid.
 */
export const parseEwayDate = (str) => {
  if (!str || typeof str !== 'string') return undefined;
  const datePart = str.split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length !== 3) return undefined;
  const [dd, mm, yyyy] = parts.map((p) => Number(p));
  if (!dd || !mm || !yyyy) return undefined;
  return new Date(yyyy, mm - 1, dd);
};

/**
 * Pure function that extracts structured, easy-to-use information from a raw eWay Bill API payload.
 * It does not perform any side effects (no form manipulation, API calls, or state updates).
 *
 * @param {Object} message - The raw eWay Bill payload message.
 * @param {string|number} ewayNo - The eWay Bill number.
 * @param {Array} materialOptions - Predefined material dropdown options.
 * @returns {Object|null} Extracted eWay Bill details or null if no valid message.
 */
export const extractEwayBillDetails = (message, ewayNo, materialOptions = []) => {
  if (!message || typeof message === 'string') return null;

  const vehicleNoFromEwb = message.VehiclListDetails?.[0]?.vehicle_number || undefined;
  const expiryDate = parseEwayDate(message.eway_bill_valid_date);

  const firstItem = Array.isArray(message.itemList) ? message.itemList[0] : undefined;
  const qty = firstItem?.quantity;
  const desc = firstItem?.product_description;

  const consignorAddr1 = (message.address1_of_consignor || '').trim();
  const consignorPlace = (message.place_of_consignor || '').trim();
  const loadingPoint = [consignorAddr1, consignorPlace].filter(Boolean).join(' ');

  const matchedMaterialOpt = desc
    ? materialOptions.find((o) => o?.value === desc || o?.label === desc)
    : undefined;

  return {
    ewayBill: String(message.eway_bill_number ?? ewayNo ?? ''),
    ewayExpiryDate: expiryDate || undefined,
    invoiceNo: message.document_number ? String(message.document_number) : undefined,
    loadingPoint: loadingPoint || undefined,
    unloadingPoint: message.place_of_consignee || undefined,
    consignee: message.legal_name_of_consignee
      ? { label: message.legal_name_of_consignee, value: message.legal_name_of_consignee }
      : undefined,
    loadingWeight: qty,
    quantity: qty,
    materialType: matchedMaterialOpt ? matchedMaterialOpt.value : undefined,
    grade: desc || undefined,
    vehicleNumber: vehicleNoFromEwb,
    consignorGstin: message.gstin_of_consignor || message.userGstin || undefined,
    consignorName: message.legal_name_of_consignor || message.legal_name_of_supply || undefined,
  };
};

/**
 * Validates whether the given eWay Bill number is a valid 12-digit numeric string.
 *
 * @param {string|number} ewayNo - The eWay Bill number to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isEwayBillValid = (ewayNo) => /^\d{12}$/.test(String(ewayNo || '').trim());
