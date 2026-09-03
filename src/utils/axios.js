import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/account/me',
    signIn: '/api/account/login',
    signUp: '/api/account/register',
    switchTenant: '/api/account/switch-tenant',
  },
  medicines: '/api/medicines',
  batches: '/api/batches',
  suppliers: '/api/suppliers',
  customers: '/api/customers',
  users: '/api/users',
  tenants: '/api/tenants',
  dashboard: {
    summary: '/api/dashboard/summary',
  },
};
