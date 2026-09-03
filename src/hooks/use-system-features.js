import { VEHICLE_MODES } from 'src/constants/vehicle-mode';

import { useTenantContext } from 'src/auth/tenant';

export function useSystemFeatures() {
  const tenant = useTenantContext();

  return {
    vehicleMode: tenant?.config?.vehicle?.vehicleMode ?? VEHICLE_MODES.BOTH,
    pumps: tenant?.config?.pump?.enabled !== false,
  };
}

export default useSystemFeatures;
