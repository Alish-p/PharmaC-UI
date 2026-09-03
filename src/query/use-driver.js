import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/drivers';
const QUERY_KEY = 'drivers';

// Fetchers
const getDrivers = async () => {
  const { data } = await axios.get(ENDPOINT);
  return data;
};

const getPaginatedDrivers = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getDriver = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createDriver = async (driver) => {
  const { data } = await axios.post(ENDPOINT, driver);
  return data;
};

const updateDriver = async (id, driverData) => {
  console.log({ driverDataInAPICAll: driverData });
  const { data } = await axios.put(`${ENDPOINT}/${id}`, driverData);
  return data;
};

const deleteDriver = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

const getOrphanDrivers = async () => {
  const { data } = await axios.get(`${ENDPOINT}/orphans`);
  return data;
};

const cleanupDriversApi = async (driverIds) => {
  const { data } = await axios.post(`${ENDPOINT}/cleanup`, { driverIds });
  return data;
};

export const getDriverPhotoUploadUrl = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/upload-url`, { params });
  return data;
};

// Queries & Mutations
export function useDrivers(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getDrivers,
    ...options,
  });
}

export function usePaginatedDrivers(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedDrivers(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfiniteDrivers(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getPaginatedDrivers({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.drivers.length, 0);
      const totalCount = (lastPage.totals && lastPage.totals.all?.count) ?? lastPage.total ?? 0;
      return totalFetched < totalCount ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useDriver(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getDriver(id),
    enabled: !!id,
  });
}

// Hook for creating a driver with minimal information (uses unified API)
export function useCreateQuickDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDriver,
    onSuccess: (newDriver) => {
      // Update the drivers list in the cache
      queryClient.setQueryData([QUERY_KEY], (oldData) => {
        if (!oldData) return [newDriver];
        return [...oldData, newDriver];
      });

      // Also update the individual driver query if it exists
      queryClient.setQueryData([QUERY_KEY, newDriver._id], newDriver);

      toast.success('Quick driver added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
}

// New hook for creating a full driver with all required information
export function useCreateFullDriver() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: createDriver,
    onSuccess: (newDriver) => {
      // Update the drivers list in the cache
      queryClient.setQueryData([QUERY_KEY], (oldData) => {
        if (!oldData) return [newDriver];
        return [...oldData, newDriver];
      });

      // Also update the individual driver query if it exists
      queryClient.setQueryData([QUERY_KEY, newDriver._id], newDriver);

      toast.success('Driver added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ id, data }) => updateDriver(id, data),
    onSuccess: (updatedDriver) => {
      queryClient.setQueryData([QUERY_KEY], (oldData) => {
        if (!oldData) return [updatedDriver];

        return oldData.map((driver) => (driver._id === updatedDriver._id ? updatedDriver : driver));
      });

      queryClient.setQueryData([QUERY_KEY, updatedDriver._id], updatedDriver);

      toast.success('Driver edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteDriver(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData([QUERY_KEY], (oldData) => {
        if (!oldData) return [];

        return oldData.filter((driver) => driver._id !== id);
      });

      queryClient.removeQueries([QUERY_KEY, id]);

      toast.success('Driver deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

// Hook for fetching orphan drivers (not referenced in any subtrip/trip/salary/loan)
export function useOrphanDrivers(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'orphans'],
    queryFn: getOrphanDrivers,
    ...options,
  });
}

// Hook for cleaning up (soft deleting) orphan drivers
export function useCleanupDrivers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupDriversApi,
    onSuccess: (result) => {
      // Invalidate orphan drivers query to refetch
      queryClient.invalidateQueries([QUERY_KEY, 'orphans']);
      // Invalidate paginated drivers list
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
      // Invalidate all drivers
      queryClient.invalidateQueries([QUERY_KEY]);

      toast.success(result.message || 'Drivers cleaned up successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
}
