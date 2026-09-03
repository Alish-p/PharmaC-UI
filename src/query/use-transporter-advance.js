import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/transporter-advances';

const createTransporterAdvance = async (advance) => {
  const { data } = await axios.post(ENDPOINT, advance);
  return data;
};

const deleteTransporterAdvance = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

export function useCreateTransporterAdvance() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createTransporterAdvance,
    onSuccess: () => {
      queryClient.invalidateQueries(['subtrips']);
      toast.success('Advance added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useDeleteTransporterAdvance() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteTransporterAdvance(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subtrips']);
      toast.success('Advance deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

const fetchPaginatedAdvances = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/pagination`, { params });
  return data;
};

export function usePaginatedAdvances(params, options = {}) {
  return useQuery({
    queryKey: ['advances', params],
    queryFn: () => fetchPaginatedAdvances(params),
    keepPreviousData: true,
    ...options,
  });
}
