import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/vehicles';
const QUERY_KEY = 'vehicles';

// Fetchers
const getPaginatedVehicles = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getVehicle = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const getTransporterVehicles = async (transporterId) => {
  const { data } = await axios.get(`/api/transporters/${transporterId}/vehicles`);
  return data;
};

const getVehicleAnalytics = async (id, year) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}/analytics`, { params: { year } });
  return data;
};

const createVehicle = async (vehicle) => {
  const { data } = await axios.post(ENDPOINT, vehicle);
  return data;
};

const updateVehicle = async (id, vehicleData) => {
  console.log({ vehicleDataInAPICAll: vehicleData });
  const { data } = await axios.put(`${ENDPOINT}/${id}`, vehicleData);
  return data;
};

const deleteVehicle = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Vehicle lookup
const lookupVehicle = async (payload) => {
  const { data } = await axios.post(`${ENDPOINT}/lookup`, payload);
  return data;
};

const getTyreLayouts = async () => {
  const { data } = await axios.get(`${ENDPOINT}/layouts`);
  return data;
};

// Cleanup
const getOrphanVehicles = async () => {
  const { data } = await axios.get(`${ENDPOINT}/orphans`);
  return data;
};

const cleanupVehicles = async ({ vehicleIds }) => {
  const { data } = await axios.post(`${ENDPOINT}/cleanup`, { vehicleIds });
  return data;
};

const getVehicleKmTemplate = async () => {
  const { data } = await axios.get(`${ENDPOINT}/km-template`);
  return data;
};

const bulkUpdateVehicleKm = async (payload) => {
  const { data } = await axios.post(`${ENDPOINT}/bulk-km`, payload);
  return data;
};

// Queries & Mutations
export function usePaginatedVehicles(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedVehicles(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfiniteVehicles(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getPaginatedVehicles({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page.results ? page.results.length : 0),
        0
      );
      return totalFetched < (lastPage.total || 0) ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useVehicle(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getVehicle(id),
    enabled: !!id,
  });
}

export function useTransporterVehicles(transporterId, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'by-transporter', transporterId],
    queryFn: () => getTransporterVehicles(transporterId),
    enabled: !!transporterId,
    ...options,
  });
}

export function useVehicleAnalytics(id, year, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'analytics', id, year],
    queryFn: () => getVehicleAnalytics(id, year),
    enabled: !!id && !!year,
    ...options,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      toast.success('Vehicle added successfully!');
      queryClient.invalidateQueries([QUERY_KEY]);
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updateVehicle(id, data),
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedVehicle._id], updatedVehicle);
      toast.success('Vehicle edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteVehicle(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Vehicle deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useVehicleLookup(options = {}) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: lookupVehicle,
    onError: (error) => {
      const errorMessage = error?.message || 'Lookup failed';
      toast.error(errorMessage);
    },
    ...options,
  });
  return { lookup: mutateAsync, isLookingUp: isPending };
}

export function useGetTyreLayouts(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'layouts'],
    queryFn: getTyreLayouts,
    staleTime: Infinity,
    ...options,
  });
}

export function useOrphanVehicles(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'orphans'],
    queryFn: getOrphanVehicles,
    ...options,
  });
}

export function useCleanupVehicles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cleanupVehicles,
    onSuccess: (data) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success(data.message || 'Vehicles cleanup successful');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Cleanup started but failed';
      toast.error(errorMessage);
    },
  });
}

export function useBulkUpdateVehicleKm() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: bulkUpdateVehicleKm,
    onSuccess: (data) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success(`Updated ${data.updated} vehicle(s), skipped ${data.skipped}`);
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Bulk update failed';
      toast.error(errorMessage);
    },
  });
  return { bulkUpdateVehiclesKm: mutateAsync, isUpdating: isPending };
}

export function useDownloadVehicleKmTemplate(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'km-template'],
    queryFn: getVehicleKmTemplate,
    enabled: false,
    ...options,
  });
}
