import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/documents';
const QUERY_KEY = 'documents';

const invalidateDocumentQueries = (queryClient) =>
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY],
  });

// Fetchers
const getPaginatedDocuments = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

export const getPresignedUploadUrl = async ({ vehicleId, docType, contentType, extension }) => {
  const { data } = await axios.get(`${ENDPOINT}/${vehicleId}/upload-url`, {
    params: { docType, contentType, extension },
  });
  return data; // { key, uploadUrl }
};

export const createVehicleDocument = async ({ vehicleId, payload }) => {
  const { data } = await axios.post(`${ENDPOINT}/${vehicleId}`, payload);
  return data;
};

export const updateVehicleDocument = async ({ vehicleId, docId, payload }) => {
  const { data } = await axios.put(`${ENDPOINT}/${vehicleId}/${docId}`, payload);
  return data;
};

export const deleteVehicleDocument = async ({ vehicleId, docId }) => {
  const { data } = await axios.delete(`${ENDPOINT}/${vehicleId}/${docId}`);
  return data;
};

// Sync from Government Portal for a vehicle number
const syncDocuments = async ({ vehicleNo, docType }) => {
  const { data } = await axios.post(`${ENDPOINT}/sync`, { vehicleNo, docType });
  return data; // { addedCount }
};

// Queries
export function usePaginatedDocuments(params, options = {}) {
  const vehicleId = params?.vehicleId || params?.vehicle;
  const isHistory =
    params?.isActive === false ||
    params?.isActive === 0 ||
    params?.isActive === 'false' ||
    params?.isActive === '0';

  // Structure query key so mutations can invalidate by [documents, vehicleId, 'active'|'history']
  const baseKey = vehicleId
    ? [QUERY_KEY, vehicleId, isHistory ? 'history' : 'active']
    : [QUERY_KEY];

  return useQuery({
    queryKey: [...baseKey, 'paginated', params],
    queryFn: () => getPaginatedDocuments(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

// Infinite list (e.g., for overlay tables with infinite scroll)
export function useInfiniteDocuments(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getPaginatedDocuments({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page?.results ? page.results.length : 0),
        0
      );
      const total = lastPage?.total || 0;
      return totalFetched < total ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

// Mutations
export function useCreateVehicleDocument() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createVehicleDocument,
    onSuccess: async () => {
      toast.success('Document added successfully');
      await invalidateDocumentQueries(queryClient);
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to add document';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateVehicleDocument() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: updateVehicleDocument,
    onSuccess: async () => {
      toast.success('Document updated successfully');
      await invalidateDocumentQueries(queryClient);
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to update document';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useDeleteVehicleDocument() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: deleteVehicleDocument,
    onSuccess: async () => {
      toast.success('Document deleted');
      await invalidateDocumentQueries(queryClient);
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to delete document';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useSyncVehicleDocuments() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: syncDocuments,
    onSuccess: async (res) => {
      const added = res?.addedCount ?? 0;
      toast.success(
        added > 0 ? `Synced ${added} document${added > 1 ? 's' : ''}` : 'No new documents'
      );
      await invalidateDocumentQueries(queryClient);
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to sync documents';
      toast.error(errorMessage);
    },
  });
  return { syncDocuments: mutateAsync, isSyncing: isPending };
}

export function useVehicleDocument(docId, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, docId],
    queryFn: async () => {
      const { data } = await axios.get(`${ENDPOINT}/${docId}`);
      return data;
    },
    enabled: !!docId,
    ...options,
  });
}
