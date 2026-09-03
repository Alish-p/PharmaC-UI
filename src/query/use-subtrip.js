import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

import { SUBTRIP_STATUS } from '../sections/subtrip/constants';

const ENDPOINT = '/api/subtrips';
const PUBLIC_ENDPOINT = '/api/public/subtrips';
const QUERY_KEY = 'subtrips';

// Fetchers
const getSubtrip = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const getPublicSubtrip = async (id) => {
  const { data } = await axios.get(`${PUBLIC_ENDPOINT}/${id}`);
  return data;
};

const getFilteredSubtrips = async ({ queryKey }) => {
  const [, params] = queryKey;
  if (!params) return [];
  try {
    const { data } = await axios.get(ENDPOINT, { params });
    return data;
  } catch (error) {
    const errorMessage = error?.message || 'An error occurred';
    toast.error(errorMessage);
    throw error;
  }
};

const getPaginatedSubtrips = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/pagination`, { params });
  return data;
};

const getSubtripsByStatus = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/status`, { params });
  return data;
};

// Unified Job creation (creates subtrip and handles trip logic server-side)
const createJob = async (payload) => {
  const { data } = await axios.post(`${ENDPOINT}/jobs`, payload);
  return data;
};

const updateSubtrip = async (id, subtripData) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, subtripData);
  return data;
};

// material-info endpoint deprecated/removed on backend

const updateSubtripReceiveInfo = async (id, subtripData) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/receive`, subtripData);
  return data;
};

const updateSubtripResolveInfo = async (id, subtripData) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}/resolve`, subtripData);
  return data;
};

const deleteSubtrip = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// empty subtrip endpoints deprecated/removed on backend

export function useClosedTripsByCustomerAndDate(customerId, fromDate, toDate) {
  return useQuery({
    queryKey: [
      QUERY_KEY,
      {
        customerId,
        fromDate,
        toDate,
        subtripStatus: SUBTRIP_STATUS.RECEIVED,
        isEmpty: false,
        hasInvoice: false,
      },
    ],
    queryFn: getFilteredSubtrips,
    enabled: false,
    retry: 0,
  });
}

export function useTripsCompletedByDriverAndDate(driverId, periodStartDate, periodEndDate) {
  return useQuery({
    queryKey: [
      QUERY_KEY,
      {
        driverId,
        fromDate: periodStartDate,
        toDate: periodEndDate,
        // driver salary once the subtrip is Recieved and Above
        subtripStatus: [SUBTRIP_STATUS.RECEIVED, SUBTRIP_STATUS.ERROR, SUBTRIP_STATUS.BILLED],
        isEmpty: false,
        hasDriverSalary: false,
      },
    ],
    queryFn: getFilteredSubtrips,
    enabled: false,
    retry: 0,
  });
}

export function useFetchSubtripsForTransporterBilling(
  transporterId,
  periodStartDate,
  periodEndDate
) {
  return useQuery({
    queryKey: [
      QUERY_KEY,
      {
        transporterId,
        fromDate: periodStartDate,
        toDate: periodEndDate,
        subtripStatus: [SUBTRIP_STATUS.RECEIVED, SUBTRIP_STATUS.BILLED],
        isEmpty: false,
        hasTransporterPayment: false,
      },
    ],
    queryFn: getFilteredSubtrips,
    enabled: false,
    retry: 0,
  });
}

export function usePaginatedSubtrips(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedSubtrips(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useInfiniteSubtripsByStatus(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'status', params],
    queryFn: ({ pageParam = 1 }) => getSubtripsByStatus({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.results.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useSubtrip(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getSubtrip(id),
    enabled: !!id,
  });
}

export function usePublicSubtrip(id) {
  return useQuery({
    queryKey: [QUERY_KEY, 'public', id],
    queryFn: () => getPublicSubtrip(id),
    enabled: !!id,
  });
}

// Backward-compatible wrapper: maps to unified createJob
export function useCreateSubtrip() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Job created successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Job created successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateSubtrip() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ id, data }) => updateSubtrip(id, data),
    onSuccess: (updatedSubtrip) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedSubtrip._id], updatedSubtrip);

      toast.success('Job updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useDeleteSubtrip() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteSubtrip(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.removeQueries([QUERY_KEY, id]);
      toast.success('Job deleted successfully!');
    },
    onError: (error) => {
      console.log({ error });
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

// useUpdateSubtripMaterialInfo removed — material-info flow merged into job creation

export function useUpdateSubtripReceiveInfo() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updateSubtripReceiveInfo(id, data),
    onSuccess: (updatedSubtrip) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedSubtrip._id], updatedSubtrip);

      toast.success('Job Receive Info added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useUpdateSubtripResolveInfo() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, data }) => updateSubtripResolveInfo(id, data),
    onSuccess: (updatedSubtrip) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedSubtrip._id], updatedSubtrip);

      toast.success('Job Resolve Info added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

// useCreateEmptySubtrip/useCloseEmptySubtrip removed — empty job flow deprecated

const getSubtripsByTransporter = async ({ queryKey }) => {
  const [, , { startDate, endDate }] = queryKey;
  console.log({ startDate, endDate });
  const { data } = await axios.post(`${ENDPOINT}/by-transporter`, { startDate, endDate });
  return data;
};

export const getSubtripDocumentUploadUrl = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}/upload-url`, { params });
  return data;
};

export function useSubtripsByTransporter(startDate, endDate) {
  return useQuery({
    queryKey: [QUERY_KEY, 'by-transporter', { startDate, endDate }],
    queryFn: getSubtripsByTransporter,
    enabled: !!startDate && !!endDate,
  });
}

// EPOD (Electronic Proof of Delivery) helpers
export const getEpodUploadUrl = async (subtripId, params) => {
  const { data } = await axios.get(`${PUBLIC_ENDPOINT}/${subtripId}/epod/upload-url`, { params });
  return data;
};

export const submitPublicEpod = async (subtripId, epodData) => {
  const { data } = await axios.post(`${PUBLIC_ENDPOINT}/${subtripId}/epod`, epodData);
  return data;
};
