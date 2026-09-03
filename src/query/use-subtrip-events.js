import { useQuery } from '@tanstack/react-query';

import axios from 'src/utils/axios';

const ENDPOINT = '/api/subtrip-events';
const QUERY_KEY = 'subtrip-events';

const getSubtripEvents = async (id) => {
  const { data } = await axios.get(`${ENDPOINT}/${id}`);
  return data;
};

export function useSubtripEvents(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getSubtripEvents(id),
    enabled: !!id,
  });
}
