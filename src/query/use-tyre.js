import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

export const TYRE_QUERY_KEYS = {
  all: ['tyres'],
  details: (id) => ['tyre', id],
  list: (params) => ['tyres', { ...params }],
};

export function useGetTyres(params) {
  return useQuery({
    queryKey: TYRE_QUERY_KEYS.list(params),
    queryFn: async () => {
      const { data } = await axios.get('/api/tyre', { params });
      return data;
    },
    keepPreviousData: true,
  });
}

export function useTyreStatsByPart(partId) {
  return useQuery({
    queryKey: ['tyres', 'stats', partId],
    queryFn: async () => {
      const { data } = await axios.get('/api/tyre', {
        params: {
          inventoryPart: partId,
          limit: 0, // We only want the total counts, not the items
        },
      });
      return data.totals;
    },
    enabled: !!partId,
  });
}

export function useInfiniteTyres(params, options = {}) {
  return useInfiniteQuery({
    queryKey: TYRE_QUERY_KEYS.list({ ...params, infinite: true }),
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = { ...params, page: pageParam };
      return axios.get('/api/tyre', { params: queryParams }).then((res) => res.data);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.tyres.length, 0);
      const totalCount = lastPage.total || 0;
      return totalFetched < totalCount ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    ...options,
  });
}

export function useCreateTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => axios.post('/api/tyre', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
    },
  });
}

export function useCreateBulkTyres() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => axios.post('/api/tyre/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
    },
  });
}

export function useGetTyre(id) {
  return useQuery({
    queryKey: TYRE_QUERY_KEYS.details(id),
    queryFn: async () => {
      const { data } = await axios.get(`/api/tyre/${id}`);
      return data;
    },
  });
}

export function useGetTyreHistory(id) {
  return useQuery({
    queryKey: ['tyre-history', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/tyre/${id}/history`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/tyre/${id}`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
    },
  });
}

export function useUpdateTyreThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => axios.post(`/api/tyre/${id}/thread`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
    },
  });
}

export function useMountTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => axios.post(`/api/tyre/${id}/mount`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
      // Should probably invalidate vehicle as well if we were tracking tyres on vehicle directly
    },
  });
}

export function useUnmountTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => axios.post(`/api/tyre/${id}/unmount`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
    },
  });
}

// ...existing code...
export function useScrapTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => axios.post(`/api/tyre/${id}/scrap`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
    },
  });
}

export function useSellTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => axios.post(`/api/tyre/${id}/sell`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
      toast.success('Tyre sold successfully');
    },
  });
}

export function useUpdateTyreHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, historyId, data }) =>
      axios.put(`/api/tyre/${id}/history/${historyId}`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tyre-history', variables.id] });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) }); // Ensure total mileage updates
    },
  });
}

export function useRemoldTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => axios.post(`/api/tyre/${id}/remold`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['tyre-history', variables.id] });
    },
  });
}

export function useDeleteTyre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => axios.delete(`/api/tyre/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TYRE_QUERY_KEYS.all });
      toast.success('Tyre deleted successfully');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
}
