import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/users';
const QUERY_KEY = 'users';

// Fetchers
const getUsers = async () => {
  const { data } = await axios.get(ENDPOINT, { params: { rowsPerPage: 10000 } });
  return data?.users || [];
};

const getPaginatedUsers = async (params) => {
  const { data } = await axios.get(ENDPOINT, { params });
  return data;
};

const getUser = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const getUsersLastSeen = async () => {
  try {
    const { data } = await axios.get(ENDPOINT);
    return Array.isArray(data) ? data : data?.users || [];
  } catch (error) {
    return [];
  }
};

const createUser = async (user) => {
  const { data } = await axios.post(ENDPOINT, user);
  return data;
};

const updateUser = async (id, userData) => {
  console.log({ id, userData });
  const { data } = await axios.put(`${ENDPOINT}/${id}`, userData);
  return data;
};

const deleteUser = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries & Mutations
export function useUsers() {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: getUsers });
}

export function usePaginatedUsers(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedUsers(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useUsersLastSeen() {
  return useQuery({ queryKey: [QUERY_KEY, 'last-seen'], queryFn: getUsersLastSeen });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('User added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedUser._id], updatedUser);

      toast.success('User edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('User deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}
