import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ACTIONS, PERMISSIONS } from '../config';
import { AccountChangePassword } from '../../account/account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'permissions',
    label: 'Permissions',
    icon: <Iconify icon="solar:shield-check-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
];

const TABLE_HEAD = [
  { id: 'module', label: 'Module' },
  { id: 'create', label: 'Create', align: 'center' },
  { id: 'view', label: 'View', align: 'center' },
  { id: 'update', label: 'Update', align: 'center' },
  { id: 'delete', label: 'Delete', align: 'center' },
];

// ----------------------------------------------------------------------

export function UserDetailView({ user }) {
  const tabs = useTabs('general');

  const renderGeneral = (
    <Card sx={{ p: 3 }}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ width: 200 }}>
              <Typography variant="subtitle2">Full Name</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{user?.name}</Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Email</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{user?.email}</Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Mobile</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{user?.mobile}</Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Address</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{user?.address}</Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Designation</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{user?.designation}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );

  const renderPermissions = (
    <Card sx={{ p: 3 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 800 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />

          <TableBody>
            {PERMISSIONS.map((permission) => (
              <TableRow key={permission.name}>
                <TableCell>
                  <ListItemText
                    primary={permission.subheader}
                    secondary={permission.caption}
                    primaryTypographyProps={{ typography: 'subtitle2', mb: 0.5 }}
                    secondaryTypographyProps={{
                      component: 'span',
                      typography: 'caption',
                      color: 'text.secondary',
                    }}
                  />
                </TableCell>
                {ACTIONS.map((action) => (
                  <TableCell key={action} align="center">
                    {user?.permissions?.[permission.name]?.[action] ? (
                      <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
                    ) : (
                      <Iconify icon="eva:close-circle-fill" sx={{ color: 'error.main' }} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'Profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {tabs.value === 'general' && renderGeneral}

      {tabs.value === 'permissions' && renderPermissions}

      {tabs.value === 'security' && <AccountChangePassword />}
    </DashboardContent>
  );
}
