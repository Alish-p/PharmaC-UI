import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  site: {
    name: 'PharmaC',
    serverUrl: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:5002/',
    assetURL: import.meta.env.VITE_ASSET_URL ?? '',
    basePath: import.meta.env.VITE_BASE_PATH ?? '',
    version: packageJson.version,
  },
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
  maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',

  company: {
    name: 'Shree Enterprises',
    tagline: 'Transport Contractor & Commission Agents',
    address: {
      line1: 'Plot No 16 & 17, Jamakhandi Road, Mudhol-587313.',
      line2: 'Dist: BagalKot',
      state: 'Karnataka',
    },
    bankDetails: {
      name: 'HDFC BANK LIMITED',
      accNo: '22262320000058',
      ifsc: 'HDFC0002226',
    },
    panNo: 'AVEPS8011L',
    gstin: '29AVEPS8011L2Z3',
    state: 'Karnataka',
    email: 'shree.enterprises34064@gmail.com',
    website: 'www.shreeenterprises.biz',
    contacts: ['+91 9448134064', '+91 9448134064', '+91 9448134064'],
    podChargesPerSubtrip: 150,
    transporterCommissionRate: 100,
  },

  materialOptions: [
    { label: 'Cement', value: 'Cement' },
    { label: 'Sugar', value: 'Sugar' },
    { label: 'Waste', value: 'Waste' },
    { label: 'Petcoke', value: 'Petcoke' },
    { label: 'Gypsum', value: 'Gypsum' },
    { label: 'Raw sugar', value: 'Raw sugar' },
    { label: 'Bauxite', value: 'Bauxite' },
    { label: 'Bricks', value: 'Bricks' },
    { label: 'Cement pipe', value: 'Cement pipe' },
    { label: 'Steel', value: 'Steel' },
    { label: 'Maize', value: 'Maize' },
    { label: 'Soyabean', value: 'Soyabean' },
    { label: 'Latrite', value: 'Latrite' },
    { label: 'Ethanol', value: 'Ethanol' },
    { label: 'Dolomite', value: 'Dolomite' },
    { label: 'Crushing Stone', value: 'Crushing Stone' },
    { label: 'Lime stone', value: 'Lime stone' },
    { label: 'Molases', value: 'Molases' },
    { label: 'Maida', value: 'Maida' },
    { label: 'Rava', value: 'Rava' },
    { label: 'Tiles', value: 'Tiles' },
    { label: 'Steam coal', value: 'Steam Coal' },
    { label: 'Other', value: 'Other' },
  ],

  customerInvoiceTax: 9,
  transporterInvoiceTax: 9,
};
