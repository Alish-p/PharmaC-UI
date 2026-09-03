import { CONFIG } from 'src/config-global';

import { useTenantContext } from 'src/auth/tenant';

export function useMaterialOptions() {
  const tenant = useTenantContext();
  return tenant?.config?.subtrip?.materialOptions || CONFIG.materialOptions || [];
}
