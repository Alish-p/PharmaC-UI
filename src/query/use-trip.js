import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/trips';
const QUERY_KEY = 'trips';

// Fetchers

const getPaginatedTrips = async (params) => {
  const { data } = await axios.get(ENDPOINT, { params });
  return data;
};

const getTripsPreview = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/preview`, { params });
  return data;
};

const getTrip = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

// Fetch active trip for a vehicle. Returns `null` if none.
const getVehicleActiveTrip = async (vehicleId) => {
  try {
    const { data } = await axios.get(`${ENDPOINT}/vehicle/${vehicleId}/active`);
    return data;
  } catch (error) {
    // API returns 404 with { message: 'Trip not found' } when no active trip.
    // Our axios interceptor maps errors to response.data or string, so treat any error as no active trip.
    return null;
  }
};

const createTrip = async (trip) => {
  const { data } = await axios.post(ENDPOINT, trip);
  return data;
};

const updateTrip = async (id, tripData) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, tripData);
  return data;
};

const closeTrip = async (id) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/close`);
  return data;
};

const deleteTrip = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries & Mutations
export function usePaginatedTrips(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedTrips(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfiniteTripsPreview(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'preview', params],
    queryFn: ({ pageParam = 1 }) => getTripsPreview({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.trips.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useTrip(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTrip(id),
    enabled: !!id,
  });
}

// Get vehicle's active trip (or null if none)
export function useVehicleActiveTrip(vehicleId, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'vehicle-active', vehicleId],
    queryFn: () => getVehicleActiveTrip(vehicleId),
    enabled: !!vehicleId,
    staleTime: 30_000,
    ...options,
  });
}

// Fetch a map of vehicleNo → { tripId, tripNo } for all open trips
const getActiveTripsMap = async () => {
  const { data } = await axios.get(`${ENDPOINT}/active-trips-map`);
  return data;
};

export function useActiveTripsMap(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'active-trips-map'],
    queryFn: getActiveTripsMap,
    staleTime: 60_000,
    ...options,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      toast.success('Trip added successfully!');
      queryClient.invalidateQueries([QUERY_KEY]);
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updateTrip(id, data),
    onSuccess: (updatedTrip) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedTrip._id], updatedTrip);

      toast.success('Trip edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useCloseTrip() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id) => closeTrip(id),
    onSuccess: (updatedTrip) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedTrip._id], updatedTrip);

      toast.success('Trip Closed successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteTrip(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Trip deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

// Route Analytics
const getRouteAnalytics = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/route-analytics`, { params });
  return data;
};

export function useRouteAnalytics(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'route-analytics', params],
    queryFn: () => getRouteAnalytics(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}
