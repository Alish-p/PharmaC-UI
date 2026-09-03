import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/customers';
const QUERY_KEY = 'customers';

// Fetchers
const getPaginatedCustomers = async (params) => {
  const { data } = await axios.get(`${ENDPOINT}`, { params });
  return data;
};

const getCustomersSummary = async () => {
  const { data } = await axios.get(`${ENDPOINT}/summary`);
  return data;
};

const getCustomer = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const getCustomerMonthlyMaterialWeight = async (id, month) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}/monthly-material-weight`, {
    params: { month },
  });
  return data;
};

const getCustomerSubtripMonthlyData = async (id, year) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}/subtrip-monthly-data`, {
    params: { year },
  });
  return data;
};

const getCustomerInvoiceAmountSummary = async (id, year) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}/invoice-amount-summary`, {
    params: { year },
  });
  return data;
};

// Search by GSTIN (priority) or fuzzy name
// Expects params: { gstinNumber?: string, name?: string }
const searchCustomer = async (params) => {
  const { gstinNumber, name } = params || {};
  const { data } = await axios.get(`${ENDPOINT}/search`, {
    params: {
      // Only send when present; backend prioritizes gstinNumber
      ...(gstinNumber ? { gstinNumber } : {}),
      ...(name ? { name } : {}),
    },
  });
  return data;
};

const createCustomer = async (customer) => {
  const { data } = await axios.post(ENDPOINT, customer);
  return data;
};

const updateCustomer = async (id, customerData) => {
  console.log({ customerDataInAPICAll: customerData });
  const { data } = await axios.put(`${ENDPOINT}/${id}`, customerData);
  return data;
};

const deleteCustomer = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// GST Lookup (canonical response)
// Route: POST `/api/customers/gst-lookup`
// Auth: Requires authentication and `customer:view` permission
// Integration flag: `tenant.integrations.gstApi.enabled` must be true (UI should gate)
// Payload: { gstin: string }
// Response: {
//   response: object,
//   responseStatus: 'SUCCESS' | 'FAILURE',
//   message: string | null,
//   canonical: {
//     gstin: string,
//     pan: string | null,
//     tradeName: string | null,
//     legalName: string | null,
//     status: string | null,
//     constitution: string | null,
//     dateOfRegistration: string | null,
//     address: {
//       line1: string | null,
//       buildingNumber: string | null,
//       streetName: string | null,
//       location: string | null,
//       district: string | null,
//       state: string | null,
//       city: string | null,
//       pincode: string | null,
//       latitude: string | null,
//       longitude: string | null,
//     }
//   }
// }
const gstLookup = async (payload) => {
  const { data } = await axios.post(`${ENDPOINT}/gst-lookup`, payload);
  return data;
};

// Queries & Mutations
export function usePaginatedCustomers(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedCustomers(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

// Customer search (by gstinNumber or name)
export function useSearchCustomer(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'search', params],
    queryFn: () => searchCustomer(params),
    enabled: Boolean(params && (params.gstinNumber || params.name)),
    staleTime: 0,
    ...options,
  });
}

export function useInfiniteCustomers(params, options = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getPaginatedCustomers({ ...(params || {}), page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.customers.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useCustomersSummary() {
  return useQuery({ queryKey: [QUERY_KEY, 'summary'], queryFn: getCustomersSummary });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}

export function useCustomerMonthlyMaterialWeight(id, month) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'monthly-material-weight', month],
    queryFn: () => getCustomerMonthlyMaterialWeight(id, month),
    enabled: Boolean(id && month),
  });
}

export function useCustomerSubtripMonthlyData(id, year) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'subtrip-monthly-data', year],
    queryFn: () => getCustomerSubtripMonthlyData(id, year),
    enabled: Boolean(id && year),
  });
}

// useCustomerRoutes removed (backend API removed)

export function useCustomerInvoiceAmountSummary(id, year, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'invoice-amount-summary', year],
    queryFn: () => getCustomerInvoiceAmountSummary(id, year),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Customer added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: (updatedCustomer) => {
      // Update the specific customer in the cache
      queryClient.setQueryData([QUERY_KEY, updatedCustomer._id], updatedCustomer);

      // Update the customer in the customers list cache
      queryClient.setQueryData([QUERY_KEY], (oldData) => {
        if (!oldData) return [updatedCustomer];
        return oldData.map((customer) =>
          customer._id === updatedCustomer._id ? updatedCustomer : customer
        );
      });

      toast.success('Customer edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });

  return mutate;
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteCustomer(id),
    onSuccess: (_) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Customer deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

// Customer GST lookup mutation
export function useCustomerGstLookup(options = {}) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: gstLookup,
    onError: (error) => {
      const errorMessage = error?.message || 'GST lookup failed';
      toast.error(errorMessage);
    },
    ...options,
  });

  return { lookupGst: mutateAsync, isLookingUpGst: isPending };
}
