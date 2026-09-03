import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/maintenance/part-locations';
const QUERY_KEY = 'partLocations';

// Fetchers
const getPaginatedPartLocations = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getPartLocation = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createPartLocation = async (payload) => {
  const { data } = await axios.post(ENDPOINT, payload);
  return data;
};

const updatePartLocation = async (id, payload) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, payload);
  return data;
};

const deletePartLocation = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries & Mutations
export function usePaginatedPartLocations(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedPartLocations(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfinitePartLocations(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getPaginatedPartLocations({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page.locations ? page.locations.length : 0),
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

export function usePartLocation(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getPartLocation(id),
    enabled: !!id,
  });
}

export function useCreatePartLocation() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createPartLocation,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Part location added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useUpdatePartLocation() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updatePartLocation(id, data),
    onSuccess: (updatedLocation) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedLocation._id], updatedLocation);
      toast.success('Part location updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeletePartLocation() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deletePartLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Part location deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}
