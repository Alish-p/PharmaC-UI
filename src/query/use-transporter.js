import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/transporters';
const QUERY_KEY = 'transporters';

// Fetchers
const getTransporters = async () => {
  const { data } = await axios.get(ENDPOINT);
  return data;
};

const getPaginatedTransporters = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getTransporter = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createTransporter = async (transporter) => {
  const { data } = await axios.post(ENDPOINT, transporter);
  return data;
};

const updateTransporter = async (id, transporterData) => {
  console.log({ transporterDataInAPICAll: transporterData });
  const { data } = await axios.put(`${ENDPOINT}/${id}`, transporterData);
  return data;
};

const deleteTransporter = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

const getOrphanTransporters = async () => {
  const { data } = await axios.get(`${ENDPOINT}/orphans`);
  return data;
};

const cleanupTransportersApi = async (transporterIds) => {
  const { data } = await axios.post(`${ENDPOINT}/cleanup`, { transporterIds });
  return data;
};

// Queries & Mutations
export function useTransporters(options = {}) {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: getTransporters, ...options });
}

export function usePaginatedTransporters(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedTransporters(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfiniteTransporters(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getPaginatedTransporters({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.transporters.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useTransporter(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTransporter(id),
    enabled: !!id,
  });
}

export function useCreateTransporter() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: createTransporter,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Transporter added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useUpdateTransporter() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ id, data }) => updateTransporter(id, data),
    onSuccess: (updatedTransporter) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedTransporter._id], updatedTransporter);
      toast.success('Transporter edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useDeleteTransporter() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteTransporter(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Transporter deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

// Hook for fetching orphan transporters (not referenced in any vehicle/payment/loan)
export function useOrphanTransporters(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'orphans'],
    queryFn: getOrphanTransporters,
    ...options,
  });
}

// Hook for cleaning up (soft deleting) orphan transporters
export function useCleanupTransporters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupTransportersApi,
    onSuccess: (result) => {
      // Invalidate orphan transporters query to refetch
      queryClient.invalidateQueries([QUERY_KEY, 'orphans']);
      // Invalidate paginated transporters list
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
      // Invalidate all transporters
      queryClient.invalidateQueries([QUERY_KEY]);

      toast.success(result.message || 'Transporters cleaned up successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
}

export const getTransporterDocumentUploadUrl = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/upload-url`, { params });
  return data;
};
