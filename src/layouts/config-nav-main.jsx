import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  { title: 'Home', path: '/', icon: <Iconify width={22} icon="solar:home-2-bold-duotone" /> },
  {
    title: 'Solutions',
    path: paths.tools.root,
    icon: <Iconify width={22} icon="solar:hammer-bold-duotone" />,
    children: [
      {
        subheader: 'Free Tools',
        items: [
          { title: 'LR Generator', path: paths.tools.lrGenerator },
          { title: 'Freight Calculator', path: paths.comingSoon },
          { title: 'E-Way Bill Generator', path: paths.comingSoon },
          { title: 'Invoice Generator', path: paths.comingSoon },
        ],
      },
      {
        subheader: 'Blog',
        items: [{ title: 'All Posts', path: paths.comingSoon }],
      },
    ],
  },
  {
    title: 'Contact Us',
    path: paths.contact,
    icon: <Iconify width={22} icon="solar:atom-bold-duotone" />,
  },
];
