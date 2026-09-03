import { useQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/form-configs';
const QUERY_KEY = 'formConfigs';

const getAllFormConfigs = async () => {
  const { data } = await axios.get(ENDPOINT);
  return data;
};

export function useFormConfigs(options = {}) {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getAllFormConfigs,
    staleTime: 5 * 60 * 1000, // 5 minutes — configs rarely change
    ...options,
  });
}
