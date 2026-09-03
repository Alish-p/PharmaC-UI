import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/loans';
const QUERY_KEY = 'loans';

// Fetchers
const getPaginatedLoans = async (params) => {
  const { data } = await axios.get(ENDPOINT, { params });
  return data;
};

const getLoans = async () => {
  const { data } = await axios.get(ENDPOINT);
  return data;
};

const getLoan = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

const createLoan = async (loan) => {
  const { data } = await axios.post(ENDPOINT, loan);
  return data;
};

const repayLoan = async ({ id, amount, paidDate, remarks }) => {
  const { data } = await axios.post(`${ENDPOINT}/${id}/repay`, {
    amount,
    paidDate,
    remarks,
  });
  return data;
};

const updateLoan = async (id, loanData) => {
  const { data } = await axios.put(`${ENDPOINT}/${id}`, loanData);
  return data;
};

const deleteLoan = async (id) => {
  const { data } = await axios.delete(`${ENDPOINT}/${id}`);
  return data;
};

// Queries & Mutations
export function useLoans() {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: getLoans });
}

export function usePaginatedLoans(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getPaginatedLoans(params),
    keepPreviousData: true,
    enabled: !!params,
    ...options,
  });
}

export function useLoan(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getLoan(id),
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Loan added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ id, data }) => updateLoan(id, data),
    onSuccess: (updatedLoan) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedLoan._id], updatedLoan);
      toast.success('Loan edited successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Loan deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
    },
  });
  return mutate;
}

export function useRepayLoan() {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: repayLoan,
    onSuccess: (updatedLoan) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      queryClient.setQueryData([QUERY_KEY, updatedLoan._id], updatedLoan);
      toast.success('Payment recorded successfully!');
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Repayment failed';
      toast.error(msg);
    },
  });

  return mutateAsync;
}

// Fetch pending (active) loans for a borrower
const getPendingLoans = async (borrowerType, borrowerId) => {
  const { data } = await axios.get(`${ENDPOINT}/pending/${borrowerType}/${borrowerId}`);
  return data;
};

export function usePendingLoans(borrowerType, borrowerId) {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending', borrowerType, borrowerId],
    queryFn: () => getPendingLoans(borrowerType, borrowerId),
    enabled: !!borrowerType && !!borrowerId,
  });
}
