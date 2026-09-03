import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/driverPayroll';
const QUERY_KEY = 'driverPayrolls';

// Fetchers
const getDriverPayrolls = async () => {
  const { data } = await axios.get(ENDPOINT);
  return data;
};

const getPaginatedDriverPayrolls = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/paginated`, { params });
  return data;
};

const getDriverPayroll = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createDriverPayroll = async (driverPayroll) => {
  const { data } = await axios.post(ENDPOINT, driverPayroll);
  return data;
};

const updateDriverPayrollStatus = async (id, status) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, { status });
  return data;
};

const deleteDriverPayroll = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries & Mutations
export function useDriverPayrolls() {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: getDriverPayrolls });
}

export function usePaginatedDriverPayrolls(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedDriverPayrolls(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useDriverPayroll(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getDriverPayroll(id),
    enabled: !!id,
  });
}

export function useCreateDriverPayroll() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createDriverPayroll,
    onSuccess: (newDriverPayroll) => {
      console.log({ newDriverPayroll });
      // updating list
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('DriverPayroll added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateDriverPayrollStatus() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, status }) => updateDriverPayrollStatus(id, status),
    onSuccess: (updatedDriverPayroll) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedDriverPayroll._id], updatedDriverPayroll);

      toast.success('DriverPayroll status changed successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeleteDriverPayroll() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteDriverPayroll(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('DriverPayroll deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}
