import { useQuery, useMutation } from '@tanstack/react-query';

import axios from 'src/utils/axios';

// Challan API
// Endpoints:
// - GET  `/api/challans?vehicleNo=KA22AA0372` -> DB only + timing
// - POST `/api/challans/sync` { vehicleNo }   -> Provider call with cooldown
// Auth: Bearer (set globally)
// Note: Server enforces tenant ownership and cooldown policy.

const ENDPOINT = '/api/challans';

// Cached challans (from DB) without triggering provider fetch
// Response shape:
// { vehicleNo, lastFetchedAt, nextAllowedAt, pendingCount, disposedCount, results: { pending, disposed } }
const getCachedChallans = async ({ vehicleNo }) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params: { vehicleNo } });
  return data;
};

// Sync challans (provider call) — enforces 10-day cooldown
// Success shape mirrors GET; cooldown error returns 429 with { cached, results: [...] }
const syncChallans = async ({ vehicleNo }) => {
  const payload = { vehicleNo, vehiclenumber: vehicleNo };
  const { data } = await axios.post(`${ENDPOINT}/sync`, payload);
  return data;
};

export function useFetchVehicleChallans() {
  const { mutateAsync, isPending } = useMutation({ mutationFn: syncChallans });
  return { fetchChallans: mutateAsync, isFetching: isPending };
}

export function useCachedVehicleChallans(vehicleNo, options = {}) {
  return useQuery({
    queryKey: ['challans', 'cached', vehicleNo],
    queryFn: () => getCachedChallans({ vehicleNo }),
    enabled: !!vehicleNo,
    staleTime: 0,
    ...options,
  });
}
