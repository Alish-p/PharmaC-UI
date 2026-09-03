import { paths } from 'src/routes/paths';
import { Iconify } from '../components/iconify';

// ----------------------------------------------------------------------

const ICONS = {
  dashboard: <Iconify icon="solar:widget-5-bold-duotone" />,
  medicine: <Iconify icon="solar:pill-bold-duotone" />,
  batch: <Iconify icon="solar:box-minimalistic-bold-duotone" />,
  pos: <Iconify icon="solar:cart-large-4-bold-duotone" />,
  supplier: <Iconify icon="solar:shop-2-bold-duotone" />,
  customer: <Iconify icon="solar:users-group-two-rounded-bold-duotone" />,
  user: <Iconify icon="solar:shield-user-bold-duotone" />,
  settings: <Iconify icon="solar:settings-bold-duotone" />,
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Main
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
    ],
  },

  /**
   * Pharmacy Store Operations
   */
  {
    subheader: 'Pharmacy Operations',
    items: [
      {
        title: 'Medicines Master',
        path: paths.dashboard.medicine.root,
        icon: ICONS.medicine,
      },
      {
        title: 'Batches & Stock',
        path: paths.dashboard.batch.root,
        icon: ICONS.batch,
      },
      {
        title: 'POS Billing',
        path: paths.dashboard.pos.root,
        icon: ICONS.pos,
      },
    ],
  },

  /**
   * Contacts & Stakeholders
   */
  {
    subheader: 'Parties & Stakeholders',
    items: [
      {
        title: 'Suppliers / Vendors',
        path: paths.dashboard.supplier.root,
        icon: ICONS.supplier,
      },
      {
        title: 'Customers / Patients',
        path: paths.dashboard.customer.root,
        icon: ICONS.customer,
      },
    ],
  },

  /**
   * Management & Administration
   */
  {
    subheader: 'Administration',
    items: [
      {
        title: 'Staff & Roles',
        path: paths.dashboard.user.root,
        icon: ICONS.user,
      },
      {
        title: 'Pharmacy Settings',
        path: paths.dashboard.settings.root,
        icon: ICONS.settings,
      },
    ],
  },
];
