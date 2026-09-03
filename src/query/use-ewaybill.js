import { useQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/ewaybill';

// Fetcher: transporter e-waybills by date
// params: { generated_date: 'DD/MM/YYYY' }
const getTransporterEwaybills = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/transporter`, { params });
  // Normalize to a common shape used by the widget
  // Supports either an array response or { results: { message: [...] } }
  if (Array.isArray(data)) {
    return { results: { message: data } };
  }
  if (data && Array.isArray(data.results?.message)) {
    return data;
  }
  // Fallback: try common keys or wrap single object
  if (data && Array.isArray(data.message)) {
    return { results: { message: data.message } };
  }
  if (data && data.result && Array.isArray(data.result)) {
    return { results: { message: data.result } };
  }
  return { results: { message: [] } };
};

export function useTransporterEwaybills(params, options = {}) {
  return useQuery({
    queryKey: ['ewaybill', 'transporter', params],
    queryFn: () => getTransporterEwaybills(params),
    enabled: Boolean(params?.generated_date),
    staleTime: 1 * 60 * 60 * 1000, // 1 hours
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Fetcher: transporter e-waybills filtered by date + state code
// params: { generated_date: 'DD/MM/YYYY', state_code: '29' }
const getTransporterEwaybillsByState = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/transporter/by-state`, { params });
  if (Array.isArray(data)) {
    return { results: { message: data } };
  }
  if (data && Array.isArray(data.results?.message)) {
    return data;
  }
  if (data && Array.isArray(data.message)) {
    return { results: { message: data.message }, fetchedAt: data.fetchedAt };
  }
  if (data && data.result && Array.isArray(data.result)) {
    return { results: { message: data.result } };
  }
  return { results: { message: [] } };
};

export function useTransporterEwaybillsByState(params, options = {}) {
  return useQuery({
    queryKey: ['ewaybill', 'transporter', 'by-state', params],
    queryFn: () => getTransporterEwaybillsByState(params),
    enabled: Boolean(params?.generated_date && params?.state_code),
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Fetch single E-waybill by number
const getEwaybillByNumber = async (number) => {
  const { data } = await axios.get(`${ENDPOINT}/${number}`);
  return data;
};

export function useEwaybillByNumber(number, options = {}) {
  return useQuery({
    queryKey: ['ewaybill', number],
    queryFn: () => getEwaybillByNumber(number),
    enabled: Boolean(number),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (individual E-way bills are static)
    refetchOnWindowFocus: false,
    ...options,
  });
}
