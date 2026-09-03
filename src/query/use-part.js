import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/maintenance/parts';
const QUERY_KEY = 'parts';

// Fetchers
const getPaginatedParts = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getPart = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createPart = async (payload) => {
  const { data } = await axios.post(ENDPOINT, payload);
  return data;
};

const updatePart = async (id, payload) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, payload);
  return data;
};

const deletePart = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

const adjustPartStock = async ({ id, data }) => {
  // id is partId, data contains quantityChange, location, etc.
  // New API expects partId in body
  const payload = { ...data, partId: id };
  const { data: response } = await axios.post(`/api/maintenance/part-stock/adjust`, payload);
  return response;
};

const transferPartStock = async ({ id, data }) => {
  // New API expects partId in body
  const payload = { ...data, partId: id };
  const { data: response } = await axios.post(`/api/maintenance/part-stock/transfer`, payload);
  return response;
};

export const getPartPhotoUploadUrl = async ({ contentType, fileExtension }) => {
  const { data } = await axios.get(`${ENDPOINT}/photo/upload-url`, {
    params: { contentType, fileExtension },
  });
  return data;
};

// Queries & Mutations
export function usePaginatedParts(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedParts(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfiniteParts(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getPaginatedParts({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page.parts ? page.parts.length : 0),
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

export function usePart(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getPart(id),
    enabled: !!id,
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createPart,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Part added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

const createBulkParts = async (payload) => {
  const { data } = await axios.post(`${ENDPOINT}/bulk`, payload);
  return data;
};

export function useCreateBulkParts() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createBulkParts,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Parts imported successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return { createBulkParts: mutateAsync, isCreatingBulkParts: isPending };
}

export function useUpdatePart() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updatePart(id, data),
    onSuccess: (updatedPart) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedPart._id], updatedPart);
      toast.success('Part updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeletePart() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deletePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Part deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useAdjustPartStock() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: adjustPartStock,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      if (variables?.id) {
        queryClient.invalidateQueries([QUERY_KEY, variables.id]);
      }
      queryClient.invalidateQueries(['inventoryActivities']);
      toast.success('Inventory adjusted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useTransferPartStock() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: transferPartStock,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      if (variables?.id) {
        queryClient.invalidateQueries([QUERY_KEY, variables.id]);
      }
      queryClient.invalidateQueries(['inventoryActivities']);
      toast.success('Stock transferred successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}
