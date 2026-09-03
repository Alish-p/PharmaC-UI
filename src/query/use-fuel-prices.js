import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/pumps';
const QUERY_KEY = 'fuel-prices';

// ----------------------------------------------------------------------
// Low-level fetchers
// ----------------------------------------------------------------------

const getFuelPrices = async ({ pumpId, ...params }) => {
  try {
    const { data } = await axios.get(`${ENDPOINT}/${pumpId}/fuel-prices`, {
      params,
    });
    return data;
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error?.message || 'Failed to fetch fuel prices.';
    throw new Error(errorMessage);
  }
};

const createFuelPrice = async ({ pumpId, payload }) => {
  try {
    const { data } = await axios.post(`${ENDPOINT}/${pumpId}/fuel-prices`, payload);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error?.message || 'Failed to create fuel price.';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateFuelPrice = async ({ pumpId, priceId, payload }) => {
  try {
    const { data } = await axios.put(`${ENDPOINT}/${pumpId}/fuel-prices/${priceId}`, payload);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error?.message || 'Failed to update fuel price.';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const deleteFuelPrice = async ({ pumpId, priceId }) => {
  try {
    const { data } = await axios.delete(`${ENDPOINT}/${pumpId}/fuel-prices/${priceId}`);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error?.message || 'Failed to delete fuel price.';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getCurrentFuelPrice = async ({ pumpId, fuelType, date }) => {
  try {
    const params = {};
    if (date) {
      const asDate = date instanceof Date ? date : new Date(date);
      params.date = asDate.toISOString();
    }

    const { data } = await axios.get(`${ENDPOINT}/${pumpId}/fuel-prices/${fuelType}/current`, {
      params,
    });
    return data;
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error?.message || 'Failed to fetch current fuel price.';
    throw new Error(errorMessage);
  }
};

// ----------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------

export function useFuelPrices(params, options = {}) {
  const { pumpId, ...rest } = params || {};

  return useQuery({
    queryKey: [QUERY_KEY, 'list', pumpId, rest],
    queryFn: () => getFuelPrices({ pumpId, ...rest }),
    enabled: !!pumpId,
    keepPreviousData: true,
    ...options,
  });
}

export function useCurrentFuelPrice({ pumpId, fuelType, date }, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'current', pumpId, fuelType, date],
    queryFn: () => getCurrentFuelPrice({ pumpId, fuelType, date }),
    enabled: !!pumpId && !!fuelType && !!date,
    retry: false,
    ...options,
  });
}

export function useCreateFuelPrice() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: createFuelPrice,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Fuel price added successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred while creating fuel price.';
      toast.error(errorMessage);
    },
  });
  return mutateAsync;
}

export function useUpdateFuelPrice() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: updateFuelPrice,
    onSuccess: (updatedFuelPrice) => {
      queryClient.invalidateQueries([QUERY_KEY]);
      if (updatedFuelPrice?._id) {
        queryClient.setQueryData([QUERY_KEY, updatedFuelPrice._id], updatedFuelPrice);
      }
      toast.success('Fuel price updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred while updating fuel price.';
      toast.error(errorMessage);
    },
  });

  return mutateAsync;
}

export function useDeleteFuelPrice() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: deleteFuelPrice,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY]);
      toast.success('Fuel price deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'An error occurred while deleting fuel price.';
      toast.error(errorMessage);
    },
  });
  return mutate;
}
