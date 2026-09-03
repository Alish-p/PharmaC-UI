import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/transporter-payments';
const PUBLIC_ENDPOINT = '/api/public/transporter-payments';
const QUERY_KEY = 'transporterPayments';

// Fetchers
const getPaginatedTransporterPayments = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getTransporterPayment = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const getPublicTransporterPayment = async (id) => {
  const { data } = await axios.get(`${PUBLIC_ENDPOINT}/${id}`);
  return data;
};

const createTransporterPayment = async (transporterPayment) => {
  const { data } = await axios.post(ENDPOINT, transporterPayment);
  return data;
};

const createBulkTransporterPayment = async (list) => {
  const { data } = await axios.post(`${ENDPOINT}/bulk-transporter-payment`, { payments: list });
  return data;
};

const updateTransporterPaymentStatus = async (id, status, paidDate) => {
  const payload = { status };
  if (paidDate !== undefined) payload.paidDate = paidDate;
  const { data } = await axios.put(`${ENDPOINT}/${id}`, payload);
  return data;
};

const deleteTransporterPayment = async (id, cancellationRemarks) => {
  const targetId = typeof id === 'object' ? id?.id : id;
  const remarks = typeof id === 'object' ? id?.cancellationRemarks : cancellationRemarks;
  const config = remarks ? { data: { cancellationRemarks: remarks } } : {};
  const { data } = await axios.delete(`${ENDPOINT}/${targetId}`, config);
  return data;
};

// Queries & Mutations
export function usePaginatedTransporterPayments(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedTransporterPayments(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useTransporterPayment(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTransporterPayment(id),
    enabled: !!id,
  });
}

export function usePublicTransporterPayment(id) {
  return useQuery({
    queryKey: [QUERY_KEY, 'public', id],
    queryFn: () => getPublicTransporterPayment(id),
    enabled: !!id,
  });
}

export function useCreateTransporterPayment() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createTransporterPayment,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('TransporterPayment added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useCreateBulkTransporterPayment() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createBulkTransporterPayment,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Bulk Transporters Payment generated successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateTransporterPaymentStatus() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, status, paidDate, cancellationRemarks }) => {
      const payload = { status };
      if (paidDate !== undefined) payload.paidDate = paidDate;
      if (cancellationRemarks !== undefined) payload.cancellationRemarks = cancellationRemarks;
      return updateTransporterPaymentStatus(id, status, paidDate);
    },
    onSuccess: (updatedTransporterPayment) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData(
        [QUERY_KEY, updatedTransporterPayment._id],
        updatedTransporterPayment
      );

      toast.success('TransporterPayment status changed successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeleteTransporterPayment() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (param) => {
      if (typeof param === 'object' && param !== null) {
        return deleteTransporterPayment(param.id, param.cancellationRemarks);
      }
      return deleteTransporterPayment(param);
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Transporter payment cancelled successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}
