import { useQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/maintenance/part-stock/transactions';
const QUERY_KEY = 'inventoryActivities';

const getInventoryActivities = async (params) => {
  const { data } = await axios.get(ENDPOINT, { params });
  return data;
};

export function usePaginatedInventoryActivities(params, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'paginated', params],
    queryFn: () => getInventoryActivities(params),
    keepPreviousData: true,
    // require part id to avoid fetching without context
    enabled: !!(params?.part || params?.inventoryLocation),
    ...options,
  });
}
