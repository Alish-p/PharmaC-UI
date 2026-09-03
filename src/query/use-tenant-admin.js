import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/super/tenants';
const QUERY_KEY = 'tenants-admin';

// -----------------------------
// Fetchers
// -----------------------------

const getTenants = async (params) => {
  const { data } = await axios.get(ENDPOINT, { params });
  return data; // expected: { tenants: [], total, page, limit }
};

const getTenantById = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createTenant = async (payload) => {
  const { data } = await axios.post(ENDPOINT, payload);
  return data;
};

const updateTenantById = async ({ id, data: body }) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, body);
  return data;
};

const deleteTenant = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Payments
const addPayment = async ({ tenantId, payment }) => {
  const { data } = await axios.post(`${ENDPOINT}/${tenantId}/payments`, payment);
  return data; // returns updated tenant
};

const updatePayment = async ({ tenantId, paymentId, patch }) => {
  const { data } = await axios.put(`${ENDPOINT}/${tenantId}/payments/${paymentId}`, patch);
  return data; // returns updated tenant
};

const deletePayment = async ({ tenantId, paymentId }) => {
  const { data } = await axios.delete(`${ENDPOINT}/${tenantId}/payments/${paymentId}`);
  return data; // returns updated tenant
};

// Users (Superuser creates user for a specific tenant)
const createTenantUser = async ({ tenantId, user }) => {
  // Do not include permissions; server grants full permissions for superuser-created accounts
  const { data } = await axios.post(`${ENDPOINT}/${tenantId}/users`, user);
  return data; // expected: created user
};

// -----------------------------
// Hooks
// -----------------------------

export function usePaginatedTenants(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getTenants(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useTenantById(id, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTenantById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Tenant created');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to create tenant';
      toast.error(errorMessage);
    },
  });
  return { createTenant: mutateAsync, creatingTenant: isPending };
}

export function useUpdateTenantById() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateTenantById,
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedTenant._id], updatedTenant);
      toast.success('Tenant updated');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to update tenant';
      toast.error(errorMessage);
    },
  });

  return { updateTenantById: mutateAsync, updatingTenant: isPending };
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Tenant deleted');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to delete tenant';
      toast.error(errorMessage);
    },
  });
  return { deleteTenant: mutateAsync, deletingTenant: isPending };
}

export function useTenantPayments() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: addPayment,
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedTenant._id], updatedTenant);
      toast.success('Payment added');
    },
    onError: (error) => toast.error(error?.message || 'Failed to add payment'),
  });

  const update = useMutation({
    mutationFn: updatePayment,
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedTenant._id], updatedTenant);
      toast.success('Payment updated');
    },
    onError: (error) => toast.error(error?.message || 'Failed to update payment'),
  });

  const remove = useMutation({
    mutationFn: deletePayment,
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedTenant._id], updatedTenant);
      toast.success('Payment deleted');
    },
    onError: (error) => toast.error(error?.message || 'Failed to delete payment'),
  });

  return {
    addPayment: add.mutateAsync,
    updatePayment: update.mutateAsync,
    deletePayment: remove.mutateAsync,
    isAddingPayment: add.isPending,
    isUpdatingPayment: update.isPending,
    isDeletingPayment: remove.isPending,
  };
}

export function useCreateTenantUser() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createTenantUser,
    onSuccess: () => {
      toast.success('User created');
    },
    onError: (error) => toast.error(error?.message || 'Failed to create user'),
  });

  return { createTenantUser: mutateAsync, creatingTenantUser: isPending };
}

// -----------------------------
// Branding: Tenant Logo API (Superuser, by tenantId)
// -----------------------------

// Get a presigned upload URL for a specific tenant's logo
// params: { tenantId: string, contentType: string, extension: string }
export const getTenantLogoUploadUrlById = async ({ tenantId, contentType, extension }) => {
  const { data } = await axios.get(`${ENDPOINT}/${tenantId}/branding/logo/upload-url`, {
    params: { contentType, extension },
  });
  return data; // { key, uploadUrl }
};

// Save or remove tenant logo by file key (null to remove)
// params: { tenantId: string, fileKey: string | null }
export const saveTenantLogoById = async ({ tenantId, fileKey }) => {
  const { data } = await axios.put(`${ENDPOINT}/${tenantId}/branding/logo`, { fileKey });
  return data; // updated tenant
};
