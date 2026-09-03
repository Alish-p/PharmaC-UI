import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/maintenance/vendors';
const QUERY_KEY = 'vendors';

// Fetchers
const getPaginatedVendors = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getVendor = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createVendor = async (payload) => {
  const { data } = await axios.post(ENDPOINT, payload);
  return data;
};

const updateVendor = async (id, payload) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, payload);
  return data;
};

const deleteVendor = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries & Mutations
export function usePaginatedVendors(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedVendors(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfiniteVendors(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getPaginatedVendors({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page.vendors ? page.vendors.length : 0),
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

export function useVendor(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getVendor(id),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Vendor added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updateVendor(id, data),
    onSuccess: (updatedVendor) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedVendor._id], updatedVendor);
      toast.success('Vendor updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Vendor deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}
