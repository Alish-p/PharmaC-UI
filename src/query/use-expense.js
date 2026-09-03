import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/expenses';
const QUERY_KEY = 'expenses';

// Fetchers
const getPaginatedExpenses = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/pagination`, { params });
  return data;
};

const getExpense = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createExpense = async (expense) => {
  const { data } = await axios.post(ENDPOINT, expense);
  return data;
};

const deleteExpense = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Hooks
export function usePaginatedExpenses(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedExpenses(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useExpense(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getExpense(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Expense added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteExpense(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Expense deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}
