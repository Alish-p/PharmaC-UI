import { useTenant } from 'src/query/use-tenant';

export const vehicleTypes = [
  { key: 'body', value: 'Body' },
  { key: 'trailer', value: 'Trailer' },
  { key: 'bulker', value: 'Bulker' },
  { key: 'tanker', value: 'Tanker' },
  { key: 'canter', value: 'Canter' },
];

export const loadingWeightUnit = {
  body: 'Ton', // bags
  trailer: 'Ton', // bags
  bulker: 'Ton', // loose
  tanker: 'KL', // fluid
  canter: 'Ton', // light truck
};

export const modelType = [
  { key: '3118', value: '3118' },
  { key: '3718', value: '3718' },
  { key: '4018', value: '4018' },
  { key: '4220', value: '4220' },
  { key: '4223', value: '4223' },
  { key: '4825', value: '4825' },
  { key: '1109', value: '1109' },
  { key: '1512', value: '1512' },
];

export const engineType = [
  { key: 'BS-3', value: 'BS-3' },
  { key: 'BS-4', value: 'BS-4' },
  { key: 'BS-5', value: 'BS-5' },
  { key: 'BS-6', value: 'BS-6' },
];

export const vehicleCompany = [
  { key: 'bharatBenz', value: 'Bharat Benz' },
  { key: 'ashokLeyland', value: 'Ashok Leyland' },
  { key: 'tata', value: 'Tata' },
  { key: 'ace', value: 'Ace' },
];

export const vehicleTypeIcon = {
  body: 'mdi:truck',
  trailer: 'mdi:truck-trailer',
  bulker: 'mdi:truck-cargo-container',
  localBulker: 'mdi:truck-fast',
  tanker: 'mdi:tanker-truck',
  canter: 'streamline-cyber:delivery-truck-5',
};

// ----------------------------------------------------------------------
// Dynamic Hooks for Tenant settings
// ----------------------------------------------------------------------

export function useVehicleTypes() {
  const { data: tenant } = useTenant();
  const dbTypes = tenant?.config?.vehicle?.types;

  if (dbTypes && dbTypes.length > 0) {
    return dbTypes.map((opt) => ({ key: opt.value, value: opt.label }));
  }
  return vehicleTypes;
}

export function useVehicleCompanies() {
  const { data: tenant } = useTenant();
  const dbCompanies = tenant?.config?.vehicle?.companies;

  if (dbCompanies && dbCompanies.length > 0) {
    return dbCompanies.map((opt) => ({ key: opt.value, value: opt.label }));
  }
  return vehicleCompany;
}

export function useModelTypes() {
  const { data: tenant } = useTenant();
  const dbModels = tenant?.config?.vehicle?.models;

  if (dbModels && dbModels.length > 0) {
    return dbModels.map((opt) => ({ key: opt.value, value: opt.label }));
  }
  return modelType;
}

export function useEngineTypes() {
  const { data: tenant } = useTenant();
  const dbEngines = tenant?.config?.vehicle?.engineTypes;

  if (dbEngines && dbEngines.length > 0) {
    return dbEngines.map((opt) => ({ key: opt.value, value: opt.label }));
  }
  return engineType;
}
