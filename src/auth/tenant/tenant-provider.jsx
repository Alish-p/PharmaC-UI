import { useAuthContext } from 'src/auth/hooks';

import { TenantContext } from './tenant-context';

export function TenantProvider({ children }) {
  const { tenant } = useAuthContext();

  // if (!loading && !tenant) {
  //   throw new Error('TenantProvider: tenant is required');
  // }

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}
