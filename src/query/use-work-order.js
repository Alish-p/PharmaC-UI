import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/maintenance/work-orders';
const QUERY_KEY = 'workOrders';

// Fetchers
const getPaginatedWorkOrders = async (params) => {
  const { data } = await axios.get(ENDPOINT, { params });
  return data;
};

const getWorkOrder = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createWorkOrder = async (payload) => {
  const { data } = await axios.post(ENDPOINT, payload);
  return data;
};

const updateWorkOrderApi = async (id, payload) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, payload);
  return data;
};

const closeWorkOrderApi = async ({ id, ...payload }) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/close`, payload);
  return data;
};

const addWorkOrderExpenseApi = async (id) => {
  const { data } = await axios.post(`${ENDPOINT}/${id}/expense`);
  return data;
};

const deleteWorkOrderApi = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries
export function usePaginatedWorkOrders(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedWorkOrders(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useWorkOrder(id, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getWorkOrder(id),
    enabled: !!id,
    ...options,
  });
}

// Mutations
export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Work order created successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create work order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updateWorkOrderApi(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      if (updated?._id) {
        queryClient.setQueryData([QUERY_KEY, updated._id], updated);
      }
      toast.success('Work order updated successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to update work order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useCloseWorkOrder() {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (args) => {
      // Handle both object with id (and potential payload) or just id string
      if (typeof args === 'object' && args.id) {
        return closeWorkOrderApi(args);
      }
      return closeWorkOrderApi({ id: args });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      if (updated?._id) {
        queryClient.setQueryData([QUERY_KEY, updated._id], updated);
      }
      toast.success('Work order closed successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to close work order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (id) => deleteWorkOrderApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Work order deleted successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete work order';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useAddWorkOrderExpense() {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (id) => addWorkOrderExpenseApi(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      if (updated?._id) {
        queryClient.setQueryData([QUERY_KEY, updated._id], updated);
      }
      toast.success('Expense added successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to add expense';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}
