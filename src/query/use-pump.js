import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/pumps';
const QUERY_KEY = 'pumps';

// Fetchers
const getPumps = async () => {
  const { data } = await axios.get(ENDPOINT, {
    params: { page: 1, rowsPerPage: 1000 },
  });
  return data.pumps || data.results || [];
};

const getPaginatedPumps = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getPump = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createPump = async (pump) => {
  const { data } = await axios.post(ENDPOINT, pump);
  return data;
};

const updatePump = async (id, pumpData) => {
  console.log({ pumpDataInAPICAll: pumpData });
  const { data } = await axios.put(`${ENDPOINT}/${id}`, pumpData);
  return data;
};

const deletePump = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries & Mutations
export function usePumps(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getPumps,
    enabled,
    staleTime: 1000 * 60 * 50,
  });
}

export function usePaginatedPumps(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedPumps(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfinitePumps(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getPaginatedPumps({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page.pumps ? page.pumps.length : 0),
        0
      );
      const totalCount = lastPage.total || 0;
      return totalFetched < totalCount ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function usePump(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getPump(id),
    enabled: !!id,
  });
}

export function useCreatePump() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: createPump,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Pump added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useUpdatePump() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ id, data }) => updatePump(id, data),
    onSuccess: (updatedPump) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedPump._id], updatedPump);

      toast.success('Pump edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useDeletePump() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deletePump(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Pump deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}
