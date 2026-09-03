import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/maintenance/purchase-orders';
const QUERY_KEY = 'purchaseOrders';

// Fetchers
const getPaginatedPurchaseOrders = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getPurchaseOrder = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createPurchaseOrder = async (payload) => {
  const { data } = await axios.post(ENDPOINT, payload);
  return data;
};

const updatePurchaseOrder = async (id, payload) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, payload);
  return data;
};

const approvePurchaseOrderApi = async (id) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/approve`);
  return data;
};

const rejectPurchaseOrderApi = async (id, reason) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/reject`, {
    reason: reason || undefined,
  });
  return data;
};

const receivePurchaseOrderApi = async (id, payload) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/receive`, payload);
  return data;
};

const closePurchaseOrderApi = async (id, payload) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/close`, payload);
  return data;
};

const checkInvoiceReferencesApi = async (invoiceNo, excludePoId) => {
  const { data } = await axios.get(`${ENDPOINT}/check-invoice`, {
    params: { invoiceNo, excludePoId },
  });
  return data;
};

// Queries
export function usePaginatedPurchaseOrders(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedPurchaseOrders(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function usePurchaseOrder(id, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getPurchaseOrder(id),
    enabled: !!id,
    ...options,
  });
}

export function useCheckInvoiceReferences(invoiceNo, excludePoId, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'check-invoice', invoiceNo, excludePoId],
    queryFn: () => checkInvoiceReferencesApi(invoiceNo, excludePoId),
    enabled: Boolean(invoiceNo && typeof invoiceNo === 'string' && invoiceNo.trim().length > 0),
    staleTime: 1000 * 30,
    ...options,
  });
}

// Mutations
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Purchase order created successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create purchase order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updatePurchaseOrder(id, data),
    onSuccess: (updatedPo) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedPo._id], updatedPo);
      toast.success('Purchase order updated successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to update purchase order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id) => approvePurchaseOrderApi(id),
    onSuccess: (updatedPo) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedPo._id], updatedPo);
      toast.success('Purchase order approved!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to approve purchase order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, reason }) => rejectPurchaseOrderApi(id, reason),
    onSuccess: (updatedPo) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedPo._id], updatedPo);
      toast.success('Purchase order rejected');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to reject purchase order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, ...payload }) => receivePurchaseOrderApi(id, payload),
    onSuccess: (updatedPo) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedPo._id], updatedPo);
      toast.success('Purchase order received');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to receive purchase order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useClosePurchaseOrder() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, ...payload }) => closePurchaseOrderApi(id, payload),
    onSuccess: (updatedPo) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedPo._id], updatedPo);
      toast.success('Purchase order closed');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to close purchase order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

const deletePurchaseOrderApi = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (id) => deletePurchaseOrderApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Purchase order deleted successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete purchase order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}
