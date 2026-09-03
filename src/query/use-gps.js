import { useQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/gps';
const QUERY_KEY = 'gps';

const getGpsData = async (vehicleNo) => {
  const { data } = await axios.get(`${ENDPOINT}/${vehicleNo}`);
  return data;
};

export function useGps(vehicleNo, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, vehicleNo],
    queryFn: () => getGpsData(vehicleNo),
    enabled: !!vehicleNo && (options.enabled ?? true),
  });
}

// Fetch all vehicles' GPS data
const getAllGpsData = async () => {
  const { data } = await axios.get(ENDPOINT);
  return data;
};

export function useAllGps(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'all'],
    queryFn: getAllGpsData,
    refetchInterval: 30000, // auto-refresh every 30s
    ...options,
  });
}
