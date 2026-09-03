import { useContext } from 'react';

import { TenantContext } from './tenant-context';

export function useTenantContext() {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenantContext must be used inside TenantProvider');
  }

  return context;
}
