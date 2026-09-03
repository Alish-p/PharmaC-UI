import { useQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/gps-snapshots';
const QUERY_KEY = 'gps-snapshots';

/**
 * Fetch GPS trail snapshots for a vehicle within a date range.
 * @param {string} vehicleNo
 * @param {string} from - ISO date string (trip start)
 * @param {string} to   - ISO date string (trip end, or now if active)
 */
const getGpsSnapshots = async (vehicleNo, from, to) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const { data } = await axios.get(`${ENDPOINT}/${vehicleNo}?${params.toString()}`);
  return data?.snapshots ?? [];
};

/**
 * Hook to fetch GPS journey snapshots for a vehicle over a trip's date range.
 *
 * @param {string}  vehicleNo  - Vehicle number to query
 * @param {Object}  options
 * @param {string}  options.fromDate  - Trip start date (ISO string)
 * @param {string}  options.toDate    - Trip end date (ISO string), omit for active trips
 * @param {boolean} options.isActive  - If true, polls every 30s and uses current time as `to`
 * @param {boolean} options.enabled   - Override to disable the query
 */
export function useGpsSnapshots(
  vehicleNo,
  { fromDate, toDate, isActive = false, enabled = true } = {}
) {
  // Use a stable key for active trips — the actual "to" is computed inside queryFn.
  // This prevents the query key from changing every render which causes infinite re-fetches.
  const queryKeyTo = isActive ? 'live' : toDate;

  return useQuery({
    queryKey: [QUERY_KEY, vehicleNo, fromDate, queryKeyTo],
    queryFn: () => {
      const to = isActive ? new Date().toISOString() : toDate;
      return getGpsSnapshots(vehicleNo, fromDate, to);
    },
    enabled: !!vehicleNo && !!fromDate && enabled,
    refetchInterval: isActive ? 30000 : false,
    staleTime: isActive ? 10000 : 5 * 60 * 1000,
  });
}
