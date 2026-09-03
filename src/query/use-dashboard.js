import { useQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/dashboard';

const getCustomerMonthlyFreight = async (month) => {
  // month should be a string in "YYYY-MM" format
  const { data } = await axios.get(`${ENDPOINT}/customer-monthly-freight`, {
    params: { month },
  });
  return data;
};

const getSubtripsExpiry = async () => {
  const { data } = await axios.get(`${ENDPOINT}/subtrips-expiry`);
  return data;
};

const getSubtripMonthlyData = async (year) => {
  const { data } = await axios.get(`${ENDPOINT}/subtrip-monthly-data`, {
    params: { year },
  });
  return data;
};

const getExpiringDocuments = async () => {
  const { data } = await axios.get(`${ENDPOINT}/expiring-documents-list`);
  return data;
};

const getCounts = async () => {
  const { data } = await axios.get(`${ENDPOINT}/counts`);
  return data;
};

const getInvoiceStatusSummary = async () => {
  const { data } = await axios.get(`${ENDPOINT}/invoice-status-summary`);
  return data;
};

// Vehicle documents summary
const getVehicleDocumentsSummary = async (days = 30) => {
  const { data } = await axios.get(`${ENDPOINT}/vehicle-documents-summary`, {
    params: { days },
  });
  return data; // { missing, expiring, expired, valid, meta }
};

// Queries & Mutations
export function useCustomerMonthlyFreight(month) {
  return useQuery({
    queryKey: ['customerMonthlyFreight', month],
    queryFn: () => getCustomerMonthlyFreight(month),
    enabled: Boolean(month),
  });
}
export function useSubtripsExpiry() {
  return useQuery({ queryKey: ['subtripsExpiry'], queryFn: getSubtripsExpiry });
}
export function useSubtripMonthlyData(year) {
  return useQuery({
    queryKey: ['subtripMonthlyData', year],
    queryFn: () => getSubtripMonthlyData(year),
  });
}
export function useDashboardCounts() {
  return useQuery({ queryKey: ['counts'], queryFn: getCounts });
}

export function useExpiringDocuments() {
  return useQuery({ queryKey: ['expiringDocuments'], queryFn: getExpiringDocuments });
}

// ----------------------------------------------------------------------
// Monthly expense summary
const getMonthlyExpenseSummary = async (month) => {
  const { data } = await axios.get(`${ENDPOINT}/grouped/monthly-expense`, {
    params: { month },
  });
  return data;
};

export function useMonthlyExpenseSummary(month) {
  return useQuery({
    queryKey: ['monthlyExpenseSummary', month],
    queryFn: () => getMonthlyExpenseSummary(month),
    enabled: Boolean(month),
  });
}

// ----------------------------------------------------------------------
// Subtrip status summary

const getSubtripStatusSummary = async () => {
  const { data } = await axios.get(`${ENDPOINT}/subtrip-status-summary`);
  return data;
};

export function useSubtripStatusSummary() {
  return useQuery({ queryKey: ['subtripStatusSummary'], queryFn: getSubtripStatusSummary });
}

// ----------------------------------------------------------------------
// Invoice status summary

export function useInvoiceStatusSummary() {
  return useQuery({ queryKey: ['invoiceStatusSummary'], queryFn: getInvoiceStatusSummary });
}

export function useVehicleDocumentsSummary(days = 30) {
  return useQuery({
    queryKey: ['vehicleDocumentsSummary', days],
    queryFn: () => getVehicleDocumentsSummary(days),
  });
}

// ----------------------------------------------------------------------
// Daily summary by date

const getDailySummary = async (date) => {
  const { data } = await axios.get(`${ENDPOINT}/daily-summary`, {
    params: { date },
  });
  return data;
};

export function useDailySummary(date) {
  return useQuery({
    queryKey: ['dailySummary', date],
    queryFn: () => getDailySummary(date),
    enabled: Boolean(date),
  });
}

// ----------------------------------------------------------------------
// Financial = summary

const getFinancialMonthlyData = async () => {
  const { data } = await axios.get(`${ENDPOINT}/financial-monthly-data`);
  return data;
};

export function useFinancialMonthlyData() {
  return useQuery({ queryKey: ['financialMonthlyData'], queryFn: getFinancialMonthlyData });
}

// Top routes removed (backend API removed)

// ----------------------------------------------------------------------
// Invoice amount summary

const getInvoiceAmountSummary = async (year) => {
  const { data } = await axios.get(`${ENDPOINT}/invoice-amount-summary`, {
    params: { year },
  });
  return data;
};

export function useInvoiceAmountSummary(year, options = {}) {
  return useQuery({
    queryKey: ['invoiceAmountSummary', year],
    queryFn: () => getInvoiceAmountSummary(year),
    ...options,
  });
}

// ----------------------------------------------------------------------
// Transporter payment summary

const getTransporterPaymentSummary = async (year) => {
  const { data } = await axios.get(`${ENDPOINT}/transporter-payment-summary`, {
    params: { year },
  });
  return data;
};

export function useTransporterPaymentSummary(year) {
  return useQuery({
    queryKey: ['transporterPaymentSummary', year],
    queryFn: () => getTransporterPaymentSummary(year),
  });
}

// ----------------------------------------------------------------------
// Material weight summary

const getMonthlyMaterialWeight = async (month) => {
  const { data } = await axios.get(`${ENDPOINT}/grouped/monthly-material-weight`, {
    params: { month },
  });
  return data;
};

export function useMonthlyMaterialWeight(month) {
  return useQuery({
    queryKey: ['monthlyMaterialWeight', month],
    queryFn: () => getMonthlyMaterialWeight(month),
    enabled: Boolean(month),
  });
}

// ----------------------------------------------------------------------
// Monthly vehicle subtrips summary

const getMonthlyVehicleSubtrips = async (month) => {
  const { data } = await axios.get(`${ENDPOINT}/grouped/monthly-vehicle-subtrips`, {
    params: { month },
  });
  return data;
};

export function useMonthlyVehicleSubtrips(month) {
  return useQuery({
    queryKey: ['monthlyVehicleSubtrips', month],
    queryFn: () => getMonthlyVehicleSubtrips(month),
    enabled: Boolean(month),
  });
}

// ----------------------------------------------------------------------
// Monthly driver subtrips summary

const getMonthlyDriverSubtrips = async (month) => {
  const { data } = await axios.get(`${ENDPOINT}/grouped/monthly-driver-subtrips`, {
    params: { month },
  });
  return data;
};

export function useMonthlyDriverSubtrips(month) {
  return useQuery({
    queryKey: ['monthlyDriverSubtrips', month],
    queryFn: () => getMonthlyDriverSubtrips(month),
    enabled: Boolean(month),
  });
}

// ----------------------------------------------------------------------
// Monthly transporter subtrips summary

const getMonthlyTransporterSubtrips = async (month) => {
  const { data } = await axios.get(`${ENDPOINT}/grouped/monthly-transporter-subtrips`, {
    params: { month },
  });
  return data;
};

export function useMonthlyTransporterSubtrips(month) {
  return useQuery({
    queryKey: ['monthlyTransporterSubtrips', month],
    queryFn: () => getMonthlyTransporterSubtrips(month),
    enabled: Boolean(month),
  });
}

// ----------------------------------------------------------------------
// Monthly destination subtrips summary

const getMonthlyDestinationSubtrips = async (month) => {
  const { data } = await axios.get(`${ENDPOINT}/grouped/monthly-destination-subtrips`, {
    params: { month },
  });
  return data;
};

export function useMonthlyDestinationSubtrips(month) {
  return useQuery({
    queryKey: ['monthlyDestinationSubtrips', month],
    queryFn: () => getMonthlyDestinationSubtrips(month),
    enabled: Boolean(month),
  });
}

// ----------------------------------------------------------------------
// Tyre dashboard summary

const getTyreDashboardSummary = async () => {
  const { data } = await axios.get(`${ENDPOINT}/tyre-summary`);
  return data;
};

export function useTyreDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: ['tyreDashboardSummary'],
    queryFn: getTyreDashboardSummary,
    enabled,
  });
}

const getTyreDetailedDashboardSummary = async () => {
  const { data } = await axios.get(`${ENDPOINT}/tyre-dashboard`);
  return data;
};

export function useTyreDetailedDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: ['tyreDetailedDashboardSummary'],
    queryFn: getTyreDetailedDashboardSummary,
    enabled,
  });
}

// ----------------------------------------------------------------------
// Inventory dashboard summary

const getInventoryDashboardSummary = async () => {
  const { data } = await axios.get(`${ENDPOINT}/inventory-summary`);
  return data;
};

export function useInventoryDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: ['inventoryDashboardSummary'],
    queryFn: getInventoryDashboardSummary,
    enabled,
  });
}

// ----------------------------------------------------------------------
// Work order dashboard summary

const getWorkOrderDashboardSummary = async () => {
  const { data } = await axios.get(`${ENDPOINT}/work-order-summary`);
  return data;
};

export function useWorkOrderDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: ['workOrderDashboardSummary'],
    queryFn: getWorkOrderDashboardSummary,
    enabled,
  });
}

// ----------------------------------------------------------------------
// Maintenance & Inventory Detailed Dashboard

const getMaintenanceDashboard = async ({ months, slowMovingDays } = {}) => {
  const params = {};
  if (months) params.months = months;
  if (slowMovingDays) params.slowMovingDays = slowMovingDays;
  const { data } = await axios.get(`${ENDPOINT}/maintenance-dashboard`, { params });
  return data;
};

export function useMaintenanceDashboard({ enabled = true, months = 6, slowMovingDays = 90 } = {}) {
  return useQuery({
    queryKey: ['maintenanceDashboard', months, slowMovingDays],
    queryFn: () => getMaintenanceDashboard({ months, slowMovingDays }),
    enabled,
  });
}
