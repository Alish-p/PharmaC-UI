import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/customer-targets';
const QUERY_KEY = 'customer-targets';

// Fetchers
const getTargets = async (params) => {
  const { data } = await axios.get(ENDPOINT, { params });
  return data;
};

const createTarget = async (target) => {
  const { data } = await axios.post(ENDPOINT, target);
  return data;
};

const updateTarget = async ({ id, ...target }) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, target);
  return data;
};

const deleteTarget = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Hooks
export function useGetTargets(month, year) {
  return useQuery({
    queryKey: [QUERY_KEY, month, year],
    queryFn: () => getTargets({ month, year }),
    enabled: !!(month && year),
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: createTarget,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Target set successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: updateTarget,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Target updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useDeleteTarget() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: deleteTarget,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Target deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}
